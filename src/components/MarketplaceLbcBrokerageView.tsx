import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  Store,
  Bike,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  PieChart,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Send,
  Zap,
  Layers,
  Award,
  Package,
  FileText,
  Lock,
  Wallet
} from 'lucide-react';
import {
  RegionId,
  LanguageCode,
  MarketplaceSide,
  BrokerageAsset,
  BrokeragePortfolioHolding,
  LbcTransaction,
  MarketplaceOrder3Sided,
  BrokerageConversionTrade,
  AssetClass
} from '../types/architecture';
import { REGIONS } from '../data/mockData';
import { translations } from '../data/translations';
import {
  BROKERAGE_ASSETS,
  INITIAL_3SIDED_ORDERS,
  INITIAL_LBC_TRANSACTIONS,
  INITIAL_LBC_WALLETS,
  INITIAL_PORTFOLIO_HOLDINGS,
  LBC_REWARD_RULES,
  LBC_TREASURY_APY,
  LBC_USD_PEG_RATE
} from '../data/lbcBrokerageData';

interface MarketplaceLbcBrokerageViewProps {
  region: RegionId;
  language: LanguageCode;
  onPlaySpeech: (text: string) => void;
}

export const MarketplaceLbcBrokerageView: React.FC<MarketplaceLbcBrokerageViewProps> = ({
  region,
  language,
  onPlaySpeech,
}) => {
  const t = translations[language] || translations.en;
  const currentRegion = REGIONS[region];

  // Active user persona for LBC wallet and brokerage
  const [activePersona, setActivePersona] = useState<string>('driver_moise');

  // Core state
  const [wallets, setWallets] = useState(INITIAL_LBC_WALLETS);
  const [portfolios, setPortfolios] = useState(INITIAL_PORTFOLIO_HOLDINGS);
  const [orders, setOrders] = useState<MarketplaceOrder3Sided[]>(INITIAL_3SIDED_ORDERS);
  const [transactions, setTransactions] = useState<LbcTransaction[]>(INITIAL_LBC_TRANSACTIONS);

  // Brokerage conversion state
  const [selectedAssetClass, setSelectedAssetClass] = useState<AssetClass>('fractional_stock');
  const [selectedAsset, setSelectedAsset] = useState<BrokerageAsset>(BROKERAGE_ASSETS[0]);
  const [convertAmountLbc, setConvertAmountLbc] = useState<number>(100);
  const [fiatDestinationInput, setFiatDestinationInput] = useState<string>('');
  const [recentTrade, setRecentTrade] = useState<BrokerageConversionTrade | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  // Sub-tab view in this module
  const [mainViewTab, setMainViewTab] = useState<'3sided_orders' | 'rewards_engine' | 'brokerage_converter' | 'portfolio' | 'api_docs'>('3sided_orders');

  // Filter for transactions ledger
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'driver' | 'customer' | 'merchant'>('all');

  // Active wallet for the chosen persona
  const currentWallet = wallets[activePersona] || wallets.driver_moise;
  const currentPortfolio = portfolios[activePersona] || [];

  // Local fiat equivalent of 1 LBC in selected region
  const regionalRateNotice =
    region === 'haiti'
      ? `1 LBC = 13.15 HTG (${(currentWallet.balanceLbc * 13.15).toLocaleString()} HTG)`
      : region === 'french_guiana'
      ? `1 LBC = 0.0925 EUR (${(currentWallet.balanceLbc * 0.0925).toFixed(2)} €)`
      : region === 'guyana'
      ? `1 LBC = 20.85 GYD (${(currentWallet.balanceLbc * 20.85).toLocaleString()} GYD)`
      : `1 LBC = 3.56 SRD (${(currentWallet.balanceLbc * 3.56).toLocaleString()} SRD)`;

  // Progress an order through the 3-sided lifecycle and trigger tripartite LBC rewards!
  const handleFulfillOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    let nextStatus: MarketplaceOrder3Sided['status'] = 'delivered';
    if (order.status === 'created') nextStatus = 'merchant_prep';
    else if (order.status === 'merchant_prep') nextStatus = 'driver_assigned';
    else if (order.status === 'driver_assigned') nextStatus = 'in_transit';
    else if (order.status === 'in_transit') nextStatus = 'delivered';
    else return;

    // Call server endpoint or fallback to local state
    try {
      const response = await fetch('/api/marketplace/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, nextStatus })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local orders
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus, completedAt: nextStatus === 'delivered' ? 'Just now' : o.completedAt } : o))
        );
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      // Local fallback
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus, completedAt: nextStatus === 'delivered' ? 'Just now' : o.completedAt } : o))
      );
    }

    // If order reached 'delivered', automatically distribute LBC rewards across all 3 sides!
    if (nextStatus === 'delivered') {
      const timeStr = 'Just now';
      const custLbc = order.lbcRewards.customerLbc;
      const merchLbc = order.lbcRewards.merchantLbc;
      const drvLbc = order.lbcRewards.driverLbc;

      setWallets((prev) => {
        const updated = { ...prev };
        if (order.customerId && updated[order.customerId]) {
          updated[order.customerId] = {
            ...updated[order.customerId],
            balanceLbc: updated[order.customerId].balanceLbc + custLbc,
            totalEarnedLbc: updated[order.customerId].totalEarnedLbc + custLbc,
            usdValue: (updated[order.customerId].balanceLbc + custLbc) * LBC_USD_PEG_RATE
          };
        }
        if (order.merchantId && updated[order.merchantId]) {
          updated[order.merchantId] = {
            ...updated[order.merchantId],
            balanceLbc: updated[order.merchantId].balanceLbc + merchLbc,
            totalEarnedLbc: updated[order.merchantId].totalEarnedLbc + merchLbc,
            usdValue: (updated[order.merchantId].balanceLbc + merchLbc) * LBC_USD_PEG_RATE
          };
        }
        if (order.driverId && updated[order.driverId]) {
          updated[order.driverId] = {
            ...updated[order.driverId],
            balanceLbc: updated[order.driverId].balanceLbc + drvLbc,
            totalEarnedLbc: updated[order.driverId].totalEarnedLbc + drvLbc,
            usdValue: (updated[order.driverId].balanceLbc + drvLbc) * LBC_USD_PEG_RATE
          };
        }
        return updated;
      });

      const newTxs: LbcTransaction[] = [];
      if (order.customerId) {
        newTxs.push({
          id: `tx-lbc-${Date.now()}-c`,
          timestamp: timeStr,
          userId: order.customerId,
          userType: 'customer',
          userName: order.customerName,
          activityType: order.type === 'ride' ? 'ride_completed' : 'merchant_fulfillment',
          activityReferenceId: order.id,
          amountLbc: custLbc,
          usdEquivalent: custLbc * LBC_USD_PEG_RATE,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          status: 'confirmed',
          note: `Customer reward for ${order.title} (+${custLbc} LBC)`
        });
      }
      if (order.merchantId && merchLbc > 0) {
        newTxs.push({
          id: `tx-lbc-${Date.now()}-m`,
          timestamp: timeStr,
          userId: order.merchantId,
          userType: 'merchant',
          userName: order.merchantName || 'Merchant',
          activityType: 'merchant_fulfillment',
          activityReferenceId: order.id,
          amountLbc: merchLbc,
          usdEquivalent: merchLbc * LBC_USD_PEG_RATE,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          status: 'confirmed',
          note: `Merchant prep & fulfillment reward (+${merchLbc} LBC)`
        });
      }
      if (order.driverId) {
        newTxs.push({
          id: `tx-lbc-${Date.now()}-d`,
          timestamp: timeStr,
          userId: order.driverId,
          userType: 'driver',
          userName: order.driverName || 'Driver',
          activityType: order.type === 'ride' ? 'ride_completed' : 'merchant_fulfillment',
          activityReferenceId: order.id,
          amountLbc: drvLbc,
          usdEquivalent: drvLbc * LBC_USD_PEG_RATE,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          status: 'confirmed',
          note: `Driver delivery completion reward (+${drvLbc} LBC)`
        });
      }

      setTransactions((prev) => [...newTxs, ...prev]);

      onPlaySpeech(
        language === 'ht'
          ? `Lòd la fini! Nou pataje ${drvLbc} LBC bay chofè a, ${merchLbc} LBC bay machann nan, epi ${custLbc} LBC bay kliyan an!`
          : `Commande complétée ! Récompenses Liberté Cash créditées : ${drvLbc} LBC au chauffeur, ${merchLbc} LBC au marchand et ${custLbc} LBC au client.`
      );
    }
  };

  // Create a new demo 3-sided order
  const handleCreateNewOrder = (orderType: 'merchant_goods' | 'ride' | 'courier_delivery') => {
    const randomId = `ord-3s-${Date.now().toString().slice(-4)}`;
    let title = 'Chez Fifi - Bannann Peze & Griot Platter';
    let subtotal = 1350;
    let deliveryFee = 250;
    let customerReward = 20;
    let merchantReward = 25;
    let driverReward = 35;

    if (orderType === 'ride') {
      title = 'Motorcycle Ride: Petion-Ville to Champ de Mars';
      subtotal = 400;
      deliveryFee = 0;
      customerReward = 15;
      merchantReward = 0;
      driverReward = 35;
    } else if (orderType === 'courier_delivery') {
      title = 'Express Document Courier to Embassy Office';
      subtotal = 350;
      deliveryFee = 150;
      customerReward = 12;
      merchantReward = 0;
      driverReward = 30;
    }

    const newOrder: MarketplaceOrder3Sided = {
      id: randomId,
      type: orderType,
      title,
      customerId: 'customer_fabienne',
      customerName: 'Fabienne Voltaire',
      customerPhone: '+509 3712-4491',
      merchantId: orderType === 'merchant_goods' ? 'merchant_chef_fifi' : undefined,
      merchantName: orderType === 'merchant_goods' ? 'Chef Fifi - Chez Fifi Resto' : undefined,
      driverId: 'driver_moise',
      driverName: 'Jean-Baptiste Moïse',
      driverVehicle: 'Haojue 125cc (TP-9821)',
      items: orderType === 'merchant_goods' ? [{ name: 'Griot Platter', quantity: 2, price: 675 }] : undefined,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      currency: currentRegion.currency,
      status: orderType === 'merchant_goods' ? 'merchant_prep' : 'driver_assigned',
      pickupLandmark: orderType === 'merchant_goods' ? 'Rue Capois #45, Chez Fifi' : 'Delmas 33 Station',
      dropoffLandmark: 'Av. Panamericaine, Pétion-Ville',
      distanceKm: 4.2,
      lbcRewards: {
        customerLbc: customerReward,
        merchantLbc: merchantReward,
        driverLbc: driverReward
      },
      createdAt: 'Just now'
    };

    setOrders((prev) => [newOrder, ...prev]);

    onPlaySpeech(
      language === 'ht'
        ? `Nouvo kòmand kreye avèk siksè nan mache tri-patit Wap la.`
        : `Nouvelle commande créée sur la place de marché tripartite Wap.`
    );
  };

  // Execute embedded brokerage conversion
  const handleExecuteBrokerageConversion = async () => {
    if (convertAmountLbc <= 0 || convertAmountLbc > currentWallet.balanceLbc) {
      alert(`Invalid conversion amount. Available balance: ${currentWallet.balanceLbc} LBC`);
      return;
    }

    if (convertAmountLbc < selectedAsset.minLbcToConvert) {
      alert(`Minimum conversion for ${selectedAsset.ticker} is ${selectedAsset.minLbcToConvert} LBC.`);
      return;
    }

    setIsConverting(true);
    setTradeSuccessMsg(null);

    const usdValue = convertAmountLbc * LBC_USD_PEG_RATE;
    const unitsAcquired = parseFloat((usdValue / selectedAsset.priceUsd).toFixed(4));
    const tradeId = `TRD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Try server API first
    try {
      const response = await fetch('/api/brokerage/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activePersona,
          assetId: selectedAsset.id,
          lbcAmount: convertAmountLbc,
          fiatDestinationAccount: fiatDestinationInput || selectedAsset.fiatRail
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecentTrade(data.trade);
      } else {
        throw new Error('Fallback to client logic');
      }
    } catch {
      // Local state fallback
      const mockTrade: BrokerageConversionTrade = {
        tradeId,
        timestamp: new Date().toISOString(),
        userId: activePersona,
        userType: currentWallet.userType,
        userName: currentWallet.userName,
        assetId: selectedAsset.id,
        ticker: selectedAsset.ticker,
        assetName: selectedAsset.name,
        assetClass: selectedAsset.assetClass,
        lbcSpent: convertAmountLbc,
        usdExecuted: usdValue,
        unitsAcquired,
        executionPriceUsd: selectedAsset.priceUsd,
        clearingBroker: 'Wap Financial Custodial Brokerage (Omnibus)',
        fiatDestination: fiatDestinationInput || selectedAsset.fiatRail || 'Direct Account Payout',
        status: 'settled',
        settlementConfirmationHash: `0xbrk_${Math.random().toString(16).substring(2, 12)}`
      };
      setRecentTrade(mockTrade);
    }

    // Deduct from wallet
    setWallets((prev) => {
      const w = prev[activePersona];
      const newBal = w.balanceLbc - convertAmountLbc;
      return {
        ...prev,
        [activePersona]: {
          ...w,
          balanceLbc: newBal,
          usdValue: newBal * LBC_USD_PEG_RATE
        }
      };
    });

    // Update investment portfolio if it's an asset, ETF, or regional asset
    if (selectedAsset.assetClass !== 'fiat_cashout') {
      setPortfolios((prev) => {
        const list = [...(prev[activePersona] || [])];
        const existing = list.find((h) => h.assetId === selectedAsset.id);
        if (existing) {
          const newUnits = existing.sharesOrUnits + unitsAcquired;
          const totalCost = existing.avgCostUsd * existing.sharesOrUnits + usdValue;
          existing.sharesOrUnits = parseFloat(newUnits.toFixed(4));
          existing.avgCostUsd = parseFloat((totalCost / newUnits).toFixed(2));
          existing.currentPriceUsd = selectedAsset.priceUsd;
          existing.totalValueUsd = parseFloat((existing.sharesOrUnits * selectedAsset.priceUsd).toFixed(2));
        } else {
          list.push({
            id: `hold_${Date.now()}`,
            assetId: selectedAsset.id,
            ticker: selectedAsset.ticker,
            name: selectedAsset.name,
            assetClass: selectedAsset.assetClass,
            sharesOrUnits: unitsAcquired,
            avgCostUsd: selectedAsset.priceUsd,
            currentPriceUsd: selectedAsset.priceUsd,
            totalValueUsd: usdValue,
            totalReturnUsd: 0,
            totalReturnPercent: 0,
            acquiredAt: new Date().toISOString().split('T')[0]
          });
        }
        return { ...prev, [activePersona]: list };
      });
    }

    // Add debit transaction to ledger
    const tx: LbcTransaction = {
      id: `tx-lbc-conv-${Date.now()}`,
      timestamp: 'Just now',
      userId: activePersona,
      userType: currentWallet.userType,
      userName: currentWallet.userName,
      activityType: 'service_completed',
      activityReferenceId: tradeId,
      amountLbc: -convertAmountLbc,
      usdEquivalent: -usdValue,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      status: 'confirmed',
      note: `Converted ${convertAmountLbc} LBC into ${unitsAcquired} ${selectedAsset.ticker} ($${usdValue.toFixed(2)} USD)`
    };
    setTransactions((prev) => [tx, ...prev]);

    setIsConverting(false);
    setTradeSuccessMsg(
      `Conversion executed! Acquired ${unitsAcquired} units of ${selectedAsset.ticker} for ${convertAmountLbc} LBC ($${usdValue.toFixed(2)} USD).`
    );

    onPlaySpeech(
      language === 'ht'
        ? `Tranzaksyon boutik la fèt! Ou konvèti ${convertAmountLbc} LBC an ${selectedAsset.ticker} avèk siksè.`
        : `Conversion exécutée avec succès ! ${convertAmountLbc} LBC convertis en ${selectedAsset.ticker}.`
    );
  };

  // Quick preset button for LBC amount
  const handlePresetPercentage = (pct: number) => {
    const val = Math.floor((currentWallet.balanceLbc * pct) / 100);
    setConvertAmountLbc(val);
  };

  // Filtered transactions for the ledger
  const filteredTransactions = transactions.filter((tx) => {
    if (ledgerFilter === 'all') return true;
    return tx.userType === ledgerFilter;
  });

  // Assets in selected class
  const filteredAssets = BROKERAGE_ASSETS.filter((a) => a.assetClass === selectedAssetClass);

  // Total portfolio value
  const portfolioTotalUsd = currentPortfolio.reduce((sum, h) => sum + h.totalValueUsd, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: 3-Sided Marketplace & Liberté Cash (LBC) Ecosystem Overview */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                Liberté Cash (LBC) Ecosystem
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                3-Sided Marketplace Live
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700 hidden sm:inline-flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" />
                Embedded Brokerage API Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              3-Sided Marketplace & Liberté Cash (LBC) Brokerage
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl">
              Coordinating Drivers, Customers, and Merchants across rides, deliveries, food orders, and local services.
              All three marketplace participants earn <strong>Liberté Cash (LBC) tokens</strong>, convertible into
              fractional US stocks, ETFs, regional diaspora assets, and local cash payouts.
            </p>
          </div>

          {/* Peg & APY Callout */}
          <div className="flex sm:flex-col items-end justify-between sm:justify-center bg-neutral-950/80 border border-neutral-800 px-4 py-3 rounded-xl shrink-0">
            <div className="text-[11px] text-neutral-400">Fixed Peg Reference</div>
            <div className="text-lg font-bold text-amber-400 font-mono">1 LBC = $0.10 USD</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3" />
              <span>{LBC_TREASURY_APY}% APY Auto-Compounding</span>
            </div>
          </div>
        </div>

        {/* 3-Sided Participants & Treasury Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Customers</span>
            </div>
            <div className="text-base font-bold text-white mt-1">1,420 Active</div>
            <div className="text-[10px] text-neutral-500">Earn 15-20 LBC per ride/order</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-amber-400" />
              <span>Motorcycle Drivers</span>
            </div>
            <div className="text-base font-bold text-white mt-1">380 Online</div>
            <div className="text-[10px] text-neutral-500">Earn 35 LBC per completed trip</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Merchants</span>
            </div>
            <div className="text-base font-bold text-white mt-1">94 Merchants</div>
            <div className="text-[10px] text-neutral-500">Earn 25-40 LBC per order prep</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>LBC in Circulation</span>
            </div>
            <div className="text-base font-bold text-amber-400 mt-1">
              {(wallets.driver_moise.balanceLbc + wallets.customer_fabienne.balanceLbc + wallets.merchant_chef_fifi.balanceLbc).toLocaleString()} LBC
            </div>
            <div className="text-[10px] text-neutral-500">
              ${((wallets.driver_moise.balanceLbc + wallets.customer_fabienne.balanceLbc + wallets.merchant_chef_fifi.balanceLbc) * LBC_USD_PEG_RATE).toFixed(2)} USD Collateral
            </div>
          </div>
        </div>
      </div>

      {/* User Persona Switcher (Allows testing Customer, Driver, or Merchant perspectives) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1">
            Active User Persona:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActivePersona('driver_moise')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activePersona === 'driver_moise'
                  ? 'bg-amber-400 text-neutral-950 shadow font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Jean-Baptiste Moïse (Driver)</span>
            </button>

            <button
              onClick={() => setActivePersona('customer_fabienne')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activePersona === 'customer_fabienne'
                  ? 'bg-amber-400 text-neutral-950 shadow font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Fabienne Voltaire (Customer)</span>
            </button>

            <button
              onClick={() => setActivePersona('merchant_chef_fifi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activePersona === 'merchant_chef_fifi'
                  ? 'bg-amber-400 text-neutral-950 shadow font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Chef Fifi - Chez Fifi (Merchant)</span>
            </button>
          </div>
        </div>

        {/* Selected Persona Wallet Summary */}
        <div className="flex items-center gap-3 bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-800 text-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400">{currentWallet.userName} Balance:</div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="text-amber-400 text-sm">{currentWallet.balanceLbc.toLocaleString()} LBC</span>
              <span className="text-neutral-400 font-normal">(${currentWallet.usdValue.toFixed(2)} USD)</span>
            </div>
          </div>
          <div className="pl-3 border-l border-neutral-800 hidden sm:block">
            <div className="text-[10px] text-neutral-500">Staking Rewards:</div>
            <div className="text-[11px] text-emerald-400 font-semibold">+${currentWallet.stakingRewardsEarned.toFixed(2)} USD</div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-neutral-800 pb-2 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setMainViewTab('3sided_orders')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            mainViewTab === '3sided_orders'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>3-Sided Orders & Tripartite Flow</span>
          <span className="px-1.5 py-0.2 rounded-full bg-neutral-950/40 text-[10px]">
            {orders.filter((o) => o.status !== 'delivered').length} active
          </span>
        </button>

        <button
          onClick={() => setMainViewTab('brokerage_converter')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            mainViewTab === 'brokerage_converter'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Embedded Brokerage API (Stocks, ETFs & Fiat)</span>
        </button>

        <button
          onClick={() => setMainViewTab('portfolio')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            mainViewTab === 'portfolio'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Investment Portfolio</span>
          <span className="text-[10px] text-emerald-400 font-mono">(${portfolioTotalUsd.toFixed(2)})</span>
        </button>

        <button
          onClick={() => setMainViewTab('rewards_engine')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            mainViewTab === 'rewards_engine'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>LBC Reward Formulas & Live Ledger</span>
        </button>

        <button
          onClick={() => setMainViewTab('api_docs')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            mainViewTab === 'api_docs'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Backend API Architecture</span>
        </button>
      </div>

      {/* VIEW 1: 3-SIDED MARKETPLACE ORDERS & SIMULATION */}
      {mainViewTab === '3sided_orders' && (
        <div className="space-y-6">
          {/* Action Header & Quick Order Creators */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tripartite Marketplace Order Pipeline</span>
                <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-md font-semibold">
                  Customer ↔ Merchant ↔ Driver
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Experience the complete 3-sided lifecycle. When an order completes, all 3 participants simultaneously earn LBC rewards!
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCreateNewOrder('merchant_goods')}
                className="px-3 py-2 bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition flex items-center gap-1.5 shadow"
              >
                <Store className="w-3.5 h-3.5" />
                <span>+ Order Merchant Food</span>
              </button>
              <button
                onClick={() => handleCreateNewOrder('ride')}
                className="px-3 py-2 bg-neutral-800 text-white font-medium rounded-xl text-xs hover:bg-neutral-700 transition flex items-center gap-1.5 border border-neutral-700"
              >
                <Bike className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Request Passenger Ride</span>
              </button>
              <button
                onClick={() => handleCreateNewOrder('courier_delivery')}
                className="px-3 py-2 bg-neutral-800 text-white font-medium rounded-xl text-xs hover:bg-neutral-700 transition flex items-center gap-1.5 border border-neutral-700"
              >
                <Package className="w-3.5 h-3.5 text-sky-400" />
                <span>+ Book Express Courier</span>
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => {
              const isDelivered = order.status === 'delivered';
              return (
                <div
                  key={order.id}
                  className={`bg-neutral-900 border rounded-2xl p-4 sm:p-5 shadow-lg transition-all ${
                    isDelivered ? 'border-neutral-800/70 opacity-80' : 'border-amber-400/30 ring-1 ring-amber-400/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          order.type === 'merchant_goods'
                            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                            : order.type === 'ride'
                            ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                            : 'bg-sky-400/10 text-sky-400 border border-sky-400/30'
                        }`}
                      >
                        {order.type === 'merchant_goods' ? (
                          <Store className="w-5 h-5" />
                        ) : order.type === 'ride' ? (
                          <Bike className="w-5 h-5" />
                        ) : (
                          <Package className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{order.title}</h3>
                          <span className="font-mono text-[11px] text-neutral-400">({order.id})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : order.status === 'in_transit'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse'
                                : order.status === 'driver_assigned'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
                          <span>{order.createdAt}</span>
                          <span>•</span>
                          <span>Distance: {order.distanceKm} km</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">
                            Total: {order.total} {order.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fulfill Action Button */}
                    <div className="flex items-center gap-2">
                      {!isDelivered ? (
                        <button
                          onClick={() => handleFulfillOrder(order.id)}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold rounded-xl text-xs hover:from-amber-300 hover:to-amber-400 transition flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {order.status === 'merchant_prep'
                              ? 'Merchant: Food Ready → Dispatch Driver'
                              : order.status === 'driver_assigned'
                              ? 'Driver: Picked Up → In Transit'
                              : 'Customer: Confirm Delivery & Award LBC!'}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Delivered & LBC Tokens Distributed!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3-Sided Participants & Live LBC Rewards Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                    {/* Customer Side */}
                    <div className="bg-neutral-950 border border-neutral-800/80 p-3 rounded-xl flex items-start justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-sky-400" />
                          Customer (Rider/Buyer)
                        </div>
                        <div className="font-semibold text-white mt-1">{order.customerName}</div>
                        <div className="text-[11px] text-neutral-400">{order.customerPhone}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[11px]">
                          +{order.lbcRewards.customerLbc} LBC
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          ${(order.lbcRewards.customerLbc * LBC_USD_PEG_RATE).toFixed(2)} USD
                        </div>
                      </div>
                    </div>

                    {/* Merchant Side */}
                    <div className="bg-neutral-950 border border-neutral-800/80 p-3 rounded-xl flex items-start justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1">
                          <Store className="w-3 h-3 text-emerald-400" />
                          Merchant (Kitchen/Shop)
                        </div>
                        <div className="font-semibold text-white mt-1">
                          {order.merchantName || 'Direct Dispatch (N/A)'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-[140px]">
                          {order.pickupLandmark}
                        </div>
                      </div>
                      <div className="text-right">
                        {order.lbcRewards.merchantLbc > 0 ? (
                          <>
                            <span className="inline-block px-2 py-0.5 rounded font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-[11px]">
                              +{order.lbcRewards.merchantLbc} LBC
                            </span>
                            <div className="text-[10px] text-neutral-500 mt-0.5">
                              ${(order.lbcRewards.merchantLbc * LBC_USD_PEG_RATE).toFixed(2)} USD
                            </div>
                          </>
                        ) : (
                          <span className="text-[10px] text-neutral-600 italic">No merchant</span>
                        )}
                      </div>
                    </div>

                    {/* Driver Side */}
                    <div className="bg-neutral-950 border border-neutral-800/80 p-3 rounded-xl flex items-start justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1">
                          <Bike className="w-3 h-3 text-amber-400" />
                          Driver (Motorcycle)
                        </div>
                        <div className="font-semibold text-white mt-1">{order.driverName}</div>
                        <div className="text-[11px] text-neutral-400">{order.driverVehicle}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[11px]">
                          +{order.lbcRewards.driverLbc} LBC
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          ${(order.lbcRewards.driverLbc * LBC_USD_PEG_RATE).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: EMBEDDED BROKERAGE API & ASSET CONVERTER */}
      {mainViewTab === 'brokerage_converter' && (
        <div className="space-y-6">
          {/* Institutional Clearing Security Callout */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 border border-amber-400/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Embedded Institutional Brokerage API Integration</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    Omnibus Custodial Clearing
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Allows Drivers, Customers, and Merchants to convert earned Liberté Cash (LBC) into fractional stocks,
                  diversified ETFs, Caribbean/African diaspora sovereign debt, or local instant mobile fiat cashouts.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-neutral-500">Connected Brokerage Account:</div>
              <div className="text-xs font-mono text-amber-400 font-bold">{currentWallet.linkedBrokerageAccount}</div>
              <div className="text-[10px] text-neutral-400">SIPC Insured Custody Protection</div>
            </div>
          </div>

          {/* Asset Class Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                setSelectedAssetClass('fractional_stock');
                setSelectedAsset(BROKERAGE_ASSETS.find((a) => a.assetClass === 'fractional_stock') || BROKERAGE_ASSETS[0]);
              }}
              className={`p-3 rounded-xl text-left border transition ${
                selectedAssetClass === 'fractional_stock'
                  ? 'bg-amber-400/10 border-amber-400/40 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>💻</span>
                <span>Fractional Stocks</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">NVDA, AAPL, TSLA, GOOGL, MSFT</div>
            </button>

            <button
              onClick={() => {
                setSelectedAssetClass('etf');
                setSelectedAsset(BROKERAGE_ASSETS.find((a) => a.assetClass === 'etf') || BROKERAGE_ASSETS[6]);
              }}
              className={`p-3 rounded-xl text-left border transition ${
                selectedAssetClass === 'etf'
                  ? 'bg-amber-400/10 border-amber-400/40 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>📈</span>
                <span>Index & Thematic ETFs</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">S&P 500, Nasdaq-100, Total World</div>
            </button>

            <button
              onClick={() => {
                setSelectedAssetClass('regional_asset');
                setSelectedAsset(BROKERAGE_ASSETS.find((a) => a.assetClass === 'regional_asset') || BROKERAGE_ASSETS[10]);
              }}
              className={`p-3 rounded-xl text-left border transition ${
                selectedAssetClass === 'regional_asset'
                  ? 'bg-amber-400/10 border-amber-400/40 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>🌴</span>
                <span>Regional Diaspora Assets</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">BRVM, CARICOM, Green Bond (7.5%)</div>
            </button>

            <button
              onClick={() => {
                setSelectedAssetClass('fiat_cashout');
                setSelectedAsset(BROKERAGE_ASSETS.find((a) => a.assetClass === 'fiat_cashout') || BROKERAGE_ASSETS[15]);
              }}
              className={`p-3 rounded-xl text-left border transition ${
                selectedAssetClass === 'fiat_cashout'
                  ? 'bg-amber-400/10 border-amber-400/40 text-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>📱</span>
                <span>Local Fiat Cash Payouts</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">MonCash, Natcash, SEPA, Uni5Pay</div>
            </button>
          </div>

          {/* Asset Selection Grid & Trade Execution Slip */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Available Assets in Category */}
            <div className="lg:col-span-7 space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1">
                Select Asset to Convert ({filteredAssets.length} Available):
              </h4>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset.id === asset.id;
                  const isPositive = asset.change24h >= 0;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-800 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl shrink-0 mt-0.5">{asset.iconSymbol || '💼'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{asset.ticker}</span>
                              <span className="text-xs text-neutral-300 font-medium">{asset.name}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">{asset.description}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] bg-neutral-950 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                                {asset.exchange}
                              </span>
                              <span className="text-[10px] bg-neutral-950 text-amber-400 px-2 py-0.5 rounded border border-neutral-800">
                                {asset.categoryTag}
                              </span>
                              {asset.yieldAnnualPercent && (
                                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-semibold">
                                  Yield: {asset.yieldAnnualPercent}% APY
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-white font-mono">
                            ${asset.priceUsd.toFixed(2)} {asset.currency}
                          </div>
                          {asset.assetClass !== 'fiat_cashout' ? (
                            <div
                              className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                                isPositive ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              )}
                              <span>{asset.change24h > 0 ? `+${asset.change24h}%` : `${asset.change24h}%`}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-400 font-medium">{asset.fiatRail}</div>
                          )}
                          <div className="text-[10px] text-neutral-500 mt-1">
                            Min: {asset.minLbcToConvert} LBC
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Interactive Trade & Conversion Slip */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Live Brokerage Conversion Terminal</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
                    Zero Trading Fees
                  </span>
                </div>

                {/* Target Asset Preview */}
                <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{selectedAsset.iconSymbol || '💼'}</span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{selectedAsset.ticker}</span>
                        <span className="text-xs text-neutral-400">({selectedAsset.name})</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Price: ${selectedAsset.priceUsd.toFixed(2)} USD • {selectedAsset.exchange}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 uppercase">Target Asset</span>
                  </div>
                </div>

                {/* LBC Amount Input & Presets */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-neutral-300 font-medium">Amount to Convert (LBC):</label>
                    <span className="text-neutral-400">
                      Available: <strong className="text-amber-400">{currentWallet.balanceLbc.toLocaleString()} LBC</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={selectedAsset.minLbcToConvert}
                      max={currentWallet.balanceLbc}
                      value={convertAmountLbc}
                      onChange={(e) => setConvertAmountLbc(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-base font-bold font-mono focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-amber-400 font-bold">LBC</span>
                  </div>

                  {/* Preset Percentages */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={() => handlePresetPercentage(25)}
                      className="py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg font-medium transition"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => handlePresetPercentage(50)}
                      className="py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg font-medium transition"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => handlePresetPercentage(75)}
                      className="py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg font-medium transition"
                    >
                      75%
                    </button>
                    <button
                      onClick={() => handlePresetPercentage(100)}
                      className="py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs rounded-lg font-bold transition"
                    >
                      Max 100%
                    </button>
                  </div>
                </div>

                {/* If Fiat Cashout, show Account / Phone field */}
                {selectedAsset.assetClass === 'fiat_cashout' && (
                  <div className="space-y-1.5 mb-4">
                    <label className="text-xs text-neutral-300 font-medium">Destination Wallet / Phone Number:</label>
                    <input
                      type="text"
                      placeholder="e.g. +509 3712-4491 or FR76 3000..."
                      value={fiatDestinationInput}
                      onChange={(e) => setFiatDestinationInput(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    <div className="text-[10px] text-neutral-500">
                      Supports MonCash, Natcash, SEPA Instant Euro IBAN, MMG+, Uni5Pay
                    </div>
                  </div>
                )}

                {/* Trade Execution Calculation Slip */}
                <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3.5 space-y-2 text-xs mb-4">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>LBC Conversion Value (USD):</span>
                    <span className="font-mono text-white font-semibold">
                      ${(convertAmountLbc * LBC_USD_PEG_RATE).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Brokerage Commission:</span>
                    <span className="font-mono text-emerald-400 font-semibold">$0.00 (Subsidized by Wap)</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Clearing Custody:</span>
                    <span className="font-mono text-neutral-300">Omnibus Brokerage (FINRA/SIPC)</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between font-bold text-sm">
                    <span className="text-amber-400">
                      {selectedAsset.assetClass === 'fiat_cashout' ? 'Net Cash Payout:' : 'Fractional Units Acquired:'}
                    </span>
                    <span className="text-white font-mono">
                      {selectedAsset.assetClass === 'fiat_cashout'
                        ? `${((convertAmountLbc * LBC_USD_PEG_RATE) * (selectedAsset.id.includes('moncash') ? 131.5 : selectedAsset.id.includes('natcash') ? 132.0 : selectedAsset.id.includes('sepa') ? 0.925 : selectedAsset.id.includes('mmg') ? 208.5 : selectedAsset.id.includes('uni5pay') ? 35.6 : 1)).toFixed(2)} ${selectedAsset.currency}`
                        : `${((convertAmountLbc * LBC_USD_PEG_RATE) / selectedAsset.priceUsd).toFixed(4)} ${selectedAsset.ticker}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Execution Action */}
              <div>
                {tradeSuccessMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 mb-3 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tradeSuccessMsg}</span>
                  </div>
                )}

                <button
                  disabled={isConverting || convertAmountLbc <= 0 || convertAmountLbc > currentWallet.balanceLbc}
                  onClick={handleExecuteBrokerageConversion}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Clearing Brokerage Trade...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>
                        Execute Conversion (Convert {convertAmountLbc} LBC → {selectedAsset.ticker})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: USER INVESTMENT PORTFOLIO */}
      {mainViewTab === 'portfolio' && (
        <div className="space-y-6">
          {/* Portfolio Summary Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <div className="text-xs text-neutral-400">Total Investment Portfolio Value:</div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                  ${portfolioTotalUsd.toFixed(2)} <span className="text-xs text-neutral-400">USD</span>
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Unrealized Gain: +$8.45 USD (+4.2%) across held assets</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-neutral-400">Account Holder:</div>
                <div className="text-sm font-bold text-amber-400">{currentWallet.userName}</div>
                <div className="text-[11px] font-mono text-neutral-500">
                  Custody ID: {currentWallet.linkedBrokerageAccount}
                </div>
              </div>
            </div>

            {/* Holdings Grid */}
            <div className="mt-5 space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Current Asset Holdings ({currentPortfolio.length}):
              </h3>

              {currentPortfolio.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  No assets held yet. Use the Embedded Brokerage tab to convert LBC tokens into fractional stocks or ETFs.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentPortfolio.map((holding) => (
                    <div
                      key={holding.id}
                      className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex items-start justify-between gap-3 shadow"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">{holding.ticker}</span>
                          <span className="text-xs text-neutral-400 font-medium">({holding.name})</span>
                        </div>
                        <div className="text-xs text-neutral-300 mt-1 font-mono">
                          Quantity: <strong>{holding.sharesOrUnits}</strong> units
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Acquired on: {holding.acquiredAt} • Avg Cost: ${holding.avgCostUsd.toFixed(2)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-white font-mono">
                          ${holding.totalValueUsd.toFixed(2)} USD
                        </div>
                        <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-0.5 mt-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+${holding.totalReturnUsd.toFixed(2)} ({holding.totalReturnPercent}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: LBC REWARD FORMULAS & LIVE LEDGER */}
      {mainViewTab === 'rewards_engine' && (
        <div className="space-y-6">
          {/* Reward Formulas across Platform Activities */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Liberté Cash (LBC) Reward Schedule & Formulas</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Fixed transparent reward formulas distributed automatically across rides, parcel deliveries, merchant fulfillment, and errands.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {LBC_REWARD_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          rule.side === 'driver'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : rule.side === 'customer'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {rule.side}
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        +{rule.baseLbc} LBC {rule.bonusLbc ? `(+${rule.bonusLbc} bonus)` : ''}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{rule.label}</h4>
                    <p className="text-[11px] text-neutral-400 mt-1">{rule.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Est. USD Value:</span>
                    <span className="text-emerald-400 font-semibold font-mono">${rule.usdEquivalent.toFixed(2)} USD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Cryptographic Transactions Ledger */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Live LBC Cryptographic Reward Ledger</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Immutable real-time ledger tracking every token distributed and converted across all 3 platform sides.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                <button
                  onClick={() => setLedgerFilter('all')}
                  className={`px-2.5 py-1 rounded-lg ${
                    ledgerFilter === 'all' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLedgerFilter('driver')}
                  className={`px-2.5 py-1 rounded-lg ${
                    ledgerFilter === 'driver' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'
                  }`}
                >
                  Drivers
                </button>
                <button
                  onClick={() => setLedgerFilter('customer')}
                  className={`px-2.5 py-1 rounded-lg ${
                    ledgerFilter === 'customer' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'
                  }`}
                >
                  Customers
                </button>
                <button
                  onClick={() => setLedgerFilter('merchant')}
                  className={`px-2.5 py-1 rounded-lg ${
                    ledgerFilter === 'merchant' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400'
                  }`}
                >
                  Merchants
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Participant</th>
                    <th className="p-3">Activity & Details</th>
                    <th className="p-3">Tx Hash</th>
                    <th className="p-3 text-right">LBC Amount</th>
                    <th className="p-3 text-right">USD Equivalent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.amountLbc >= 0;
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-800/40 transition">
                        <td className="p-3 text-neutral-400 whitespace-nowrap">{tx.timestamp}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-white">{tx.userName}</span>
                          <span className="block text-[10px] text-neutral-500 uppercase">{tx.userType}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-white">{tx.note}</div>
                          <div className="text-[10px] text-neutral-500">{tx.activityType} • Ref: {tx.activityReferenceId}</div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-neutral-400">{tx.txHash}</td>
                        <td className="p-3 text-right font-bold whitespace-nowrap">
                          <span className={isCredit ? 'text-emerald-400' : 'text-amber-400'}>
                            {isCredit ? `+${tx.amountLbc}` : tx.amountLbc} LBC
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-neutral-300 whitespace-nowrap">
                          {isCredit ? `+$${tx.usdEquivalent.toFixed(2)}` : `-$${Math.abs(tx.usdEquivalent).toFixed(2)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: API DOCUMENTATION & SCHEMA INSPECTOR */}
      {mainViewTab === 'api_docs' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>3-Sided Marketplace & LBC Brokerage API Endpoints</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Production-ready REST endpoints implemented in <code>src/server/routes.ts</code> for mobile apps and web integration.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-800">
                    GET
                  </span>
                  <span>/api/marketplace/summary</span>
                </div>
                <div className="text-neutral-400 text-[11px] font-sans mt-1">
                  Returns real-time 3-sided participant counts (Drivers, Customers, Merchants), order metrics, and LBC treasury collateral.
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px] border border-amber-800">
                    POST
                  </span>
                  <span>/api/marketplace/fulfill</span>
                </div>
                <div className="text-neutral-400 text-[11px] font-sans mt-1">
                  Transitions order status (created → merchant_prep → driver_assigned → in_transit → delivered) and executes automated tripartite LBC token distribution.
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-800">
                    GET
                  </span>
                  <span>/api/brokerage/assets</span>
                </div>
                <div className="text-neutral-400 text-[11px] font-sans mt-1">
                  Fetches fractional equities (NVDA, AAPL, etc.), ETFs, regional diaspora indices, and fiat cash rails with live pricing.
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[10px] border border-amber-800">
                    POST
                  </span>
                  <span>/api/brokerage/convert</span>
                </div>
                <div className="text-neutral-400 text-[11px] font-sans mt-1">
                  Submits trade execution slip to omnibus brokerage custodian, debits LBC, credits asset to user portfolio, and logs transaction ticket.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

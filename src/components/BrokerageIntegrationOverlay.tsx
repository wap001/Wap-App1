import React, { useState } from 'react';
import {
  X,
  Coins,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  DollarSign,
  ArrowRight,
  Clock,
  Filter,
  PieChart,
  Wallet,
  Smartphone,
  Bike,
  Store
} from 'lucide-react';
import {
  BrokerageAsset,
  BrokerageConversionTrade,
  LbcTransaction,
  LbcWallet,
  MarketplaceSide
} from '../types/architecture';
import {
  BROKERAGE_ASSETS,
  INITIAL_LBC_WALLETS,
  INITIAL_LBC_TRANSACTIONS,
  LBC_USD_PEG_RATE,
  LBC_TREASURY_APY
} from '../data/lbcBrokerageData';

interface BrokerageIntegrationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'transfer' | 'history';
  onPlaySpeech?: (text: string) => void;
}

export const BrokerageIntegrationOverlay: React.FC<BrokerageIntegrationOverlayProps> = ({
  isOpen,
  onClose,
  initialTab = 'transfer',
  onPlaySpeech
}) => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'history'>(initialTab);
  const [selectedPersona, setSelectedPersona] = useState<string>('driver_moise');
  const [wallets, setWallets] = useState<Record<string, LbcWallet>>(INITIAL_LBC_WALLETS);
  const [transactions, setTransactions] = useState<LbcTransaction[]>(INITIAL_LBC_TRANSACTIONS);

  // Conversion Form State
  const [selectedAssetId, setSelectedAssetId] = useState<string>(BROKERAGE_ASSETS[0].id);
  const [transferAmountLbc, setTransferAmountLbc] = useState<number>(150);
  const [fiatDestination, setFiatDestination] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Transaction history filter
  const [historyRoleFilter, setHistoryRoleFilter] = useState<'all' | 'driver' | 'customer' | 'merchant'>('all');

  const handleToggleEarningLbc = async (personaId: string) => {
    const current = wallets[personaId]?.earningLbcEnabled !== false;
    const next = !current;
    setWallets((prev) => ({
      ...prev,
      [personaId]: {
        ...prev[personaId],
        earningLbcEnabled: next
      }
    }));
    try {
      await fetch(`/api/lbc/wallet/${personaId}/earning-preference`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next })
      });
    } catch {
      // local fallback
    }
  };

  if (!isOpen) return null;

  const currentWallet = wallets[selectedPersona] || wallets.driver_moise;
  const selectedAsset = BROKERAGE_ASSETS.find((a) => a.id === selectedAssetId) || BROKERAGE_ASSETS[0];

  const estimatedUsd = transferAmountLbc * LBC_USD_PEG_RATE;
  const estimatedUnits = selectedAsset.priceUsd > 0 ? estimatedUsd / selectedAsset.priceUsd : 0;

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferAmountLbc > currentWallet.balanceLbc) {
      alert(`Insufficient LBC balance! You currently have ${currentWallet.balanceLbc.toLocaleString()} LBC.`);
      return;
    }

    setIsExecuting(true);
    setTimeout(() => {
      const tradeId = `brk-tr-${Date.now()}`;
      const newBal = currentWallet.balanceLbc - transferAmountLbc;

      // Update wallet
      setWallets((prev) => ({
        ...prev,
        [selectedPersona]: {
          ...currentWallet,
          balanceLbc: newBal,
          usdValue: newBal * LBC_USD_PEG_RATE
        }
      }));

      // Create confirmed transaction log
      const newTx: LbcTransaction = {
        id: `tx-lbc-${Date.now()}`,
        timestamp: 'Just now',
        userId: selectedPersona,
        userType: currentWallet.userType,
        userName: currentWallet.userName,
        activityType: 'service_completed',
        activityReferenceId: tradeId,
        amountLbc: -transferAmountLbc,
        usdEquivalent: -estimatedUsd,
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        status: 'confirmed',
        note: `Brokerage Transfer: Converted ${transferAmountLbc} LBC into ${estimatedUnits.toFixed(4)} ${selectedAsset.ticker} ($${estimatedUsd.toFixed(2)} USD)`
      };

      setTransactions((prev) => [newTx, ...prev]);
      setIsExecuting(false);
      setSuccessMessage(
        `Transfer Confirmed! Successfully converted ${transferAmountLbc} LBC into ${estimatedUnits.toFixed(4)} units of ${selectedAsset.name} ($${estimatedUsd.toFixed(2)} USD). Your assets are custodially held in your investor portfolio.`
      );

      if (onPlaySpeech) {
        onPlaySpeech(
          `Transfè reyisi! Ou konvèti ${transferAmountLbc} Liberté Cash an aksyon ${selectedAsset.ticker}.`
        );
      }
    }, 600);
  };

  const filteredHistory =
    historyRoleFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.userType === historyRoleFilter);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Liberté Cash (LBC) Brokerage & Financial Freedom Portal
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                  Live API Linked
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                167 LBC = 1 Liberty Cash ($1.00 USD Peg) • Min. $0.50 Purchasing Floor • {LBC_TREASURY_APY}% APY Daily Yield
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Switcher & Balance Banner */}
        <div className="px-6 py-3 bg-neutral-900 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-400 font-semibold">Active Account:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedPersona('driver_moise')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  selectedPersona === 'driver_moise'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Jean-Baptiste (Driver)</span>
              </button>

              <button
                onClick={() => setSelectedPersona('customer_fabienne')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  selectedPersona === 'customer_fabienne'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Fabienne (Customer)</span>
              </button>

              <button
                onClick={() => setSelectedPersona('merchant_chef_fifi')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                  selectedPersona === 'merchant_chef_fifi'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Chef Fifi (Merchant)</span>
              </button>
            </div>

            {/* Optional Earning Toggle */}
            <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 ml-1">
              <span className="text-[11px] text-neutral-400">Earn LBC Tokens:</span>
              <button
                id={`toggle-lbc-earning-${selectedPersona}`}
                type="button"
                onClick={() => handleToggleEarningLbc(selectedPersona)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                  currentWallet.earningLbcEnabled !== false
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                <span>{currentWallet.earningLbcEnabled !== false ? '✓ Enabled (Tokens)' : '✕ Disabled (Cash)'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-neutral-950 px-3.5 py-1.5 rounded-xl border border-neutral-800 font-mono">
            <span className="text-neutral-400 text-[11px] font-sans">Available LBC:</span>
            <span className="text-amber-400 font-bold text-sm">
              {currentWallet.balanceLbc.toLocaleString()} LBC
            </span>
            <span className="text-neutral-400 text-[11px]">
              ({(currentWallet.balanceLbc / 167).toFixed(2)} Liberty Cash • ${ (currentWallet.balanceLbc * LBC_USD_PEG_RATE).toFixed(2) } USD)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-neutral-900 flex gap-2 border-b border-neutral-800">
          <button
            onClick={() => {
              setActiveTab('transfer');
              setSuccessMessage(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'transfer'
                ? 'bg-neutral-950 text-amber-400 border-t-2 border-amber-400 border-x border-neutral-800'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Transfer & Convert LBC to Assets</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setSuccessMessage(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-neutral-950 text-amber-400 border-t-2 border-amber-400 border-x border-neutral-800'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>LBC Transaction History ({transactions.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-neutral-950">
          {successMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-4 rounded-2xl text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">Investment Confirmed</div>
                <div className="leading-relaxed">{successMessage}</div>
              </div>
            </div>
          )}

          {/* TAB 1: TRANSFER & BROKERAGE CONVERSION */}
          {activeTab === 'transfer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Conversion Form */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>Convert Liberté Cash to Fractional Investments</span>
                    </h3>
                    <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 font-bold">
                      Zero Execution Fee
                    </span>
                  </div>

                  <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
                    {/* Target Asset Picker */}
                    <div>
                      <label className="block text-neutral-400 mb-1.5 font-semibold">
                        Select Target Investment or Cash Rail:
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {BROKERAGE_ASSETS.map((asset) => (
                          <div
                            key={asset.id}
                            onClick={() => setSelectedAssetId(asset.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                              selectedAssetId === asset.id
                                ? 'bg-amber-950/40 border-amber-400 text-white'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{asset.ticker}</span>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                ${asset.priceUsd > 0 ? asset.priceUsd.toFixed(2) : 'Par'}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate mt-1">{asset.name}</div>
                            <div className="text-[9px] uppercase font-bold text-neutral-500 mt-1">
                              {asset.assetClass.replace('_', ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-neutral-400 font-semibold">Amount of LBC to Transfer:</label>
                        <button
                          type="button"
                          onClick={() => setTransferAmountLbc(currentWallet.balanceLbc)}
                          className="text-[11px] text-amber-400 hover:underline font-bold"
                        >
                          Max ({currentWallet.balanceLbc.toLocaleString()} LBC)
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={10}
                          max={currentWallet.balanceLbc}
                          value={transferAmountLbc}
                          onChange={(e) => setTransferAmountLbc(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                        />
                        <div className="absolute right-3 top-2.5 text-xs text-neutral-400 font-bold">LBC</div>
                      </div>
                    </div>

                    {/* Execution Preview */}
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                      <div className="flex justify-between text-neutral-400">
                        <span>Liberty Cash Peg (167 LBC = $1.00 USD):</span>
                        <span className="text-white font-bold">${estimatedUsd.toFixed(2)} USD ({(transferAmountLbc / 167).toFixed(2)} Liberty Cash)</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>Asset Execution Price:</span>
                        <span className="text-white">
                          ${selectedAsset.priceUsd > 0 ? selectedAsset.priceUsd.toFixed(2) : '1.00'} USD
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-400 text-[11px]">
                        <span>Purchasing Power Guarantee:</span>
                        <span>Min. $0.50 USD local purchasing power floor</span>
                      </div>
                      <div className="flex justify-between text-amber-400 font-bold pt-1.5 border-t border-neutral-800">
                        <span>Estimated Units Acquired:</span>
                        <span>{estimatedUnits.toFixed(4)} {selectedAsset.ticker}</span>
                      </div>
                    </div>

                    {/* Destination Account if Cashout */}
                    {selectedAsset.assetClass === 'fiat_cashout' && (
                      <div>
                        <label className="block text-neutral-400 mb-1 font-semibold">
                          Local Mobile Wallet / Account Number ({selectedAsset.fiatRail}):
                        </label>
                        <input
                          type="text"
                          value={fiatDestination}
                          onChange={(e) => setFiatDestination(e.target.value)}
                          placeholder="+509 3456-7890 (MonCash) or IBAN"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isExecuting || transferAmountLbc <= 0}
                      className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>
                        {isExecuting
                          ? 'Executing Brokerage Order...'
                          : `Confirm Transfer (${transferAmountLbc} LBC → ${selectedAsset.ticker})`}
                      </span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Asset Details & Financial Freedom Explainer */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Investment Spotlight</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{selectedAsset.name}</h4>
                  <div className="text-xs text-neutral-400 mt-0.5">{selectedAsset.exchange} • {selectedAsset.categoryTag}</div>

                  <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
                    {selectedAsset.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">24h Performance:</span>
                      <span className={`font-mono font-bold ${selectedAsset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Minimum LBC to Convert:</span>
                      <span className="text-neutral-200">{selectedAsset.minLbcToConvert} LBC</span>
                    </div>
                  </div>
                </div>

                {/* Financial Freedom & Custodial Trust Callout */}
                <div className="bg-gradient-to-b from-amber-950/40 to-neutral-900 border border-amber-500/20 rounded-2xl p-5 shadow-lg text-xs space-y-2.5">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Path to Financial Freedom</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Every motorcycle ride, meal delivery, and grocery run earns real tokenized equity. Instead of losing value to inflation, your <strong>Liberté Cash</strong> gives you direct ownership in the world's most productive assets.
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Regulated custodial clearing provided by SEC-registered and regional banking partners.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LBC TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Audited LBC Token Transaction Ledger</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Cryptographically verifiable record of all earned rewards, 3-way ratings, and brokerage transfers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Filter:</span>
                  <div className="flex bg-neutral-950 p-0.5 rounded-xl border border-neutral-800 text-xs">
                    {(['all', 'driver', 'customer', 'merchant'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setHistoryRoleFilter(tab)}
                        className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                          historyRoleFilter === tab
                            ? 'bg-amber-400 text-neutral-950 font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/80 overflow-hidden shadow-xl">
                {filteredHistory.map((tx) => {
                  const isCredit = tx.amountLbc > 0;
                  return (
                    <div key={tx.id} className="p-4 hover:bg-neutral-850 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl mt-0.5 ${
                            isCredit
                              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
                              : 'bg-amber-950/60 border border-amber-800 text-amber-400'
                          }`}
                        >
                          {isCredit ? <Coins className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">{tx.userName}</span>
                            <span className="px-2 py-0.2 rounded-md bg-neutral-800 text-neutral-300 uppercase text-[10px] font-bold">
                              {tx.userType}
                            </span>
                            <span className="text-neutral-500 font-mono text-[11px]">{tx.txHash}</span>
                          </div>
                          <div className="text-neutral-300 text-xs mt-1">{tx.note}</div>
                          <div className="text-neutral-500 text-[11px] mt-0.5">
                            Ref: {tx.activityReferenceId} • {tx.timestamp}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-mono font-black text-sm ${
                            isCredit ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {isCredit ? '+' : ''}{tx.amountLbc} LBC
                        </div>
                        <div className="text-neutral-400 text-[11px] font-mono">
                          {isCredit ? '+' : ''}${Math.abs(tx.usdEquivalent).toFixed(2)} USD
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.2 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 text-[10px] font-medium">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

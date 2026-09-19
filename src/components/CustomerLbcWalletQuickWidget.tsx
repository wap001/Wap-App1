import React, { useState, useEffect } from 'react';
import {
  Coins,
  ChevronUp,
  ChevronDown,
  Sparkles,
  TrendingUp,
  RotateCw,
  CheckCircle2,
  ExternalLink,
  Bike,
  Package,
  Star,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { LbcWallet, LbcTransaction } from '../types/architecture';
import {
  INITIAL_LBC_WALLETS,
  INITIAL_LBC_TRANSACTIONS,
  LBC_USD_PEG_RATE,
  LBC_TOKENS_PER_LIBERTY_CASH,
  LBC_TREASURY_APY
} from '../data/lbcBrokerageData';

interface CustomerLbcWalletQuickWidgetProps {
  userId?: string;
  userName?: string;
  onOpenFullBrokerage?: (initialTab?: 'transfer' | 'projection' | 'history') => void;
  position?: 'top-right' | 'bottom-left' | 'relative';
}

export const CustomerLbcWalletQuickWidget: React.FC<CustomerLbcWalletQuickWidgetProps> = ({
  userId = 'customer_fabienne',
  userName = 'Fabienne Voltaire',
  onOpenFullBrokerage,
  position = 'top-right'
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [wallet, setWallet] = useState<LbcWallet>(
    INITIAL_LBC_WALLETS[userId] || INITIAL_LBC_WALLETS.customer_fabienne
  );
  const [transactions, setTransactions] = useState<LbcTransaction[]>(
    INITIAL_LBC_TRANSACTIONS.filter((tx) => tx.userId === userId).slice(0, 3)
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [isTogglingEarning, setIsTogglingEarning] = useState<boolean>(false);

  // Fetch real-time wallet & transaction data from server routes
  const fetchWalletAndTransactions = async () => {
    setIsRefreshing(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        fetch(`/api/lbc/wallet/customer/${userId}`),
        fetch(`/api/lbc/transactions?userId=${userId}&limit=3`)
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        if (walletData.wallet) {
          setWallet(walletData.wallet);
        }
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        if (Array.isArray(txData.transactions) && txData.transactions.length > 0) {
          setTransactions(txData.transactions.slice(0, 3));
        }
      }
    } catch {
      // Graceful fallback to initial state in offline/sandbox mode
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchWalletAndTransactions();
  }, [userId]);

  // Toggle optional LBC earning preference
  const handleToggleEarning = async () => {
    const currentPreference = wallet.earningLbcEnabled !== false;
    const newPreference = !currentPreference;
    setIsTogglingEarning(true);

    setWallet((prev) => ({
      ...prev,
      earningLbcEnabled: newPreference
    }));

    try {
      await fetch(`/api/lbc/wallet/${userId}/earning-preference`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newPreference })
      });
    } catch {
      // Local state fallback already updated
    } finally {
      setIsTogglingEarning(false);
    }
  };

  const handleCopyHash = (txId: string, hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const libertyCashUnits = wallet.balanceLbc / LBC_TOKENS_PER_LIBERTY_CASH;
  const lastThreeTx = transactions.slice(0, 3);
  const isTop = position === 'top-right' || position === 'relative';

  const containerClasses =
    position === 'top-right'
      ? 'fixed top-20 right-4 sm:right-6 z-40 flex flex-col items-end font-sans'
      : position === 'relative'
      ? 'relative flex flex-col items-end font-sans'
      : 'fixed bottom-6 left-4 sm:left-6 z-30 flex flex-col items-start font-sans';

  // Card Content Component
  const cardElement = isExpanded && (
    <div
      id="customer-lbc-quick-wallet-card"
      className={`${
        isTop ? 'mt-2 origin-top-right' : 'mb-3 origin-bottom-left'
      } w-[calc(100vw-2rem)] sm:w-96 bg-neutral-900/95 backdrop-blur-md border border-amber-400/30 rounded-2xl shadow-2xl p-4 text-white animate-fadeIn overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Liberté Cash Wallet
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/20">
                Quick View
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Financial Freedom & US Equities Gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-refresh-quick-wallet"
            type="button"
            onClick={fetchWalletAndTransactions}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Refresh wallet balances"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            id="btn-collapse-quick-wallet"
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Minimize wallet widget"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Balance & Value Block */}
      <div className="mt-3.5 p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Available Balance</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-amber-400 font-mono tracking-tight">
                {wallet.balanceLbc.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-300">LBC</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-500">Valuation</span>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              ${wallet.usdValue.toFixed(2)} USD
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              {libertyCashUnits.toFixed(2)} Liberty Cash
            </div>
          </div>
        </div>

        {/* Micro Badges: Peg & APY & Optional Earning */}
        <div className="pt-2 border-t border-neutral-850 flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span>167 LBC = $1.00 USD Peg</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>+{LBC_TREASURY_APY}% APY Daily Yield</span>
          </div>
        </div>

        {/* Optional Earning Toggle */}
        <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Earn LBC Rewards:</span>
          <button
            id="quick-wallet-toggle-earning"
            type="button"
            onClick={handleToggleEarning}
            disabled={isTogglingEarning}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
              wallet.earningLbcEnabled !== false
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            {wallet.earningLbcEnabled !== false ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Opted In (Accumulate)</span>
              </>
            ) : (
              <span>Opted Out (Direct Cash)</span>
            )}
          </button>
        </div>
      </div>

      {/* Last 3 Transactions Summary */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Last 3 Transactions</span>
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">Live Ledger</span>
        </div>

        {lastThreeTx.length === 0 ? (
          <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-950/60 rounded-xl border border-neutral-800">
            No recent transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {lastThreeTx.map((tx) => {
              const isRide = tx.activityType === 'ride_completed';
              const isBonus = tx.activityType === 'rating_bonus' || tx.activityType === 'streak_bonus';

              return (
                <div
                  key={tx.id}
                  className="p-2.5 bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 rounded-xl transition flex items-center justify-between gap-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isRide
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : isBonus
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      }`}
                    >
                      {isRide ? (
                        <Bike className="w-3.5 h-3.5" />
                      ) : isBonus ? (
                        <Star className="w-3.5 h-3.5" />
                      ) : (
                        <Package className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-white truncate">
                        {tx.note.replace(/\s\(\+\d+\sLBC\)/, '')}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>{tx.timestamp}</span>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(tx.id, tx.txHash)}
                          className="font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-0.5"
                          title="Copy transaction hash"
                        >
                          <span>{tx.txHash.substring(0, 8)}...</span>
                          {copiedTxId === tx.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-amber-400 font-mono text-xs">
                      +{tx.amountLbc} LBC
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      ${(tx.amountLbc * LBC_USD_PEG_RATE).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchasing Power & Financial Sovereignty Callout */}
      <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-400/5 to-emerald-400/5 border border-amber-400/15 rounded-xl text-[11px] text-neutral-300 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          Every ride accumulates <strong>Liberté Cash</strong> pegged at 167 LBC = $1.00 USD, guaranteeing a minimum of $0.50 USD local purchasing power and compounding with 5.2% yield toward your financial freedom.
        </p>
      </div>

      {/* Action Footer */}
      {onOpenFullBrokerage && (
        <div className="mt-3 pt-2.5 border-t border-neutral-800 space-y-1.5">
          <button
            id="btn-quick-wallet-open-full-brokerage"
            type="button"
            onClick={() => onOpenFullBrokerage('transfer')}
            className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
          >
            <span>Open Full Brokerage &amp; Stock Conversion</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-quick-wallet-open-projection"
            type="button"
            onClick={() => onOpenFullBrokerage('projection')}
            className="w-full py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-amber-400/30 text-amber-300 hover:text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>Growth Projection (167 LBC = $1.00 USD)</span>
          </button>
        </div>
      )}
    </div>
  );

  // Trigger Pill Button Component
  const pillButtonElement = (
    <button
      id="btn-customer-quick-wallet-pill"
      type="button"
      onClick={() => setIsExpanded(!isExpanded)}
      className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-neutral-900/95 hover:bg-neutral-900 border border-amber-400/40 hover:border-amber-400 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      title="Quick View Liberté Cash Wallet & Transactions"
    >
      <div className="w-6 h-6 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
        <Coins className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center gap-2">
        <div className="text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-400 font-mono">
              {wallet.balanceLbc.toLocaleString()} LBC
            </span>
            <span className="text-[10px] text-neutral-400">
              (${wallet.usdValue.toFixed(2)})
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 font-medium">
            Liberté Cash Wallet
          </div>
        </div>

        <div className="pl-1 border-l border-neutral-800 text-neutral-400 group-hover:text-amber-400 transition">
          {isTop ? (
            isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
          ) : (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div id="customer-lbc-quick-wallet-widget" className={containerClasses}>
      {isTop ? (
        <>
          {pillButtonElement}
          {cardElement}
        </>
      ) : (
        <>
          {cardElement}
          {pillButtonElement}
        </>
      )}
    </div>
  );
};

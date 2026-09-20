import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Coins,
  Copy,
  Check,
  TrendingUp,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Info,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { RegionId, LanguageCode, LbcWallet } from '../types/architecture';
import { LBC_TOKENS_PER_LIBERTY_CASH, LBC_USD_PEG_RATE, LBC_TREASURY_APY } from '../data/lbcBrokerageData';
import { REGIONS } from '../data/mockData';

export interface LbcQuickConvertUtilityProps {
  currentWallet: LbcWallet;
  activePersona: string;
  region: RegionId;
  language: LanguageCode;
  onPlaySpeech?: (text: string) => void;
  onApplyToBrokerageConverter?: (amountLbc: number) => void;
  className?: string;
}

const PRESET_USD_AMOUNTS = [5, 10, 25, 50, 100, 250, 500];

const REGIONAL_RATES_TO_USD: Record<string, { rate: number; currency: string; symbol: string }> = {
  haiti: { rate: 131.5, currency: 'HTG', symbol: 'G' },
  french_guiana: { rate: 0.92, currency: 'EUR', symbol: '€' },
  guyana: { rate: 208.5, currency: 'GYD', symbol: 'G$' },
  suriname: { rate: 35.6, currency: 'SRD', symbol: 'SRD' }
};

export const LbcQuickConvertUtility: React.FC<LbcQuickConvertUtilityProps> = ({
  currentWallet,
  activePersona,
  region,
  language,
  onPlaySpeech,
  onApplyToBrokerageConverter,
  className = ''
}) => {
  // User typed USD amount (default to $25.00)
  const [usdInput, setUsdInput] = useState<string>('25');
  const [copied, setCopied] = useState<boolean>(false);
  const [copyFeedbackText, setCopyFeedbackText] = useState<string>('Copy to Clipboard');

  const currentRegion = REGIONS[region];

  // Numeric parsing
  const parsedUsd = useMemo(() => {
    const val = parseFloat(usdInput);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [usdInput]);

  // Exact conversion based on 167 LBC per 1 USD
  const calculatedLbc = useMemo(() => {
    return parsedUsd * LBC_TOKENS_PER_LIBERTY_CASH;
  }, [parsedUsd]);

  // Local currency equivalent based on active region
  const localCurrencyInfo = useMemo(() => {
    const regData = REGIONAL_RATES_TO_USD[region] || {
      rate: 1,
      currency: currentRegion?.currency || 'USD',
      symbol: currentRegion?.currencySymbol || '$'
    };
    const localAmount = parsedUsd * regData.rate;
    return {
      localAmount,
      symbol: regData.symbol,
      code: regData.currency
    };
  }, [parsedUsd, region, currentRegion]);

  // Copy to clipboard handler
  const handleCopyToClipboard = async () => {
    const formattedLbc = Math.round(calculatedLbc).toLocaleString();
    const formattedUsd = parsedUsd.toFixed(2);
    const textToCopy = `${formattedLbc} LBC ($${formattedUsd} USD at 167 LBC/USD rate)`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setCopyFeedbackText('Copied to Clipboard!');
      setTimeout(() => {
        setCopied(false);
        setCopyFeedbackText('Copy to Clipboard');
      }, 2500);

      if (onPlaySpeech) {
        onPlaySpeech(
          language === 'ht'
            ? `${formattedLbc} Liberté Cash kopye nan memwa aparèy ou a.`
            : `${formattedLbc} LBC copié dans le presse-papier.`
        );
      }
    } catch {
      setCopyFeedbackText('Failed to copy');
      setTimeout(() => setCopyFeedbackText('Copy to Clipboard'), 2000);
    }
  };

  // Voice speech explanation
  const handleVoiceExplain = () => {
    if (!onPlaySpeech) return;
    const formattedLbc = Math.round(calculatedLbc).toLocaleString();
    const formattedUsd = parsedUsd.toFixed(2);
    const speechText =
      language === 'ht'
        ? `Pou ${formattedUsd} dola ameriken, ou resevwa ${formattedLbc} Liberté Cash sou baz to garanti 167 pou 1. LBC sa a ba w libète finansye, li pwoteje kont enflasyon, epi li fè enterè ${LBC_TREASURY_APY} pousan chak ane.`
        : `Pour ${formattedUsd} dollars américains, vous recevez ${formattedLbc} Liberté Cash au taux fixe de 167 pour 1. LBC vous offre la liberté financière, protège vos économies et génère un rendement de ${LBC_TREASURY_APY}% par an.`;
    onPlaySpeech(speechText);
  };

  return (
    <div
      id="lbc-quick-convert-utility-card"
      className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 ${className}`}
    >
      {/* Utility Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Quick-Convert Utility &amp; Liberté Cash Wallet
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 text-[10px] font-bold font-mono">
                167 LBC = $1.00 USD
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Instant USD to LBC valuation converter and real-time sovereign wallet management.
            </p>
          </div>
        </div>

        {/* Audio Speech Button */}
        {onPlaySpeech && (
          <button
            id="btn-quick-convert-speech"
            type="button"
            onClick={handleVoiceExplain}
            className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 text-[11px] font-semibold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Vwa / Audio Guide</span>
          </button>
        )}
      </div>

      {/* Main Grid: Converter (Left) & Liberté Cash Wallet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT (7 cols): Interactive USD -> LBC Converter */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Input Label & Rate Standard */}
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="input-quick-convert-usd" className="text-neutral-300 font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Type Any Amount in USD ($):</span>
              </label>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                1 USD = 167 LBC
              </span>
            </div>

            {/* USD Input Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 font-bold text-base font-mono">
                $
              </div>
              <input
                id="input-quick-convert-usd"
                type="number"
                step="any"
                min="0"
                placeholder="Enter USD amount (e.g. 25)..."
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 text-white font-mono font-bold text-lg rounded-xl pl-8 pr-20 py-2.5 outline-none transition"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5 pointer-events-none">
                <span className="text-xs font-bold text-amber-400 font-mono">USD</span>
              </div>
            </div>

            {/* Quick Preset USD Chips */}
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-400 font-medium flex items-center justify-between">
                <span>Quick Preset Amounts:</span>
                {parsedUsd > 0 && (
                  <button
                    id="btn-quick-convert-reset"
                    type="button"
                    onClick={() => setUsdInput('')}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_USD_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    id={`btn-preset-usd-${amt}`}
                    type="button"
                    onClick={() => setUsdInput(amt.toString())}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer border ${
                      parsedUsd === amt
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-sm'
                        : 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated LBC Result Box */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-semibold text-neutral-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Equivalent Value in Liberté Cash (LBC):</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {parsedUsd > 0 ? `${parsedUsd.toFixed(2)} Liberty Cash` : '0.00 Liberty Cash'}
                </span>
              </div>

              {/* Large Result Counter */}
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span
                    id="text-quick-convert-lbc-result"
                    className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight"
                  >
                    {Math.round(calculatedLbc).toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-white font-mono">LBC</span>
                </div>

                {/* Local Fiat Equivalent */}
                <div className="text-right font-mono">
                  <div className="text-xs font-semibold text-white">
                    ≈ {localCurrencyInfo.symbol}
                    {localCurrencyInfo.localAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
                    {localCurrencyInfo.code}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Min $0.50 purchasing floor active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Copy to Clipboard & Apply to Trade */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            {/* Copy to Clipboard Button */}
            <button
              id="btn-quick-convert-copy"
              type="button"
              onClick={handleCopyToClipboard}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-neutral-950 border border-emerald-400'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 hover:border-amber-400/50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                  <span className="font-extrabold">{copyFeedbackText}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            {/* Apply to Brokerage Converter Slip */}
            {onApplyToBrokerageConverter && (
              <button
                id="btn-quick-convert-apply-brokerage"
                type="button"
                onClick={() => onApplyToBrokerageConverter(Math.round(calculatedLbc))}
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer shrink-0"
              >
                <span>Convert to Stocks / ETFs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT (5 cols): Liberté Cash Wallet (LBC Wallet) */}
        <div
          id="liberte-cash-wallet-card"
          className="lg:col-span-5 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 border border-amber-400/30 rounded-xl p-4 space-y-3.5 flex flex-col justify-between shadow-lg relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            {/* Wallet Card Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Liberté Cash Wallet</span>
                    <span className="text-[10px] text-amber-300 font-mono">(LBC Wallet)</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    {currentWallet.linkedBrokerageAccount || 'SEC Custodial Clearing'}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold font-mono">
                {currentWallet.annualYieldApy || LBC_TREASURY_APY}% APY
              </span>
            </div>

            {/* Persona & Current Balance */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>Account Holder:</span>
                <span className="font-semibold text-neutral-200 capitalize">
                  {currentWallet.userName} ({currentWallet.userType})
                </span>
              </div>

              <div className="pt-1">
                <div className="text-[10px] text-neutral-400">Available Wallet Balance:</div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
                    {currentWallet.balanceLbc.toLocaleString()} <span className="text-xs font-bold text-white">LBC</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-white block">
                      ${(currentWallet.balanceLbc * LBC_USD_PEG_RATE).toFixed(2)} USD
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {(currentWallet.balanceLbc / LBC_TOKENS_PER_LIBERTY_CASH).toFixed(2)} Liberty Cash
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Performance & Wealth Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5">
                <span className="text-[10px] text-neutral-400 block">Total Lifetime Earned</span>
                <span className="font-bold text-white font-mono mt-0.5 block">
                  {currentWallet.totalEarnedLbc.toLocaleString()} LBC
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  ${(currentWallet.totalEarnedLbc * LBC_USD_PEG_RATE).toFixed(2)} USD
                </span>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5">
                <span className="text-[10px] text-neutral-400 block">Treasury Staking Yield</span>
                <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
                  +${currentWallet.stakingRewardsEarned.toFixed(2)} USD
                </span>
                <span className="text-[10px] text-neutral-400">
                  Daily Compounding
                </span>
              </div>
            </div>
          </div>

          {/* Financial Freedom & Sovereignty Message */}
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-2.5 text-[10px] text-neutral-300 leading-relaxed space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Sovereign Financial Freedom:</span>
            </div>
            <p className="text-neutral-400">
              100% of your earnings belong to you. No predatory merchant deductions or processing fees. Convert directly to US stocks, ETFs, or physical assets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

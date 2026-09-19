import React, { useState } from 'react';
import {
  Coins,
  DollarSign,
  Heart,
  Bike,
  Store,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Split,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import {
  LBC_USD_PEG_RATE,
  LBC_TOKENS_PER_LIBERTY_CASH,
  LBC_TREASURY_APY
} from '../data/lbcBrokerageData';

export type TipRecipient = 'driver' | 'merchant' | 'both';
export type TipPaymentMode = 'lbc' | 'liberty_cash' | 'fiat';

export interface TipSubmission {
  recipient: TipRecipient;
  paymentMode: TipPaymentMode;
  amount: number;
  lbcEquivalent: number;
  usdEquivalent: number;
  currencyCode: string;
  timestamp: string;
  driverName: string;
  merchantName?: string;
}

interface TippingModuleProps {
  driverName?: string;
  merchantName?: string;
  orderFare?: number;
  currencySymbol?: string;
  currencyCode?: string;
  fiatExchangeRateToUSD?: number; // e.g. 131.50 for HTG, 2.70 for XCD
  onTipConfirmed?: (submission: TipSubmission) => void;
  onPlaySpeech?: (text: string) => void;
  onClose?: () => void;
}

export const TippingModule: React.FC<TippingModuleProps> = ({
  driverName = 'Jean-Baptiste Voltaire',
  merchantName = 'Lakay Pétion-Ville Grill',
  orderFare = 6.5,
  currencySymbol = '$',
  currencyCode = 'USD',
  fiatExchangeRateToUSD = 1.0,
  onTipConfirmed,
  onPlaySpeech,
  onClose,
}) => {
  const [recipient, setRecipient] = useState<TipRecipient>('driver');
  const [paymentMode, setPaymentMode] = useState<TipPaymentMode>('lbc');

  // Amounts in respective denominations
  const [lbcAmount, setLbcAmount] = useState<number>(167); // 167 LBC = $1.00 USD
  const [lcAmount, setLcAmount] = useState<number>(2.0); // 2 Liberty Cash = $2.00 USD
  const [fiatAmount, setFiatAmount] = useState<number>(() => {
    // Default to ~15% or minimal meaningful tip
    return Math.max(1.0, Math.round(orderFare * 0.15 * 100) / 100);
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmedSubmission, setConfirmedSubmission] = useState<TipSubmission | null>(null);

  // Conversions based on peg: 167 LBC = 1 Liberty Cash = $1.00 USD
  let currentUsdEquivalent = 0;
  let currentLbcEquivalent = 0;

  if (paymentMode === 'lbc') {
    currentLbcEquivalent = lbcAmount;
    currentUsdEquivalent = lbcAmount * LBC_USD_PEG_RATE;
  } else if (paymentMode === 'liberty_cash') {
    currentLbcEquivalent = lcAmount * LBC_TOKENS_PER_LIBERTY_CASH;
    currentUsdEquivalent = lcAmount;
  } else {
    // fiat mode
    currentUsdEquivalent = fiatAmount / (fiatExchangeRateToUSD || 1.0);
    currentLbcEquivalent = Math.round(currentUsdEquivalent * LBC_TOKENS_PER_LIBERTY_CASH);
  }

  // Quick preset chips for LBC
  const lbcPresets = [50, 100, 167, 334, 500];
  // Quick preset chips for Liberty Cash
  const lcPresets = [1.0, 2.0, 3.0, 5.0, 10.0];
  // Quick preset percentages for Fiat
  const fiatPercentages = [10, 15, 20, 25];

  const handleConfirmTip = () => {
    const submission: TipSubmission = {
      recipient,
      paymentMode,
      amount: paymentMode === 'lbc' ? lbcAmount : paymentMode === 'liberty_cash' ? lcAmount : fiatAmount,
      lbcEquivalent: currentLbcEquivalent,
      usdEquivalent: currentUsdEquivalent,
      currencyCode: paymentMode === 'fiat' ? currencyCode : paymentMode === 'lbc' ? 'LBC' : 'LC',
      timestamp: new Date().toISOString(),
      driverName,
      merchantName: recipient !== 'driver' ? merchantName : undefined,
    };

    setConfirmedSubmission(submission);
    setIsSubmitted(true);

    if (onTipConfirmed) {
      onTipConfirmed(submission);
    }

    if (onPlaySpeech) {
      const recipientText =
        recipient === 'driver'
          ? driverName
          : recipient === 'merchant'
          ? merchantName
          : `${driverName} and ${merchantName}`;
      onPlaySpeech(
        `Thank you for generously tipping ${recipientText}! Your contribution fosters financial freedom and investment in our community.`
      );
    }
  };

  return (
    <div
      id="tipping-module-card"
      className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 text-white animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-neutral-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 to-emerald-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Heart className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Empowerment Tipping</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% to Worker
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Reward your driver or local merchant with financial freedom &amp; compounding LBC yield.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-neutral-500 hover:text-white px-2 py-1 rounded-lg hover:bg-neutral-900 transition cursor-pointer"
          >
            Skip Tip
          </button>
        )}
      </div>

      {isSubmitted && confirmedSubmission ? (
        /* Confirmed Receipt Card */
        <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-amber-950/20 border border-emerald-500/40 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">
              Tip Successfully Dispatched!
            </h4>
            <p className="text-xs text-neutral-300">
              {confirmedSubmission.recipient === 'both' ? (
                <span>
                  Split evenly between <strong>{driverName}</strong> (Driver) and{' '}
                  <strong>{merchantName}</strong> (Merchant).
                </span>
              ) : confirmedSubmission.recipient === 'driver' ? (
                <span>
                  Sent directly to <strong>{driverName}</strong>&apos;s Liberté Cash wallet.
                </span>
              ) : (
                <span>
                  Sent directly to <strong>{merchantName}</strong>&apos;s merchant settlement account.
                </span>
              )}
            </p>
          </div>

          {/* Amount Badge */}
          <div className="py-2.5 px-4 bg-neutral-950/80 border border-neutral-800 rounded-xl inline-flex flex-col items-center">
            <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
              {confirmedSubmission.paymentMode === 'lbc' ? (
                `${confirmedSubmission.amount} LBC`
              ) : confirmedSubmission.paymentMode === 'liberty_cash' ? (
                `${confirmedSubmission.amount.toFixed(2)} Liberty Cash`
              ) : (
                `${currencySymbol} ${confirmedSubmission.amount.toFixed(2)} ${currencyCode}`
              )}
            </div>
            <div className="text-xs text-neutral-400 font-mono mt-0.5">
              ≈ ${confirmedSubmission.usdEquivalent.toFixed(2)} USD • {confirmedSubmission.lbcEquivalent} LBC
            </div>
          </div>

          <div className="p-3 bg-neutral-950/60 border border-amber-400/20 rounded-xl text-left text-xs text-neutral-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Financial Freedom Impact:</strong> 100% of this tip was credited instantly with zero platform commission. The recipient now earns <strong>+{LBC_TREASURY_APY}% APY daily compounding yield</strong> on their LBC balance!
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs shadow transition cursor-pointer"
            >
              Continue
            </button>
          )}
        </div>
      ) : (
        /* Interactive Form */
        <div className="space-y-4">
          {/* Recipient Selection Tab */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>Choose Recipient</span>
              <span className="text-[10px] text-neutral-500">100% direct payout</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRecipient('driver')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  recipient === 'driver'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow ring-1 ring-amber-400/30'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span className="truncate max-w-full">Driver Only</span>
                <span className="text-[10px] font-normal text-neutral-400 truncate max-w-full">
                  {driverName.split(' ')[0]}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRecipient('merchant')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  recipient === 'merchant'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow ring-1 ring-amber-400/30'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="truncate max-w-full">Merchant Only</span>
                <span className="text-[10px] font-normal text-neutral-400 truncate max-w-full">
                  {merchantName.split(' ')[0]}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRecipient('both')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  recipient === 'both'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow ring-1 ring-amber-400/30'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Split className="w-4 h-4" />
                <span className="truncate max-w-full">Split 50 / 50</span>
                <span className="text-[10px] font-normal text-neutral-400">
                  Both Equal
                </span>
              </button>
            </div>
          </div>

          {/* Payment Denomination Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>Payment Denomination</span>
              <span className="text-[10px] font-mono text-amber-400">167 LBC = 1 LC = $1.00 USD</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('lbc')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMode === 'lbc'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow ring-1 ring-amber-400/30'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>LBC Token</span>
                <span className="text-[10px] text-amber-400/80 font-mono font-normal">
                  Zero Gas Fee
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('liberty_cash')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMode === 'liberty_cash'
                    ? 'bg-emerald-400/15 border-emerald-400 text-emerald-300 shadow ring-1 ring-emerald-400/30'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Liberté Cash</span>
                <span className="text-[10px] text-emerald-400/80 font-mono font-normal">
                  USD Pegged
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('fiat')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMode === 'fiat'
                    ? 'bg-sky-400/15 border-sky-400 text-sky-300 shadow ring-1 ring-sky-400/30'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>Fiat Currency</span>
                <span className="text-[10px] text-neutral-400 font-mono font-normal">
                  {currencyCode} ({currencySymbol})
                </span>
              </button>
            </div>
          </div>

          {/* Amount Selection by Mode */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
            {/* LBC Mode */}
            {paymentMode === 'lbc' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Select LBC Token Preset:</span>
                  <span className="font-mono text-amber-400 font-bold text-sm">
                    {lbcAmount} LBC ≈ ${(lbcAmount * LBC_USD_PEG_RATE).toFixed(2)} USD
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {lbcPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLbcAmount(preset)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                        lbcAmount === preset
                          ? 'bg-amber-400 text-neutral-950 shadow'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      {preset} LBC
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-neutral-400">Custom LBC:</span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={lbcAmount}
                    onChange={(e) => setLbcAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-28 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Liberté Cash Mode */}
            {paymentMode === 'liberty_cash' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Select Liberté Cash Unit:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {lcAmount.toFixed(2)} LC = ${(lcAmount).toFixed(2)} USD
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {lcPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLcAmount(preset)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                        lcAmount === preset
                          ? 'bg-emerald-400 text-neutral-950 shadow'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      {preset.toFixed(1)} LC
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-neutral-400">Custom LC:</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={lcAmount}
                    onChange={(e) => setLcAmount(Math.max(0.5, parseFloat(e.target.value) || 0))}
                    className="w-28 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400">
                    = {Math.round(lcAmount * LBC_TOKENS_PER_LIBERTY_CASH)} LBC
                  </span>
                </div>
              </div>
            )}

            {/* Fiat Currency Mode */}
            {paymentMode === 'fiat' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Select Fiat Amount:</span>
                  <span className="font-mono text-sky-400 font-bold text-sm">
                    {currencySymbol} {fiatAmount.toFixed(2)} {currencyCode}
                  </span>
                </div>

                {/* Percentage of Trip Presets */}
                <div className="flex flex-wrap gap-2">
                  {fiatPercentages.map((pct) => {
                    const calculated = Math.round((orderFare * (pct / 100)) * 100) / 100;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setFiatAmount(calculated)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          Math.abs(fiatAmount - calculated) < 0.05
                            ? 'bg-sky-400 text-neutral-950 shadow'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        {pct}% ({currencySymbol} {calculated.toFixed(2)})
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-neutral-400">Custom {currencyCode}:</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-28 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white font-mono focus:border-sky-400 focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ≈ ${currentUsdEquivalent.toFixed(2)} USD • {currentLbcEquivalent} LBC
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Purchasing Power Floor Callout */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <p>
                <strong>Guaranteed Purchasing Power:</strong> 1 Liberty Cash guarantees a minimum floor of <strong>$0.50 USD local purchasing power</strong> in all territories.
              </p>
              <p className="text-[11px] text-neutral-400">
                Drivers and merchants can convert LBC directly into local cash or hold for 5.2% APY compound treasury interest.
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            id="btn-confirm-tip-dispatch"
            type="button"
            onClick={handleConfirmTip}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-neutral-950" />
            <span>
              Confirm {paymentMode === 'lbc' ? `${lbcAmount} LBC` : paymentMode === 'liberty_cash' ? `${lcAmount.toFixed(2)} LC` : `${currencySymbol} ${fiatAmount.toFixed(2)}`} Tip to {recipient === 'both' ? 'Driver & Merchant' : recipient === 'driver' ? driverName : merchantName}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

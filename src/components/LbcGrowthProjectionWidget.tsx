import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Coins,
  DollarSign,
  Calendar,
  Sparkles,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bike,
  Store,
  Smartphone,
  Layers,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { LBC_TOKENS_PER_LIBERTY_CASH, LBC_USD_PEG_RATE, LBC_TREASURY_APY } from '../data/lbcBrokerageData';

export interface LbcGrowthProjectionWidgetProps {
  initialPersona?: 'driver' | 'merchant' | 'customer' | 'custom';
  currentBalanceLbc?: number;
  onApplyGoalToTransfer?: (targetLbcAmount: number) => void;
  onPlaySpeech?: (text: string) => void;
  isCompact?: boolean;
}

type TimeframeKey = '30d' | '90d' | '180d' | '1yr' | '3yr' | '5yr';

interface TimeframeOption {
  key: TimeframeKey;
  label: string;
  days: number;
}

const TIMEFRAMES: TimeframeOption[] = [
  { key: '30d', label: '1 Month', days: 30 },
  { key: '90d', label: '3 Months', days: 90 },
  { key: '180d', label: '6 Months', days: 180 },
  { key: '1yr', label: '1 Year', days: 365 },
  { key: '3yr', label: '3 Years', days: 1095 },
  { key: '5yr', label: '5 Years', days: 1825 },
];

export const LbcGrowthProjectionWidget: React.FC<LbcGrowthProjectionWidgetProps> = ({
  initialPersona = 'driver',
  currentBalanceLbc = 2450,
  onApplyGoalToTransfer,
  onPlaySpeech,
  isCompact = false,
}) => {
  const [persona, setPersona] = useState<'driver' | 'merchant' | 'customer' | 'custom'>(initialPersona);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>('1yr');
  const [yieldMode, setYieldMode] = useState<'none' | 'treasury' | 'fleet_dividend'>('fleet_dividend');

  // Transaction defaults per persona
  const personaDefaults = {
    driver: { dailyTx: 14, lbcPerTx: 45, title: 'Motocycle Operator / Courier', icon: Bike },
    merchant: { dailyTx: 22, lbcPerTx: 30, title: 'Food & Goods Merchant', icon: Store },
    customer: { dailyTx: 2, lbcPerTx: 20, title: 'Frequent Passenger / Customer', icon: Smartphone },
    custom: { dailyTx: 10, lbcPerTx: 35, title: 'Custom Projection', icon: Sparkles }
  };

  const [dailyTx, setDailyTx] = useState<number>(personaDefaults[initialPersona].dailyTx);
  const [lbcPerTx, setLbcPerTx] = useState<number>(personaDefaults[initialPersona].lbcPerTx);

  const handleSelectPersona = (p: 'driver' | 'merchant' | 'customer' | 'custom') => {
    setPersona(p);
    setDailyTx(personaDefaults[p].dailyTx);
    setLbcPerTx(personaDefaults[p].lbcPerTx);
  };

  const apyRate = yieldMode === 'none' ? 0 : yieldMode === 'treasury' ? 0.052 : 0.142;
  const currentDays = TIMEFRAMES.find((t) => t.key === selectedTimeframe)?.days || 365;

  // Mathematical Calculation of Future Earnings:
  // Daily LBC earned from volume
  const dailyLbcEarned = dailyTx * lbcPerTx;
  const dailyUsdEarned = dailyLbcEarned / LBC_TOKENS_PER_LIBERTY_CASH; // 167 LBC = $1.00 USD

  const projection = useMemo(() => {
    const dailyDeposit = dailyLbcEarned;
    let totalLbcEarned = 0;
    let baseLbcEarned = dailyDeposit * currentDays;
    let compoundBonusLbc = 0;

    if (apyRate <= 0) {
      totalLbcEarned = baseLbcEarned;
    } else {
      const dailyRate = apyRate / 365;
      // Formula for future value of periodic daily deposits compounded daily:
      // FV = dailyDeposit * [ ( (1 + r)^n - 1 ) / r ]
      totalLbcEarned = dailyDeposit * ((Math.pow(1 + dailyRate, currentDays) - 1) / dailyRate);
      compoundBonusLbc = Math.max(0, totalLbcEarned - baseLbcEarned);
    }

    // Include existing current balance compounded over the horizon
    const initialBalanceCompounded = currentBalanceLbc * Math.pow(1 + (apyRate / 365), currentDays);
    const cumulativeBalanceLbc = totalLbcEarned + initialBalanceCompounded;

    // Converted at exact 167 LBC per 1 USD
    const totalLibertyCashEarned = totalLbcEarned / LBC_TOKENS_PER_LIBERTY_CASH;
    const totalUsdValue = totalLbcEarned / LBC_TOKENS_PER_LIBERTY_CASH;
    const cumulativeUsdValue = cumulativeBalanceLbc / LBC_TOKENS_PER_LIBERTY_CASH;
    const compoundBonusUsd = compoundBonusLbc / LBC_TOKENS_PER_LIBERTY_CASH;

    // Fractional Asset Equivalents
    const spyShares = totalUsdValue / 520; // S&P 500 ETF
    const goldGrams = totalUsdValue / 72;  // Grams of Physical Gold
    const cleanEnergyTokens = totalUsdValue / 25; // Regional Solar Equity

    return {
      dailyLbcEarned,
      dailyUsdEarned,
      baseLbcEarned,
      compoundBonusLbc,
      totalLbcEarned,
      cumulativeBalanceLbc,
      totalLibertyCashEarned,
      totalUsdValue,
      cumulativeUsdValue,
      compoundBonusUsd,
      spyShares,
      goldGrams,
      cleanEnergyTokens,
    };
  }, [dailyLbcEarned, currentDays, apyRate, currentBalanceLbc]);

  return (
    <div
      id="lbc-growth-projection-widget"
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 text-xs"
    >
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Liberté Cash Growth Projection
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 text-[10px] font-bold font-mono">
                167 LBC = $1.00 USD
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Calculate sovereign capital accumulation and compound returns from your daily transaction flow.
            </p>
          </div>
        </div>

        {/* Persona Segmented Filter */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
          {(['driver', 'merchant', 'customer', 'custom'] as const).map((p) => {
            const Icon = personaDefaults[p].icon;
            return (
              <button
                key={p}
                id={`btn-proj-role-${p}`}
                type="button"
                onClick={() => handleSelectPersona(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize flex items-center gap-1 transition cursor-pointer ${
                  persona === p
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="capitalize">{p}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Encouragement Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-900 border border-amber-400/25 rounded-xl p-3 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed text-neutral-300">
          <span className="font-bold text-white block">Financial Freedom Through Productive Equity:</span>
          Unlike traditional platforms where transaction fees vanish into corporate margins, Liberté Cash rewards you with real ownership equity on every ride and order. Every token earned at the guaranteed 167 LBC / $1.00 USD baseline becomes working capital for your family's future.
        </div>
      </div>

      {/* Interactive Sliders & Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
        {/* Daily Transactions */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span className="font-semibold text-neutral-300">Average Daily Transactions:</span>
            <span className="text-amber-400 font-bold font-mono">{dailyTx} tx / day</span>
          </div>
          <input
            id="slider-proj-daily-tx"
            type="range"
            min={1}
            max={50}
            value={dailyTx}
            onChange={(e) => {
              setDailyTx(Number(e.target.value));
              setPersona('custom');
            }}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>1 tx</span>
            <span>25 tx</span>
            <span>50 tx</span>
          </div>
        </div>

        {/* LBC per Transaction */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span className="font-semibold text-neutral-300">Average LBC per Transaction:</span>
            <span className="text-amber-400 font-bold font-mono">{lbcPerTx} LBC</span>
          </div>
          <input
            id="slider-proj-lbc-tx"
            type="range"
            min={5}
            max={100}
            step={5}
            value={lbcPerTx}
            onChange={(e) => {
              setLbcPerTx(Number(e.target.value));
              setPersona('custom');
            }}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>5 LBC</span>
            <span>50 LBC</span>
            <span>100 LBC</span>
          </div>
        </div>

        {/* Staking Yield Mode */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <span className="font-semibold text-neutral-300 text-[11px] block">
            Staking &amp; Compounding APY:
          </span>
          <div className="grid grid-cols-3 gap-1">
            <button
              id="btn-yield-none"
              type="button"
              onClick={() => setYieldMode('none')}
              className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                yieldMode === 'none'
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
            >
              0% (Cash)
            </button>
            <button
              id="btn-yield-treasury"
              type="button"
              onClick={() => setYieldMode('treasury')}
              className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                yieldMode === 'treasury'
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
            >
              5.2% APY
            </button>
            <button
              id="btn-yield-fleet"
              type="button"
              onClick={() => setYieldMode('fleet_dividend')}
              className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                yieldMode === 'fleet_dividend'
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800'
              }`}
            >
              14.2% Fleet
            </button>
          </div>
          <div className="text-[10px] text-neutral-400 truncate">
            {yieldMode === 'none' ? 'No interest accrued' : yieldMode === 'treasury' ? 'Auto-compounding treasury' : 'Decentralized fleet dividend share'}
          </div>
        </div>
      </div>

      {/* Timeframe Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-semibold text-neutral-400 shrink-0">Timeframe:</span>
        <div className="flex gap-1.5">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.key}
              id={`btn-proj-timeframe-${t.key}`}
              type="button"
              onClick={() => setSelectedTimeframe(t.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedTimeframe === t.key
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Projection Results Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Daily Run-Rate */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Daily Run-Rate</span>
            <Coins className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {projection.dailyLbcEarned.toLocaleString()} LBC
          </div>
          <div className="text-[11px] text-amber-400 font-mono font-medium">
            ≈ ${projection.dailyUsdEarned.toFixed(2)} USD / day
          </div>
        </div>

        {/* Total Projected LBC */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Total Projected LBC</span>
            <Zap className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {Math.round(projection.totalLbcEarned).toLocaleString()} LBC
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            {projection.compoundBonusLbc > 0 ? (
              <span className="text-emerald-300">+{Math.round(projection.compoundBonusLbc).toLocaleString()} LBC yield</span>
            ) : (
              <span>100% Base volume</span>
            )}
          </div>
        </div>

        {/* Liberty Cash & USD Valuation */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>USD Dollar Equivalent</span>
            <DollarSign className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-400 font-mono">
            ${projection.totalUsdValue.toFixed(2)} USD
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            {projection.totalLibertyCashEarned.toFixed(2)} Liberty Cash
          </div>
        </div>

        {/* Portfolio Cumulative Total */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>With Current Stash</span>
            <ShieldCheck className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            ${projection.cumulativeUsdValue.toFixed(2)} USD
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            {Math.round(projection.cumulativeBalanceLbc).toLocaleString()} LBC total
          </div>
        </div>
      </div>

      {/* Fractional Asset Holdings Potential */}
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <PieChart className="w-3.5 h-3.5 text-amber-400" />
            <span>Brokerage Asset Purchasing Power ({selectedTimeframe} Horizon)</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            Exchange Rate: 167 LBC = $1.00 USD
          </span>
        </div>

        <p className="text-[11px] text-neutral-300 leading-relaxed">
          Through the SEC-registered custodial brokerage partner, your projected <strong>${projection.totalUsdValue.toFixed(2)} USD</strong> earnings can be converted into any of the following fractional investments without custodial lockup:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">S&amp;P 500 Index</span>
              <span className="text-[10px] text-neutral-400 font-sans">SPY ETF Holdings</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-amber-400">{projection.spyShares.toFixed(3)}</span>
              <span className="text-[10px] text-neutral-400 block font-sans">Shares</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Physical Gold</span>
              <span className="text-[10px] text-neutral-400 font-sans">GLD Trust Equivalent</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-amber-300">{projection.goldGrams.toFixed(2)}</span>
              <span className="text-[10px] text-neutral-400 block font-sans">Grams</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Caribbean Solar</span>
              <span className="text-[10px] text-neutral-400 font-sans">Renewable Micro-grid</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-400">{projection.cleanEnergyTokens.toFixed(1)}</span>
              <span className="text-[10px] text-neutral-400 block font-sans">Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer & Speech Helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span>Calculated at fixed 167 LBC / USD peg with local $0.50 minimum purchasing power guarantee.</span>
        </div>

        <div className="flex items-center gap-2">
          {onPlaySpeech && (
            <button
              id="btn-proj-speech"
              type="button"
              onClick={() => {
                onPlaySpeech(
                  `Nan ${selectedTimeframe === '1yr' ? 'yon lane' : selectedTimeframe}, ak ${dailyTx} kòmand pa jou, ou ka akimile anviwon ${Math.round(projection.totalLbcEarned)} Liberté Cash, ki egal a ${projection.totalUsdValue.toFixed(2)} dola ameriken sou baz to 167 pou 1.`
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Vwa / Listen</span>
            </button>
          )}

          {onApplyGoalToTransfer && (
            <button
              id="btn-proj-apply-transfer"
              type="button"
              onClick={() => onApplyGoalToTransfer(Math.min(currentBalanceLbc, Math.round(projection.dailyLbcEarned * 7)))}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span>Set Weekly Goal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

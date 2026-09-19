import React, { useState } from 'react';
import {
  Star,
  Award,
  Zap,
  CheckCircle2,
  TrendingUp,
  Coins,
  ShieldCheck,
  Bike,
  Smartphone,
  Store,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  MessageSquare,
  ThumbsUp,
  Users,
  ChevronDown,
  RefreshCw,
  Gift
} from 'lucide-react';
import {
  MarketplaceSide,
  TripartiteRatingRecord,
  ParticipantPerformanceMetric,
  LbcTransaction
} from '../types/architecture';
import {
  INITIAL_3WAY_RATINGS,
  INITIAL_PERFORMANCE_METRICS,
  LBC_USD_PEG_RATE
} from '../data/lbcBrokerageData';

interface ThreeWayRatingPerformanceViewProps {
  onAwardBonusLbc?: (
    participantId: string,
    participantName: string,
    role: MarketplaceSide,
    bonusAmountLbc: number,
    reason: string
  ) => void;
  onPlaySpeech?: (text: string) => void;
}

export const ThreeWayRatingPerformanceView: React.FC<ThreeWayRatingPerformanceViewProps> = ({
  onAwardBonusLbc,
  onPlaySpeech
}) => {
  // Ratings and Metrics State
  const [ratings, setRatings] = useState<TripartiteRatingRecord[]>(INITIAL_3WAY_RATINGS);
  const [metrics, setMetrics] = useState<ParticipantPerformanceMetric[]>(INITIAL_PERFORMANCE_METRICS);
  
  // Role Filter for Ratings and Leaderboard
  const [roleFilter, setRoleFilter] = useState<'all' | 'driver' | 'customer' | 'merchant'>('all');
  
  // Interactive Rating Submission Modal/Form State
  const [isRatingFormOpen, setIsRatingFormOpen] = useState(false);
  const [ratingFromRole, setRatingFromRole] = useState<MarketplaceSide>('customer');
  const [ratingFromName, setRatingFromName] = useState('Fabienne Voltaire');
  const [ratingToRole, setRatingToRole] = useState<MarketplaceSide>('driver');
  const [ratingToName, setRatingToName] = useState('Jean-Baptiste Moïse');
  const [ratingOrderId, setRatingOrderId] = useState('ord-3s-103');
  const [stars, setStars] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [quality, setQuality] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Automated Distribution Simulation State
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionLogs, setDistributionLogs] = useState<{
    id: string;
    timestamp: string;
    recipientName: string;
    role: MarketplaceSide;
    bonusLbc: number;
    metricNote: string;
  }[]>([]);

  // Calculate dynamic summary stats
  const totalRatingsCount = ratings.length;
  const avgSystemRating = (
    ratings.reduce((acc, r) => acc + r.overallStars, 0) / (totalRatingsCount || 1)
  ).toFixed(2);
  const totalBonusLbcDistributed = metrics.reduce((acc, m) => acc + m.bonusLbcDistributed, 0);

  // Handle Interactive Rating Submission
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);

    // Calculate automatic bonus LBC based on exceptional rating
    let earnedBonusLbc = 0;
    if (stars === 5) {
      earnedBonusLbc = 15; // 5-star performance bonus
    } else if (stars === 4) {
      earnedBonusLbc = 5;
    }

    setTimeout(() => {
      const newRating: TripartiteRatingRecord = {
        id: `rate-3w-${Date.now()}`,
        orderId: ratingOrderId || `ord-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: 'Just now',
        fromRole: ratingFromRole,
        fromName: ratingFromName,
        toRole: ratingToRole,
        toName: ratingToName,
        overallStars: stars,
        punctualityScore: punctuality,
        communicationScore: communication,
        reliabilityOrQualityScore: quality,
        comment: comment || 'Smooth coordination, high professionalism and friendly spirit!',
        bonusLbcAwarded: earnedBonusLbc
      };

      setRatings((prev) => [newRating, ...prev]);

      // Update recipient's performance metric
      setMetrics((prev) =>
        prev.map((item) => {
          if (item.name.toLowerCase().includes(ratingToName.toLowerCase()) || item.role === ratingToRole) {
            const updatedOrders = item.totalTripsOrOrders + 1;
            const newAvg = parseFloat(((item.ratingAverage * item.totalTripsOrOrders + stars) / updatedOrders).toFixed(2));
            const newBonus = item.bonusLbcDistributed + earnedBonusLbc;
            return {
              ...item,
              ratingAverage: newAvg,
              totalTripsOrOrders: updatedOrders,
              bonusLbcDistributed: newBonus
            };
          }
          return item;
        })
      );

      // Trigger parent callback if provided
      if (onAwardBonusLbc && earnedBonusLbc > 0) {
        onAwardBonusLbc(
          `id-${ratingToRole}`,
          ratingToName,
          ratingToRole,
          earnedBonusLbc,
          `5-Star 3-Way Rating Bonus from ${ratingFromName}`
        );
      }

      setIsSubmittingRating(false);
      setIsRatingFormOpen(false);
      setComment('');
      setSuccessBanner(
        `Rating submitted! Automatically credited +${earnedBonusLbc} LBC ($${(earnedBonusLbc * LBC_USD_PEG_RATE).toFixed(2)} USD) to ${ratingToName} for high performance.`
      );

      setTimeout(() => setSuccessBanner(null), 6000);
    }, 450);
  };

  // Automated Distribution of Weekly Bonus LBC to Top Performers
  const handleAutoDistributeBonuses = () => {
    setIsDistributing(true);
    setTimeout(() => {
      const newLogs: typeof distributionLogs = [];

      setMetrics((prev) =>
        prev.map((item) => {
          let bonus = 0;
          let note = '';
          if (item.role === 'driver') {
            bonus = 50; // Driver efficiency bonus
            note = 'Efficiency award: 98.8% on-time delivery rate & helmet safety record';
          } else if (item.role === 'merchant') {
            bonus = 40; // Fulfillment speed bonus
            note = 'Speed award: 7.8 min average kitchen dispatch & zero missing items';
          } else {
            bonus = 25; // Customer reliability bonus
            note = 'Reliability award: 99.5% punctual curbside pickup & zero cancellations';
          }

          newLogs.push({
            id: `dist-${Date.now()}-${item.id}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recipientName: item.name,
            role: item.role,
            bonusLbc: bonus,
            metricNote: note
          });

          if (onAwardBonusLbc) {
            onAwardBonusLbc(item.id, item.name, item.role, bonus, note);
          }

          return {
            ...item,
            bonusLbcDistributed: item.bonusLbcDistributed + bonus,
            streakWeeks: item.streakWeeks + 1
          };
        })
      );

      setDistributionLogs((prev) => [...newLogs, ...prev]);
      setIsDistributing(false);
      setSuccessBanner(
        'Automated LBC Distribution Complete! Top-rated Driver (+50 LBC), Merchant (+40 LBC), and Customer (+25 LBC) credited directly to their treasury-backed wallets.'
      );
      setTimeout(() => setSuccessBanner(null), 7000);
    }, 700);
  };

  const filteredRatings =
    roleFilter === 'all'
      ? ratings
      : ratings.filter((r) => r.toRole === roleFilter || r.fromRole === roleFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner: Financial Freedom & 3-Way Ecosystem Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>3-Way Mutual Accountability & Liberté Cash Growth</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Tripartite Rating & Performance Engine</span>
              <span className="text-xs bg-amber-400 text-neutral-950 font-bold px-2.5 py-0.5 rounded-full">
                Auto-Bonus LBC
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-3xl leading-relaxed">
              In our decentralized community, <strong>Drivers, Customers, and Merchants</strong> evaluate each other with total transparency. High performance builds your reputation and automatically earns <strong>Liberté Cash (LBC)</strong>—giving you an asset backed 1:1 by treasury reserves that generates yield and compounds into fractional stocks and local wealth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="open-rating-form-btn"
              onClick={() => setIsRatingFormOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
            >
              <Star className="w-4 h-4 fill-neutral-950 text-neutral-950" />
              <span>Submit 3-Way Rating</span>
            </button>

            <button
              id="distribute-bonuses-btn"
              onClick={handleAutoDistributeBonuses}
              disabled={isDistributing}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl shadow flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Gift className={`w-4 h-4 text-amber-400 ${isDistributing ? 'animate-spin' : ''}`} />
              <span>{isDistributing ? 'Distributing...' : 'Distribute Weekly Bonus LBC'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80 text-xs">
          <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-xl">
            <div className="text-neutral-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Active 3-Way Reviews</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{totalRatingsCount} Records</div>
            <div className="text-[10px] text-emerald-400">Driver ↔ Customer ↔ Merchant</div>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-xl">
            <div className="text-neutral-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Ecosystem Average</span>
            </div>
            <div className="text-lg font-black text-amber-400 mt-1">{avgSystemRating} / 5.0</div>
            <div className="text-[10px] text-neutral-400">High trust community standard</div>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-xl">
            <div className="text-neutral-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Bonus LBC Distributed</span>
            </div>
            <div className="text-lg font-black text-amber-400 mt-1">{totalBonusLbcDistributed.toLocaleString()} LBC</div>
            <div className="text-[10px] text-emerald-400 font-semibold">
              +${(totalBonusLbcDistributed * LBC_USD_PEG_RATE).toFixed(2)} USD Collateral Value
            </div>
          </div>

          <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-xl">
            <div className="text-neutral-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Treasury Yield Rate</span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1">5.2% APY</div>
            <div className="text-[10px] text-neutral-400">Daily compounding freedom</div>
          </div>
        </div>
      </div>

      {/* Success Banner Notification */}
      {successBanner && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {/* 3 Key Operational Performance Categories (Driver, Customer, Merchant) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Top-Tier Participant Operational Metrics & Automatic Bonuses</span>
          </h3>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Rankings refresh dynamically with every verified order
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const roleColor =
              metric.role === 'driver'
                ? 'from-blue-950/50 to-neutral-900 border-blue-600/40 text-blue-400'
                : metric.role === 'customer'
                ? 'from-purple-950/50 to-neutral-900 border-purple-600/40 text-purple-400'
                : 'from-amber-950/50 to-neutral-900 border-amber-600/40 text-amber-400';

            const roleBadge =
              metric.role === 'driver' ? 'Driver Partner' : metric.role === 'customer' ? 'Customer' : 'Merchant Partner';

            return (
              <div
                key={metric.id}
                className={`bg-gradient-to-b ${roleColor} border rounded-2xl p-5 shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
                        {metric.avatarIcon}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">{metric.name}</div>
                        <div className="text-[11px] font-semibold opacity-90">{roleBadge}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-400 text-neutral-950 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {metric.tierBadge}
                    </span>
                  </div>

                  {/* Core Operational Metric */}
                  <div className="bg-neutral-950/60 border border-neutral-800/80 p-3 rounded-xl mb-3">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                      Key Operational Metric
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">{metric.metricLabel}</div>
                    <div className="text-base font-extrabold text-amber-400 font-mono mt-1">
                      {metric.metricValue}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-neutral-950/40 p-2 rounded-lg border border-neutral-800">
                      <div className="text-[10px] text-neutral-400">Rating Avg</div>
                      <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{metric.ratingAverage}</span>
                      </div>
                    </div>

                    <div className="bg-neutral-950/40 p-2 rounded-lg border border-neutral-800">
                      <div className="text-[10px] text-neutral-400">5-Star Streak</div>
                      <div className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{metric.streakWeeks} Weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Warm Financial Freedom Note */}
                  <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl text-xs text-neutral-300 leading-relaxed mb-4">
                    <span className="text-amber-400 font-bold block mb-1">Financial Freedom Growth:</span>
                    {metric.financialFreedomSummary}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/70 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-400">Bonus LBC Earned:</div>
                    <div className="font-bold text-amber-400 text-sm">
                      +{metric.bonusLbcDistributed} LBC{' '}
                      <span className="text-[10px] text-neutral-400 font-normal">
                        (${ (metric.bonusLbcDistributed * LBC_USD_PEG_RATE).toFixed(2) } USD)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onPlaySpeech) {
                        onPlaySpeech(
                          `Felisitasyon a ${metric.name}. Ou gen ${metric.ratingAverage} zetwal ak ${metric.bonusLbcDistributed} Liberté Cash.`
                        );
                      }
                    }}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-medium transition"
                  >
                    Audio Praise
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 3-Way Rating Modal Dialog */}
      {isRatingFormOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-base font-bold text-white">Submit 3-Way Tripartite Rating</h3>
              </div>
              <button
                onClick={() => setIsRatingFormOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4 text-xs">
              {/* Evaluator (From Role) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">I Am Rating As:</label>
                  <select
                    value={ratingFromRole}
                    onChange={(e) => {
                      const role = e.target.value as MarketplaceSide;
                      setRatingFromRole(role);
                      if (role === 'customer') {
                        setRatingFromName('Fabienne Voltaire');
                        setRatingToRole('driver');
                        setRatingToName('Jean-Baptiste Moïse');
                      } else if (role === 'driver') {
                        setRatingFromName('Jean-Baptiste Moïse');
                        setRatingToRole('merchant');
                        setRatingToName('Chef Fifi (Chez Fifi Resto)');
                      } else {
                        setRatingFromName('Chef Fifi (Chez Fifi Resto)');
                        setRatingToRole('driver');
                        setRatingToName('Jean-Baptiste Moïse');
                      }
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
                  >
                    <option value="customer">Customer (Fabienne)</option>
                    <option value="driver">Driver (Jean-Baptiste)</option>
                    <option value="merchant">Merchant (Chef Fifi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Target Participant:</label>
                  <select
                    value={ratingToRole}
                    onChange={(e) => {
                      const role = e.target.value as MarketplaceSide;
                      setRatingToRole(role);
                      if (role === 'driver') setRatingToName('Jean-Baptiste Moïse');
                      else if (role === 'merchant') setRatingToName('Chef Fifi (Chez Fifi Resto)');
                      else setRatingToName('Fabienne Voltaire');
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
                  >
                    {ratingFromRole !== 'driver' && <option value="driver">Driver: Jean-Baptiste</option>}
                    {ratingFromRole !== 'merchant' && <option value="merchant">Merchant: Chez Fifi</option>}
                    {ratingFromRole !== 'customer' && <option value="customer">Customer: Fabienne</option>}
                  </select>
                </div>
              </div>

              {/* Order Reference */}
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Order / Trip Reference:</label>
                <input
                  type="text"
                  value={ratingOrderId}
                  onChange={(e) => setRatingOrderId(e.target.value)}
                  placeholder="e.g. ord-3s-101"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">
                  Overall Rating ({stars} Stars = +{stars === 5 ? 15 : stars === 4 ? 5 : 0} LBC Bonus):
                </label>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStars(s)}
                      className={`p-2 rounded-xl transition ${
                        s <= stars ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${s <= stars ? 'fill-neutral-950' : ''}`} />
                    </button>
                  ))}
                  <span className="text-xs text-amber-400 font-bold ml-2">
                    {stars === 5 ? 'Exceptional (Max LBC Bonus)' : stars >= 4 ? 'Great Service' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Specific Operational Metric Scores */}
              <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Punctuality (1-5)</label>
                  <select
                    value={punctuality}
                    onChange={(e) => setPunctuality(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-white font-bold"
                  >
                    <option value={5}>5 - Immediate</option>
                    <option value={4}>4 - Prompt</option>
                    <option value={3}>3 - Acceptable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Communication (1-5)</label>
                  <select
                    value={communication}
                    onChange={(e) => setCommunication(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-white font-bold"
                  >
                    <option value={5}>5 - Clear & Courteous</option>
                    <option value={4}>4 - Polite</option>
                    <option value={3}>3 - Minimal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Quality & Care (1-5)</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-white font-bold"
                  >
                    <option value={5}>5 - Sealed & Safe</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Standard</option>
                  </select>
                </div>
              </div>

              {/* Feedback Comment */}
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Constructive Feedback / Praise:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on helmet safety, rapid food dispatch, or courteous curbside greeting..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                Giving genuine 5-star reviews empowers your community peers with instant bonus <strong>Liberté Cash</strong>, fueling their path toward asset ownership and long-term financial independence.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRatingFormOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingRating ? 'Recording...' : 'Submit & Award LBC'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3-Way Ratings Feed & Operational Audit Trail */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Real-Time 3-Way Mutual Ratings & Feedback Ledger</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Verified tripartite feedback across Passenger Rides, Food Orders, and Express Deliveries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Filter:</span>
            <div className="flex bg-neutral-950 p-0.5 rounded-xl border border-neutral-800 text-xs">
              {(['all', 'driver', 'customer', 'merchant'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRoleFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                    roleFilter === tab
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

        {/* Rating Cards */}
        <div className="space-y-3">
          {filteredRatings.map((r) => {
            return (
              <div
                key={r.id}
                className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 hover:border-neutral-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-bold text-white">{r.fromName}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-neutral-800 text-neutral-300">
                      {r.fromRole}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="font-bold text-amber-400">{r.toName}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {r.toRole}
                    </span>
                    <span className="text-neutral-500 text-[11px]">({r.orderId})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.overallStars ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    {r.bonusLbcAwarded && r.bonusLbcAwarded > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Coins className="w-3 h-3 text-emerald-400" />
                        +{r.bonusLbcAwarded} LBC
                      </span>
                    )}
                    <span className="text-[11px] text-neutral-500">{r.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 italic mb-2.5">"{r.comment}"</p>

                <div className="flex items-center gap-4 text-[10px] text-neutral-400 pt-2 border-t border-neutral-900">
                  <span>Punctuality: <strong className="text-neutral-200">{r.punctualityScore}/5</strong></span>
                  <span>Communication: <strong className="text-neutral-200">{r.communicationScore}/5</strong></span>
                  <span>Care & Quality: <strong className="text-neutral-200">{r.reliabilityOrQualityScore}/5</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Bonus Distribution Audit Feed */}
      {distributionLogs.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Latest Automated Bonus LBC Distribution Cycles</span>
          </div>

          <div className="divide-y divide-neutral-800 text-xs">
            {distributionLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">{log.recipientName}</span>
                    <span className="text-neutral-400 ml-1.5 capitalize">({log.role})</span>
                    <div className="text-[11px] text-neutral-400 font-sans mt-0.5">{log.metricNote}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-emerald-400 font-bold">+{log.bonusLbc} LBC</div>
                  <div className="text-[10px] text-neutral-500">{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

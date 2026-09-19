import React, { useState, useEffect } from 'react';
import {
  Bike,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  Phone,
  User,
  Volume2,
  Navigation,
  AlertCircle,
  Car,
  Layers,
  KeyRound,
  Lock,
  MessageSquare,
  ShieldAlert,
  Smartphone,
  Banknote,
  Send,
  Calculator,
  TrendingUp,
  Coins,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Compass,
  Zap,
  ArrowRight,
  XCircle,
  AlertTriangle,
  X,
  Star,
  ThumbsUp,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  Flame
} from 'lucide-react';
import { RegionId, LanguageCode, ActiveOrder } from '../types/architecture';
import { REGIONS, MOCK_DRIVERS, INITIAL_ACTIVE_ORDERS } from '../data/mockData';
import { OPERATIONAL_COUNTRIES, VEHICLE_CLASSES, calculateDynamicFare, COUNTRY_LOOKUP } from '../data/internationalData';
import { translations } from '../data/translations';
import { LiveRouteMap } from './LiveRouteMap';
import { FloatingSOSButton } from './FloatingSOSButton';
import { CustomerLbcWalletQuickWidget } from './CustomerLbcWalletQuickWidget';
import { BrokerageIntegrationOverlay } from './BrokerageIntegrationOverlay';
import { RideDemandHeatMap } from './RideDemandHeatMap';
import { TippingModule, TipSubmission } from './TippingModule';
import { VehicleClass } from '../types/internationalScope';

interface CustomerInterfaceProps {
  region: RegionId;
  language: LanguageCode;
  networkMode: 'online' | 'edge' | 'offline';
  onPlaySpeech: (text: string) => void;
}

export const CustomerInterface: React.FC<CustomerInterfaceProps> = ({
  region,
  language,
  networkMode,
  onPlaySpeech,
}) => {
  const t = translations[language] || translations.en;
  const currentRegion = REGIONS[region];

  // International country mapping (default to HT for haiti, GF for french_guiana, GY for guyana, SR for suriname)
  const defaultCountryCode =
    region === 'haiti' ? 'HT' : region === 'french_guiana' ? 'GF' : region === 'guyana' ? 'GY' : 'SR';
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(defaultCountryCode);
  const selectedCountry = COUNTRY_LOOKUP[selectedCountryCode] || COUNTRY_LOOKUP['HT'];
  const isExcluded = selectedCountry.isStrictlyExcluded;

  // Synchronize country selection whenever the top-level region selector updates
  useEffect(() => {
    const code = region === 'haiti' ? 'HT' : region === 'french_guiana' ? 'GF' : region === 'guyana' ? 'GY' : 'SR';
    setSelectedCountryCode(code);
  }, [region]);

  const [serviceType, setServiceType] = useState<'ride' | 'package'>('ride');
  const [selectedVehicleClass, setSelectedVehicleClass] = useState<VehicleClass>('2_wheeler');

  const [pickupLandmark, setPickupLandmark] = useState(
    region === 'haiti'
      ? 'Delmas 33, devan Famasi Nouvelle Génération'
      : region === 'french_guiana'
      ? 'Cayenne, Rond-Point du Vieux Port'
      : region === 'guyana'
      ? 'Georgetown, near Stabroek Market Clock'
      : 'Paramaribo, Jozef Israëlstraat Blauwgrond'
  );
  const [dropoffLandmark, setDropoffLandmark] = useState(
    region === 'haiti'
      ? 'Pétion-Ville, akote Otèl Kinam'
      : region === 'french_guiana'
      ? 'Rémire-Montjoly, Cité Médan'
      : region === 'guyana'
      ? 'Kitty, Alexander Street corner'
      : 'Waterkant, dichtbij Steiger'
  );

  const [paymentMethodId, setPaymentMethodId] = useState<string>('local_mobile_money');
  // Default to 'form' so customer immediately sees the Ride Cost Estimator before requesting a ride
  const [bookingStep, setBookingStep] = useState<'form' | 'searching' | 'active' | 'rating'>('form');
  const [activeOrder, setActiveOrder] = useState<ActiveOrder>(INITIAL_ACTIVE_ORDERS[0]);

  // Ride Cost Estimator Interactive State
  const [estimatorDistance, setEstimatorDistance] = useState<number>(4.5);
  const [estimatorTraffic, setEstimatorTraffic] = useState<'normal' | 'moderate' | 'peak'>('normal');
  const [estimateApplied, setEstimateApplied] = useState<boolean>(false);

  // Security & Privacy Features
  const [passengerOTP, setPassengerOTP] = useState<string>('5281');
  const [showMaskingModal, setShowMaskingModal] = useState<boolean>(false);
  const [maskingType, setMaskingType] = useState<'call' | 'sms'>('call');
  const [maskedChatMessages, setMaskedChatMessages] = useState<
    { id: string; sender: 'passenger' | 'driver'; text: string; time: string }[]
  >([
    { id: '1', sender: 'driver', text: 'Bonjou! Mwen sou wout la, m ap rive nan 4 minit sou moto Yamaha a.', time: '12:10' },
    { id: '2', sender: 'passenger', text: 'Dakò, mwen devan famasi a ak yon chemiz ble.', time: '12:11' }
  ]);
  const [newChatInput, setNewChatInput] = useState<string>('');

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('driver_too_far');
  const [cancelCustomFeedback, setCancelCustomFeedback] = useState<string>('');
  const [cancelNotice, setCancelNotice] = useState<{ message: string; timestamp: string } | null>(null);

  // Post-Ride Driver Rating State
  const [driverRating, setDriverRating] = useState<number>(5);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [ratingFeedbackText, setRatingFeedbackText] = useState<string>('');
  const [selectedRatingTags, setSelectedRatingTags] = useState<string[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [driverTipPercentage, setDriverTipPercentage] = useState<number>(0);

  // Share Live Trip State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Demand Heat Map Modal / Inline State
  const [showDemandHeatMap, setShowDemandHeatMap] = useState<boolean>(false);

  // In-App Tipping Modal State (LBC token, Liberté Cash, or Fiat)
  const [showTippingModal, setShowTippingModal] = useState<boolean>(false);
  const [confirmedTip, setConfirmedTip] = useState<TipSubmission | null>(null);

  // Brokerage Full Overlay Modal State (accessible from Quick View widget)
  const [isBrokerageOverlayOpen, setIsBrokerageOverlayOpen] = useState<boolean>(false);

  // Calculate live dynamic fare quote for selected vehicle and country
  let fareQuote = null;
  if (!isExcluded) {
    try {
      fareQuote = calculateDynamicFare({
        countryCode: selectedCountryCode,
        vehicleClass: selectedVehicleClass,
        distanceKm: 5.2,
        durationMinutes: 16,
        requestedSurgeMultiplier: 1.2
      });
    } catch (e) {
      // Ignored for excluded territories
    }
  }

  // Calculate mock price range for Ride Cost Estimator based on current region's tariffs and distance
  let estimatorLowQuote = null;
  let estimatorHighQuote = null;
  if (!isExcluded) {
    try {
      const trafficLowMultiplier = estimatorTraffic === 'normal' ? 1.0 : estimatorTraffic === 'moderate' ? 1.15 : 1.30;
      const trafficHighMultiplier = Math.min(
        estimatorTraffic === 'normal' ? 1.18 : estimatorTraffic === 'moderate' ? 1.35 : 1.55,
        selectedCountry.surgeCapMultiplier || 2.5
      );

      estimatorLowQuote = calculateDynamicFare({
        countryCode: selectedCountryCode,
        vehicleClass: selectedVehicleClass,
        distanceKm: estimatorDistance,
        durationMinutes: Math.max(5, Math.round(estimatorDistance * 2.5)),
        requestedSurgeMultiplier: trafficLowMultiplier
      });

      estimatorHighQuote = calculateDynamicFare({
        countryCode: selectedCountryCode,
        vehicleClass: selectedVehicleClass,
        distanceKm: Math.round(estimatorDistance * 1.15 * 10) / 10,
        durationMinutes: Math.max(8, Math.round(estimatorDistance * 3.6)),
        requestedSurgeMultiplier: trafficHighMultiplier
      });
    } catch (e) {
      // Ignored for excluded territories
    }
  }

  const handlePlayEstimatorAudio = () => {
    if (!estimatorLowQuote || !estimatorHighQuote) return;
    const currencyName = selectedCountry.currencyCode;
    const speechText =
      language === 'ht'
        ? `Pri estimasyon pou yon kous moto ${estimatorDistance} kilomèt nan ${selectedCountry.name} se ant ${estimatorLowQuote.totalFareLocal} ak ${estimatorHighQuote.totalFareLocal} ${currencyName}.`
        : language === 'fr'
        ? `Le coût estimé pour une course moto de ${estimatorDistance} kilomètres en ${selectedCountry.name} est entre ${estimatorLowQuote.totalFareLocal} et ${estimatorHighQuote.totalFareLocal} ${currencyName}.`
        : `Estimated price range for a ${estimatorDistance} kilometer motorcycle ride in ${selectedCountry.name} is between ${estimatorLowQuote.totalFareLocal} and ${estimatorHighQuote.totalFareLocal} ${currencyName}.`;
    onPlaySpeech(speechText);
  };

  const handleApplyEstimate = () => {
    setEstimateApplied(true);
    setTimeout(() => setEstimateApplied(false), 2500);
  };

  const handleBook = () => {
    if (isExcluded) return;

    setBookingStep('searching');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setPassengerOTP(newOtp);

    onPlaySpeech(
      language === 'ht'
        ? `N ap chèche yon machin Wap pou ou kounye a nan ${selectedCountry.name}. Kòd sekirite ou se ${newOtp.split('').join(' ')}.`
        : `Recherche d’un chauffeur Wap en cours. Votre code de sécurité OTP est ${newOtp}.`
    );

    setTimeout(() => {
      setBookingStep('active');
      const assignedDriver = MOCK_DRIVERS.find((d) => d.region === region) || MOCK_DRIVERS[0];
      setActiveOrder((prev) => ({
        ...prev,
        trackingCode: `WAP-${selectedCountryCode}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: 'Daphnée Lamour',
        driver: assignedDriver,
        pickupLandmark,
        dropoffLandmark,
        fareAmount: fareQuote ? fareQuote.totalFareLocal : 350,
        currency: selectedCountry.currencyCode,
        status: 'in_transit'
      }));
    }, 1800);
  };

  const handleSendMaskedMessage = () => {
    if (!newChatInput.trim()) return;
    setMaskedChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'passenger',
        text: newChatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setNewChatInput('');
  };

  const handlePlayCancelWarningAudio = () => {
    onPlaySpeech(t.cancelAudioNotice);
  };

  const handleConfirmCancellation = () => {
    const reasonLabels: Record<string, string> = {
      driver_too_far: t.cancelReasonTooFar,
      change_of_plans: t.cancelReasonChangeOfPlans,
      wrong_location: t.cancelReasonWrongLocation,
      safety_concern: t.cancelReasonSafetyConcern,
      mistake: t.cancelReasonMistake
    };
    const chosenReason = reasonLabels[cancelReason] || t.cancelReasonChangeOfPlans;

    // Mark active order status as cancelled
    setActiveOrder((prev) => ({
      ...prev,
      status: 'cancelled'
    }));

    // Reset customer back to booking form view
    setBookingStep('form');
    setShowCancelModal(false);

    // Set cancellation feedback banner
    setCancelNotice({
      message: `${t.rideCancelledSuccess} (${chosenReason})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Provide immediate auditory confirmation
    onPlaySpeech(t.rideCancelledSuccess);
  };

  const handleToggleRatingTag = (tagId: string) => {
    setSelectedRatingTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmitRating = () => {
    setRatingSubmitted(true);
    // Update active order to reflect completed status with rating
    setActiveOrder((prev) => ({
      ...prev,
      status: 'completed',
      customerRating: driverRating,
      customerFeedback: ratingFeedbackText
    }));

    // Award LBC ride completion reward rebate (+15 LBC) to customer wallet
    fetch('/api/lbc/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'customer_fabienne',
        userType: 'customer',
        amountLbc: 15,
        activityType: 'ride_completed',
        activityReferenceId: activeOrder.trackingCode || 'ord-3s-103',
        note: `Ride completed customer reward rebate (+15 LBC)`
      })
    }).catch(() => {});

    onPlaySpeech(t.ratingSubmittedSuccess);
  };

  const handleFinishRatingFlow = () => {
    setBookingStep('form');
    setRatingSubmitted(false);
    setRatingFeedbackText('');
    setSelectedRatingTags([]);
    setDriverRating(5);
  };

  const getTrackingUrl = () => {
    const tripCode = activeOrder.trackingCode || `WAP-${selectedCountryCode}-8921`;
    return `https://wap.app/track/live?trip=${tripCode}&token=sec_984f2&ref=passenger_share`;
  };

  const handleOpenShareModal = () => {
    setShowShareModal(true);
    setShareCopied(false);
    onPlaySpeech(`${t.shareTripModalTitle}. ${t.shareTripSubtitle}`);
  };

  const handleCopyTrackingLink = async () => {
    const url = getTrackingUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch (e) {
      // fallback
    }
    setShareCopied(true);
    onPlaySpeech(t.shareTripLinkCopied);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const url = getTrackingUrl();
    const driverName = activeOrder.driver?.fullName || 'Wap Driver';
    const plate = activeOrder.driver?.plateNumber || 'WAP-894';
    const msg = encodeURIComponent(
      `🏍️ Wap Live Trip: ${activeOrder.pickupLandmark} ➔ ${activeOrder.dropoffLandmark}. Chauffeur: ${driverName} (${plate}). Swiv wout mwen an dirèk sou lyen sa a: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleShareSMS = () => {
    const url = getTrackingUrl();
    const driverName = activeOrder.driver?.fullName || 'Wap Driver';
    const msg = encodeURIComponent(
      `Wap Live Trip: Following route with ${driverName}. Track live here: ${url}`
    );
    window.location.href = `sms:?body=${msg}`;
  };

  const handleNativeShare = async () => {
    const url = getTrackingUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wap Live Trip Tracking',
          text: `Follow my real-time ride with ${activeOrder.driver?.fullName || 'Wap Driver'}:`,
          url: url
        });
      } catch (err) {
        handleCopyTrackingLink();
      }
    } else {
      handleCopyTrackingLink();
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl max-w-2xl mx-auto relative">
      {/* Privacy Masking Modal */}
      {showMaskingModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">In-App Number Masking Shield</h3>
                  <p className="text-[10px] text-neutral-400">Your personal phone number is 100% hidden</p>
                </div>
              </div>
              <button
                onClick={() => setShowMaskingModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
              >
                ✕ Close
              </button>
            </div>

            {/* Virtual Masking Details */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Encrypted Bridge Proxy:</span>
                <span className="font-mono text-emerald-400 font-bold">+1 (800) 927-6686</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Dynamic Session Extension:</span>
                <span className="font-mono text-amber-400 font-bold">#4819 (Active)</span>
              </div>
              <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-900">
                Calls and texts route through a secure Twilio proxy bridge. Expires 15 min after trip completion.
              </div>
            </div>

            {/* Virtual Masked Messaging Stream */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Masked In-App Chat Session</span>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 h-40 overflow-y-auto space-y-2 text-xs">
                {maskedChatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded-lg max-w-[85%] text-xs ${
                      m.sender === 'passenger'
                        ? 'ml-auto bg-amber-400 text-neutral-950 font-medium'
                        : 'bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    <div className="text-[9px] opacity-70 mb-0.5">
                      {m.sender === 'passenger' ? 'You (Masked)' : 'Driver (Masked)'} • {m.time}
                    </div>
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChatInput}
                  onChange={(e) => setNewChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMaskedMessage()}
                  placeholder="Type an encrypted message..."
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSendMaskedMessage}
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Ride Confirmation Modal */}
      {showCancelModal && (
        <div
          id="cancel-ride-modal-overlay"
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-ride-modal-title"
        >
          <div
            id="cancel-ride-confirmation-modal"
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cancel-ride-modal-title" className="text-base font-bold text-white leading-snug">
                    {t.cancelRideConfirmationTitle}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    {t.cancelRideWarning}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePlayCancelWarningAudio}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 transition"
                  title={t.voicePrompt}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition text-xs"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Driver Transit Summary Card */}
            {activeOrder.driver && (
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 text-amber-400 font-bold flex items-center justify-center text-xs">
                    {activeOrder.driver.fullName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{activeOrder.driver.fullName}</span>
                      <span className="text-[10px] text-amber-300">★ {activeOrder.driver.rating}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {activeOrder.driver.motorcycleModel} • <span className="font-mono text-neutral-300">{activeOrder.driver.plateNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-400/10 border border-amber-400/30 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    {t.cancelRideDriverEnRoute}
                  </span>
                </div>
              </div>
            )}

            {/* Safety & Policy Notice Box */}
            <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                  Wap Fair Dispatch & Driver Protection Policy
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {t.cancelRidePolicyNotice}
                </p>
              </div>
            </div>

            {/* Localized Reason Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                {t.cancelReasonPrompt}
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {[
                  { id: 'driver_too_far', label: t.cancelReasonTooFar },
                  { id: 'change_of_plans', label: t.cancelReasonChangeOfPlans },
                  { id: 'wrong_location', label: t.cancelReasonWrongLocation },
                  { id: 'safety_concern', label: t.cancelReasonSafetyConcern },
                  { id: 'mistake', label: t.cancelReasonMistake }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCancelReason(item.id)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                      cancelReason === item.id
                        ? 'bg-amber-400/10 border-amber-400 text-white font-medium'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <span className="flex-1 pr-2">{item.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        cancelReason === item.id
                          ? 'border-amber-400 bg-amber-400 text-neutral-950'
                          : 'border-neutral-700 bg-neutral-900'
                      }`}
                    >
                      {cancelReason === item.id && <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                    </span>
                  </button>
                ))}
              </div>

              {/* Optional Custom Note */}
              <input
                type="text"
                value={cancelCustomFeedback}
                onChange={(e) => setCancelCustomFeedback(e.target.value)}
                placeholder="Optional clarification for dispatch support..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 mt-1"
              />
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-800">
              <button
                id="btn-keep-ride"
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t.keepRide}</span>
              </button>

              <button
                id="btn-confirm-cancel-ride"
                type="button"
                onClick={handleConfirmCancellation}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 border border-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{t.confirmCancel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Live Trip Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{t.shareTripModalTitle}</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full">
                      LIVE GPS
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">{t.shareTripSubtitle}</p>
                </div>
              </div>
              <button
                id="btn-close-share-modal"
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Trip Preview Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-neutral-400 text-[11px]">Tracking Code:</span>
                <span className="font-mono text-cyan-400 font-bold tracking-wider">
                  {activeOrder.trackingCode || `WAP-${selectedCountryCode}-8921`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-neutral-500 block">Driver &amp; Moto:</span>
                  <span className="text-white font-medium">
                    {activeOrder.driver?.fullName || 'Jean-Baptiste Voltaire'} ({activeOrder.driver?.plateNumber || 'MC-89421-HT'})
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Safety Rating:</span>
                  <span className="text-amber-400 font-medium">★ {activeOrder.driver?.rating || 4.9} Verified</span>
                </div>
              </div>

              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-neutral-400">From:</span>
                  <span className="truncate text-white">{activeOrder.pickupLandmark}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-neutral-400">To:</span>
                  <span className="truncate text-white">{activeOrder.dropoffLandmark}</span>
                </div>
              </div>
            </div>

            {/* Tracking Link Field with Copy */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>{t.copyTrackingLink}</span>
                {shareCopied && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> {t.shareTripLinkCopied}
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-share-tracking-url"
                  type="text"
                  readOnly
                  value={getTrackingUrl()}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 select-all focus:outline-none focus:border-cyan-500"
                />
                <button
                  id="btn-copy-tracking-link"
                  type="button"
                  onClick={handleCopyTrackingLink}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    shareCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950'
                  }`}
                >
                  {shareCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{shareCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Direct 1-Click Sharing Options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <button
                id="btn-share-whatsapp"
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                id="btn-share-sms"
                type="button"
                onClick={handleShareSMS}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>SMS</span>
              </button>

              <button
                id="btn-share-native"
                type="button"
                onClick={handleNativeShare}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>More Apps</span>
              </button>
            </div>

            {/* Safety Disclaimer */}
            <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3 text-xs text-neutral-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {t.shareTripSafetyNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Country Switcher */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-800 mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{t.customerApp}</span>
              <span className="text-xs bg-amber-400/20 text-amber-300 font-normal px-2 py-0.5 rounded-full">
                {selectedCountry.flag} {selectedCountry.name}
              </span>
            </h2>
            <p className="text-xs text-neutral-400">Multi-Modal On-Demand Ride & Delivery</p>
          </div>
        </div>

        {/* Territory Switcher */}
        <select
          value={selectedCountryCode}
          onChange={(e) => setSelectedCountryCode(e.target.value)}
          className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white cursor-pointer focus:outline-none focus:border-amber-400"
        >
          <option value="HT">🇭🇹 Haiti (HTG)</option>
          <option value="GF">🇬🇫 French Guiana (EUR)</option>
          <option value="GY">🇬🇾 Guyana (GYD)</option>
          <option value="SR">🇸🇷 Suriname (SRD)</option>
          <option value="PA">🇵🇦 Panama (USD)</option>
          <option value="CR">🇨🇷 Costa Rica (CRC)</option>
          <option value="CO">🇨🇴 Colombia (COP)</option>
          <option value="BR">🇧🇷 Brazil (BRL)</option>
          <option value="EG">🇪🇬 Egypt (EGP)</option>
          <option value="SN">🇸🇳 Senegal (XOF)</option>
          <option value="KE">🇰🇪 Kenya (KES)</option>
          <option value="US">🇺🇸 United States (USD)</option>
          <option value="AR">🇦🇷 Argentina (Strictly Blocked)</option>
          <option value="UY">🇺🇾 Uruguay (Strictly Blocked)</option>
        </select>
      </div>

      {/* Cancellation Notice Banner */}
      {cancelNotice && (
        <div
          id="cancellation-status-banner"
          className="mb-4 bg-red-950/40 border border-red-500/40 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs text-red-200 animate-in fade-in"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-300 flex items-center gap-2">
                <span>{t.cancelRide}</span>
                <span className="text-[10px] bg-red-900/60 text-red-300 font-mono px-1.5 py-0.5 rounded">
                  {cancelNotice.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">{cancelNotice.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCancelNotice(null)}
            className="text-neutral-400 hover:text-white text-xs p-1 rounded hover:bg-neutral-800 transition cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Strict Exclusion Geofence Warning */}
      {isExcluded && (
        <div className="bg-red-950/60 border-2 border-red-600 rounded-xl p-4 mb-4 text-xs text-red-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-300 text-sm">
            <Lock className="w-4 h-4 text-red-400" />
            <span>TERRITORY STRICTLY EXCLUDED: {selectedCountry.name.toUpperCase()}</span>
          </div>
          <p className="leading-relaxed">{selectedCountry.exclusionReason}</p>
          <div className="text-[10px] font-mono bg-red-950 p-2 rounded border border-red-900 text-red-400">
            HTTP 403 / REJECT_GEOFENCE_PROHIBITED_ZONE
          </div>
        </div>
      )}

      {/* View Mode Toggle: Booking & Cost Estimator vs Active In-Transit Trip vs Post-Ride Rating */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 bg-neutral-950 rounded-xl mb-4 border border-neutral-800">
        <button
          id="btn-mode-estimator-form"
          type="button"
          onClick={() => setBookingStep('form')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            bookingStep === 'form'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Estimator & Booking</span>
        </button>

        <button
          id="btn-mode-active-trip"
          type="button"
          onClick={() => setBookingStep('active')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            bookingStep === 'active'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Active In-Transit</span>
        </button>

        <button
          id="btn-mode-rating"
          type="button"
          onClick={() => setBookingStep('rating')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            bookingStep === 'rating'
              ? 'bg-amber-400 text-neutral-950 shadow font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>{t.rateYourTrip}</span>
        </button>
      </div>

      {/* Service Switcher (Ride vs Package) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl mb-4 border border-neutral-800">
        <button
          onClick={() => setServiceType('ride')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            serviceType === 'ride'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>{t.motoTaxi}</span>
        </button>
        <button
          onClick={() => setServiceType('package')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            serviceType === 'package'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.expressParcel}</span>
        </button>
      </div>

      {/* Multi-Vehicle Class Selector (2-Wheeler, 3-Wheeler, 4-Wheeler) */}
      <div className="mb-4 space-y-1.5">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
          Select Vehicle Class:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['2_wheeler', '3_wheeler', '4_wheeler'] as VehicleClass[]).map((vClass) => {
            const vConfig = VEHICLE_CLASSES[vClass];
            const isSelected = selectedVehicleClass === vClass;

            return (
              <button
                key={vClass}
                disabled={isExcluded}
                onClick={() => setSelectedVehicleClass(vClass)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  {vConfig.iconType === 'bike' ? (
                    <Bike className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                  ) : vConfig.iconType === 'trike' ? (
                    <Layers className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  ) : (
                    <Car className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-400'}`} />
                  )}
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300">
                    {vConfig.passengerCapacity} pax
                  </span>
                </div>
                <div className="font-bold text-xs text-white truncate">
                  {vClass === '2_wheeler' ? '2-Wheeler' : vClass === '3_wheeler' ? '3-Wheeler' : '4-Wheeler'}
                </div>
                <div className="text-[10px] text-neutral-400 truncate">
                  {vClass === '2_wheeler' ? 'Solo / Moto-Taxi' : vClass === '3_wheeler' ? 'Tuk-Tuk' : 'Sedan / Van'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking Step: Searching */}
      {bookingStep === 'searching' && (
        <div className="py-10 text-center space-y-4">
          <div className="inline-flex relative">
            <div className="w-14 h-14 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
            <Bike className="w-6 h-6 text-amber-400 absolute inset-0 m-auto" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Matching Nearest {selectedVehicleClass.replace('_', '-')} Driver...</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Dispatching mesh across {selectedCountry.sampleCity} (Radius: 3.0 km)
            </p>
          </div>
          <div className="pt-2">
            <button
              id="btn-cancel-searching-ride"
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>{t.cancelRide}</span>
            </button>
          </div>
        </div>
      )}

      {/* Booking Step: Form Input & Cost Estimator */}
      {bookingStep === 'form' && !isExcluded && (
        <div className="space-y-4">
          {/* ================================================================= */}
          {/* RIDE COST ESTIMATOR CARD                                         */}
          {/* Uses current region's currency and dynamic pricing logic          */}
          {/* ================================================================= */}
          <div
            id="ride-cost-estimator-card"
            className="bg-neutral-950 border-2 border-amber-400/70 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-4 transition-all"
          >
            {/* Top Accent Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Ride Cost Estimator
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {selectedVehicleClass === '2_wheeler' ? 'Motorcycle (Moto-Taxi)' : selectedVehicleClass === '3_wheeler' ? '3-Wheeler' : '4-Wheeler'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Transparent fare range calculation for {selectedCountry.name}
                  </p>
                </div>
              </div>

              {/* Currency Badge & Voice Guide Button */}
              <div className="flex items-center gap-2">
                <div className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 flex items-center gap-1.5 shadow-sm">
                  <span>{selectedCountry.flag}</span>
                  <span className="text-amber-400">{selectedCountry.currencyCode}</span>
                  <span className="text-neutral-500 font-mono">({selectedCountry.currencySymbol})</span>
                </div>
                <button
                  type="button"
                  onClick={handlePlayEstimatorAudio}
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-700 transition"
                  title="Listen to Cost Estimate"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prominent Price Range Banner */}
            {estimatorLowQuote && estimatorHighQuote ? (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Estimated Price Range ({estimatorDistance} km):</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-0.5">
                    {selectedCountry.currencySymbol} {estimatorLowQuote.totalFareLocal.toLocaleString()} – {selectedCountry.currencySymbol} {estimatorHighQuote.totalFareLocal.toLocaleString()}{' '}
                    <span className="text-sm font-bold text-neutral-300">{selectedCountry.currencyCode}</span>
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-neutral-300">
                      ≈ ${estimatorLowQuote.totalFareUSD.toFixed(2)} – ${estimatorHighQuote.totalFareUSD.toFixed(2)} USD
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span>~{estimatorLowQuote.durationMinutes}–{estimatorHighQuote.durationMinutes} min trip</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1 text-xs">
                  {estimatorLowQuote.minimumFloorApplied ? (
                    <span className="px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-bold inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-400" /> Min Floor Applied ({selectedCountry.currencySymbol} {estimatorLowQuote.baseFareLocal})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> Standard Tariff
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500">
                    Driver Net: ~{Math.round(estimatorLowQuote.estimatedDriverNetUSD * selectedCountry.exchangeRateToUSD).toLocaleString()} {selectedCountry.currencyCode} (88%)
                  </span>
                </div>
              </div>
            ) : null}

            {/* Interactive Trip Distance Controller */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trip Distance:</span>
                </label>
                <span className="font-mono font-bold text-amber-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                  {estimatorDistance.toFixed(1)} km
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={estimatorDistance}
                onChange={(e) => setEstimatorDistance(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              {/* Quick Distance Presets */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: 'Short Hop', km: 2.5, desc: 'Market / Corner' },
                  { label: 'Commute', km: 5.0, desc: 'Work / Hospital' },
                  { label: 'Cross-Town', km: 11.0, desc: 'Inter-District' }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setEstimatorDistance(preset.km)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition text-xs ${
                      Math.abs(estimatorDistance - preset.km) < 0.1
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-[11px] truncate">{preset.label} ({preset.km} km)</div>
                    <div className="text-[9px] text-neutral-500 truncate">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Traffic & Demand Multiplier Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Road Conditions & Traffic Surge:</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'normal' as const, label: 'Normal Traffic', multiplier: '1.0x', desc: 'Standard Day' },
                  { id: 'moderate' as const, label: 'Rush Hour', multiplier: '1.15x', desc: 'Peak Commute' },
                  { id: 'peak' as const, label: 'Rain / Night', multiplier: '1.30x', desc: 'Hazard Surcharge' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEstimatorTraffic(item.id)}
                    className={`py-1.5 px-2 rounded-lg border text-left transition ${
                      estimatorTraffic === item.id
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">{item.label}</span>
                      <span className="text-[9px] font-mono text-amber-400">{item.multiplier}</span>
                    </div>
                    <div className="text-[9px] text-neutral-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transparent Tariff Breakdown Grid */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <div className="text-neutral-500">Base Fare</div>
                <div className="font-mono font-bold text-neutral-200">
                  {Math.round(selectedCountry.baseFareUSD * selectedCountry.exchangeRateToUSD).toLocaleString()} {selectedCountry.currencyCode}
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Rate / Km</div>
                <div className="font-mono font-bold text-neutral-200">
                  {Math.round(selectedCountry.perKmRateUSD * selectedCountry.exchangeRateToUSD * 10) / 10} {selectedCountry.currencyCode}/km
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Minimum Floor</div>
                <div className="font-mono font-bold text-neutral-200">
                  {Math.round(selectedCountry.minimumTripFloorUSD * selectedCountry.exchangeRateToUSD).toLocaleString()} {selectedCountry.currencyCode}
                </div>
              </div>
              <div>
                <div className="text-neutral-500">Platform Escrow</div>
                <div className="font-mono font-bold text-emerald-400">12% Max Cap</div>
              </div>
            </div>

            {/* Apply to Ride Action Button */}
            <button
              type="button"
              onClick={handleApplyEstimate}
              className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-400/40 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              {estimateApplied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Estimate Applied to Booking Below!</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  <span>Lock in this Estimate & Fill Request Details</span>
                </>
              )}
            </button>
          </div>

          {/* Real-Time Ride Demand Heat Map Quick Banner */}
          <div className="p-3 bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/20 border border-amber-400/30 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Ride Demand Heat Map</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    Live Surges
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Inspect high-demand corridors &amp; live passenger surge multipliers in {selectedCountry.name}.
                </div>
              </div>
            </div>

            <button
              id="btn-toggle-demand-heatmap"
              type="button"
              onClick={() => setShowDemandHeatMap(!showDemandHeatMap)}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer shrink-0"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{showDemandHeatMap ? 'Hide Heat Map' : 'View Heat Map'}</span>
            </button>
          </div>

          {/* Render Demand Heat Map when toggled in booking form */}
          {showDemandHeatMap && (
            <div className="animate-fadeIn">
              <RideDemandHeatMap
                region={region}
                countryCode={selectedCountry.code}
                currencyCode={selectedCountry.currencyCode}
                currencySymbol={selectedCountry.currencySymbol}
                onSelectCorridor={(corridor) => {
                  setPickupLandmark(corridor.pickupHotspot);
                  setDropoffLandmark(corridor.corridorName.split('→')[1]?.trim() || corridor.corridorName);
                  setShowDemandHeatMap(false);
                  if (onPlaySpeech) {
                    onPlaySpeech(`Selected corridor ${corridor.corridorName}. Destination updated.`);
                  }
                }}
              />
            </div>
          )}

          {/* Pickup Landmark */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.pickupLocation}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={pickupLandmark}
                onChange={(e) => setPickupLandmark(e.target.value)}
                placeholder="Pickup landmark or corner..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <MapPin className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Dropoff Landmark */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>{t.destinationLocation}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={dropoffLandmark}
                onChange={(e) => setDropoffLandmark(e.target.value)}
                placeholder="Destination hospital, church, market..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <Navigation className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Multi-Currency Checkout Rails */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-neutral-300">
              Payment Rail ({selectedCountry.currencyCode}):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {selectedCountry.paymentRails.map((rail) => (
                <button
                  key={rail.id}
                  type="button"
                  onClick={() => setPaymentMethodId(rail.id)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    paymentMethodId === rail.id
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {rail.type === 'mobile_money' ? (
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    ) : rail.type === 'card_processor' ? (
                      <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="truncate">{rail.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{rail.settlementSpeed}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Fare Quote Box */}
          {fareQuote && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-neutral-400">
                  Estimated Fare ({fareQuote.distanceKm} km • {fareQuote.durationMinutes} min)
                </div>
                <div className="text-lg font-black text-amber-400">
                  {fareQuote.totalFareLocal.toLocaleString()} {fareQuote.currencyCode}
                </div>
                <div className="text-[10px] font-mono text-neutral-500">
                  ≈ ${fareQuote.totalFareUSD.toFixed(2)} USD
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Helmet & OTP Protected
                </span>
              </div>
            </div>
          )}

          {/* Book Action */}
          <button
            onClick={handleBook}
            className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <Bike className="w-4 h-4" />
            <span>
              Request {selectedVehicleClass === '2_wheeler' ? 'Moto' : selectedVehicleClass === '3_wheeler' ? 'Tuk-Tuk' : 'Cab'} (Instant Dispatch)
            </span>
          </button>
        </div>
      )}

      {/* Booking Step: Active Trip */}
      {bookingStep === 'active' && !isExcluded && (
        <div className="space-y-4">
          {/* Live Telemetry Map */}
          <LiveRouteMap order={activeOrder} region={region} isOffline={networkMode === 'offline'} />

          {/* CRITICAL FEATURE: OTP Pickup Verification Box */}
          <div className="bg-neutral-950 border-2 border-amber-400/80 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Pickup Verification OTP
                </div>
                <div className="text-2xl font-mono font-black text-white tracking-widest">
                  {passengerOTP}
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-neutral-400 max-w-[200px]">
              Share this 4-digit OTP with your driver <span className="text-amber-300 font-semibold">only when you enter the vehicle</span>.
            </div>
          </div>

          {/* Assigned Driver Card with Privacy Call / Masking Button */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold text-sm">
                JV
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{activeOrder.driver?.fullName}</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    ★ {activeOrder.driver?.rating}
                  </span>
                </div>
                <div className="text-xs text-neutral-400">
                  {activeOrder.driver?.motorcycleModel} •{' '}
                  <span className="font-mono text-white">{activeOrder.driver?.plateNumber}</span>
                </div>
              </div>
            </div>

            {/* In-App Call / Text Masking & Share Triggers */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-share-trip-quick"
                type="button"
                onClick={handleOpenShareModal}
                className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-neutral-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title={t.shareTrip}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.shareTrip}</span>
              </button>

              <button
                onClick={() => {
                  setMaskingType('sms');
                  setShowMaskingModal(true);
                }}
                className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 transition cursor-pointer"
                title="Masked In-App Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setMaskingType('call');
                  setShowMaskingModal(true);
                }}
                className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="Call via Masked Proxy Number"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Masked Call</span>
              </button>
            </div>
          </div>

          {/* Share Live Trip Card */}
          <div
            id="card-share-live-trip"
            className="bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-neutral-900 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{t.shareTripModalTitle}</span>
                  <span className="text-[10px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                    Family &amp; Friends
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                  {t.shareTripSubtitle}
                </p>
              </div>
            </div>

            <button
              id="btn-share-trip"
              type="button"
              onClick={handleOpenShareModal}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-950" />
              <span>{t.shareTrip}</span>
            </button>
          </div>

          {/* Tipping Option During Active Trip (LBC, Liberté Cash, or Fiat) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 fill-pink-500/20" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Tip Driver or Merchant</span>
                  {confirmedTip && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                      ✓ Sent {confirmedTip.amount} {confirmedTip.currencyCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Reward with LBC Token, Liberté Cash, or local {selectedCountry.currencyCode}.
                </p>
              </div>
            </div>

            <button
              id="btn-open-active-trip-tip"
              type="button"
              onClick={() => setShowTippingModal(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer shrink-0"
            >
              <Coins className="w-3.5 h-3.5 text-neutral-950" />
              <span>{confirmedTip ? 'Add Another Tip' : 'Add Tip'}</span>
            </button>
          </div>

          {/* Complete Trip & Rate Driver Action Button */}
          <button
            id="btn-complete-trip-rate"
            type="button"
            onClick={() => {
              setActiveOrder((prev) => ({ ...prev, status: 'completed' }));
              setBookingStep('rating');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-500/50 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t.completeTrip} &amp; {t.rateYourTrip}</span>
          </button>

          {/* Cancel Ride Action Trigger Button */}
          <button
            id="btn-cancel-ride"
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-900/40 text-red-300 font-semibold text-xs transition cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-red-400" />
            <span>{t.cancelRide}</span>
          </button>

          {/* Reset button to simulate new booking */}
          <button
            onClick={() => setBookingStep('form')}
            className="w-full text-xs text-neutral-400 hover:text-white py-2 border border-neutral-800 rounded-lg transition"
          >
            ← Simulate New Multi-Vehicle Booking / Route
          </button>
        </div>
      )}

      {/* Booking Step: Post-Ride Rating Screen */}
      {bookingStep === 'rating' && (
        <div id="post-ride-rating-screen" className="space-y-4 animate-in fade-in">
          {ratingSubmitted ? (
            /* Rating Submitted Thank-You Card */
            <div
              id="rating-success-card"
              className="bg-neutral-950 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">
                  {t.ratingSubmittedSuccess}
                </h3>
                <p className="text-xs text-neutral-400">
                  {activeOrder.driver?.fullName} ({activeOrder.driver?.motorcycleModel}) • {selectedCountry.name}
                </p>
              </div>

              {/* Star review badge display */}
              <div className="flex items-center justify-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= driverRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-700'
                    }`}
                  />
                ))}
              </div>

              {/* Display submitted text if provided */}
              {ratingFeedbackText && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 italic max-w-md mx-auto">
                  &ldquo;{ratingFeedbackText}&rdquo;
                </div>
              )}

              {/* Tags displayed if selected */}
              {selectedRatingTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {selectedRatingTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  id="btn-return-home-after-rating"
                  type="button"
                  onClick={handleFinishRatingFlow}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  ← {t.bookRide}
                </button>
              </div>
            </div>
          ) : (
            /* Active Rating & Feedback Form */
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              {/* Trip Summary Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                    {activeOrder.driver ? activeOrder.driver.fullName.split(' ').map((n) => n[0]).join('') : 'WAP'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {activeOrder.driver?.fullName || 'Wap Moto Driver'}
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                        {t.completeTrip}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {activeOrder.driver?.motorcycleModel} •{' '}
                      <span className="font-mono text-neutral-300">{activeOrder.driver?.plateNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {selectedCountry.currencySymbol} {activeOrder.fareAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-400 capitalize">
                    {activeOrder.paymentMethod.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Star Rating Section */}
              <div className="text-center space-y-3 py-1">
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {t.howWasYourDriver}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {t.rateYourTrip}
                  </p>
                </div>

                {/* 1-5 Star interactive rating buttons */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (ratingHover || driverRating) >= star;
                    return (
                      <button
                        key={star}
                        id={`star-rating-btn-${star}`}
                        type="button"
                        onClick={() => setDriverRating(star)}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        aria-label={`${star} star`}
                        className="p-1.5 rounded-xl hover:bg-neutral-900 transition-all transform hover:scale-115 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]'
                              : 'text-neutral-700 stroke-[1.5]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Star descriptor pill */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30 bg-amber-400/10 text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>
                      {driverRating === 1 && t.ratingPoor}
                      {driverRating === 2 && t.ratingFair}
                      {driverRating === 3 && t.ratingGood}
                      {driverRating === 4 && t.ratingVeryGood}
                      {driverRating === 5 && t.ratingExcellent}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-normal">({driverRating}/5)</span>
                  </span>
                </div>
              </div>

              {/* Quick Feedback Tags */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Quick Compliments &amp; Safety Feedback</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Optional</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'safe_driving', label: t.tagSafeDriving, icon: ShieldCheck },
                    { id: 'polite_friendly', label: t.tagPoliteFriendly, icon: ThumbsUp },
                    { id: 'clean_helmet', label: t.tagCleanHelmet, icon: Sparkles },
                    { id: 'fast_route', label: t.tagFastRoute, icon: Zap }
                  ].map((tagItem) => {
                    const isSelected = selectedRatingTags.includes(tagItem.label);
                    const IconComponent = tagItem.icon;
                    return (
                      <button
                        key={tagItem.id}
                        type="button"
                        onClick={() => handleToggleRatingTag(tagItem.label)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/15 border-amber-400 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                        <span className="truncate">{tagItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Text Feedback Box */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <label htmlFor="driver-feedback-textarea" className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Comments or Suggestions</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Optional</span>
                </label>
                <textarea
                  id="driver-feedback-textarea"
                  rows={3}
                  value={ratingFeedbackText}
                  onChange={(e) => setRatingFeedbackText(e.target.value)}
                  placeholder={t.ratingFeedbackPlaceholder}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none transition"
                />
              </div>

              {/* Driver & Merchant Tipping Module (LBC Token, Liberté Cash, or Fiat Currency) */}
              <div className="pt-2 border-t border-neutral-800">
                <TippingModule
                  driverName={activeOrder.driver?.fullName || 'Wap Driver'}
                  merchantName="Lakay Pétion-Ville Kitchen"
                  orderFare={activeOrder.fareAmount}
                  currencyCode={selectedCountry.currencyCode}
                  currencySymbol={selectedCountry.currencySymbol}
                  fiatExchangeRateToUSD={selectedCountry.exchangeRateToUSD}
                  onTipConfirmed={(tip) => {
                    setConfirmedTip(tip);
                  }}
                  onPlaySpeech={onPlaySpeech}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-800">
                <button
                  id="btn-skip-driver-rating"
                  type="button"
                  onClick={() => setBookingStep('form')}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{t.skipRating}</span>
                </button>

                <button
                  id="btn-submit-driver-rating"
                  type="button"
                  onClick={handleSubmitRating}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-neutral-950 text-neutral-950" />
                  <span>{t.submitRating}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Trip Tipping Modal (LBC, Liberté Cash, or Fiat) */}
      {showTippingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg">
            <TippingModule
              driverName={activeOrder.driver?.fullName || 'Wap Driver'}
              merchantName="Lakay Pétion-Ville Kitchen"
              orderFare={activeOrder.fareAmount}
              currencyCode={selectedCountry.currencyCode}
              currencySymbol={selectedCountry.currencySymbol}
              fiatExchangeRateToUSD={selectedCountry.exchangeRateToUSD}
              onTipConfirmed={(tip) => {
                setConfirmedTip(tip);
              }}
              onPlaySpeech={onPlaySpeech}
              onClose={() => setShowTippingModal(false)}
            />
          </div>
        </div>
      )}

      {/* Floating Quick View LBC Wallet Widget (Top-Right aligned) */}
      <CustomerLbcWalletQuickWidget
        userId="customer_fabienne"
        userName="Fabienne Voltaire"
        position="top-right"
        onOpenFullBrokerage={() => setIsBrokerageOverlayOpen(true)}
      />

      {/* Embedded Full Brokerage Overlay (opened from Quick View widget action) */}
      <BrokerageIntegrationOverlay
        isOpen={isBrokerageOverlayOpen}
        onClose={() => setIsBrokerageOverlayOpen(false)}
        initialTab="transfer"
        onPlaySpeech={onPlaySpeech}
      />

      {/* Persistent Floating SOS Emergency Button (Top-Right aligned) */}
      <FloatingSOSButton
        role="customer"
        region={region}
        language={language}
        userName="Daphnée Lamour"
        currentLandmark={bookingStep === 'active' ? activeOrder.pickupLandmark : pickupLandmark}
        onPlaySpeech={onPlaySpeech}
        position="top-right"
      />
    </div>
  );
};

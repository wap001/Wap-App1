import React, { useState } from 'react';
import {
  Bike,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Phone,
  DollarSign,
  WifiOff,
  Volume2,
  Radio,
  Clock,
  MapPin,
  Camera,
  FileCheck,
  Upload,
  Layers,
  Car,
  KeyRound,
  ArrowRight,
  Zap,
  Lock,
  MessageSquare,
  Send,
  Compass,
  AlertCircle,
  Star,
  Search,
  Receipt,
  Filter,
  ChevronRight,
  X,
  Calendar,
  Flame
} from 'lucide-react';
import { RegionId, LanguageCode, DriverRideHistoryItem } from '../types/architecture';
import { REGIONS, MOCK_DRIVERS, INITIAL_DRIVER_RIDE_HISTORY } from '../data/mockData';
import { OPERATIONAL_COUNTRIES, VEHICLE_CLASSES, COUNTRY_LOOKUP } from '../data/internationalData';
import { translations } from '../data/translations';
import { FloatingSOSButton } from './FloatingSOSButton';
import { DriverSafetyKitModal } from './DriverSafetyKitModal';
import { RideDemandHeatMap } from './RideDemandHeatMap';
import { VehicleClass, DriverDocumentUpload, NavigationManeuver } from '../types/internationalScope';

interface DriverInterfaceProps {
  region: RegionId;
  language: LanguageCode;
  networkMode: 'online' | 'edge' | 'offline';
  onPlaySpeech: (text: string) => void;
}

export const DriverInterface: React.FC<DriverInterfaceProps> = ({
  region,
  language,
  networkMode,
  onPlaySpeech,
}) => {
  const t = translations[language] || translations.en;
  const currentRegion = REGIONS[region];
  const driver = MOCK_DRIVERS.find((d) => d.region === region) || MOCK_DRIVERS[0];

  const defaultCountryCode =
    region === 'haiti' ? 'HT' : region === 'french_guiana' ? 'GF' : region === 'guyana' ? 'GY' : 'SR';
  const [countryCode, setCountryCode] = useState<string>(defaultCountryCode);
  const currentCountry = COUNTRY_LOOKUP[countryCode] || COUNTRY_LOOKUP['HT'];
  const isExcluded = currentCountry.isStrictlyExcluded;

  const [isOnline, setIsOnline] = useState(true);
  const [selectedVehicleClass, setSelectedVehicleClass] = useState<VehicleClass>('2_wheeler');
  const [tripState, setTripState] = useState<'idle' | 'accepted' | 'arrived_pickup' | 'in_trip' | 'payment'>('idle');
  const [hasIncomingRequest, setHasIncomingRequest] = useState(false);
  const [cashCollected, setCashCollected] = useState(false);

  // OTP Verification Feature
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const expectedOtp = '5281';

  // Driver Documents Upload Feature
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [documents, setDocuments] = useState<DriverDocumentUpload[]>([
    {
      id: 'doc-1',
      driverId: driver.id,
      documentCategory: 'drivers_license',
      title: "Driver's License (Permis de Conduire)",
      fileUrl: '/docs/license.jpg',
      fileName: 'driver_license_2026.pdf',
      uploadTimestamp: '2026-01-15',
      expiryDate: '2028-09-30',
      ocrConfidenceScore: 98.5,
      status: 'verified'
    },
    {
      id: 'doc-2',
      driverId: driver.id,
      documentCategory: 'vehicle_registration',
      title: 'Vehicle Registration (Carte Grise / Titulo)',
      fileUrl: '/docs/registration.jpg',
      fileName: 'carte_grise_yamaha.pdf',
      uploadTimestamp: '2026-02-10',
      expiryDate: '2027-02-10',
      ocrConfidenceScore: 96.0,
      status: 'verified'
    },
    {
      id: 'doc-3',
      driverId: driver.id,
      documentCategory: 'commercial_insurance',
      title: 'Commercial Passenger Insurance Policy',
      fileUrl: '/docs/insurance.jpg',
      fileName: 'assurance_passager_wap.pdf',
      uploadTimestamp: '2026-03-01',
      expiryDate: '2027-03-01',
      ocrConfidenceScore: 94.2,
      status: 'verified'
    }
  ]);

  // Instant Cash-Out Feature
  const [showCashOutModal, setShowCashOutModal] = useState<boolean>(false);
  const [cashOutSuccess, setCashOutSuccess] = useState<boolean>(false);
  const [walletBalanceUSD, setWalletBalanceUSD] = useState<number>(34.5);

  // Driver Safety Kit Feature
  const [showSafetyKitModal, setShowSafetyKitModal] = useState<boolean>(false);

  // Driver View Mode: 'radar' (live dispatch radar), 'history' (ride history), 'heatmap' (surge demand map)
  const [driverViewMode, setDriverViewMode] = useState<'radar' | 'history' | 'heatmap'>('radar');

  // Driver Ride History State
  const [rideHistory, setRideHistory] = useState<DriverRideHistoryItem[]>(() => {
    const relevant = INITIAL_DRIVER_RIDE_HISTORY.filter(
      (item) => item.driverId === driver.id || item.currency === currentRegion.currency
    );
    return relevant.length > 0 ? relevant : INITIAL_DRIVER_RIDE_HISTORY;
  });
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'cash' | 'digital' | 'cancelled'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [selectedReceiptItem, setSelectedReceiptItem] = useState<DriverRideHistoryItem | null>(null);

  // Computed History Metrics
  const completedHistoryRides = rideHistory.filter((i) => i.status === 'completed');
  const totalNetEarnedLocal = completedHistoryRides.reduce((acc, i) => acc + i.netEarnings + (i.driverTip || 0), 0);
  const totalDistanceKm = completedHistoryRides.reduce((acc, i) => acc + i.distanceKm, 0);
  const averageDriverRating = (
    completedHistoryRides.reduce((acc, i) => acc + (i.ratingReceived || 5), 0) / (completedHistoryRides.length || 1)
  ).toFixed(2);

  // Filtered History Items
  const filteredHistoryItems = rideHistory.filter((item) => {
    // Category filter
    if (historyFilter === 'completed' && item.status !== 'completed') return false;
    if (historyFilter === 'cancelled' && item.status !== 'cancelled') return false;
    if (historyFilter === 'cash' && !item.paymentMethod.toLowerCase().includes('cash')) return false;
    if (historyFilter === 'digital' && (item.paymentMethod.toLowerCase().includes('cash') || item.status !== 'completed')) return false;

    // Search query filter
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      const matchPassenger = item.passengerName.toLowerCase().includes(q);
      const matchPickup = item.pickupLandmark.toLowerCase().includes(q);
      const matchDropoff = item.dropoffLandmark.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchPassenger && !matchPickup && !matchDropoff && !matchId) return false;
    }

    return true;
  });

  // Masking Modal Feature
  const [showMaskingModal, setShowMaskingModal] = useState<boolean>(false);

  // Turn-by-Turn Low Data Navigation Simulation
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const maneuvers: NavigationManeuver[] = [
    { stepIndex: 0, instruction: 'Head north on Route de Delmas toward Delmas 33', distanceMeters: 450, timeSeconds: 65, maneuverType: 'straight', roadName: 'Route de Delmas', lowDataTileKB: 1.4 },
    { stepIndex: 1, instruction: 'Turn right at the pharmacy intersection onto Rue Clercine', distanceMeters: 220, timeSeconds: 35, maneuverType: 'turn_right', roadName: 'Rue Clercine', lowDataTileKB: 1.2 },
    { stepIndex: 2, instruction: 'Continue straight past Market Square (Low-traffic detour)', distanceMeters: 800, timeSeconds: 110, maneuverType: 'straight', roadName: 'Rue Clercine', lowDataTileKB: 1.8 },
    { stepIndex: 3, instruction: 'Arrive at destination on left (Otèl Kinam)', distanceMeters: 50, timeSeconds: 10, maneuverType: 'arrive', roadName: 'Place Saint-Pierre', lowDataTileKB: 0.9 }
  ];

  const currentManeuver = maneuvers[currentStepIndex];

  const simulateIncomingPing = () => {
    if (isExcluded) return;
    setHasIncomingRequest(true);
    onPlaySpeech(
      language === 'ht'
        ? `Nouvo kous disponib nan ${currentCountry.name}! Delmas 33 pou Pétion-Ville. Pri garanti: $3.80 USD.`
        : `Nouvelle course disponible à ${currentCountry.name}! Tarif garanti: $3.80 USD.`
    );
  };

  const handleAccept = () => {
    setHasIncomingRequest(false);
    setTripState('accepted');
    setCurrentStepIndex(0);
    onPlaySpeech(
      language === 'ht'
        ? 'Ou aksepte kous la! Swiv GPS ki ba konsomasyon done a.'
        : 'Course acceptée! Suivez le guidage GPS basse consommation.'
    );
  };

  const handleVerifyOtpAndStart = () => {
    if (enteredOtp.trim() === expectedOtp) {
      setOtpError(null);
      setTripState('in_trip');
      onPlaySpeech(
        language === 'ht'
          ? 'Kòd OTP kòrèk! Kous la kòmanse kounye a.'
          : 'Code OTP validé! La course démarre.'
      );
    } else {
      setOtpError('Kòd OTP pa kòrèk. Mande pasaje a kòd 4 chif la ankò.');
    }
  };

  const handleInstantCashOut = () => {
    setCashOutSuccess(true);
    setTimeout(() => {
      setWalletBalanceUSD(0);
      setCashOutSuccess(false);
      setShowCashOutModal(false);
    }, 1600);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl max-w-2xl mx-auto relative">
      {/* ------------------------------------------------------------------- */}
      {/* DOCUMENT PHOTO UPLOAD MODAL                                         */}
      {/* ------------------------------------------------------------------- */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Driver Verification Documents</h3>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Mandatory compliance standards. Upload high-resolution photos of government license, registration, and commercial insurance.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{doc.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ✓ {doc.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Expiry: {doc.expiryDate}</span>
                    <span className="font-mono text-emerald-400">OCR: {doc.ocrConfidenceScore}%</span>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-neutral-900">
                    <button
                      onClick={() => alert(`Viewing document: ${doc.fileName}`)}
                      className="flex-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-[11px]"
                    >
                      View Photo
                    </button>
                    <button
                      onClick={() => alert(`Re-upload prompt for ${doc.title}`)}
                      className="flex-1 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[11px] flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Re-upload
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* INSTANT CASH-OUT MODAL                                              */}
      {/* ------------------------------------------------------------------- */}
      {showCashOutModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Instant Driver Cash-Out</h3>
              </div>
              <button
                onClick={() => setShowCashOutModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center space-y-1">
              <div className="text-xs text-neutral-400">Available Wallet Balance</div>
              <div className="text-3xl font-black text-amber-400">${walletBalanceUSD.toFixed(2)} USD</div>
              <div className="text-xs font-mono text-neutral-400">
                ≈ {(walletBalanceUSD * currentCountry.exchangeRateToUSD).toFixed(0)} {currentCountry.currencyCode}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-neutral-300 font-semibold">Select Instant Payout Method:</div>
              <div className="grid grid-cols-2 gap-2">
                {currentCountry.paymentRails.map((r) => (
                  <button
                    key={r.id}
                    className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:border-amber-400 text-left transition"
                  >
                    <div className="font-bold text-white truncate">{r.name}</div>
                    <div className="text-[10px] text-emerald-400">{r.settlementSpeed}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleInstantCashOut}
              disabled={walletBalanceUSD <= 0 || cashOutSuccess}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition shadow flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{cashOutSuccess ? 'Payout Transferred Successfully!' : 'Withdraw to Mobile Money Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DIGITAL RIDE RECEIPT & AUDIT LOG MODAL                             */}
      {/* ------------------------------------------------------------------- */}
      {selectedReceiptItem && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{t.viewReceipt}</h3>
                  <div className="text-[10px] font-mono text-neutral-400">{selectedReceiptItem.id}</div>
                </div>
              </div>
              <button
                id="btn-close-receipt-modal"
                onClick={() => setSelectedReceiptItem(null)}
                className="text-neutral-400 hover:text-white text-xs px-2.5 py-1 rounded bg-neutral-800 transition cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Receipt Summary Banner */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{selectedReceiptItem.date} • {selectedReceiptItem.time}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    selectedReceiptItem.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {selectedReceiptItem.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Passenger</span>
                  <span className="text-white font-bold">{selectedReceiptItem.passengerName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Vehicle Class</span>
                  <span className="text-amber-400 font-mono font-bold uppercase">
                    {selectedReceiptItem.vehicleClass.replace('_', '-')}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Landmarks */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-neutral-400 text-[11px]">Trip Route:</div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">Pickup Landmark</div>
                  <div className="text-white font-medium">{selectedReceiptItem.pickupLandmark}</div>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-neutral-800 ml-2 h-3" />
              <div className="flex items-start gap-2.5">
                <Navigation className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase">Dropoff Landmark</div>
                  <div className="text-white font-medium">{selectedReceiptItem.dropoffLandmark}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-900">
                <span>Distance: {selectedReceiptItem.distanceKm} km</span>
                <span>Duration: {selectedReceiptItem.durationMinutes} minutes</span>
              </div>
            </div>

            {/* Financial Itemized Breakdown */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-neutral-400 text-[11px]">Itemized Settlement:</div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Gross Passenger Meter Fare:</span>
                  <span className="font-mono text-white">{selectedReceiptItem.fareAmount} {selectedReceiptItem.currency}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Wap Driver Platform Fee (-15%):</span>
                  <span className="font-mono text-red-400">-{selectedReceiptItem.platformFee} {selectedReceiptItem.currency}</span>
                </div>
                {selectedReceiptItem.driverTip ? (
                  <div className="flex items-center justify-between text-emerald-400 font-medium">
                    <span>Passenger In-App Tip:</span>
                    <span className="font-mono">+{selectedReceiptItem.driverTip} {selectedReceiptItem.currency}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Payment Settlement Rail:</span>
                  <span className="text-white font-mono">{selectedReceiptItem.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-200">Net Credited to Wallet:</span>
                <span className="text-emerald-400 text-sm font-mono font-black">
                  {selectedReceiptItem.netEarnings + (selectedReceiptItem.driverTip || 0)} {selectedReceiptItem.currency}
                </span>
              </div>
            </div>

            {/* Passenger Feedback / Rating */}
            {selectedReceiptItem.ratingReceived && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">Passenger Rating:</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < (selectedReceiptItem.ratingReceived || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {selectedReceiptItem.customerFeedback && (
                  <p className="text-[11px] text-neutral-300 italic pt-1 border-t border-neutral-900">
                    "{selectedReceiptItem.customerFeedback}"
                  </p>
                )}
              </div>
            )}

            <button
              id="btn-done-receipt-modal"
              onClick={() => setSelectedReceiptItem(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DRIVER HEADER & STATUS                                              */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-800 mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              {selectedVehicleClass === '2_wheeler' ? (
                <Bike className="w-6 h-6" />
              ) : selectedVehicleClass === '3_wheeler' ? (
                <Layers className="w-6 h-6" />
              ) : (
                <Car className="w-6 h-6" />
              )}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-neutral-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-neutral-600'
              }`}
            />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{driver.fullName}</span>
              <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                {driver.plateNumber}
              </span>
            </h2>
            <div className="text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
              <span className="text-amber-400 font-bold">★ {averageDriverRating || driver.rating}</span>
              <span>•</span>
              <button
                id="btn-driver-trips-pill"
                type="button"
                onClick={() => setDriverViewMode('history')}
                className="text-neutral-300 hover:text-amber-300 underline underline-offset-2 transition cursor-pointer font-medium flex items-center gap-1"
                title={t.driverRideHistory}
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{completedHistoryRides.length} {t.tripsCompleted}</span>
              </button>
              <span>•</span>
              <span className="text-amber-400 uppercase font-semibold text-[11px]">
                {selectedVehicleClass.replace('_', '-')}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher (Radar vs History vs Heatmap) & Safety Kit & Online Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              id="tab-driver-radar"
              type="button"
              onClick={() => setDriverViewMode('radar')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                driverViewMode === 'radar'
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{t.dispatchRadar}</span>
            </button>
            <button
              id="tab-driver-heatmap"
              type="button"
              onClick={() => setDriverViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                driverViewMode === 'heatmap'
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Surge Heatmap</span>
            </button>
            <button
              id="tab-driver-history"
              type="button"
              onClick={() => setDriverViewMode('history')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                driverViewMode === 'history'
                  ? 'bg-amber-400 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.driverRideHistory}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-amber-300 font-mono">
                {rideHistory.length}
              </span>
            </button>
          </div>

          <button
            id="btn-driver-safety-kit-trigger"
            type="button"
            onClick={() => setShowSafetyKitModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow bg-amber-400/15 hover:bg-amber-400 hover:text-neutral-950 text-amber-300 border border-amber-400/40 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Safety Kit</span>
          </button>

          <button
            id="btn-driver-online-toggle"
            onClick={() => {
              if (isExcluded) {
                alert('Cannot go online: Service is strictly prohibited in Argentina and Uruguay.');
                return;
              }
              setIsOnline(!isOnline);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer ${
              isOnline
                ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isOnline ? t.goOnline : t.goOffline}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* REAL-TIME HOURLY EARNINGS PACER & QUICK STATS                      */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {/* Hourly Earnings Pace Meter */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Hourly Target</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-black text-emerald-400 mt-1">$8.50 / hr</div>
          <div className="text-[10px] text-neutral-500">
            Target: ${currentCountry.targetHourlyEarningsUSD.min} - ${currentCountry.targetHourlyEarningsUSD.max}/hr
          </div>
        </div>

        {/* Available Wallet Balance & Instant Cash-Out */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Driver Wallet</span>
            <button
              onClick={() => setShowCashOutModal(true)}
              className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded hover:bg-amber-400 hover:text-neutral-950 transition cursor-pointer"
            >
              Cash Out
            </button>
          </div>
          <div className="text-base font-black text-amber-400 mt-1">${walletBalanceUSD.toFixed(2)} USD</div>
          <div className="text-[10px] text-neutral-500">
            ≈ {(walletBalanceUSD * currentCountry.exchangeRateToUSD).toFixed(0)} {currentCountry.currencyCode}
          </div>
        </div>

        {/* Ride History Quick Stat */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>{t.driverRideHistory}</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base font-black text-white mt-1">
            {completedHistoryRides.length} {t.tripsCompleted}
          </div>
          <button
            id="btn-stat-view-history"
            type="button"
            onClick={() => setDriverViewMode('history')}
            className="text-[10px] text-cyan-400 hover:underline text-left cursor-pointer flex items-center gap-1 font-semibold"
          >
            <span>{t.viewAllHistory}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Document Verification Status Trigger */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Documents</span>
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-white mt-1">3 / 3 Verified</div>
          <button
            onClick={() => setShowDocsModal(true)}
            className="text-[10px] text-amber-400 hover:underline text-left cursor-pointer"
          >
            Manage Photos →
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* DRIVER RIDE HISTORY VIEW                                            */}
      {/* ------------------------------------------------------------------- */}
      {driverViewMode === 'history' && (
        <div id="section-driver-ride-history" className="space-y-4">
          {/* Top Bar with Back to Radar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">{t.driverRideHistory}</h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  {filteredHistoryItems.length} / {rideHistory.length}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {t.driverRideHistorySubtitle}
              </p>
            </div>

            <button
              id="btn-back-to-radar"
              type="button"
              onClick={() => setDriverViewMode('radar')}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.backToRadar}</span>
            </button>
          </div>

          {/* Active Trip Banner if viewing history while trip is active */}
          {tripState !== 'idle' && (
            <div className="bg-amber-400/10 border border-amber-400/40 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Active Trip in Progress ({tripState.replace('_', ' ')})</span>
              </div>
              <button
                type="button"
                onClick={() => setDriverViewMode('radar')}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-[11px] transition cursor-pointer"
              >
                Return to Live Ride
              </button>
            </div>
          )}

          {/* KPI Metrics Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
              <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                <span>{t.totalTripsCompleted}</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-black text-white mt-1">
                {completedHistoryRides.length}
              </div>
              <div className="text-[10px] text-neutral-500">
                {rideHistory.length - completedHistoryRides.length} cancelled
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
              <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                <span>{t.totalNetEarnings}</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-black text-emerald-400 mt-1">
                {totalNetEarnedLocal.toLocaleString()} {currentCountry.currencyCode}
              </div>
              <div className="text-[10px] text-neutral-500">
                ≈ ${((totalNetEarnedLocal / currentCountry.exchangeRateToUSD)).toFixed(2)} USD
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
              <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                <span>{t.totalDistanceDriven}</span>
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-lg font-black text-white mt-1">
                {totalDistanceKm.toFixed(1)} km
              </div>
              <div className="text-[10px] text-neutral-500">
                Avg {(totalDistanceKm / (completedHistoryRides.length || 1)).toFixed(1)} km/trip
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
              <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                <span>{t.averageRating}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-lg font-black text-amber-400 mt-1">
                ★ {averageDriverRating}
              </div>
              <div className="text-[10px] text-neutral-500">
                Based on passenger ratings
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-driver-history-search"
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search by passenger, landmark, or trip ID..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
              />
              {historySearchQuery && (
                <button
                  type="button"
                  onClick={() => setHistorySearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {[
                { id: 'all', label: t.filterAll, count: rideHistory.length },
                { id: 'completed', label: t.filterCompleted, count: completedHistoryRides.length },
                {
                  id: 'digital',
                  label: t.filterDigital,
                  count: rideHistory.filter((i) => !i.paymentMethod.toLowerCase().includes('cash') && i.status === 'completed').length,
                },
                {
                  id: 'cash',
                  label: t.filterCash,
                  count: rideHistory.filter((i) => i.paymentMethod.toLowerCase().includes('cash')).length,
                },
                {
                  id: 'cancelled',
                  label: t.filterCancelled,
                  count: rideHistory.filter((i) => i.status === 'cancelled').length,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  id={`filter-history-${f.id}`}
                  type="button"
                  onClick={() => setHistoryFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    historyFilter === f.id
                      ? 'bg-amber-400 text-neutral-950 shadow'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    historyFilter === f.id ? 'bg-neutral-900 text-amber-400' : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ride History Cards List */}
          <div className="space-y-3">
            {filteredHistoryItems.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">{t.noRidesFound}</p>
                {historySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHistorySearchQuery('')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                )}
              </div>
            ) : (
              filteredHistoryItems.map((item) => (
                <div
                  key={item.id}
                  id={`card-ride-${item.id}`}
                  className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 transition space-y-3"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-500" />
                        {item.date} • {item.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          item.status === 'completed'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : 'bg-red-950/80 text-red-300 border border-red-800/60'
                        }`}
                      >
                        {item.status === 'completed' ? '✓ ' + t.completedBadge : '✗ ' + t.cancelledBadge}
                      </span>

                      <button
                        id={`btn-receipt-${item.id}`}
                        type="button"
                        onClick={() => setSelectedReceiptItem(item)}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer"
                        title={t.viewReceipt}
                      >
                        <Receipt className="w-3 h-3" />
                        <span className="hidden sm:inline">{t.viewReceipt}</span>
                      </button>
                    </div>
                  </div>

                  {/* Route & Passenger */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Passenger & Landmarks */}
                    <div className="space-y-1.5">
                      <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <span className="text-neutral-500 font-medium">Passenger:</span>
                        <span className="text-white font-bold">{item.passengerName}</span>
                        <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.2 rounded font-mono">
                          {item.vehicleClass.replace('_', '-')}
                        </span>
                      </div>

                      {/* Landmarks */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-neutral-300 line-clamp-1">{item.pickupLandmark}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-neutral-300 line-clamp-1">{item.dropoffLandmark}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 pt-0.5">
                        <span>{item.distanceKm} km</span>
                        <span>•</span>
                        <span>{item.durationMinutes} mins</span>
                        <span>•</span>
                        <span className="text-neutral-400 font-medium">{item.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Financial Summary Box */}
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex flex-col justify-between text-xs">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>{t.grossFare}:</span>
                          <span className="font-mono text-white">{item.fareAmount} {item.currency}</span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>{t.platformFee} (-15%):</span>
                          <span className="font-mono text-red-400">-{item.platformFee} {item.currency}</span>
                        </div>
                        {item.driverTip && item.driverTip > 0 ? (
                          <div className="flex items-center justify-between text-emerald-400 font-semibold">
                            <span>{t.driverTip}:</span>
                            <span className="font-mono">+{item.driverTip} {item.currency}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="pt-1.5 border-t border-neutral-800 flex items-center justify-between font-bold">
                        <span className="text-neutral-300 text-[11px]">{t.netEarnings}:</span>
                        <span className="text-emerald-400 font-mono text-sm">
                          {item.netEarnings + (item.driverTip || 0)} {item.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Rating & Feedback if available */}
                  {item.ratingReceived ? (
                    <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-lg p-2 flex items-start gap-2 text-xs">
                      <div className="flex items-center text-amber-400 shrink-0 mt-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3 h-3 ${
                              idx < (item.ratingReceived || 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                      {item.customerFeedback && (
                        <p className="text-[11px] text-neutral-300 italic">
                          "{item.customerFeedback}"
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DRIVER RIDE DEMAND HEAT MAP VIEW                                    */}
      {/* ------------------------------------------------------------------- */}
      {driverViewMode === 'heatmap' && (
        <div id="section-driver-heatmap" className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Ride Demand Heat Map & Surge Corridors</h3>
                <p className="text-[11px] text-neutral-400">
                  Target high passenger volume zones across {currentCountry.name} to maximize hourly earnings pace.
                </p>
              </div>
            </div>

            <button
              id="btn-driver-heatmap-to-radar"
              type="button"
              onClick={() => setDriverViewMode('radar')}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Back to Radar</span>
            </button>
          </div>

          <RideDemandHeatMap
            region={region}
            countryCode={currentCountry.code}
            currencyCode={currentCountry.currencyCode}
            currencySymbol={currentCountry.currencySymbol}
            onSelectCorridor={(corridor) => {
              alert(`Corridor targeted: ${corridor.corridorName}. Heading towards ${corridor.pickupHotspot}!`);
              setDriverViewMode('radar');
            }}
          />
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* RADAR & LIVE DISPATCH SECTION                                       */}
      {/* ------------------------------------------------------------------- */}
      {driverViewMode === 'radar' && (
        <>
          {/* ------------------------------------------------------------------- */}
          {/* TRIP EXECUTION: IDLE STATE                                          */}
          {/* ------------------------------------------------------------------- */}
      {tripState === 'idle' && !hasIncomingRequest && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 mx-auto flex items-center justify-center text-amber-400">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Radar Active in {currentCountry.name}</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Position locked. Algorithmic dispatch matching nearest passenger or parcel courier.
            </p>
          </div>
          <button
            onClick={simulateIncomingPing}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs rounded-xl border border-neutral-700 transition"
          >
            ⚡ Simulate Incoming Dispatch Ping
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* INCOMING REQUEST RADAR POPUP                                        */}
      {/* ------------------------------------------------------------------- */}
      {hasIncomingRequest && (
        <div className="bg-neutral-950 border-2 border-amber-400 rounded-xl p-5 space-y-4 animate-pulse">
          <div className="flex items-center justify-between text-amber-400 font-bold text-sm">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {t.newRideRequest}
            </span>
            <span className="font-mono text-xs bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full font-bold">
              15s to respond
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-1">
              <div className="text-neutral-400 text-[11px]">Pickup: Delmas 33, devan Famasi Nouvelle Génération</div>
              <div className="text-white font-bold">Destination: Pétion-Ville, akote Otèl Kinam</div>
              <div className="text-neutral-400 text-[11px]">Distance: 5.4 km (14 min)</div>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-neutral-400">Net Driver Earnings:</span>
              <span className="text-base font-black text-amber-400">$3.80 USD (350 HTG)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setHasIncomingRequest(false)}
              className="py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
            >
              {t.decline}
            </button>
            <button
              onClick={handleAccept}
              className="py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow"
            >
              {t.acceptRide}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* ACTIVE TRIP EXECUTION WITH LOW-DATA VECTOR NAVIGATION & OTP         */}
      {/* ------------------------------------------------------------------- */}
      {tripState !== 'idle' && (
        <div className="space-y-4">
          {/* Integrated Turn-by-Turn Low-Data Navigation HUD */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Compass className="w-4 h-4 animate-spin" />
                <span>Low-Data Vector Navigation (1.4 KB Cache)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                Speed: 38 km/h
              </span>
            </div>

            {/* Current Maneuver Instruction Banner */}
            <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">{currentManeuver.instruction}</div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  In {currentManeuver.distanceMeters} meters • {currentManeuver.roadName}
                </div>
              </div>
            </div>

            {/* Maneuver Stepper Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="text-neutral-400 hover:text-white disabled:opacity-30"
              >
                ← Previous Step
              </button>
              <span className="text-[11px] text-neutral-500">
                Step {currentStepIndex + 1} of {maneuvers.length}
              </span>
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.min(maneuvers.length - 1, prev + 1))}
                disabled={currentStepIndex === maneuvers.length - 1}
                className="text-amber-400 hover:text-amber-300 font-bold disabled:opacity-30"
              >
                Next Step →
              </button>
            </div>
          </div>

          {/* CRITICAL SECURITY: OTP INPUT PROMPT AT PICKUP */}
          {tripState === 'arrived_pickup' && (
            <div className="bg-neutral-950 border-2 border-amber-400 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Enter Passenger's 4-Digit OTP Code</span>
              </div>
              <p className="text-xs text-neutral-400">
                Ask the passenger for their safety verification code before starting trip.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="Enter 4 digits (e.g. 5281)"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold text-white tracking-widest focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleVerifyOtpAndStart}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl shadow"
                >
                  Verify & Start
                </button>
              </div>

              {otpError && (
                <div className="text-xs text-red-400 font-semibold">{otpError}</div>
              )}
            </div>
          )}

          {/* Step Action Buttons */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            {tripState === 'accepted' && (
              <button
                onClick={() => setTripState('arrived_pickup')}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs transition"
              >
                Arrived at Pickup Location
              </button>
            )}

            {tripState === 'in_trip' && (
              <button
                onClick={() => setTripState('payment')}
                className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg text-xs transition"
              >
                Arrived at Destination & Complete Trip
              </button>
            )}

            {tripState === 'payment' && (
              <div className="space-y-3">
                <div className="bg-amber-400/10 border border-amber-400/40 rounded-lg p-3 text-center">
                  <div className="text-xs text-neutral-400">Collect Fare from Passenger:</div>
                  <div className="text-xl font-black text-amber-400">
                    $3.80 USD (350 {currentCountry.currencyCode})
                  </div>
                </div>

                <button
                  id="btn-confirm-payment-received"
                  onClick={() => {
                    setCashCollected(true);
                    onPlaySpeech(
                      language === 'ht'
                        ? 'Peman resevwa avèk siksè! Kous la anrejistre nan istorik ou.'
                        : 'Paiement validé avec succès! La course a été enregistrée dans votre historique.'
                    );

                    const newTripRecord: DriverRideHistoryItem = {
                      id: `hist_${Date.now()}`,
                      driverId: driver.id,
                      date: 'Today',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      passengerName: 'Daphnée Lamour',
                      pickupLandmark: region === 'haiti' ? 'Delmas 33, devan Famasi Nouvelle Génération' : 'Pickup Point',
                      dropoffLandmark: region === 'haiti' ? 'Pétion-Ville, Place Saint-Pierre (Otèl Kinam)' : 'Destination Point',
                      vehicleClass: selectedVehicleClass,
                      distanceKm: 5.2,
                      durationMinutes: 14,
                      fareAmount: 350,
                      platformFee: 52.5,
                      netEarnings: 297.5,
                      driverTip: 40,
                      currency: currentCountry.currencyCode,
                      paymentMethod: 'MonCash (Digicel Mobile Money)',
                      status: 'completed',
                      ratingReceived: 5,
                      customerFeedback: 'Chofè a te trè pridan, kous la te rapid!',
                    };

                    setRideHistory((prev) => [newTripRecord, ...prev]);

                    setTimeout(() => {
                      setTripState('idle');
                      setCashCollected(false);
                      setWalletBalanceUSD((prev) => prev + 3.8);
                    }, 1400);
                  }}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition cursor-pointer shadow"
                >
                  Confirm Payment Received
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </>
      )}

      {/* Driver Safety Kit Modal */}
      <DriverSafetyKitModal
        isOpen={showSafetyKitModal}
        onClose={() => setShowSafetyKitModal(false)}
        driverName={driver.fullName}
        vehicleModel={driver.vehicleType}
        plateNumber={driver.plateNumber}
        region={region}
        countryCode={currentCountry.code}
        language={language}
        onPlaySpeech={onPlaySpeech}
      />

      {/* Persistent Floating SOS Emergency Button (Top-Right aligned) */}
      <FloatingSOSButton
        role="driver"
        region={region}
        language={language}
        userName={driver.fullName}
        currentLandmark="Delmas 33 route intersection"
        onPlaySpeech={onPlaySpeech}
        position="top-right"
      />
    </div>
  );
};

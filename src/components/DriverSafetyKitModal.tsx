import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Phone,
  Radio,
  MapPin,
  CheckCircle2,
  Wrench,
  Share2,
  Mic,
  MicOff,
  Clock,
  Car,
  Bike,
  Flame,
  FileText,
  Volume2,
  X,
  ExternalLink,
  ChevronRight,
  Send,
  Lock,
  Compass
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';
import { COUNTRY_LOOKUP } from '../data/internationalData';

interface DriverSafetyKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  vehicleModel?: string;
  plateNumber?: string;
  region: RegionId;
  countryCode?: string;
  language?: LanguageCode;
  onPlaySpeech?: (text: string) => void;
}

export const DriverSafetyKitModal: React.FC<DriverSafetyKitModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Fabrice Louverture',
  vehicleModel = 'Yamaha DT 125',
  plateNumber = 'HT-5829-TL',
  region,
  countryCode = 'HT',
  language = 'en',
  onPlaySpeech,
}) => {
  const currentRegion = REGIONS[region];
  const country = COUNTRY_LOOKUP[countryCode] || COUNTRY_LOOKUP['HT'];

  const [activeTab, setActiveTab] = useState<
    'emergency' | 'inspection' | 'follow_my_ride' | 'roadside' | 'recorder'
  >('emergency');

  // Pre-trip Inspection Checklist State
  const [checklist, setChecklist] = useState({
    driverHelmet: true,
    passengerHelmet: true,
    brakesResponsive: true,
    lightsFunctional: true,
    tirePressureOk: true,
    reflectiveVest: false,
  });
  const [isInspectionCertified, setIsInspectionCertified] = useState(false);

  // Follow My Ride State
  const [isLiveShareActive, setIsLiveShareActive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [nightShieldEnabled, setNightShieldEnabled] = useState(true);

  // Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Roadside Assistance Request State
  const [requestedAssistance, setRequestedAssistance] = useState<string | null>(null);

  // GPS Coordinates Telemetry Mock
  const currentCoords = {
    lat: region === 'haiti' ? 18.5392 : 15.3092,
    lng: region === 'haiti' ? -72.3364 : -61.3794,
    landmark: region === 'haiti' ? 'Delmas 33 & Boulevard Toussaint' : 'Roseau Ferry Terminal',
  };

  const emergencyContactsByCountry: Record<string, { police: string; ambulance: string; wapSafety: string }> = {
    HT: { police: '118 / 114', ambulance: '116', wapSafety: '+509 3700-WAP1' },
    DM: { police: '999', ambulance: '999', wapSafety: '+1 767 448-WAP1' },
    GF: { police: '112 / 17', ambulance: '15', wapSafety: '+594 594-WAP1' },
    GY: { police: '911', ambulance: '913', wapSafety: '+592 226-WAP1' },
    SR: { police: '115', ambulance: '113', wapSafety: '+597 471-WAP1' },
  };

  const localEmergency = emergencyContactsByCountry[countryCode] || emergencyContactsByCountry['HT'];

  if (!isOpen) return null;

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedChecksCount = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;
  const inspectionScore = Math.round((completedChecksCount / totalChecks) * 100);

  const handleCertifyInspection = () => {
    setIsInspectionCertified(true);
    if (onPlaySpeech) {
      onPlaySpeech('Pre-trip vehicle safety inspection certified. Ride safe on your route!');
    }
  };

  const handleCopyTrackingLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      id="driver-safety-kit-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div className="w-full max-w-2xl modal-blue-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-blue-500/30">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 modal-blue-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 text-amber-300 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Driver Safety Kit
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-200 border border-blue-400">
                  24/7 Rapid Shield
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                {driverName} • {vehicleModel} ({plateNumber})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white hover:bg-red-600 bg-red-600/80 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1 text-xs font-bold"
            title="Close Safety Kit"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-neutral-900/90 border-b border-neutral-850 overflow-x-auto shrink-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspection')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'inspection'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pre-Trip Inspection</span>
            {isInspectionCertified && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('follow_my_ride')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'follow_my_ride'
                ? 'bg-sky-500 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Follow My Ride</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roadside')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'roadside'
                ? 'bg-purple-500 text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Roadside Assistance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recorder')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'recorder'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Discreet Audio</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: EMERGENCY DISPATCH */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Telemetry Location Capsule */}
              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Current GPS Telemetry</div>
                    <div className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {currentCoords.landmark}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      LAT: {currentCoords.lat.toFixed(5)} • LNG: {currentCoords.lng.toFixed(5)}
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] shrink-0">
                  GPS Active
                </span>
              </div>

              {/* Direct Emergency Dials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-red-950/30 border border-red-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-red-400" />
                      <span>National Emergency Response</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase">{country.name}</span>
                  </div>
                  <div className="text-xl font-mono font-black text-white">
                    {localEmergency.police}
                  </div>
                  <a
                    href={`tel:${localEmergency.police.split('/')[0].trim()}`}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>One-Tap Call Emergency</span>
                  </a>
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span>Wap 24/7 Rapid Security Patrol</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">2-Min Dispatch</span>
                  </div>
                  <div className="text-xl font-mono font-black text-white">
                    {localEmergency.wapSafety}
                  </div>
                  <a
                    href={`tel:${localEmergency.wapSafety}`}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Call Platform Safety Line</span>
                  </a>
                </div>
              </div>

              {/* Safety Constraint & Warm Encouragement */}
              <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Your safety is our highest priority. All emergency calls automatically send your live telemetry, vehicle plate, and passenger details to local emergency coordinators and the Wap safety team.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-TRIP VEHICLE INSPECTION */}
          {activeTab === 'inspection' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Daily 6-Point Moto &amp; Helmet Safety Audit
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Verify key safety gear before accepting passenger dispatches.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-amber-400">
                    {completedChecksCount} / {totalChecks} Passed
                  </span>
                  <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${inspectionScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {[
                  { key: 'driverHelmet' as const, label: 'DOT / ECE Certified Driver Helmet On & Buckled' },
                  { key: 'passengerHelmet' as const, label: 'Clean Sanitized Passenger Spare Helmet in Cargo Rack' },
                  { key: 'brakesResponsive' as const, label: 'Front & Rear Brake Levers Tested & Responsive' },
                  { key: 'lightsFunctional' as const, label: 'Headlight, Tail Brake Light & Turn Indicators Working' },
                  { key: 'tirePressureOk' as const, label: 'Tire Pressure & Tread Depth Checked (> 2mm minimum)' },
                  { key: 'reflectiveVest' as const, label: 'High-Visibility Reflective Vest / Night Jacket Ready' },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => toggleChecklistItem(item.key)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between text-xs cursor-pointer ${
                      checklist[item.key]
                        ? 'bg-neutral-900 border-emerald-500/40 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                        checklist[item.key]
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'bg-neutral-800 border border-neutral-700'
                      }`}
                    >
                      {checklist[item.key] && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCertifyInspection}
                  disabled={isInspectionCertified || completedChecksCount < 4}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow ${
                    isInspectionCertified
                      ? 'bg-emerald-600 text-white'
                      : completedChecksCount >= 4
                      ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isInspectionCertified
                      ? '✓ Pre-Trip Safety Certified for Today'
                      : 'Certify Vehicle Safety & Earn Driver Quality Badge'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FOLLOW MY RIDE & NIGHT SHIELD */}
          {activeTab === 'follow_my_ride' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-sky-400" />
                    <span>Encrypted Family Live Tracking Link</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">End-to-End Encrypted</span>
                </div>

                <p className="text-xs text-neutral-400">
                  Share this temporary live GPS link with your family or moto cooperative manager so they can follow your movements in real-time.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://wap.ht/safe-track/dr-${plateNumber.toLowerCase()}`}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyTrackingLink}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-lg whitespace-nowrap transition cursor-pointer"
                  >
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Night Shield Automated Safety Ping */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1 max-w-sm">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Night Shield Automated Check-In</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    During night shifts (8 PM - 5 AM), the app prompts a silent 1-tap confirmation every 15 minutes to guarantee driver safety.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNightShieldEnabled(!nightShieldEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    nightShieldEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {nightShieldEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ROADSIDE ASSISTANCE (DEPANNAGE) */}
          {activeTab === 'roadside' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  On-Demand Roadside Assistance
                </h4>
                <p className="text-xs text-neutral-400">
                  Select your breakdown condition. Nearby partner mechanics will dispatch directly to your GPS coordinates.
                </p>
              </div>

              {requestedAssistance ? (
                <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-purple-400 mx-auto" />
                  <div className="text-sm font-bold text-white">
                    Assistance Dispatched: {requestedAssistance}
                  </div>
                  <p className="text-xs text-neutral-300">
                    A mobile mechanic is en route to <strong>{currentCoords.landmark}</strong>. Estimated arrival in 12 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRequestedAssistance(null)}
                    className="text-xs text-purple-300 hover:text-white underline pt-1 cursor-pointer"
                  >
                    Cancel Request
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'flat_tire', title: 'Tire Puncture / Tube Patch', desc: 'Mobile air compressor & tire patch dispatch' },
                    { id: 'fuel_delivery', title: 'Emergency Fuel (1 Gallon)', desc: 'Motorcycle unleaded gasoline delivery' },
                    { id: 'battery_jump', title: 'Battery Jumpstart & Spark Plug', desc: 'Electrical diagnostic & battery booster' },
                    { id: 'moto_towing', title: 'Flatbed Moto Towing', desc: 'Transport to authorized Wap repair garage' },
                  ].map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setRequestedAssistance(service.title)}
                      className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-purple-500/50 rounded-xl text-left transition flex items-start justify-between gap-2 cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{service.title}</div>
                        <div className="text-[10px] text-neutral-400">{service.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DISCREET AUDIO RECORDER */}
          {activeTab === 'recorder' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>Discreet Safety Incident Recorder</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">256-bit AES</span>
                </div>

                <p className="text-xs text-neutral-400">
                  Record encrypted in-app audio during safety disputes or hostile interactions. Recordings are securely stored for safety review with platform security.
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isRecordingAudio ? 'bg-red-500 animate-ping' : 'bg-neutral-600'}`} />
                    <span className="text-xs font-mono text-white">
                      {isRecordingAudio ? 'RECORDING IN PROGRESS...' : 'Audio Recorder Ready'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRecordingAudio(!isRecordingAudio)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isRecordingAudio
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                    }`}
                  >
                    {isRecordingAudio ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecordingAudio ? 'Stop & Save Encrypted Clip' : 'Start Discreet Recording'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-850 flex items-center justify-between shrink-0 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Driver Protection Guarantee • Encrypted Safety Telemetry</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

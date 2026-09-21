import React, { useState } from 'react';
import {
  Bike,
  User,
  Phone,
  ShieldCheck,
  CreditCard,
  FileCheck,
  Upload,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  Volume2,
  AlertTriangle,
  Sliders,
  DollarSign,
  Compass,
  FileText,
  Camera,
  Check
} from 'lucide-react';
import { RegionId, LanguageCode, DriverProfile } from '../types/architecture';
import { REGIONS, MOCK_DRIVERS } from '../data/mockData';
import { IdentityVerificationStatusWidget } from './IdentityVerificationStatusWidget';
import { AuthUserData } from './WelcomeLandingInterface';

interface DriverAccountManagementProps {
  region: RegionId;
  language: LanguageCode;
  onPlaySpeech: (text: string) => void;
  onClose?: () => void;
  currentUser?: AuthUserData | null;
  onUpdateUserVerification?: (updatedUser: AuthUserData) => void;
}

export const DriverAccountManagement: React.FC<DriverAccountManagementProps> = ({
  region,
  language,
  onPlaySpeech,
  onClose,
  currentUser,
  onUpdateUserVerification,
}) => {
  const currentRegion = REGIONS[region];
  const driverData = MOCK_DRIVERS.find((d) => d.region === region) || MOCK_DRIVERS[0];

  const activeDriverUser: AuthUserData = currentUser || {
    id: 'usr_driver_jean',
    name: driverData.fullName,
    email: `${driverData.fullName.toLowerCase().replace(/\s+/g, '.')}@wap-fleet.ht`,
    phone: driverData.phone,
    role: 'driver',
    region,
    subscriptionTier: 'freedom_driver',
    subscriptionName: 'Wap Fleet Driver Pass',
    lbcBonus: 3400,
    signedUpAt: '2026-03-01T08:00:00.000Z',
    verificationStatus: 'approved',
    verificationProgress: 100,
    verificationNotes: 'Official driver passport, biometric face matching, and motorcycle commercial license certified.',
    passportDocument: {
      fileName: 'caribbean_driver_passport.pdf',
      fileSize: '3.1 MB',
      fileType: 'application/pdf',
      uploadedAt: '2026-03-01T08:20:00.000Z',
      passportNumber: 'P90283411',
      issuingCountry: 'Haiti (HT)',
      expirationDate: '2032-05-14',
    },
  };

  // Driver Personal Profile
  const [fullName, setFullName] = useState(driverData.fullName);
  const [phoneNumber, setPhoneNumber] = useState(driverData.phone);
  const [emergencyContact, setEmergencyContact] = useState(driverData.emergencyContact);

  // Vehicle Information
  const [motorcycleModel, setMotorcycleModel] = useState(driverData.motorcycleModel);
  const [plateNumber, setPlateNumber] = useState(driverData.plateNumber);
  const [hasDualHelmets, setHasDualHelmets] = useState(true);
  const [vehicleInspectionDate, setVehicleInspectionDate] = useState('2026-02-15');

  // Payout & Financial Settings
  const [monCashPayoutPhone, setMonCashPayoutPhone] = useState(
    region === 'haiti' ? '3784-9912' : '694-28-19'
  );
  const [payoutFrequency, setPayoutFrequency] = useState<'instant' | 'daily'>('instant');
  const [autoDepositEarnings, setAutoDepositEarnings] = useState(true);

  // Dispatch & Operating Preferences
  const [autoAcceptNearby, setAutoAcceptNearby] = useState(false);
  const [acceptCashPayments, setAcceptCashPayments] = useState(true);
  const [maxTripRadiusKm, setMaxTripRadiusKm] = useState<number>(15);
  const [audioNavAlerts, setAudioNavAlerts] = useState(true);

  // Document Records
  const [documents, setDocuments] = useState([
    {
      id: 'doc_1',
      title: "Driver's License (Permis de Conduire)",
      number: 'HT-DL-2024-88391',
      expiry: '2028-04-30',
      status: 'verified' as const
    },
    {
      id: 'doc_2',
      title: 'Vehicle Registration (Carte Grise)',
      number: 'CG-YAM-9921',
      expiry: '2027-02-10',
      status: 'verified' as const
    },
    {
      id: 'doc_3',
      title: 'Commercial Passenger Insurance',
      number: 'INS-WAP-PASS-2026',
      expiry: '2027-03-01',
      status: 'verified' as const
    }
  ]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveDriverAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(
      language === 'ht'
        ? 'Enfòmasyon chofè ak motosiklèt ou anrejistre avèk siksè nan sistèm Wap la!'
        : 'Profil conducteur et informations du véhicule mis à jour avec succès !'
    );
    onPlaySpeech(
      language === 'ht'
        ? 'Pwofil chofè ou anrejistre. Ou pare pou resevwa kous sou motosiklèt ou.'
        : 'Profil chauffeur mis à jour. Prêt pour les courses moto.'
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto space-y-6">
      {/* Header Driver Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border border-amber-300 flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg">
              <Bike className="w-9 h-9" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-900 flex items-center justify-center" title="DOT Certified">
              <Check className="w-3 h-3 text-neutral-950 stroke-[3]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Verified Fleet Partner
              </span>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                ★ {driverData.rating}
              </span>
              <span className="text-neutral-600">•</span>
              <span>{driverData.totalTrips} Kous fini</span>
              <span className="text-neutral-600">•</span>
              <span className="font-mono text-neutral-300">{driverData.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back to Radar
            </button>
          )}
          <button
            onClick={() => {
              onPlaySpeech(
                language === 'ht'
                  ? `Bonjou kanmarad ${fullName}. Ou nan meni jesyon kont chofè ou. Ou ka mete ajou nimewo MonCash ou pou resevwa lajan san komisyon, epi wè dokiman motosiklèt ou.`
                  : `Bonjour partenaire ${fullName}. Vous êtes dans vos paramètres chauffeur. Gérez votre virement MonCash 0% commission et vos documents de bord.`
              );
            }}
            className="px-3 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice Guide</span>
          </button>
        </div>
      </div>

      {/* Identity Verification Status in Driver Profile Header */}
      <div className="bg-neutral-950/90 border border-amber-500/20 rounded-2xl p-4 shadow-md">
        <IdentityVerificationStatusWidget
          user={activeDriverUser}
          onUpdateUserVerification={onUpdateUserVerification}
          compact={false}
        />
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <form onSubmit={handleSaveDriverAccount} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Driver Info & Vehicle Hardware */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Driver Contact & Identity */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Driver Contact & Emergency Info</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Family Emergency Contact (Non ak nimewo pou ka ijans):
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Section 2: Motorcycle Hardware & Helmet Compliance */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Bike className="w-4 h-4" />
                <span>Motorcycle Specifications & Safety Gear</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Make & Model</label>
                  <input
                    type="text"
                    value={motorcycleModel}
                    onChange={(e) => setMotorcycleModel(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Official License Plate</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Helmet Verification Compliance Banner */}
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Dual Passenger Helmet Compliance</div>
                    <div className="text-[10px] text-emerald-300">
                      DOT/ECE Certified passenger helmet present on motorcycle
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasDualHelmets}
                  onChange={(e) => setHasDualHelmets(e.target.checked)}
                  className="accent-emerald-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Section 3: Document Verification Status */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                <span>Verified Legal Documents (Papiye Motosiklèt)</span>
              </h3>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{doc.title}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {doc.number} • Valid through {doc.expiry}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Active & Valid
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Instant Payouts & Shift Preferences */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section 4: Instant Fee-Free Payouts */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>0% Fee Instant Payout Rails</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-full font-bold">
                  0% Commission
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Linked MonCash Mobile Payout Phone:
                </label>
                <input
                  type="text"
                  value={monCashPayoutPhone}
                  onChange={(e) => setMonCashPayoutPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-neutral-400">Cash-Out Schedule:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutFrequency('instant')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      payoutFrequency === 'instant'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    ⚡ Instant On-Demand
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutFrequency('daily')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      payoutFrequency === 'daily'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    🌙 Daily Auto-Sweep
                  </button>
                </div>
              </div>
            </div>

            {/* Section 5: Shift & Dispatch Preferences */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Shift Dispatch Controls</span>
              </h3>

              <div className="space-y-3">
                {/* Max Trip Radius */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-neutral-400">Maximum Pickup Radius:</span>
                    <span className="text-amber-400 font-bold">{maxTripRadiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    value={maxTripRadiusKm}
                    onChange={(e) => setMaxTripRadiusKm(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Cash Acceptance Toggle */}
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Accept Cash-on-Dropoff</div>
                    <div className="text-[10px] text-neutral-400">Collect paper gourdes or euros directly</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={acceptCashPayments}
                    onChange={(e) => setAcceptCashPayments(e.target.checked)}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Voice Navigation Alerts */}
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Voice Route Maneuvers</div>
                      <div className="text-[10px] text-neutral-400">Audio navigation in Haitian Creole/French</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioNavAlerts}
                    onChange={(e) => setAudioNavAlerts(e.target.checked)}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold rounded-2xl text-xs transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Driver Account & Preferences</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

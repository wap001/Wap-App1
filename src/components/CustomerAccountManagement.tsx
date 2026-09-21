import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Lock,
  Bell,
  Shield,
  Coins,
  CheckCircle2,
  Sparkles,
  Save,
  Volume2,
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  Globe,
  Radio,
  Smartphone,
  Check,
  KeyRound
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';
import { IdentityVerificationStatusWidget } from './IdentityVerificationStatusWidget';
import { AuthUserData } from './WelcomeLandingInterface';

interface CustomerAccountManagementProps {
  region: RegionId;
  language: LanguageCode;
  onPlaySpeech: (text: string) => void;
  onClose?: () => void;
  currentUser?: AuthUserData | null;
  onUpdateUserVerification?: (updatedUser: AuthUserData) => void;
}

interface SavedAddress {
  id: string;
  label: string;
  icon: string;
  address: string;
}

export const CustomerAccountManagement: React.FC<CustomerAccountManagementProps> = ({
  region,
  language,
  onPlaySpeech,
  onClose,
  currentUser,
  onUpdateUserVerification,
}) => {
  const currentRegion = REGIONS[region];

  // Fallback demo user if not passed
  const activeUser: AuthUserData = currentUser || {
    id: 'usr_customer_daphnee',
    name: 'Daphnée Lamour',
    email: 'daphnee.lamour@wap-customer.ht',
    phone: region === 'haiti' ? '+509 3712-8821' : '+594 694 45 22 10',
    role: 'customer',
    region,
    subscriptionTier: 'freedom_plus',
    subscriptionName: 'Wap Plus Freedom Pass',
    lbcBonus: 2850,
    signedUpAt: '2026-03-12T10:00:00.000Z',
    verificationStatus: 'pending',
    verificationProgress: 65,
    verificationNotes: 'Official passport scan submitted and undergoing automated MRZ checksum check.',
    passportDocument: {
      fileName: 'republic_haiti_passport_scan.pdf',
      fileSize: '2.4 MB',
      fileType: 'application/pdf',
      uploadedAt: '2026-03-12T10:15:00.000Z',
      passportNumber: 'P48291032',
      issuingCountry: 'Haiti (HT)',
      expirationDate: '2031-10-18',
    },
  };

  // Profile Information
  const [fullName, setFullName] = useState('Daphnée Lamour');
  const [phoneNumber, setPhoneNumber] = useState(
    region === 'haiti'
      ? '+509 3712-8821'
      : region === 'french_guiana'
      ? '+594 694 45 22 10'
      : region === 'guyana'
      ? '+592 612 9944'
      : '+597 812 3456'
  );
  const [emailAddress, setEmailAddress] = useState('daphnee.lamour@wap.ht');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr_1',
      label: 'Lakay (Home)',
      icon: '🏠',
      address:
        region === 'haiti'
          ? 'Delmas 33, devan Famasi Nouvelle Génération'
          : region === 'french_guiana'
          ? 'Cayenne, Rond-Point du Vieux Port'
          : 'Georgetown, near Stabroek Clock'
    },
    {
      id: 'addr_2',
      label: 'Travay (Work)',
      icon: '🏢',
      address:
        region === 'haiti'
          ? 'Pétion-Ville, akote Otèl Kinam'
          : region === 'french_guiana'
          ? 'Rémire-Montjoly, Cité Médan'
          : 'Kitty, Alexander Street corner'
    },
    {
      id: 'addr_3',
      label: 'Mache (Market & Boutik)',
      icon: '🛒',
      address:
        region === 'haiti'
          ? 'Kafou Ayewopò, mache piblik'
          : region === 'french_guiana'
          ? 'Marché Central de Cayenne'
          : 'Bourda Market'
    }
  ]);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressValue, setNewAddressValue] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Payment & Mobile Money
  const [monCashNumber, setMonCashNumber] = useState(
    region === 'haiti' ? '3712-8821' : '694-45-22'
  );
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'moncash' | 'cash' | 'lbc'>('moncash');
  const [autoReinvestDividends, setAutoReinvestDividends] = useState(true);

  // Security & PIN
  const [transactionPin, setTransactionPin] = useState('****');
  const [newPin, setNewPin] = useState('');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [emergencyContactName, setEmergencyContactName] = useState('Marc-Antoine Lamour');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+509 3844-9011');

  // Notification Preferences
  const [audioVoiceGuidance, setAudioVoiceGuidance] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [dataSaverMode, setDataSaverMode] = useState(false);

  // Feedback State
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(
      language === 'ht'
        ? 'Enfòmasyon kont ou sovgade avèk siksè nan aplikasyon Wap la!'
        : 'Vos informations de compte ont été enregistrées avec succès !'
    );
    onPlaySpeech(
      language === 'ht'
        ? 'Kont ou mete ajou avèk siksè.'
        : 'Votre compte client a été mis à jour avec succès.'
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleAddAddress = () => {
    if (!newAddressLabel.trim() || !newAddressValue.trim()) return;
    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      label: newAddressLabel.trim(),
      icon: '📍',
      address: newAddressValue.trim()
    };
    setSavedAddresses((prev) => [...prev, newAddr]);
    setNewAddressLabel('');
    setNewAddressValue('');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdatePin = () => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      setTransactionPin(newPin);
      setIsEditingPin(false);
      setNewPin('');
      setSaveSuccessMsg('Nouvo kòd PIN 4-chif ou anrejistre avèk siksè!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto space-y-6">
      {/* Header Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg">
              {fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-900 flex items-center justify-center" title="Account Verified">
              <Check className="w-3 h-3 text-neutral-950 stroke-[3]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                Gold Passenger
              </span>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              <span>{phoneNumber}</span>
              <span className="text-neutral-600">•</span>
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              <span>{emailAddress}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back to Rides
            </button>
          )}
          <button
            onClick={() => {
              onPlaySpeech(
                language === 'ht'
                  ? `Bonjou ${fullName}. Ou nan meni jesyon kont ou. Isit la ou ka modifye adrès ou, metòd peman MonCash ou, ak sekirite ou san w pa bezwen ale sou lòt paj.`
                  : `Bonjour ${fullName}. Vous êtes dans les paramètres de votre compte client. Vous pouvez gérer vos adresses, paiements et sécurité ici.`
              );
            }}
            className="px-3 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice Guide</span>
          </button>
        </div>
      </div>

      {/* Identity Verification Status in Customer Profile Header */}
      <div className="bg-neutral-950/90 border border-amber-500/20 rounded-2xl p-4 shadow-md">
        <IdentityVerificationStatusWidget
          user={activeUser}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Info & Saved Addresses */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Personal Profile Form */}
          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Personal Details (Enfòmasyon Pèsonèl)</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile Info</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Saved Frequent Places */}
          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Saved Frequent Places (Kote m abitye ale)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Place</span>
              </button>
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Place Label (e.g. Legliz)"
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Exact Landmark Address"
                    value={newAddressValue}
                    onChange={(e) => setNewAddressValue(e.target.value)}
                    className="sm:col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="px-3 py-1 bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold"
                  >
                    Save Landmark
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{addr.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{addr.label}</div>
                      <div className="text-[11px] text-neutral-400">{addr.address}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-neutral-500 hover:text-red-400 p-1.5 transition"
                    title="Remove address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment, LBC Wallet, Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 3: In-App Payment Rails */}
          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Payment & Mobile Money (Peman & MonCash)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Linked MonCash / Mobile Money Number:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={monCashNumber}
                    onChange={(e) => setMonCashNumber(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 pl-10"
                  />
                  <Smartphone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Default Payment Rail:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultPaymentMethod('moncash')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      defaultPaymentMethod === 'moncash'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    MonCash
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultPaymentMethod('cash')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      defaultPaymentMethod === 'cash'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultPaymentMethod('lbc')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      defaultPaymentMethod === 'lbc'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    LBC Wallet
                  </button>
                </div>
              </div>

              {/* Liberté Cash Wealth Reinvestment */}
              <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Reinvest LBC Cashback</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Compound ride rewards into portfolio dividends
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoReinvestDividends}
                  onChange={(e) => setAutoReinvestDividends(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Security & Emergency Contacts */}
          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>In-App Security & SOS Contact (Sekirite)</span>
            </h3>

            <div className="space-y-3">
              {/* 4-Digit In-App Payment PIN */}
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">4-Digit In-App Transaction PIN</div>
                  <div className="text-[11px] text-neutral-400">Protects wallet cashouts & orders</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tracking-widest text-amber-400 font-bold">
                    {transactionPin}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPin(!isEditingPin)}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold rounded-lg"
                  >
                    Change
                  </button>
                </div>
              </div>

              {isEditingPin && (
                <div className="p-3 bg-neutral-900 border border-amber-400/40 rounded-xl space-y-2 animate-fade-in">
                  <label className="text-[11px] text-neutral-300 block">Enter New 4-Digit PIN:</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="****"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-28 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-center text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleUpdatePin}
                      disabled={newPin.length !== 4}
                      className="px-3 py-1.5 bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs disabled:opacity-50"
                    >
                      Confirm PIN
                    </button>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Designated Emergency Contact (SOS Beacon recipient):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact Name"
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Emergency Phone"
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Voice Guidance & Audio Accessibility */}
              <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-neutral-300">Voice Assistant Auto-Prompts</span>
                </div>
                <input
                  type="checkbox"
                  checked={audioVoiceGuidance}
                  onChange={(e) => setAudioVoiceGuidance(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

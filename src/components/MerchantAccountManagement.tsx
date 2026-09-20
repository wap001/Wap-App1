import React, { useState } from 'react';
import {
  Store,
  User,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  DollarSign,
  ShieldCheck,
  Save,
  CheckCircle2,
  Volume2,
  Sliders,
  Check,
  PackageCheck,
  ChefHat,
  Sparkles
} from 'lucide-react';
import { RegionId, LanguageCode, VendorProfile } from '../types/architecture';
import { REGIONS, MOCK_VENDORS } from '../data/mockData';

interface MerchantAccountManagementProps {
  region: RegionId;
  language: LanguageCode;
  onPlaySpeech: (text: string) => void;
  onClose?: () => void;
}

export const MerchantAccountManagement: React.FC<MerchantAccountManagementProps> = ({
  region,
  language,
  onPlaySpeech,
  onClose
}) => {
  const currentRegion = REGIONS[region];
  const vendorData = MOCK_VENDORS.find((v) => v.region === region) || MOCK_VENDORS[0];

  // Store & Owner Profile
  const [storeName, setStoreName] = useState(vendorData.name);
  const [ownerName, setOwnerName] = useState(vendorData.ownerName);
  const [businessCategory, setBusinessCategory] = useState<string>(vendorData.businessType);
  const [storePhone, setStorePhone] = useState(vendorData.phone);
  const [pickupLandmark, setPickupLandmark] = useState(vendorData.addressLandmark);
  const [courierPickupInstructions, setCourierPickupInstructions] = useState(
    'Motosiklis yo ka pake moto a sou bò dwat la devan boutik la epi mande pou Madan Roseline.'
  );

  // Operating Hours & Dispatch Settings
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [autoDispatchMoto, setAutoDispatchMoto] = useState(true);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(20);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(8);

  // Settlement & Payout Preferences
  const [monCashMerchantNumber, setMonCashMerchantNumber] = useState(
    region === 'haiti' ? '3621-0044' : '594-32-11'
  );
  const [bankSettlementAccount, setBankSettlementAccount] = useState('SOGEBANK-CHK-992104-HT');
  const [dailyAutoSweep, setDailyAutoSweep] = useState(true);

  // Packaging Compliance
  const [spillProofCertified, setSpillProofCertified] = useState(true);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveMerchantProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(
      language === 'ht'
        ? 'Enfòmasyon boutik ou ak kont peman MonCash la sovgade avèk siksè nan Wap!'
        : 'Profil commerce et paramètres de paiement enregistrés avec succès !'
    );
    onPlaySpeech(
      language === 'ht'
        ? `Boutik ${storeName} mete ajou. Chofè moto Wap yo ap resevwa enstriksyon egzak yo.`
        : `Commerce ${storeName} mis à jour avec succès.`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto space-y-6">
      {/* Header Merchant Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border border-amber-300 flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg">
              <Store className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-900 flex items-center justify-center" title="Verified Merchant">
              <Check className="w-3 h-3 text-neutral-950 stroke-[3]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{storeName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Verified Merchant Partner
              </span>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
              <span>{ownerName}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-amber-400 font-bold">★ {vendorData.rating}</span>
              <span className="text-neutral-600">•</span>
              <span className="font-mono text-neutral-300">{storePhone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Back to Orders
            </button>
          )}
          <button
            onClick={() => {
              onPlaySpeech(
                language === 'ht'
                  ? `Bonjou ${ownerName}. Isit la ou ka jere detay boutik ${storeName}, mete ajou orè ouvèti, nimewo MonCash pou resevwa peman, ak enstriksyon pou chofè moto yo.`
                  : `Bonjour ${ownerName}. Gérez les paramètres de votre commerce, coordonnées MonCash et consignes de retrait pour les livreurs moto.`
              );
            }}
            className="px-3 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice Guide</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveMerchantProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Store Details & Physical Location */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Business Identity */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>Store Information (Enfòmasyon Boutik / Restoran)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Commerce / Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Manager / Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Business Category</label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="restaurant_kiosk">Haitian Creole Restaurant & Grill</option>
                    <option value="grocery_market">Neighborhood Grocery & Boutik</option>
                    <option value="hardware_parts">Motorcycle Spare Parts & Hardware</option>
                    <option value="pharmacy">Local Community Pharmacy</option>
                    <option value="remittance_agent">Transfert & Mobile Money Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Store Phone Line</label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Physical Landmark & Moto Pickup Directions */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Landmark Location & Moto Courier Directions</span>
              </h3>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Public Landmark Address (for GPS & Maps):
                </label>
                <input
                  type="text"
                  value={pickupLandmark}
                  onChange={(e) => setPickupLandmark(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Moto Courier Pickup Gate Instructions:
                </label>
                <textarea
                  rows={2}
                  value={courierPickupInstructions}
                  onChange={(e) => setCourierPickupInstructions(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Packaging Standards Verification */}
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Motorcycle Spill-Proof Packaging</div>
                    <div className="text-[10px] text-neutral-400">
                      Heat-sealed containers & tamper-evident safety seals
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={spillProofCertified}
                  onChange={(e) => setSpillProofCertified(e.target.checked)}
                  className="accent-emerald-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Dispatch Settings & Payout Preferences */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section 3: Open Status & Dispatch Radii */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Operating Hours & Moto Dispatch</span>
              </h3>

              {/* Open / Closed Switch */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Accepting Orders Now</div>
                  <div className="text-[10px] text-neutral-400">Toggle offline during break or closing</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenNow(!isOpenNow)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isOpenNow
                      ? 'bg-emerald-500 text-neutral-950 shadow-md'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {isOpenNow ? '🟢 Open (Ouvè)' : '🔴 Closed (Fèmen)'}
                </button>
              </div>

              {/* Prep Time Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-neutral-400">Average Kitchen Prep Time:</span>
                  <span className="text-amber-400 font-bold">{prepTimeMinutes} minutes</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Delivery Radius Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-neutral-400">Maximum Delivery Radius:</span>
                  <span className="text-amber-400 font-bold">{deliveryRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={deliveryRadiusKm}
                  onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Auto-Dispatch Courier */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Auto-Hail Nearby Moto Courier</div>
                  <div className="text-[10px] text-neutral-400">Automatically dispatches driver upon order approval</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoDispatchMoto}
                  onChange={(e) => setAutoDispatchMoto(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Section 4: Settlement & 0% Fee Payouts */}
            <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Settlement & Bank Payouts</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-bold">
                  0% Swipe Fees
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  MonCash Merchant Business Phone:
                </label>
                <input
                  type="text"
                  value={monCashMerchantNumber}
                  onChange={(e) => setMonCashMerchantNumber(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Commercial Bank Account (RIB / IBAN):
                </label>
                <input
                  type="text"
                  value={bankSettlementAccount}
                  onChange={(e) => setBankSettlementAccount(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold rounded-2xl text-xs transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Merchant Profile & Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

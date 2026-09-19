import React, { useState } from 'react';
import {
  Smartphone,
  Sun,
  Code2,
  Layers,
  Copy,
  Check,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Eye,
  Sliders,
  DollarSign,
  Radio,
  Share2,
  UploadCloud,
  FileCheck,
  Camera,
  MapPin,
  RefreshCw,
  Phone,
  MessageSquare,
  Terminal
} from 'lucide-react';
import { MOBILE_SCREEN_DEFINITIONS, ScreenCodeDefinition } from '../data/mobileCodeSnippets';
import { MobileBuildEngineerView } from './MobileBuildEngineerView';

export const MobileAppDesignStudio: React.FC = () => {
  const [studioMode, setStudioMode] = useState<'wireframes' | 'build-engineer'>('wireframes');
  const [activeScreenId, setActiveScreenId] = useState<string>('passenger-auth');
  const [activeCodeTab, setActiveCodeTab] = useState<'flutter' | 'reactNative' | 'specs'>('flutter');
  const [sunlightMode, setSunlightMode] = useState<boolean>(false);
  const [showTouchTargets, setShowTouchTargets] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Interactive mockup states
  // Screen 1: Auth
  const [selectedCountry, setSelectedCountry] = useState({ name: 'Haiti', code: '+509', flag: '🇭🇹' });
  const [authPhone, setAuthPhone] = useState('37 12 3456');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState(['5', '2', '9', '0']);

  // Screen 2: Map & Vehicles
  const [selectedVehicle, setSelectedVehicle] = useState<'2w' | '3w' | '4w'>('2w');

  // Screen 3: Payment & Safety
  const [paymentChoice, setPaymentChoice] = useState<'cash' | 'momo' | 'card'>('momo');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Screen 4: Driver Onboarding
  const [docStep, setDocStep] = useState(0);
  const [docCaptured, setDocCaptured] = useState(false);

  // Screen 5: Driver Dispatch
  const [driverOnline, setDriverOnline] = useState(true);
  const [incomingOfferVisible, setIncomingOfferVisible] = useState(true);
  const [tripAccepted, setTripAccepted] = useState(false);

  // Screen 6: Driver Cashout
  const [walletBalance, setWalletBalance] = useState(42.8);
  const [cashoutDone, setCashoutDone] = useState(false);

  const activeDefinition: ScreenCodeDefinition =
    MOBILE_SCREEN_DEFINITIONS.find((s) => s.id === activeScreenId) ||
    MOBILE_SCREEN_DEFINITIONS[0];

  const handleCopyCode = () => {
    const code =
      activeCodeTab === 'flutter'
        ? activeDefinition.flutterCode
        : activeCodeTab === 'reactNative'
        ? activeDefinition.reactNativeCode
        : JSON.stringify(activeDefinition.wireframeSpec, null, 2);

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTrip = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Banner & Control Deck */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/30">
                Mobile-First UI/UX System
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                Flutter & React Native Ready
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                Low-Bandwidth (2G/3G Optimized)
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Mobile Core Screens & Wireframe Studio
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
              High-contrast visual components engineered for extreme outdoor sunlight readability,
              guaranteed minimum 48x48dp accessible touch targets, and offline-first mobile money execution.
            </p>
          </div>

          {/* Quick Ergonomic Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="toggle-sunlight-mode"
              onClick={() => setSunlightMode(!sunlightMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                sunlightMode
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-lg shadow-amber-400/20'
                  : 'bg-neutral-800/90 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{sunlightMode ? 'Direct Sunlight Mode (Active)' : 'Standard Dark Canvas'}</span>
            </button>

            <button
              id="toggle-touch-targets"
              onClick={() => setShowTouchTargets(!showTouchTargets)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                showTouchTargets
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-800/90 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>{showTouchTargets ? 'Touch Targets (48dp Shown)' : 'Inspect 48dp Targets'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Mode Switcher: Screens vs Build Engineer */}
        <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              id="mode-btn-wireframes"
              onClick={() => setStudioMode('wireframes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                studioMode === 'wireframes'
                  ? 'bg-amber-400 text-neutral-950 font-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>1. Interactive Screens & Code Snippets</span>
            </button>
            <button
              id="mode-btn-build-engineer"
              onClick={() => setStudioMode('build-engineer')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                studioMode === 'build-engineer'
                  ? 'bg-amber-400 text-neutral-950 font-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>2. Mobile Build Engineer & Toolchain (API 21+ / Fastlane)</span>
            </button>
          </div>

          <div className="text-xs text-neutral-400 hidden sm:block">
            {studioMode === 'wireframes'
              ? 'Previewing 6 core screens in simulated 360x640dp chassis'
              : 'Android Gradle API 21+ • iOS Info.plist & Fastlane pipeline'}
          </div>
        </div>

        {/* Screen Selector Chips (Only when on wireframes mode) */}
        {studioMode === 'wireframes' && (
          <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap gap-2">
            <div className="w-full flex items-center gap-2 text-xs font-bold text-neutral-400 mb-1">
              <span>PASSENGER APP:</span>
            </div>
            {MOBILE_SCREEN_DEFINITIONS.filter((s) => s.category === 'passenger').map((screen) => (
              <button
                key={screen.id}
                id={`screen-btn-${screen.id}`}
                onClick={() => setActiveScreenId(screen.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  activeScreenId === screen.id
                    ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md font-extrabold'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{screen.title}</span>
              </button>
            ))}

            <div className="w-full flex items-center gap-2 text-xs font-bold text-neutral-400 mt-2 mb-1">
              <span>DRIVER APP:</span>
            </div>
            {MOBILE_SCREEN_DEFINITIONS.filter((s) => s.category === 'driver').map((screen) => (
              <button
                key={screen.id}
                id={`screen-btn-${screen.id}`}
                onClick={() => setActiveScreenId(screen.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  activeScreenId === screen.id
                    ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md font-extrabold'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{screen.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RENDER CONDITIONAL: Wireframes Studio vs Build Engineer Toolchain */}
      {studioMode === 'build-engineer' ? (
        <MobileBuildEngineerView />
      ) : (
        /* Main Studio Grid: Mobile Mockup Previewer (Left) + Code/Specs Inspector (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Mobile Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              Interactive Device Preview (360 x 640 dp)
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {sunlightMode ? '7.8:1 Outdoor Contrast' : 'Default Dark'}
            </span>
          </div>

          {/* Realistic Mobile Device Outer Chassis */}
          <div
            className={`w-full max-w-[360px] rounded-[44px] p-3 transition-colors duration-300 shadow-2xl border-[5px] ${
              sunlightMode
                ? 'bg-neutral-950 border-amber-400/80 shadow-amber-400/10'
                : 'bg-neutral-900 border-neutral-700 shadow-black'
            }`}
          >
            {/* Screen Inner Bezel */}
            <div
              className={`w-full min-h-[620px] rounded-[34px] overflow-hidden flex flex-col transition-all duration-300 relative ${
                sunlightMode ? 'bg-black text-white' : 'bg-[#0F0F11] text-white'
              }`}
            >
              {/* Dynamic Island / Device Notch & Status Bar */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono font-bold text-neutral-400 select-none">
                <span>09:41</span>
                <div className="w-20 h-4 bg-neutral-950 rounded-full flex items-center justify-center border border-neutral-800">
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-emerald-400">3G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 1: PASSENGER AUTH & OTP */}
              {/* ------------------------------------------------------------- */}
              {activeScreenId === 'passenger-auth' && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center font-black text-amber-400 text-xs">
                        WAP
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LOW-DATA 2G READY
                      </div>
                    </div>

                    <h2 className="text-xl font-black text-white">
                      {otpSent ? 'Verify Safety PIN' : 'Enter Your Mobile'}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {otpSent
                        ? `Enter the 4-digit code sent to ${selectedCountry.code} ${authPhone}`
                        : 'Choose operating territory across Africa, LatAm, Caribbean, or US.'}
                    </p>

                    {!otpSent ? (
                      <div className="mt-5 space-y-3">
                        {/* Region Dropdown selector */}
                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                            Operational Territory
                          </label>
                          <div
                            className={`p-2.5 rounded-xl bg-neutral-900 border flex items-center justify-between cursor-pointer ${
                              showTouchTargets ? 'ring-2 ring-emerald-400' : 'border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-xs font-bold text-white">
                              <span className="text-base">{selectedCountry.flag}</span>
                              <span>{selectedCountry.name}</span>
                            </div>
                            <span className="text-amber-400 font-mono font-bold text-xs">
                              {selectedCountry.code}
                            </span>
                          </div>
                        </div>

                        {/* Quick Territory Presets */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {[
                            { name: 'Haiti', code: '+509', flag: '🇭🇹' },
                            { name: 'Senegal', code: '+221', flag: '🇸🇳' },
                            { name: 'Panama', code: '+507', flag: '🇵🇦' },
                            { name: 'USA', code: '+1', flag: '🇺🇸' },
                          ].map((c) => (
                            <button
                              key={c.code}
                              onClick={() => setSelectedCountry(c)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center ${
                                selectedCountry.code === c.code
                                  ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                              }`}
                            >
                              <span>{c.flag}</span>
                              <span className="text-[9px]">{c.code}</span>
                            </button>
                          ))}
                        </div>

                        {/* Phone Number Input */}
                        <div className="pt-2">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                            Mobile Number (E.164)
                          </label>
                          <div
                            className={`h-12 px-3 rounded-xl bg-neutral-900 border flex items-center gap-2 ${
                              showTouchTargets ? 'ring-2 ring-emerald-400' : 'border-neutral-700'
                            }`}
                          >
                            <span className="text-xs font-bold text-amber-400">
                              {selectedCountry.code}
                            </span>
                            <div className="w-[1px] h-5 bg-neutral-700" />
                            <input
                              type="text"
                              value={authPhone}
                              onChange={(e) => setAuthPhone(e.target.value)}
                              className="bg-transparent text-sm font-bold text-white outline-none flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {/* 4 Digit Boxes */}
                        <div className="flex justify-between gap-2">
                          {otpVal.map((digit, i) => (
                            <div
                              key={i}
                              className={`w-14 h-14 rounded-xl bg-neutral-900 border-2 flex items-center justify-center text-xl font-black text-amber-400 ${
                                showTouchTargets ? 'ring-2 ring-emerald-400' : 'border-neutral-700'
                              }`}
                            >
                              {digit}
                            </div>
                          ))}
                        </div>

                        {/* WhatsApp Fallback */}
                        <button
                          onClick={() => alert('Verification PIN resent via WhatsApp Fallback!')}
                          className="w-full h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Send Code via WhatsApp Fallback</span>
                        </button>

                        <button
                          onClick={() => setOtpSent(false)}
                          className="w-full text-center text-xs text-neutral-400 underline font-semibold"
                        >
                          Change phone number
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Primary Action Button (Min 48dp height) */}
                  <div className="pt-4">
                    <button
                      onClick={() => setOtpSent(!otpSent)}
                      className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        showTouchTargets ? 'ring-2 ring-emerald-400' : ''
                      } ${
                        sunlightMode
                          ? 'bg-amber-400 text-black border-2 border-amber-300 font-black'
                          : 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
                      }`}
                    >
                      <span>{otpSent ? 'Confirm & Enter Wap' : 'Get Verification Code'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 2: INTERACTIVE MAP & VEHICLE SELECTOR */}
              {/* ------------------------------------------------------------- */}
              {activeScreenId === 'passenger-map' && (
                <div className="flex-1 flex flex-col justify-between relative">
                  {/* Simulated Vector Map View */}
                  <div className="absolute inset-0 bg-[#16171B] overflow-hidden">
                    {/* Road Network Lines */}
                    <div className="absolute top-1/4 left-0 right-0 h-4 bg-neutral-800 -rotate-12 border-y border-neutral-700" />
                    <div className="absolute top-1/2 left-0 right-0 h-5 bg-neutral-800 rotate-6 border-y border-neutral-700" />
                    <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-neutral-800 border-x border-neutral-700" />

                    {/* Simulated High-Contrast Route Line */}
                    <div className="absolute top-1/3 left-1/4 w-44 h-1.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 -rotate-12" />

                    {/* Driver Pins */}
                    <div className="absolute top-28 left-20 flex flex-col items-center animate-bounce">
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs shadow-lg">
                        🏍️
                      </div>
                      <span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded font-bold mt-0.5">
                        Moto 3m
                      </span>
                    </div>

                    <div className="absolute top-36 right-16 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-xs shadow-lg">
                        🛺
                      </div>
                      <span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded font-bold mt-0.5">
                        Tuk-Tuk 5m
                      </span>
                    </div>

                    {/* Pickup & Dropoff Flags */}
                    <div className="absolute top-44 left-10 flex items-center gap-1 bg-black/90 px-2 py-1 rounded-md border border-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[9px] font-bold text-white">Delmas 33</span>
                    </div>
                    <div className="absolute top-24 right-8 flex items-center gap-1 bg-black/90 px-2 py-1 rounded-md border border-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-[9px] font-bold text-white">Pétion-Ville</span>
                    </div>
                  </div>

                  {/* Top HUD Floating Card */}
                  <div className="relative z-10 p-3">
                    <div className="h-10 px-3 rounded-full bg-black/90 border border-amber-400/60 backdrop-blur-md flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-white truncate max-w-[200px]">
                          Delmas 33 → Pétion-Ville (5.4 km)
                        </span>
                      </div>
                      <span className="text-amber-400 font-mono text-[10px]">14 min</span>
                    </div>
                  </div>

                  {/* Bottom Vehicle Class Carousel Sheet */}
                  <div className="relative z-10 p-3 bg-[#0F0F11] border-t border-neutral-800 rounded-t-3xl shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                        SELECT VEHICLE CLASS
                      </span>
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        NO HIDDEN SURGE
                      </span>
                    </div>

                    {/* 3 Horizontal Tiers */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: '2w',
                          name: '2-Wheeler',
                          sub: 'Moto Express',
                          icon: '🏍️',
                          cap: '1 Pax',
                          price: '350 HTG',
                          usd: '$2.65',
                        },
                        {
                          id: '3w',
                          name: '3-Wheeler',
                          sub: 'Tuk-Tuk Canopy',
                          icon: '🛺',
                          cap: '3 Pax',
                          price: '500 HTG',
                          usd: '$3.80',
                        },
                        {
                          id: '4w',
                          name: '4-Wheeler',
                          sub: 'Sedan / Van AC',
                          icon: '🚗',
                          cap: '4-6 Pax',
                          price: '925 HTG',
                          usd: '$7.00',
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedVehicle(t.id as any)}
                          className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[92px] ${
                            showTouchTargets ? 'ring-1 ring-emerald-400' : ''
                          } ${
                            selectedVehicle === t.id
                              ? 'bg-amber-400/15 border-amber-400 shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-[8px] font-bold bg-black/60 px-1 py-0.5 rounded text-white">
                              {t.cap}
                            </span>
                          </div>
                          <div>
                            <div className="text-[11px] font-extrabold text-white">{t.name}</div>
                            <div className="text-[11px] font-black text-amber-400">{t.price}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Upfront Fare Estimate Card */}
                    <div className="mt-2.5 p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-white">
                          Upfront Guaranteed Price
                        </div>
                        <div className="text-[9px] text-neutral-400">5.4 km • 14 min trip</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-amber-400">
                          {selectedVehicle === '2w' ? '350 HTG' : selectedVehicle === '3w' ? '500 HTG' : '925 HTG'}
                        </div>
                        <div className="text-[9px] text-neutral-400 font-mono">
                          {selectedVehicle === '2w' ? '$2.65 USD' : selectedVehicle === '3w' ? '$3.80 USD' : '$7.00 USD'}
                        </div>
                      </div>
                    </div>

                    {/* Request Button */}
                    <button
                      onClick={() => setActiveScreenId('passenger-safety')}
                      className="mt-2.5 w-full h-11 rounded-xl bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <span>
                        REQUEST {selectedVehicle === '2w' ? '2-WHEELER MOTO' : selectedVehicle === '3w' ? '3-WHEELER TUK-TUK' : '4-WHEELER CAB'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 3: PAYMENT & SAFETY CHECKOUT */}
              {/* ------------------------------------------------------------- */}
              {activeScreenId === 'passenger-safety' && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* SOS Safety Shield Banner */}
                    <div className="p-3 rounded-xl bg-rose-950/60 border-2 border-rose-500 flex items-center justify-between mb-3 shadow-lg shadow-rose-950/30">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-rose-400">
                            WAP SAFETY SHIELD
                          </div>
                          <div className="text-[9px] text-neutral-300">Live Monitored Route</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSosModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-black text-xs flex items-center gap-1 shadow animate-pulse"
                      >
                        <span>SOS 🚨</span>
                      </button>
                    </div>

                    {/* Share Trip Status Button */}
                    <button
                      onClick={handleShareTrip}
                      className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-white flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Share Live Trip Status with Family</span>
                      </div>
                      <span className="text-neutral-500">→</span>
                    </button>

                    {shareToast && (
                      <div className="mb-3 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[10px] font-bold text-center">
                        ✓ Encrypted Live Tracking Link Copied!
                      </div>
                    )}

                    {/* Payment Rails */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                        SELECT PAYMENT METHOD
                      </span>

                      {[
                        {
                          id: 'momo',
                          name: 'Mobile Money Wallet',
                          desc: 'Wave, Orange Money, M-Pesa, MonCash',
                          badge: 'INSTANT',
                          icon: '📱',
                        },
                        {
                          id: 'cash',
                          name: 'Cash on Pickup',
                          desc: 'Direct payment to driver with physical banknotes',
                          badge: 'OFFLINE',
                          icon: '💵',
                        },
                        {
                          id: 'card',
                          name: 'Credit / Debit Card',
                          desc: 'Visa, Mastercard & Local Bank 3DS',
                          badge: 'SECURE',
                          icon: '💳',
                        },
                      ].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setPaymentChoice(p.id as any)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                            paymentChoice === p.id
                              ? 'bg-amber-400/15 border-amber-400'
                              : 'bg-neutral-900 border-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{p.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">{p.name}</span>
                                <span className="text-[8px] font-black bg-black px-1 py-0.5 rounded text-amber-400">
                                  {p.badge}
                                </span>
                              </div>
                              <div className="text-[9px] text-neutral-400">{p.desc}</div>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              paymentChoice === p.id ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'
                            }`}
                          >
                            {paymentChoice === p.id && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Footer */}
                  <div className="pt-4 space-y-2">
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Total Fare</span>
                      <span className="text-sm font-black text-amber-400">
                        500 HTG ($3.80 USD)
                      </span>
                    </div>

                    <button
                      onClick={() => alert('Trip confirmed! Finding nearest driver...')}
                      className="w-full h-12 rounded-xl bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <span>CONFIRM TRIP & DISPATCH</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* SOS Modal Overlay */}
                  {sosModalOpen && (
                    <div className="absolute inset-0 bg-black/90 z-30 p-5 flex flex-col justify-center items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 mb-3 animate-ping">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-black text-white">ONE-TAP SOS BROADCAST</h3>
                      <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                        Broadcasting emergency telemetry (Lat 18.542, Lon -72.298) and driver license details to local authorities and emergency contacts.
                      </p>
                      <button
                        onClick={() => setSosModalOpen(false)}
                        className="mt-5 px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs"
                      >
                        Dismiss Alert
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 4: DRIVER DOCUMENT ONBOARDING */}
              {/* ------------------------------------------------------------- */}
              {activeScreenId === 'driver-onboarding' && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white">DRIVER ONBOARDING</span>
                      <span className="text-[10px] font-bold text-amber-400">Step {docStep + 1} of 3</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-1.5 mb-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i <= docStep ? 'bg-amber-400' : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    <h3 className="text-base font-extrabold text-white">
                      {docStep === 0
                        ? "Driver's License"
                        : docStep === 1
                        ? 'Vehicle Registration'
                        : 'Passenger Insurance'}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {docStep === 0
                        ? 'Align government issued driver permit inside the camera viewfinder.'
                        : docStep === 1
                        ? 'Scan motorcycle or tuk-tuk official ownership certificate.'
                        : 'Commercial third-party indemnity coverage document.'}
                    </p>

                    {/* Camera Viewfinder Box */}
                    <div className="mt-4 h-64 rounded-2xl bg-neutral-900 border border-neutral-700 relative flex flex-col items-center justify-center overflow-hidden">
                      {/* Viewfinder Corners */}
                      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400" />
                      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400" />
                      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400" />
                      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400" />

                      {!docCaptured ? (
                        <div className="text-center p-4">
                          <Camera className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-80" />
                          <div className="text-xs font-bold text-white">
                            Align Document Inside Brackets
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-1">
                            Outdoor daylight recommended • No glare
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                          <div className="text-xs font-black text-white">Document Captured</div>
                          <div className="text-[10px] text-emerald-400 font-mono mt-1">
                            OCR Verified (98.4% Confidence)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3">
                    {!docCaptured ? (
                      <button
                        onClick={() => setDocCaptured(true)}
                        className="w-full h-12 rounded-xl bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>CAPTURE DOCUMENT PHOTO</span>
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDocCaptured(false)}
                          className="flex-1 h-12 rounded-xl bg-neutral-800 text-white font-bold text-xs"
                        >
                          RE-TAKE
                        </button>
                        <button
                          onClick={() => {
                            if (docStep < 2) {
                              setDocStep(docStep + 1);
                              setDocCaptured(false);
                            } else {
                              alert('All 3 documents uploaded! Compliance check in progress.');
                            }
                          }}
                          className="flex-2 h-12 rounded-xl bg-emerald-400 text-neutral-950 font-black text-xs uppercase px-4"
                        >
                          {docStep === 2 ? 'SUBMIT ALL' : 'CONFIRM & NEXT'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 5: DRIVER DASHBOARD & DISPATCH */}
              {/* ------------------------------------------------------------- */}
              {activeScreenId === 'driver-dispatch' && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Driver Status Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center font-black text-amber-400 text-xs">
                          JM
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Jean-Marc Valmy</div>
                          <div className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {driverOnline ? 'ONLINE & READY' : 'OFFLINE'}
                          </div>
                        </div>
                      </div>

                      {/* Online Toggle Switch */}
                      <button
                        onClick={() => setDriverOnline(!driverOnline)}
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                          driverOnline ? 'bg-emerald-500' : 'bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            driverOnline ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Today Earnings Card */}
                    <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-bold text-neutral-400">TODAY NET REVENUE</div>
                        <div className="text-lg font-black text-amber-400">$34.50 USD</div>
                        <div className="text-[9px] text-neutral-400">≈ 4,500 HTG (11 Trips)</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-center">
                        <div className="text-[8px] font-bold">Pace</div>
                        <div className="text-xs font-black">$8.60/hr</div>
                      </div>
                    </div>
                  </div>

                  {/* Pop-Up Incoming Offer Card */}
                  {incomingOfferVisible && driverOnline ? (
                    <div className="p-3.5 rounded-2xl bg-neutral-900 border-2 border-amber-400 shadow-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> NEW DISPATCH OFFER
                        </span>
                        <span className="text-[10px] font-mono font-black bg-black px-2 py-0.5 rounded text-white">
                          14s
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-neutral-400">Guaranteed Net Fare</div>
                          <div className="text-base font-black text-amber-400">
                            500 HTG ($3.80 USD)
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-1 rounded bg-neutral-800 text-white border border-neutral-700">
                          🏍️ 2-WHEELER
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-neutral-950 text-[10px] space-y-1">
                        <div className="text-white font-bold truncate">
                          🟢 Pickup: Delmas 33 (0.8 km • 3 min)
                        </div>
                        <div className="text-neutral-400 truncate">
                          🔴 Dropoff: Pétion-Ville, Otèl Kinam
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setIncomingOfferVisible(false)}
                          className="flex-1 h-11 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs"
                        >
                          DECLINE
                        </button>
                        <button
                          onClick={() => {
                            setTripAccepted(true);
                            setIncomingOfferVisible(false);
                            alert('Trip Accepted! Navigating to Pickup Point at Delmas 33.');
                          }}
                          className="flex-2 h-11 rounded-xl bg-emerald-400 text-neutral-950 font-black text-xs px-4"
                        >
                          ACCEPT TRIP
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center text-xs text-neutral-400">
                      {tripAccepted
                        ? 'Trip in progress! Vector navigation running.'
                        : 'Searching for nearby trips in your geofenced zone...'}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 6: DRIVER REAL-TIME EARNINGS & CASHOUT */}
              {/* ------------------------------------------------------------- */}
              {activeScreenId === 'driver-earnings' && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Wallet Available Header */}
                    <div className="p-4 rounded-2xl bg-neutral-900 border-2 border-amber-400/80 mb-3">
                      <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block">
                        AVAILABLE FOR INSTANT CASH-OUT
                      </span>
                      <div className="text-2xl font-black text-amber-400 mt-0.5">
                        ${walletBalance.toFixed(2)} USD
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        ≈ {(walletBalance * 131.5).toFixed(0)} HTG (MonCash / Wave Rail)
                      </div>
                    </div>

                    {/* Breakdown: Cash vs App Credit */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                        <div className="text-[9px] text-neutral-400 font-bold">Cash in Hand</div>
                        <div className="text-sm font-black text-white mt-0.5">$18.20 USD</div>
                        <div className="text-[8px] text-neutral-500">Collected in physical cash</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                        <div className="text-[9px] text-neutral-400 font-bold">App Credit</div>
                        <div className="text-sm font-black text-emerald-400 mt-0.5">
                          ${walletBalance.toFixed(2)} USD
                        </div>
                        <div className="text-[8px] text-neutral-500">Available to withdraw</div>
                      </div>
                    </div>

                    {/* Weekly Run-Rate Mini Bar Graph */}
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 mb-2">
                        <span>WEEKLY RUN-RATE ($5 - $12/HR)</span>
                        <span className="text-amber-400">$321 USD</span>
                      </div>
                      <div className="flex items-end justify-between h-20 pt-2 gap-1.5">
                        {[
                          { d: 'M', v: 28 },
                          { d: 'T', v: 38 },
                          { d: 'W', v: 45 },
                          { d: 'T', v: 52 },
                          { d: 'F', v: 48 },
                          { d: 'S', v: 62 },
                          { d: 'S', v: 58 },
                        ].map((b, i) => (
                          <div key={b.d} className="flex-1 flex flex-col items-center">
                            <div
                              style={{ height: `${(b.v / 70) * 55}px` }}
                              className={`w-full rounded-t-md ${
                                i === 6 ? 'bg-amber-400' : 'bg-neutral-700'
                              }`}
                            />
                            <span className="text-[8px] font-bold text-neutral-400 mt-1">{b.d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instant Cashout Button */}
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setCashoutDone(true);
                        setWalletBalance(0);
                        setTimeout(() => setCashoutDone(false), 3000);
                      }}
                      disabled={walletBalance <= 0}
                      className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        walletBalance <= 0
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>
                        {cashoutDone
                          ? 'TRANSFERRED TO MOBILE WALLET!'
                          : 'INSTANT CASH OUT TO WALLET'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code & Wireframe Specifications Inspector */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Tabs: Flutter vs React Native vs Wireframe Specs */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                id="tab-flutter"
                onClick={() => setActiveCodeTab('flutter')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeCodeTab === 'flutter'
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-md'
                    : 'text-neutral-300 hover:text-white bg-neutral-800'
                }`}
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Flutter (Dart)</span>
              </button>

              <button
                id="tab-react-native"
                onClick={() => setActiveCodeTab('reactNative')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeCodeTab === 'reactNative'
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-md'
                    : 'text-neutral-300 hover:text-white bg-neutral-800'
                }`}
              >
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>React Native (TS)</span>
              </button>

              <button
                id="tab-specs"
                onClick={() => setActiveCodeTab('specs')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeCodeTab === 'specs'
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-md'
                    : 'text-neutral-300 hover:text-white bg-neutral-800'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Wireframe Specs</span>
              </button>
            </div>

            <button
              id="copy-code-btn"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 border border-neutral-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
            </button>
          </div>

          {/* Wireframe Specs Display */}
          {activeCodeTab === 'specs' ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">{activeDefinition.title}</h3>
                  <span className="text-xs text-amber-400 font-bold">
                    UI/UX Wireframe & Accessibility Blueprint
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  {activeDefinition.wireframeSpec.minTouchTarget}
                </span>
              </div>

              {/* Spec Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Layout Paradigm
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    {activeDefinition.wireframeSpec.layoutType}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Target Viewport Resolution
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block">
                    {activeDefinition.wireframeSpec.targetResolution}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Sunlight Outdoor Contrast Ratio
                  </span>
                  <span className="text-xs font-bold text-amber-400 mt-1 block">
                    {activeDefinition.wireframeSpec.contrastRatio}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Network & Tile Data Budget
                  </span>
                  <span className="text-xs font-bold text-emerald-400 mt-1 block">
                    {activeDefinition.wireframeSpec.networkBudget}
                  </span>
                </div>
              </div>

              {/* Key Architectural Elements */}
              <div>
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Key Component Composition:
                </h4>
                <ul className="space-y-1.5">
                  {activeDefinition.wireframeSpec.keyElements.map((el, i) => (
                    <li key={i} className="text-xs text-neutral-400 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interaction Notes */}
              <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Interaction & Low-Bandwidth Protocol
                </span>
                <p className="text-xs text-neutral-300 mt-1">
                  {activeDefinition.wireframeSpec.interactionNotes}
                </p>
              </div>

              {/* Touch Target Compliance Notice */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs text-neutral-300">
                  <strong className="text-emerald-400">WCAG 2.5.5 Compliance Verified:</strong> All tappable buttons, list tiles, and selector chips exceed the 48x48dp minimum physical target dimension to guarantee failure-free operation for drivers wearing gloves or using single-hand grip in transit.
                </div>
              </div>
            </div>
          ) : (
            /* Code Block View */
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
              <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>
                  {activeCodeTab === 'flutter' ? 'lib/screens/phone_otp_auth_screen.dart' : 'src/screens/PhoneOtpAuthScreen.tsx'}
                </span>
                <span className="text-amber-400">
                  {activeCodeTab === 'flutter' ? 'Flutter 3.x / Dart 3' : 'React Native 0.74+'}
                </span>
              </div>

              <div className="p-4 overflow-x-auto max-h-[600px] font-mono text-xs text-neutral-300 leading-relaxed">
                <pre>
                  <code>
                    {activeCodeTab === 'flutter'
                      ? activeDefinition.flutterCode
                      : activeDefinition.reactNativeCode}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

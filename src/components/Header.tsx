import React, { useState } from 'react';
import {
  Bike,
  Globe,
  Wifi,
  WifiOff,
  Volume2,
  ShieldCheck,
  MapPin,
  Languages,
  UserCheck,
  TrendingUp,
  FileCheck,
  CreditCard,
  Layers,
  Database,
  Navigation,
  Smartphone,
  Server,
  Cloud,
  Terminal,
  Coins,
  ArrowUpRight,
  History,
  Store,
  ShieldAlert,
  LogIn,
  LogOut,
  Sparkles,
  User
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';
import { translations } from '../data/translations';
import { BrokerageIntegrationOverlay } from './BrokerageIntegrationOverlay';
import { AuthUserData } from './WelcomeLandingInterface';
import { IdentityVerificationStatusWidget } from './IdentityVerificationStatusWidget';

export type ActiveRole = 'customer' | 'driver' | 'merchant' | 'admin';

export type ActiveTabId =
  | 'customer'
  | 'driver'
  | 'merchant'
  | 'admin'
  | 'simulator'
  | 'marketplace-lbc'
  | 'mobile-studio'
  | 'mobile-build'
  | 'api-dispatch'
  | 'qa-automation'
  | 'devops'
  | 'pricing'
  | 'cms'
  | 'verification'
  | 'onboarding'
  | 'expansion'
  | 'architecture'
  | 'database'
  | 'maps'
  | 'payments'
  | 'offline';

interface HeaderProps {
  selectedRegion: RegionId;
  onSelectRegion: (r: RegionId) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (l: LanguageCode) => void;
  networkMode: 'online' | 'edge' | 'offline';
  onToggleNetworkMode: () => void;
  activeRole: ActiveRole;
  onSelectRole: (role: ActiveRole) => void;
  onPlayVoiceGuide: () => void;
  isAudioPlaying: boolean;
  activeTab?: ActiveTabId;
  onSelectTab?: (tab: ActiveTabId) => void;
  currentUser?: AuthUserData | null;
  onUpdateUserVerification?: (user: AuthUserData) => void;
  isWelcomeActive?: boolean;
  onToggleWelcome?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedLanguage,
  onSelectLanguage,
  networkMode,
  onToggleNetworkMode,
  activeRole,
  onSelectRole,
  onPlayVoiceGuide,
  isAudioPlaying,
  activeTab,
  onSelectTab,
  currentUser,
  onUpdateUserVerification,
  isWelcomeActive,
  onToggleWelcome,
  onSignOut,
}) => {
  const t = translations[selectedLanguage] || translations.en;
  const currentRegion = REGIONS[selectedRegion];

  // Brokerage API Overlay & LBC Transaction History State
  const [isBrokerageOverlayOpen, setIsBrokerageOverlayOpen] = useState(false);
  const [overlayInitialTab, setOverlayInitialTab] = useState<'transfer' | 'history'>('transfer');

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'ht', label: 'Kreyòl', flag: '🇭🇹' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'sr', label: 'Sranan', flag: '🇸🇷' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-900 text-white border-b border-neutral-800 shadow-md">
      {/* Top Banner: Status & Diaspora Region Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400 bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-700">
            <Bike className="w-4 h-4 text-amber-400" />
            <span className="text-sm">WAP PLATFORM</span>
          </div>
          <span className="hidden md:inline-block text-neutral-400">
            {currentRegion.flag} {currentRegion.name} ({currentRegion.sampleCity}) • {currentRegion.currency}
          </span>
        </div>

        {/* Persistent LBC Token Balance Indicator & Transfer / Brokerage Action */}
        <div className="flex items-center gap-1.5 bg-neutral-950/90 border border-amber-500/50 rounded-xl px-2.5 py-1 text-xs shadow-inner">
          <button
            id="header-lbc-balance-indicator"
            onClick={() => {
              setOverlayInitialTab('history');
              setIsBrokerageOverlayOpen(true);
            }}
            className="flex items-center gap-1.5 hover:opacity-85 transition text-amber-400 group cursor-pointer"
            title="Click to view Liberté Cash (LBC) transaction history"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-pulse group-hover:scale-110 transition-transform shrink-0" />
            <span className="font-mono font-black text-amber-400 tracking-tight">2,850 LBC</span>
            <span className="text-neutral-400 font-mono text-[11px] hidden sm:inline">(17.07 Liberty Cash • $17.07)</span>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 font-bold hidden md:inline">
              5.2% APY
            </span>
          </button>

          <div className="h-3.5 w-px bg-neutral-800" />

          <button
            id="header-lbc-transfer-btn"
            onClick={() => {
              setOverlayInitialTab('transfer');
              setIsBrokerageOverlayOpen(true);
            }}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black px-2.5 py-0.5 rounded-lg text-[11px] shadow transition active:scale-95 cursor-pointer"
            title="Transfer & Convert LBC to Fractional Equities or Cash"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>

          <button
            id="header-lbc-history-btn"
            onClick={() => {
              setOverlayInitialTab('history');
              setIsBrokerageOverlayOpen(true);
            }}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition hidden sm:flex cursor-pointer"
            title="View LBC Transaction History"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Region & Language & Offline controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Audio Accessibility */}
          <button
            id="voice-guide-btn"
            onClick={onPlayVoiceGuide}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              isAudioPlaying
                ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold animate-pulse'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
            title="Play Audio Voice Instruction for Low-Literacy Users"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.audioGuide}</span>
          </button>

          {/* Network Simulator Toggle */}
          <button
            id="network-simulator-toggle"
            onClick={onToggleNetworkMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              networkMode === 'online'
                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-700'
                : networkMode === 'edge'
                ? 'bg-amber-950/70 text-amber-400 border-amber-700'
                : 'bg-red-950/70 text-red-300 border-red-700'
            }`}
            title="Click to simulate fluctuating Caribbean 3G/2G mobile network speeds"
          >
            {networkMode === 'online' ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : networkMode === 'edge' ? (
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="capitalize font-mono text-[11px]">
              {networkMode === 'online' ? '4G Online' : networkMode === 'edge' ? 'Flaky 2G' : 'Offline Cached'}
            </span>
          </button>

          {/* Region Picker */}
          <div className="flex items-center bg-neutral-800 rounded-md border border-neutral-700 p-0.5">
            <span className="pl-2 pr-1 text-neutral-400">
              <MapPin className="w-3 h-3 inline mr-1" />
            </span>
            <select
              id="region-selector"
              value={selectedRegion}
              onChange={(e) => onSelectRegion(e.target.value as RegionId)}
              className="bg-transparent text-white font-medium text-xs pr-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="haiti" className="bg-neutral-800 text-white">🇭🇹 Haiti (Port-au-Prince)</option>
              <option value="french_guiana" className="bg-neutral-800 text-white">🇬🇫 Guyane (Cayenne)</option>
              <option value="guyana" className="bg-neutral-800 text-white">🇬🇾 Guyana (Georgetown)</option>
              <option value="suriname" className="bg-neutral-800 text-white">🇸🇷 Suriname (Paramaribo)</option>
            </select>
          </div>

          {/* Language Picker */}
          <div className="flex items-center bg-neutral-800 rounded-md border border-neutral-700 p-0.5">
            <span className="pl-2 pr-1 text-neutral-400">
              <Globe className="w-3 h-3 inline mr-1" />
            </span>
            <select
              id="language-selector"
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-white font-medium text-xs pr-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-neutral-800 text-white">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Auth Status / Welcome & Sign In Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              {/* Identity Verification Status Widget in Header (Compact with popover HUD) */}
              <IdentityVerificationStatusWidget
                user={currentUser}
                onUpdateUserVerification={onUpdateUserVerification}
                compact={true}
              />

              <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-md py-0.5 px-2">
                <User className="w-3 h-3 text-amber-400 shrink-0" />
                <div className="max-w-[110px] truncate text-[11px] font-semibold text-white">
                  {currentUser.name}
                </div>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-neutral-950 font-bold hidden sm:inline">
                  {currentUser.role.toUpperCase()}
                </span>
                <button
                  id="header-signout-btn"
                  type="button"
                  onClick={onSignOut}
                  className="ml-1 text-neutral-400 hover:text-red-300 p-0.5 transition cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              id="header-welcome-login-btn"
              type="button"
              onClick={onToggleWelcome}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
                isWelcomeActive
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 border-amber-400 shadow'
              }`}
              title="Open Welcome Portal & Subscription / Login"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isWelcomeActive ? 'Welcome Portal' : 'Sign In / Subscribe'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation Architecture */}
      <div className="border-t border-neutral-800/90 bg-neutral-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Role Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              Select Role:
            </span>

            {/* 0. Welcome & Subscription Portal Tab */}
            <button
              id="role-tab-welcome"
              type="button"
              onClick={onToggleWelcome}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isWelcomeActive
                  ? 'bg-amber-400 text-neutral-950 shadow-md font-bold ring-2 ring-amber-400/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isWelcomeActive ? 'text-neutral-950' : 'text-amber-400'}`} />
              <div className="text-left">
                <div className="leading-tight">Welcome Portal</div>
                <div className={`text-[10px] ${isWelcomeActive ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                  Subscription &amp; Login
                </div>
              </div>
            </button>

            {/* 1. Customer Role */}
            <button
              id="role-tab-customer"
              type="button"
              onClick={() => {
                onSelectRole('customer');
                if (onSelectTab) onSelectTab('customer');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                !isWelcomeActive && activeRole === 'customer'
                  ? 'bg-amber-400 text-neutral-950 shadow-md font-bold ring-2 ring-amber-400/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Smartphone className={`w-4 h-4 ${activeRole === 'customer' ? 'text-neutral-950' : 'text-amber-400'}`} />
              <div className="text-left">
                <div className="leading-tight">Customer App</div>
                <div className={`text-[10px] ${activeRole === 'customer' ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                  Rides, Food &amp; Courier
                </div>
              </div>
            </button>

            {/* 2. Driver Role */}
            <button
              id="role-tab-driver"
              type="button"
              onClick={() => {
                onSelectRole('driver');
                if (onSelectTab) onSelectTab('driver');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                !isWelcomeActive && activeRole === 'driver'
                  ? 'bg-amber-400 text-neutral-950 shadow-md font-bold ring-2 ring-amber-400/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Bike className={`w-4 h-4 ${!isWelcomeActive && activeRole === 'driver' ? 'text-neutral-950' : 'text-emerald-400'}`} />
              <div className="text-left">
                <div className="leading-tight">Driver Partner</div>
                <div className={`text-[10px] ${!isWelcomeActive && activeRole === 'driver' ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                  Radar &amp; Earnings
                </div>
              </div>
            </button>

            {/* 3. Merchant Role */}
            <button
              id="role-tab-merchant"
              type="button"
              onClick={() => {
                onSelectRole('merchant');
                if (onSelectTab) onSelectTab('merchant');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                !isWelcomeActive && activeRole === 'merchant'
                  ? 'bg-amber-400 text-neutral-950 shadow-md font-bold ring-2 ring-amber-400/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Store className={`w-4 h-4 ${!isWelcomeActive && activeRole === 'merchant' ? 'text-neutral-950' : 'text-cyan-400'}`} />
              <div className="text-left">
                <div className="leading-tight">Merchant Portal</div>
                <div className={`text-[10px] ${!isWelcomeActive && activeRole === 'merchant' ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>
                  Boutik &amp; Resto Orders
                </div>
              </div>
            </button>

            {/* 4. Administration Panel Role */}
            <button
              id="role-tab-admin"
              type="button"
              onClick={() => {
                onSelectRole('admin');
                if (onSelectTab) onSelectTab('admin');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                !isWelcomeActive && activeRole === 'admin'
                  ? 'bg-red-500 text-white shadow-md font-bold ring-2 ring-red-400/40'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${activeRole === 'admin' ? 'text-white' : 'text-red-400'}`} />
              <div className="text-left">
                <div className="leading-tight flex items-center gap-1.5">
                  <span>Administration Panel</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-red-950 text-red-300 rounded border border-red-800">
                    Restricted
                  </span>
                </div>
                <div className={`text-[10px] ${activeRole === 'admin' ? 'text-red-100 font-medium' : 'text-neutral-400'}`}>
                  Fleet, KYC, APIs &amp; DevOps
                </div>
              </div>
            </button>
          </div>

          {/* Role Status Pill */}
          <div className="flex items-center gap-2 text-xs shrink-0 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
            {activeRole === 'customer' && (
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-semibold text-white">Passenger Mode:</span>
                <span className="text-neutral-400">Customer booking &amp; LBC wallet features</span>
              </div>
            )}
            {activeRole === 'driver' && (
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Driver Partner:</span>
                <span className="text-emerald-400 font-bold">4.92 ★</span>
                <span className="text-neutral-400 hidden lg:inline">• 0% predatory deductions</span>
              </div>
            )}
            {activeRole === 'merchant' && (
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-semibold text-white">Merchant Partner:</span>
                <span className="text-cyan-400 font-bold">0% Card Swipe Fees</span>
                <span className="text-neutral-400 hidden lg:inline">• Instant Moto Dispatch</span>
              </div>
            )}
            {activeRole === 'admin' && (
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="font-semibold text-white">Staff Clearance Level 4:</span>
                <span className="text-amber-400 font-mono">Backend Admin Controls Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Brokerage API Integration Overlay & LBC Transaction History */}
      <BrokerageIntegrationOverlay
        isOpen={isBrokerageOverlayOpen}
        onClose={() => setIsBrokerageOverlayOpen(false)}
        initialTab={overlayInitialTab}
        onPlaySpeech={(txt) => onPlayVoiceGuide()}
      />
    </header>
  );
};

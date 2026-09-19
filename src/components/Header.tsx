import React from 'react';
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
  Coins
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';
import { translations } from '../data/translations';

export type ActiveTabId =
  | 'simulator'
  | 'marketplace-lbc'
  | 'mobile-studio'
  | 'mobile-build'
  | 'api-dispatch'
  | 'qa-automation'
  | 'devops'
  | 'admin'
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
  activeTab: ActiveTabId;
  onSelectTab: (tab: ActiveTabId) => void;
  onPlayVoiceGuide: () => void;
  isAudioPlaying: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedLanguage,
  onSelectLanguage,
  networkMode,
  onToggleNetworkMode,
  activeTab,
  onSelectTab,
  onPlayVoiceGuide,
  isAudioPlaying,
}) => {
  const t = translations[selectedLanguage] || translations.en;
  const currentRegion = REGIONS[selectedRegion];

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
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1.5 border-t border-neutral-800/80 py-1.5 no-scrollbar text-xs">
        <button
          id="nav-tab-simulator"
          onClick={() => onSelectTab('simulator')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'simulator'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Interactive Apps</span>
        </button>

        <button
          id="nav-tab-marketplace-lbc"
          onClick={() => onSelectTab('marketplace-lbc')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'marketplace-lbc'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>3-Sided & LBC Token Brokerage</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </button>

        <button
          id="nav-tab-mobile-studio"
          onClick={() => onSelectTab('mobile-studio')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'mobile-studio'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Mobile UI/UX Studio & Code</span>
        </button>

        <button
          id="nav-tab-mobile-build"
          onClick={() => onSelectTab('mobile-build')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'mobile-build'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>Mobile Build Engineer</span>
        </button>

        <button
          id="nav-tab-api-dispatch"
          onClick={() => onSelectTab('api-dispatch')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'api-dispatch'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-amber-400" />
          <span>Backend & PostGIS APIs</span>
        </button>

        <button
          id="nav-tab-qa-automation"
          onClick={() => onSelectTab('qa-automation')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'qa-automation'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>QA E2E Dry-Run</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        <button
          id="nav-tab-devops"
          onClick={() => onSelectTab('devops')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'devops'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Cloud className="w-3.5 h-3.5 text-amber-400" />
          <span>Cloud DevOps & Docker</span>
        </button>

        <button
          id="nav-tab-admin"
          onClick={() => onSelectTab('admin')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'admin'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Admin Operations & Heatmaps</span>
        </button>

        <button
          id="nav-tab-cms"
          onClick={() => onSelectTab('cms')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'cms'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Multilingual CMS</span>
        </button>

        <button
          id="nav-tab-verification"
          onClick={() => onSelectTab('verification')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Profile Verification & Vouches</span>
        </button>

        <button
          id="nav-tab-pricing"
          onClick={() => onSelectTab('pricing')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'pricing'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Dynamic Pricing Engine</span>
        </button>

        <button
          id="nav-tab-onboarding"
          onClick={() => onSelectTab('onboarding')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'onboarding'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Onboarding Pipelines</span>
        </button>

        <button
          id="nav-tab-expansion"
          onClick={() => onSelectTab('expansion')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'expansion'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Expansion Rails & Support</span>
        </button>

        <button
          id="nav-tab-architecture"
          onClick={() => onSelectTab('architecture')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'architecture'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Topology & Arch</span>
        </button>

        <button
          id="nav-tab-database"
          onClick={() => onSelectTab('database')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database & PostGIS</span>
        </button>

        <button
          id="nav-tab-maps"
          onClick={() => onSelectTab('maps')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'maps'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Maps & Routes</span>
        </button>

        <button
          id="nav-tab-payments"
          onClick={() => onSelectTab('payments')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>MonCash & COD</span>
        </button>

        <button
          id="nav-tab-offline"
          onClick={() => onSelectTab('offline')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'offline'
              ? 'bg-amber-400 text-neutral-950 shadow-sm font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline & USSD</span>
        </button>
      </nav>
    </header>
  );
};

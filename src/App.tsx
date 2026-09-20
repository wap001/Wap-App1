import React, { useState, useEffect } from 'react';
import {
  Bike,
  Smartphone,
  Store,
  Navigation,
  Layers,
  Database,
  CreditCard,
  WifiOff,
  Volume2,
  CheckCircle,
  ShieldAlert,
  Monitor,
  BatteryCharging,
  Wifi,
  Signal,
  UserCheck
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { RegionId, LanguageCode } from './types/architecture';
import { Header, ActiveTabId, ActiveRole } from './components/Header';
import { CustomerInterface } from './components/CustomerInterface';
import { DriverInterface } from './components/DriverInterface';
import { VendorInterface } from './components/VendorInterface';
import { AdminPanelWorkspace, AdminSectionId } from './components/AdminPanelWorkspace';
import { FloatingSOSButton } from './components/FloatingSOSButton';
import { WelcomeLandingInterface, AuthUserData } from './components/WelcomeLandingInterface';
import { translations } from './data/translations';
import { REGIONS } from './data/mockData';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('haiti');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ht');
  const [networkMode, setNetworkMode] = useState<'online' | 'edge' | 'offline'>('online');
  const [activeRole, setActiveRole] = useState<ActiveRole>('customer');
  const [activeTab, setActiveTab] = useState<ActiveTabId>('customer');
  const [adminInitialSection, setAdminInitialSection] = useState<AdminSectionId>('operations');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);

  // Authenticated user session state (initialized from localStorage)
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(() => {
    try {
      const saved = localStorage.getItem('wap_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Welcome Landing Interface display state
  const [isWelcomeActive, setIsWelcomeActive] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'welcome') return true;
      if (params.get('role')) return false;
      const saved = localStorage.getItem('wap_auth_user');
      // If no saved user session and no specific role deep link, present the Welcome Interface
      return !saved;
    } catch {
      return true;
    }
  });

  // Sync role and region from URL search params on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'customer' || roleParam === 'driver' || roleParam === 'merchant' || roleParam === 'admin') {
        setActiveRole(roleParam as ActiveRole);
        setActiveTab(roleParam as ActiveTabId);
      }
      const regionParam = params.get('region') as RegionId | null;
      if (regionParam && REGIONS[regionParam]) {
        setSelectedRegion(regionParam);
      }
      if (params.get('view') === 'mobile') {
        setIsMobileFrameMode(true);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Update URL search params when activeRole changes
  const updateUrlForRole = (role: ActiveRole) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('role', role);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // safe fallback
    }
  };

  const t = translations[selectedLanguage] || translations.en;
  const currentRegion = REGIONS[selectedRegion];

  // Speech synthesizer for immigrant literacy support
  const handlePlaySpeech = (text: string) => {
    setIsAudioPlaying(true);
    setAudioTranscript(text);

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        // If language is French, set fr-FR; if Haitian Creole, fr-FR or en-US voice is used with Creole phonetics
        utterance.lang = selectedLanguage === 'fr' ? 'fr-FR' : selectedLanguage === 'nl' ? 'nl-NL' : 'en-US';
        utterance.rate = 0.95;
        utterance.onend = () => {
          setIsAudioPlaying(false);
          setTimeout(() => setAudioTranscript(null), 3000);
        };
        utterance.onerror = () => {
          setIsAudioPlaying(false);
          setTimeout(() => setAudioTranscript(null), 3500);
        };
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fallback for sandboxed iframe
        setTimeout(() => {
          setIsAudioPlaying(false);
          setTimeout(() => setAudioTranscript(null), 3500);
        }, 2500);
      }
    } else {
      setTimeout(() => {
        setIsAudioPlaying(false);
        setTimeout(() => setAudioTranscript(null), 3500);
      }, 2500);
    }
  };

  const handleGlobalVoiceGuide = () => {
    const text =
      selectedLanguage === 'ht'
        ? 'Wap se platfòm motosiklèt sou kòmand ak livrezon pou Ayiti, Giyàn, ak tout zile vwazen yo. Ou ka kòmande yon moto, voye yon pakè, oswa achte nan boutik machann yo.'
        : selectedLanguage === 'fr'
        ? 'Wap est la plateforme de moto-taxis et livraisons express pour les communautés en Haïti, Guyane française, Guyana et Suriname.'
        : 'Wap is the on-demand motorcycle ride and courier delivery platform for immigrant communities in Haiti, French Guiana, Guyana, and Suriname.';
    handlePlaySpeech(text);
  };

  const toggleNetworkMode = () => {
    setNetworkMode((prev) => (prev === 'online' ? 'edge' : prev === 'edge' ? 'offline' : 'online'));
  };

  // When region changes, optionally update default language to match region
  const handleSelectRegion = (r: RegionId) => {
    setSelectedRegion(r);
    const regionObj = REGIONS[r];
    if (regionObj.primaryLanguages.length > 0) {
      setSelectedLanguage(regionObj.primaryLanguages[0]);
    }
  };

  // Role switcher and legacy tab handler
  const handleSelectRole = (role: ActiveRole) => {
    setActiveRole(role);
    setActiveTab(role);
    setIsWelcomeActive(false);
    updateUrlForRole(role);
  };

  const handleSelectTab = (tab: ActiveTabId) => {
    setActiveTab(tab);
    setIsWelcomeActive(false);
    if (tab === 'customer' || tab === 'simulator') {
      setActiveRole('customer');
      updateUrlForRole('customer');
    } else if (tab === 'driver') {
      setActiveRole('driver');
      updateUrlForRole('driver');
    } else if (tab === 'merchant') {
      setActiveRole('merchant');
      updateUrlForRole('merchant');
    } else {
      setActiveRole('admin');
      updateUrlForRole('admin');
      if (tab === 'marketplace-lbc') setAdminInitialSection('marketplace-brokerage');
      else if (tab === 'mobile-studio') setAdminInitialSection('mobile-studio');
      else if (tab === 'mobile-build') setAdminInitialSection('mobile-build');
      else if (tab === 'api-dispatch') setAdminInitialSection('backend-api');
      else if (tab === 'qa-automation') setAdminInitialSection('qa-automation');
      else if (tab === 'devops') setAdminInitialSection('devops');
      else if (tab === 'pricing') setAdminInitialSection('pricing');
      else if (tab === 'cms') setAdminInitialSection('cms');
      else if (tab === 'verification') setAdminInitialSection('verification');
      else if (tab === 'onboarding') setAdminInitialSection('onboarding');
      else if (tab === 'expansion' || tab === 'payments') setAdminInitialSection('payments');
      else if (tab === 'architecture' || tab === 'offline') setAdminInitialSection('architecture');
      else if (tab === 'database') setAdminInitialSection('database');
      else if (tab === 'maps') setAdminInitialSection('maps');
      else setAdminInitialSection('operations');
    }
  };

  const handleLoginSuccess = (userData: AuthUserData) => {
    setCurrentUser(userData);
    setActiveRole(userData.role);
    setActiveTab(userData.role);
    setIsWelcomeActive(false);
    updateUrlForRole(userData.role);
  };

  const handleGuestContinue = (role: ActiveRole) => {
    setActiveRole(role);
    setActiveTab(role);
    setIsWelcomeActive(false);
    updateUrlForRole(role);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('wap_auth_user');
    } catch {
      // safe fallback
    }
    setCurrentUser(null);
    setIsWelcomeActive(true);
  };

  const handleToggleWelcome = () => {
    setIsWelcomeActive((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Global Header with Role-Specific Navigation */}
      <Header
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        networkMode={networkMode}
        onToggleNetworkMode={toggleNetworkMode}
        activeRole={activeRole}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onPlayVoiceGuide={handleGlobalVoiceGuide}
        isAudioPlaying={isAudioPlaying}
        currentUser={currentUser}
        isWelcomeActive={isWelcomeActive}
        onToggleWelcome={handleToggleWelcome}
        onSignOut={handleSignOut}
      />

      {/* Authenticated User Quick Info Banner */}
      {currentUser && !isWelcomeActive && (
        <div className="bg-neutral-900/90 border-b border-amber-500/20 px-4 py-1.5 text-xs text-neutral-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                Signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
              </span>
              <span className="text-amber-400 font-semibold">• {currentUser.subscriptionName}</span>
              <span className="text-neutral-400 hidden sm:inline">• {currentUser.lbcBonus} LBC Freedom Balance</span>
            </div>
            <button
              id="top-welcome-portal-link"
              type="button"
              onClick={handleToggleWelcome}
              className="text-amber-400 hover:text-amber-300 hover:underline font-semibold text-xs cursor-pointer"
            >
              Subscription &amp; Welcome Portal →
            </button>
          </div>
        </div>
      )}

      {/* Voice Prompt Live HUD Subtitle */}
      {audioTranscript && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold text-center sticky top-[88px] z-30 shadow-md flex items-center justify-center gap-2 transition-all">
          <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
          <span>"{audioTranscript}"</span>
        </div>
      )}

      {/* Mobile Frame Mode Toggle & Direct Role Navigation Sub-Bar */}
      <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">Unified Mobile App:</span>
            <span className="text-neutral-400 hidden sm:inline">
              Role-specific pages for Customers, Drivers &amp; Merchants with in-app task &amp; account management
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                isMobileFrameMode
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
              title="Toggle between full viewport and mobile phone simulator"
            >
              {isMobileFrameMode ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mobile Device Frame</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto p-3 sm:p-6 lg:p-8 ${!isWelcomeActive && isMobileFrameMode && activeRole !== 'admin' ? 'max-w-[460px]' : 'max-w-7xl'}`}>
        {isWelcomeActive ? (
          /* Welcome Landing Interface: Subscriptions & Email/Password Login */
          <WelcomeLandingInterface
            currentRegion={selectedRegion}
            currentLanguage={selectedLanguage}
            onSelectRegion={handleSelectRegion}
            onSelectLanguage={setSelectedLanguage}
            onPlaySpeech={handlePlaySpeech}
            onLoginSuccess={handleLoginSuccess}
            onGuestContinue={handleGuestContinue}
          />
        ) : isMobileFrameMode && activeRole !== 'admin' ? (
          <div className="relative rounded-[40px] border-4 border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden p-2 sm:p-3 ring-1 ring-neutral-700/50">
            {/* Simulated Phone Top Notch & Status Bar */}
            <div className="h-6 w-full flex items-center justify-between px-5 text-[10px] font-mono text-neutral-400 select-none pb-2 border-b border-neutral-900">
              <span className="font-bold text-neutral-200">09:41</span>
              <div className="w-20 h-3.5 bg-neutral-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-700 mr-1.5" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Signal className="w-3 h-3 text-neutral-400" />
                <Wifi className="w-3 h-3 text-neutral-400" />
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Mobile App Viewport Content */}
            <div className="pt-2 pb-6 max-h-[85vh] overflow-y-auto pr-1">
              {activeRole === 'customer' && (
                <CustomerInterface
                  region={selectedRegion}
                  language={selectedLanguage}
                  networkMode={networkMode}
                  onPlaySpeech={handlePlaySpeech}
                />
              )}

              {activeRole === 'driver' && (
                <DriverInterface
                  region={selectedRegion}
                  language={selectedLanguage}
                  networkMode={networkMode}
                  onPlaySpeech={handlePlaySpeech}
                />
              )}

              {activeRole === 'merchant' && (
                <VendorInterface
                  region={selectedRegion}
                  language={selectedLanguage}
                  onPlaySpeech={handlePlaySpeech}
                />
              )}
            </div>

            {/* Simulated Mobile Home Indicator Bar */}
            <div className="pt-2 pb-1 flex justify-center bg-neutral-950 border-t border-neutral-900">
              <div className="w-28 h-1 bg-neutral-700 rounded-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Role 1: Customer Interface */}
            {activeRole === 'customer' && (
              <CustomerInterface
                region={selectedRegion}
                language={selectedLanguage}
                networkMode={networkMode}
                onPlaySpeech={handlePlaySpeech}
              />
            )}

            {/* Role 2: Driver Interface */}
            {activeRole === 'driver' && (
              <DriverInterface
                region={selectedRegion}
                language={selectedLanguage}
                networkMode={networkMode}
                onPlaySpeech={handlePlaySpeech}
              />
            )}

            {/* Role 3: Merchant Interface */}
            {activeRole === 'merchant' && (
              <VendorInterface
                region={selectedRegion}
                language={selectedLanguage}
                onPlaySpeech={handlePlaySpeech}
              />
            )}

            {/* Role 4: Administration Panel (Restricted exclusively to this view) */}
            {activeRole === 'admin' && (
              <AdminPanelWorkspace
                region={selectedRegion}
                language={selectedLanguage}
                onPlaySpeech={handlePlaySpeech}
                initialSection={adminInitialSection}
              />
            )}
          </>
        )}
      </main>

      {/* Minimized Non-Obstructive Fixed SOS Emergency Trigger Across All Interfaces (Including Admin Dashboards) */}
      <FloatingSOSButton
        role={activeRole === 'admin' ? 'admin' : activeRole}
        region={selectedRegion}
        language={selectedLanguage}
        userName={
          activeRole === 'driver'
            ? 'Moïse Baptiste'
            : activeRole === 'merchant'
            ? 'Chef Fifi (Saveur Lakay)'
            : activeRole === 'admin'
            ? 'Wap Safety & Platform Operations'
            : 'Daphnée Lamour'
        }
        onPlaySpeech={handlePlaySpeech}
        position="bottom-right"
      />

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800/80 py-4 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">Wap Architecture Suite</span>
            <span>• On-Demand Motorcycle Rides & Deliveries for Caribbean Immigrant Communities</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500">
            <span>🇭🇹 Haiti</span>
            <span>🇬🇫 French Guiana</span>
            <span>🇬🇾 Guyana</span>
            <span>🇸🇷 Suriname</span>
          </div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}

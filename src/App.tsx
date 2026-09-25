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
import { IdentityVerificationStatusWidget } from './components/IdentityVerificationStatusWidget';
import { AboutUsModal } from './components/AboutUsModal';
import { DriverContractModal } from './components/DriverContractModal';
import { EmergencyChatbotModal } from './components/EmergencyChatbotModal';
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
  const [themeMode, setThemeMode] = useState<'basic' | 'dark'>(() => {
    try {
      return (localStorage.getItem('wap_theme_mode') as 'basic' | 'dark') || 'basic';
    } catch {
      return 'basic';
    }
  });

  const handleToggleThemeMode = () => {
    setThemeMode((prev) => {
      const next = prev === 'basic' ? 'dark' : 'basic';
      try {
        localStorage.setItem('wap_theme_mode', next);
      } catch {
        // safe fallback
      }
      return next;
    });
  };

  // Default demo authenticated user ensuring Identity Verification Status is immediately visible
  const DEFAULT_DEMO_USER: AuthUserData = {
    id: 'usr_caribbean_verified',
    name: 'Jean-Luc Dessalines',
    email: 'jeanluc.dessalines@wap-transport.ht',
    phone: '+509 3712-8821',
    role: 'customer',
    region: 'haiti',
    subscriptionTier: 'freedom_plus',
    subscriptionName: 'Wap Plus Freedom Pass',
    lbcBonus: 2850,
    signedUpAt: '2026-03-12T10:00:00.000Z',
    verificationStatus: 'pending',
    verificationProgress: 65,
    verificationNotes: 'Official passport scan submitted and undergoing automated MRZ checksum validation & CARICOM security screening.',
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

  // Authenticated user session state (initialized from localStorage with fallback to Caribbean demo profile)
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(() => {
    try {
      const saved = localStorage.getItem('wap_auth_user');
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  // Welcome Landing Interface display state (defaults to false so user immediately accesses the app & verification status)
  const [isWelcomeActive, setIsWelcomeActive] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'welcome';
    } catch {
      return false;
    }
  });

  // Global Modals State
  const [showAboutUsModal, setShowAboutUsModal] = useState<boolean>(false);
  const [showDriverContractModal, setShowDriverContractModal] = useState<boolean>(false);
  const [showEmergencyChatbotModal, setShowEmergencyChatbotModal] = useState<boolean>(false);
  const [routeProtectionToast, setRouteProtectionToast] = useState<string | null>(null);

  // Sync role and region from URL search params on mount with strict route protection
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      const tabParam = params.get('tab');

      // Page Route Protection: Check if attempting to access administrative portal
      const isAttemptingAdmin = roleParam === 'admin' || tabParam === 'admin' || activeRole === 'admin';
      const hasAdminClearance = currentUser && currentUser.role === 'admin';

      if (isAttemptingAdmin && !hasAdminClearance) {
        // Automatically redirect unauthorized user back to main interactive map interface (Customer radar)
        setActiveRole('customer');
        setActiveTab('customer');
        updateUrlForRole('customer');
        setRouteProtectionToast(
          'Access Denied: Administrative portal is restricted exclusively to authorized platform administrators with RBAC Level 4 clearance. You have been redirected to the main interactive map interface.'
        );
        setTimeout(() => setRouteProtectionToast(null), 7000);
      } else if (roleParam === 'customer' || roleParam === 'driver' || roleParam === 'merchant' || (roleParam === 'admin' && hasAdminClearance)) {
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
  }, [currentUser]);

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

  // Role switcher and legacy tab handler with RBAC route protection
  const handleSelectRole = (role: ActiveRole) => {
    if (role === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
      setActiveRole('customer');
      setActiveTab('customer');
      updateUrlForRole('customer');
      setRouteProtectionToast(
        'Access Denied: Administrative portal is restricted exclusively to authorized platform administrators with RBAC Level 4 clearance. You have been redirected to the main interactive map interface.'
      );
      setTimeout(() => setRouteProtectionToast(null), 7000);
      return;
    }
    setActiveRole(role);
    setActiveTab(role);
    setIsWelcomeActive(false);
    updateUrlForRole(role);
    if (role !== 'admin') {
      setCurrentUser((prev) => (prev ? { ...prev, role: role as 'customer' | 'driver' | 'merchant' } : prev));
    }
  };

  const handleSelectTab = (tab: ActiveTabId) => {
    setIsWelcomeActive(false);
    if (tab === 'customer' || tab === 'simulator') {
      setActiveRole('customer');
      updateUrlForRole('customer');
      setCurrentUser((prev) => (prev ? { ...prev, role: 'customer' } : prev));
    } else if (tab === 'driver') {
      setActiveRole('driver');
      updateUrlForRole('driver');
      setCurrentUser((prev) => (prev ? { ...prev, role: 'driver' } : prev));
    } else if (tab === 'merchant') {
      setActiveRole('merchant');
      updateUrlForRole('merchant');
      setCurrentUser((prev) => (prev ? { ...prev, role: 'merchant' } : prev));
    } else {
      if (!currentUser || currentUser.role !== 'admin') {
        setActiveRole('customer');
        setActiveTab('customer');
        updateUrlForRole('customer');
        setRouteProtectionToast(
          'Access Denied: Administrative portal is restricted exclusively to authorized platform administrators. You have been redirected to the main interactive map interface.'
        );
        setTimeout(() => setRouteProtectionToast(null), 7000);
        return;
      }
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
      else setAdminInitialSection('dashboard');
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

  const handleUpdateUserVerification = (updatedUser: AuthUserData) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('wap_auth_user', JSON.stringify(updatedUser));
    } catch {
      // safe fallback
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950 transition-colors duration-200 ${themeMode === 'basic' ? 'theme-light-crisp bg-white text-slate-900' : 'bg-neutral-950 text-neutral-100'}`}>
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
        onUpdateUserVerification={handleUpdateUserVerification}
        isWelcomeActive={isWelcomeActive}
        onToggleWelcome={handleToggleWelcome}
        onSignOut={handleSignOut}
        themeMode={themeMode}
        onToggleThemeMode={handleToggleThemeMode}
        onOpenAboutUs={() => setShowAboutUsModal(true)}
        onOpenEmergencyChatbot={() => setShowEmergencyChatbotModal(true)}
      />

      {/* Route Protection Interception Security Banner */}
      {routeProtectionToast && (
        <div className="bg-red-600 text-white px-4 py-3 text-xs md:text-sm font-bold text-center sticky top-0 z-50 shadow-2xl flex items-center justify-center gap-3 border-b-2 border-red-300 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce text-amber-300" />
          <span>{routeProtectionToast}</span>
          <button
            type="button"
            onClick={() => setRouteProtectionToast(null)}
            className="ml-3 px-2 py-0.5 bg-red-800 hover:bg-red-900 rounded text-xs font-mono cursor-pointer border border-red-400"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Authenticated User Profile Header & Identity Verification Status Widget */}
      {currentUser && (
        <div className="bg-neutral-900/95 border-b border-amber-500/25 px-4 py-3 text-xs text-neutral-300 shadow-lg">
          <div className="max-w-7xl mx-auto space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="text-neutral-400">User Profile:</span>
                <strong className="text-white font-bold">{currentUser.name}</strong>
                <span className="text-neutral-400 hidden sm:inline">({currentUser.email})</span>
                {currentUser.role === 'admin' ? (
                  <span className="bg-red-950 text-red-200 border border-red-600 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                    Admin Clearance Level 4
                  </span>
                ) : (
                  <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold">
                    Role: {currentUser.role}
                  </span>
                )}
                <span className="text-amber-400 font-semibold">• {currentUser.subscriptionName}</span>
                <span className="text-neutral-400 hidden md:inline">• {currentUser.lbcBonus} LBC Freedom Balance (Investing Equity)</span>
              </div>
              <button
                id="top-welcome-portal-link"
                type="button"
                onClick={handleToggleWelcome}
                className="text-amber-400 hover:text-amber-300 hover:underline font-semibold text-xs cursor-pointer flex items-center gap-1"
              >
                <span>{isWelcomeActive ? '← Back to App Radar' : 'Subscription & Welcome Portal →'}</span>
              </button>
            </div>

            {/* Prominent Identity Verification Status Widget in Profile Header */}
            <IdentityVerificationStatusWidget
              user={currentUser}
              onUpdateUserVerification={handleUpdateUserVerification}
              compact={false}
            />
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
      <div className="bg-sky-50 border-b border-sky-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sky-900">Unified Mobile App:</span>
            <span className="text-slate-600 hidden sm:inline">
              Role-specific pages for Customers, Drivers &amp; Merchants with in-app task &amp; account management
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                isMobileFrameMode
                  ? 'bg-sky-700 text-white border-sky-800 shadow-sm'
                  : 'bg-white text-slate-800 border-sky-300 hover:bg-sky-100/60 shadow-sm'
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
                  <Smartphone className="w-3.5 h-3.5 text-sky-600" />
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

            {/* Role 4: Administration Panel (Restricted exclusively to authenticated admin role) */}
            {activeRole === 'admin' && (
              currentUser && currentUser.role === 'admin' ? (
                <AdminPanelWorkspace
                  region={selectedRegion}
                  language={selectedLanguage}
                  onPlaySpeech={handlePlaySpeech}
                  initialSection={adminInitialSection}
                  currentUser={currentUser}
                  onRedirectToMap={() => {
                    setActiveRole('customer');
                    setActiveTab('customer');
                    updateUrlForRole('customer');
                  }}
                />
              ) : (
                <CustomerInterface
                  region={selectedRegion}
                  language={selectedLanguage}
                  networkMode={networkMode}
                  onPlaySpeech={handlePlaySpeech}
                />
              )
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
        onOpenChatbot={() => setShowEmergencyChatbotModal(true)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-sky-800/60 py-4 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">Wap Architecture Suite</span>
            <span className="text-slate-400">• On-Demand Motorcycle Rides &amp; Deliveries for Caribbean Immigrant Communities</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <button
              onClick={() => setShowAboutUsModal(true)}
              className="text-sky-300 hover:text-white font-semibold underline underline-offset-2 cursor-pointer transition"
            >
              About Us &amp; Platform Charter
            </button>
            <button
              onClick={() => setShowDriverContractModal(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 cursor-pointer transition"
            >
              Driver Legal Contracts
            </button>
            <button
              onClick={() => setShowEmergencyChatbotModal(true)}
              className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 cursor-pointer transition"
            >
              Emergency Support Chat
            </button>
          </div>
        </div>
      </footer>

      {/* Global About Us Modal */}
      <AboutUsModal
        isOpen={showAboutUsModal}
        onClose={() => setShowAboutUsModal(false)}
        currentRegion={selectedRegion}
        language={selectedLanguage}
        onOpenDriverContract={() => setShowDriverContractModal(true)}
        onOpenEmergencySupport={() => setShowEmergencyChatbotModal(true)}
      />

      {/* Global Driver Partner Legal Contract Modal */}
      <DriverContractModal
        isOpen={showDriverContractModal}
        onClose={() => setShowDriverContractModal(false)}
        driverName={currentUser?.name || 'Jean-Baptiste Voltaire'}
        driverId={currentUser?.id ? `DRV-${currentUser.id}` : 'DRV-WAP-2026-8891'}
        region={selectedRegion}
        countryCode={REGIONS[selectedRegion]?.currency || 'HT'}
      />

      {/* 24/7 Priority Emergency & Support Chatbot Modal */}
      <EmergencyChatbotModal
        isOpen={showEmergencyChatbotModal}
        onClose={() => setShowEmergencyChatbotModal(false)}
        userRole={activeRole}
        userName={currentUser?.name || (activeRole === 'driver' ? 'Moïse Baptiste' : 'Valued User')}
        region={selectedRegion}
        language={selectedLanguage}
        onTriggerSOSBeacon={() => {
          // Open Floating SOS dialog or activate beacon
          const sosBtn = document.getElementById('floating-sos-btn');
          if (sosBtn) sosBtn.click();
        }}
      />

      <Analytics />
    </div>
  );
}

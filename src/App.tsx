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
  ShieldAlert
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { RegionId, LanguageCode } from './types/architecture';
import { Header, ActiveTabId } from './components/Header';
import { CustomerInterface } from './components/CustomerInterface';
import { DriverInterface } from './components/DriverInterface';
import { VendorInterface } from './components/VendorInterface';
import { ArchitectureView } from './components/ArchitectureView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { GoogleMapsIntegrationView } from './components/GoogleMapsIntegrationView';
import { PaymentsIntegrationView } from './components/PaymentsIntegrationView';
import { OfflineSyncView } from './components/OfflineSyncView';
import { MultilingualCMSView } from './components/MultilingualCMSView';
import { VerificationSystemView } from './components/VerificationSystemView';
import { DynamicPricingView } from './components/DynamicPricingView';
import { AdminOperationsConsole } from './components/AdminOperationsConsole';
import { MobileAppDesignStudio } from './components/MobileAppDesignStudio';
import { MobileBuildEngineerView } from './components/MobileBuildEngineerView';
import { BackendApiDispatchView } from './components/BackendApiDispatchView';
import { QaAutomationSuiteView } from './components/QaAutomationSuiteView';
import { DevOpsDeploymentView } from './components/DevOpsDeploymentView';
import { OnboardingPipelinesView } from './components/OnboardingPipelinesView';
import { PaymentExpansionSupportView } from './components/PaymentExpansionSupportView';
import { MarketplaceLbcBrokerageView } from './components/MarketplaceLbcBrokerageView';
import { translations } from './data/translations';
import { REGIONS } from './data/mockData';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('haiti');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ht');
  const [networkMode, setNetworkMode] = useState<'online' | 'edge' | 'offline'>('online');
  const [activeTab, setActiveTab] = useState<ActiveTabId>('simulator');
  const [simulatorSubTab, setSimulatorSubTab] = useState<'customer' | 'driver' | 'vendor' | 'marketplace'>('customer');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Global Header */}
      <Header
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        networkMode={networkMode}
        onToggleNetworkMode={toggleNetworkMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPlayVoiceGuide={handleGlobalVoiceGuide}
        isAudioPlaying={isAudioPlaying}
      />

      {/* Voice Prompt Live HUD Subtitle */}
      {audioTranscript && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold text-center sticky top-[88px] z-30 shadow-md flex items-center justify-center gap-2 transition-all">
          <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
          <span>"{audioTranscript}"</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Simulator Tab */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Top Sub-navigation for Role Switching */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-2.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-2">
                  Active Interface:
                </span>
                <div className="flex gap-1.5">
                  <button
                    id="subtab-customer"
                    onClick={() => setSimulatorSubTab('customer')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      simulatorSubTab === 'customer'
                        ? 'bg-amber-400 text-neutral-950 shadow'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{t.customerApp}</span>
                  </button>

                  <button
                    id="subtab-driver"
                    onClick={() => setSimulatorSubTab('driver')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      simulatorSubTab === 'driver'
                        ? 'bg-amber-400 text-neutral-950 shadow'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>{t.driverApp}</span>
                  </button>

                  <button
                    id="subtab-vendor"
                    onClick={() => setSimulatorSubTab('vendor')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      simulatorSubTab === 'vendor'
                        ? 'bg-amber-400 text-neutral-950 shadow'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{t.vendorPortal}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-neutral-400 hidden sm:block pr-2">
                Region: <strong className="text-white">{currentRegion.name}</strong> • Currency:{' '}
                <strong className="text-amber-400">{currentRegion.currency}</strong>
              </div>
            </div>

            {/* Active Sub-View */}
            {simulatorSubTab === 'customer' && (
              <CustomerInterface
                region={selectedRegion}
                language={selectedLanguage}
                networkMode={networkMode}
                onPlaySpeech={handlePlaySpeech}
              />
            )}

            {simulatorSubTab === 'driver' && (
              <DriverInterface
                region={selectedRegion}
                language={selectedLanguage}
                networkMode={networkMode}
                onPlaySpeech={handlePlaySpeech}
              />
            )}

            {simulatorSubTab === 'vendor' && (
              <VendorInterface
                region={selectedRegion}
                language={selectedLanguage}
                onPlaySpeech={handlePlaySpeech}
              />
            )}
          </div>
        )}

        {/* 3-Sided Marketplace & LBC Token Brokerage */}
        {activeTab === 'marketplace-lbc' && (
          <MarketplaceLbcBrokerageView
            region={selectedRegion}
            language={selectedLanguage}
            onPlaySpeech={handlePlaySpeech}
          />
        )}

        {/* Mobile UI/UX Wireframe & Code Studio */}
        {activeTab === 'mobile-studio' && <MobileAppDesignStudio />}

        {/* Mobile Build Engineer (Android Gradle & iOS Fastlane/Xcode) */}
        {activeTab === 'mobile-build' && <MobileBuildEngineerView />}

        {/* Backend REST APIs & PostGIS Spatial Dispatch View */}
        {activeTab === 'api-dispatch' && <BackendApiDispatchView />}

        {/* QA Automation & E2E Dry-Run Simulation View */}
        {activeTab === 'qa-automation' && <QaAutomationSuiteView />}

        {/* Cloud DevOps, Docker & Infrastructure View */}
        {activeTab === 'devops' && <DevOpsDeploymentView />}

        {/* Admin Operations & Geofencing Console */}
        {activeTab === 'admin' && <AdminOperationsConsole />}

        {/* Multilingual CMS Tab */}
        {activeTab === 'cms' && <MultilingualCMSView />}

        {/* User Verification & Community Vouching Tab */}
        {activeTab === 'verification' && <VerificationSystemView />}

        {/* Dynamic Pricing Engine Tab */}
        {activeTab === 'pricing' && <DynamicPricingView />}

        {/* Onboarding Pipelines Tab */}
        {activeTab === 'onboarding' && <OnboardingPipelinesView />}

        {/* Payment Expansion & Omni-Channel Support Tab */}
        {activeTab === 'expansion' && <PaymentExpansionSupportView />}

        {/* Architecture Tab */}
        {activeTab === 'architecture' && <ArchitectureView />}

        {/* Database Schema Tab */}
        {activeTab === 'database' && <DatabaseSchemaView />}

        {/* Google Maps Tab */}
        {activeTab === 'maps' && <GoogleMapsIntegrationView />}

        {/* Payments Tab */}
        {activeTab === 'payments' && <PaymentsIntegrationView />}

        {/* Offline Sync Tab */}
        {activeTab === 'offline' && <OfflineSyncView />}
      </main>

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

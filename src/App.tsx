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
import { Header, ActiveTabId, ActiveRole } from './components/Header';
import { CustomerInterface } from './components/CustomerInterface';
import { DriverInterface } from './components/DriverInterface';
import { VendorInterface } from './components/VendorInterface';
import { AdminPanelWorkspace, AdminSectionId } from './components/AdminPanelWorkspace';
import { FloatingSOSButton } from './components/FloatingSOSButton';
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
  };

  const handleSelectTab = (tab: ActiveTabId) => {
    setActiveTab(tab);
    if (tab === 'customer' || tab === 'simulator') {
      setActiveRole('customer');
    } else if (tab === 'driver') {
      setActiveRole('driver');
    } else if (tab === 'merchant') {
      setActiveRole('merchant');
    } else {
      setActiveRole('admin');
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
      />

      {/* Voice Prompt Live HUD Subtitle */}
      {audioTranscript && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold text-center sticky top-[88px] z-30 shadow-md flex items-center justify-center gap-2 transition-all">
          <Volume2 className="w-4 h-4 animate-bounce shrink-0" />
          <span>"{audioTranscript}"</span>
        </div>
      )}

      {/* Main Content Area: Strictly Render Current User Role Interface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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

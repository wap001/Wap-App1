import React, { useState } from 'react';
import {
  ShieldAlert,
  Server,
  Layers,
  Database,
  Cloud,
  Terminal,
  FileCheck,
  TrendingUp,
  CreditCard,
  Languages,
  Smartphone,
  CheckCircle,
  Coins,
  MapPin,
  Lock,
  Cpu,
  Activity,
  AlertTriangle,
  Users
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { AdminOperationsConsole } from './AdminOperationsConsole';
import { VerificationSystemView } from './VerificationSystemView';
import { OnboardingPipelinesView } from './OnboardingPipelinesView';
import { DynamicPricingView } from './DynamicPricingView';
import { PaymentExpansionSupportView } from './PaymentExpansionSupportView';
import { PaymentsIntegrationView } from './PaymentsIntegrationView';
import { BackendApiDispatchView } from './BackendApiDispatchView';
import { QaAutomationSuiteView } from './QaAutomationSuiteView';
import { DevOpsDeploymentView } from './DevOpsDeploymentView';
import { DatabaseSchemaView } from './DatabaseSchemaView';
import { ArchitectureView } from './ArchitectureView';
import { OfflineSyncView } from './OfflineSyncView';
import { GoogleMapsIntegrationView } from './GoogleMapsIntegrationView';
import { MobileAppDesignStudio } from './MobileAppDesignStudio';
import { MobileBuildEngineerView } from './MobileBuildEngineerView';
import { MultilingualCMSView } from './MultilingualCMSView';
import { MarketplaceLbcBrokerageView } from './MarketplaceLbcBrokerageView';

export type AdminSectionId =
  | 'operations'
  | 'verification'
  | 'onboarding'
  | 'pricing'
  | 'payments'
  | 'backend-api'
  | 'qa-automation'
  | 'devops'
  | 'database'
  | 'architecture'
  | 'maps'
  | 'mobile-studio'
  | 'mobile-build'
  | 'marketplace-brokerage'
  | 'cms';

interface AdminPanelWorkspaceProps {
  region: RegionId;
  language: LanguageCode;
  onPlaySpeech: (text: string) => void;
  initialSection?: AdminSectionId;
}

export const AdminPanelWorkspace: React.FC<AdminPanelWorkspaceProps> = ({
  region,
  language,
  onPlaySpeech,
  initialSection = 'operations'
}) => {
  const [activeSection, setActiveSection] = useState<AdminSectionId>(initialSection);

  const adminNavItems: {
    id: AdminSectionId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    category: 'Operations' | 'Fleet & Security' | 'Engineering' | 'DevOps & Data';
  }[] = [
    // Operations & Telemetry
    {
      id: 'operations',
      label: 'Fleet Operations & Heatmaps',
      icon: <Layers className="w-3.5 h-3.5 text-amber-400" />,
      badge: 'Live',
      category: 'Operations'
    },
    {
      id: 'marketplace-brokerage',
      label: '3-Sided & LBC Treasury Brokerage',
      icon: <Coins className="w-3.5 h-3.5 text-amber-400" />,
      badge: 'Treasury',
      category: 'Operations'
    },
    {
      id: 'pricing',
      label: 'Dynamic Pricing & Wage Floors',
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
      category: 'Operations'
    },
    {
      id: 'payments',
      label: 'Payment Expansion & FinTech Rails',
      icon: <CreditCard className="w-3.5 h-3.5 text-cyan-400" />,
      category: 'Operations'
    },

    // Fleet & Security
    {
      id: 'verification',
      label: 'Driver Verification & KYC Audits',
      icon: <FileCheck className="w-3.5 h-3.5 text-emerald-400" />,
      badge: 'KYC',
      category: 'Fleet & Security'
    },
    {
      id: 'onboarding',
      label: 'Driver & Merchant Onboarding',
      icon: <Users className="w-3.5 h-3.5 text-amber-400" />,
      category: 'Fleet & Security'
    },

    // Engineering & APIs
    {
      id: 'backend-api',
      label: 'Backend REST & PostGIS Dispatch',
      icon: <Server className="w-3.5 h-3.5 text-cyan-400" />,
      badge: 'PostGIS',
      category: 'Engineering'
    },
    {
      id: 'qa-automation',
      label: 'QA Automation & E2E Dry-Run',
      icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
      category: 'Engineering'
    },
    {
      id: 'maps',
      label: 'Google Maps & Geofencing Rails',
      icon: <MapPin className="w-3.5 h-3.5 text-amber-400" />,
      category: 'Engineering'
    },
    {
      id: 'mobile-studio',
      label: 'Mobile UI/UX Studio & Code',
      icon: <Smartphone className="w-3.5 h-3.5 text-amber-400" />,
      category: 'Engineering'
    },
    {
      id: 'mobile-build',
      label: 'Mobile Build Engineer (Gradle/Fastlane)',
      icon: <Terminal className="w-3.5 h-3.5 text-neutral-300" />,
      category: 'Engineering'
    },
    {
      id: 'cms',
      label: 'Multilingual CMS & Localized Copy',
      icon: <Languages className="w-3.5 h-3.5 text-indigo-400" />,
      category: 'Engineering'
    },

    // DevOps & Data
    {
      id: 'devops',
      label: 'Cloud DevOps, Docker & CI/CD',
      icon: <Cloud className="w-3.5 h-3.5 text-sky-400" />,
      badge: 'Port 3000',
      category: 'DevOps & Data'
    },
    {
      id: 'database',
      label: 'Database Schema & Tables',
      icon: <Database className="w-3.5 h-3.5 text-amber-400" />,
      category: 'DevOps & Data'
    },
    {
      id: 'architecture',
      label: 'System Topology & Offline Sync',
      icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />,
      category: 'DevOps & Data'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Administrative Security Clearance Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 tracking-wider uppercase">
                ADMINISTRATION &amp; PLATFORM CONTROL PANEL
              </span>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/80 px-2 py-0.5 rounded-full font-mono font-bold">
                Level 4 Security Clearance
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Backend Operations &amp; Infrastructure Governance
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Restricted console exclusively for dispatch supervisors, compliance auditors, and DevOps engineers.
              End-user customer, driver, and merchant interfaces do not have access to these controls.
            </p>
          </div>
        </div>

        {/* Live System Status HUD */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Container Port</div>
            <div className="text-white font-mono font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3000 (Proxy OK)</span>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Access Scope</div>
            <div className="text-amber-400 font-bold text-xs">Admin Only</div>
          </div>
        </div>
      </div>

      {/* Admin Sub-Navigation Menu */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2 shadow-md">
        <div className="flex overflow-x-auto gap-1.5 no-scrollbar py-0.5 text-xs">
          {adminNavItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`btn-admin-tab-${item.id}`}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-neutral-950 text-amber-400'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Administrative Module Content */}
      <div className="transition-all">
        {activeSection === 'operations' && <AdminOperationsConsole />}

        {activeSection === 'marketplace-brokerage' && (
          <MarketplaceLbcBrokerageView
            region={region}
            language={language}
            onPlaySpeech={onPlaySpeech}
          />
        )}

        {activeSection === 'pricing' && <DynamicPricingView />}

        {activeSection === 'payments' && (
          <div className="space-y-6">
            <PaymentExpansionSupportView />
            <PaymentsIntegrationView />
          </div>
        )}

        {activeSection === 'verification' && <VerificationSystemView />}

        {activeSection === 'onboarding' && (
          <OnboardingPipelinesView />
        )}

        {activeSection === 'backend-api' && <BackendApiDispatchView />}

        {activeSection === 'qa-automation' && <QaAutomationSuiteView />}

        {activeSection === 'maps' && <GoogleMapsIntegrationView />}

        {activeSection === 'mobile-studio' && <MobileAppDesignStudio />}

        {activeSection === 'mobile-build' && <MobileBuildEngineerView />}

        {activeSection === 'cms' && <MultilingualCMSView />}

        {activeSection === 'devops' && <DevOpsDeploymentView />}

        {activeSection === 'database' && <DatabaseSchemaView />}

        {activeSection === 'architecture' && (
          <div className="space-y-6">
            <ArchitectureView />
            <OfflineSyncView />
          </div>
        )}
      </div>
    </div>
  );
};

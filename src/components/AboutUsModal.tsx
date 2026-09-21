import React, { useState } from 'react';
import {
  Info,
  Shield,
  FileText,
  HeartHandshake,
  Coins,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  PhoneCall,
  Clock,
  Car,
  Bike
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion?: RegionId;
  language?: LanguageCode;
  onOpenDriverContract?: () => void;
  onOpenEmergencySupport?: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  currentRegion = 'haiti',
  language = 'en',
  onOpenDriverContract,
  onOpenEmergencySupport
}) => {
  const [activeSection, setActiveSection] = useState<'mission' | 'contracts' | 'safety' | 'liberte_cash'>('mission');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="modal-blue-surface rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-blue-500/30">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 modal-blue-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-amber-300">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">About Wap Platform</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-400/40">
                  Global Mobility &amp; Dignity
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                Building consistent daily livelihoods, formal legal protection, and financial freedom.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Close About Us"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 px-5 pt-2 bg-neutral-950/40 gap-2 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSection('mission')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'mission'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Our Mission &amp; Purpose</span>
          </button>
          <button
            onClick={() => setActiveSection('contracts')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'contracts'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Driver Legal Contracts</span>
          </button>
          <button
            onClick={() => setActiveSection('safety')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'safety'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Safety, Zero-Tolerance &amp; Ban</span>
          </button>
          <button
            onClick={() => setActiveSection('liberte_cash')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'liberte_cash'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Liberté Cash &amp; Wealth</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-neutral-300">
          
          {/* SECTION 1: MISSION */}
          {activeSection === 'mission' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400/10 via-neutral-900 to-neutral-950 border border-amber-400/20">
                <h3 className="text-base font-bold text-white mb-1">Empowering Developing &amp; Diaspora Communities</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Wap was established to provide reliable mobility, rapid courier delivery, and merchant ordering tailored specifically for working-class populations and diaspora hubs across the Caribbean, Latin America, and Africa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Consistent, Predictable Income</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    While daily transportation work can experience natural volume shifts, Wap guarantees steady dispatched demand, zero predatory middleman cuts, and instant daily cashout options so drivers never return home empty-handed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    <span>Full Community Dignity</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Every driver, customer, and merchant is treated as an essential partner. We replace informal street uncertainty with transparent tariffs, verified profiles, and automated community escrow protection.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Our 24-Hour Operations Footprint</span>
                  <span className="text-[11px] font-mono text-amber-400">Caribbean • Guianas • Africa</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Operating with localized currency rails (HTG, EUR, GYD, SRD, BSD, ANG, BBD, XCD, XOF, XAF, CDF, ZMW, NAD) across Port-au-Prince, Cayenne, Georgetown, Paramaribo, Dakar, Bamako, Niamey, Brazzaville, Kinshasa, Lusaka, Windhoek, and Cotonou.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 2: DRIVER LEGAL CONTRACTS */}
          {activeSection === 'contracts' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Formal Legal Contracts for Every Driver Partner</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  We believe no driver should operate in the shadows of the informal economy. Every verified driver on Wap is issued a formal, standardized bilateral partner contract that certifies their legal right to transport passengers, freight, and food.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="font-bold text-xs text-white">1. Protection from Harassment &amp; Street Extortion</span>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Having an official registered driver contract with a verified digital credential, QR badge, and municipal dispatch registry helps protect drivers from arbitrary police fines, unlawful checkpoint delays, or municipal impoundment.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="font-bold text-xs text-white">2. Proof of Steady Employment &amp; Banking Access</span>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Informal workers often cannot open bank accounts, obtain microloans, or secure visas. The Wap Driver Contract serves as verifiable proof of professional activity, opening pathways to formal financial inclusion.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="font-bold text-xs text-white">3. Clear Rights &amp; Guaranteed Platform Backing</span>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    The contract legally binds the platform to reimburse the driver in cases of passenger non-payment, provides emergency legal assistance, and anchors their ownership stake in Liberté Cash equity.
                  </p>
                </div>
              </div>

              {onOpenDriverContract && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDriverContract();
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Sample Driver Legal Contract Agreement</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: ZERO TOLERANCE, BANS & LEGAL SUITS */}
          {activeSection === 'safety' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Strict Zero-Tolerance Safety &amp; Non-Payment Policy</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  The safety and financial protection of drivers, merchants, and customers is completely non-negotiable. Any violation triggers immediate, permanent, and legally binding consequences.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="font-bold text-red-300 block">Assault, Battery &amp; Aggression</span>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    Any act of physical battery, verbal abuse, threat, or criminal conduct results in an <strong className="text-white">instant lifetime ban</strong>. The perpetrator’s verified passport, national ID number, and device IMEI are permanently blacklisted across our worldwide network.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="font-bold text-amber-300 block">Customer Non-Payment Protection</span>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    If a customer takes a ride or accepts food and refuses to pay, <strong className="text-emerald-400">the platform pays the driver 100% of the fare immediately</strong>. The defaulting customer is banned for life and handed to civil debt recovery and local law enforcement.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <span className="font-bold text-xs text-white">Full Legal Prosecution &amp; Passport Blacklist</span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Because all users are authenticated via passport or national identity verification, bad actors cannot simply register with a new phone number. Wap maintains complete, timestamped GPS telemetry and audio evidence, reserving the full right to file criminal charges and civil lawsuits against any offending party.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: LIBERTE CASH & FINANCIAL FREEDOM */}
          {activeSection === 'liberte_cash' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400/10 via-neutral-900 to-neutral-950 border border-amber-400/30">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Coins className="w-4 h-4" />
                  <span>Financial Freedom Through Liberté Cash (LBC)</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Wap is not merely a transport service—it is a vehicle for long-term wealth creation. Every mile driven, trip taken, and meal prepared generates dividend-yielding equity for our community.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Hedge Against Currency Devaluation</span>
                    <span className="text-[10px] text-emerald-400 font-mono">1:1 USD Staking Peg</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Local currencies in developing nations frequently lose purchasing power due to rapid inflation. Liberté Cash enables drivers and merchants to save their earnings in a stable digital asset shielded from local currency shocks.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Daily 5.2% APY Staking Rewards</span>
                    <span className="text-[10px] text-amber-400 font-mono">Compound Interest</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Holding LBC in your in-app wallet earns daily interest, transforming everyday work into a growing family investment portfolio.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Zero Predatory Platform Cuts</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Fair Sharing</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    While traditional multinational apps extract 25%–35% of driver revenue and siphon it offshore, Wap retains minimal operational overhead (4%–8%) and circulates platform dividends back into community development pools.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Wap Operating Charter • 2026 Edition</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEmergencySupport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEmergencySupport();
                }}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>Emergency AI Support</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

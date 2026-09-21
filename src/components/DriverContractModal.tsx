import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  Printer,
  X,
  User,
  Bike,
  Building,
  Scale,
  Award,
  Calendar,
  Lock,
  Coins
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';

interface DriverContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  driverId?: string;
  vehicleClass?: string;
  plateNumber?: string;
  region?: RegionId;
  countryCode?: string;
}

export const DriverContractModal: React.FC<DriverContractModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Jean-Baptiste Voltaire',
  driverId = 'DRV-WAP-2026-8891',
  vehicleClass = 'Motorcycle (2-Wheeler)',
  plateNumber = 'HT-5829-TL',
  region = 'haiti',
  countryCode = 'HT'
}) => {
  const [hasAgreed, setHasAgreed] = useState(true);
  const [signatureDate] = useState(() => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [digitalSignature] = useState(`SIG-VERIFIED-${driverId}`);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800/80 bg-neutral-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Official Driver Partner Contract</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Legally Registered &amp; Verified
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Statutory bilateral agreement for professional transport authorization &amp; rights protection.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
            title="Close Contract"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-neutral-300">
          
          {/* Certificate Banner */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider block">Contract Reference</span>
              <div className="font-mono text-sm font-black text-white">{driverId}</div>
              <div className="text-[11px] text-neutral-400">Registry: Wap Regional Operations Hub ({countryCode})</div>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider block">Certified Partner</span>
              <div className="font-bold text-amber-400 text-sm">{driverName}</div>
              <div className="text-[11px] text-neutral-400 font-mono">{vehicleClass} • {plateNumber}</div>
            </div>
          </div>

          {/* Core Contract Articles */}
          <div className="space-y-4 bg-neutral-950/60 p-4 sm:p-5 rounded-2xl border border-neutral-800/80 leading-relaxed">
            
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <span className="text-amber-400 font-mono">Article 1:</span>
                <span>Recognition of Professional Transport Activity</span>
              </h3>
              <p className="text-neutral-400 text-[11px]">
                The Wap Platform formally certifies that the Driver is an independent registered transport contractor authorized to carry passengers, commercial freight, and food parcels. This contract establishes the legality of the Driver&apos;s operations against arbitrary detention or ungrounded street fines.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <span className="text-amber-400 font-mono">Article 2:</span>
                <span>Consistent Earnings, Transparency &amp; Zero Predatory Deductions</span>
              </h3>
              <p className="text-neutral-400 text-[11px]">
                Wap guarantees transparent, upfront pricing with zero hidden kickbacks. While passenger volume fluctuates based on peak hours, the platform provides steady algorithmic dispatch, a guaranteed hourly minimum earnings floor, and immediate daily cashouts via mobile money or bank rails.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <span className="text-amber-400 font-mono">Article 3:</span>
                <span>Non-Payment Protection &amp; Escrow Guarantee</span>
              </h3>
              <p className="text-neutral-400 text-[11px]">
                Under the Wap Cash Escrow charter, if a passenger defaults, refuses to pay, or attempts fraud, the platform assumes 100% of the liability and reimburses the Driver immediately. The defaulting customer is banned for life and subject to legal prosecution.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <span className="text-amber-400 font-mono">Article 4:</span>
                <span>Zero-Tolerance Physical Safety &amp; Emergency Assistance</span>
              </h3>
              <p className="text-neutral-400 text-[11px]">
                Any assault, aggression, or weaponized threat against a driver triggers immediate platform legal filing with local authorities. The platform provides real-time GPS distress beacons, audio streaming, and legal counsel representation.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <span className="text-amber-400 font-mono">Article 5:</span>
                <span>Liberté Cash Equity &amp; Wealth Ownership</span>
              </h3>
              <p className="text-neutral-400 text-[11px]">
                As an authorized contract driver, every trip completed earns the Driver dividend-yielding Liberté Cash (LBC). Staked LBC yields 5.2% APY compound returns to build long-term family wealth and financial freedom.
              </p>
            </div>

          </div>

          {/* Digital Signatures Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Wap Platform Legal Representative</span>
              <div className="font-serif italic text-base text-amber-400">Wap Global Mobility LLC</div>
              <div className="text-[10px] text-neutral-500 font-mono">Digital Notary Key: SHA256:7f4a9b21e840d...</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Signed &amp; Ratified
              </div>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-neutral-800 sm:pl-4">
              <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">Driver Partner Signature</span>
              <div className="font-serif italic text-base text-emerald-400">{driverName}</div>
              <div className="text-[10px] text-neutral-500 font-mono">{digitalSignature}</div>
              <div className="text-[10px] text-neutral-400">Date Ratified: {signatureDate}</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographically Certified Contract</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  FileText,
  Users,
  Award,
  Database,
  Server,
  CheckCircle,
  AlertTriangle,
  Send,
  Copy,
  Check
} from 'lucide-react';
import {
  VERIFICATION_DATABASE_SCHEMA_SQL,
  SAMPLE_COMMUNITY_VOUCHES
} from '../data/extendedArchitectureData';
import { CommunityVouch } from '../types/architecture';

export const VerificationSystemView: React.FC = () => {
  const [vouches, setVouches] = useState<CommunityVouch[]>(SAMPLE_COMMUNITY_VOUCHES);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'vouching' | 'schema' | 'api'>('overview');
  const [copied, setCopied] = useState(false);

  // New vouch simulation form state
  const [newVoucherRole, setNewVoucherRole] = useState<'pastor' | 'moto_syndicate_leader' | 'merchant'>('pastor');
  const [newVoucherName, setNewVoucherName] = useState('');
  const [newVouchText, setNewVouchText] = useState('');
  const [newStakeAmount, setNewStakeAmount] = useState('2000');

  const handleCopy = () => {
    navigator.clipboard.writeText(VERIFICATION_DATABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddVouch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherName || !newVouchText) return;

    const newVouch: CommunityVouch = {
      id: `vouch-${Date.now()}`,
      targetUserId: 'usr-driver-891',
      targetUserName: 'Jean-Baptiste Voltaire',
      targetUserRole: 'driver',
      voucherUserId: `usr-vch-${Math.floor(Math.random() * 1000)}`,
      voucherName: newVoucherName,
      voucherRole: newVoucherRole,
      relationship: 'known_in_community',
      reputationWeight: newVoucherRole === 'pastor' ? 9.8 : newVoucherRole === 'moto_syndicate_leader' ? 9.5 : 8.9,
      stakeAmountEscrow: parseFloat(newStakeAmount) || 0,
      vouchStatement: newVouchText,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    setVouches([newVouch, ...vouches]);
    setNewVoucherName('');
    setNewVouchText('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <ShieldCheck className="w-5 h-5" />
          <span>IDENTITY TRUST & VERIFICATION ARCHITECTURE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Dual-Track Profile Verification & Community Vouching Framework
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Because millions of displaced workers and diaspora migrants across Haiti, French Guiana, Guyana, and Suriname
          lack traditional banking history or standardized credit bureaus, Wap combines formal government document verification
          with an on-chain/ledger-backed <strong className="text-amber-300">Community Vouching Network</strong> (*Rezo Temwayaj Kominotè*).
        </p>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Verification Architecture & Tiers</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vouching')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'vouching'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Community Vouching Simulator & Trust Score</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'schema'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Relational Schema</span>
        </button>

        <button
          onClick={() => setActiveSubTab('api')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'api'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Verification Workflow REST API</span>
        </button>
      </div>

      {/* Sub-Tab 1: Overview & Tiers */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {/* 3-Tier Verification Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Tier 1 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Tier 1: Basic Verified</span>
                <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[10px] font-mono">
                  All Customers
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Entry-level access for booking standard motorcycle rides and ordering food delivery with cash.
              </p>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1 text-[11px] text-neutral-300">
                <div className="font-bold text-amber-400">Required Verification:</div>
                <div>• Verified Mobile Phone (SMS / WhatsApp OTP)</div>
                <div>• Customer Full Legal Name & Photo</div>
                <div>• Device Fingerprint & SIM Registration</div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">Max Transaction: 5,000 HTG / 50 EUR</div>
            </div>

            {/* Tier 2 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Tier 2: Verified Profile</span>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-mono">
                  Standard Drivers & Vendors
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Required for all active motorcycle taxi operators and high-value courier parcel senders.
              </p>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1 text-[11px] text-neutral-300">
                <div className="font-bold text-amber-400">Dual Options:</div>
                <div>• Path A: National ID / Passport / Carte de Séjour / Permit</div>
                <div>• Path B: 2 Verified Community Elder/Merchant Vouches</div>
                <div>• Mandatory Motorcycle & Dual Helmet Photo Audit</div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">Max Transaction: 25,000 HTG / 250 EUR</div>
            </div>

            {/* Tier 3 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Tier 3: Trusted Elite Fleet</span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                  High-Trust Drivers
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Entitled to bank deposit runs, medicine deliveries, cash remittance transport, and higher COD float limits.
              </p>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1 text-[11px] text-neutral-300">
                <div className="font-bold text-amber-400">Required Credentials:</div>
                <div>• 100+ Completed Trips with &gt; 4.85 Star Rating</div>
                <div>• Document OCR + Biometric Liveness Passed</div>
                <div>• Clean Community Record & Zero Safety Incidents</div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">COD Float: 25,000 HTG / 500 EUR</div>
            </div>
          </div>

          {/* Verification Pipeline Diagram */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Multi-Source Verification Engine Pipeline</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                <div className="font-bold text-cyan-400">1. Document Intake & OCR</div>
                <p className="text-neutral-400 text-[11px]">
                  Extracts name, document number, and expiry date. Validates against checksum algorithms for Haitian CIN and French residence cards.
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                <div className="font-bold text-purple-400">2. Facial Biometrics</div>
                <p className="text-neutral-400 text-[11px]">
                  Matches selfie liveness video against document photo, rejecting digital screen spoofing or paper printouts.
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                <div className="font-bold text-amber-400">3. Community Vouch Layer</div>
                <p className="text-neutral-400 text-[11px]">
                  Community elders and merchants sign cryptographic endorsements. If an incident occurs, the voucher's trust weight is penalized.
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1">
                <div className="font-bold text-emerald-400">4. Dynamic Trust Scoring</div>
                <p className="text-neutral-400 text-[11px]">
                  Aggregates all signals into a composite score (0-100) recalculated on every trip completion or dispute.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Community Vouching Simulator */}
      {activeSubTab === 'vouching' && (
        <div className="space-y-4">
          {/* Driver Trust Score Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-neutral-400">Subject Driver:</div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>Jean-Baptiste Voltaire</span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-800">
                    Tier 2 Verified
                  </span>
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">Motorcycle: Haojin 150cc • Plate: AA-8921</div>
              </div>

              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-black text-amber-400">88 / 100</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Composite Trust Score</div>
                </div>

                <div className="border-l border-neutral-800 pl-6 space-y-1 text-left text-xs">
                  <div className="text-neutral-300">
                    Document Points: <strong className="text-white">35 / 40</strong>
                  </div>
                  <div className="text-neutral-300">
                    Community Vouches: <strong className="text-white">28 / 30</strong> ({vouches.length} vouches)
                  </div>
                  <div className="text-neutral-300">
                    Trip Fulfillment: <strong className="text-white">25 / 30</strong> (247 completed)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form: Add Community Vouch */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Submit Digital Community Endorsement (*Temwayaj Kominotè*)</span>
            </h2>

            <form onSubmit={handleAddVouch} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Voucher Authority Role</label>
                <select
                  value={newVoucherRole}
                  onChange={(e) => setNewVoucherRole(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="pastor">Church Pastor / Priest (High Moral Standing)</option>
                  <option value="moto_syndicate_leader">Motorcycle Syndicate Leader (Kafou/Delmas)</option>
                  <option value="merchant">Registered Local Merchant / Shop Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Voucher Full Name & Title</label>
                <input
                  type="text"
                  placeholder="e.g. Pastè Jean-Claude (Kafou)"
                  value={newVoucherName}
                  onChange={(e) => setNewVoucherName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Reputation Collateral Stake (HTG)</label>
                <input
                  type="number"
                  placeholder="2000"
                  value={newStakeAmount}
                  onChange={(e) => setNewStakeAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-neutral-400 mb-1">Attestation Statement (Creole or French)</label>
                <input
                  type="text"
                  placeholder="e.g. Mwen konnen chofè sa depi 6 lane, li serye e li pa janm nan pwoblèm ak pasaje."
                  value={newVouchText}
                  onChange={(e) => setNewVouchText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Stake Social Reputation & Sign Endorsement</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Vouches List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Active Community Endorsements ({vouches.length})
            </h3>

            <div className="divide-y divide-neutral-800">
              {vouches.map((v) => (
                <div key={v.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{v.voucherName}</span>
                      <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[10px] capitalize">
                        {v.voucherRole.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-amber-400">
                        Reputation Weight: {v.reputationWeight} / 10
                      </span>
                    </div>

                    <div className="text-[11px] text-emerald-400 font-mono">
                      {v.stakeAmountEscrow ? `Collateral Staked: ${v.stakeAmountEscrow} HTG` : 'Social Guarantee'}
                    </div>
                  </div>

                  <p className="text-neutral-300 italic text-[11px]">"{v.vouchStatement}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: PostgreSQL Schema */}
      {activeSubTab === 'schema' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Verification & Community Vouching DDL (PostgreSQL 16)</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Implements verification requests, uploaded document hashes, community vouches with collateral stakes, and safety audits.
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL' : 'Copy DDL'}</span>
            </button>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 overflow-x-auto max-h-[460px]">
            <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
              <code>{VERIFICATION_DATABASE_SCHEMA_SQL.trim()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: API Endpoints */}
      {activeSubTab === 'api' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Verification Workflow REST API Specification</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-400 font-bold">POST /api/v1/verification/documents</span>
                <span className="text-neutral-500">201 Created</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Accepts multipart/form-data for ID cards, passports, or humanitarian receipts. Triggers Google Cloud Vision OCR
                and fraud tampering detection.
              </p>
              <div className="bg-neutral-900 p-2.5 rounded font-mono text-[11px] text-neutral-300">
                Body: {'{'} document_type, document_number, country, front_image, selfie {'}'}
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-400 font-bold">POST /api/v1/verification/community-vouch</span>
                <span className="text-neutral-500">201 Created</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                A community elder, pastor, or merchant endorses a driver. Digitally signs with HMAC-SHA256 and records social
                collateral stake.
              </p>
              <div className="bg-neutral-900 p-2.5 rounded font-mono text-[11px] text-neutral-300">
                Body: {'{'} target_user_id, voucher_authority_type, statement, stake_amount {'}'}
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-cyan-400 font-bold">GET /api/v1/verification/trust-score/:userId</span>
                <span className="text-neutral-500">200 OK</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Returns composite trust score (0-100), active tier (Tier 1 / Tier 2 / Tier 3), and breakdown of document vs.
                vouch points.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-amber-400 font-bold">POST /api/v1/verification/safety-inspection</span>
                <span className="text-neutral-500">200 OK</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Submits daily pre-shift selfie verifying driver helmet + clean passenger spare helmet. AI vision verifies
                presence before granting online status.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

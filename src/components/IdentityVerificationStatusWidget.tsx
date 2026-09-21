import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Info,
  Check,
} from 'lucide-react';
import { AuthUserData, VerificationStatus, PassportDocumentInfo } from './WelcomeLandingInterface';

interface IdentityVerificationStatusWidgetProps {
  user: AuthUserData;
  onUpdateUserVerification?: (updatedUser: AuthUserData) => void;
  compact?: boolean;
}

export const IdentityVerificationStatusWidget: React.FC<IdentityVerificationStatusWidgetProps> = ({
  user,
  onUpdateUserVerification,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [reuploadNumber, setReuploadNumber] = useState(user.passportDocument?.passportNumber || '');
  const [reuploadCountry, setReuploadCountry] = useState(user.passportDocument?.issuingCountry || 'Haiti (HT)');

  const status: VerificationStatus = user.verificationStatus || 'pending';
  const progress: number =
    user.verificationProgress !== undefined
      ? user.verificationProgress
      : status === 'approved'
      ? 100
      : status === 'rejected'
      ? 35
      : 65;

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold text-xs shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="tracking-wide">Passport Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 font-semibold text-xs shadow-sm animate-pulse">
            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="tracking-wide">Passport Action Required</span>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 font-semibold text-xs shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="tracking-wide">Validation Pending ({progress}%)</span>
          </div>
        );
    }
  };

  const handleSimulateStatusChange = (newStatus: VerificationStatus) => {
    if (!onUpdateUserVerification) return;
    setIsSimulating(true);

    setTimeout(() => {
      setIsSimulating(false);
      const newProgress = newStatus === 'approved' ? 100 : newStatus === 'rejected' ? 30 : 65;
      const newNotes =
        newStatus === 'approved'
          ? 'Passport validated against Caribbean Community biometric registry and security sanctions screen.'
          : newStatus === 'rejected'
          ? 'Passport scan rejected due to glare on the machine-readable zone (MRZ). Please re-upload a clear color photo.'
          : 'Document received and queued for automated OCR checksum validation and agent review.';

      const updatedUser: AuthUserData = {
        ...user,
        verificationStatus: newStatus,
        verificationProgress: newProgress,
        verificationNotes: newNotes,
      };

      try {
        localStorage.setItem('wap_auth_user', JSON.stringify(updatedUser));
      } catch {
        // safe fallback
      }

      onUpdateUserVerification(updatedUser);
    }, 400);
  };

  const handleReuploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateUserVerification) return;

    const doc: PassportDocumentInfo = {
      fileName: reuploadFile ? reuploadFile.name : `passport_resubmitted_${Date.now()}.pdf`,
      fileSize: reuploadFile ? `${(reuploadFile.size / 1024).toFixed(1)} KB` : '1.4 MB',
      fileType: reuploadFile?.type || 'application/pdf',
      uploadedAt: new Date().toISOString(),
      passportNumber: reuploadNumber.trim() || user.passportDocument?.passportNumber || 'P10982344',
      issuingCountry: reuploadCountry,
      expirationDate: '2031-10-15',
    };

    const updatedUser: AuthUserData = {
      ...user,
      passportDocument: doc,
      verificationStatus: 'pending',
      verificationProgress: 45,
      verificationNotes: 'Fresh document submission received. Under priority compliance review.',
    };

    try {
      localStorage.setItem('wap_auth_user', JSON.stringify(updatedUser));
    } catch {
      // safe fallback
    }

    onUpdateUserVerification(updatedUser);
    setShowReuploadModal(false);
  };

  // Compact badge mode for tight header spaces
  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          id="identity-verification-compact-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold transition border cursor-pointer ${
            status === 'approved'
              ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60'
              : status === 'rejected'
              ? 'bg-rose-950/60 border-rose-600/40 text-rose-300 hover:bg-rose-900/60'
              : 'bg-amber-950/60 border-amber-600/40 text-amber-300 hover:bg-amber-900/60'
          }`}
          title="Click to view Identity Verification Status"
        >
          {status === 'approved' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : status === 'rejected' ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="truncate max-w-[130px]">
            {status === 'approved' ? 'KYC Verified' : status === 'rejected' ? 'KYC Rejected' : `KYC: ${progress}%`}
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-4 z-50 text-left text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                  Passport Verification HUD
                </h4>
              </div>
              {getStatusBadge()}
            </div>

            {/* Document details preview */}
            <div className="mt-3 bg-neutral-950/80 rounded-xl p-3 border border-neutral-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Document Type:</span>
                <span className="font-semibold text-white">Official International Passport</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Passport Number:</span>
                <span className="font-mono text-amber-300">
                  {user.passportDocument?.passportNumber || 'P48291032'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Issuing Authority:</span>
                <span className="text-neutral-200">
                  {user.passportDocument?.issuingCountry || 'Republic of Haiti'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Attached File:</span>
                <span className="text-neutral-300 truncate max-w-[150px]">
                  {user.passportDocument?.fileName || 'verified_passport_scan.pdf'}
                </span>
              </div>
            </div>

            {/* Alert Status Banner */}
            <div className="mt-3">
              {status === 'approved' && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-300 font-bold">Identity Approved &amp; Protected</strong>
                    Full rider transit, merchant catalog, and Liberté Cash dividend equity access are unlocked.
                  </div>
                </div>
              )}

              {status === 'pending' && (
                <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-700 text-amber-200 text-xs flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300 font-bold">Verification in Progress</strong>
                    Automated security checksum check running. Dispatch and wallet are active under provisional limits.
                  </div>
                </div>
              )}

              {status === 'rejected' && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-300 font-bold">Document Rejected</strong>
                    {user.verificationNotes || 'Blurry scan or unreadable MRZ zone. Please submit a high-resolution photo.'}
                  </div>
                </div>
              )}
            </div>

            {/* Validation Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Verification Progress</span>
                <span className="font-bold text-amber-400">{progress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    status === 'approved'
                      ? 'bg-emerald-400'
                      : status === 'rejected'
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Simulation controls for demo testing */}
            <div className="mt-4 pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-2">
                <span>Compliance Testing Controls:</span>
                {isSimulating && <span className="text-amber-400 animate-pulse">Updating status...</span>}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulateStatusChange('pending')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                    status === 'pending'
                      ? 'bg-amber-400 text-neutral-950 border-amber-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  Set Pending
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateStatusChange('approved')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                    status === 'approved'
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  Set Approved
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateStatusChange('rejected')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                    status === 'rejected'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  Set Rejected
                </button>
              </div>

              {status === 'rejected' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setShowReuploadModal(true);
                  }}
                  className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Re-upload Valid Passport Scan</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reupload Modal */}
        {showReuploadModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">Re-upload Passport</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReuploadModal(false)}
                  className="text-neutral-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReuploadSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Select Clear Color Photo or PDF Scan
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setReuploadFile(e.target.files[0]);
                    }}
                    className="w-full text-xs text-neutral-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 cursor-pointer"
                  />
                  {reuploadFile && (
                    <p className="text-[11px] text-emerald-400 mt-1">
                      Ready: {reuploadFile.name} ({(reuploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    required
                    value={reuploadNumber}
                    onChange={(e) => setReuploadNumber(e.target.value)}
                    placeholder="e.g. P1092834"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Issuing Country
                  </label>
                  <select
                    value={reuploadCountry}
                    onChange={(e) => setReuploadCountry(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Haiti (HT)">🇭🇹 Haiti (Republic of Haiti)</option>
                    <option value="French Guiana (GF/FR)">🇬🇫 French Guiana (France / EU)</option>
                    <option value="Guyana (GY)">🇬🇾 Guyana</option>
                    <option value="Suriname (SR)">🇸🇷 Suriname</option>
                    <option value="United States (US)">🇺🇸 United States</option>
                    <option value="Canada (CA)">🇨🇦 Canada</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReuploadModal(false)}
                    className="flex-1 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 text-xs font-bold hover:from-amber-300 hover:to-amber-400 transition shadow"
                  >
                    Submit for Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full-width Profile Header Widget layout
  return (
    <div
      id="identity-verification-status-widget"
      className={`rounded-2xl border transition-all p-4 shadow-lg ${
        status === 'approved'
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950/20 border-emerald-500/30'
          : status === 'rejected'
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20'
          : 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/20 border-amber-500/30'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 ${
              status === 'approved'
                ? 'bg-emerald-400 text-neutral-950'
                : status === 'rejected'
                ? 'bg-rose-500 text-white'
                : 'bg-amber-400 text-neutral-950'
            }`}
          >
            {status === 'approved' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : status === 'rejected' ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                Identity Verification Status
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-neutral-400">
              Mandatory Passport Compliance &amp; Liberté Cash Escrow Security
            </p>
          </div>
        </div>

        {/* Action button to expand or reupload */}
        <div className="flex items-center gap-2">
          {status === 'rejected' && (
            <button
              type="button"
              id="reupload-passport-btn"
              onClick={() => setShowReuploadModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow animate-bounce"
              style={{ animationDuration: '3s' }}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Re-upload Passport</span>
            </button>
          )}

          <button
            type="button"
            id="toggle-verification-details-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700 cursor-pointer transition"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Audit Details'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-300 font-semibold">Document Validation Progress</span>
            <span className="text-neutral-500 text-[11px]">• Step 3 of 4: Sanctions &amp; Biometric Match</span>
          </div>
          <span
            className={`font-black text-xs ${
              status === 'approved'
                ? 'text-emerald-400'
                : status === 'rejected'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
          >
            {progress}% Completed
          </span>
        </div>
        <div className="w-full bg-neutral-950 rounded-full h-2.5 p-0.5 border border-neutral-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              status === 'approved'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/50'
                : status === 'rejected'
                ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                : 'bg-gradient-to-r from-amber-400 to-amber-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Alert Notification Message */}
      <div className="mt-3">
        {status === 'approved' && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-300 block">
                Verification Complete &amp; Fully Verified
              </span>
              <p className="text-neutral-300">
                Your international passport has been approved. You have full access to cross-border Caribbean bookings, direct merchant store payouts, and all Liberté Cash financial equity dividends.
              </p>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300 block">
                Verification Pending Dispatch Review ({progress}%)
              </span>
              <p className="text-neutral-300">
                Your passport scan has been successfully submitted and is under active validation by the compliance desk. Average review turnaround is under 2 hours. Your role is enabled with standard ride and order privileges.
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-rose-300 block">
                Action Required: Passport Verification Unsuccessful
              </span>
              <p className="text-rose-100">
                {user.verificationNotes ||
                  'The uploaded passport image was unreadable or failed MRZ checksum inspection. Please upload a clear, high-resolution scan of your valid government passport.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Audit Log & Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-4 text-xs">
          {/* Passport Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-xl">
              <span className="text-neutral-400 text-[11px] block">Passport Document</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-white truncate">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{user.passportDocument?.fileName || 'official_passport.pdf'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Size: {user.passportDocument?.fileSize || '1.8 MB'}
              </span>
            </div>

            <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-xl">
              <span className="text-neutral-400 text-[11px] block">Passport No. &amp; Country</span>
              <div className="font-mono font-bold text-amber-300 mt-1">
                {user.passportDocument?.passportNumber || 'P48291032'}
              </div>
              <span className="text-[10px] text-neutral-300 mt-0.5 block truncate">
                {user.passportDocument?.issuingCountry || 'Republic of Haiti'}
              </span>
            </div>

            <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-xl">
              <span className="text-neutral-400 text-[11px] block">KYC Compliance Level</span>
              <div className="font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tier 2 (International)</span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                CARICOM / Cross-Border Ready
              </span>
            </div>
          </div>

          {/* Verification Step Checklist */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3 space-y-2">
            <span className="font-bold text-neutral-300 text-[11px] uppercase tracking-wider block">
              Automated Document Validation Steps:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1. High-Resolution Scan Ingestion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>2. Machine Readable Zone (MRZ) Checksum</span>
              </div>
              <div className="flex items-center gap-2">
                {status === 'approved' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : status === 'rejected' ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span>3. Global Watchlist &amp; Fraud Sanctions Check</span>
              </div>
              <div className="flex items-center gap-2">
                {status === 'approved' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                )}
                <span>4. Compliance Officer Certification</span>
              </div>
            </div>
          </div>

          {/* Testing simulation toggles for reviewer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <Info className="w-3.5 h-3.5 text-neutral-500" />
              <span>Simulate Validation Pipeline:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateStatusChange('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  status === 'pending'
                    ? 'bg-amber-400 text-neutral-950 border-amber-300 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => handleSimulateStatusChange('approved')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  status === 'approved'
                    ? 'bg-emerald-500 text-white border-emerald-400 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                Approved
              </button>
              <button
                type="button"
                onClick={() => handleSimulateStatusChange('rejected')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  status === 'rejected'
                    ? 'bg-rose-600 text-white border-rose-500 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reupload Modal for Full Widget */}
      {showReuploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Re-upload Valid Passport</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReuploadModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReuploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Upload Clean Passport Photo or Document
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setReuploadFile(e.target.files[0]);
                  }}
                  className="w-full text-xs text-neutral-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 cursor-pointer"
                />
                {reuploadFile && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    Selected: {reuploadFile.name} ({(reuploadFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Passport Number
                </label>
                <input
                  type="text"
                  required
                  value={reuploadNumber}
                  onChange={(e) => setReuploadNumber(e.target.value)}
                  placeholder="e.g. P1092834"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Issuing Country
                </label>
                <select
                  value={reuploadCountry}
                  onChange={(e) => setReuploadCountry(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Haiti (HT)">🇭🇹 Haiti (Republic of Haiti)</option>
                  <option value="French Guiana (GF/FR)">🇬🇫 French Guiana (France / EU)</option>
                  <option value="Guyana (GY)">🇬🇾 Guyana</option>
                  <option value="Suriname (SR)">🇸🇷 Suriname</option>
                  <option value="United States (US)">🇺🇸 United States</option>
                  <option value="Canada (CA)">🇨🇦 Canada</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReuploadModal(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 text-xs font-bold hover:from-amber-300 hover:to-amber-400 transition shadow"
                >
                  Submit for Compliance Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

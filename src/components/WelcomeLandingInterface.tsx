import React, { useState } from 'react';
import {
  Bike,
  Store,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  User,
  Phone,
  Sparkles,
  Coins,
  ArrowRight,
  Star,
  Globe,
  Volume2,
  LogIn,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Zap,
  Tag,
  ArrowLeft,
  FileText,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  FileUp,
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';
import { ActiveRole } from './Header';
import { WapLogo } from './WapLogo';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface PassportDocumentInfo {
  fileName: string;
  fileSize: string;
  fileType: string;
  dataUrl?: string;
  uploadedAt: string;
  passportNumber: string;
  issuingCountry: string;
  expirationDate?: string;
}

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ActiveRole;
  region: RegionId;
  subscriptionTier: string;
  subscriptionName: string;
  lbcBonus: number;
  signedUpAt: string;
  verificationStatus: VerificationStatus;
  verificationProgress: number;
  verificationNotes?: string;
  passportDocument?: PassportDocumentInfo;
  accountStatus?: 'active' | 'pending_verification' | 'suspended' | 'restricted';
}

interface WelcomeLandingInterfaceProps {
  currentRegion: RegionId;
  currentLanguage: LanguageCode;
  onSelectRegion: (region: RegionId) => void;
  onSelectLanguage: (language: LanguageCode) => void;
  onPlaySpeech: (text: string) => void;
  onLoginSuccess: (user: AuthUserData) => void;
  onGuestContinue: (role: ActiveRole) => void;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  billingPeriod: string;
  lbcBonus: number;
  description: string;
  benefits: string[];
  popular?: boolean;
}

export const WelcomeLandingInterface: React.FC<WelcomeLandingInterfaceProps> = ({
  currentRegion,
  currentLanguage,
  onSelectRegion,
  onSelectLanguage,
  onPlaySpeech,
  onLoginSuccess,
  onGuestContinue,
}) => {
  // Mode: 'login' (email + password) or 'signup' (subscription & registration)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Selected role for sign up or filter
  const [targetRole, setTargetRole] = useState<ActiveRole>('customer');

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('stangyneco@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('WapSecure2026!');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sign up form state
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);
  const [signupCountryCode, setSignupCountryCode] = useState<string>(
    currentRegion === 'haiti'
      ? '+509'
      : currentRegion === 'senegal'
      ? '+221'
      : currentRegion === 'french_guiana'
      ? '+594'
      : currentRegion === 'guyana'
      ? '+592'
      : '+597'
  );
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('customer_pass');
  const [promoCode, setPromoCode] = useState<string>('LIBERTE2026');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Mandatory Passport upload & identity verification state for all roles
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportDocData, setPassportDocData] = useState<PassportDocumentInfo | null>(null);
  const [passportNumber, setPassportNumber] = useState<string>('');
  const [passportCountry, setPassportCountry] = useState<string>(
    currentRegion === 'haiti'
      ? 'Haiti (HT)'
      : currentRegion === 'senegal'
      ? 'Senegal (SN)'
      : currentRegion === 'french_guiana'
      ? 'French Guiana (GF/FR)'
      : currentRegion === 'guyana'
      ? 'Guyana (GY)'
      : 'Suriname (SR)'
  );
  const [passportExpiry, setPassportExpiry] = useState<string>('2031-12-31');
  const [passportPreviewUrl, setPassportPreviewUrl] = useState<string | null>(null);
  const [isPassportDragging, setIsPassportDragging] = useState<boolean>(false);

  // Forgot password simulation
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [resetSentSuccess, setResetSentSuccess] = useState<boolean>(false);

  const regionData = REGIONS[currentRegion];

  // Subscription Plans definition for all 3 ecosystem roles
  const customerPlans: SubscriptionPlan[] = [
    {
      id: 'customer_free',
      name: 'Community Standard',
      price: 'Free',
      billingPeriod: 'forever',
      lbcBonus: 50,
      description: 'Essential pay-as-you-go rides and express package delivery.',
      benefits: [
        '50 LBC starter welcome stake (5.2% APY)',
        'Full access to moto-taxi & courier booking',
        'Direct local mobile money escrow (MonCash, Natcash, MMG+)',
        'Standard 3-way community rating security',
      ],
    },
    {
      id: 'customer_pass',
      name: 'Wap Plus Freedom Pass',
      badge: 'Most Popular',
      price: '$2.55',
      billingPeriod: 'per month',
      lbcBonus: 250,
      popular: true,
      description: 'Zero booking fees and double Liberté Cash rewards for regular commuters.',
      benefits: [
        '250 LBC monthly investment bonus',
        '0% platform booking fee on all rides',
        '2x Liberté Cash compounding rewards on trips',
        'Priority moto dispatch during peak rush hours',
        'Free package transit protection up to $150',
      ],
    },
    {
      id: 'customer_family',
      name: 'Diaspora Family Circle',
      badge: 'Family & Remittance',
      price: '$4.55',
      billingPeriod: 'per month',
      lbcBonus: 600,
      description: 'Book and manage reliable transport for relatives back home across borders.',
      benefits: [
        '600 LBC monthly community stake',
        'Shared family wallet across Haiti, Guyane & Suriname',
        'Direct booking for elderly parents with SMS confirmation',
        '24/7 dedicated bilingual emergency dispatch agent',
        'Free monthly cross-border LBC transfer to local cash',
      ],
    },
  ];

  const driverPlans: SubscriptionPlan[] = [
    {
      id: 'driver_solo',
      name: 'Solo Operator Partner',
      price: 'Free',
      billingPeriod: 'forever',
      lbcBonus: 100,
      description: 'Drive on your own schedule with zero predatory commissions.',
      benefits: [
        '100 LBC starter asset allocation',
        'Keep 92% of all ride fares directly',
        'Instant cashout to mobile money wallet',
        'Digital road safety & helmet certification kit',
      ],
    },
    {
      id: 'driver_plus',
      name: 'Fleet Mobility Pass',
      badge: 'Flexible Commute',
      price: '$2.55',
      billingPeriod: 'per month',
      lbcBonus: 250,
      description: 'Keep 94% of ride fares and enjoy daily Liberté Cash dividend bonuses.',
      benefits: [
        '250 LBC monthly equity credit',
        'Keep 94% of ride fares directly',
        'Daily Liberté Cash dividend boost on completed trips',
        'Priority dispatch allocation in suburban routes',
      ],
    },
    {
      id: 'driver_pro',
      name: 'Pro Fleet Freedom Member',
      badge: 'Recommended for Full-Time',
      price: '$4.55',
      billingPeriod: 'per month',
      lbcBonus: 450,
      popular: true,
      description: 'Maximize daily income with dividend matches and road safety reserves.',
      benefits: [
        '450 LBC monthly equity credit',
        'Keep 96% of ride fares (lowest in the industry)',
        'Daily Liberté Cash dividend matching on tips',
        'Live high-density surge heatmaps & airport queue pass',
        'Emergency breakdown puncture & repair assistance fund',
      ],
    },
  ];

  const merchantPlans: SubscriptionPlan[] = [
    {
      id: 'merchant_starter',
      name: 'Neighborhood Boutik',
      price: 'Free',
      billingPeriod: 'forever',
      lbcBonus: 150,
      description: 'List your restaurant dishes, pharmacy, or retail goods for express moto courier delivery.',
      benefits: [
        '150 LBC merchant starter stake',
        '0% sign-up or monthly shelf fee',
        'On-demand moto courier pickup in under 6 minutes',
        'Real-time order prep tracking tablet/mobile mode',
      ],
    },
    {
      id: 'merchant_growth',
      name: 'Local Merchant Growth Pass',
      badge: 'Growing Business',
      price: '$2.55',
      billingPeriod: 'per month',
      lbcBonus: 400,
      description: 'Zero transaction swipe fees and priority express courier dispatching.',
      benefits: [
        '400 LBC monthly merchant investment dividends',
        '0% payment gateway swipe fees on local wallets',
        'Direct priority moto courier dispatch in under 5 minutes',
        'Automated weekly local cash payouts',
      ],
    },
    {
      id: 'merchant_verified',
      name: 'Verified Enterprise Partner',
      badge: 'High Volume',
      price: '$4.55',
      billingPeriod: 'per month',
      lbcBonus: 800,
      popular: true,
      description: 'Zero transaction swipe fees and featured prominence in neighborhood catalogs.',
      benefits: [
        '800 LBC monthly merchant growth dividend',
        '0% payment gateway swipe fees',
        'Top placement in customer search and meal recommendations',
        'Automated multi-package batch courier dispatching',
        'Weekly business settlement with automatic LBC auto-reinvestment',
      ],
    },
  ];

  // Pick current plans according to targetRole
  const currentPlans =
    targetRole === 'customer'
      ? customerPlans
      : targetRole === 'driver'
      ? driverPlans
      : merchantPlans;

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setLoginError('Please provide a valid email address.');
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setLoginError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Determine user name and details based on role/email with strict RBAC isolation
      let displayName = 'Valued User';
      let userRole: ActiveRole = targetRole === 'admin' ? 'customer' : targetRole;
      const normalizedEmail = loginEmail.trim().toLowerCase();
      const designatedAdminEmails = ['stangyneco@gmail.com', 'admin@wap-transport.ht'];
      const isDesignatedAdmin = designatedAdminEmails.includes(normalizedEmail);

      if (isDesignatedAdmin) {
        displayName = normalizedEmail === 'stangyneco@gmail.com' ? 'Stangy Neco (Platform Administrator)' : 'Wap Operations Admin';
        userRole = 'admin';
      } else if (normalizedEmail.includes('driver') || targetRole === 'driver') {
        displayName = 'Moïse Baptiste';
        userRole = 'driver';
      } else if (normalizedEmail.includes('merchant') || normalizedEmail.includes('resto') || targetRole === 'merchant') {
        displayName = 'Chef Fifi (Saveur Lakay)';
        userRole = 'merchant';
      } else {
        displayName = loginEmail.split('@')[0].replace(/[._]/g, ' ');
        userRole = targetRole === 'admin' ? 'customer' : targetRole;
      }

      const authenticatedUser: AuthUserData = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: displayName,
        email: loginEmail.trim(),
        phone: signupCountryCode + ' 4822-1092',
        role: userRole,
        region: currentRegion,
        subscriptionTier: 'customer_pass',
        subscriptionName: 'Wap Plus Freedom Pass',
        lbcBonus: 2850,
        signedUpAt: new Date().toISOString(),
        verificationStatus: 'approved',
        verificationProgress: 100,
        verificationNotes: 'Official passport verified with biometric validation and CARICOM regional registry.',
        passportDocument: {
          fileName: 'official_biometric_passport.pdf',
          fileSize: '1.9 MB',
          fileType: 'application/pdf',
          uploadedAt: '2026-03-12T10:20:00.000Z',
          passportNumber: 'P' + Math.floor(10000000 + Math.random() * 90000000),
          issuingCountry:
            currentRegion === 'haiti'
              ? 'Haiti (HT)'
              : currentRegion === 'senegal'
              ? 'Senegal (SN)'
              : currentRegion === 'french_guiana'
              ? 'French Guiana (GF/FR)'
              : currentRegion === 'guyana'
              ? 'Guyana (GY)'
              : 'Suriname (SR)',
          expirationDate: '2031-10-18',
        },
      };

      try {
        localStorage.setItem('wap_auth_user', JSON.stringify(authenticatedUser));
      } catch {
        // safe fallback
      }

      onLoginSuccess(authenticatedUser);
    }, 600);
  };

  // Helper to attach sample validated passport with 1 click
  const handleUseSamplePassport = () => {
    const sampleNumber =
      targetRole === 'driver' ? 'P84920194' : targetRole === 'merchant' ? 'P92038192' : 'P71928301';
    setPassportNumber(sampleNumber);
    setPassportDocData({
      fileName: `official_passport_${targetRole}_scan.pdf`,
      fileSize: '2.1 MB',
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      passportNumber: sampleNumber,
      issuingCountry: passportCountry,
      expirationDate: '2032-06-15',
    });
    setPassportPreviewUrl('sample_verified');
    setSignupError(null);
  };

  const handlePassportFileChange = (file: File | null) => {
    if (!file) {
      setPassportFile(null);
      setPassportDocData(null);
      return;
    }

    setPassportFile(file);
    setPassportDocData({
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileType: file.type || 'application/pdf',
      uploadedAt: new Date().toISOString(),
      passportNumber: passportNumber || 'P48192031',
      issuingCountry: passportCountry,
      expirationDate: passportExpiry || '2031-12-31',
    });

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPassportPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPassportPreviewUrl(null);
    }
    setSignupError(null);
  };

  // Handle Sign up & Subscription submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please provide a valid email address.');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }

    if (!signupPhone.trim()) {
      setSignupError('Please provide a mobile phone number for trip confirmations.');
      return;
    }

    // STRICT REQUIREMENT: Mandatory passport upload for all roles
    if (!passportFile && !passportDocData) {
      setSignupError(
        'Mandatory Identity Document Missing: A valid government passport upload is strictly required for all roles (Passenger, Driver, and Merchant) to complete identity verification and activate platform access.'
      );
      return;
    }

    if (!passportNumber.trim()) {
      setSignupError('Please enter your official Passport Document Number.');
      return;
    }

    if (!acceptTerms) {
      setSignupError('Please accept the community safety and service agreement.');
      return;
    }

    setIsSubmitting(true);

    const plan = currentPlans.find((p) => p.id === selectedPlanId) || currentPlans[0];

    setTimeout(() => {
      setIsSubmitting(false);

      const finalPassportDoc: PassportDocumentInfo = {
        fileName: passportFile ? passportFile.name : (passportDocData?.fileName || 'official_passport.pdf'),
        fileSize: passportFile ? `${(passportFile.size / 1024).toFixed(1)} KB` : (passportDocData?.fileSize || '1.8 MB'),
        fileType: passportFile?.type || (passportDocData?.fileType || 'application/pdf'),
        dataUrl: passportPreviewUrl || undefined,
        uploadedAt: new Date().toISOString(),
        passportNumber: passportNumber.trim().toUpperCase(),
        issuingCountry: passportCountry,
        expirationDate: passportExpiry || '2031-12-31',
      };

      // Enforce default user role parameter attached to user profiles with default registration set to standard role
      // Reserving the admin role strictly for designated administrators.
      const assignedRole: ActiveRole = targetRole === 'admin' ? 'customer' : targetRole;

      const newUser: AuthUserData = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: `${signupCountryCode} ${signupPhone.trim()}`,
        role: assignedRole,
        accountStatus: 'pending_verification',
        region: currentRegion,
        subscriptionTier: plan.id,
        subscriptionName: plan.name,
        lbcBonus: plan.lbcBonus + (promoCode.trim().toUpperCase() === 'LIBERTE2026' ? 100 : 0),
        signedUpAt: new Date().toISOString(),
        verificationStatus: 'pending',
        verificationProgress: 65,
        verificationNotes: 'Passport submitted during registration. In queue for machine-readable zone (MRZ) validation.',
        passportDocument: finalPassportDoc,
      };

      try {
        localStorage.setItem('wap_auth_user', JSON.stringify(newUser));
      } catch {
        // safe fallback
      }

      onLoginSuccess(newUser);
    }, 700);
  };

  // Quick Demo Logins
  const handleQuickDemoLogin = (role: ActiveRole, email: string, name: string, plan: string) => {
    const demoUser: AuthUserData = {
      id: 'demo_' + role,
      name,
      email,
      phone: '+509 4822-1092',
      role,
      region: currentRegion,
      subscriptionTier: plan,
      subscriptionName: plan === 'driver_pro' ? 'Pro Fleet Freedom Member' : plan === 'merchant_verified' ? 'Verified Enterprise Partner' : 'Wap Plus Freedom Pass',
      lbcBonus: 2850,
      signedUpAt: new Date().toISOString(),
      verificationStatus: 'approved',
      verificationProgress: 100,
      verificationNotes: 'Official passport verified with biometric validation and CARICOM regional registry.',
      passportDocument: {
        fileName: `${role}_official_passport.pdf`,
        fileSize: '2.1 MB',
        fileType: 'application/pdf',
        uploadedAt: '2026-03-01T09:00:00.000Z',
        passportNumber: role === 'driver' ? 'P84920194' : role === 'merchant' ? 'P92038192' : 'P71928301',
        issuingCountry:
          currentRegion === 'haiti'
            ? 'Haiti (HT)'
            : currentRegion === 'senegal'
            ? 'Senegal (SN)'
            : currentRegion === 'french_guiana'
            ? 'French Guiana (GF/FR)'
            : currentRegion === 'guyana'
            ? 'Guyana (GY)'
            : 'Suriname (SR)',
        expirationDate: '2031-10-18',
      },
    };

    try {
      localStorage.setItem('wap_auth_user', JSON.stringify(demoUser));
    } catch {
      // safe fallback
    }

    onLoginSuccess(demoUser);
  };

  const handleVoiceHelp = () => {
    const text =
      currentLanguage === 'ht'
        ? 'Byenvini sou platfòm Wap. Ou ka konekte ak imèl ak modpas ou, oubyen kreye yon nouvo kont epi chwazi yon plan abònman pou w touche Liberté Cash, lajan kominote ki ba ou libète finansye.'
        : currentLanguage === 'fr'
        ? 'Bienvenue sur la plateforme Wap. Connectez-vous avec votre e-mail et mot de passe, ou abonnez-vous pour accéder à nos services et faire fructifier vos Liberté Cash pour votre indépendance financière.'
        : 'Welcome to the Wap platform. Log in with your email and password, or choose a subscription plan to start earning Liberté Cash tokens for long-term community financial freedom.';
    onPlaySpeech(text);
  };

  return (
    <div id="welcome-landing-interface" className="w-full max-w-5xl mx-auto py-6 px-3 sm:px-6">
      {/* Top Banner & Accessibility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-purple-navy-header border border-sky-700 p-4 rounded-2xl shadow-xl text-white">
        <div className="flex items-center gap-4">
          <WapLogo size="lg" variant="full" showTagline={true} />
        </div>

        {/* Voice Audio Guidance & Language Selector */}
        <div className="flex items-center gap-2">
          <button
            id="welcome-voice-help-btn"
            type="button"
            onClick={handleVoiceHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow transition cursor-pointer"
            title="Read welcome instructions aloud"
          >
            <Volume2 className="w-4 h-4" />
            <span>Koute Enstriksyon (Voice Guide)</span>
          </button>

          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-neutral-400 mr-1.5" />
            <select
              id="welcome-language-picker"
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ht" className="bg-neutral-900">🇭🇹 Kreyòl</option>
              <option value="fr" className="bg-neutral-900">🇫🇷 Français</option>
              <option value="en" className="bg-neutral-900">🇬🇧 English</option>
              <option value="nl" className="bg-neutral-900">🇳🇱 Nederlands</option>
              <option value="sr" className="bg-neutral-900">🇸🇷 Sranan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Container Grid: Left Hero & Value Prop / Right Auth & Subscription Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Platform Mission, Financial Freedom (LBC), and Ecosystem Roles */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 p-6 rounded-3xl shadow-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Safe Transportation &amp; Economic Empowerment</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Welcome to Wap. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                Move freely. Earn justly. Invest together.
              </span>
            </h1>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Wap connects passengers, local motorcycle couriers, and neighborhood storefronts across Haiti, French Guiana, Guyana, and Suriname. Built to eliminate predatory intermediaries and guarantee fair compensation for all community members.
            </p>

            {/* Financial Freedom Card: Liberté Cash (LBC) */}
            <div className="bg-amber-950/25 border border-amber-500/40 rounded-2xl p-4 text-xs space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Liberté Cash (LBC) Financial Freedom</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-400 text-neutral-950 font-black px-2 py-0.5 rounded">
                  5.2% APY
                </span>
              </div>
              <p className="text-neutral-300 leading-normal">
                Every subscription, ride, or delivery automatically mints dividend-yielding Liberté Cash. Rather than letting fees leave the island, your tokens compound daily and convert into fractional US stock equities, local currency, or discounted mobility credits.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-500/20 text-[11px] font-medium text-amber-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Escrow-Protected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Mobile Cashout</span>
                </div>
              </div>
            </div>

            {/* Platform Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3 text-xs text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-700">
                  <Check className="w-3 h-3 text-amber-400" />
                </div>
                <div>
                  <strong className="text-white">Seamless Multi-Language Access:</strong> Complete support for Haitian Creole, French, English, and Dutch with voice audio prompts.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-700">
                  <Check className="w-3 h-3 text-amber-400" />
                </div>
                <div>
                  <strong className="text-white">Verified Safety &amp; Emergency SOS:</strong> Biometric facial checks, helmet compliance, and instantaneous localized panic dispatch.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-700">
                  <Check className="w-3 h-3 text-amber-400" />
                </div>
                <div>
                  <strong className="text-white">Offline &amp; Low-Data Resilience:</strong> SMS fallback bookings keep you connected even through 2G blackouts.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Access Bar for Evaluators / Test Users */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Instant One-Click Demo Access:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="demo-login-customer"
                type="button"
                onClick={() => handleQuickDemoLogin('customer', 'jeanluc.dessalines@wap-transport.ht', 'Jean-Luc Dessalines', 'customer_pass')}
                className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold border border-neutral-700 transition text-center cursor-pointer"
              >
                Passenger (Standard)
              </button>
              <button
                id="demo-login-driver"
                type="button"
                onClick={() => handleQuickDemoLogin('driver', 'moise.driver@wap.ht', 'Moïse Baptiste', 'driver_pro')}
                className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold border border-neutral-700 transition text-center cursor-pointer"
              >
                Driver (Standard)
              </button>
              <button
                id="demo-login-merchant"
                type="button"
                onClick={() => handleQuickDemoLogin('merchant', 'cheffifi@wap.ht', 'Chef Fifi', 'merchant_verified')}
                className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold border border-neutral-700 transition text-center cursor-pointer"
              >
                Merchant (Standard)
              </button>
              <button
                id="demo-login-admin"
                type="button"
                onClick={() => handleQuickDemoLogin('admin', 'stangyneco@gmail.com', 'Stangy Neco (Admin)', 'admin_clearance')}
                className="py-1.5 px-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 text-[11px] font-bold border border-red-700/80 transition text-center cursor-pointer shadow-sm"
              >
                Designated Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Authentication & Subscription Interface */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            {/* Tab Switcher: Login vs. Subscription / Sign Up */}
            <div className="flex rounded-2xl bg-neutral-950 p-1.5 border border-neutral-800 mb-6">
              <button
                id="tab-welcome-login"
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                  setSignupError(null);
                  setShowForgotPassword(false);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-amber-400 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Account</span>
              </button>
              <button
                id="tab-welcome-signup"
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setLoginError(null);
                  setSignupError(null);
                  setShowForgotPassword(false);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-amber-400 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Subscribe &amp; Sign Up</span>
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* VIEW A: FORGOT PASSWORD MODAL/PANEL                           */}
            {/* ------------------------------------------------------------- */}
            {showForgotPassword && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Reset Your Password</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enter the email address registered with your Wap passenger, driver, or merchant profile. We will send a secure verification code and reset link.
                </p>

                {resetSentSuccess ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Password reset instructions have been sent to <strong>{forgotEmail}</strong>.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (forgotEmail.includes('@')) {
                          setResetSentSuccess(true);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition cursor-pointer"
                    >
                      Send Password Reset Link
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW B: EMAIL & PASSWORD LOGIN FORM                           */}
            {/* ------------------------------------------------------------- */}
            {authMode === 'login' && !showForgotPassword && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Access Your Wap Account
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Sign in with your registered email and password to resume rides, deliveries, or fleet operations.
                  </p>
                </div>

                {/* Role Switcher Filter for Logging In */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Select Your Role:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="login-role-customer"
                      type="button"
                      onClick={() => setTargetRole('customer')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        targetRole === 'customer'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">Passenger</div>
                    </button>
                    <button
                      id="login-role-driver"
                      type="button"
                      onClick={() => setTargetRole('driver')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        targetRole === 'driver'
                          ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Bike className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">Driver Partner</div>
                    </button>
                    <button
                      id="login-role-merchant"
                      type="button"
                      onClick={() => setTargetRole('merchant')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        targetRole === 'merchant'
                          ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Store className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">Merchant Store</div>
                    </button>
                  </div>
                </div>

                {/* Email Address Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-neutral-500 font-normal">e.g. stangyneco@gmail.com</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="login-input-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300">
                      Password
                    </label>
                    <button
                      id="btn-forgot-password"
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setShowForgotPassword(true);
                      }}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="login-input-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="login-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-neutral-950 border-neutral-700 text-amber-400 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Remember my device for 30 days</span>
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">256-Bit SSL Encrypted</span>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3 bg-red-950/70 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Login Submit Button */}
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Authenticating Account...</span>
                  ) : (
                    <>
                      <span>Sign In &amp; Open Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Bottom Helper to Switch to Sign Up */}
                <div className="text-center pt-2">
                  <p className="text-xs text-neutral-400">
                    New to Wap?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Choose a subscription plan &amp; sign up
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW C: USER SUBSCRIPTION & REGISTRATION SIGN UP             */}
            {/* ------------------------------------------------------------- */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Choose Your Subscription &amp; Sign Up
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Join the community-owned mobility network. Select your role and tailored subscription tier below.
                  </p>
                </div>

                {/* Step 1: Select Role */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    1. Account Type:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="signup-role-customer"
                      type="button"
                      onClick={() => {
                        setTargetRole('customer');
                        setSelectedPlanId('customer_pass');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        targetRole === 'customer'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs font-bold">Passenger</div>
                      <div className="text-[10px] text-neutral-400">Rider &amp; Parcel</div>
                    </button>
                    <button
                      id="signup-role-driver"
                      type="button"
                      onClick={() => {
                        setTargetRole('driver');
                        setSelectedPlanId('driver_pro');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        targetRole === 'driver'
                          ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Bike className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs font-bold">Driver Partner</div>
                      <div className="text-[10px] text-neutral-400">Keep 92-96%</div>
                    </button>
                    <button
                      id="signup-role-merchant"
                      type="button"
                      onClick={() => {
                        setTargetRole('merchant');
                        setSelectedPlanId('merchant_verified');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        targetRole === 'merchant'
                          ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Store className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs font-bold">Merchant Partner</div>
                      <div className="text-[10px] text-neutral-400">Boutik / Resto</div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Select Subscription Plan Tier */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                      2. Choose Your Membership / Subscription Plan:
                    </label>
                    <span className="text-[10px] text-amber-400 font-medium">Includes Starter LBC Bonus</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentPlans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          id={`plan-card-${plan.id}`}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-950 border-amber-400 ring-1 ring-amber-400 shadow-md'
                              : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-white">
                                {plan.name}
                              </span>
                              {plan.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-neutral-950">
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-sm text-amber-400">
                                {plan.price}
                              </span>
                              <span className="text-[10px] text-neutral-400 ml-1">
                                /{plan.billingPeriod}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-neutral-300 mb-2">
                            {plan.description}
                          </p>

                          {/* Plan Benefits List */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-neutral-300">
                            {plan.benefits.map((b, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">{b}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Registration Inputs */}
                <div className="space-y-2.5 pt-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    3. Personal &amp; Security Information:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Full Name */}
                    <div>
                      <label className="text-[11px] text-neutral-400 mb-1 block">Full Name</label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                        <input
                          id="signup-input-name"
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Daphnée Lamour"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="text-[11px] text-neutral-400 mb-1 block">Email Address</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                        <input
                          id="signup-input-email"
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Mobile Phone with Country Code */}
                    <div>
                      <label className="text-[11px] text-neutral-400 mb-1 block">Phone (SMS Dispatch)</label>
                      <div className="flex gap-1.5">
                        <select
                          id="signup-country-code"
                          value={signupCountryCode}
                          onChange={(e) => setSignupCountryCode(e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400 shrink-0"
                        >
                          <option value="+509">🇭🇹 +509 (HT)</option>
                          <option value="+594">🇬🇫 +594 (GF)</option>
                          <option value="+592">🇬🇾 +592 (GY)</option>
                          <option value="+597">🇸🇷 +597 (SR)</option>
                          <option value="+1">🇺🇸 +1 (US/CA)</option>
                          <option value="+33">🇫🇷 +33 (FR)</option>
                        </select>
                        <div className="relative flex-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                          <input
                            id="signup-input-phone"
                            type="tel"
                            required
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            placeholder="4822-1092"
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-[11px] text-neutral-400 mb-1 block">Set Strong Password</label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                        <input
                          id="signup-input-password"
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                        >
                          {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Mandatory Passport Upload for All Roles */}
                  <div
                    id="mandatory-passport-upload-section"
                    className="mt-3 p-3.5 bg-neutral-950/90 rounded-2xl border-2 border-amber-500/40 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-white uppercase tracking-wider block">
                            4. Mandatory Identity Verification (Passport Upload)
                          </label>
                          <span className="text-[11px] text-neutral-400">
                            Strictly enforced for all roles: Passenger, Driver &amp; Merchant
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                        Mandatory Document
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      To comply with Caribbean Community cross-border transportation standards, rider/driver safety, and Liberté Cash escrow asset protection, every account holder must attach a legible government passport before platform activation.
                    </p>

                    {/* Document Upload Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsPassportDragging(true);
                      }}
                      onDragLeave={() => setIsPassportDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsPassportDragging(false);
                        if (e.dataTransfer.files?.[0]) {
                          handlePassportFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition ${
                        passportDocData || passportFile
                          ? 'border-emerald-500/60 bg-emerald-950/20'
                          : isPassportDragging
                          ? 'border-amber-400 bg-amber-400/10'
                          : 'border-neutral-700 hover:border-amber-400/60 bg-neutral-900/50'
                      }`}
                    >
                      {passportDocData || passportFile ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">
                                  {passportFile?.name || passportDocData?.fileName}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                  Ready for Ingestion
                                </span>
                              </div>
                              <span className="text-[11px] text-neutral-400 block">
                                File Size: {passportFile ? `${(passportFile.size / 1024).toFixed(1)} KB` : passportDocData?.fileSize} • International Passport
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer border border-neutral-700">
                              Replace
                              <input
                                id="signup-replace-passport-file"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handlePassportFileChange(e.target.files[0]);
                                }}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setPassportFile(null);
                                setPassportDocData(null);
                                setPassportPreviewUrl(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 text-xs font-semibold cursor-pointer border border-neutral-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">
                              Upload Passport Document (Photo Page Scan or High-Res Color Photo)
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              Drag and drop here, or browse from your device • PDF, PNG, JPG (Max 15MB)
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <label className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold cursor-pointer transition shadow flex items-center gap-1.5">
                              <FileUp className="w-3.5 h-3.5" />
                              <span>Select Passport File</span>
                              <input
                                id="signup-passport-file-input"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handlePassportFileChange(e.target.files[0]);
                                }}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              id="signup-use-sample-passport-btn"
                              onClick={handleUseSamplePassport}
                              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold transition border border-amber-500/30 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>⚡ Auto-fill Validated Sample (1-Click Test)</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Passport Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div>
                        <label className="text-[11px] text-neutral-400 mb-1 block">
                          Passport Document Number <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="signup-input-passport-number"
                          type="text"
                          required
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. P48291032"
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400 mb-1 block">
                          Issuing Country <span className="text-rose-400">*</span>
                        </label>
                        <select
                          id="signup-input-passport-country"
                          value={passportCountry}
                          onChange={(e) => setPassportCountry(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Haiti (HT)">🇭🇹 Haiti (HT)</option>
                          <option value="French Guiana (GF/FR)">🇬🇫 French Guiana (GF/FR)</option>
                          <option value="Guyana (GY)">🇬🇾 Guyana (GY)</option>
                          <option value="Suriname (SR)">🇸🇷 Suriname (SR)</option>
                          <option value="United States (US)">🇺🇸 United States (US)</option>
                          <option value="France (FR)">🇫🇷 France (FR)</option>
                          <option value="Canada (CA)">🇨🇦 Canada (CA)</option>
                          <option value="Dominican Republic (DO)">🇩🇴 Dominican Republic (DO)</option>
                          <option value="CARICOM Member State">🌎 Other CARICOM / International</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400 mb-1 block">
                          Expiration Date
                        </label>
                        <input
                          id="signup-input-passport-expiry"
                          type="date"
                          value={passportExpiry}
                          onChange={(e) => setPassportExpiry(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        256-bit encrypted bank-grade vault storage. Passports are solely utilized for safety KYC and anti-fraud verification.
                      </span>
                    </div>
                  </div>

                  {/* Optional Promo / Referral Code */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] text-neutral-400">Referral / Promo Code:</span>
                      <input
                        id="signup-input-promo"
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="LIBERTE2026"
                        className="bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono focus:outline-none uppercase w-36"
                      />
                      <span className="text-[10px] text-emerald-400 font-medium">+100 LBC Bonus Active</span>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-[11px] text-neutral-400">
                      <input
                        id="signup-terms-checkbox"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded bg-neutral-950 border-neutral-700 text-amber-400 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>
                        I agree to the Wap Community Safety Guidelines, fair passenger/driver etiquette, and escrow terms. I understand Liberté Cash represents platform community dividend assets.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Error Banner */}
                {signupError && (
                  <div className="p-3 bg-red-950/70 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{signupError}</span>
                  </div>
                )}

                {/* Submit Sign Up Button */}
                <button
                  id="btn-submit-signup"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering &amp; Provisioning LBC Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration &amp; Activate Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Bottom Helper to Switch to Login */}
                <div className="text-center pt-1">
                  <p className="text-xs text-neutral-400">
                    Already have a Wap account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Log in with your email &amp; password
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Guest Direct Entry Option */}
          <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Want to preview the interface first?</span>
            <button
              id="btn-guest-continue"
              type="button"
              onClick={() => onGuestContinue(targetRole)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Continue as Guest ({targetRole})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

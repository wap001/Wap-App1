import {
  CMSLocale,
  CMSTranslationKey,
  CommunityVouch,
  DynamicPricingFactors,
  ExpansionPaymentGateway,
  SupportChatMessage,
  OnboardingStep
} from '../types/architecture';

// =========================================================================
// 1. MULTILINGUAL CMS DATA & SCHEMAS
// =========================================================================

export const CMS_LOCALES: CMSLocale[] = [
  {
    code: 'ht',
    name: 'Haitian Creole',
    nativeName: 'Kreyòl Ayisyen',
    flag: '🇭🇹',
    isRTL: false,
    isDefault: true,
    completionPercentage: 98,
    fallbackLocale: 'fr',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    isRTL: false,
    isDefault: false,
    completionPercentage: 100,
    fallbackLocale: 'en',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (Guyana / Diaspora)',
    flag: '🇬🇧',
    isRTL: false,
    isDefault: false,
    completionPercentage: 100,
    fallbackLocale: 'fr',
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    isRTL: false,
    isDefault: false,
    completionPercentage: 94,
    fallbackLocale: 'en',
  },
  {
    code: 'sr',
    name: 'Sranan Tongo',
    nativeName: 'Sranantongo',
    flag: '🇸🇷',
    isRTL: false,
    isDefault: false,
    completionPercentage: 88,
    fallbackLocale: 'nl',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português (Oiapoque / Brazil)',
    flag: '🇧🇷',
    isRTL: false,
    isDefault: false,
    completionPercentage: 91,
    fallbackLocale: 'fr',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español (Dominican Border)',
    flag: '🇩🇴',
    isRTL: false,
    isDefault: false,
    completionPercentage: 95,
    fallbackLocale: 'en',
  },
];

export const SAMPLE_CMS_KEYS: CMSTranslationKey[] = [
  {
    id: 'k-01',
    keyName: 'ride.request.button',
    namespace: 'rides',
    description: 'Main CTA button to order a motorcycle ride',
    audioPromptRequired: true,
    translations: {
      ht: { text: 'Kòmande Moto Koulye a', status: 'approved', updatedBy: 'Marie D. (Lead Linguist)', audioUrl: '/audio/prompts/ht/order_moto.mp3' },
      fr: { text: 'Commander une Moto Immédiatement', status: 'approved', updatedBy: 'Jean-Luc P.', audioUrl: '/audio/prompts/fr/order_moto.mp3' },
      en: { text: 'Request Motorcycle Ride Now', status: 'approved', updatedBy: 'Sarah K.', audioUrl: '/audio/prompts/en/order_moto.mp3' },
      nl: { text: 'Vraag Nu Motortaxi Aan', status: 'approved', updatedBy: 'Dennis V.', audioUrl: '/audio/prompts/nl/order_moto.mp3' },
      sr: { text: 'Beri Wan Bromfiets Now-Now', status: 'approved', updatedBy: 'Kofi B.', audioUrl: '/audio/prompts/sr/order_moto.mp3' },
      pt: { text: 'Solicitar Mototáxi Agora', status: 'approved', updatedBy: 'Lucas M.' },
      es: { text: 'Pedir Mototaxi Ahora', status: 'approved', updatedBy: 'Carlos R.' },
    },
  },
  {
    id: 'k-02',
    keyName: 'safety.helmet.mandatory',
    namespace: 'safety',
    description: 'Prominent warning regarding the mandatory passenger safety helmet',
    audioPromptRequired: true,
    translations: {
      ht: { text: 'Kas Sekirite Obligatwa: Chofè a genyen yon dezyèm kas pwòp pou ou.', status: 'approved', updatedBy: 'Marie D.', audioUrl: '/audio/prompts/ht/helmet_safe.mp3' },
      fr: { text: 'Casque Obligatoire : Le motard dispose d’un deuxième casque propre pour vous.', status: 'approved', updatedBy: 'Jean-Luc P.', audioUrl: '/audio/prompts/fr/helmet_safe.mp3' },
      en: { text: 'Mandatory Safety Helmet: The driver carries a clean spare helmet for your protection.', status: 'approved', updatedBy: 'Sarah K.', audioUrl: '/audio/prompts/en/helmet_safe.mp3' },
      nl: { text: 'Veiligheidshelm Verplicht: De bestuurder heeft een schone reservehelm voor u.', status: 'approved', updatedBy: 'Dennis V.' },
      sr: { text: 'I musu poti a kraka: A shofru abi wan krin kraka gi yu.', status: 'approved', updatedBy: 'Kofi B.' },
      pt: { text: 'Capacete Obrigatório: O piloto possui um capacete extra higienizado para você.', status: 'approved', updatedBy: 'Lucas M.' },
      es: { text: 'Casco Obligatorio: El conductor lleva un segundo casco higienizado para usted.', status: 'approved', updatedBy: 'Carlos R.' },
    },
  },
  {
    id: 'k-03',
    keyName: 'address.landmark.helper',
    namespace: 'common',
    description: 'Helper prompt asking for local landmark cues when street numbers are missing',
    audioPromptRequired: true,
    translations: {
      ht: { text: 'Endike yon repè (egz: bò legliz la, devan famasi, kafou prensipal)', status: 'approved', updatedBy: 'Marie D.', audioUrl: '/audio/prompts/ht/landmark_prompt.mp3' },
      fr: { text: 'Indiquez un point de repère (ex: près de l’église, devant la pharmacie, carrefour)', status: 'approved', updatedBy: 'Jean-Luc P.' },
      en: { text: 'Specify a landmark (e.g. opposite church, near petrol pump, main junction)', status: 'approved', updatedBy: 'Sarah K.' },
      nl: { text: 'Geef een herkenningspunt op (bijv. tegenover de kerk, bij het pompstation)', status: 'approved', updatedBy: 'Dennis V.' },
      sr: { text: 'Sori wan landmark (fu eksempre: krosibei fu kerki noso benzine pomp)', status: 'in_review', updatedBy: 'Kofi B.' },
      pt: { text: 'Indique um ponto de referência (ex: perto da igreja, em frente à farmácia)', status: 'approved', updatedBy: 'Lucas M.' },
      es: { text: 'Indique una referencia (ej: frente a la iglesia, bomba de gasolina, esquina)', status: 'approved', updatedBy: 'Carlos R.' },
    },
  },
  {
    id: 'k-04',
    keyName: 'payment.cod.escrow_warning',
    namespace: 'payments',
    description: 'Driver cash-on-delivery limit warning',
    audioPromptRequired: true,
    translations: {
      ht: { text: 'Ou rive nan limit kach ou ka kenbe. Tanpri depoze lajan an sou MonCash/Natcash pou w ka resevwa nouvo kous.', status: 'approved', updatedBy: 'Marie D.' },
      fr: { text: 'Limite d’espèces atteinte. Veuillez verser les fonds via MonCash ou virement pour reprendre les courses.', status: 'approved', updatedBy: 'Jean-Luc P.' },
      en: { text: 'Cash collection threshold reached. Please remit funds via mobile wallet/agent to unlock dispatch.', status: 'approved', updatedBy: 'Sarah K.' },
      nl: { text: 'Limiet contant geld bereikt. Stort de fondsen om nieuwe ritten te ontgrendelen.', status: 'approved', updatedBy: 'Dennis V.' },
      sr: { text: 'Yu doro a moni skotu. Poti a moni baka fu kisi nyun ride.', status: 'approved', updatedBy: 'Kofi B.' },
      pt: { text: 'Limite de dinheiro em mãos atingido. Faça o acerto para liberar novas corridas.', status: 'approved', updatedBy: 'Lucas M.' },
      es: { text: 'Límite de efectivo alcanzado. Por favor liquide los fondos para recibir nuevos viajes.', status: 'approved', updatedBy: 'Carlos R.' },
    },
  },
];

export const CMS_DATABASE_SCHEMA_SQL = `
-- =========================================================================
-- MULTILINGUAL CMS SCHEMA (DYNAMIC CONTENT, AUDIO PROMPTS & GLOSSARIES)
-- =========================================================================

-- 1. Locales & Fallback Hierarchy Table
CREATE TABLE cms_locales (
    code VARCHAR(10) PRIMARY KEY,              -- 'ht', 'fr', 'en', 'nl', 'sr', 'pt', 'es'
    language_name VARCHAR(60) NOT NULL,
    native_name VARCHAR(60) NOT NULL,
    flag_emoji VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    fallback_code VARCHAR(10) REFERENCES cms_locales(code),
    is_active BOOLEAN DEFAULT true,
    audio_supported BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Translation Namespaces
CREATE TABLE cms_namespaces (
    id VARCHAR(50) PRIMARY KEY,                -- 'common', 'rides', 'payments', 'safety', 'onboarding', 'voice'
    description TEXT,
    cache_ttl_seconds INT DEFAULT 86400
);

-- 3. Translation Master Keys
CREATE TABLE cms_translation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id VARCHAR(50) NOT NULL REFERENCES cms_namespaces(id) ON DELETE CASCADE,
    key_name VARCHAR(150) NOT NULL,
    description TEXT,
    requires_audio_prompt BOOLEAN DEFAULT false, -- Flag for low-literacy voice synthesis/recording
    context_tags TEXT[],                         -- e.g. ARRAY['driver', 'urgent', 'cash']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_namespace_key UNIQUE (namespace_id, key_name)
);

-- 4. Localized Translations & Voice Prompt Storage
CREATE TABLE cms_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES cms_translation_keys(id) ON DELETE CASCADE,
    locale_code VARCHAR(10) NOT NULL REFERENCES cms_locales(code) ON DELETE CASCADE,
    translation_text TEXT NOT NULL,
    audio_prompt_url TEXT,                      -- Pre-recorded native voice MP3/Opus file
    audio_duration_ms INT,
    review_status VARCHAR(20) DEFAULT 'draft' CHECK (review_status IN ('draft', 'in_review', 'approved', 'deprecated')),
    reviewed_by UUID,
    version INT DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_key_locale UNIQUE (key_id, locale_code)
);

CREATE INDEX idx_cms_trans_lookup ON cms_translations(key_id, locale_code);
CREATE INDEX idx_cms_locale_status ON cms_translations(locale_code, review_status);

-- 5. Standard Transport & Local Landmark Glossary
CREATE TABLE cms_transport_glossary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_token VARCHAR(80) NOT NULL UNIQUE,     -- 'MOTO_TAXI', 'SPARE_HELMET', 'LANDMARK_CHURCH', 'ESCROW'
    definition TEXT,
    terms_by_locale JSONB NOT NULL              -- {"ht": "Kous Moto", "fr": "Moto-Taxi", "sr": "Bromfiets", "nl": "Motortaxi"}
);
`;

// =========================================================================
// 2. VERIFICATION & COMMUNITY VOUCHING SYSTEM
// =========================================================================

export const VERIFICATION_DATABASE_SCHEMA_SQL = `
-- =========================================================================
-- ROBUST PROFILE VERIFICATION & COMMUNITY VOUCHING SCHEMA
-- Combines Formal Identification with Immigrant/Diaspora Social Endorsements
-- =========================================================================

-- 1. Identity Verification Requests
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('customer', 'driver', 'vendor')),
    target_tier VARCHAR(30) NOT NULL CHECK (target_tier IN ('tier_1_basic', 'tier_2_verified', 'tier_3_trusted_fleet')),
    overall_status VARCHAR(20) DEFAULT 'pending' CHECK (overall_status IN ('pending', 'under_review', 'verified', 'rejected', 'appealed')),
    rejection_reasons TEXT[],
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

-- 2. Uploaded Identification Documents (Government / Humanitarian / Trade)
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'national_id_haiti_cin',
        'carte_de_sejour_france',
        'recepisse_demande_asile',
        'guyana_national_id',
        'suriname_eid',
        'passport_international',
        'driver_license_motorcycle',
        'vehicle_ownership_registration',
        'police_character_certificate',
        'vendor_trade_license'
    )),
    document_number VARCHAR(100) NOT NULL,
    country_of_issuance VARCHAR(50) NOT NULL,
    expiry_date DATE,
    front_image_url TEXT NOT NULL,
    back_image_url TEXT,
    selfie_with_id_url TEXT,
    ocr_extracted_metadata JSONB,
    automated_fraud_check_score NUMERIC(4, 2), -- 0.00 to 1.00 (Tampering / duplicate detection)
    is_document_valid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Community Vouching System (Rezo Temwayaj Kominotè)
-- Allows community elders, pastors, motorcycle syndicate leaders, and merchants to vouch for drivers
CREATE TABLE community_vouches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id),
    voucher_user_id UUID NOT NULL REFERENCES users(id),
    voucher_authority_type VARCHAR(40) NOT NULL CHECK (voucher_authority_type IN (
        'church_pastor_priest',
        'moto_syndicate_leader',
        'verified_merchant_vendor',
        'senior_tier3_driver',
        'neighborhood_elder'
    )),
    relationship_to_target VARCHAR(60) NOT NULL,
    years_known NUMERIC(3, 1) NOT NULL,
    vouch_statement TEXT NOT NULL,
    collateral_stake_amount NUMERIC(10, 2) DEFAULT 0.00, -- Optional financial stake in local currency
    stake_currency VARCHAR(5),
    signature_hash VARCHAR(128) NOT NULL,                 -- Cryptographic digital signature/PIN
    voucher_reputation_weight NUMERIC(4, 2) DEFAULT 1.00, -- Multiplier based on voucher's standing
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'revoked_due_to_incident', 'fraud_flagged')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Driver Safety Equipment Verification (Biometric & Physical)
CREATE TABLE driver_safety_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inspection_type VARCHAR(30) NOT NULL CHECK (inspection_type IN ('onboarding_initial', 'daily_pre_shift_selfie', 'random_audit')),
    driver_helmet_photo_url TEXT NOT NULL,
    passenger_spare_helmet_photo_url TEXT NOT NULL,
    motorcycle_front_plate_photo_url TEXT NOT NULL,
    engine_cc_photo_url TEXT,
    ai_helmet_detected BOOLEAN DEFAULT true,
    ai_confidence_score NUMERIC(4, 2) DEFAULT 0.95,
    passed_inspection BOOLEAN NOT NULL,
    inspected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Dynamic Trust Score Ledger
CREATE TABLE user_trust_scores (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    composite_trust_score INT DEFAULT 50 CHECK (composite_trust_score BETWEEN 0 AND 100),
    document_points INT DEFAULT 0,            -- Up to 40 points
    community_vouch_points INT DEFAULT 0,     -- Up to 30 points (10 pts per verified elder vouch)
    trip_completion_points INT DEFAULT 0,     -- Up to 30 points (5 stars, low cancellation)
    incident_penalties INT DEFAULT 0,         -- Negative points for safety/escrow disputes
    current_tier VARCHAR(30) DEFAULT 'tier_1_basic',
    last_recalculated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export const SAMPLE_COMMUNITY_VOUCHES: CommunityVouch[] = [
  {
    id: 'vouch-101',
    targetUserId: 'usr-driver-891',
    targetUserName: 'Jean-Baptiste Voltaire',
    targetUserRole: 'driver',
    voucherUserId: 'usr-elder-001',
    voucherName: 'Pastè Emmanuel Saint-Louis (Église Baptiste de Delmas)',
    voucherRole: 'pastor',
    relationship: 'church_member',
    reputationWeight: 9.8,
    stakeAmountEscrow: 2500,
    vouchStatement: 'Mwen konnen Jean-Baptiste depi 8 lane nan kominote a. Li se yon moun serye, travayan, li pa janm nan dezòd.',
    status: 'approved',
    createdAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'vouch-102',
    targetUserId: 'usr-driver-891',
    targetUserName: 'Jean-Baptiste Voltaire',
    targetUserRole: 'driver',
    voucherUserId: 'usr-elder-002',
    voucherName: 'Michelange Pierre (Prezidan Asosyasyon Moto-Taxis Kafou)',
    voucherRole: 'moto_syndicate_leader',
    relationship: 'syndicate_colleague',
    reputationWeight: 9.5,
    stakeAmountEscrow: 5000,
    vouchStatement: 'Jean-Baptiste ap kondui moto depi 5 an. Li respekte kòd wout la e li toujou pote 2 kas pou pasaje.',
    status: 'approved',
    createdAt: '2026-09-11T09:15:00Z',
  },
  {
    id: 'vouch-103',
    targetUserId: 'usr-driver-891',
    targetUserName: 'Jean-Baptiste Voltaire',
    targetUserRole: 'driver',
    voucherUserId: 'usr-vendor-003',
    voucherName: 'Daphnée Fleurival (Pwopryetè Boulanje Lakay)',
    voucherRole: 'merchant',
    relationship: 'regular_customer',
    reputationWeight: 8.9,
    stakeAmountEscrow: 1000,
    vouchStatement: 'Li konn fè livrezon pen ak patisri pou boutik nou an san pwoblèm, toujou sou lè e onèt ak kach la.',
    status: 'approved',
    createdAt: '2026-09-12T11:40:00Z',
  },
];

// =========================================================================
// 3. DYNAMIC PRICING ENGINE (REAL-TIME ALGORITHM & REGIONAL INDICES)
// =========================================================================

export const REGIONAL_PRICING_FACTORS: Record<string, DynamicPricingFactors> = {
  haiti: {
    regionId: 'haiti',
    currency: 'HTG',
    baseFare: 150.0,            // 150 HTG base pickup
    perKmRate: 60.0,            // 60 HTG per km
    perMinuteRate: 10.0,        // 10 HTG per minute
    currentSurgeMultiplier: 1.25, // Mid-day market congestion
    terrainDifficultyFactor: 1.30, // Unpaved mountain slope (e.g. Delmas 75 / Pétion-Ville hills)
    weatherRainFactor: 1.0,     // Clear sunny weather
    economicIndexFactor: 1.15,  // Currency inflation hedge multiplier
    minimumFare: 200.0,
    rainHazardDriverBonusPercentage: 100, // 100% of rain hazard fee goes to driver
  },
  french_guiana: {
    regionId: 'french_guiana',
    currency: 'EUR',
    baseFare: 4.50,             // 4.50 € base
    perKmRate: 1.80,            // 1.80 € per km
    perMinuteRate: 0.40,        // 0.40 € per min
    currentSurgeMultiplier: 1.10,
    terrainDifficultyFactor: 1.05,
    weatherRainFactor: 1.35,    // Tropical equatorial shower in Cayenne
    economicIndexFactor: 1.0,   // Stable Euro peg
    minimumFare: 7.00,
    rainHazardDriverBonusPercentage: 100,
  },
  guyana: {
    regionId: 'guyana',
    currency: 'GYD',
    baseFare: 600.0,            // 600 GYD base
    perKmRate: 220.0,           // 220 GYD per km
    perMinuteRate: 40.0,        // 40 GYD per min
    currentSurgeMultiplier: 1.30, // High evening traffic on East Bank Demerara
    terrainDifficultyFactor: 1.15,
    weatherRainFactor: 1.0,
    economicIndexFactor: 1.08,
    minimumFare: 800.0,
    rainHazardDriverBonusPercentage: 100,
  },
  suriname: {
    regionId: 'suriname',
    currency: 'SRD',
    baseFare: 45.0,             // 45 SRD base
    perKmRate: 18.0,            // 18 SRD per km
    perMinuteRate: 3.50,        // 3.50 SRD per min
    currentSurgeMultiplier: 1.15,
    terrainDifficultyFactor: 1.20,
    weatherRainFactor: 1.0,
    economicIndexFactor: 1.22,  // Local purchasing power & fuel fluctuation adjustment
    minimumFare: 60.0,
    rainHazardDriverBonusPercentage: 100,
  },
};

export const PRICING_FORMULA_DOCUMENTATION = `
=============================================================================
WAP REAL-TIME DYNAMIC PRICING FORMULATION & MATHEMATICAL SPECIFICATION
=============================================================================

1. MATHEMATICAL FORMULATION:
-----------------------------------------------------------------------------
Total Fare = MAX(
    MinimumFare,
    [ BaseFare + (DistanceKm * PerKmRate * TerrainFactor) + (EstimatedMinutes * PerMinuteRate) ]
    * SurgeMultiplier
    * WeatherRainFactor
    * EconomicIndexFactor
)

Where:
- BaseFare (B): Compensates initial dispatch, helmet sanitization, and arrival at pickup.
- DistanceKm (D): Computed via Google Routes API (TWO_WHEELER mode).
- TerrainFactor (gamma):
    * 1.00 = Paved flat asphalt (Cayenne Center, Port-au-Prince Boulevard).
    * 1.15 = Mixed cobblestone & pothole urban grid.
    * 1.35 = Unpaved dirt mountain hill / ravine shortcut (e.g. Kenscoff slope, hinterland trail).
- SurgeMultiplier (S): H3 Hexagonal spatial demand/supply ratio:
    S = 1.0 + MIN( 1.5, MAX( 0.0, (DemandRequests - AvailableDrivers) / AvailableDrivers * 0.5 ) )
- WeatherRainFactor (omega):
    * 1.00 = Dry.
    * 1.20 = Light drizzle.
    * 1.45 = Heavy tropical downpour (severe road hazard on two wheels).
    * CRITICAL POLICY: 100% of the Weather Hazard Surcharge is passed directly to the driver
      as hazard pay; Wap takes 0% platform commission on the rain surcharge.
- EconomicIndexFactor (phi):
    * Adjusts daily against the local informal exchange rate basket to guarantee driver purchasing
      power matches localized fuel price spikes without destabilizing riders.

2. TRANSPARENCY & CRYPTOGRAPHIC QUOTE TOKEN:
-----------------------------------------------------------------------------
When a rider requests an estimate, the server generates a signed HMAC-SHA256 token:
Quote Token = HMAC_SHA256(
    secret_key,
    order_id + customer_id + total_fare + timestamp + expires_at
)
- The fare is GUARANTEED for exactly 300 seconds (5 minutes) regardless of sudden surge shifts.
- If traffic delays occur due to road blockades or detours, the fare remains fixed unless
  the rider requests a route destination change in-flight.
`;

// =========================================================================
// 4. ONBOARDING PROCESSES FOR DRIVERS & VENDORS
// =========================================================================

export const DRIVER_ONBOARDING_STAGES: OnboardingStep[] = [
  {
    stepNumber: 1,
    title: 'Identity & Legal Documents (Formal or Community Vouch)',
    description: 'Submit government ID (CIN, Carte de Séjour, Demande d’Asile, Passport, Driving License) OR opt for 2 Community Elder Vouches.',
    requiredDocuments: ['National ID / Permit / Passport', 'Proof of Address or Landmark Statement'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'ai_ocr',
  },
  {
    stepNumber: 2,
    title: 'Motorcycle Inspection & Dual Helmet Verification',
    description: 'Upload live camera photos of the motorcycle plate, engine (125cc-250cc), driver helmet, and certified passenger spare helmet.',
    requiredDocuments: ['Motorcycle Registration Card', 'Photo of Bike with Front/Rear Plates', 'Dual Helmet Safety Photo'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'physical_inspection',
  },
  {
    stepNumber: 3,
    title: 'Community Standing & Syndicate Endorsements',
    description: 'Provide contact details for 2 community vouchers (pastor, senior driver, or local merchant) who will stake social reputation.',
    requiredDocuments: ['2 Digital Vouch Authorizations', 'Signed Code of Conduct'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'community_vouch',
  },
  {
    stepNumber: 4,
    title: 'Road Safety & Anti-Harassment Audio Micro-Quiz',
    description: '5-minute multilingual audio interactive quiz in Kreyòl/Français on passenger safety, speed limits, and polite customer etiquette.',
    requiredDocuments: ['100% Passing Score on 6 Audio Scenarios'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'micro_quiz',
  },
  {
    stepNumber: 5,
    title: 'Mobile Wallet Settlement & Cash Escrow Agreement',
    description: 'Link MonCash, Natcash, MMG+, or bank account for instant payouts, and set up floating cash escrow limit.',
    requiredDocuments: ['Mobile Wallet Phone Verification', 'Cash Escrow Acknowledgement'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'ai_ocr',
  },
  {
    stepNumber: 6,
    title: 'Official Legal Driver Partner Contract & Rights Accord',
    description: 'Bilateral cryptographic legal contract signing certifying authorized commercial transport rights, non-payment platform guarantees, and Liberté Cash equity ownership.',
    requiredDocuments: ['Digital Signature on Formal Driver Contract', 'Zero-Tolerance Safety Acknowledgement'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'ai_ocr',
  },
];

export const VENDOR_ONBOARDING_STAGES: OnboardingStep[] = [
  {
    stepNumber: 1,
    title: 'Business Registration & Landmark Geo-Tagging',
    description: 'Register restaurant, pharmacy, grocery kiosk, or auto parts store with verified PostGIS coordinates and landmark description.',
    requiredDocuments: ['Business Name & Category', 'GPS Pin + Landmark Address', 'Photo of Storefront'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'ai_ocr',
  },
  {
    stepNumber: 2,
    title: 'Food Hygiene / Commerce Verification',
    description: 'Upload Municipal trade license OR local market committee elder vouching for informal kiosks.',
    requiredDocuments: ['Health Certificate / Trade License OR Market Committee Vouch'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'community_vouch',
  },
  {
    stepNumber: 3,
    title: 'Menu / Product Catalog Digitization',
    description: 'Input items, localized creole descriptions, prices, preparation times, and auto-dispatch motorcycle courier preferences.',
    requiredDocuments: ['Item Price List', 'Product Photos', 'Preparation Lead Time'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'physical_inspection',
  },
  {
    stepNumber: 4,
    title: 'Merchant Payout & Settlement Setup',
    description: 'Configure automated daily payout to MonCash/Natcash merchant wallet or local commercial bank account.',
    requiredDocuments: ['Merchant Account Number', 'Authorized Representative ID'],
    isCompleted: true,
    status: 'approved',
    verificationMethod: 'ai_ocr',
  },
  {
    stepNumber: 5,
    title: 'Trial Courier Dispatch Order Test',
    description: 'Execute one automated $1 test courier order to confirm kitchen notification bell and driver arrival handshake.',
    requiredDocuments: ['Test Order QR Code Handshake Completed'],
    isCompleted: false,
    status: 'in_progress',
    verificationMethod: 'physical_inspection',
  },
];

// =========================================================================
// 5. EXPANSION PAYMENT GATEWAYS & MULTI-CHANNEL SUPPORT
// =========================================================================

export const EXPANSION_GATEWAYS: ExpansionPaymentGateway[] = [
  {
    country: 'brazil',
    countryName: 'Brazil (Connecting to French Guiana border at Oiapoque)',
    flag: '🇧🇷',
    currency: 'BRL (Real)',
    localGateways: [
      {
        name: 'PIX (Banco Central do Brasil)',
        type: 'instant_qr',
        description: 'Instant dynamic QR code and PIX Copia-e-Cola with sub-second webhook callback.',
        settlementTime: 'Instant (< 10 seconds)',
        integrationProtocol: 'BACEN PIX API v2 with mTLS certificates and instant push reconciliation.',
      },
      {
        name: 'Boleto Bancário / Boleto Rápido',
        type: 'cash_voucher',
        description: 'Barcode cash payment for unbanked riders payable at any lotérica or bank app.',
        settlementTime: 'D+1 Business Day',
        integrationProtocol: 'EBANX / Stark Bank Boleto API with automated barcode generation.',
      },
      {
        name: 'Cartão de Crédito / Débito (Elo / Hipercard / Visa)',
        type: 'card_processor',
        description: 'Local Brazilian credit cards with installment (parcelamento) support.',
        settlementTime: 'D+30 or Instant Advance (Antecipação)',
        integrationProtocol: 'Stripe Brasil / Cielo e-Commerce API with 3DS anti-fraud.',
      },
    ],
  },
  {
    country: 'mexico',
    countryName: 'Mexico (Target Expansion)',
    flag: '🇲🇽',
    currency: 'MXN (Mexican Peso)',
    localGateways: [
      {
        name: 'OXXO Pay',
        type: 'cash_voucher',
        description: '14-digit reference barcode allowing riders to pay cash at 20,000+ OXXO convenience stores.',
        settlementTime: 'Real-time webhook notification upon cash receipt at checkout counter.',
        integrationProtocol: 'Conekta / Stripe OXXO API with automatic 48-hour voucher expiration.',
      },
      {
        name: 'SPEI (Sistema de Pagos Electrónicos Interbancarios)',
        type: 'bank_transfer',
        description: 'Instant interbank transfer via CLABE number 24/7/365.',
        settlementTime: 'Instant (< 30 seconds)',
        integrationProtocol: 'STP (Sistema de Transferencias y Pagos) direct banking bridge.',
      },
      {
        name: 'Mercado Pago Wallet',
        type: 'instant_qr',
        description: 'Dominant regional wallet for digital payments and QR ride confirmation.',
        settlementTime: 'Instant wallet transfer',
        integrationProtocol: 'Mercado Pago Checkout Pro & QR Payments SDK.',
      },
    ],
  },
  {
    country: 'chile',
    countryName: 'Chile (Target Expansion)',
    flag: '🇨🇱',
    currency: 'CLP (Chilean Peso)',
    localGateways: [
      {
        name: 'Transbank Webpay Plus',
        type: 'card_processor',
        description: 'The national standard for Chilean debit (Redcompra) and credit cards.',
        settlementTime: 'D+1 to D+2 Business Days',
        integrationProtocol: 'Webpay Plus REST API v1.3 with return URL callbacks.',
      },
      {
        name: 'MACH (Banco Bci)',
        type: 'instant_qr',
        description: 'Leading digital prepaid account and app-to-app payment in Chile.',
        settlementTime: 'Instant wallet transfer',
        integrationProtocol: 'MACH Pay API deep-link integration.',
      },
      {
        name: 'Khipu',
        type: 'bank_transfer',
        description: 'Automated bank transfer solution without requiring credit cards.',
        settlementTime: 'Instant notification',
        integrationProtocol: 'Khipu REST API v2.',
      },
    ],
  },
  {
    country: 'colombia',
    countryName: 'Colombia (Target Expansion)',
    flag: '🇨🇴',
    currency: 'COP (Colombian Peso)',
    localGateways: [
      {
        name: 'PSE (Pagos Seguros en Línea)',
        type: 'bank_transfer',
        description: 'Debit directly from any Colombian checking or savings bank account.',
        settlementTime: 'Real-time (< 1 minute)',
        integrationProtocol: 'ACH Colombia PSE SOAP/REST Gateway.',
      },
      {
        name: 'Nequi (Bancolombia)',
        type: 'instant_qr',
        description: 'Dynamic QR code and push notification to Nequi app for instant ride authorization.',
        settlementTime: 'Instant',
        integrationProtocol: 'Bancolombia Open Banking Nequi API.',
      },
      {
        name: 'Daviplata (Banco Davivienda)',
        type: 'instant_qr',
        description: 'Mobile wallet widely used by informal motorcycle and courier drivers in Colombia.',
        settlementTime: 'Instant',
        integrationProtocol: 'Daviplata Merchant Push Service.',
      },
    ],
  },
  {
    country: 'usa',
    countryName: 'United States (Diaspora Remittance & Cross-Border Booking)',
    flag: '🇺🇸',
    currency: 'USD ($)',
    localGateways: [
      {
        name: 'Stripe (Visa, Mastercard, Amex, Apple Pay, Google Pay)',
        type: 'card_processor',
        description: 'Standard credit/debit card processing with Apple Pay and Google Pay one-touch tokenization.',
        settlementTime: 'D+2 Rolling settlement',
        integrationProtocol: 'Stripe Payment Intents with Radar fraud detection.',
      },
      {
        name: 'Diaspora Family Remittance Ride Model',
        type: 'diaspora_remittance',
        description: 'Allows Haitian, Guyanese, and Surinamese diaspora members in Miami, New York, Boston, and Toronto to pre-pay rides, medical deliveries, or grocery bundles for family back in Port-au-Prince, Georgetown, or Paramaribo.',
        settlementTime: 'Instant digital credit issued to recipient phone number in recipient country.',
        integrationProtocol: 'Wap Cross-Border Family Ledger API with real-time FX rate transparency and SMS recipient alert.',
      },
    ],
  },
];

export const SAMPLE_CHAT_MESSAGES: SupportChatMessage[] = [
  {
    id: 'msg-01',
    senderId: 'usr-customer-101',
    senderName: 'Daphnée (Customer)',
    senderRole: 'customer',
    originalLanguage: 'ht',
    originalText: 'Mwen bò katedral la, chofè a ka pran ti lari a pou evite blokis Kafou ayewopò an?',
    translatedText: 'Je suis près de la cathédrale, le motard peut-il prendre la ruelle pour éviter les bouchons du Carrefour de l’aéroport ?',
    targetLanguage: 'fr',
    timestamp: '10:24 AM',
    status: 'read',
  },
  {
    id: 'msg-02',
    senderId: 'usr-driver-891',
    senderName: 'Jean-Baptiste (Moto Driver)',
    senderRole: 'driver',
    originalLanguage: 'ht',
    originalText: 'Wi wi, mwen konn ti koridò a byen. M ap rive sou ou nan 3 minit. Mwen gen kas sekirite a nan men m.',
    translatedText: 'Oui oui, je connais bien ce raccourci. J’arrive vers vous dans 3 minutes. J’ai votre casque de sécurité avec moi.',
    targetLanguage: 'fr',
    audioUrl: '/audio/driver_voice_notes/vn_jb_02.mp3',
    audioDurationSeconds: 4,
    timestamp: '10:25 AM',
    status: 'delivered',
  },
  {
    id: 'msg-03',
    senderId: 'usr-agent-007',
    senderName: 'Wap Support Dispatch (Regional Hotline)',
    senderRole: 'support_agent',
    originalLanguage: 'fr',
    originalText: 'Bonjour Daphnée, votre course est sous surveillance satellite Wap. Jean-Baptiste est un chauffeur certifié Niveau 3.',
    translatedText: 'Bonjou Daphnée, kous ou a anba siveyans satelit Wap. Jean-Baptiste se yon chofè sètifye Nivo 3.',
    targetLanguage: 'ht',
    timestamp: '10:26 AM',
    status: 'read',
  },
];

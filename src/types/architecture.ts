export type RegionId = 'haiti' | 'french_guiana' | 'guyana' | 'suriname';

export type LanguageCode = 'ht' | 'fr' | 'en' | 'nl' | 'sr';

export interface RegionConfig {
  id: RegionId;
  name: string;
  country: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  primaryLanguages: LanguageCode[];
  paymentGateways: string[];
  sampleCity: string;
  centerCoordinates: { lat: number; lng: number };
  landmarkNamingStyle: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'driver' | 'vendor' | 'admin';
  region: RegionId;
  preferredLanguage: LanguageCode;
  walletBalance: number;
  currency: string;
  idVerificationStatus: 'pending' | 'verified' | 'unverified';
  idType: 'national_id' | 'passport' | 'refugee_resident_card' | 'community_attestation';
  createdAt: string;
}

export interface DriverProfile extends UserProfile {
  vehicleType: 'motorcycle';
  plateNumber: string;
  motorcycleModel: string;
  helmetVerified: boolean;
  rating: number;
  totalTrips: number;
  currentStatus: 'available' | 'busy' | 'offline';
  location: { lat: number; lng: number; heading: number; speedKmh: number };
  emergencyContact: string;
}

export interface VendorItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface VendorProfile {
  id: string;
  name: string;
  businessType: 'restaurant_kiosk' | 'pharmacy' | 'grocery_market' | 'hardware_parts' | 'remittance_agent';
  ownerName: string;
  phone: string;
  region: RegionId;
  addressLandmark: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  isVerified: boolean;
  menuItems: VendorItem[];
}

export type OrderType = 'ride' | 'package_delivery' | 'food_vendor';

export type OrderStatus =
  | 'draft'
  | 'matching_driver'
  | 'driver_accepted'
  | 'driver_at_pickup'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

export interface ActiveOrder {
  id: string;
  trackingCode: string;
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  driver?: DriverProfile;
  vendor?: VendorProfile;
  pickupAddress: string;
  pickupLandmark: string;
  pickupCoordinates: { lat: number; lng: number };
  dropoffAddress: string;
  dropoffLandmark: string;
  dropoffCoordinates: { lat: number; lng: number };
  status: OrderStatus;
  fareAmount: number;
  currency: string;
  paymentMethod: 'moncash' | 'natcash' | 'mmg' | 'uni5pay' | 'stripe_card' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'held_escrow' | 'paid';
  distanceKm: number;
  estimatedMinutes: number;
  createdAt: string;
  items?: { name: string; quantity: number; price: number }[];
  customerRating?: number;
  customerFeedback?: string;
}

export interface DriverRideHistoryItem {
  id: string;
  driverId: string;
  date: string;
  time: string;
  passengerName: string;
  pickupLandmark: string;
  dropoffLandmark: string;
  vehicleClass: '2_wheeler' | '3_wheeler' | '4_wheeler';
  distanceKm: number;
  durationMinutes: number;
  fareAmount: number;
  platformFee: number;
  netEarnings: number;
  driverTip: number;
  currency: string;
  paymentMethod: string;
  status: 'completed' | 'cancelled';
  ratingReceived?: number;
  customerFeedback?: string;
  cancellationReason?: string;
}

export interface ArchitectureSection {
  id: string;
  title: string;
  iconName: string;
  summary: string;
  details: string[];
}

// ==========================================
// 1. MULTILINGUAL CMS TYPES
// ==========================================
export interface CMSLocale {
  code: LanguageCode | 'es' | 'pt';
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  isDefault: boolean;
  completionPercentage: number;
  fallbackLocale: LanguageCode | 'es' | 'pt';
}

export interface CMSTranslationKey {
  id: string;
  keyName: string;
  namespace: 'common' | 'rides' | 'payments' | 'safety' | 'errors' | 'onboarding' | 'voice_prompts';
  description: string;
  audioPromptRequired: boolean;
  translations: Record<string, { text: string; status: 'draft' | 'in_review' | 'approved'; updatedBy: string; audioUrl?: string }>;
}

// ==========================================
// 2. VERIFICATION & COMMUNITY VOUCH TYPES
// ==========================================
export type VerificationTier = 'tier_1_basic' | 'tier_2_verified' | 'tier_3_trusted_fleet';

export interface VerificationDocument {
  id: string;
  userId: string;
  documentType: 'national_id' | 'passport' | 'carte_de_sejour' | 'titre_asile' | 'guyana_national_id' | 'suriname_eid' | 'driver_license' | 'vehicle_registration';
  documentNumber: string;
  countryIssued: string;
  expiryDate?: string;
  frontImageUrl: string;
  backImageUrl?: string;
  ocrExtractedData?: Record<string, string>;
  verificationStatus: 'pending' | 'auto_verified' | 'manual_review' | 'rejected';
  rejectionReason?: string;
}

export interface CommunityVouch {
  id: string;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: 'driver' | 'customer' | 'vendor';
  voucherUserId: string;
  voucherName: string;
  voucherRole: 'elder' | 'pastor' | 'moto_syndicate_leader' | 'merchant' | 'senior_driver';
  relationship: 'known_in_community' | 'church_member' | 'syndicate_colleague' | 'regular_customer';
  reputationWeight: number; // 1 to 10
  stakeAmountEscrow?: number; // Optional collateral escrow in local currency
  vouchStatement: string;
  status: 'pending' | 'approved' | 'flagged';
  createdAt: string;
}

export interface UserTrustScore {
  userId: string;
  overallScore: number; // 0 - 100
  documentScore: number;
  communityVouchScore: number;
  tripFulfillmentScore: number;
  incidentPenalty: number;
  tier: VerificationTier;
}

// ==========================================
// 3. DYNAMIC PRICING TYPES
// ==========================================
export interface DynamicPricingFactors {
  regionId: RegionId;
  currency: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  currentSurgeMultiplier: number; // 1.0 - 2.5
  terrainDifficultyFactor: number; // 1.0 - 1.4 (unpaved roads, steep ravines)
  weatherRainFactor: number; // 1.0 - 1.5 (tropical downpour hazard)
  economicIndexFactor: number; // Pegging index for currency depreciation
  minimumFare: number;
  rainHazardDriverBonusPercentage: number; // 100% of rain surge goes directly to driver
}

export interface DynamicFareQuote {
  quoteId: string;
  distanceKm: number;
  estimatedMinutes: number;
  currency: string;
  baseFare: number;
  distanceCharge: number;
  timeCharge: number;
  surgeCharge: number;
  terrainSurcharge: number;
  weatherHazardBonus: number;
  totalFare: number;
  driverEarnings: number;
  platformFee: number;
  expiresInSeconds: number;
  guaranteedUntil: string;
}

// ==========================================
// 4. ONBOARDING PIPELINE TYPES
// ==========================================
export interface OnboardingStep {
  stepNumber: number;
  title: string;
  description: string;
  requiredDocuments: string[];
  isCompleted: boolean;
  status: 'pending' | 'in_progress' | 'approved' | 'action_required';
  verificationMethod: 'ai_ocr' | 'community_vouch' | 'physical_inspection' | 'micro_quiz';
}

// ==========================================
// 5. PAYMENT EXPANSION & SUPPORT TYPES
// ==========================================
export type ExpansionCountry = 'brazil' | 'mexico' | 'chile' | 'colombia' | 'usa';

export interface ExpansionPaymentGateway {
  country: ExpansionCountry;
  countryName: string;
  flag: string;
  currency: string;
  localGateways: {
    name: string;
    type: 'instant_qr' | 'cash_voucher' | 'bank_transfer' | 'card_processor' | 'diaspora_remittance';
    description: string;
    settlementTime: string;
    integrationProtocol: string;
  }[];
}

export interface SupportChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'driver' | 'vendor' | 'support_agent';
  originalLanguage: LanguageCode | 'pt' | 'es';
  originalText: string;
  translatedText?: string;
  targetLanguage?: LanguageCode | 'pt' | 'es';
  audioUrl?: string; // Voice note for helmet riders & illiterate customers
  audioDurationSeconds?: number;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

// ==========================================
// 6. 3-SIDED MARKETPLACE & LBC TOKEN BROKERAGE TYPES
// ==========================================

export type MarketplaceSide = 'customer' | 'driver' | 'merchant';

export type LbcRewardActivityType =
  | 'ride_completed'
  | 'delivery_completed'
  | 'merchant_fulfillment'
  | 'service_completed'
  | 'rating_bonus'
  | 'streak_bonus';

export interface LbcRewardRule {
  activity: LbcRewardActivityType;
  label: string;
  side: MarketplaceSide;
  baseLbc: number;
  bonusLbc?: number;
  description: string;
  usdEquivalent: number;
}

export interface LbcTransaction {
  id: string;
  timestamp: string;
  userId: string;
  userType: MarketplaceSide;
  userName: string;
  activityType: LbcRewardActivityType;
  activityReferenceId: string;
  amountLbc: number;
  usdEquivalent: number;
  txHash: string;
  status: 'confirmed' | 'pending';
  note: string;
}

export interface LbcWallet {
  userId: string;
  userType: MarketplaceSide;
  userName: string;
  balanceLbc: number;
  totalEarnedLbc: number;
  usdValue: number;
  annualYieldApy: number;
  stakingRewardsEarned: number;
  linkedBrokerageAccount: string;
}

export type AssetClass = 'fractional_stock' | 'etf' | 'regional_asset' | 'fiat_cashout';

export interface BrokerageAsset {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  priceUsd: number;
  change24h: number;
  currency: string;
  exchange: string;
  description: string;
  minLbcToConvert: number;
  categoryTag: string;
  fiatRail?: string;
  yieldAnnualPercent?: number;
  iconSymbol?: string;
}

export interface BrokeragePortfolioHolding {
  id: string;
  assetId: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  sharesOrUnits: number;
  avgCostUsd: number;
  currentPriceUsd: number;
  totalValueUsd: number;
  totalReturnUsd: number;
  totalReturnPercent: number;
  acquiredAt: string;
}

export interface BrokerageConversionTrade {
  tradeId: string;
  timestamp: string;
  userId: string;
  userType: MarketplaceSide;
  userName: string;
  assetId: string;
  ticker: string;
  assetName: string;
  assetClass: AssetClass;
  lbcSpent: number;
  usdExecuted: number;
  unitsAcquired: number;
  executionPriceUsd: number;
  clearingBroker: string;
  fiatDestination?: string;
  status: 'settled' | 'pending';
  settlementConfirmationHash: string;
}

export interface MarketplaceOrder3Sided {
  id: string;
  type: 'merchant_goods' | 'ride' | 'courier_delivery' | 'errand_service';
  title: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  merchantId?: string;
  merchantName?: string;
  driverId?: string;
  driverName?: string;
  driverVehicle?: string;
  items?: { name: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: 'created' | 'merchant_prep' | 'driver_assigned' | 'in_transit' | 'delivered';
  pickupLandmark: string;
  dropoffLandmark: string;
  distanceKm: number;
  lbcRewards: {
    customerLbc: number;
    merchantLbc: number;
    driverLbc: number;
  };
  createdAt: string;
  completedAt?: string;
}

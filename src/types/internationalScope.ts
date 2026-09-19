// ============================================================================
// INTERNATIONAL MULTI-MODAL SCOPE, DYNAMIC PRICING & OPERATIONAL TYPES
// ============================================================================

export type OperationalRegion =
  | 'north_america'
  | 'central_america'
  | 'caribbean_guianas'
  | 'south_america'
  | 'french_guiana_special'
  | 'africa'
  | 'excluded_territories';

export type VehicleClass = '2_wheeler' | '3_wheeler' | '4_wheeler';

export interface VehicleClassConfig {
  id: VehicleClass;
  name: string;
  categoryName: string;
  description: string;
  iconType: 'bike' | 'trike' | 'car';
  passengerCapacity: number;
  luggageCapacityKg: number;
  baseRateMultiplier: number; // 2W: 0.7x, 3W: 1.0x, 4W: 1.8x
  minuteRateMultiplier: number;
  kmRateMultiplier: number;
  fuelEfficiencyKmPerLiter: number;
  suitableUseCases: string[];
}

export interface CountryOperationalConfig {
  code: string; // ISO 2-letter
  name: string;
  flag: string;
  region: OperationalRegion;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToUSD: number; // e.g. 1 USD = 132 HTG, 4100 COP, 605 XOF, 49.2 EGP
  isStrictlyExcluded: boolean; // Argentina & Uruguay are strictly true
  exclusionReason?: string;
  targetHourlyEarningsUSD: {
    min: number;
    max: number;
    highPerformer: number;
  };
  marketAdjustmentType: 'developing_market_baseline' | 'united_states_gig_law' | 'french_guiana_eu_regulation' | 'panama_transit_labor_law';
  supportedVehicleClasses: VehicleClass[];
  paymentRails: PaymentRailConfig[];
  sampleCity: string;
  centerCoordinates: { lat: number; lng: number };
  baseFareUSD: number;
  perMinuteRateUSD: number;
  perKmRateUSD: number;
  minimumTripFloorUSD: number;
  surgeCapMultiplier: number; // e.g. 1.5x in developing markets to prevent gouging
}

export type PaymentRailType =
  | 'mobile_money'
  | 'instant_bank_qr'
  | 'card_processor'
  | 'cash_on_delivery'
  | 'diaspora_voucher';

export interface PaymentRailConfig {
  id: string;
  name: string;
  type: PaymentRailType;
  provider: string; // e.g. 'Wave', 'Orange Money', 'M-Pesa', 'MonCash', 'PIX', 'Stripe'
  settlementSpeed: string;
  currency: string;
  iconName: string;
}

// Dynamic Fare Breakdown
export interface DynamicFareBreakdown {
  quoteId: string;
  countryCode: string;
  vehicleClass: VehicleClass;
  distanceKm: number;
  durationMinutes: number;
  // USD base calculation
  baseFareUSD: number;
  distanceChargeUSD: number;
  timeChargeUSD: number;
  subtotalUSD: number;
  surgeMultiplier: number;
  surgeChargeUSD: number;
  effectiveSurgeMultiplier: number;
  isSurgeCapped: boolean;
  minimumFloorApplied: boolean;
  totalFareUSD: number;
  // Local Currency conversion
  currencyCode: string;
  exchangeRate: number;
  totalFareLocal: number;
  baseFareLocal: number;
  // Driver Economics
  estimatedDriverNetUSD: number;
  estimatedDriverHourlyPaceUSD: number;
  platformCommissionUSD: number;
  platformCommissionPercentage: number;
  targetHourlyEarningsRangeUSD: { min: number; max: number };
}

// OTP Pickup Verification
export interface OTPVerificationSession {
  tripId: string;
  passengerId: string;
  driverId: string;
  otpCode: string; // 4-digit cryptographic PIN
  generatedAt: string;
  expiresAt: string;
  isVerified: boolean;
  verificationAttempts: number;
  maxAttempts: number;
}

// In-App Call/Text Masking
export interface PrivacyMaskingSession {
  sessionId: string;
  tripId: string;
  virtualProxyNumber: string; // e.g. "+1 (800) 927-6686" or "+509 2810-9000"
  passengerVirtualExtension: string;
  driverVirtualExtension: string;
  expiresAt: string;
  status: 'active' | 'terminated';
  encryptedCallLogsCount: number;
  encryptedSmsLogsCount: number;
}

// Driver Document Verification
export interface DriverDocumentUpload {
  id: string;
  driverId: string;
  documentCategory: 'drivers_license' | 'vehicle_registration' | 'commercial_insurance' | 'police_background';
  title: string;
  fileUrl: string;
  fileName: string;
  uploadTimestamp: string;
  expiryDate: string;
  ocrConfidenceScore: number;
  status: 'verified' | 'pending_review' | 'action_required' | 'rejected';
  rejectionReason?: string;
}

// Turn-by-Turn Low Data Maps Maneuver
export interface NavigationManeuver {
  stepIndex: number;
  instruction: string;
  distanceMeters: number;
  timeSeconds: number;
  maneuverType: 'straight' | 'turn_right' | 'turn_left' | 'roundabout' | 'u_turn' | 'arrive';
  roadName: string;
  lowDataTileKB: number; // e.g. 1.8 KB vector snippet
}

// Admin Console Fleet Heatmap Node
export interface FleetHeatmapNode {
  id: string;
  countryCode: string;
  city: string;
  coordinates: { lat: number; lng: number };
  activeTwoWheelers: number;
  activeThreeWheelers: number;
  activeFourWheelers: number;
  demandSurgeLevel: number; // 1.0 - 2.0
  averageHourlyEarningUSD: number;
  status: 'normal' | 'high_demand' | 'surge_capped' | 'excluded_blocked';
}

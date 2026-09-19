import {
  CountryOperationalConfig,
  VehicleClassConfig,
  DynamicFareBreakdown,
  FleetHeatmapNode,
  VehicleClass
} from '../types/internationalScope';
import { RegionalPurchasingPowerGuarantee } from '../types/architecture';

// ============================================================================
// 1. VEHICLE CLASS SPECIFICATIONS & MULTIPLIERS
// ============================================================================
export const VEHICLE_CLASSES: Record<VehicleClass, VehicleClassConfig> = {
  '2_wheeler': {
    id: '2_wheeler',
    name: 'Wap Moto (2-Wheeler)',
    categoryName: 'Motorbike / Moto-Taxi',
    description: 'Agile 125cc-150cc motorcycles. Lowest base rate; optimized for 1 rider and rapid parcel courier in congested traffic.',
    iconType: 'bike',
    passengerCapacity: 1,
    luggageCapacityKg: 15,
    baseRateMultiplier: 0.7, // 30% discount vs mid-tier
    minuteRateMultiplier: 0.75,
    kmRateMultiplier: 0.7,
    fuelEfficiencyKmPerLiter: 42,
    suitableUseCases: ['Solo commuter', 'Express food & parcel', 'Narrow alley navigation', 'Traffic gridlock bypass']
  },
  '3_wheeler': {
    id: '3_wheeler',
    name: 'Wap Tuk-Tuk (3-Wheeler)',
    categoryName: 'Tricycle / Auto-Rickshaw / Keke',
    description: 'Weather-protected 3-wheel cabin. Mid-tier base rate; handles 2-3 passengers, groceries, and light commercial freight.',
    iconType: 'trike',
    passengerCapacity: 3,
    luggageCapacityKg: 65,
    baseRateMultiplier: 1.0, // Baseline standard
    minuteRateMultiplier: 1.0,
    kmRateMultiplier: 1.0,
    fuelEfficiencyKmPerLiter: 28,
    suitableUseCases: ['Small groups (2-3 riders)', 'Rain protection', 'Market grocery trips', 'Affordable family transit']
  },
  '4_wheeler': {
    id: '4_wheeler',
    name: 'Wap Cab / Van (4-Wheeler)',
    categoryName: 'Compact Car / Sedan / Microvan',
    description: 'Air-conditioned 4-wheel passenger car. Premium base rate; factors in higher vehicle capital cost, commercial insurance, and maintenance.',
    iconType: 'car',
    passengerCapacity: 4,
    luggageCapacityKg: 180,
    baseRateMultiplier: 1.85, // Premium tier
    minuteRateMultiplier: 1.8,
    kmRateMultiplier: 1.9,
    fuelEfficiencyKmPerLiter: 14,
    suitableUseCases: ['Airport luggage transfers', 'Corporate & executive transit', 'Long-distance intercity', 'Extreme weather comfort']
  }
};

// ============================================================================
// 2. INTERNATIONAL OPERATIONAL FOOTPRINT & EXCLUSIONS
// ============================================================================
export const OPERATIONAL_COUNTRIES: CountryOperationalConfig[] = [
  // --------------------------------------------------------------------------
  // STRICTLY EXCLUDED COUNTRIES (ARGENTINA & URUGUAY)
  // --------------------------------------------------------------------------
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    region: 'excluded_territories',
    currencyCode: 'ARS',
    currencySymbol: '$',
    exchangeRateToUSD: 980.0,
    isStrictlyExcluded: true,
    exclusionReason: 'STRICT LEGAL MANDATE: Absolute exclusion from Wap platform footprint. Geofencing is active; zero driver onboarding, dispatching, or passenger bookings are permitted within Argentine territory.',
    targetHourlyEarningsUSD: { min: 0, max: 0, highPerformer: 0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: [],
    paymentRails: [],
    sampleCity: 'Buenos Aires (BLOCKED)',
    centerCoordinates: { lat: -34.6037, lng: -58.3816 },
    baseFareUSD: 0,
    perMinuteRateUSD: 0,
    perKmRateUSD: 0,
    minimumTripFloorUSD: 0,
    surgeCapMultiplier: 1.0
  },
  {
    code: 'UY',
    name: 'Uruguay',
    flag: '🇺🇾',
    region: 'excluded_territories',
    currencyCode: 'UYU',
    currencySymbol: '$U',
    exchangeRateToUSD: 40.5,
    isStrictlyExcluded: true,
    exclusionReason: 'STRICT LEGAL MANDATE: Absolute exclusion from Wap platform footprint. Geofencing is active; driver onboarding, geofenced GPS dispatch, and service availability are permanently barred.',
    targetHourlyEarningsUSD: { min: 0, max: 0, highPerformer: 0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: [],
    paymentRails: [],
    sampleCity: 'Montevideo (BLOCKED)',
    centerCoordinates: { lat: -34.9011, lng: -56.1645 },
    baseFareUSD: 0,
    perMinuteRateUSD: 0,
    perKmRateUSD: 0,
    minimumTripFloorUSD: 0,
    surgeCapMultiplier: 1.0
  },

  // --------------------------------------------------------------------------
  // NORTH AMERICA (UNITED STATES ONLY - CUSTOM GIG LAW ADJUSTMENT)
  // --------------------------------------------------------------------------
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    region: 'north_america',
    currencyCode: 'USD',
    currencySymbol: '$',
    exchangeRateToUSD: 1.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 22.0, max: 32.0, highPerformer: 45.0 },
    marketAdjustmentType: 'united_states_gig_law',
    supportedVehicleClasses: ['2_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'us_stripe', name: 'Credit / Debit Cards', type: 'card_processor', provider: 'Stripe', settlementSpeed: 'Instant', currency: 'USD', iconName: 'credit-card' },
      { id: 'us_apple_google', name: 'Apple Pay / Google Pay', type: 'card_processor', provider: 'Stripe / Wallets', settlementSpeed: 'Instant', currency: 'USD', iconName: 'smartphone' }
    ],
    sampleCity: 'Miami, Florida',
    centerCoordinates: { lat: 25.7617, lng: -80.1918 },
    baseFareUSD: 3.5,
    perMinuteRateUSD: 0.42,
    perKmRateUSD: 1.35,
    minimumTripFloorUSD: 7.5,
    surgeCapMultiplier: 2.8 // Standard flexible US market surge
  },

  // --------------------------------------------------------------------------
  // CENTRAL AMERICA (COSTA RICA, PANAMA, GUATEMALA, HONDURAS, NICARAGUA)
  // --------------------------------------------------------------------------
  {
    code: 'PA',
    name: 'Panama',
    flag: '🇵🇦',
    region: 'central_america',
    currencyCode: 'USD',
    currencySymbol: '$',
    exchangeRateToUSD: 1.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 8.0, max: 14.0, highPerformer: 18.0 },
    marketAdjustmentType: 'panama_transit_labor_law', // Custom Panama labor & ATTT transit law
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'pa_yappy', name: 'Yappy (Banco General)', type: 'instant_bank_qr', provider: 'Banco General Yappy', settlementSpeed: '<5 seconds', currency: 'USD', iconName: 'qr-code' },
      { id: 'pa_cards', name: 'Visa / Mastercard', type: 'card_processor', provider: 'Stripe Panama', settlementSpeed: 'Instant', currency: 'USD', iconName: 'credit-card' },
      { id: 'pa_cash', name: 'Efectivo (Cash)', type: 'cash_on_delivery', provider: 'Wap Escrow Float', settlementSpeed: 'Immediate', currency: 'USD', iconName: 'banknote' }
    ],
    sampleCity: 'Panama City (Via España)',
    centerCoordinates: { lat: 8.9824, lng: -79.5199 },
    baseFareUSD: 1.6,
    perMinuteRateUSD: 0.18,
    perKmRateUSD: 0.65,
    minimumTripFloorUSD: 2.8,
    surgeCapMultiplier: 1.6
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    flag: '🇨🇷',
    region: 'central_america',
    currencyCode: 'CRC',
    currencySymbol: '₡',
    exchangeRateToUSD: 520.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 6.5, max: 12.0, highPerformer: 16.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'cr_sinpe', name: 'SINPE Móvil', type: 'instant_bank_qr', provider: 'BCCR SINPE', settlementSpeed: 'Instant', currency: 'CRC', iconName: 'smartphone' },
      { id: 'cr_cash', name: 'Colones en Efectivo', type: 'cash_on_delivery', provider: 'Wap Driver Float', settlementSpeed: 'Immediate', currency: 'CRC', iconName: 'banknote' }
    ],
    sampleCity: 'San José (Paseo Colón)',
    centerCoordinates: { lat: 9.9281, lng: -84.0907 },
    baseFareUSD: 1.2,
    perMinuteRateUSD: 0.14,
    perKmRateUSD: 0.55,
    minimumTripFloorUSD: 2.2,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'GT',
    name: 'Guatemala',
    flag: '🇬🇹',
    region: 'central_america',
    currencyCode: 'GTQ',
    currencySymbol: 'Q',
    exchangeRateToUSD: 7.75,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 10.0, highPerformer: 14.5 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'gt_tigo_money', name: 'Tigo Money', type: 'mobile_money', provider: 'Tigo Guatemala', settlementSpeed: 'Instant', currency: 'GTQ', iconName: 'smartphone' },
      { id: 'gt_cash', name: 'Quetzales Efectivo', type: 'cash_on_delivery', provider: 'Wap Driver Float', settlementSpeed: 'Immediate', currency: 'GTQ', iconName: 'banknote' }
    ],
    sampleCity: 'Guatemala City (Zona 10)',
    centerCoordinates: { lat: 14.6349, lng: -90.5069 },
    baseFareUSD: 1.0,
    perMinuteRateUSD: 0.11,
    perKmRateUSD: 0.45,
    minimumTripFloorUSD: 1.8,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'HN',
    name: 'Honduras',
    flag: '🇭🇳',
    region: 'central_america',
    currencyCode: 'HNL',
    currencySymbol: 'L',
    exchangeRateToUSD: 24.8,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 9.5, highPerformer: 13.5 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'hn_tigo_money', name: 'Tigo Money Honduras', type: 'mobile_money', provider: 'Tigo', settlementSpeed: 'Instant', currency: 'HNL', iconName: 'smartphone' },
      { id: 'hn_cash', name: 'Lempiras Efectivo', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'HNL', iconName: 'banknote' }
    ],
    sampleCity: 'Tegucigalpa',
    centerCoordinates: { lat: 14.0723, lng: -87.1921 },
    baseFareUSD: 0.9,
    perMinuteRateUSD: 0.1,
    perKmRateUSD: 0.42,
    minimumTripFloorUSD: 1.6,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'NI',
    name: 'Nicaragua',
    flag: '🇳🇮',
    region: 'central_america',
    currencyCode: 'NIO',
    currencySymbol: 'C$',
    exchangeRateToUSD: 36.8,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 9.0, highPerformer: 13.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'ni_billetera', name: 'Billetera Móvil Banpro', type: 'mobile_money', provider: 'Banpro', settlementSpeed: 'Instant', currency: 'NIO', iconName: 'smartphone' },
      { id: 'ni_cash', name: 'Córdobas Efectivo', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'NIO', iconName: 'banknote' }
    ],
    sampleCity: 'Managua',
    centerCoordinates: { lat: 12.1149, lng: -86.2362 },
    baseFareUSD: 0.85,
    perMinuteRateUSD: 0.09,
    perKmRateUSD: 0.4,
    minimumTripFloorUSD: 1.5,
    surgeCapMultiplier: 1.5
  },

  // --------------------------------------------------------------------------
  // CARIBBEAN & GUIANAS (GUYANA, SURINAME, HAITI, JAMAICA, DOMINICA)
  // --------------------------------------------------------------------------
  {
    code: 'HT',
    name: 'Haiti',
    flag: '🇭🇹',
    region: 'caribbean_guianas',
    currencyCode: 'HTG',
    currencySymbol: 'G',
    exchangeRateToUSD: 132.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 11.0, highPerformer: 15.5 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'ht_moncash', name: 'MonCash (Digicel)', type: 'mobile_money', provider: 'Digicel MonCash', settlementSpeed: '<10 seconds', currency: 'HTG', iconName: 'smartphone' },
      { id: 'ht_natcash', name: 'Natcash', type: 'mobile_money', provider: 'Natcom', settlementSpeed: 'Instant', currency: 'HTG', iconName: 'smartphone' },
      { id: 'ht_cash', name: 'Kach Goud (Cash)', type: 'cash_on_delivery', provider: 'Wap Escrow Float', settlementSpeed: 'Immediate', currency: 'HTG', iconName: 'banknote' }
    ],
    sampleCity: 'Port-au-Prince (Delmas / Pétion-Ville)',
    centerCoordinates: { lat: 18.5944, lng: -72.3074 },
    baseFareUSD: 1.15, // ~150 HTG
    perMinuteRateUSD: 0.09,
    perKmRateUSD: 0.38,
    minimumTripFloorUSD: 1.8,
    surgeCapMultiplier: 1.6
  },
  {
    code: 'GY',
    name: 'Guyana',
    flag: '🇬🇾',
    region: 'caribbean_guianas',
    currencyCode: 'GYD',
    currencySymbol: 'G$',
    exchangeRateToUSD: 210.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 6.0, max: 12.0, highPerformer: 16.5 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'gy_mmg', name: 'MMG+ (GTT Mobile Money)', type: 'mobile_money', provider: 'GTT MMG+', settlementSpeed: 'Instant', currency: 'GYD', iconName: 'smartphone' },
      { id: 'gy_cash', name: 'Guyana Cash', type: 'cash_on_delivery', provider: 'Wap Float', settlementSpeed: 'Immediate', currency: 'GYD', iconName: 'banknote' }
    ],
    sampleCity: 'Georgetown (Stabroek)',
    centerCoordinates: { lat: 6.8013, lng: -58.1551 },
    baseFareUSD: 1.4,
    perMinuteRateUSD: 0.12,
    perKmRateUSD: 0.48,
    minimumTripFloorUSD: 2.2,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'SR',
    name: 'Suriname',
    flag: '🇸🇷',
    region: 'caribbean_guianas',
    currencyCode: 'SRD',
    currencySymbol: 'Sr$',
    exchangeRateToUSD: 36.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.5, max: 11.0, highPerformer: 15.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'sr_uni5pay', name: 'Uni5Pay+ / Moopei', type: 'mobile_money', provider: 'Southern Commercial Bank', settlementSpeed: 'Instant', currency: 'SRD', iconName: 'smartphone' },
      { id: 'sr_cash', name: 'Surinaamse Dollar Contant', type: 'cash_on_delivery', provider: 'Wap Float', settlementSpeed: 'Immediate', currency: 'SRD', iconName: 'banknote' }
    ],
    sampleCity: 'Paramaribo (Waterkant)',
    centerCoordinates: { lat: 5.852, lng: -55.2038 },
    baseFareUSD: 1.25,
    perMinuteRateUSD: 0.11,
    perKmRateUSD: 0.44,
    minimumTripFloorUSD: 2.0,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'JM',
    name: 'Jamaica',
    flag: '🇯🇲',
    region: 'caribbean_guianas',
    currencyCode: 'JMD',
    currencySymbol: 'J$',
    exchangeRateToUSD: 156.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 6.0, max: 12.0, highPerformer: 16.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'jm_lynck', name: 'Lynk (NCB Digital Wallet)', type: 'mobile_money', provider: 'NCB Lynk', settlementSpeed: 'Instant', currency: 'JMD', iconName: 'smartphone' },
      { id: 'jm_cash', name: 'Jamaican Dollars Cash', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'JMD', iconName: 'banknote' }
    ],
    sampleCity: 'Kingston (Half Way Tree)',
    centerCoordinates: { lat: 17.9714, lng: -76.7928 },
    baseFareUSD: 1.5,
    perMinuteRateUSD: 0.13,
    perKmRateUSD: 0.52,
    minimumTripFloorUSD: 2.5,
    surgeCapMultiplier: 1.6
  },
  {
    code: 'DM',
    name: 'Dominica',
    flag: '🇩🇲',
    region: 'caribbean_guianas',
    currencyCode: 'XCD',
    currencySymbol: 'EC$',
    exchangeRateToUSD: 2.70, // Pegged by Eastern Caribbean Central Bank (ECCB) at 2.70 XCD = 1 USD
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 6.0, max: 12.0, highPerformer: 16.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'dm_mobanking', name: 'MoBanking (National Bank of Dominica)', type: 'mobile_money', provider: 'NBD MoBanking', settlementSpeed: 'Instant', currency: 'XCD', iconName: 'smartphone' },
      { id: 'dm_mycash', name: 'Digicel MyCash / Paymaster', type: 'mobile_money', provider: 'Digicel MyCash', settlementSpeed: 'Instant', currency: 'XCD', iconName: 'smartphone' },
      { id: 'dm_cash', name: 'Eastern Caribbean Dollar Cash (Escrow)', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'XCD', iconName: 'banknote' }
    ],
    sampleCity: 'Roseau (Bayfront / Potter\'s Ville)',
    centerCoordinates: { lat: 15.3092, lng: -61.3794 },
    baseFareUSD: 1.5,
    perMinuteRateUSD: 0.14,
    perKmRateUSD: 0.55,
    minimumTripFloorUSD: 2.5,
    surgeCapMultiplier: 1.5
  },

  // --------------------------------------------------------------------------
  // FRENCH GUIANA (HANDLED SEPARATELY - EURO-ZONE PURCHASING POWER & REGULATIONS)
  // --------------------------------------------------------------------------
  {
    code: 'GF',
    name: 'French Guiana (Guyane)',
    flag: '🇬🇫',
    region: 'french_guiana_special',
    currencyCode: 'EUR',
    currencySymbol: '€',
    exchangeRateToUSD: 0.92, // 1 EUR ~ 1.09 USD (0.92 EUR per USD)
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 19.5, max: 28.0, highPerformer: 38.0 },
    marketAdjustmentType: 'french_guiana_eu_regulation', // Tied to French transport laws, SMIC, EU labor standards
    supportedVehicleClasses: ['2_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'gf_carte_bancaire', name: 'Carte Bancaire (CB) / Visa / MC', type: 'card_processor', provider: 'Stripe Europe', settlementSpeed: 'Instant', currency: 'EUR', iconName: 'credit-card' },
      { id: 'gf_apple_pay', name: 'Apple Pay / Google Pay', type: 'card_processor', provider: 'Stripe Europe', settlementSpeed: 'Instant', currency: 'EUR', iconName: 'smartphone' },
      { id: 'gf_especes', name: 'Espèces (Cash EUR)', type: 'cash_on_delivery', provider: 'Wap Driver Float', settlementSpeed: 'Immediate', currency: 'EUR', iconName: 'banknote' }
    ],
    sampleCity: 'Cayenne (Place des Palmistes)',
    centerCoordinates: { lat: 4.9372, lng: -52.326 },
    baseFareUSD: 3.8, // ~€3.50 Base
    perMinuteRateUSD: 0.45,
    perKmRateUSD: 1.45,
    minimumTripFloorUSD: 7.2,
    surgeCapMultiplier: 2.0
  },

  // --------------------------------------------------------------------------
  // SOUTH AMERICA (EXCEPT ARGENTINA, URUGUAY & FRENCH GUIANA)
  // --------------------------------------------------------------------------
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    region: 'south_america',
    currencyCode: 'COP',
    currencySymbol: '$',
    exchangeRateToUSD: 4100.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 10.5, highPerformer: 15.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'co_nequi', name: 'Nequi (Bancolombia)', type: 'mobile_money', provider: 'Nequi', settlementSpeed: '<5 seconds', currency: 'COP', iconName: 'smartphone' },
      { id: 'co_daviplata', name: 'Daviplata', type: 'mobile_money', provider: 'Davivienda', settlementSpeed: 'Instant', currency: 'COP', iconName: 'smartphone' },
      { id: 'co_pse', name: 'PSE Débito Bancario', type: 'instant_bank_qr', provider: 'ACH Colombia', settlementSpeed: 'Instant', currency: 'COP', iconName: 'credit-card' },
      { id: 'co_cash', name: 'Efectivo en Pesos', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'COP', iconName: 'banknote' }
    ],
    sampleCity: 'Bogotá (Chapinero / Teusaquillo)',
    centerCoordinates: { lat: 4.711, lng: -74.0721 },
    baseFareUSD: 1.1,
    perMinuteRateUSD: 0.1,
    perKmRateUSD: 0.42,
    minimumTripFloorUSD: 1.9,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    region: 'south_america',
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    exchangeRateToUSD: 5.45,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.5, max: 11.5, highPerformer: 16.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'br_pix', name: 'PIX (Banco Central)', type: 'instant_bank_qr', provider: 'BACEN PIX API', settlementSpeed: '<3 seconds', currency: 'BRL', iconName: 'qr-code' },
      { id: 'br_cards', name: 'Cartão de Débito / Crédito', type: 'card_processor', provider: 'Stripe Brasil', settlementSpeed: 'Instant', currency: 'BRL', iconName: 'credit-card' },
      { id: 'br_cash', name: 'Dinheiro (Cash)', type: 'cash_on_delivery', provider: 'Wap Float', settlementSpeed: 'Immediate', currency: 'BRL', iconName: 'banknote' }
    ],
    sampleCity: 'Manaus / Fortaleza (Northern Hub)',
    centerCoordinates: { lat: -3.119, lng: -60.0217 },
    baseFareUSD: 1.25,
    perMinuteRateUSD: 0.11,
    perKmRateUSD: 0.46,
    minimumTripFloorUSD: 2.1,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'PE',
    name: 'Peru',
    flag: '🇵🇪',
    region: 'south_america',
    currencyCode: 'PEN',
    currencySymbol: 'S/',
    exchangeRateToUSD: 3.75,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 10.0, highPerformer: 14.5 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'pe_yape', name: 'Yape (BCP)', type: 'instant_bank_qr', provider: 'BCP Yape', settlementSpeed: '<5 seconds', currency: 'PEN', iconName: 'smartphone' },
      { id: 'pe_plin', name: 'Plin (BBVA / Scotiabank)', type: 'instant_bank_qr', provider: 'Plin', settlementSpeed: 'Instant', currency: 'PEN', iconName: 'smartphone' },
      { id: 'pe_cash', name: 'Soles Efectivo', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'PEN', iconName: 'banknote' }
    ],
    sampleCity: 'Lima (Miraflores)',
    centerCoordinates: { lat: -12.0464, lng: -77.0428 },
    baseFareUSD: 1.15,
    perMinuteRateUSD: 0.1,
    perKmRateUSD: 0.44,
    minimumTripFloorUSD: 1.9,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    region: 'south_america',
    currencyCode: 'CLP',
    currencySymbol: '$',
    exchangeRateToUSD: 935.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 6.5, max: 12.0, highPerformer: 17.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'cl_webpay', name: 'Webpay Plus / Redcompra', type: 'card_processor', provider: 'Transbank', settlementSpeed: 'Instant', currency: 'CLP', iconName: 'credit-card' },
      { id: 'cl_mach', name: 'MACH (Banco Bci)', type: 'mobile_money', provider: 'Bci MACH', settlementSpeed: 'Instant', currency: 'CLP', iconName: 'smartphone' }
    ],
    sampleCity: 'Santiago (Providencia)',
    centerCoordinates: { lat: -33.4489, lng: -70.6693 },
    baseFareUSD: 1.6,
    perMinuteRateUSD: 0.15,
    perKmRateUSD: 0.58,
    minimumTripFloorUSD: 2.6,
    surgeCapMultiplier: 1.6
  },

  // --------------------------------------------------------------------------
  // AFRICA (NORTH AFRICA: EGYPT, LIBYA; SAHEL TO SOUTHERN AFRICA & MADAGASCAR)
  // --------------------------------------------------------------------------
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    region: 'africa',
    currencyCode: 'EGP',
    currencySymbol: 'E£',
    exchangeRateToUSD: 48.5,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 10.0, highPerformer: 14.0 },
    marketAdjustmentType: 'developing_market_baseline', // Guarantees $5-$12/hr
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'eg_vodafone_cash', name: 'Vodafone Cash', type: 'mobile_money', provider: 'Vodafone Egypt', settlementSpeed: 'Instant', currency: 'EGP', iconName: 'smartphone' },
      { id: 'eg_instapay', name: 'InstaPay (CBE National Switch)', type: 'instant_bank_qr', provider: 'Central Bank of Egypt', settlementSpeed: '<5 seconds', currency: 'EGP', iconName: 'qr-code' },
      { id: 'eg_cash', name: 'Egyptian Pounds Cash', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'EGP', iconName: 'banknote' }
    ],
    sampleCity: 'Cairo (Tahrir / Nasr City)',
    centerCoordinates: { lat: 30.0444, lng: 31.2357 },
    baseFareUSD: 0.9,
    perMinuteRateUSD: 0.08,
    perKmRateUSD: 0.35,
    minimumTripFloorUSD: 1.6,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'LY',
    name: 'Libya',
    flag: '🇱🇾',
    region: 'africa',
    currencyCode: 'LYD',
    currencySymbol: 'LD',
    exchangeRateToUSD: 4.85,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 10.5, highPerformer: 14.5 },
    marketAdjustmentType: 'developing_market_baseline', // Guarantees $5-$12/hr
    supportedVehicleClasses: ['2_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'ly_sadad', name: 'Sadad Mobile Pay', type: 'mobile_money', provider: 'Madar Sadad', settlementSpeed: 'Instant', currency: 'LYD', iconName: 'smartphone' },
      { id: 'ly_cash', name: 'Libyan Dinar Cash', type: 'cash_on_delivery', provider: 'Wap Float', settlementSpeed: 'Immediate', currency: 'LYD', iconName: 'banknote' }
    ],
    sampleCity: 'Tripoli (Martyrs’ Square)',
    centerCoordinates: { lat: 32.8872, lng: 13.1913 },
    baseFareUSD: 1.0,
    perMinuteRateUSD: 0.09,
    perKmRateUSD: 0.38,
    minimumTripFloorUSD: 1.8,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'SN',
    name: 'Senegal',
    flag: '🇸🇳',
    region: 'africa',
    currencyCode: 'XOF',
    currencySymbol: 'CFA',
    exchangeRateToUSD: 605.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 10.5, highPerformer: 15.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'sn_wave', name: 'Wave Mobile Money', type: 'mobile_money', provider: 'Wave Digital Finance', settlementSpeed: '<3 seconds (1% fee)', currency: 'XOF', iconName: 'smartphone' },
      { id: 'sn_orange', name: 'Orange Money Senegal', type: 'mobile_money', provider: 'Sonatel Orange', settlementSpeed: 'Instant', currency: 'XOF', iconName: 'smartphone' },
      { id: 'sn_cash', name: 'Francs CFA Espèces', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'XOF', iconName: 'banknote' }
    ],
    sampleCity: 'Dakar (Plateau / Medina)',
    centerCoordinates: { lat: 14.6928, lng: -17.4467 },
    baseFareUSD: 1.05,
    perMinuteRateUSD: 0.09,
    perKmRateUSD: 0.38,
    minimumTripFloorUSD: 1.8,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'CI',
    name: 'Ivory Coast (Côte d’Ivoire)',
    flag: '🇨🇮',
    region: 'africa',
    currencyCode: 'XOF',
    currencySymbol: 'CFA',
    exchangeRateToUSD: 605.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 11.0, highPerformer: 15.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'ci_wave', name: 'Wave CI', type: 'mobile_money', provider: 'Wave', settlementSpeed: 'Instant', currency: 'XOF', iconName: 'smartphone' },
      { id: 'ci_mtn', name: 'MTN MoMo CI', type: 'mobile_money', provider: 'MTN Mobile Money', settlementSpeed: 'Instant', currency: 'XOF', iconName: 'smartphone' },
      { id: 'ci_cash', name: 'Francs CFA Espèces', type: 'cash_on_delivery', provider: 'Wap Float', settlementSpeed: 'Immediate', currency: 'XOF', iconName: 'banknote' }
    ],
    sampleCity: 'Abidjan (Cocody / Plateau)',
    centerCoordinates: { lat: 5.36, lng: -4.0083 },
    baseFareUSD: 1.1,
    perMinuteRateUSD: 0.1,
    perKmRateUSD: 0.4,
    minimumTripFloorUSD: 1.9,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    region: 'africa',
    currencyCode: 'NGN',
    currencySymbol: '₦',
    exchangeRateToUSD: 1620.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 11.0, highPerformer: 15.5 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'ng_opay', name: 'OPay Wallet', type: 'mobile_money', provider: 'OPay Nigeria', settlementSpeed: 'Instant', currency: 'NGN', iconName: 'smartphone' },
      { id: 'ng_palmpay', name: 'PalmPay', type: 'mobile_money', provider: 'PalmPay', settlementSpeed: 'Instant', currency: 'NGN', iconName: 'smartphone' },
      { id: 'ng_cash', name: 'Naira Cash', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'NGN', iconName: 'banknote' }
    ],
    sampleCity: 'Lagos (Ikeja / Victoria Island)',
    centerCoordinates: { lat: 6.5244, lng: 3.3792 },
    baseFareUSD: 0.95,
    perMinuteRateUSD: 0.08,
    perKmRateUSD: 0.36,
    minimumTripFloorUSD: 1.7,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    region: 'africa',
    currencyCode: 'KES',
    currencySymbol: 'KSh',
    exchangeRateToUSD: 129.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 11.5, highPerformer: 16.0 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'ke_mpesa', name: 'M-PESA (Safaricom)', type: 'mobile_money', provider: 'Safaricom M-PESA API', settlementSpeed: '<2 seconds', currency: 'KES', iconName: 'smartphone' },
      { id: 'ke_airtel', name: 'Airtel Money Kenya', type: 'mobile_money', provider: 'Airtel', settlementSpeed: 'Instant', currency: 'KES', iconName: 'smartphone' },
      { id: 'ke_cash', name: 'Kenyan Shillings Cash', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'KES', iconName: 'banknote' }
    ],
    sampleCity: 'Nairobi (Westlands / CBD)',
    centerCoordinates: { lat: -1.2921, lng: 36.8219 },
    baseFareUSD: 1.1,
    perMinuteRateUSD: 0.09,
    perKmRateUSD: 0.38,
    minimumTripFloorUSD: 1.85,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'MG',
    name: 'Madagascar',
    flag: '🇲🇬',
    region: 'africa',
    currencyCode: 'MGA',
    currencySymbol: 'Ar',
    exchangeRateToUSD: 4550.0,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 5.0, max: 9.5, highPerformer: 13.5 },
    marketAdjustmentType: 'developing_market_baseline', // Full coverage down to Madagascar
    supportedVehicleClasses: ['2_wheeler', '3_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'mg_mvola', name: 'MVola (Telma)', type: 'mobile_money', provider: 'MVola', settlementSpeed: 'Instant', currency: 'MGA', iconName: 'smartphone' },
      { id: 'mg_orange', name: 'Orange Money Madagascar', type: 'mobile_money', provider: 'Orange', settlementSpeed: 'Instant', currency: 'MGA', iconName: 'smartphone' },
      { id: 'mg_cash', name: 'Ariary Espèces', type: 'cash_on_delivery', provider: 'Wap Float', settlementSpeed: 'Immediate', currency: 'MGA', iconName: 'banknote' }
    ],
    sampleCity: 'Antananarivo (Analakely)',
    centerCoordinates: { lat: -18.8792, lng: 47.5079 },
    baseFareUSD: 0.85,
    perMinuteRateUSD: 0.08,
    perKmRateUSD: 0.34,
    minimumTripFloorUSD: 1.5,
    surgeCapMultiplier: 1.5
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    region: 'africa',
    currencyCode: 'ZAR',
    currencySymbol: 'R',
    exchangeRateToUSD: 17.8,
    isStrictlyExcluded: false,
    targetHourlyEarningsUSD: { min: 6.0, max: 12.0, highPerformer: 16.5 },
    marketAdjustmentType: 'developing_market_baseline',
    supportedVehicleClasses: ['2_wheeler', '4_wheeler'],
    paymentRails: [
      { id: 'za_ozow', name: 'Ozow Instant EFT', type: 'instant_bank_qr', provider: 'Ozow', settlementSpeed: 'Instant', currency: 'ZAR', iconName: 'qr-code' },
      { id: 'za_cards', name: 'Visa / Mastercard', type: 'card_processor', provider: 'Stripe South Africa', settlementSpeed: 'Instant', currency: 'ZAR', iconName: 'credit-card' },
      { id: 'za_cash', name: 'Rand Cash', type: 'cash_on_delivery', provider: 'Wap Escrow', settlementSpeed: 'Immediate', currency: 'ZAR', iconName: 'banknote' }
    ],
    sampleCity: 'Johannesburg (Sandton / Soweto)',
    centerCoordinates: { lat: -26.2041, lng: 28.0473 },
    baseFareUSD: 1.45,
    perMinuteRateUSD: 0.13,
    perKmRateUSD: 0.5,
    minimumTripFloorUSD: 2.3,
    surgeCapMultiplier: 1.6
  }
];

// Lookup by country code
export const COUNTRY_LOOKUP: Record<string, CountryOperationalConfig> = OPERATIONAL_COUNTRIES.reduce(
  (acc, c) => {
    acc[c.code] = c;
    return acc;
  },
  {} as Record<string, CountryOperationalConfig>
);

// ============================================================================
// 3. CORE DYNAMIC PRICING ENGINE WITH TARGET EARNINGS CALIBRATION
// ============================================================================
export function calculateDynamicFare(params: {
  countryCode: string;
  vehicleClass: VehicleClass;
  distanceKm: number;
  durationMinutes: number;
  requestedSurgeMultiplier?: number;
  terrainDifficultyMultiplier?: number; // 1.0 - 1.4
  weatherRainMultiplier?: number; // 1.0 - 1.5
}): DynamicFareBreakdown {
  const country = COUNTRY_LOOKUP[params.countryCode] || COUNTRY_LOOKUP['HT'];
  const vehicle = VEHICLE_CLASSES[params.vehicleClass] || VEHICLE_CLASSES['2_wheeler'];

  // Handle strictly excluded territories
  if (country.isStrictlyExcluded) {
    throw new Error(`CRITICAL GEOFENCE REJECTION: Operational services are strictly barred in ${country.name}. No pricing or dispatch available.`);
  }

  // Multipliers
  const terrainFactor = params.terrainDifficultyMultiplier || 1.0;
  const weatherFactor = params.weatherRainMultiplier || 1.0;
  const rawSurge = params.requestedSurgeMultiplier || 1.0;

  // Cap surge in developing markets to protect consumers from predatory surges
  const isSurgeCapped = rawSurge > country.surgeCapMultiplier;
  const effectiveSurgeMultiplier = Math.min(rawSurge, country.surgeCapMultiplier);

  // Vehicle Class Scaled Rates
  const baseRate = country.baseFareUSD * vehicle.baseRateMultiplier;
  const minuteRate = country.perMinuteRateUSD * vehicle.minuteRateMultiplier;
  const kmRate = country.perKmRateUSD * vehicle.kmRateMultiplier * terrainFactor;

  // Core formula: Fare = Base_Fare + (Trip_Time_Minutes * Minute_Rate) + (Trip_Distance_KM * KM_Rate)
  const baseFareUSD = baseRate;
  const distanceChargeUSD = params.distanceKm * kmRate;
  const timeChargeUSD = params.durationMinutes * minuteRate;
  const subtotalUSD = baseFareUSD + distanceChargeUSD + timeChargeUSD;

  // Surge calculation
  const surgeChargeUSD = subtotalUSD * (effectiveSurgeMultiplier - 1.0);

  // Weather hazard bonus (100% passed to driver)
  const weatherHazardUSD = subtotalUSD * (weatherFactor - 1.0);

  // Gross before floor
  const rawTotalUSD = subtotalUSD + surgeChargeUSD + weatherHazardUSD;

  // Minimum floor check
  const floorThreshold = country.minimumTripFloorUSD * vehicle.baseRateMultiplier;
  const minimumFloorApplied = rawTotalUSD < floorThreshold;
  const totalFareUSD = Math.max(floorThreshold, Math.round(rawTotalUSD * 100) / 100);

  // Platform commission: 12% on standard, 0% on weather hazard
  const commissionableUSD = subtotalUSD + surgeChargeUSD;
  const platformCommissionUSD = Math.round(commissionableUSD * 0.12 * 100) / 100;
  const estimatedDriverNetUSD = Math.round((totalFareUSD - platformCommissionUSD) * 100) / 100;

  // Calculate Driver's Hourly Pace:
  // Assumes ~42 minutes active trip time per hour with 18 minutes repositioning/idle (70% utilization)
  const tripsPerHourPace = 60 / (params.durationMinutes + 8);
  const estimatedDriverHourlyPaceUSD = Math.round(estimatedDriverNetUSD * tripsPerHourPace * 100) / 100;

  // Convert to local currency
  const totalFareLocal = Math.round(totalFareUSD * country.exchangeRateToUSD * 10) / 10;
  const baseFareLocal = Math.round(baseFareUSD * country.exchangeRateToUSD * 10) / 10;

  return {
    quoteId: `QTE-${country.code}-${params.vehicleClass.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
    countryCode: country.code,
    vehicleClass: params.vehicleClass,
    distanceKm: params.distanceKm,
    durationMinutes: params.durationMinutes,
    baseFareUSD: Math.round(baseFareUSD * 100) / 100,
    distanceChargeUSD: Math.round(distanceChargeUSD * 100) / 100,
    timeChargeUSD: Math.round(timeChargeUSD * 100) / 100,
    subtotalUSD: Math.round(subtotalUSD * 100) / 100,
    surgeMultiplier: rawSurge,
    surgeChargeUSD: Math.round(surgeChargeUSD * 100) / 100,
    effectiveSurgeMultiplier,
    isSurgeCapped,
    minimumFloorApplied,
    totalFareUSD,
    currencyCode: country.currencyCode,
    exchangeRate: country.exchangeRateToUSD,
    totalFareLocal,
    baseFareLocal,
    estimatedDriverNetUSD,
    estimatedDriverHourlyPaceUSD,
    platformCommissionUSD,
    platformCommissionPercentage: 12.0,
    targetHourlyEarningsRangeUSD: {
      min: country.targetHourlyEarningsUSD.min,
      max: country.targetHourlyEarningsUSD.max
    }
  };
}

// ============================================================================
// 4. ADMIN CONSOLE FLEET HEATMAP NODES
// ============================================================================
export const FLEET_HEATMAP_DATA: FleetHeatmapNode[] = [
  { id: 'node-pap', countryCode: 'HT', city: 'Port-au-Prince', coordinates: { lat: 18.5944, lng: -72.3074 }, activeTwoWheelers: 342, activeThreeWheelers: 86, activeFourWheelers: 45, demandSurgeLevel: 1.35, averageHourlyEarningUSD: 7.8, status: 'high_demand' },
  { id: 'node-geo', countryCode: 'GY', city: 'Georgetown', coordinates: { lat: 6.8013, lng: -58.1551 }, activeTwoWheelers: 124, activeThreeWheelers: 52, activeFourWheelers: 38, demandSurgeLevel: 1.15, averageHourlyEarningUSD: 8.4, status: 'normal' },
  { id: 'node-par', countryCode: 'SR', city: 'Paramaribo', coordinates: { lat: 5.852, lng: -55.2038 }, activeTwoWheelers: 98, activeThreeWheelers: 41, activeFourWheelers: 29, demandSurgeLevel: 1.1, averageHourlyEarningUSD: 7.2, status: 'normal' },
  { id: 'node-cay', countryCode: 'GF', city: 'Cayenne', coordinates: { lat: 4.9372, lng: -52.326 }, activeTwoWheelers: 76, activeThreeWheelers: 0, activeFourWheelers: 64, demandSurgeLevel: 1.25, averageHourlyEarningUSD: 23.5, status: 'normal' },
  { id: 'node-pan', countryCode: 'PA', city: 'Panama City', coordinates: { lat: 8.9824, lng: -79.5199 }, activeTwoWheelers: 210, activeThreeWheelers: 45, activeFourWheelers: 135, demandSurgeLevel: 1.4, averageHourlyEarningUSD: 11.2, status: 'high_demand' },
  { id: 'node-bog', countryCode: 'CO', city: 'Bogotá', coordinates: { lat: 4.711, lng: -74.0721 }, activeTwoWheelers: 480, activeThreeWheelers: 110, activeFourWheelers: 220, demandSurgeLevel: 1.5, averageHourlyEarningUSD: 8.9, status: 'surge_capped' },
  { id: 'node-man', countryCode: 'BR', city: 'Manaus', coordinates: { lat: -3.119, lng: -60.0217 }, activeTwoWheelers: 290, activeThreeWheelers: 78, activeFourWheelers: 140, demandSurgeLevel: 1.2, averageHourlyEarningUSD: 9.1, status: 'normal' },
  { id: 'node-cai', countryCode: 'EG', city: 'Cairo', coordinates: { lat: 30.0444, lng: 31.2357 }, activeTwoWheelers: 620, activeThreeWheelers: 340, activeFourWheelers: 280, demandSurgeLevel: 1.5, averageHourlyEarningUSD: 7.6, status: 'surge_capped' },
  { id: 'node-tri', countryCode: 'LY', city: 'Tripoli', coordinates: { lat: 32.8872, lng: 13.1913 }, activeTwoWheelers: 145, activeThreeWheelers: 30, activeFourWheelers: 90, demandSurgeLevel: 1.2, averageHourlyEarningUSD: 8.1, status: 'normal' },
  { id: 'node-dak', countryCode: 'SN', city: 'Dakar', coordinates: { lat: 14.6928, lng: -17.4467 }, activeTwoWheelers: 390, activeThreeWheelers: 160, activeFourWheelers: 115, demandSurgeLevel: 1.45, averageHourlyEarningUSD: 8.3, status: 'high_demand' },
  { id: 'node-abi', countryCode: 'CI', city: 'Abidjan', coordinates: { lat: 5.36, lng: -4.0083 }, activeTwoWheelers: 420, activeThreeWheelers: 180, activeFourWheelers: 130, demandSurgeLevel: 1.35, averageHourlyEarningUSD: 8.5, status: 'normal' },
  { id: 'node-nbo', countryCode: 'KE', city: 'Nairobi', coordinates: { lat: -1.2921, lng: 36.8219 }, activeTwoWheelers: 510, activeThreeWheelers: 210, activeFourWheelers: 190, demandSurgeLevel: 1.5, averageHourlyEarningUSD: 8.7, status: 'surge_capped' },
  { id: 'node-ant', countryCode: 'MG', city: 'Antananarivo', coordinates: { lat: -18.8792, lng: 47.5079 }, activeTwoWheelers: 195, activeThreeWheelers: 115, activeFourWheelers: 45, demandSurgeLevel: 1.2, averageHourlyEarningUSD: 6.9, status: 'normal' },
  { id: 'node-jnb', countryCode: 'ZA', city: 'Johannesburg', coordinates: { lat: -26.2041, lng: 28.0473 }, activeTwoWheelers: 280, activeThreeWheelers: 0, activeFourWheelers: 240, demandSurgeLevel: 1.3, averageHourlyEarningUSD: 9.8, status: 'normal' },
  { id: 'node-ros', countryCode: 'DM', city: 'Roseau', coordinates: { lat: 15.3092, lng: -61.3794 }, activeTwoWheelers: 64, activeThreeWheelers: 18, activeFourWheelers: 22, demandSurgeLevel: 1.15, averageHourlyEarningUSD: 8.8, status: 'normal' },
  { id: 'node-mia', countryCode: 'US', city: 'Miami', coordinates: { lat: 25.7617, lng: -80.1918 }, activeTwoWheelers: 85, activeThreeWheelers: 0, activeFourWheelers: 310, demandSurgeLevel: 1.65, averageHourlyEarningUSD: 27.5, status: 'high_demand' },
  // Blocked Nodes for Compliance Auditing
  { id: 'node-bue-blocked', countryCode: 'AR', city: 'Buenos Aires', coordinates: { lat: -34.6037, lng: -58.3816 }, activeTwoWheelers: 0, activeThreeWheelers: 0, activeFourWheelers: 0, demandSurgeLevel: 0.0, averageHourlyEarningUSD: 0.0, status: 'excluded_blocked' },
  { id: 'node-mvd-blocked', countryCode: 'UY', city: 'Montevideo', coordinates: { lat: -34.9011, lng: -56.1645 }, activeTwoWheelers: 0, activeThreeWheelers: 0, activeFourWheelers: 0, demandSurgeLevel: 0.0, averageHourlyEarningUSD: 0.0, status: 'excluded_blocked' }
];

// ============================================================================
// 5. LIBERTÉ CASH (LBC) PURCHASING POWER GUARANTEE ENGINE
// ============================================================================
/**
 * 1 Liberty Cash is pegged to 1 USD ($1.00 USD) and equals 167 LBC tokens.
 *
 * For regions where $1 USD is below 1 unit of local currency (e.g. French Guiana EUR @ 0.92 EUR),
 * or where $1 USD converts to high local denominations (e.g. Haiti HTG @ 131.50, Guyana GYD @ 208.50,
 * Suriname SRD @ 35.60, Dominica XCD @ 2.70), 1 Liberty Cash guarantees a minimum equivalence of
 * 0.50 USD in local purchasing power floor.
 */
export function calculateLibertyCashPurchasingPowerGuarantee(
  countryCode: string,
  libertyCashAmount: number = 1.0
): RegionalPurchasingPowerGuarantee {
  const country = COUNTRY_LOOKUP[countryCode] || COUNTRY_LOOKUP['HT'];
  const exchangeRate = country.exchangeRateToUSD;
  const isBelowOneLocalUnit = exchangeRate < 1.0;
  const isHighDenomination = exchangeRate >= 2.0;

  // 1 Liberty Cash = $1.00 USD nominal peg
  const nominalUSD = libertyCashAmount * 1.0;
  const nominalLocal = nominalUSD * exchangeRate;

  // Minimum floor guarantee: 0.50 USD equivalence per 1 Liberty Cash
  const guaranteedFloorUSD = libertyCashAmount * 0.50;
  const guaranteedFloorLocal = guaranteedFloorUSD * exchangeRate;

  // In regions with economic disparity, 1 Liberty Cash guarantees at minimum 0.50 USD equivalence
  const effectiveLocalPurchasingPower = Math.max(nominalLocal, guaranteedFloorLocal);

  let rationale = '';
  if (isBelowOneLocalUnit) {
    rationale = `In ${country.name}, $1 USD converts to ${exchangeRate} ${country.currencyCode} (< 1.0 unit). 1 Liberty Cash guarantees a minimum floor of $0.50 USD in real local purchasing power, ensuring micro-transactions remain stable and accessible.`;
  } else if (isHighDenomination) {
    rationale = `In ${country.name}, $1 USD converts to ${exchangeRate} ${country.currencyCode} (high denomination). 1 Liberty Cash guarantees an unshakeable minimum floor of $0.50 USD purchasing power (${guaranteedFloorLocal.toFixed(2)} ${country.currencyCode}), shielding participants against currency depreciation and localized inflation.`;
  } else {
    rationale = `1 Liberty Cash maintains standard parity with guaranteed $0.50 USD baseline purchasing power.`;
  }

  return {
    regionCode: country.code,
    countryName: country.name,
    currencyCode: country.currencyCode,
    currencySymbol: country.currencySymbol,
    exchangeRateToUSD: exchangeRate,
    isBelowOneLocalUnit,
    isHighDenomination,
    libertyCashAmount,
    nominalLocalAmount: Math.round(nominalLocal * 100) / 100,
    guaranteedMinimumFloorUSD: guaranteedFloorUSD,
    effectiveLocalPurchasingPower: Math.round(effectiveLocalPurchasingPower * 100) / 100,
    purchasingPowerProtectionActive: isBelowOneLocalUnit || isHighDenomination,
    protectiveRationale: rationale
  };
}

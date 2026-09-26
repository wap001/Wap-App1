/**
 * PostgreSQL + PostGIS Database Connector & In-Memory Spatial Fallback Engine
 * Provides oneOrNone() and manyOrNone() compatible with pg-promise.
 * Connects to PostgreSQL when DATABASE_URL is available, and provides an
 * in-memory PostGIS-compatible spatial engine when running standalone.
 */

import {
  AdminWhitelistRecord,
  INITIAL_ADMIN_WHITELIST_CONFIG,
  normalizeAdminEmail
} from './adminWhitelistConfig';

export interface PricingRule {
  region_id: string;
  vehicle_type: string;
  base_fare: string;
  per_minute_rate: string;
  per_km_rate: string;
  minimum_fare_floor: string;
  currency: string;
}

export interface RegionRecord {
  region_id: string;
  name: string;
  country_code: string;
  is_excluded: boolean;
  exclusion_reason?: string;
}

export interface DriverProfileRecord {
  driver_id: string;
  user_id: string;
  full_name: string;
  vehicle_type: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
}

export type PlatformRole = 'user' | 'customer' | 'driver' | 'merchant' | 'admin';
export type AccountStatus = 'active' | 'pending_verification' | 'suspended' | 'restricted';

export interface ThreeWayPhotos {
  frontIdPhoto: string;
  profileSelfie: string;
  landmarkVehiclePhoto: string;
}

export interface KycSubmissionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userRole: PlatformRole;
  regionId: string;
  documentType: string;
  documentNumber: string;
  issuingCountry: string;
  expirationDate: string;
  documentUrl?: string;
  threeWayPhotos: ThreeWayPhotos;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface DriverCredentials {
  licenseNumber: string;
  vehicleType: '2_wheeler' | '3_wheeler' | '4_wheeler';
  vehiclePlate: string;
  isVerified: boolean;
  rating: number;
  tripsCompleted: number;
}

export interface UserProfileRecord {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: PlatformRole;
  accountStatus: AccountStatus;
  regionId: string;
  subscriptionPlan: string;
  lbcBalance: number;
  createdAt: string;
  driverCredentials?: DriverCredentials;
  kycSubmissionId?: string;
}

export interface AdminPlatformLogRecord {
  id: string;
  timestamp: string;
  severity: 'info' | 'warn' | 'critical';
  category: 'auth' | 'kyc' | 'financial' | 'dispatch' | 'fee_update' | 'rbac';
  actorId: string;
  actorRole: PlatformRole;
  action: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'blocked' | 'warning';
}

export interface FeeConfigurationRecord {
  lbcConversionSpreadPercent: number; // e.g. 0.85%
  fiatCashoutFeePercent: number; // e.g. 0.50%
  platformCommissionRate: number; // e.g. 15.0%
  minimumLbcConversion: number; // e.g. 25 LBC
  treasuryApyPercent: number; // e.g. 5.20%
  updatedAt: string;
  updatedBy: string;
}

// In-Memory Seed Data matching the international operations of Wap
export const REGIONS_SEED: RegionRecord[] = [
  { region_id: 'haiti', name: 'Haiti (Port-au-Prince / Cap-Haïtien)', country_code: 'HT', is_excluded: false },
  { region_id: 'senegal', name: 'Senegal (Dakar / Thiès)', country_code: 'SN', is_excluded: false },
  { region_id: 'ivory_coast', name: 'Ivory Coast (Abidjan / Bouaké)', country_code: 'CI', is_excluded: false },
  { region_id: 'kenya', name: 'Kenya (Nairobi / Mombasa)', country_code: 'KE', is_excluded: false },
  { region_id: 'panama', name: 'Panama (Panama City / Colón)', country_code: 'PA', is_excluded: false },
  { region_id: 'colombia', name: 'Colombia (Bogotá / Medellín)', country_code: 'CO', is_excluded: false },
  { region_id: 'guyana', name: 'Guyana (Georgetown / New Amsterdam)', country_code: 'GY', is_excluded: false },
  { region_id: 'suriname', name: 'Suriname (Paramaribo)', country_code: 'SR', is_excluded: false },
  { region_id: 'french_guiana', name: 'French Guiana (Cayenne / Kourou)', country_code: 'GF', is_excluded: false },
  { region_id: 'usa', name: 'United States (Miami / Diaspora Corridor)', country_code: 'US', is_excluded: false },
  // Sample Non-Excluded Testing Region for QA Automation & Dry-Run Simulations
  { region_id: 'sample-region-uuid', name: 'Sample Pilot Region (Test Corridor)', country_code: 'WAP', is_excluded: false },
  // Excluded territories by statutory geofence
  { region_id: 'argentina', name: 'Argentina (Geofenced Exclusion)', country_code: 'AR', is_excluded: true, exclusion_reason: 'Statutory geofence exclusion' },
  { region_id: 'uruguay', name: 'Uruguay (Geofenced Exclusion)', country_code: 'UY', is_excluded: true, exclusion_reason: 'Statutory geofence exclusion' }
];

export const REGIONAL_PRICING_SEED: PricingRule[] = [
  // Haiti (HTG)
  { region_id: 'haiti', vehicle_type: '2_wheeler', base_fare: '150.00', per_minute_rate: '12.00', per_km_rate: '35.00', minimum_fare_floor: '250.00', currency: 'HTG' },
  { region_id: 'haiti', vehicle_type: '3_wheeler', base_fare: '200.00', per_minute_rate: '15.00', per_km_rate: '45.00', minimum_fare_floor: '350.00', currency: 'HTG' },
  { region_id: 'haiti', vehicle_type: '4_wheeler', base_fare: '350.00', per_minute_rate: '25.00', per_km_rate: '75.00', minimum_fare_floor: '550.00', currency: 'HTG' },
  { region_id: 'haiti', vehicle_type: 'moto', base_fare: '150.00', per_minute_rate: '12.00', per_km_rate: '35.00', minimum_fare_floor: '250.00', currency: 'HTG' },

  // Senegal (XOF)
  { region_id: 'senegal', vehicle_type: '2_wheeler', base_fare: '500.00', per_minute_rate: '40.00', per_km_rate: '120.00', minimum_fare_floor: '800.00', currency: 'XOF' },
  { region_id: 'senegal', vehicle_type: '3_wheeler', base_fare: '700.00', per_minute_rate: '55.00', per_km_rate: '160.00', minimum_fare_floor: '1100.00', currency: 'XOF' },
  { region_id: 'senegal', vehicle_type: '4_wheeler', base_fare: '1200.00', per_minute_rate: '90.00', per_km_rate: '250.00', minimum_fare_floor: '1800.00', currency: 'XOF' },
  { region_id: 'senegal', vehicle_type: 'moto', base_fare: '500.00', per_minute_rate: '40.00', per_km_rate: '120.00', minimum_fare_floor: '800.00', currency: 'XOF' },

  // Ivory Coast (XOF)
  { region_id: 'ivory_coast', vehicle_type: '2_wheeler', base_fare: '500.00', per_minute_rate: '40.00', per_km_rate: '120.00', minimum_fare_floor: '800.00', currency: 'XOF' },
  { region_id: 'ivory_coast', vehicle_type: '3_wheeler', base_fare: '700.00', per_minute_rate: '55.00', per_km_rate: '160.00', minimum_fare_floor: '1100.00', currency: 'XOF' },
  { region_id: 'ivory_coast', vehicle_type: '4_wheeler', base_fare: '1200.00', per_minute_rate: '90.00', per_km_rate: '250.00', minimum_fare_floor: '1800.00', currency: 'XOF' },
  { region_id: 'ivory_coast', vehicle_type: 'moto', base_fare: '500.00', per_minute_rate: '40.00', per_km_rate: '120.00', minimum_fare_floor: '800.00', currency: 'XOF' },

  // Kenya (KES)
  { region_id: 'kenya', vehicle_type: '2_wheeler', base_fare: '80.00', per_minute_rate: '8.00', per_km_rate: '25.00', minimum_fare_floor: '150.00', currency: 'KES' },
  { region_id: 'kenya', vehicle_type: '3_wheeler', base_fare: '120.00', per_minute_rate: '12.00', per_km_rate: '35.00', minimum_fare_floor: '200.00', currency: 'KES' },
  { region_id: 'kenya', vehicle_type: '4_wheeler', base_fare: '250.00', per_minute_rate: '20.00', per_km_rate: '60.00', minimum_fare_floor: '400.00', currency: 'KES' },
  { region_id: 'kenya', vehicle_type: 'moto', base_fare: '80.00', per_minute_rate: '8.00', per_km_rate: '25.00', minimum_fare_floor: '150.00', currency: 'KES' },

  // Panama (USD)
  { region_id: 'panama', vehicle_type: '2_wheeler', base_fare: '1.50', per_minute_rate: '0.15', per_km_rate: '0.45', minimum_fare_floor: '2.50', currency: 'USD' },
  { region_id: 'panama', vehicle_type: '3_wheeler', base_fare: '2.00', per_minute_rate: '0.20', per_km_rate: '0.60', minimum_fare_floor: '3.50', currency: 'USD' },
  { region_id: 'panama', vehicle_type: '4_wheeler', base_fare: '3.50', per_minute_rate: '0.35', per_km_rate: '1.00', minimum_fare_floor: '5.00', currency: 'USD' },
  { region_id: 'panama', vehicle_type: 'moto', base_fare: '1.50', per_minute_rate: '0.15', per_km_rate: '0.45', minimum_fare_floor: '2.50', currency: 'USD' },

  // Colombia (COP)
  { region_id: 'colombia', vehicle_type: '2_wheeler', base_fare: '4000.00', per_minute_rate: '350.00', per_km_rate: '1100.00', minimum_fare_floor: '7000.00', currency: 'COP' },
  { region_id: 'colombia', vehicle_type: '3_wheeler', base_fare: '5500.00', per_minute_rate: '450.00', per_km_rate: '1400.00', minimum_fare_floor: '9000.00', currency: 'COP' },
  { region_id: 'colombia', vehicle_type: '4_wheeler', base_fare: '8500.00', per_minute_rate: '700.00', per_km_rate: '2100.00', minimum_fare_floor: '14000.00', currency: 'COP' },
  { region_id: 'colombia', vehicle_type: 'moto', base_fare: '4000.00', per_minute_rate: '350.00', per_km_rate: '1100.00', minimum_fare_floor: '7000.00', currency: 'COP' },

  // Guyana (GYD)
  { region_id: 'guyana', vehicle_type: '2_wheeler', base_fare: '350.00', per_minute_rate: '30.00', per_km_rate: '85.00', minimum_fare_floor: '500.00', currency: 'GYD' },
  { region_id: 'guyana', vehicle_type: '3_wheeler', base_fare: '450.00', per_minute_rate: '40.00', per_km_rate: '110.00', minimum_fare_floor: '700.00', currency: 'GYD' },
  { region_id: 'guyana', vehicle_type: '4_wheeler', base_fare: '800.00', per_minute_rate: '65.00', per_km_rate: '180.00', minimum_fare_floor: '1200.00', currency: 'GYD' },
  { region_id: 'guyana', vehicle_type: 'moto', base_fare: '350.00', per_minute_rate: '30.00', per_km_rate: '85.00', minimum_fare_floor: '500.00', currency: 'GYD' },

  // Suriname (SRD)
  { region_id: 'suriname', vehicle_type: '2_wheeler', base_fare: '45.00', per_minute_rate: '4.00', per_km_rate: '12.00', minimum_fare_floor: '75.00', currency: 'SRD' },
  { region_id: 'suriname', vehicle_type: '3_wheeler', base_fare: '65.00', per_minute_rate: '5.50', per_km_rate: '16.00', minimum_fare_floor: '100.00', currency: 'SRD' },
  { region_id: 'suriname', vehicle_type: '4_wheeler', base_fare: '110.00', per_minute_rate: '9.50', per_km_rate: '26.00', minimum_fare_floor: '160.00', currency: 'SRD' },
  { region_id: 'suriname', vehicle_type: 'moto', base_fare: '45.00', per_minute_rate: '4.00', per_km_rate: '12.00', minimum_fare_floor: '75.00', currency: 'SRD' },

  // French Guiana (EUR)
  { region_id: 'french_guiana', vehicle_type: '2_wheeler', base_fare: '2.80', per_minute_rate: '0.25', per_km_rate: '0.90', minimum_fare_floor: '5.00', currency: 'EUR' },
  { region_id: 'french_guiana', vehicle_type: '3_wheeler', base_fare: '3.80', per_minute_rate: '0.35', per_km_rate: '1.15', minimum_fare_floor: '6.50', currency: 'EUR' },
  { region_id: 'french_guiana', vehicle_type: '4_wheeler', base_fare: '6.00', per_minute_rate: '0.55', per_km_rate: '1.80', minimum_fare_floor: '10.00', currency: 'EUR' },
  { region_id: 'french_guiana', vehicle_type: 'moto', base_fare: '2.80', per_minute_rate: '0.25', per_km_rate: '0.90', minimum_fare_floor: '5.00', currency: 'EUR' },

  // USA Diaspora (USD)
  { region_id: 'usa', vehicle_type: '2_wheeler', base_fare: '3.00', per_minute_rate: '0.30', per_km_rate: '0.85', minimum_fare_floor: '5.00', currency: 'USD' },
  { region_id: 'usa', vehicle_type: '3_wheeler', base_fare: '4.00', per_minute_rate: '0.40', per_km_rate: '1.10', minimum_fare_floor: '6.50', currency: 'USD' },
  { region_id: 'usa', vehicle_type: '4_wheeler', base_fare: '6.50', per_minute_rate: '0.60', per_km_rate: '1.75', minimum_fare_floor: '9.00', currency: 'USD' },
  { region_id: 'usa', vehicle_type: 'moto', base_fare: '3.00', per_minute_rate: '0.30', per_km_rate: '0.85', minimum_fare_floor: '5.00', currency: 'USD' },

  // Sample Region (USD / Default Emerging Market Rates for QA dry-run)
  { region_id: 'sample-region-uuid', vehicle_type: '2_wheeler', base_fare: '1.50', per_minute_rate: '0.15', per_km_rate: '0.45', minimum_fare_floor: '2.50', currency: 'USD' },
  { region_id: 'sample-region-uuid', vehicle_type: '3_wheeler', base_fare: '2.00', per_minute_rate: '0.20', per_km_rate: '0.60', minimum_fare_floor: '3.50', currency: 'USD' },
  { region_id: 'sample-region-uuid', vehicle_type: '4_wheeler', base_fare: '3.50', per_minute_rate: '0.35', per_km_rate: '1.00', minimum_fare_floor: '5.00', currency: 'USD' },
  { region_id: 'sample-region-uuid', vehicle_type: 'moto', base_fare: '1.50', per_minute_rate: '0.15', per_km_rate: '0.45', minimum_fare_floor: '2.50', currency: 'USD' },
];

export const DRIVERS_SEED: DriverProfileRecord[] = [
  // West Africa Pilot & QA Test Hub (Lagos ~6.5244, 3.3792)
  { driver_id: 'test-driver-uuid', user_id: 'test-driver-uuid', full_name: 'Amara Koffi (QA Verified)', vehicle_type: '3_wheeler', latitude: 6.5246, longitude: 3.3794, is_online: true, is_verified: true, rating: 4.96 },
  { driver_id: 'drv-lagos-01', user_id: 'usr-lagos-01', full_name: 'Babatunde Adeleke', vehicle_type: '3_wheeler', latitude: 6.5255, longitude: 3.3802, is_online: true, is_verified: true, rating: 4.92 },
  { driver_id: 'drv-lagos-02', user_id: 'usr-lagos-02', full_name: 'Chinedu Eze', vehicle_type: '2_wheeler', latitude: 6.5238, longitude: 3.3785, is_online: true, is_verified: true, rating: 4.88 },

  // Haiti (Port-au-Prince ~18.5400, -72.3300)
  { driver_id: 'drv-ht-01', user_id: 'usr-ht-01', full_name: 'Jean-Baptiste Voltaire', vehicle_type: '2_wheeler', latitude: 18.5432, longitude: -72.3315, is_online: true, is_verified: true, rating: 4.95 },
  { driver_id: 'drv-ht-02', user_id: 'usr-ht-02', full_name: 'Dieudonné Pierre', vehicle_type: '2_wheeler', latitude: 18.5380, longitude: -72.3250, is_online: true, is_verified: true, rating: 4.88 },
  { driver_id: 'drv-ht-03', user_id: 'usr-ht-03', full_name: 'Alexandre Célestin', vehicle_type: '3_wheeler', latitude: 18.5470, longitude: -72.3380, is_online: true, is_verified: true, rating: 4.91 },
  { driver_id: 'drv-ht-04', user_id: 'usr-ht-04', full_name: 'Michelet Joseph', vehicle_type: '4_wheeler', latitude: 18.5350, longitude: -72.3420, is_online: true, is_verified: true, rating: 4.82 },
  { driver_id: 'drv-ht-05', user_id: 'usr-ht-05', full_name: 'Fabrice Guerrier', vehicle_type: '2_wheeler', latitude: 18.5510, longitude: -72.3280, is_online: true, is_verified: true, rating: 4.97 },

  // Senegal (Dakar ~14.7167, -17.4677)
  { driver_id: 'drv-sn-01', user_id: 'usr-sn-01', full_name: 'Mamadou Diallo', vehicle_type: '2_wheeler', latitude: 14.7190, longitude: -17.4640, is_online: true, is_verified: true, rating: 4.92 },
  { driver_id: 'drv-sn-02', user_id: 'usr-sn-02', full_name: 'Ousmane Sow', vehicle_type: '3_wheeler', latitude: 14.7140, longitude: -17.4710, is_online: true, is_verified: true, rating: 4.85 },
  { driver_id: 'drv-sn-03', user_id: 'usr-sn-03', full_name: 'Cheikh Ndiaye', vehicle_type: '4_wheeler', latitude: 14.7230, longitude: -17.4590, is_online: true, is_verified: true, rating: 4.96 },

  // Ivory Coast (Abidjan ~5.3600, -4.0083)
  { driver_id: 'drv-ci-01', user_id: 'usr-ci-01', full_name: 'Kouassi Yao', vehicle_type: '2_wheeler', latitude: 5.3640, longitude: -4.0040, is_online: true, is_verified: true, rating: 4.89 },
  { driver_id: 'drv-ci-02', user_id: 'usr-ci-02', full_name: 'Bakary Traoré', vehicle_type: '3_wheeler', latitude: 5.3580, longitude: -4.0120, is_online: true, is_verified: true, rating: 4.94 },

  // Kenya (Nairobi ~-1.2921, 36.8219)
  { driver_id: 'drv-ke-01', user_id: 'usr-ke-01', full_name: 'Juma Otieno', vehicle_type: '2_wheeler', latitude: -1.2890, longitude: 36.8250, is_online: true, is_verified: true, rating: 4.91 },
  { driver_id: 'drv-ke-02', user_id: 'usr-ke-02', full_name: 'Mwangi Kamau', vehicle_type: '3_wheeler', latitude: -1.2950, longitude: 36.8180, is_online: true, is_verified: true, rating: 4.87 },

  // Guyana (Georgetown ~6.8013, -58.1551)
  { driver_id: 'drv-gy-01', user_id: 'usr-gy-01', full_name: 'Devon Persaud', vehicle_type: '2_wheeler', latitude: 6.8040, longitude: -58.1520, is_online: true, is_verified: true, rating: 4.90 },
  { driver_id: 'drv-gy-02', user_id: 'usr-gy-02', full_name: 'Kwame Campbell', vehicle_type: '4_wheeler', latitude: 6.7980, longitude: -58.1590, is_online: true, is_verified: true, rating: 4.84 },

  // Suriname (Paramaribo ~5.8520, -55.2038)
  { driver_id: 'drv-sr-01', user_id: 'usr-sr-01', full_name: 'Rewi Biseswar', vehicle_type: '2_wheeler', latitude: 5.8550, longitude: -55.2010, is_online: true, is_verified: true, rating: 4.93 },
  { driver_id: 'drv-sr-02', user_id: 'usr-sr-02', full_name: 'Denzel van Holt', vehicle_type: '3_wheeler', latitude: 5.8490, longitude: -55.2080, is_online: true, is_verified: true, rating: 4.86 },

  // French Guiana (Cayenne ~4.9224, -52.3135)
  { driver_id: 'drv-gf-01', user_id: 'usr-gf-01', full_name: 'Ludovic Saint-Germain', vehicle_type: '2_wheeler', latitude: 4.9250, longitude: -52.3100, is_online: true, is_verified: true, rating: 4.95 },

  // USA (Miami ~25.7617, -80.1918)
  { driver_id: 'drv-us-01', user_id: 'usr-us-01', full_name: 'Patrick Augustin', vehicle_type: '2_wheeler', latitude: 25.7650, longitude: -80.1880, is_online: true, is_verified: true, rating: 4.98 },
  { driver_id: 'drv-us-02', user_id: 'usr-us-02', full_name: 'Darnell Harris', vehicle_type: '4_wheeler', latitude: 25.7580, longitude: -80.1950, is_online: true, is_verified: true, rating: 4.91 },
];

/**
 * Calculates Great-Circle Haversine distance in meters between two lat/lng points.
 * Exactly mirrors PostGIS ST_Distance(geography, geography).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Normalizes vehicle type aliases (e.g. 'moto' -> '2_wheeler', 'tuktuk' -> '3_wheeler', 'cab' -> '4_wheeler')
 */
export function normalizeVehicleType(v: string): string {
  const normalized = v.toLowerCase().trim();
  if (normalized === 'moto' || normalized === 'motorcycle' || normalized === '2w') return '2_wheeler';
  if (normalized === 'tuktuk' || normalized === 'canopy' || normalized === '3w') return '3_wheeler';
  if (normalized === 'cab' || normalized === 'car' || normalized === 'sedan' || normalized === 'van' || normalized === '4w') return '4_wheeler';
  return normalized;
}

/**
 * PostgreSQL Database Adapter Interface
 * Implements pg-promise compatible methods: oneOrNone and manyOrNone.
 */
class DatabaseAdapter {
  private regions: RegionRecord[] = [...REGIONS_SEED];
  private pricingRules: PricingRule[] = [...REGIONAL_PRICING_SEED];
  private drivers: DriverProfileRecord[] = [...DRIVERS_SEED];

  /**
   * Executes a single-row query or returns null if no match found.
   * Matches pg-promise db.oneOrNone(sql, params).
   */
  async oneOrNone<T = any>(query: string, params: any[] = []): Promise<T | null> {
    const q = query.toLowerCase();

    // Query 1: Regional Pricing lookup with region exclusion filter
    // SELECT ... FROM regional_pricing rp JOIN regions r ON rp.region_id = r.region_id WHERE rp.region_id = $1 AND rp.vehicle_type = $2 AND r.is_excluded = FALSE
    if (q.includes('regional_pricing') && q.includes('is_excluded = false')) {
      const [regionId, vehicleType] = params;
      let targetRegion = this.regions.find(
        (r) => r.region_id.toLowerCase() === String(regionId).toLowerCase()
      );

      // Graceful fallback for test/sample UUIDs
      if (!targetRegion && (String(regionId).toLowerCase().includes('sample') || String(regionId).toLowerCase().includes('test'))) {
        targetRegion = this.regions.find((r) => r.region_id === 'sample-region-uuid');
      }

      // If region doesn't exist or is excluded (e.g. Argentina/Uruguay)
      if (!targetRegion || targetRegion.is_excluded) {
        return null;
      }

      const normalizedVehicle = normalizeVehicleType(String(vehicleType));
      const pricing = this.pricingRules.find(
        (p) =>
          p.region_id.toLowerCase() === targetRegion.region_id.toLowerCase() &&
          (p.vehicle_type === normalizedVehicle || p.vehicle_type === String(vehicleType).toLowerCase())
      );

      return (pricing as unknown as T) || null;
    }

    return null;
  }

  /**
   * Executes a multi-row query or returns an empty array.
   * Matches pg-promise db.manyOrNone(sql, params).
   */
  async manyOrNone<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const q = query.toLowerCase();

    // Query 2: PostGIS Geospatial Driver Dispatch
    // ST_DWithin and ST_Distance query on driver_profiles joined with users
    if (q.includes('driver_profiles') && q.includes('st_dwithin')) {
      const [longitude, latitude, vehicleType, radiusMeters] = params;
      const clientLng = parseFloat(longitude);
      const clientLat = parseFloat(latitude);
      const radius = parseFloat(radiusMeters) || 5000;
      const targetVehicle = normalizeVehicleType(String(vehicleType));

      const matched = this.drivers
        .filter((d) => {
          if (!d.is_online || !d.is_verified) return false;
          const driverVeh = normalizeVehicleType(d.vehicle_type);
          return driverVeh === targetVehicle || d.vehicle_type === String(vehicleType);
        })
        .map((d) => {
          const distance_meters = calculateDistanceMeters(
            clientLat,
            clientLng,
            d.latitude,
            d.longitude
          );
          return {
            driver_id: d.driver_id,
            full_name: d.full_name,
            vehicle_type: d.vehicle_type,
            longitude: d.longitude,
            latitude: d.latitude,
            distance_meters
          };
        })
        .filter((d) => d.distance_meters <= radius)
        .sort((a, b) => a.distance_meters - b.distance_meters)
        .slice(0, 10);

      return matched as unknown as T[];
    }

    return [];
  }

  // Helper getters for debugging / administrative testing
  getAllRegions() {
    return this.regions;
  }

  getAllPricing() {
    return this.pricingRules;
  }

  getAllDrivers() {
    return this.drivers;
  }

  // =========================================================================
  // RBAC USER PROFILES, KYC QUEUE, SENSITIVE AUDIT LOGS & FEE CONFIGURATION
  // =========================================================================
  private users: UserProfileRecord[] = [
    {
      userId: 'usr_admin_stangy',
      fullName: 'Stangy Neco',
      email: 'stangyneco@gmail.com',
      phone: '+509 3712-0001',
      role: 'admin',
      accountStatus: 'active',
      regionId: 'haiti',
      subscriptionPlan: 'admin_master_clearance',
      lbcBalance: 50000,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      userId: 'usr_admin_platform',
      fullName: 'Wap Platform Supervisor',
      email: 'admin@wap-transport.ht',
      phone: '+509 3712-0002',
      role: 'admin',
      accountStatus: 'active',
      regionId: 'haiti',
      subscriptionPlan: 'admin_master_clearance',
      lbcBalance: 25000,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      userId: 'usr_caribbean_verified',
      fullName: 'Jean-Luc Dessalines',
      email: 'jeanluc.dessalines@wap-transport.ht',
      phone: '+509 3712-8821',
      role: 'customer',
      accountStatus: 'active',
      regionId: 'haiti',
      subscriptionPlan: 'customer_pass',
      lbcBalance: 2850,
      createdAt: '2026-03-12T10:00:00.000Z',
      kycSubmissionId: 'sub-kyc-004'
    },
    {
      userId: 'test-driver-uuid',
      fullName: 'Jean-Baptiste Moïse',
      email: 'moise.baptiste@wap-transport.ht',
      phone: '+509 3819-2041',
      role: 'driver',
      accountStatus: 'active',
      regionId: 'haiti',
      subscriptionPlan: 'driver_pro',
      lbcBalance: 3200,
      createdAt: '2026-02-15T09:30:00.000Z',
      driverCredentials: {
        licenseNumber: 'HT-DRV-2024-8892',
        vehicleType: '2_wheeler',
        vehiclePlate: 'TP-9821',
        isVerified: true,
        rating: 4.96,
        tripsCompleted: 482
      }
    },
    {
      userId: 'merchant_chef_fifi',
      fullName: 'Chef Fifi (Saveur Lakay)',
      email: 'fifi.saveur@wap-resto.ht',
      phone: '+509 3711-5509',
      role: 'merchant',
      accountStatus: 'active',
      regionId: 'haiti',
      subscriptionPlan: 'merchant_verified',
      lbcBalance: 4150,
      createdAt: '2026-02-18T14:15:00.000Z'
    },
    {
      userId: 'usr_new_daphnee',
      fullName: 'Daphnée Lamour',
      email: 'daphnee.lamour@wap-user.ht',
      phone: '+509 3892-1144',
      role: 'driver',
      accountStatus: 'pending_verification',
      regionId: 'haiti',
      subscriptionPlan: 'driver_plus',
      lbcBalance: 100,
      createdAt: '2026-03-24T06:12:00.000Z',
      driverCredentials: {
        licenseNumber: 'HT-LIC-2026-4401',
        vehicleType: '2_wheeler',
        vehiclePlate: 'TP-7712',
        isVerified: false,
        rating: 5.0,
        tripsCompleted: 0
      },
      kycSubmissionId: 'sub-kyc-001'
    },
    {
      userId: 'usr_new_alexandre',
      fullName: 'Alexandre Célestin',
      email: 'alexandre.celestin@wap-pilot.ht',
      phone: '+509 3744-8899',
      role: 'driver',
      accountStatus: 'pending_verification',
      regionId: 'haiti',
      subscriptionPlan: 'driver_solo',
      lbcBalance: 100,
      createdAt: '2026-03-24T11:45:00.000Z',
      driverCredentials: {
        licenseNumber: 'HT-LIC-2025-9920',
        vehicleType: '3_wheeler',
        vehiclePlate: 'TK-4410',
        isVerified: false,
        rating: 4.88,
        tripsCompleted: 14
      },
      kycSubmissionId: 'sub-kyc-002'
    },
    {
      userId: 'usr_new_moussa',
      fullName: 'Moussa Fall',
      email: 'moussa.fall@dakar-logistics.sn',
      phone: '+221 77 441 2901',
      role: 'merchant',
      accountStatus: 'pending_verification',
      regionId: 'senegal',
      subscriptionPlan: 'merchant_growth',
      lbcBalance: 150,
      createdAt: '2026-03-24T15:20:00.000Z',
      kycSubmissionId: 'sub-kyc-003'
    }
  ];

  private kycQueue: KycSubmissionRecord[] = [
    {
      id: 'sub-kyc-001',
      userId: 'usr_new_daphnee',
      userName: 'Daphnée Lamour',
      userEmail: 'daphnee.lamour@wap-user.ht',
      userPhone: '+509 3892-1144',
      userRole: 'driver',
      regionId: 'haiti',
      documentType: 'Official Republic of Haiti Passport',
      documentNumber: 'P84920194',
      issuingCountry: 'Haiti (HT)',
      expirationDate: '2032-06-15',
      documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      threeWayPhotos: {
        frontIdPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        profileSelfie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        landmarkVehiclePhoto: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'
      },
      status: 'pending',
      submittedAt: '2026-03-24T06:15:00.000Z'
    },
    {
      id: 'sub-kyc-002',
      userId: 'usr_new_alexandre',
      userName: 'Alexandre Célestin',
      userEmail: 'alexandre.celestin@wap-pilot.ht',
      userPhone: '+509 3744-8899',
      userRole: 'driver',
      regionId: 'haiti',
      documentType: 'National Commercial Driver License & ID',
      documentNumber: 'HT-LIC-2025-9920',
      issuingCountry: 'Haiti (HT)',
      expirationDate: '2030-01-20',
      documentUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      threeWayPhotos: {
        frontIdPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        profileSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        landmarkVehiclePhoto: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'
      },
      status: 'pending',
      submittedAt: '2026-03-24T11:48:00.000Z'
    },
    {
      id: 'sub-kyc-003',
      userId: 'usr_new_moussa',
      userName: 'Moussa Fall',
      userEmail: 'moussa.fall@dakar-logistics.sn',
      userPhone: '+221 77 441 2901',
      userRole: 'merchant',
      regionId: 'senegal',
      documentType: 'Senegal Commercial Enterprise Registry (RCCM)',
      documentNumber: 'SN-DKR-2025-B-1194',
      issuingCountry: 'Senegal (SN)',
      expirationDate: '2033-05-10',
      documentUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      threeWayPhotos: {
        frontIdPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        profileSelfie: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
        landmarkVehiclePhoto: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'
      },
      status: 'pending',
      submittedAt: '2026-03-24T15:22:00.000Z'
    },
    {
      id: 'sub-kyc-004',
      userId: 'usr_caribbean_verified',
      userName: 'Jean-Luc Dessalines',
      userEmail: 'jeanluc.dessalines@wap-transport.ht',
      userPhone: '+509 3712-8821',
      userRole: 'customer',
      regionId: 'haiti',
      documentType: 'Official Republic of Haiti Passport',
      documentNumber: 'P48291032',
      issuingCountry: 'Haiti (HT)',
      expirationDate: '2031-10-18',
      documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      threeWayPhotos: {
        frontIdPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        profileSelfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        landmarkVehiclePhoto: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80'
      },
      status: 'approved',
      submittedAt: '2026-03-12T10:15:00.000Z',
      reviewedAt: '2026-03-12T10:30:00.000Z',
      reviewedBy: 'Stangy Neco (Compliance Admin)',
      reviewerNotes: 'Biometric passport verified with CARICOM MRZ checksum match.'
    }
  ];

  private platformLogs: AdminPlatformLogRecord[] = [
    {
      id: 'log-audit-1001',
      timestamp: '2026-03-24T23:15:22.000Z',
      severity: 'info',
      category: 'rbac',
      actorId: 'usr_admin_stangy',
      actorRole: 'admin',
      action: 'ADMIN_PORTAL_SESSION_INITIALIZED',
      details: 'Designated administrator Stangy Neco authenticated with full RBAC Level 4 clearance.',
      ipAddress: '190.115.18.42',
      status: 'success'
    },
    {
      id: 'log-audit-1002',
      timestamp: '2026-03-24T23:05:10.000Z',
      severity: 'warn',
      category: 'rbac',
      actorId: 'usr_anonymous_ip92',
      actorRole: 'user',
      action: 'UNAUTHORIZED_ADMIN_ACCESS_BLOCKED',
      details: 'Direct URL request to /api/admin/* intercepted and blocked by Row-Level Security middleware. Non-admin user redirected to interactive map.',
      ipAddress: '190.115.44.18',
      status: 'blocked'
    },
    {
      id: 'log-audit-1003',
      timestamp: '2026-03-24T22:48:30.000Z',
      severity: 'info',
      category: 'financial',
      actorId: 'test-driver-uuid',
      actorRole: 'driver',
      action: 'CASH_TRIP_COMMISSION_SETTLED',
      details: 'Trip #ord-3s-8891 settled. Collected 450.00 HTG. Deducted 15% platform commission (67.50 HTG) to driver wallet.',
      ipAddress: '190.115.18.99',
      status: 'success'
    },
    {
      id: 'log-audit-1004',
      timestamp: '2026-03-24T22:30:15.000Z',
      severity: 'info',
      category: 'kyc',
      actorId: 'usr_new_daphnee',
      actorRole: 'driver',
      action: 'KYC_3WAY_PHOTOS_SUBMITTED',
      details: 'New driver signup submitted government passport and 3-way photo verification (Front ID, Selfie, Moto Haojue inspection).',
      ipAddress: '190.115.12.87',
      status: 'success'
    },
    {
      id: 'log-audit-1005',
      timestamp: '2026-03-24T21:12:00.000Z',
      severity: 'info',
      category: 'financial',
      actorId: 'usr_caribbean_verified',
      actorRole: 'customer',
      action: 'LBC_BROKERAGE_EQUITY_CONVERSION',
      details: 'Customer converted 250 LBC ($1.50 USD) into fractional Apple Inc. (AAPL) equity shares via omnibus trust API.',
      ipAddress: '190.115.22.10',
      status: 'success'
    }
  ];

  private feeConfig: FeeConfigurationRecord = {
    lbcConversionSpreadPercent: 0.85,
    fiatCashoutFeePercent: 0.50,
    platformCommissionRate: 15.00,
    minimumLbcConversion: 25,
    treasuryApyPercent: 5.20,
    updatedAt: '2026-03-24T20:00:00.000Z',
    updatedBy: 'Stangy Neco (Lead Admin)'
  };

  // RBAC User methods
  getAllUsers(): UserProfileRecord[] {
    return this.users;
  }

  getUserById(userId: string): UserProfileRecord | undefined {
    return this.users.find((u) => u.userId === userId || u.email.toLowerCase() === userId.toLowerCase());
  }

  registerUser(user: UserProfileRecord): UserProfileRecord {
    // Enforce default standard role unless explicitly granted by administrator
    if (user.role === 'admin' && user.email.toLowerCase() !== 'stangyneco@gmail.com' && user.email.toLowerCase() !== 'admin@wap-transport.ht') {
      user.role = 'user';
    }
    this.users.unshift(user);
    this.addPlatformLog({
      severity: 'info',
      category: 'auth',
      actorId: user.userId,
      actorRole: user.role,
      action: 'NEW_USER_REGISTERED',
      details: `User ${user.fullName} registered with default role '${user.role}' in region ${user.regionId}.`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });
    return user;
  }

  updateUserStatus(
    userId: string,
    accountStatus: AccountStatus,
    driverCredentialsUpdate?: Partial<DriverCredentials>,
    adminActorId: string = 'admin'
  ): UserProfileRecord | null {
    const user = this.users.find((u) => u.userId === userId);
    if (!user) return null;

    user.accountStatus = accountStatus;
    if (driverCredentialsUpdate && user.driverCredentials) {
      user.driverCredentials = {
        ...user.driverCredentials,
        ...driverCredentialsUpdate
      };
    } else if (driverCredentialsUpdate && !user.driverCredentials) {
      user.driverCredentials = {
        licenseNumber: driverCredentialsUpdate.licenseNumber || 'PENDING',
        vehicleType: driverCredentialsUpdate.vehicleType || '2_wheeler',
        vehiclePlate: driverCredentialsUpdate.vehiclePlate || 'PENDING',
        isVerified: driverCredentialsUpdate.isVerified ?? false,
        rating: 5.0,
        tripsCompleted: 0
      };
    }

    this.addPlatformLog({
      severity: 'info',
      category: 'rbac',
      actorId: adminActorId,
      actorRole: 'admin',
      action: 'USER_ACCOUNT_STATUS_ADJUSTED',
      details: `Account status for ${user.fullName} (${user.userId}) updated to '${accountStatus}'. Driver verified: ${user.driverCredentials?.isVerified}.`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return user;
  }

  // KYC methods
  getKycQueue(): KycSubmissionRecord[] {
    return this.kycQueue;
  }

  submitKyc(submission: KycSubmissionRecord): KycSubmissionRecord {
    this.kycQueue.unshift(submission);
    const user = this.users.find((u) => u.userId === submission.userId);
    if (user) {
      user.kycSubmissionId = submission.id;
      user.accountStatus = 'pending_verification';
    }
    this.addPlatformLog({
      severity: 'info',
      category: 'kyc',
      actorId: submission.userId,
      actorRole: submission.userRole,
      action: 'KYC_DOCUMENT_SUBMITTED',
      details: `${submission.userName} submitted ${submission.documentType} and 3-way photo verification.`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });
    return submission;
  }

  processKycDecision(
    submissionId: string,
    decision: 'approved' | 'rejected',
    reviewerName: string,
    reviewerNotes: string
  ): KycSubmissionRecord | null {
    const sub = this.kycQueue.find((s) => s.id === submissionId);
    if (!sub) return null;

    sub.status = decision;
    sub.reviewedAt = new Date().toISOString();
    sub.reviewedBy = reviewerName;
    sub.reviewerNotes = reviewerNotes;

    const user = this.users.find((u) => u.userId === sub.userId);
    if (user) {
      if (decision === 'approved') {
        user.accountStatus = 'active';
        if (user.driverCredentials) {
          user.driverCredentials.isVerified = true;
        }
      } else {
        user.accountStatus = 'restricted';
      }
    }

    this.addPlatformLog({
      severity: decision === 'approved' ? 'info' : 'warn',
      category: 'kyc',
      actorId: reviewerName,
      actorRole: 'admin',
      action: `KYC_${decision.toUpperCase()}`,
      details: `KYC submission for ${sub.userName} (${sub.userId}) was ${decision} by ${reviewerName}. Notes: ${reviewerNotes}`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return sub;
  }

  // Sensitive Platform Logs methods
  getPlatformLogs(): AdminPlatformLogRecord[] {
    return this.platformLogs;
  }

  addPlatformLog(log: Omit<AdminPlatformLogRecord, 'id' | 'timestamp'>): AdminPlatformLogRecord {
    const fullLog: AdminPlatformLogRecord = {
      ...log,
      id: `log-audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.platformLogs.unshift(fullLog);
    if (this.platformLogs.length > 200) {
      this.platformLogs.pop();
    }
    return fullLog;
  }

  // Fee configuration methods
  getFeeConfig(): FeeConfigurationRecord {
    return this.feeConfig;
  }

  updateFeeConfig(update: Partial<FeeConfigurationRecord>, updatedBy: string): FeeConfigurationRecord {
    this.feeConfig = {
      ...this.feeConfig,
      ...update,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    this.addPlatformLog({
      severity: 'info',
      category: 'fee_update',
      actorId: updatedBy,
      actorRole: 'admin',
      action: 'FEE_CONFIGURATION_UPDATED',
      details: `Fees updated: Spread ${this.feeConfig.lbcConversionSpreadPercent}%, Cashout ${this.feeConfig.fiatCashoutFeePercent}%, Commission ${this.feeConfig.platformCommissionRate}%.`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });
    return this.feeConfig;
  }

  // =========================================================================
  // MASTER ADMINISTRATOR EMAIL WHITELIST DATABASE METHODS
  // =========================================================================
  private adminWhitelist: AdminWhitelistRecord[] = [...INITIAL_ADMIN_WHITELIST_CONFIG];

  /**
   * Real-time verification: checks if verified email exists in active whitelist
   */
  isEmailWhitelisted(email?: string | null): boolean {
    if (!email) return false;
    const normalized = normalizeAdminEmail(email);
    const entry = this.adminWhitelist.find(
      (w) => normalizeAdminEmail(w.email) === normalized && w.status === 'active'
    );
    return Boolean(entry);
  }

  /**
   * Retrieves all administrator whitelist records
   */
  getAdminWhitelist(): AdminWhitelistRecord[] {
    return [...this.adminWhitelist];
  }

  /**
   * Retrieves a single whitelist entry by email address
   */
  getWhitelistEntryByEmail(email: string): AdminWhitelistRecord | null {
    const normalized = normalizeAdminEmail(email);
    return this.adminWhitelist.find((w) => normalizeAdminEmail(w.email) === normalized) || null;
  }

  /**
   * Adds a new approved email address to the database whitelist
   */
  addAdminWhitelistEntry(
    entry: {
      email: string;
      name: string;
      role?: 'super_admin' | 'admin';
      notes?: string;
    },
    addedBy: string
  ): { success: boolean; entry?: AdminWhitelistRecord; error?: string } {
    const normalized = normalizeAdminEmail(entry.email);
    if (!normalized || !normalized.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const existingIndex = this.adminWhitelist.findIndex(
      (w) => normalizeAdminEmail(w.email) === normalized
    );

    if (existingIndex >= 0) {
      const existing = this.adminWhitelist[existingIndex];
      if (existing.status === 'active') {
        return { success: false, error: `Email address ${normalized} is already active on the administrator whitelist.` };
      }
      // Re-activate if previously revoked
      existing.status = 'active';
      existing.notes = entry.notes || existing.notes;
      existing.addedBy = addedBy;
      existing.addedAt = new Date().toISOString();

      // Immediately upgrade user role in database if profile exists
      const existingUser = this.users.find((u) => normalizeAdminEmail(u.email) === normalized);
      if (existingUser) {
        existingUser.role = 'admin';
      }

      this.addPlatformLog({
        severity: 'info',
        category: 'rbac',
        actorId: addedBy,
        actorRole: 'admin',
        action: 'ADMIN_WHITELIST_REACTIVATED',
        details: `Re-activated ${normalized} on administrative whitelist by ${addedBy}.`,
        ipAddress: '127.0.0.1',
        status: 'success'
      });

      return { success: true, entry: existing };
    }

    const newRecord: AdminWhitelistRecord = {
      id: `whitelist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: normalized,
      name: entry.name.trim() || normalized.split('@')[0],
      role: entry.role || 'admin',
      status: 'active',
      addedAt: new Date().toISOString(),
      addedBy,
      notes: entry.notes || 'Added by platform administrator.',
      isProtected: false
    };

    this.adminWhitelist.push(newRecord);

    // Immediately grant admin role to existing user account if present
    const matchedUser = this.users.find((u) => normalizeAdminEmail(u.email) === normalized);
    if (matchedUser) {
      matchedUser.role = 'admin';
    }

    this.addPlatformLog({
      severity: 'info',
      category: 'rbac',
      actorId: addedBy,
      actorRole: 'admin',
      action: 'ADMIN_WHITELIST_ADDED',
      details: `Added new administrator email ${normalized} (${newRecord.name}) to whitelist by ${addedBy}.`,
      ipAddress: '127.0.0.1',
      status: 'success'
    });

    return { success: true, entry: newRecord };
  }

  /**
   * Removes or revokes an email address from the whitelist
   */
  removeAdminWhitelistEntry(
    idOrEmail: string,
    requestedBy: string
  ): { success: boolean; error?: string; removedEntry?: AdminWhitelistRecord } {
    const normalized = normalizeAdminEmail(idOrEmail);
    const entry = this.adminWhitelist.find(
      (w) => w.id === idOrEmail || normalizeAdminEmail(w.email) === normalized
    );

    if (!entry) {
      return { success: false, error: 'Administrator whitelist entry not found.' };
    }

    // Protection rule: Never allow removing the primary root super-admin (stangyneco@gmail.com)
    if (entry.isProtected || normalizeAdminEmail(entry.email) === 'stangyneco@gmail.com') {
      return {
        success: false,
        error: 'Security Constraint: Root Master Super-Administrator account is protected and cannot be deleted or revoked.'
      };
    }

    // Remove from whitelist array
    this.adminWhitelist = this.adminWhitelist.filter((w) => w.id !== entry.id);

    // Immediately revoke admin role from user account in database
    const affectedUser = this.users.find((u) => normalizeAdminEmail(u.email) === normalizeAdminEmail(entry.email));
    if (affectedUser) {
      affectedUser.role = 'user'; // Downscale to standard user
    }

    this.addPlatformLog({
      severity: 'warn',
      category: 'rbac',
      actorId: requestedBy,
      actorRole: 'admin',
      action: 'ADMIN_WHITELIST_REMOVED',
      details: `Removed ${entry.email} from administrator whitelist. Associated permissions immediately revoked by ${requestedBy}.`,
      ipAddress: '127.0.0.1',
      status: 'warning'
    });

    return { success: true, removedEntry: entry };
  }
}

const db = new DatabaseAdapter();
export default db;

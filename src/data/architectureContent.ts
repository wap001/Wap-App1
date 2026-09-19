export interface TechStackItem {
  layer: string;
  technology: string;
  purpose: string;
  justification: string;
}

export const TECH_STACK: TechStackItem[] = [
  {
    layer: 'Mobile Apps (Customer & Driver)',
    technology: 'React Native 0.76+ / Flutter 3.24 (with Hermes engine)',
    purpose: 'Cross-platform iOS and Android native binaries with high-performance JS thread',
    justification: 'Single codebase for low-end Android devices common in Haiti & Suriname; native background location tracking and Bluetooth headset voice prompts.',
  },
  {
    layer: 'Web & Vendor Portal',
    technology: 'Next.js 15 App Router / Vite PWA (TypeScript + Tailwind CSS)',
    purpose: 'Vendor kiosk ordering, dispatch supervisor dashboard, lightweight PWA for low-storage customer phones',
    justification: 'Installable with zero App Store friction; sub-1MB initial bundle; Service Worker background sync for unstable 3G networks.',
  },
  {
    layer: 'API Gateway & Ingress',
    technology: 'Kong Gateway / Envoy Proxy with Cloudflare CDN edge',
    purpose: 'JWT authentication, rate limiting, SSL termination, geo-routing to regional pods',
    justification: 'Guarantees sub-50ms latency across Caribbean/Guiana nodes; DDoS protection during volatile political or social periods.',
  },
  {
    layer: 'Backend Microservices',
    technology: 'Node.js (TypeScript/Fastify) & Go 1.23 (Dispatch Engine)',
    purpose: 'Core business logic, rider-driver matching, ride state machine, payment adapters',
    justification: 'Go handles 50,000+ concurrent GPS pings with goroutines; Node.js provides rapid API development and shared TypeScript types.',
  },
  {
    layer: 'Real-time Telemetry & Messaging',
    technology: 'MQTT (EMQX broker) & Redis Pub/Sub (Socket.io fallback)',
    purpose: 'Sub-second motorcycle location streaming, driver accept/reject broadcast radar',
    justification: 'MQTT delivers ultra-low packet overhead (2-byte header) over flaky 2G/3G mobile networks where WebSockets often drop.',
  },
  {
    layer: 'Primary Relational Database',
    technology: 'PostgreSQL 16 + PostGIS extension (Managed Cloud SQL / RDS)',
    purpose: 'ACID transactional data for user accounts, KYC documents, vendor directory, ledger, and spatial geospatial queries',
    justification: 'PostGIS ST_DWithin and ST_DistanceSphere provide 10x faster spatial queries for finding nearest available motorcycle drivers.',
  },
  {
    layer: 'Cache & Geo-Spatial State',
    technology: 'Redis 7.2 Cluster (with Redis Geospatial H3 indexing)',
    purpose: 'Active driver coordinate store (GEOADD / GEORADIUS), session tokens, idempotency keys',
    justification: 'Sub-millisecond driver lookup within 3km radius; TTL-based driver heartbeat expiration.',
  },
  {
    layer: 'Mapping & Geospatial Platform',
    technology: 'Google Maps Platform (Routes API, Places API New, Geocoding, Driver SDK)',
    purpose: 'Motorcycle route calculation, turnaround ETA, landmark search, geofenced zones',
    justification: 'Unmatched global coverage and satellite imagery in Caribbean capitals where open map data is frequently outdated.',
  },
  {
    layer: 'Local Offline Storage',
    technology: 'WatermelonDB / IndexedDB + SQLite on mobile device',
    purpose: 'Offline-first database caching, pending trip queue, local catalog storage',
    justification: 'Allows drivers and riders to complete trips, generate cryptographically signed receipts, and sync upon re-establishing connection.',
  },
];

export const DATABASE_SCHEMAS = {
  usersTable: `
-- =========================================================================
-- 1. USER PROFILES & DIASPORA KYC TABLE
-- Supports dual SIMs, multi-region residency, and humanitarian/immigrant IDs
-- =========================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 VARCHAR(20) NOT NULL UNIQUE,       -- +509..., +594..., +592..., +597...
    secondary_phone VARCHAR(20),                   -- Fallback WhatsApp or family contact
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'driver', 'vendor', 'admin')),
    region VARCHAR(30) NOT NULL,                   -- 'haiti', 'french_guiana', 'guyana', 'suriname'
    preferred_language VARCHAR(10) DEFAULT 'ht' CHECK (preferred_language IN ('ht', 'fr', 'en', 'nl', 'sr')),
    
    -- Immigrant-friendly KYC & Identity Verification
    id_type VARCHAR(40) CHECK (id_type IN ('national_id', 'passport', 'refugee_resident_card', 'community_attestation', 'temporary_permit')),
    id_document_number VARCHAR(100),
    id_document_photo_url TEXT,
    id_verification_status VARCHAR(20) DEFAULT 'pending' CHECK (id_verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    
    -- Multi-currency In-App Wallet
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
    wallet_currency VARCHAR(5) NOT NULL,           -- 'HTG', 'EUR', 'GYD', 'SRD', 'USD'
    
    -- Audit & Security
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_e164);
CREATE INDEX idx_users_region_role ON users(region, role);
`,

  driversTable: `
-- =========================================================================
-- 2. MOTORCYCLE DRIVERS & FLEET COMPLIANCE TABLE
-- Tracks motorcycle specifications, mandatory helmet policy, and live geo
-- =========================================================================
CREATE TABLE drivers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    motorcycle_make VARCHAR(60) NOT NULL,         -- 'Haojin', 'Yamaha', 'Bajaj', 'Lifan'
    motorcycle_model VARCHAR(60) NOT NULL,        -- '125cc', '150cc Boxer', 'YBR 125'
    engine_displacement_cc INT DEFAULT 150,
    plate_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_color VARCHAR(30),
    
    -- Safety & Compliance
    driver_license_number VARCHAR(60) NOT NULL,
    license_expiry_date DATE,
    has_spare_passenger_helmet BOOLEAN DEFAULT true,
    helmet_ai_verification_timestamp TIMESTAMPTZ,
    insurance_policy_number VARCHAR(80),
    
    -- Operational Telemetry
    current_status VARCHAR(20) DEFAULT 'offline' CHECK (current_status IN ('offline', 'available', 'en_route_pickup', 'on_trip', 'suspended')),
    current_coordinates GEOMETRY(Point, 4326),     -- PostGIS spatial point (lng, lat)
    heading_degrees NUMERIC(5, 2) DEFAULT 0,
    speed_kmh NUMERIC(5, 2) DEFAULT 0,
    last_telemetry_at TIMESTAMPTZ,
    
    -- Financial Escrow (Cash-on-Delivery Floating Balance)
    cod_escrow_holding NUMERIC(12, 2) DEFAULT 0.00,
    cod_escrow_limit NUMERIC(12, 2) DEFAULT 5000.00, -- Maximum physical cash held before app lock
    
    -- Reputation
    rating_average NUMERIC(3, 2) DEFAULT 5.00,
    trips_completed_count INT DEFAULT 0,
    emergency_contact_phone VARCHAR(30) NOT NULL
);

CREATE INDEX idx_drivers_postgis_location ON drivers USING GIST(current_coordinates);
CREATE INDEX idx_drivers_status ON drivers(current_status) WHERE current_status = 'available';
`,

  vendorsTable: `
-- =========================================================================
-- 3. VENDOR DIRECTORIES & COMMERCE KIOSKS TABLE
-- Local restaurants, creole bakeries, auto-part shops, pharmacies
-- =========================================================================
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id),
    business_name VARCHAR(150) NOT NULL,
    business_category VARCHAR(50) NOT NULL CHECK (business_category IN ('restaurant_kiosk', 'pharmacy', 'grocery_market', 'hardware_parts', 'remittance_agent')),
    phone VARCHAR(30) NOT NULL,
    region VARCHAR(30) NOT NULL,
    
    -- Hyperlocal Landmark Addressing (Crucial for unnumbered island roads)
    address_street VARCHAR(255),
    address_landmark VARCHAR(255) NOT NULL,       -- e.g. "200m past St. Therese church, green gate"
    location_coordinates GEOMETRY(Point, 4326) NOT NULL,
    
    -- Business Hours & Dispatch Options
    operating_hours JSONB DEFAULT '{"mon_fri": "07:00-19:00", "sat_sun": "08:00-18:00"}',
    auto_dispatch_moto BOOLEAN DEFAULT true,       -- Auto ping nearest motorcycle upon kitchen ready
    commission_rate NUMERIC(4, 2) DEFAULT 0.12,    -- 12% platform fee
    is_active BOOLEAN DEFAULT true,
    rating_score NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_postgis ON vendors USING GIST(location_coordinates);
CREATE INDEX idx_vendors_category_region ON vendors(region, business_category);
`,

  ordersTable: `
-- =========================================================================
-- 4. TRIPS & PACKAGE DELIVERY LIFECYCLE (STATE MACHINE)
-- =========================================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code VARCHAR(20) NOT NULL UNIQUE,     -- 'WAP-HT-8921'
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('ride', 'package_delivery', 'food_vendor')),
    customer_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES drivers(user_id),
    vendor_id UUID REFERENCES vendors(id),
    
    -- State Machine
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'draft', 'matching_driver', 'driver_accepted', 'driver_at_pickup',
        'in_transit', 'arrived_destination', 'completed', 'cancelled'
    )),
    
    -- Hyperlocal Waypoint Data
    pickup_address_text VARCHAR(255) NOT NULL,
    pickup_landmark VARCHAR(255) NOT NULL,
    pickup_location GEOMETRY(Point, 4326) NOT NULL,
    
    dropoff_address_text VARCHAR(255) NOT NULL,
    dropoff_landmark VARCHAR(255) NOT NULL,
    dropoff_location GEOMETRY(Point, 4326) NOT NULL,
    
    -- Route & Metrics
    distance_meters INT NOT NULL,
    estimated_duration_seconds INT NOT NULL,
    actual_duration_seconds INT,
    encoded_polyline_route TEXT,
    
    -- Pricing & Local Currencies
    fare_currency VARCHAR(5) NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL,
    distance_fare NUMERIC(10, 2) NOT NULL,
    total_fare NUMERIC(10, 2) NOT NULL,
    driver_net_earnings NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    
    -- Payment Handling
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('moncash', 'natcash', 'mmg', 'uni5pay', 'stripe_card', 'cash_on_delivery')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held_escrow', 'settled', 'refunded', 'failed')),
    payment_transaction_ref VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
`,

  offlineSyncTable: `
-- =========================================================================
-- 5. OFFLINE WRITE-AHEAD LOG & EVENT RECONCILIATION
-- For zero-internet edge synchronization and SMS fallback logging
-- =========================================================================
CREATE TABLE offline_sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_event_id VARCHAR(64) NOT NULL UNIQUE,   -- Idempotency key generated on phone
    device_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,               -- 'DRIVER_ACCEPTED_OFFLINE', 'TRIP_COMPLETED_OFFLINE', 'CASH_COLLECTED'
    encrypted_payload JSONB NOT NULL,
    sync_status VARCHAR(20) DEFAULT 'queued' CHECK (sync_status IN ('queued', 'reconciled', 'conflict_flagged', 'rejected')),
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_synced_at TIMESTAMPTZ DEFAULT NOW(),
    reconciliation_notes TEXT
);

CREATE INDEX idx_sync_client_event ON offline_sync_events(client_event_id);
`,
};

export const PAYMENT_SPECS = [
  {
    region: 'Haiti (🇭🇹)',
    currency: 'HTG (Haitian Gourde)',
    primaryGateways: ['Digicel MonCash', 'Natcom Natcash', 'Cash-on-Delivery (Escrow)'],
    apiDetails: 'MonCash REST API v2 with OAuth client credentials. Natcash USSD push push/STK push simulation.',
    flow: '1. App requests payment token from Wap API backend -> 2. Backend calls MonCash /v1/CreatePayment -> 3. Customer approves on phone via USSD/PIN -> 4. Webhook confirms transaction -> 5. Moto driver is dispatched.',
    settlement: 'Instant mobile wallet credit with zero bank account prerequisite. Drivers can cash out at any local MonCash agent booth across Port-au-Prince, Cap-Haïtien, and Les Cayes.',
  },
  {
    region: 'French Guiana (🇬🇫)',
    currency: 'EUR (€ Euro)',
    primaryGateways: ['Stripe (Carte Bancaire / Visa / Mastercard)', 'Apple Pay & Google Pay', 'SEPA Direct Credit'],
    apiDetails: 'Stripe Payment Intents API with 3D Secure v2 authentication compliant with EU PSD2 regulations.',
    flow: '1. Customer enters card or taps Apple Pay -> 2. Payment Intent created with manual capture (escrow hold) -> 3. Ride completes -> 4. Payment captured and split: 85% to driver IBAN, 15% Wap platform fee.',
    settlement: 'Daily automated SEPA payout to French/European bank accounts or Nickel accounts popular with migrant workers.',
  },
  {
    region: 'Guyana (🇬🇾)',
    currency: 'GYD (Guyanese Dollar)',
    primaryGateways: ['Mobile Money Guyana (MMG+)', 'Republic Bank Online', 'Cash on Delivery'],
    apiDetails: 'MMG Merchant API v3 with RESTful webhook endpoints and SMS payment token confirmation.',
    flow: '1. Customer selects MMG+ -> 2. Wap sends API push to customer phone number -> 3. Customer enters 4-digit MMG PIN -> 4. Webhook triggers driver release.',
    settlement: 'Direct settlement to driver MMG wallet within 60 minutes of daily settlement batch.',
  },
  {
    region: 'Suriname (🇸🇷)',
    currency: 'SRD (Surinamese Dollar)',
    primaryGateways: ['Uni5Pay+ (Southern Commercial Bank)', 'Hakrinbank Mopé', 'Telesur TelesurGeld', 'Cash on Delivery'],
    apiDetails: 'Uni5Pay QR Code & Push Notification API, Mopé App-to-App deep linking.',
    flow: '1. Customer generates dynamic payment QR or in-app token -> 2. Instant notification pushed to Uni5Pay app -> 3. Authorization code returned -> 4. Ride confirmed.',
    settlement: 'Next-day automated clearing house (ACH) transfer or cash-out vouchers at local retail supermarkets.',
  },
];

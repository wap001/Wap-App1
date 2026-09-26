-- =========================================================================
-- WAP MOBILITY PLATFORM: POSTGRESQL 16 + POSTGIS SPATIAL DATABASE SCHEMA
-- Supporting Dynamic Fare Pricing and ST_DWithin Geospatial Driver Dispatch
-- =========================================================================

-- Enable PostGIS spatial extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. REGIONS TABLE (With Statutory Geofenced Exclusions)
CREATE TABLE IF NOT EXISTS regions (
    region_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    is_excluded BOOLEAN DEFAULT FALSE,
    exclusion_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REGIONAL PRICING TABLE (Base Rates, Per Minute, Per Km & Floors)
CREATE TABLE IF NOT EXISTS regional_pricing (
    id SERIAL PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(30) NOT NULL, -- '2_wheeler', '3_wheeler', '4_wheeler', 'moto'
    base_fare NUMERIC(10, 2) NOT NULL,
    per_minute_rate NUMERIC(10, 2) NOT NULL,
    per_km_rate NUMERIC(10, 2) NOT NULL,
    minimum_fare_floor NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL,      -- 'HTG', 'XOF', 'KES', 'USD', 'COP', 'GYD', 'SRD', 'EUR'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_region_vehicle UNIQUE (region_id, vehicle_type)
);

CREATE INDEX IF NOT EXISTS idx_regional_pricing_lookup 
ON regional_pricing(region_id, vehicle_type);

-- 3. USERS TABLE (Riders, Drivers, Dispatchers)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone_e164 VARCHAR(25) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'driver', 'vendor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DRIVER PROFILES TABLE (With PostGIS Spatial Geography / Geometry Column)
CREATE TABLE IF NOT EXISTS driver_profiles (
    driver_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(30) NOT NULL, -- '2_wheeler', '3_wheeler', '4_wheeler'
    is_online BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    -- PostGIS spatial point stored in WGS 84 (SRID 4326)
    current_location GEOGRAPHY(Point, 4326),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    trips_completed INT DEFAULT 0,
    last_ping_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-performance GIST index for sub-millisecond ST_DWithin geospatial scans
CREATE INDEX IF NOT EXISTS idx_driver_profiles_spatial 
ON driver_profiles USING GIST (current_location);

CREATE INDEX IF NOT EXISTS idx_driver_profiles_dispatch 
ON driver_profiles (is_online, is_verified, vehicle_type);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Operational Regions & Statutory Exclusions
INSERT INTO regions (region_id, name, country_code, is_excluded) VALUES
('haiti', 'Haiti (Port-au-Prince / Cap-Haïtien)', 'HT', FALSE),
('senegal', 'Senegal (Dakar / Thiès)', 'SN', FALSE),
('ivory_coast', 'Ivory Coast (Abidjan / Bouaké)', 'CI', FALSE),
('kenya', 'Kenya (Nairobi / Mombasa)', 'KE', FALSE),
('panama', 'Panama (Panama City / Colón)', 'PA', FALSE),
('colombia', 'Colombia (Bogotá / Medellín)', 'CO', FALSE),
('guyana', 'Guyana (Georgetown / New Amsterdam)', 'GY', FALSE),
('suriname', 'Suriname (Paramaribo)', 'SR', FALSE),
('french_guiana', 'French Guiana (Cayenne / Kourou)', 'GF', FALSE),
('usa', 'United States (Miami / Florida Diaspora)', 'US', FALSE),
('argentina', 'Argentina (Geofenced Exclusion)', 'AR', TRUE),
('uruguay', 'Uruguay (Geofenced Exclusion)', 'UY', TRUE)
ON CONFLICT (region_id) DO UPDATE 
SET is_excluded = EXCLUDED.is_excluded;

-- Haiti Pricing (HTG)
INSERT INTO regional_pricing (region_id, vehicle_type, base_fare, per_minute_rate, per_km_rate, minimum_fare_floor, currency) VALUES
('haiti', '2_wheeler', 150.00, 12.00, 35.00, 250.00, 'HTG'),
('haiti', '3_wheeler', 200.00, 15.00, 45.00, 350.00, 'HTG'),
('haiti', '4_wheeler', 350.00, 25.00, 75.00, 550.00, 'HTG'),
('haiti', 'moto', 150.00, 12.00, 35.00, 250.00, 'HTG')
ON CONFLICT (region_id, vehicle_type) DO NOTHING;

-- Senegal Pricing (XOF)
INSERT INTO regional_pricing (region_id, vehicle_type, base_fare, per_minute_rate, per_km_rate, minimum_fare_floor, currency) VALUES
('senegal', '2_wheeler', 500.00, 40.00, 120.00, 800.00, 'XOF'),
('senegal', '3_wheeler', 700.00, 55.00, 160.00, 1100.00, 'XOF'),
('senegal', '4_wheeler', 1200.00, 90.00, 250.00, 1800.00, 'XOF'),
('senegal', 'moto', 500.00, 40.00, 120.00, 800.00, 'XOF')
ON CONFLICT (region_id, vehicle_type) DO NOTHING;

-- =========================================================================
-- 5. 3-SIDED MARKETPLACE TABLES (DRIVERS, CUSTOMERS, MERCHANTS)
-- =========================================================================

CREATE TABLE IF NOT EXISTS merchants (
    merchant_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    business_type VARCHAR(50) NOT NULL, -- 'restaurant_kiosk', 'pharmacy', 'grocery_market', etc.
    owner_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(region_id),
    address_landmark TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326),
    rating NUMERIC(3, 2) DEFAULT 4.90,
    is_verified BOOLEAN DEFAULT TRUE,
    daily_revenue NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders_3sided (
    order_id VARCHAR(50) PRIMARY KEY,
    order_type VARCHAR(30) NOT NULL, -- 'merchant_goods', 'ride', 'courier_delivery', 'errand_service'
    title VARCHAR(200) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    merchant_id VARCHAR(50) REFERENCES merchants(merchant_id),
    merchant_name VARCHAR(150),
    driver_id VARCHAR(50),
    driver_name VARCHAR(120),
    driver_vehicle VARCHAR(80),
    status VARCHAR(30) NOT NULL, -- 'created', 'merchant_prep', 'driver_assigned', 'in_transit', 'delivered'
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    pickup_landmark TEXT NOT NULL,
    dropoff_landmark TEXT NOT NULL,
    distance_km NUMERIC(6, 2) DEFAULT 0.0,
    customer_lbc_reward INT DEFAULT 20,
    merchant_lbc_reward INT DEFAULT 25,
    driver_lbc_reward INT DEFAULT 35,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_3sided_participants 
ON orders_3sided (customer_id, merchant_id, driver_id, status);

-- =========================================================================
-- 6. LIBERTÉ CASH (LBC) TOKEN REWARD SYSTEM SCHEMA
-- =========================================================================

CREATE TABLE IF NOT EXISTS lbc_wallets (
    user_id VARCHAR(50) PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'driver', 'merchant')),
    user_name VARCHAR(120) NOT NULL,
    balance_lbc NUMERIC(14, 2) DEFAULT 0.00,
    total_earned_lbc NUMERIC(14, 2) DEFAULT 0.00,
    -- 167 LBC tokens = 1 Liberty Cash ($1.00 USD)
    usd_value NUMERIC(12, 4) GENERATED ALWAYS AS (balance_lbc / 167.0) STORED,
    treasury_apy_rate NUMERIC(5, 2) DEFAULT 5.20,
    staking_rewards_earned NUMERIC(12, 2) DEFAULT 0.00,
    linked_brokerage_account VARCHAR(60) NOT NULL UNIQUE,
    earning_lbc_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lbc_ledger_transactions (
    id VARCHAR(60) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id VARCHAR(50) NOT NULL REFERENCES lbc_wallets(user_id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    activity_type VARCHAR(40) NOT NULL, -- 'ride_completed', 'merchant_fulfillment', 'delivery_completed', etc.
    activity_reference_id VARCHAR(60) NOT NULL,
    amount_lbc NUMERIC(10, 2) NOT NULL,
    usd_equivalent NUMERIC(10, 2) NOT NULL,
    tx_hash VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'confirmed',
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_lbc_ledger_user 
ON lbc_ledger_transactions (user_id, activity_type);

-- =========================================================================
-- 7. EMBEDDED BROKERAGE API ASSETS, TRADES & PORTFOLIO HOLDINGS
-- =========================================================================

CREATE TABLE IF NOT EXISTS brokerage_assets (
    asset_id VARCHAR(50) PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    asset_class VARCHAR(30) NOT NULL CHECK (asset_class IN ('fractional_stock', 'etf', 'regional_asset', 'fiat_cashout')),
    price_usd NUMERIC(10, 2) NOT NULL,
    change_24h NUMERIC(6, 2) DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL,
    exchange VARCHAR(60) NOT NULL,
    description TEXT,
    min_lbc_to_convert INT DEFAULT 25,
    category_tag VARCHAR(50) NOT NULL,
    yield_annual_percent NUMERIC(5, 2),
    fiat_rail TEXT
);

CREATE TABLE IF NOT EXISTS brokerage_portfolio_holdings (
    id VARCHAR(60) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES lbc_wallets(user_id) ON DELETE CASCADE,
    asset_id VARCHAR(50) NOT NULL REFERENCES brokerage_assets(asset_id),
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(120) NOT NULL,
    asset_class VARCHAR(30) NOT NULL,
    shares_or_units NUMERIC(12, 4) NOT NULL,
    avg_cost_usd NUMERIC(10, 2) NOT NULL,
    acquired_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS brokerage_trades (
    trade_id VARCHAR(60) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES lbc_wallets(user_id),
    user_type VARCHAR(20) NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    asset_id VARCHAR(50) NOT NULL REFERENCES brokerage_assets(asset_id),
    ticker VARCHAR(20) NOT NULL,
    asset_name VARCHAR(120) NOT NULL,
    asset_class VARCHAR(30) NOT NULL,
    lbc_spent NUMERIC(12, 2) NOT NULL,
    usd_executed NUMERIC(10, 2) NOT NULL,
    units_acquired NUMERIC(12, 4) NOT NULL,
    execution_price_usd NUMERIC(10, 2) NOT NULL,
    clearing_broker VARCHAR(100) DEFAULT 'Wap Financial Custodial Brokerage (Omnibus)',
    fiat_destination TEXT,
    settlement_confirmation_hash VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'settled',
    executed_at TIMESTAMPTZ DEFAULT NOW()
);


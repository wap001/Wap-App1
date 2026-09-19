-- ==============================================================================
-- 01-init-postgis.sql
-- Automatic PostgreSQL + PostGIS Initialization Script for Wap Mobility
-- Mounted to /docker-entrypoint-initdb.d in postgis/postgis:15-3.3
-- ==============================================================================

-- 1. Enable PostGIS Extension and UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. Regions & Geofencing Table
CREATE TABLE IF NOT EXISTS regions (
    region_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    currency VARCHAR(5) NOT NULL,
    is_excluded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Regional Pricing Table
CREATE TABLE IF NOT EXISTS regional_pricing (
    id SERIAL PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(region_id),
    vehicle_type VARCHAR(30) NOT NULL, -- '2_wheeler', '3_wheeler', '4_wheeler'
    base_fare NUMERIC(10, 2) NOT NULL,
    per_minute_rate NUMERIC(10, 2) NOT NULL,
    per_km_rate NUMERIC(10, 2) NOT NULL,
    minimum_fare_floor NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL,
    CONSTRAINT unique_region_tier UNIQUE (region_id, vehicle_type)
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(25) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(30) DEFAULT 'customer', -- 'customer', 'driver', 'admin'
    region_id VARCHAR(50) REFERENCES regions(region_id),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Driver Profiles Table with Spatial Geography (WGS 84 SRID 4326)
CREATE TABLE IF NOT EXISTS driver_profiles (
    driver_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(30) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    current_location GEOGRAPHY(Point, 4326),
    heading NUMERIC(5, 2) DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. High-Performance GIST Spatial Index for ST_DWithin sub-millisecond radius queries
CREATE INDEX IF NOT EXISTS idx_driver_profiles_location_gist 
ON driver_profiles USING GIST(current_location);

-- 7. Populate Core Target Regions
INSERT INTO regions (region_id, name, country_code, currency, is_excluded) VALUES
('haiti', 'Haiti (Port-au-Prince / Cap-Haïtien)', 'HT', 'HTG', FALSE),
('french_guiana', 'French Guiana (Cayenne / Kourou)', 'GF', 'EUR', FALSE),
('guyana', 'Guyana (Georgetown / New Amsterdam)', 'GY', 'GYD', FALSE),
('suriname', 'Suriname (Paramaribo)', 'SR', 'SRD', FALSE),
('senegal', 'Senegal (Dakar)', 'SN', 'XOF', FALSE),
('cote_divoire', 'Côte d''Ivoire (Abidjan)', 'CI', 'XOF', FALSE),
('kenya', 'Kenya (Nairobi)', 'KE', 'KES', FALSE),
('colombia', 'Colombia (Bogotá / Medellín)', 'CO', 'COP', FALSE),
('argentina', 'Argentina (Excluded Jurisdiction)', 'AR', 'ARS', TRUE),
('uruguay', 'Uruguay (Excluded Jurisdiction)', 'UY', 'UYU', TRUE)
ON CONFLICT (region_id) DO NOTHING;

-- 8. Seed Regional Pricing Tiers
INSERT INTO regional_pricing (region_id, vehicle_type, base_fare, per_minute_rate, per_km_rate, minimum_fare_floor, currency) VALUES
('haiti', '2_wheeler', 150.00, 10.00, 35.00, 150.00, 'HTG'),
('haiti', '3_wheeler', 250.00, 15.00, 50.00, 250.00, 'HTG'),
('haiti', '4_wheeler', 500.00, 25.00, 90.00, 500.00, 'HTG'),
('french_guiana', '2_wheeler', 4.50, 0.40, 1.80, 5.00, 'EUR'),
('french_guiana', '3_wheeler', 6.00, 0.60, 2.20, 7.00, 'EUR'),
('french_guiana', '4_wheeler', 10.00, 0.90, 3.20, 12.00, 'EUR'),
('guyana', '2_wheeler', 600.00, 40.00, 150.00, 600.00, 'GYD'),
('guyana', '3_wheeler', 900.00, 60.00, 200.00, 900.00, 'GYD'),
('guyana', '4_wheeler', 1500.00, 100.00, 350.00, 1500.00, 'GYD'),
('suriname', '2_wheeler', 80.00, 6.00, 25.00, 80.00, 'SRD'),
('suriname', '3_wheeler', 120.00, 9.00, 35.00, 120.00, 'SRD'),
('suriname', '4_wheeler', 200.00, 15.00, 55.00, 200.00, 'SRD')
ON CONFLICT (region_id, vehicle_type) DO NOTHING;

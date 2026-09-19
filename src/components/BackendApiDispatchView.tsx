import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Server,
  Navigation,
  DollarSign,
  Compass,
  Database,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Bike,
  Car,
  Layers,
  Copy,
  Check,
  Send,
  RefreshCw,
  Code2,
  ShieldAlert,
  Sliders,
  Radio,
  FileCode,
  Wifi,
  WifiOff,
  Bell,
  Play,
  Square,
  Activity,
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import { calculateDistanceMeters } from '../server/db';

interface FareCalculationResult {
  success: boolean;
  vehicle_type?: string;
  distance_km?: number;
  duration_minutes?: number;
  fare?: string;
  currency?: string;
  error?: string;
  breakdown?: {
    base_fare: string;
    per_minute_rate: string;
    per_km_rate: string;
    minimum_fare_floor: string;
    raw_calculated_fare: string;
  };
}

interface NearbyDriver {
  driver_id: string;
  full_name: string;
  vehicle_type: string;
  longitude: number;
  latitude: number;
  distance_meters: number;
}

interface NearbyDriversResult {
  success: boolean;
  count: number;
  radius_meters?: number;
  vehicle_type?: string;
  drivers: NearbyDriver[];
  error?: string;
}

interface SocketLogEntry {
  id: string;
  time: string;
  direction: 'out' | 'in' | 'sys';
  event: string;
  payload: any;
}

const REGION_PRESETS = [
  { id: 'haiti', name: 'Haiti (Port-au-Prince)', currency: 'HTG', lat: 18.5400, lng: -72.3300, is_excluded: false },
  { id: 'senegal', name: 'Senegal (Dakar)', currency: 'XOF', lat: 14.7167, lng: -17.4677, is_excluded: false },
  { id: 'ivory_coast', name: 'Ivory Coast (Abidjan)', currency: 'XOF', lat: 5.3600, lng: -4.0083, is_excluded: false },
  { id: 'kenya', name: 'Kenya (Nairobi)', currency: 'KES', lat: -1.2921, lng: 36.8219, is_excluded: false },
  { id: 'panama', name: 'Panama (Panama City)', currency: 'USD', lat: 8.9824, lng: -79.5199, is_excluded: false },
  { id: 'colombia', name: 'Colombia (Bogotá)', currency: 'COP', lat: 4.7110, lng: -74.0721, is_excluded: false },
  { id: 'guyana', name: 'Guyana (Georgetown)', currency: 'GYD', lat: 6.8013, lng: -58.1551, is_excluded: false },
  { id: 'suriname', name: 'Suriname (Paramaribo)', currency: 'SRD', lat: 5.8520, lng: -55.2038, is_excluded: false },
  { id: 'french_guiana', name: 'French Guiana (Cayenne)', currency: 'EUR', lat: 4.9224, lng: -52.3135, is_excluded: false },
  { id: 'usa', name: 'USA (Miami Diaspora)', currency: 'USD', lat: 25.7617, lng: -80.1918, is_excluded: false },
  // Excluded regions
  { id: 'argentina', name: 'Argentina [Statutory Excluded]', currency: 'ARS', lat: -34.6037, lng: -58.3816, is_excluded: true },
  { id: 'uruguay', name: 'Uruguay [Statutory Excluded]', currency: 'UYU', lat: -34.9011, lng: -56.1645, is_excluded: true },
];

export const BackendApiDispatchView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fare-api' | 'postgis-api' | 'socket-dispatch' | 'code-ddl'>('fare-api');

  // Fare Calculation State
  const [fareRegion, setFareRegion] = useState<string>('haiti');
  const [fareVehicle, setFareVehicle] = useState<string>('2_wheeler');
  const [fareDistance, setFareDistance] = useState<number>(6.5);
  const [fareDuration, setFareDuration] = useState<number>(18);
  const [fareLoading, setFareLoading] = useState<boolean>(false);
  const [fareResponse, setFareResponse] = useState<FareCalculationResult | null>(null);
  const [fareStatus, setFareStatus] = useState<number | null>(null);
  const [fareLatency, setFareLatency] = useState<number | null>(null);

  // PostGIS Driver Dispatch State
  const [selectedPresetCity, setSelectedPresetCity] = useState<string>('haiti');
  const [dispatchLat, setDispatchLat] = useState<number>(18.5400);
  const [dispatchLng, setDispatchLng] = useState<number>(-72.3300);
  const [dispatchVehicle, setDispatchVehicle] = useState<string>('2_wheeler');
  const [dispatchRadius, setDispatchRadius] = useState<number>(5000);
  const [dispatchLoading, setDispatchLoading] = useState<boolean>(false);
  const [dispatchResponse, setDispatchResponse] = useState<NearbyDriversResult | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<number | null>(null);
  const [dispatchLatency, setDispatchLatency] = useState<number | null>(null);

  // Socket.IO Real-Time Engine State
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [activeDriversCount, setActiveDriversCount] = useState<number>(0);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv-ht-01');
  const [driverIsOnline, setDriverIsOnline] = useState<boolean>(false);
  const [driverLat, setDriverLat] = useState<number>(18.5432);
  const [driverLng, setDriverLng] = useState<number>(-72.3315);
  const [driverHeading, setDriverHeading] = useState<number>(45);
  const [isAutoStreamingGps, setIsAutoStreamingGps] = useState<boolean>(false);

  // Passenger / Dispatcher side State
  const [passengerName, setPassengerName] = useState<string>('Marie-Flore Célestin');
  const [pickupAddr, setPickupAddr] = useState<string>('Delmas 33, Port-au-Prince');
  const [dropoffAddr, setDropoffAddr] = useState<string>('Pétion-Ville Market');
  const [dispatchFareValue, setDispatchFareValue] = useState<string>('450.00');
  const [dispatchCurrency, setDispatchCurrency] = useState<string>('HTG');
  const [incomingOffer, setIncomingOffer] = useState<any | null>(null);
  const [offerAcceptedStatus, setOfferAcceptedStatus] = useState<string | null>(null);

  // Real-time Tracked Telemetry
  const [trackedLocation, setTrackedLocation] = useState<{
    latitude: number;
    longitude: number;
    heading: number;
    timestamp: string;
  } | null>(null);

  // Socket Event Logs
  const [socketLogs, setSocketLogs] = useState<SocketLogEntry[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const autoGpsIntervalRef = useRef<any>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const addLog = (direction: 'out' | 'in' | 'sys', event: string, payload: any) => {
    setSocketLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        direction,
        event,
        payload
      },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // Initialize Socket.IO Client Connection
  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      timeout: 8000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      setSocketId(socket.id || null);
      addLog('sys', 'connect', { socket_id: socket.id, status: 'CONNECTED_2G_WEBSOCKET' });
    });

    socket.on('disconnect', (reason) => {
      setSocketConnected(false);
      setSocketId(null);
      setDriverIsOnline(false);
      addLog('sys', 'disconnect', { reason });
    });

    socket.on('driver:status_change', (data) => {
      setActiveDriversCount(data.total_active_drivers || 0);
      addLog('in', 'driver:status_change', data);
    });

    // Real-time incoming ride offer from dispatcher
    socket.on('ride:new_offer', (tripData) => {
      setIncomingOffer(tripData);
      setOfferAcceptedStatus(null);
      addLog('in', 'ride:new_offer', tripData);
    });

    socket.on('ride:dispatch_status', (data) => {
      addLog('in', 'ride:dispatch_status', data);
    });

    socket.on('ride:status_update', (data) => {
      setOfferAcceptedStatus(data.status);
      addLog('in', 'ride:status_update', data);
    });

    return () => {
      if (autoGpsIntervalRef.current) clearInterval(autoGpsIntervalRef.current);
      socket.disconnect();
    };
  }, []);

  // Listen to the specific driver's location broadcast stream
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const channelName = `driver:location:${selectedDriverId}`;

    const handleDriverLocation = (loc: any) => {
      setTrackedLocation(loc);
      addLog('in', channelName, loc);
    };

    socket.on(channelName, handleDriverLocation);

    return () => {
      socket.off(channelName, handleDriverLocation);
    };
  }, [selectedDriverId]);

  // Driver: Toggle Online Pool (driver:online / driver:offline)
  const handleToggleDriverOnline = () => {
    const socket = socketRef.current;
    if (!socket || !socketConnected) return;

    if (!driverIsOnline) {
      socket.emit('driver:online', { driver_id: selectedDriverId });
      setDriverIsOnline(true);
      addLog('out', 'driver:online', { driver_id: selectedDriverId });
    } else {
      socket.emit('driver:offline', { driver_id: selectedDriverId });
      setDriverIsOnline(false);
      setIsAutoStreamingGps(false);
      if (autoGpsIntervalRef.current) clearInterval(autoGpsIntervalRef.current);
      addLog('out', 'driver:offline', { driver_id: selectedDriverId });
    }
  };

  // Driver: Broadcast Single Location Ping (driver:location_update)
  const handleSendLocationPing = (newLat?: number, newLng?: number, newHeading?: number) => {
    const socket = socketRef.current;
    if (!socket || !socketConnected) return;

    const payload = {
      driver_id: selectedDriverId,
      latitude: newLat ?? driverLat,
      longitude: newLng ?? driverLng,
      heading: newHeading ?? driverHeading
    };

    socket.emit('driver:location_update', payload);
    addLog('out', 'driver:location_update', payload);
  };

  // Driver: Continuous Auto-GPS Streaming
  useEffect(() => {
    if (isAutoStreamingGps && driverIsOnline) {
      autoGpsIntervalRef.current = setInterval(() => {
        setDriverLat((prevLat) => {
          const deltaLat = (Math.random() - 0.48) * 0.0004;
          const updatedLat = Number((prevLat + deltaLat).toFixed(6));
          return updatedLat;
        });

        setDriverLng((prevLng) => {
          const deltaLng = (Math.random() - 0.48) * 0.0004;
          const updatedLng = Number((prevLng + deltaLng).toFixed(6));
          return updatedLng;
        });

        setDriverHeading((prevHeading) => (prevHeading + Math.floor(Math.random() * 15 - 7) + 360) % 360);
      }, 1500);
    } else {
      if (autoGpsIntervalRef.current) clearInterval(autoGpsIntervalRef.current);
    }

    return () => {
      if (autoGpsIntervalRef.current) clearInterval(autoGpsIntervalRef.current);
    };
  }, [isAutoStreamingGps, driverIsOnline]);

  // When lat/lng/heading update under auto-streaming, broadcast them
  useEffect(() => {
    if (isAutoStreamingGps && driverIsOnline) {
      handleSendLocationPing(driverLat, driverLng, driverHeading);
    }
  }, [driverLat, driverLng, driverHeading]);

  // Passenger: Dispatch Ride Offer to Specific Driver (ride:request_dispatch)
  const handleDispatchRideOffer = () => {
    const socket = socketRef.current;
    if (!socket || !socketConnected) return;

    const tripData = {
      trip_id: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
      passenger_name: passengerName,
      pickup_address: pickupAddr,
      dropoff_address: dropoffAddr,
      offered_fare: dispatchFareValue,
      currency: dispatchCurrency,
      vehicle_tier: '2_wheeler',
      estimated_distance_km: 4.8,
      estimated_duration_min: 14
    };

    socket.emit('ride:request_dispatch', {
      driver_id: selectedDriverId,
      trip_data: tripData
    });

    addLog('out', 'ride:request_dispatch', { driver_id: selectedDriverId, trip_data: tripData });
  };

  // Driver: Respond to Offer (Accept / Decline)
  const handleRespondToOffer = (accepted: boolean) => {
    const socket = socketRef.current;
    if (!socket || !incomingOffer) return;

    socket.emit('ride:offer_response', {
      trip_id: incomingOffer.trip_id,
      driver_id: selectedDriverId,
      accepted
    });

    addLog('out', 'ride:offer_response', {
      trip_id: incomingOffer.trip_id,
      driver_id: selectedDriverId,
      accepted
    });

    if (accepted) {
      setOfferAcceptedStatus('driver_accepted');
    } else {
      setOfferAcceptedStatus('driver_declined');
      setIncomingOffer(null);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetCity(presetId);
    const target = REGION_PRESETS.find((r) => r.id === presetId);
    if (target) {
      setDispatchLat(target.lat);
      setDispatchLng(target.lng);
    }
  };

  // Test Fare API
  const handleCalculateFare = async () => {
    setFareLoading(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/fare/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region_id: fareRegion,
          vehicle_type: fareVehicle,
          distance_km: fareDistance,
          duration_minutes: fareDuration
        })
      });
      const data = await res.json();
      setFareStatus(res.status);
      setFareResponse(data);
      setFareLatency(Math.round(performance.now() - start));
    } catch (err: any) {
      setFareStatus(500);
      setFareResponse({ success: false, error: err.message || 'Connection failed' });
      setFareLatency(Math.round(performance.now() - start));
    } finally {
      setFareLoading(false);
    }
  };

  // Test PostGIS Dispatch API
  const handleFindNearbyDrivers = async () => {
    setDispatchLoading(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/drivers/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: dispatchLat,
          longitude: dispatchLng,
          vehicle_type: dispatchVehicle,
          radius_meters: dispatchRadius
        })
      });
      const data = await res.json();
      setDispatchStatus(res.status);
      setDispatchResponse(data);
      setDispatchLatency(Math.round(performance.now() - start));
    } catch (err: any) {
      setDispatchStatus(500);
      setDispatchResponse({ success: false, count: 0, drivers: [], error: err.message || 'Connection failed' });
      setDispatchLatency(Math.round(performance.now() - start));
    } finally {
      setDispatchLoading(false);
    }
  };

  // Run initial test queries on mount
  useEffect(() => {
    handleCalculateFare();
    handleFindNearbyDrivers();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const EXPRESS_ROUTER_CODE = `const express = require('express');
const router = express.Router();
const db = require('./db'); // PostgreSQL connection instance

/**
 * 1. DYNAMIC FARE CALCULATION API
 * Calculates upfront ride fare based on regional base rates, time, distance, and vehicle tier.
 */
router.post('/api/fare/calculate', async (req, res) => {
    try {
        const { region_id, vehicle_type, distance_km, duration_minutes } = req.body;

        // Fetch pricing rules for the specified region and vehicle class
        const pricing = await db.oneOrNone(
            \`SELECT base_fare, per_minute_rate, per_km_rate, minimum_fare_floor, currency 
             FROM regional_pricing rp
             JOIN regions r ON rp.region_id = r.region_id
             WHERE rp.region_id = $1 AND rp.vehicle_type = $2 AND r.is_excluded = FALSE\`,
            [region_id, vehicle_type]
        );

        if (!pricing) {
            return res.status(400).json({ error: "Service unavailable or invalid region/vehicle tier." });
        }

        // Calculate raw fare using core platform formula
        let calculatedFare = parseFloat(pricing.base_fare) +
            (parseFloat(duration_minutes) * parseFloat(pricing.per_minute_rate)) +
            (parseFloat(distance_km) * parseFloat(pricing.per_km_rate));

        // Enforce minimum trip floor
        const finalFare = Math.max(calculatedFare, parseFloat(pricing.minimum_fare_floor));

        return res.status(200).json({
            success: true,
            vehicle_type,
            distance_km,
            duration_minutes,
            fare: finalFare.toFixed(2),
            currency: pricing.currency
        });
    } catch (error) {
        console.error("Error calculating fare:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * 2. POSTGIS GEOSPATIAL DRIVER DISPATCH API
 * Finds nearby online drivers matching the requested vehicle tier within a given radius.
 */
router.post('/api/drivers/nearby', async (req, res) => {
    try {
        const { latitude, longitude, vehicle_type, radius_meters = 5000 } = req.body;

        // ST_DWithin and ST_Distance Sphere query for fast spatial indexing
        const nearbyDrivers = await db.manyOrNone(
            \`SELECT 
                d.driver_id,
                u.full_name,
                d.vehicle_type,
                ST_X(d.current_location::geometry) as longitude,
                ST_Y(d.current_location::geometry) as latitude,
                ST_Distance(
                    d.current_location, 
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) as distance_meters
             FROM driver_profiles d
             JOIN users u ON d.driver_id = u.user_id
             WHERE d.is_online = TRUE 
               AND d.is_verified = TRUE
               AND d.vehicle_type = $3
               AND ST_DWithin(
                   d.current_location, 
                   ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
                   $4
               )
             ORDER BY distance_meters ASC
             LIMIT 10\`,
            [longitude, latitude, vehicle_type, radius_meters]
        );

        return res.status(200).json({
            success: true,
            count: nearbyDrivers.length,
            drivers: nearbyDrivers
        });
    } catch (error) {
        console.error("Error finding nearby drivers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
module.exports = router;`;

  const SQL_DDL_CODE = `-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Regional Pricing Table
CREATE TABLE regional_pricing (
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

-- 3. Driver Profiles Table with Spatial Geography
CREATE TABLE driver_profiles (
    driver_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(30) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    current_location GEOGRAPHY(Point, 4326),
    rating NUMERIC(3, 2) DEFAULT 5.00
);

-- 4. High-Performance GIST Index for Sub-Millisecond Radius Lookups
CREATE INDEX idx_driver_profiles_location_gist 
ON driver_profiles USING GIST(current_location);`;

  const SOCKET_IO_SERVER_CODE = `const io = require('socket.io')(server, { cors: { origin: '*' } });

// Track active socket connections for drivers and passengers
const activeDrivers = new Map(); // driver_id -> socket_id

io.on('connection', (socket) => {
    // Driver joins online pool and broadcasts continuous GPS location
    socket.on('driver:online', ({ driver_id }) => {
        activeDrivers.set(driver_id, socket.id);
    });

    socket.on('driver:location_update', ({ driver_id, latitude, longitude, heading }) => {
        // Broadcast location update to nearby passengers or assigned ride channel
        socket.broadcast.emit(\`driver:location:\${driver_id}\`, { latitude, longitude, heading });
    });

    // Send instant ride request alert to a specific driver
    socket.on('ride:request_dispatch', ({ driver_id, trip_data }) => {
        const driverSocketId = activeDrivers.get(driver_id);
        if (driverSocketId) {
            io.to(driverSocketId).emit('ride:new_offer', trip_data);
        }
    });

    socket.on('disconnect', () => {
        // Handle driver connection drops gracefully
        for (let [driver_id, socket_id] of activeDrivers.entries()) {
            if (socket_id === socket.id) {
                activeDrivers.delete(driver_id);
                break;
            }
        }
    });
});`;

  const SOCKET_IO_CLIENT_CODE = `// Mobile Client (React Native / Flutter / Web)
import io from 'socket.io-client';

const socket = io('https://api.wapmobility.com', {
  transports: ['websocket'],
  reconnection: true
});

// 1. DRIVER GOES ONLINE
socket.emit('driver:online', { driver_id: 'drv-ht-01' });

// 2. STREAM CONTINUOUS GPS TELEMETRY
navigator.geolocation.watchPosition((pos) => {
  socket.emit('driver:location_update', {
    driver_id: 'drv-ht-01',
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    heading: pos.coords.heading || 0
  });
});

// 3. LISTEN FOR INSTANT RIDE OFFERS
socket.on('ride:new_offer', (tripData) => {
  // Trigger audio chime, show modal with upfront fare
  console.log('Incoming trip offer:', tripData);
});

// 4. PASSENGER TRACKS ASSIGNED DRIVER
socket.on('driver:location:drv-ht-01', ({ latitude, longitude, heading }) => {
  // Smoothly interpolate motorbike marker on map
  updateMarkerPosition(latitude, longitude, heading);
});`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Server className="w-4 h-4" />
              <span>NODE.JS / EXPRESS 4 & POSTGRESQL 16 + POSTGIS ENGINE</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/30">
                ACTIVE REST API
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Dynamic Fare Pricing & PostGIS Spatial Dispatch APIs
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
              Production-grade Express router integrating PostgreSQL with PostGIS{' '}
              <code className="text-amber-300 font-mono">ST_DWithin</code> &{' '}
              <code className="text-amber-300 font-mono">ST_Distance</code> spatial indexing for motorcycle taxi dispatch,
              and upfront multi-tier regional fare calculation with geofenced statutory exclusion enforcement.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
            <div className="text-center px-2">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">Port</div>
              <div className="text-amber-400 font-mono font-black">3000</div>
            </div>
            <div className="h-6 w-px bg-neutral-800" />
            <div className="text-center px-2">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">Spatial Index</div>
              <div className="text-emerald-400 font-mono font-bold">GIST (R-Tree)</div>
            </div>
            <div className="h-6 w-px bg-neutral-800" />
            <div className="text-center px-2">
              <div className="text-[10px] text-neutral-400 uppercase font-bold">SRID</div>
              <div className="text-white font-mono font-bold">4326 (WGS84)</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-6 border-t border-neutral-800 pt-4">
          <button
            id="tab-fare-api"
            onClick={() => setActiveTab('fare-api')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'fare-api'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-extrabold'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>1. POST /api/fare/calculate (Upfront Pricing)</span>
          </button>

          <button
            id="tab-postgis-api"
            onClick={() => setActiveTab('postgis-api')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'postgis-api'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-extrabold'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>2. POST /api/drivers/nearby (PostGIS Spatial Dispatch)</span>
          </button>

          <button
            id="tab-socket-dispatch"
            onClick={() => setActiveTab('socket-dispatch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'socket-dispatch'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-extrabold'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. WebSocket & Socket.IO Engine (GPS & Dispatch)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
          </button>

          <button
            id="tab-code-ddl"
            onClick={() => setActiveTab('code-ddl')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'code-ddl'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-extrabold'
                : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code & PostGIS DDL</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC FARE CALCULATION TAB */}
      {/* ========================================================================= */}
      {activeTab === 'fare-api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Trip Request Parameters</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">Endpoint: POST /api/fare/calculate</span>
            </div>

            {/* Region Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Operating Territory (region_id)</span>
                {REGION_PRESETS.find((r) => r.id === fareRegion)?.is_excluded && (
                  <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Geofenced Exclusion
                  </span>
                )}
              </label>
              <select
                id="fare-region-select"
                value={fareRegion}
                onChange={(e) => setFareRegion(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.currency} {r.is_excluded ? '(EXCLUDED)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-400">
                Queries <code className="text-neutral-300">WHERE r.is_excluded = FALSE</code>. Selecting Argentina or Uruguay
                validates automated boundary rejection.
              </p>
            </div>

            {/* Vehicle Tier Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Vehicle Tier (vehicle_type)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '2_wheeler', label: '2-Wheeler', icon: Bike, desc: 'Solo Moto' },
                  { id: '3_wheeler', label: '3-Wheeler', icon: Navigation, desc: 'Tuk-Tuk' },
                  { id: '4_wheeler', label: '4-Wheeler', icon: Car, desc: 'Cab / Sedan' }
                ].map((v) => {
                  const Icon = v.icon;
                  const isSel = fareVehicle === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFareVehicle(v.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isSel
                          ? 'border-amber-400 bg-amber-400/10 text-white'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSel ? 'text-amber-400' : 'text-neutral-500'}`} />
                      <div className="font-bold text-xs text-white">{v.label}</div>
                      <div className="text-[10px] text-neutral-400">{v.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">Distance (km)</span>
                  <span className="text-amber-400 font-mono font-bold">{fareDistance} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="45"
                  step="0.5"
                  value={fareDistance}
                  onChange={(e) => setFareDistance(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="space-y-1.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 font-semibold">Estimated Duration (min)</span>
                  <span className="text-amber-400 font-mono font-bold">{fareDuration} min</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="90"
                  step="1"
                  value={fareDuration}
                  onChange={(e) => setFareDuration(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            {/* Execute Button */}
            <button
              id="btn-execute-fare"
              onClick={handleCalculateFare}
              disabled={fareLoading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
            >
              {fareLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating Dynamic Fare...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute POST /api/fare/calculate</span>
                </>
              )}
            </button>
          </div>

          {/* Response & Live Telemetry Panel */}
          <div className="lg:col-span-6 space-y-4">
            {/* Status & Latency Badge */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-black ${
                      fareStatus === 200
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : fareStatus === 400
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    HTTP {fareStatus || '---'}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {fareStatus === 200 ? '200 OK — Fare Calculated' : fareStatus === 400 ? '400 Bad Request (Exclusion / Not Found)' : 'Response Ready'}
                  </span>
                </div>
                {fareLatency !== null && (
                  <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{fareLatency} ms</span>
                  </span>
                )}
              </div>

              {/* Calculated Result Card */}
              {fareResponse?.success && (
                <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-amber-400/40 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                        Guaranteed Upfront Fare
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">
                        {fareResponse.fare} <span className="text-sm font-bold text-white">{fareResponse.currency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase font-bold">Vehicle Class</div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5 uppercase">
                        {fareResponse.vehicle_type}
                      </div>
                    </div>
                  </div>

                  {/* Formula Breakdown */}
                  {fareResponse.breakdown && (
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-neutral-500 block">Base Fare</span>
                        <span className="font-mono text-neutral-200 font-semibold">
                          {fareResponse.breakdown.base_fare} {fareResponse.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Time Rate</span>
                        <span className="font-mono text-neutral-200 font-semibold">
                          {fareResponse.breakdown.per_minute_rate}/min
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Distance Rate</span>
                        <span className="font-mono text-neutral-200 font-semibold">
                          {fareResponse.breakdown.per_km_rate}/km
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Minimum Floor</span>
                        <span className="font-mono text-amber-300 font-semibold">
                          {fareResponse.breakdown.minimum_fare_floor} {fareResponse.currency}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Banner */}
              {fareResponse && !fareResponse.success && (
                <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-red-200">API Error: {fareResponse.error}</div>
                    <p className="text-[11px] text-red-400/90 mt-0.5">
                      The PostgreSQL query returned NULL because this territory is excluded via <code className="text-red-300 font-mono">r.is_excluded = FALSE</code> or pricing tier is unlisted.
                    </p>
                  </div>
                </div>
              )}

              {/* JSON Response Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono text-[11px]">Response JSON Payload</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(fareResponse, null, 2), 'fare-res')}
                    className="hover:text-white flex items-center gap-1 text-[10px]"
                  >
                    {copiedCode === 'fare-res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'fare-res' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-56">
                  <code>{JSON.stringify(fareResponse, null, 2)}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. POSTGIS SPATIAL DRIVER DISPATCH TAB */}
      {/* ========================================================================= */}
      {activeTab === 'postgis-api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Spatial Search Parameters</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">POST /api/drivers/nearby</span>
            </div>

            {/* Preset Operating Cities */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Quick-Pick Metro Center</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {REGION_PRESETS.filter((r) => !r.is_excluded).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handlePresetSelect(r.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition text-left truncate ${
                      selectedPresetCity === r.id
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {r.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400">Center Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={dispatchLat}
                  onChange={(e) => setDispatchLat(parseFloat(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400">Center Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={dispatchLng}
                  onChange={(e) => setDispatchLng(parseFloat(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Vehicle Tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Vehicle Tier (vehicle_type)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '2_wheeler', label: '2-Wheeler' },
                  { id: '3_wheeler', label: '3-Wheeler' },
                  { id: '4_wheeler', label: '4-Wheeler' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setDispatchVehicle(v.id)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      dispatchVehicle === v.id
                        ? 'bg-amber-400 text-neutral-950 border-amber-400'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-1.5 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400 font-semibold">ST_DWithin Search Radius</span>
                <span className="text-amber-400 font-mono font-bold">
                  {dispatchRadius >= 1000 ? `${(dispatchRadius / 1000).toFixed(1)} km` : `${dispatchRadius} m`}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={dispatchRadius}
                onChange={(e) => setDispatchRadius(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>500m (Dense Urban)</span>
                <span>20 km (Regional)</span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              id="btn-execute-dispatch"
              onClick={handleFindNearbyDrivers}
              disabled={dispatchLoading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
            >
              {dispatchLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning PostGIS Spatial Index...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Execute Spatial Dispatch Query</span>
                </>
              )}
            </button>
          </div>

          {/* Results: Spatial Radar & Driver Table */}
          <div className="lg:col-span-7 space-y-4">
            {/* Spatial Overview Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-black ${
                      dispatchStatus === 200
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    HTTP {dispatchStatus || '---'}
                  </span>
                  <span className="text-xs font-bold text-white">
                    Found {dispatchResponse?.count ?? 0} Online Drivers Within {(dispatchRadius / 1000).toFixed(1)} km
                  </span>
                </div>
                {dispatchLatency !== null && (
                  <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{dispatchLatency} ms</span>
                  </span>
                )}
              </div>

              {/* Spatial Radar Visualizer */}
              <div className="h-56 bg-neutral-950 rounded-xl border border-neutral-800 relative flex items-center justify-center overflow-hidden">
                {/* Radar Rings */}
                <div className="absolute w-44 h-44 rounded-full border border-neutral-800/60" />
                <div className="absolute w-32 h-32 rounded-full border border-neutral-800/80" />
                <div className="absolute w-20 h-20 rounded-full border border-amber-400/30" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-800/40" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-neutral-800/40" />

                {/* Center User Pin */}
                <div className="absolute z-10 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                  </div>
                  <span className="text-[9px] font-mono text-amber-300 font-bold mt-1 bg-neutral-900/90 px-1.5 py-0.5 rounded border border-amber-400/40">
                    Pickup Location
                  </span>
                </div>

                {/* Nearby Driver Markers Plotted */}
                {dispatchResponse?.drivers.map((drv, idx) => {
                  // Normalize position relative to center for the radar visualization
                  const deltaLat = drv.latitude - dispatchLat;
                  const deltaLng = drv.longitude - dispatchLng;
                  // Scale factor
                  const scale = 3000;
                  const topPercent = Math.max(10, Math.min(90, 50 - deltaLat * scale));
                  const leftPercent = Math.max(10, Math.min(90, 50 + deltaLng * scale));

                  return (
                    <div
                      key={drv.driver_id}
                      style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center text-[10px] font-bold shadow-md hover:scale-125 transition cursor-pointer">
                        {idx + 1}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-900 text-white text-[10px] p-2 rounded-lg border border-neutral-700 whitespace-nowrap z-30 shadow-xl">
                        <div className="font-bold text-amber-300">{drv.full_name}</div>
                        <div>Distance: {drv.distance_meters} m</div>
                        <div>Vehicle: {drv.vehicle_type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driver Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] font-mono">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Driver Name</th>
                      <th className="pb-2">Vehicle</th>
                      <th className="pb-2">ST_Distance</th>
                      <th className="pb-2">Coordinates</th>
                      <th className="pb-2 text-right">Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {dispatchResponse?.drivers.map((d, index) => (
                      <tr key={d.driver_id} className="hover:bg-neutral-950/60 transition">
                        <td className="py-2.5 text-amber-400 font-bold">{index + 1}</td>
                        <td className="py-2.5 font-sans font-bold text-white">{d.full_name}</td>
                        <td className="py-2.5 text-neutral-300 uppercase text-[11px]">{d.vehicle_type}</td>
                        <td className="py-2.5 text-emerald-400 font-bold">
                          {d.distance_meters < 1000
                            ? `${d.distance_meters} m`
                            : `${(d.distance_meters / 1000).toFixed(2)} km`}
                        </td>
                        <td className="py-2.5 text-neutral-400 text-[10px]">
                          {d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                            READY
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!dispatchResponse?.drivers || dispatchResponse.drivers.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-neutral-500 italic">
                          No online drivers found in this radius for vehicle type '{dispatchVehicle}'. Expand the search radius or select another metro center.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REAL-TIME SOCKET.IO DRIVER DISPATCH & GPS TELEMETRY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'socket-dispatch' && (
        <div className="space-y-6">
          {/* Real-Time Connectivity Banner */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  socketConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {socketConnected ? <Wifi className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">
                    {socketConnected ? 'Real-Time WebSocket Link Active' : 'Connecting to Socket.IO Server...'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      socketConnected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {socketConnected ? 'ONLINE' : 'CONNECTING'}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Client ID:{' '}
                  <span className="text-amber-300 font-semibold">{socketId || 'Negotiating handshake...'}</span> • Active Online Fleet:{' '}
                  <span className="text-emerald-400 font-bold">{activeDriversCount} Drivers</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSocketLogs([])}
                className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-400 hover:text-white font-medium transition"
              >
                Clear Event Logs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. DRIVER CLIENT INTERFACE (Left Column) */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-black text-white">Driver Client Terminal (Mobile Device)</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                    Role: Driver Mobile Client
                  </span>
                </div>

                {/* Driver Identity & Online State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Selected Driver Profile</label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      disabled={driverIsOnline}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 disabled:opacity-60"
                    >
                      <option value="drv-ht-01">drv-ht-01 (Jean-Baptiste Voltaire - HT)</option>
                      <option value="drv-ht-02">drv-ht-02 (Dieudonné Pierre - HT)</option>
                      <option value="drv-sn-01">drv-sn-01 (Mamadou Diallo - SN)</option>
                      <option value="drv-ci-01">drv-ci-01 (Kouassi Yao - CI)</option>
                      <option value="drv-ke-01">drv-ke-01 (Juma Otieno - KE)</option>
                      <option value="drv-gy-01">drv-gy-01 (Devon Persaud - GY)</option>
                      <option value="drv-sr-01">drv-sr-01 (Rewi Biseswar - SR)</option>
                      <option value="drv-us-01">drv-us-01 (Patrick Augustin - US)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Online Fleet Status</label>
                    <button
                      id="btn-driver-online-toggle"
                      onClick={handleToggleDriverOnline}
                      disabled={!socketConnected}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                        driverIsOnline
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-neutral-950 shadow-md shadow-emerald-500/20'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                      }`}
                    >
                      {driverIsOnline ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950" />
                          <span>Online (socket.emit('driver:online'))</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5" />
                          <span>Offline • Click to Join Pool</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Continuous GPS Location Broadcast Control */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>Continuous GPS Telemetry (driver:location_update)</span>
                    </div>
                    <button
                      onClick={() => setIsAutoStreamingGps(!isAutoStreamingGps)}
                      disabled={!driverIsOnline}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                        isAutoStreamingGps
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white disabled:opacity-40'
                      }`}
                    >
                      {isAutoStreamingGps ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isAutoStreamingGps ? 'Stop GPS Loop' : 'Start Auto-GPS Stream (1.5s)'}</span>
                    </button>
                  </div>

                  {/* Heading & Coordinates Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 text-center">
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Heading Bearing</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <div
                          style={{ transform: `rotate(${driverHeading}deg)` }}
                          className="w-5 h-5 flex items-center justify-center transition-transform duration-300 text-amber-400"
                        >
                          <Navigation className="w-4 h-4 fill-amber-400" />
                        </div>
                        <span className="font-mono text-sm font-black text-white">{driverHeading}°</span>
                      </div>
                    </div>

                    <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 text-center">
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Current Latitude</div>
                      <div className="font-mono text-xs font-bold text-white mt-1.5">{driverLat.toFixed(6)}</div>
                    </div>

                    <div className="bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 text-center">
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Current Longitude</div>
                      <div className="font-mono text-xs font-bold text-white mt-1.5">{driverLng.toFixed(6)}</div>
                    </div>
                  </div>

                  {/* Manual Sliders & Ping Button */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Adjust Heading Angle (Compass needle)</span>
                      <span className="font-mono text-amber-300 font-bold">{driverHeading}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={driverHeading}
                      onChange={(e) => {
                        const h = parseInt(e.target.value, 10);
                        setDriverHeading(h);
                        if (driverIsOnline) handleSendLocationPing(driverLat, driverLng, h);
                      }}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => handleSendLocationPing(driverLat, driverLng, driverHeading)}
                      disabled={!driverIsOnline}
                      className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition disabled:opacity-40"
                    >
                      Broadcast Single Location Ping
                    </button>
                  </div>
                </div>

                {/* Incoming Ride Alert Modal / Card */}
                {incomingOffer && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border-2 border-amber-400 shadow-2xl space-y-3 relative overflow-hidden animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                        <Bell className="w-4 h-4 animate-bounce" />
                        <span>INCOMING RIDE OFFER (socket.on('ride:new_offer'))</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{incomingOffer.trip_id}</span>
                    </div>

                    <div className="bg-neutral-950/90 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Passenger:</span>
                        <span className="font-bold text-white">{incomingOffer.passenger_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Pickup:</span>
                        <span className="text-amber-300 font-semibold">{incomingOffer.pickup_address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Destination:</span>
                        <span className="text-neutral-200">{incomingOffer.dropoff_address}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-neutral-800">
                        <span className="text-neutral-400">Guaranteed Fare:</span>
                        <span className="font-black text-amber-400 text-sm">
                          {incomingOffer.offered_fare} {incomingOffer.currency}
                        </span>
                      </div>
                    </div>

                    {offerAcceptedStatus === 'driver_accepted' ? (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Ride Accepted! Navigating to Pickup Point</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          onClick={() => handleRespondToOffer(true)}
                          className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Ride</span>
                        </button>
                        <button
                          onClick={() => handleRespondToOffer(false)}
                          className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-neutral-700"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. PASSENGER / DISPATCHER INTERFACE (Right Column) */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-black text-white">Passenger / Dispatcher Terminal</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                    Role: Passenger / Dispatcher
                  </span>
                </div>

                {/* Ride Dispatcher Form */}
                <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Dispatch Ride to Target Driver (ride:request_dispatch)</span>
                    <span className="text-[10px] font-mono text-amber-400">Target: {selectedDriverId}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-400">Passenger Name</label>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-400">Offered Fare Floor</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={dispatchFareValue}
                          onChange={(e) => setDispatchFareValue(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        />
                        <select
                          value={dispatchCurrency}
                          onChange={(e) => setDispatchCurrency(e.target.value)}
                          className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                        >
                          <option value="HTG">HTG</option>
                          <option value="XOF">XOF</option>
                          <option value="KES">KES</option>
                          <option value="USD">USD</option>
                          <option value="COP">COP</option>
                          <option value="GYD">GYD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-400">Pickup Location</label>
                      <input
                        type="text"
                        value={pickupAddr}
                        onChange={(e) => setPickupAddr(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-400">Destination</label>
                      <input
                        type="text"
                        value={dropoffAddr}
                        onChange={(e) => setDropoffAddr(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-dispatch-offer"
                    onClick={handleDispatchRideOffer}
                    disabled={!socketConnected}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Instant Ride Offer to Driver {selectedDriverId}</span>
                  </button>
                </div>

                {/* Real-time Driver GPS Receiver Stream */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Live Telemetry Channel: driver:location:{selectedDriverId}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE BROADCAST
                    </span>
                  </div>

                  {trackedLocation ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                          <span className="text-[10px] text-neutral-400 block">Live Latitude</span>
                          <span className="font-mono text-white font-bold">{trackedLocation.latitude.toFixed(6)}</span>
                        </div>
                        <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                          <span className="text-[10px] text-neutral-400 block">Live Longitude</span>
                          <span className="font-mono text-white font-bold">{trackedLocation.longitude.toFixed(6)}</span>
                        </div>
                        <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                          <span className="text-[10px] text-neutral-400 block">Heading Bearing</span>
                          <span className="font-mono text-amber-400 font-bold">{trackedLocation.heading}°</span>
                        </div>
                      </div>

                      {/* Heading Visual Compass Arrow */}
                      <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            style={{ transform: `rotate(${trackedLocation.heading}deg)` }}
                            className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400 text-amber-400 flex items-center justify-center transition-transform duration-300"
                          >
                            <Navigation className="w-4 h-4 fill-amber-400" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Motorbike Orientation</div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              Pinging GPS coordinates every 1.5s
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(trackedLocation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-neutral-500 text-xs italic">
                      Waiting for driver '{selectedDriverId}' to broadcast GPS telemetry. Start the Auto-GPS stream or click 'Broadcast Single Location Ping'.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. REAL-TIME WEBSOCKET EVENT FEED LOG */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Real-Time WebSocket Frames Feed</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">Total Frames Logged: {socketLogs.length}</span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 max-h-60 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {socketLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 py-0.5 border-b border-neutral-900/80">
                  <span className="text-neutral-500 shrink-0">{log.time}</span>
                  <span
                    className={`px-1.5 rounded text-[10px] font-bold shrink-0 ${
                      log.direction === 'out'
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        : log.direction === 'in'
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {log.direction.toUpperCase()}
                  </span>
                  <span className="text-neutral-300 font-semibold shrink-0">{log.event}:</span>
                  <span className="text-neutral-400 truncate">{JSON.stringify(log.payload)}</span>
                </div>
              ))}
              {socketLogs.length === 0 && (
                <div className="text-center py-4 text-neutral-600 italic">No events logged yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SOURCE CODE & SQL DDL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'code-ddl' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Express Router Code */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>Express 4 Backend Router (src/server/routes.ts)</span>
                </div>
                <button
                  onClick={() => handleCopy(EXPRESS_ROUTER_CODE, 'express')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
                >
                  {copiedCode === 'express' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'express' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[420px]">
                  <code>{EXPRESS_ROUTER_CODE}</code>
                </pre>
              </div>
            </div>

            {/* PostGIS Schema & Spatial DDL */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>PostgreSQL 16 + PostGIS DDL (src/server/schema.sql)</span>
                </div>
                <button
                  onClick={() => handleCopy(SQL_DDL_CODE, 'sql')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
                >
                  {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'sql' ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <pre className="p-4 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed max-h-[420px]">
                  <code>{SQL_DDL_CODE}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Socket.IO Real-Time Engine & Client Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Socket.IO Server Engine (src/server/socket.ts)</span>
                </div>
                <button
                  onClick={() => handleCopy(SOCKET_IO_SERVER_CODE, 'socket-server')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
                >
                  {copiedCode === 'socket-server' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'socket-server' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-[420px]">
                  <code>{SOCKET_IO_SERVER_CODE}</code>
                </pre>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Mobile Client Integration (React Native / Flutter / Web)</span>
                </div>
                <button
                  onClick={() => handleCopy(SOCKET_IO_CLIENT_CODE, 'socket-client')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
                >
                  {copiedCode === 'socket-client' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'socket-client' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <pre className="p-4 text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed max-h-[420px]">
                  <code>{SOCKET_IO_CLIENT_CODE}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

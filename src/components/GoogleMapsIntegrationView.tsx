import React from 'react';
import { MapPin, Navigation, Radio, Shield, Globe, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

export const GoogleMapsIntegrationView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <MapPin className="w-5 h-5" />
          <span>GEOSPATIAL & NAVIGATION PLATFORM</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Google Maps Platform Integration Architecture for Motorcycle Fleet
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Full specification for Routes API (two-wheeler motorcycle routing), Places API (New) with session token
          bundling, landmark-based reverse geocoding for unnumbered Caribbean streets, and battery-efficient GPS telemetry.
        </p>
      </div>

      {/* Modern Google Maps APIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Routes API for Motorcycles */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <Navigation className="w-4 h-4" />
              <span>Routes API (Motorcycle Two-Wheeler Routing)</span>
            </div>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
              Modern Routes API v2
            </span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            Motorcycles in Port-au-Prince, Cayenne, Georgetown, and Paramaribo navigate narrow alleys and unpaved
            shortcuts that cars cannot access. We configure the Routes API computeRoutes endpoint with two-wheeler travel
            mode where supported, factoring in terrain and live traffic.
          </p>

          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
            <div className="text-neutral-500">// Example Server-Side Routes Payload</div>
            <div>POST https://routes.googleapis.com/directions/v2:computeRoutes</div>
            <div className="text-amber-300">
              {JSON.stringify(
                {
                  origin: { location: { latLng: { latitude: 18.5392, longitude: -72.3364 } } },
                  destination: { location: { latLng: { latitude: 18.5142, longitude: -72.2851 } } },
                  travelMode: 'TWO_WHEELER',
                  routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
                  computeAlternativeRoutes: true,
                },
                null,
                2
              )}
            </div>
          </div>
        </div>

        {/* Places API (New) with Session Tokens */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <Globe className="w-4 h-4" />
              <span>Places API (New) & Session Token Bundling</span>
            </div>
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded text-[10px]">
              Pro-Tier Cost Control
            </span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            To prevent excessive API billing during keystroke typing, we utilize `AutocompleteSessionToken`. Keystroke
            suggestions and the final `Place.fetchFields()` are grouped into a single billable Pro-session instead of
            multiple individual query charges.
          </p>

          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
            <div className="text-neutral-500">// Places API (New) Session Pattern</div>
            <div className="text-emerald-400">const sessionToken = new AutocompleteSessionToken();</div>
            <div className="text-neutral-300">
              AutocompleteSuggestion.fetchAutocompleteSuggestions({'{'} input, sessionToken {'}'});
            </div>
            <div className="text-neutral-300">
              place.fetchFields({'{'} fields: ['location', 'displayName'], sessionToken {'}'});
            </div>
          </div>
        </div>

        {/* Hyperlocal Landmark Geocoding */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Landmark Geocoding & Local Point-of-Interest Fallback</span>
            </div>
            <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px]">
              Caribbean Addresses
            </span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            Standard formal house numbering does not exist in many neighborhoods (e.g., Cité Soleil, Bel Air,
            Stabroek hinterlands, Albina). The Wap backend marries Google Geocoding with a proprietary Landmark Dictionary
            (churches, gas stations, schools, police sub-stations, and bridge crossings) stored in PostGIS.
          </p>

          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
            <div className="font-bold text-white">Landmark Resolution Protocol:</div>
            <div>1. Customer inputs "Devan famasi Nouvelle Génération, Delmas 33"</div>
            <div>2. Wap searches local PostGIS verified landmark catalog</div>
            <div>3. If missing, calls Geocoding REST API bounded by city viewport rectangle</div>
            <div>4. Driver app shows map pin + explicit textual landmark hint on the dashboard</div>
          </div>
        </div>

        {/* Battery & Telemetry Protocol */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <Radio className="w-4 h-4" />
              <span>Battery-Efficient Telemetry Protocol</span>
            </div>
            <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px]">
              Low-Data Optimization
            </span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            Motorcycle drivers utilize low-cost Android phones mounted on handlebars under tropical heat and limited
            data balances. The driver app employs adaptive Kalman filtering and dynamic GPS intervals:
          </p>

          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-300 space-y-1 font-mono">
            <div>• In-Transit with passenger: 3-second ping (MQTT QoS 1)</div>
            <div>• Waiting at pickup: 15-second ping</div>
            <div>• Idle/Available on radar: 30-second ping</div>
            <div>• Stationary &gt; 5 minutes: Sleep mode until accelerometer wakes device</div>
          </div>
        </div>
      </div>
    </div>
  );
};

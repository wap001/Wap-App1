import React, { useState } from 'react';
import {
  Flame,
  TrendingUp,
  MapPin,
  Bike,
  Car,
  Layers,
  Info,
  Clock,
  Zap,
  Users,
  AlertCircle,
  Lock,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { FLEET_HEATMAP_DATA, COUNTRY_LOOKUP } from '../data/internationalData';
import { VehicleClass } from '../types/internationalScope';
import { RegionId } from '../types/architecture';

export interface DemandCorridor {
  corridorName: string;
  pickupHotspot: string;
  surge: number;
  waitMin: number;
  motoCount: number;
  status: 'surge' | 'moderate' | 'balanced';
}

export interface RideDemandHeatMapProps {
  region: RegionId;
  activeCountryCode?: string;
  countryCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  onSelectPickupCorridor?: (landmark: string) => void;
  onSelectCorridor?: (corridor: DemandCorridor) => void;
  isEmbedded?: boolean;
}

export const RideDemandHeatMap: React.FC<RideDemandHeatMapProps> = ({
  region,
  activeCountryCode = 'HT',
  countryCode,
  currencyCode,
  currencySymbol,
  onSelectPickupCorridor,
  onSelectCorridor,
  isEmbedded = false,
}) => {
  const initialCountryCode = countryCode || activeCountryCode;
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountryCode);
  const [selectedVehicle, setSelectedVehicle] = useState<'all' | VehicleClass>('all');
  const [activeViewMode, setActiveViewMode] = useState<'grid' | 'visual_map'>('visual_map');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    region === 'senegal'
      ? 'node-dak'
      : region === 'french_guiana'
      ? 'node-cay'
      : region === 'guyana'
      ? 'node-geo'
      : region === 'suriname'
      ? 'node-par'
      : 'node-pap'
  );

  React.useEffect(() => {
    if (region === 'senegal') {
      setSelectedNodeId('node-dak');
      setSelectedCountryCode('SN');
    } else if (region === 'french_guiana') {
      setSelectedNodeId('node-cay');
      setSelectedCountryCode('GF');
    } else if (region === 'guyana') {
      setSelectedNodeId('node-geo');
      setSelectedCountryCode('GY');
    } else if (region === 'suriname') {
      setSelectedNodeId('node-par');
      setSelectedCountryCode('SR');
    } else if (region === 'haiti') {
      setSelectedNodeId('node-pap');
      setSelectedCountryCode('HT');
    }
  }, [region]);

  // Filter nodes according to selected country or region
  const nodes = FLEET_HEATMAP_DATA.filter((n) => n.status !== 'excluded_blocked');
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const country = COUNTRY_LOOKUP[selectedNode?.countryCode || selectedCountryCode] || COUNTRY_LOOKUP['HT'];

  // Sector micro-hotspots for detailed city breakdown
  const cityMicroHotspots: Record<string, Array<{ name: string; surge: number; waitMin: number; motoCount: number; status: 'surge' | 'moderate' | 'balanced' }>> = {
    'HT': [
      { name: 'Delmas 33 & Autoroute Corridor', surge: 1.5, waitMin: 2, motoCount: 84, status: 'surge' },
      { name: 'Pétion-Ville Place Boyer / Saint-Pierre', surge: 1.4, waitMin: 3, motoCount: 68, status: 'surge' },
      { name: 'Toussaint Louverture Airport Road', surge: 1.6, waitMin: 4, motoCount: 45, status: 'surge' },
      { name: 'Carrefour Feuilles / Blvd Jean-Jacques', surge: 1.2, waitMin: 5, motoCount: 38, status: 'moderate' },
      { name: 'Bourdon & Lalue Transit Hub', surge: 1.3, waitMin: 3, motoCount: 52, status: 'moderate' },
      { name: 'Tabarre US Embassy Axis', surge: 1.1, waitMin: 6, motoCount: 29, status: 'balanced' },
    ],
    'DM': [
      { name: 'Roseau Ferry Terminal Waterfront', surge: 1.3, waitMin: 3, motoCount: 22, status: 'surge' },
      { name: 'Old Market Plaza Commercial Sector', surge: 1.25, waitMin: 4, motoCount: 18, status: 'moderate' },
      { name: 'Canefield Highway Gateway', surge: 1.15, waitMin: 5, motoCount: 14, status: 'balanced' },
      { name: 'Melville Hall Airport Transit', surge: 1.4, waitMin: 8, motoCount: 10, status: 'surge' },
    ],
    'GF': [
      { name: 'Place des Palmistes Centre-Ville', surge: 1.35, waitMin: 4, motoCount: 28, status: 'surge' },
      { name: 'Zone Industrielle Collery', surge: 1.2, waitMin: 6, motoCount: 24, status: 'moderate' },
      { name: 'Aéroport Félix Éboué Matoury', surge: 1.45, waitMin: 5, motoCount: 24, status: 'surge' },
    ],
    'GY': [
      { name: 'Stabroek Market & Demerara Ferry', surge: 1.3, waitMin: 3, motoCount: 42, status: 'surge' },
      { name: 'Sheriff Street Night Corridor', surge: 1.4, waitMin: 3, motoCount: 36, status: 'surge' },
      { name: 'Bourda Market Central Avenue', surge: 1.15, waitMin: 5, motoCount: 26, status: 'balanced' },
    ],
    'SR': [
      { name: 'Waterkant & Central Market Hub', surge: 1.25, waitMin: 4, motoCount: 34, status: 'moderate' },
      { name: 'Hermitage Mall / Commewijne Link', surge: 1.2, waitMin: 5, motoCount: 28, status: 'moderate' },
      { name: 'Johan Adolf Pengel Airport Route', surge: 1.35, waitMin: 7, motoCount: 18, status: 'surge' },
    ],
    'SN': [
      { name: 'Dakar Plateau & Place de l’Indépendance', surge: 1.45, waitMin: 2, motoCount: 92, status: 'surge' },
      { name: 'Almadies & Corniche Ouest Axis', surge: 1.5, waitMin: 3, motoCount: 74, status: 'surge' },
      { name: 'Médina & Marché Sandaga Hub', surge: 1.35, waitMin: 3, motoCount: 65, status: 'surge' },
      { name: 'Aéroport International Blaise Diagne (AIBD)', surge: 1.6, waitMin: 5, motoCount: 48, status: 'surge' },
      { name: 'Grand Yoff & Patte d’Oie Carrefour', surge: 1.25, waitMin: 4, motoCount: 56, status: 'moderate' },
      { name: 'Thiès Gare Routière & Centre Commercial', surge: 1.15, waitMin: 5, motoCount: 38, status: 'balanced' },
    ],
  };

  const currentHotspots = cityMicroHotspots[selectedNode.countryCode] || cityMicroHotspots['HT'];

  return (
    <div
      id="ride-demand-heatmap-container"
      className="bg-white border border-sky-200 rounded-2xl overflow-hidden shadow-lg space-y-4 p-4 sm:p-5 text-slate-900"
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-700/20 border border-sky-500/40 flex items-center justify-center text-sky-700 shadow-inner">
            <Flame className="w-5 h-5 text-sky-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Live Ride Demand Heat Map
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                Surge Radar
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Real-time Passenger Density, Surge Multipliers &amp; Driver Clusters
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-sky-50 border border-sky-200 p-0.5 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setActiveViewMode('visual_map')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeViewMode === 'visual_map'
                  ? 'bg-sky-700 text-white shadow'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Surge Radar Map
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeViewMode === 'grid'
                  ? 'bg-sky-700 text-white shadow'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              City Nodes ({nodes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Country City Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {nodes.map((node) => {
          const isSelected = node.id === selectedNode.id;
          const nodeCountry = COUNTRY_LOOKUP[node.countryCode];
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => {
                setSelectedNodeId(node.id);
                setSelectedCountryCode(node.countryCode);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 border transition cursor-pointer ${
                isSelected
                  ? 'bg-sky-700 border-sky-800 text-white shadow-md ring-2 ring-sky-400/40'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span>{nodeCountry?.flag || '🌐'}</span>
              <span>{node.city}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  node.demandSurgeLevel >= 1.4
                    ? isSelected ? 'bg-red-500 text-white font-bold' : 'bg-red-100 text-red-700 font-bold'
                    : node.demandSurgeLevel >= 1.2
                    ? isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-amber-100 text-amber-800 font-bold'
                    : isSelected ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {node.demandSurgeLevel}x
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Map View */}
      {activeViewMode === 'visual_map' && (
        <div className="space-y-4">
          {/* Main Visual Simulation Canvas with Heat Glow Radials */}
          <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-inner">
            {/* SVG Grid and Thermal Radials */}
            <svg className="absolute inset-0 w-full h-full" width="100%" height="100%">
              <defs>
                <pattern id="heatmap-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                </pattern>
                
                {/* Radial Thermal Gradients */}
                <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(239, 68, 68, 0.65)" />
                  <stop offset="40%" stopColor="rgba(245, 158, 11, 0.45)" />
                  <stop offset="80%" stopColor="rgba(245, 158, 11, 0.1)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>

                <radialGradient id="heat-moderate" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(245, 158, 11, 0.6)" />
                  <stop offset="50%" stopColor="rgba(245, 158, 11, 0.25)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>

                <radialGradient id="heat-balanced" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.5)" />
                  <stop offset="60%" stopColor="rgba(16, 185, 129, 0.15)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
              </defs>

              {/* Grid Background */}
              <rect width="100%" height="100%" fill="url(#heatmap-grid)" />

              {/* Highway Corridors */}
              <path d="M 40 180 Q 200 130 380 210 T 600 120" fill="none" stroke="#222" strokeWidth="12" strokeLinecap="round" />
              <path d="M 120 20 Q 190 140 220 280" fill="none" stroke="#222" strokeWidth="10" strokeLinecap="round" />
              <path d="M 420 20 Q 380 150 490 280" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />

              {/* Demand Heat Blooms */}
              {/* Cluster 1: High Surge Airport / Downtown Hub */}
              <circle cx="280" cy="140" r="95" fill="url(#heat-high)" className="animate-pulse" />
              {/* Cluster 2: Moderate Surge Commercial Axis */}
              <circle cx="150" cy="190" r="70" fill="url(#heat-moderate)" />
              {/* Cluster 3: Balanced Residential Basin */}
              <circle cx="440" cy="90" r="60" fill="url(#heat-balanced)" />
              {/* Cluster 4: High Density Pickup Intersection */}
              <circle cx="390" cy="220" r="75" fill="url(#heat-high)" />

              {/* Hotspot Markers */}
              <circle cx="280" cy="140" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <circle cx="150" cy="190" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="440" cy="90" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="390" cy="220" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Map Top Telemetry Bar */}
            <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-700/70 px-3 py-1 rounded-full text-[11px] text-white flex items-center gap-2 shadow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold">{selectedNode.city}, {country.name}</span>
                <span className="text-neutral-400 font-mono text-[10px]">
                  [{selectedNode.coordinates.lat.toFixed(3)}, {selectedNode.coordinates.lng.toFixed(3)}]
                </span>
              </div>

              <div className="bg-neutral-900/90 backdrop-blur-md border border-amber-400/40 px-3 py-1 rounded-full text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1.5 shadow">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Base Surge: {selectedNode.demandSurgeLevel}x</span>
              </div>
            </div>

            {/* Interactive Hotspot Pills overlaid on Map */}
            <div
              className="absolute top-[90px] left-[220px] bg-neutral-950/90 border border-red-500/80 rounded-lg px-2.5 py-1 text-[11px] shadow-lg cursor-pointer hover:scale-105 transition"
              onClick={() => onSelectPickupCorridor && onSelectPickupCorridor(currentHotspots[0]?.name || 'Central Corridor')}
            >
              <div className="font-bold text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>{currentHotspots[0]?.name.split('&')[0] || 'Airport Corridor'}</span>
              </div>
              <div className="text-[10px] text-neutral-300 flex items-center justify-between gap-2 mt-0.5">
                <span>{currentHotspots[0]?.surge || 1.5}x Surge</span>
                <span className="text-amber-400 font-mono">{currentHotspots[0]?.waitMin || 2}m ETA</span>
              </div>
            </div>

            <div
              className="absolute top-[150px] left-[90px] bg-neutral-950/90 border border-amber-500/80 rounded-lg px-2.5 py-1 text-[11px] shadow-lg cursor-pointer hover:scale-105 transition"
              onClick={() => onSelectPickupCorridor && onSelectPickupCorridor(currentHotspots[1]?.name || 'Market Corridor')}
            >
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <span>{currentHotspots[1]?.name.split('/')[0] || 'Commerce Axis'}</span>
              </div>
              <div className="text-[10px] text-neutral-300 flex items-center justify-between gap-2 mt-0.5">
                <span>{currentHotspots[1]?.surge || 1.3}x Surge</span>
                <span className="text-emerald-400 font-mono">{currentHotspots[1]?.waitMin || 3}m ETA</span>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="absolute bottom-2.5 left-3 bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-lg px-3 py-1.5 text-[10px] text-neutral-300 flex items-center gap-3">
              <span className="font-semibold text-neutral-400">Demand Scale:</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Peak Surge (1.5x+)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>High (1.2x-1.4x)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Normal (1.0x-1.15x)</span>
              </div>
            </div>
          </div>

          {/* Detailed Corridor Hotspots List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-700" />
                <span>Active Demand Corridors in {selectedNode.city}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Tap corridor to set pickup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentHotspots.map((spot, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (onSelectPickupCorridor) onSelectPickupCorridor(spot.name);
                    if (onSelectCorridor) {
                      onSelectCorridor({
                        corridorName: `${spot.name} → Central Hub`,
                        pickupHotspot: spot.name,
                        surge: spot.surge,
                        waitMin: spot.waitMin,
                        motoCount: spot.motoCount,
                        status: spot.status,
                      });
                    }
                  }}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 text-xs cursor-pointer shadow-sm ${
                    spot.status === 'surge'
                      ? 'bg-red-50/80 border-red-200 hover:bg-red-100/70 hover:border-red-300'
                      : spot.status === 'moderate'
                      ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/70 hover:border-amber-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        spot.status === 'surge' ? 'bg-red-500 animate-ping' : spot.status === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span className="truncate">{spot.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-2">
                      <span className="font-medium">{spot.motoCount} Active Motos</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">~{spot.waitMin} min wait</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      spot.status === 'surge'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : spot.status === 'moderate'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {spot.surge}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid Mode: All City Nodes Overview */}
      {activeViewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nodes.map((node) => {
            const nodeCountry = COUNTRY_LOOKUP[node.countryCode];
            const isCurrent = node.id === selectedNode.id;

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setSelectedCountryCode(node.countryCode);
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer shadow-sm ${
                  isCurrent
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="text-base">{nodeCountry?.flag}</span>
                    <span>{node.city}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({node.countryCode})
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      node.demandSurgeLevel >= 1.4
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : node.demandSurgeLevel >= 1.2
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    Surge: {node.demandSurgeLevel}x
                  </span>
                </div>

                {/* Fleet Breakdown */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2">
                  <div>
                    <div className="text-slate-500 font-medium">2-Wheeler</div>
                    <div className="font-bold text-amber-600 font-mono mt-0.5">
                      {node.activeTwoWheelers}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Tuk-Tuk</div>
                    <div className="font-bold text-sky-700 font-mono mt-0.5">
                      {node.activeThreeWheelers}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Cabs</div>
                    <div className="font-bold text-emerald-700 font-mono mt-0.5">
                      {node.activeFourWheelers}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-medium">Driver Avg/Hr:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ${node.averageHourlyEarningUSD.toFixed(2)} USD
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Demand & Pricing Education Footer */}
      <div className="pt-2 border-t border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-700 shrink-0" />
          <span>Surge multipliers incentivize more nearby moto drivers to head toward high-demand sectors.</span>
        </div>
        <div className="text-sky-800 font-semibold flex items-center gap-1">
          <Zap className="w-3 h-3 text-sky-600" />
          <span>LBC Cashback applies to full surge fare</span>
        </div>
      </div>
    </div>
  );
};

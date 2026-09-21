import React, { useEffect, useState } from 'react';
import { Navigation, Bike, Compass, ShieldAlert, Radio, Flame } from 'lucide-react';
import { ActiveOrder, RegionId } from '../types/architecture';

interface LiveRouteMapProps {
  order: ActiveOrder;
  region: RegionId;
  isOffline?: boolean;
}

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({ order, region, isOffline }) => {
  const [progress, setProgress] = useState(0.42); // 0.0 to 1.0 along the route
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Animate motorcycle along the polyline
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 1.0 ? 0.05 : prev + 0.015));
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Generate an SVG path between pickup and dropoff
  const width = 580;
  const height = 300;

  // Waypoints in local canvas space
  const pickupPoint = { x: 90, y: 220 };
  const dropoffPoint = { x: 490, y: 70 };
  const intermediatePoint1 = { x: 210, y: 190 };
  const intermediatePoint2 = { x: 340, y: 110 };

  // Calculate current motorcycle position using cubic bezier approximation
  const t = progress;
  const mt = 1 - t;
  const motoX =
    mt * mt * mt * pickupPoint.x +
    3 * mt * mt * t * intermediatePoint1.x +
    3 * mt * t * t * intermediatePoint2.x +
    t * t * t * dropoffPoint.x;
  const motoY =
    mt * mt * mt * pickupPoint.y +
    3 * mt * mt * t * intermediatePoint1.y +
    3 * mt * t * t * intermediatePoint2.y +
    t * t * t * dropoffPoint.y;

  const currentSpeed = isOffline ? 0 : Math.round(28 + Math.sin(t * 10) * 8);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-sky-300 shadow-md relative">
      {/* Map Header Status Bar */}
      <div className="bg-gradient-to-r from-sky-800 to-sky-950 px-4 py-2 border-b border-sky-700 flex items-center justify-between text-xs text-sky-100">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOffline ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOffline ? 'bg-red-500' : 'bg-emerald-500'}`} />
          </span>
          <span className="font-bold text-white tracking-wide">
            {isOffline ? 'Offline GPS Dead-Reckoning' : 'Google Maps Routes API + MQTT Stream'}
          </span>
          <span className="bg-sky-900/90 text-sky-200 border border-sky-600 px-1.5 py-0.5 rounded font-mono text-[10px]">
            QoS 1 • Latency 42ms
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
              showHeatmap
                ? 'bg-amber-400 text-neutral-950 shadow'
                : 'bg-sky-900/80 hover:bg-sky-800 text-white border border-sky-600'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-neutral-950 fill-neutral-950' : 'text-amber-400'}`} />
            <span>{showHeatmap ? 'Surge Map: ON' : 'Surge Map'}</span>
          </button>
          <span className="font-mono text-amber-300 font-bold">{currentSpeed} km/h</span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2 py-0.5 rounded bg-sky-900/80 hover:bg-sky-800 text-white border border-sky-600 text-[11px] font-medium transition cursor-pointer"
          >
            {isPlaying ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* SVG Canvas representing Road Grid & Motorcycle Telemetry */}
      <div className="relative w-full h-[300px] bg-gradient-to-b from-neutral-950 to-neutral-900 overflow-hidden select-none">
        {/* Decorative Grid Lines */}
        <svg className="absolute inset-0 w-full h-full stroke-neutral-800/40" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>

            {/* Demand Thermal Radial Gradients */}
            <radialGradient id="map-heat-pickup" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
              <stop offset="50%" stopColor="rgba(245, 158, 11, 0.3)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>
            <radialGradient id="map-heat-surge" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.55)" />
              <stop offset="60%" stopColor="rgba(245, 158, 11, 0.15)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Demand Surge Heat Layer */}
          {showHeatmap && (
            <g className="animate-fadeIn">
              <circle cx={pickupPoint.x} cy={pickupPoint.y} r="85" fill="url(#map-heat-pickup)" className="animate-pulse" />
              <circle cx={intermediatePoint2.x} cy={intermediatePoint2.y} r="65" fill="url(#map-heat-surge)" />
              <circle cx={dropoffPoint.x} cy={dropoffPoint.y} r="55" fill="url(#map-heat-surge)" />
            </g>
          )}

          {/* Background Street Curves */}
          <path d="M 0 160 Q 150 140 300 200 T 600 240" fill="none" stroke="#262626" strokeWidth="14" strokeLinecap="round" />
          <path d="M 120 0 Q 180 150 140 300" fill="none" stroke="#262626" strokeWidth="10" strokeLinecap="round" />
          <path d="M 400 0 Q 360 140 450 300" fill="none" stroke="#262626" strokeWidth="12" strokeLinecap="round" />

          {/* Active Motorcycle Calculated Route Path */}
          <path
            d={`M ${pickupPoint.x} ${pickupPoint.y} C ${intermediatePoint1.x} ${intermediatePoint1.y}, ${intermediatePoint2.x} ${intermediatePoint2.y}, ${dropoffPoint.x} ${dropoffPoint.y}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Traveled portion (Solid Amber) */}
          <path
            d={`M ${pickupPoint.x} ${pickupPoint.y} C ${intermediatePoint1.x} ${intermediatePoint1.y}, ${intermediatePoint2.x} ${intermediatePoint2.y}, ${dropoffPoint.x} ${dropoffPoint.y}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${progress * 500} 1000`}
          />

          {/* Pickup Waypoint Circle */}
          <circle cx={pickupPoint.x} cy={pickupPoint.y} r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          {/* Dropoff Waypoint Circle */}
          <circle cx={dropoffPoint.x} cy={dropoffPoint.y} r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
        </svg>

        {/* Pickup Landmark Overlay */}
        <div
          className="absolute bg-white/95 border-2 border-emerald-500 rounded-lg px-2.5 py-1 text-[11px] shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${pickupPoint.x}px`, top: `${pickupPoint.y - 12}px` }}
        >
          <div className="font-bold text-emerald-800">Pickup Point</div>
          <div className="truncate max-w-[140px] text-slate-900 font-semibold">{order.pickupLandmark}</div>
        </div>

        {/* Dropoff Landmark Overlay */}
        <div
          className="absolute bg-white/95 border-2 border-red-500 rounded-lg px-2.5 py-1 text-[11px] shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${dropoffPoint.x}px`, top: `${dropoffPoint.y - 12}px` }}
        >
          <div className="font-bold text-red-700">Destination</div>
          <div className="truncate max-w-[140px] text-slate-900 font-semibold">{order.dropoffLandmark}</div>
        </div>

        {/* Animated Moving Motorcycle Avatar */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none z-10"
          style={{ left: `${motoX}px`, top: `${motoY}px` }}
        >
          <div className="relative">
            {/* Pulse Ripple */}
            <div className="absolute -inset-2 bg-sky-400/40 rounded-full animate-ping" />
            <div className="w-9 h-9 rounded-full bg-amber-400 border-2 border-slate-900 shadow-xl flex items-center justify-center text-slate-950 font-bold">
              <Bike className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            {/* Compass Heading Arrow */}
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-900 text-amber-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow">
              {Math.round((1 - progress) * order.estimatedMinutes)} min left
            </div>
          </div>
        </div>

        {/* Telemetry HUD Inset in corner */}
        <div className="absolute bottom-2.5 left-2.5 bg-slate-950/95 border border-sky-500/60 rounded-xl p-2.5 text-[11px] text-slate-200 backdrop-blur max-w-[250px] shadow-xl">
          <div className="flex items-center gap-1.5 font-bold text-white mb-1">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Driver Telemetry (Haojin 150)</span>
          </div>
          <div className="text-[10px] space-y-0.5 text-slate-300 font-mono">
            <div>Driver: <span className="text-white font-semibold">{order.driver?.fullName || 'Jean-Baptiste Voltaire'}</span></div>
            <div>Plate: <span className="text-amber-300 font-semibold">{order.driver?.plateNumber || 'MC-89421-HT'}</span></div>
            <div>Helmet: <span className="text-emerald-400 font-semibold">Verified (ECE 22.06)</span></div>
            <div>Remaining: <span className="text-sky-300 font-semibold">{(order.distanceKm * (1 - progress)).toFixed(1)} km</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

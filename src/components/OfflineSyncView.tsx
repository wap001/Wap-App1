import React, { useState } from 'react';
import { WifiOff, RefreshCw, Smartphone, Database, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export const OfflineSyncView: React.FC = () => {
  const [testEvents, setTestEvents] = useState([
    { id: 'EVT-901', type: 'TRIP_START_OFFLINE', timestamp: '10:04:12', payload: 'GPS: 18.539, -72.336 (Delmas 33)', status: 'Reconciled' },
    { id: 'EVT-902', type: 'CASH_COLLECTION_OFFLINE', timestamp: '10:18:45', payload: 'Collected 350 HTG from Daphnée', status: 'Reconciled' },
    { id: 'EVT-903', type: 'TRIP_COMPLETED_OFFLINE', timestamp: '10:19:02', payload: 'Destination: Pétion-Ville (Signed HMAC)', status: 'Queued in Local Storage' },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setTestEvents((prev) =>
        prev.map((e) => ({ ...e, status: 'Reconciled & Pushed to Postgres' }))
      );
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <WifiOff className="w-5 h-5" />
          <span>OFFLINE CACHING & RESILIENT DATA SYNCHRONIZATION</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Edge-Resilient Data Architecture & USSD/SMS Fallback Engine
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Caribbean and Guiana cell coverage can be unstable during blackouts or in mountain valleys. Wap implements an
          offline-first architecture that allows trips to start, navigate, calculate fares, and exchange cryptographically
          signed receipts with zero internet connection, syncing seamlessly once network is restored.
        </p>
      </div>

      {/* Offline Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2.5 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <Database className="w-4 h-4" />
            <span>1. Client Local Storage</span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            Native mobile uses <span className="font-semibold text-white">SQLite + WatermelonDB</span>; web PWA uses{' '}
            <span className="font-semibold text-white">IndexedDB</span> managed by Workbox Service Worker. Local vector maps
            and merchant directories are pre-cached on Wi-Fi.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2.5 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>2. Write-Ahead Sync Queue</span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            Mutations (ride acceptances, trip starts, cash collections) generate a UUID v4 idempotency key and are appended
            to an encrypted local queue. An exponential backoff background task synchronizes whenever HTTP 200 is reachable.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2.5 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-purple-400 text-sm">
            <Smartphone className="w-4 h-4" />
            <span>3. USSD / SMS Fallback</span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            If mobile packet data fails for &gt; 10 minutes, critical state updates (e.g. Emergency SOS, ride completed) can
            be serialized into a 140-character SMS payload sent to Wap’s Twilio/Digicel shortcode gateway.
          </p>
        </div>
      </div>

      {/* Interactive Sync Queue Simulator */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Live Write-Ahead Queue Simulator (Client-Side IndexedDB / SQLite)</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Simulates events generated while a moto driver navigates through a cellular dead zone.
            </p>
          </div>

          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Reconciling with Cloud SQL...' : 'Simulate Network Reconnect & Sync'}</span>
          </button>
        </div>

        <div className="divide-y divide-neutral-800">
          {testEvents.map((evt) => (
            <div key={evt.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-bold">{evt.id}</span>
                  <span className="font-bold text-white">{evt.type}</span>
                  <span className="text-[11px] text-neutral-500 font-mono">@{evt.timestamp}</span>
                </div>
                <div className="text-neutral-400 text-[11px] font-mono">{evt.payload}</div>
              </div>

              <div>
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    evt.status.includes('Queued')
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {evt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

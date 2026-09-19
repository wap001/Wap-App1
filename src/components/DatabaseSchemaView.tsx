import React, { useState } from 'react';
import { Database, Code2, Layers, Key, Shield, Check, Copy } from 'lucide-react';
import { DATABASE_SCHEMAS } from '../data/architectureContent';

export const DatabaseSchemaView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<keyof typeof DATABASE_SCHEMAS>('usersTable');
  const [copied, setCopied] = useState(false);

  const tableList: { key: keyof typeof DATABASE_SCHEMAS; name: string; description: string; icon: string }[] = [
    { key: 'usersTable', name: 'users (Profiles & Diaspora KYC)', description: 'Multi-region residency, dual-SIM, refugee/community ID options, multi-currency wallet balance.', icon: '👤' },
    { key: 'driversTable', name: 'drivers (Fleet & Helmets)', description: 'Motorcycle make/engine cc, PostGIS location point, helmet safety compliance, cash escrow limit.', icon: '🏍️' },
    { key: 'vendorsTable', name: 'vendors (Local Merchants)', description: 'Restaurants, grocery markets, auto-parts; landmark addressing and auto-dispatch moto trigger.', icon: '🏪' },
    { key: 'ordersTable', name: 'orders (Rides & Courier Deliveries)', description: 'Full state machine, distance/time, fare currency breakdown, pickup/dropoff geometry waypoints.', icon: '📦' },
    { key: 'offlineSyncTable', name: 'offline_sync_events (Sync Log)', description: 'Idempotency keys, offline write-ahead mutations, conflict resolution and SMS fallback records.', icon: '⚡' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(DATABASE_SCHEMAS[selectedTable]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <Database className="w-5 h-5" />
          <span>RELATIONAL & POSTGIS SPATIAL DATABASE ARCHITECTURE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          PostgreSQL 16 + PostGIS Schemas for Caribbean Diaspora Logistics
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Specifically tailored for immigrant populations with flexible KYC documents (temporary residence, passport,
          community attestations), unnumbered street landmark geometries (<code className="text-amber-300 font-mono">GEOMETRY(Point, 4326)</code>),
          and strict Cash-on-Delivery escrow thresholds to prevent driver theft or liquidity default.
        </p>
      </div>

      {/* ERD Summary Matrix */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Entity-Relationship Architecture Overview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-white">Spatial Geohash Queries</div>
            <p className="text-neutral-400 text-[11px]">
              PostGIS GIST index on <code className="text-amber-300">drivers.current_coordinates</code> allows
              sub-millisecond ST_DWithin radius scans for closest idle moto within 2.5 km.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-white">Diaspora KYC & Wallets</div>
            <p className="text-neutral-400 text-[11px]">
              Accepts Haiti CIN, Guyane Carte de Séjour / Demandeur d’Asile, Guyana National ID, or Suriname e-ID,
              with multi-currency wallets (HTG, EUR, GYD, SRD, USD).
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-white">Cash Escrow Safeguard</div>
            <p className="text-neutral-400 text-[11px]">
              Enforces <code className="text-amber-300">cod_escrow_holding &lt;= cod_escrow_limit</code>. When cash collected
              reaches the threshold, dispatch locks until the driver remits funds via MonCash or bank agent.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Schema Selector */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex flex-wrap gap-2">
            {tableList.map((tbl) => (
              <button
                key={tbl.key}
                onClick={() => setSelectedTable(tbl.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedTable === tbl.key
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{tbl.icon}</span>
                <span>{tbl.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied SQL DDL' : 'Copy DDL'}</span>
          </button>
        </div>

        {/* Selected Table Description */}
        <div className="text-xs text-neutral-300 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
          <span className="font-bold text-amber-400">Target Table: </span>
          <span>{tableList.find((t) => t.key === selectedTable)?.description}</span>
        </div>

        {/* SQL Code Block */}
        <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[480px]">
            <code>{DATABASE_SCHEMAS[selectedTable].trim()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

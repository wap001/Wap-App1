import React from 'react';
import {
  Layers,
  Server,
  Smartphone,
  Database,
  Radio,
  Shield,
  Wifi,
  Cpu,
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { TECH_STACK } from '../data/architectureContent';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 text-amber-400 font-bold text-sm mb-2">
          <Layers className="w-5 h-5" />
          <span>WAP FULL-STACK PLATFORM ARCHITECTURE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Distributed Microservices & Hyperlocal Telemetry for Caribbean & Guiana Frontiers
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed max-w-4xl">
          Architected for high-density traffic, unpredictable 2G/3G connectivity, unstandardized street addresses,
          cash-heavy immigrant economies, and multi-language diaspora communities across Haiti (Pòtoprens),
          French Guiana (Cayenne/Kourou), Guyana (Georgetown), and Suriname (Paramaribo).
        </p>
      </div>

      {/* System Topology Diagram */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <span>High-Level System Topology & Ingress Flow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Client Edge Layer */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Smartphone className="w-4 h-4" />
              <span>1. Client Edge Layer</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              React Native 0.76+ & Flutter Mobile Binaries + Next.js 15 PWA with offline Service Worker & IndexedDB.
            </p>
            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 space-y-1 text-[10px] font-mono text-neutral-300">
              <div>• Customer Mobile App</div>
              <div>• Driver Telemetry App</div>
              <div>• Vendor Kiosk Web App</div>
              <div>• SMS/USSD Fallback Terminal</div>
            </div>
          </div>

          {/* Gateway & Mesh Layer */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Server className="w-4 h-4" />
              <span>2. API & Real-time Mesh</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Kong API Gateway with Envoy edge proxies and EMQX MQTT cluster for sub-second telemetry pings.
            </p>
            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 space-y-1 text-[10px] font-mono text-neutral-300">
              <div>• MQTT Broker (QoS 1 telemetry)</div>
              <div>• JWT Auth & Rate Limiter</div>
              <div>• Regional GeoDNS Pods</div>
              <div>• WebSocket Push Fallback</div>
            </div>
          </div>

          {/* Core Services Layer */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <Layers className="w-4 h-4" />
              <span>3. Microservices Core</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Containerized Go 1.23 & Fastify Node.js services running across Caribbean & South American edge nodes.
            </p>
            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 space-y-1 text-[10px] font-mono text-neutral-300">
              <div>• Go Spatial Dispatch Engine</div>
              <div>• Ride Lifecycle State Machine</div>
              <div>• Multi-Currency Wallet Ledger</div>
              <div>• Diaspora KYC & Identity Svc</div>
            </div>
          </div>

          {/* Storage & External Layer */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-400">
              <Database className="w-4 h-4" />
              <span>4. Storage & Integrations</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              PostgreSQL 16 + PostGIS extension, Redis 7.2 Geo cluster, Google Maps Platform & Telco payment APIs.
            </p>
            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 space-y-1 text-[10px] font-mono text-neutral-300">
              <div>• PostGIS Spatial Tables</div>
              <div>• Redis H3 Spatial Index</div>
              <div>• MonCash / Natcash / Stripe</div>
              <div>• Google Routes & Places API</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Component Breakdown */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Production Tech Stack & Architectural Justifications</span>
        </h2>

        <div className="divide-y divide-neutral-800">
          {TECH_STACK.map((item, idx) => (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{item.layer}</span>
              </div>
              <div className="text-amber-300 font-mono text-[11px]">{item.technology}</div>
              <div className="text-neutral-300">{item.purpose}</div>
              <div className="text-neutral-400 text-[11px] italic">{item.justification}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

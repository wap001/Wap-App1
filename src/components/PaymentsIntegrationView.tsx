import React from 'react';
import { CreditCard, DollarSign, Shield, ArrowRight, Smartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { PAYMENT_SPECS } from '../data/architectureContent';

export const PaymentsIntegrationView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <CreditCard className="w-5 h-5" />
          <span>PAYMENT GATEWAY & RECONCILIATION ENGINE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Hyperlocal Payment Gateways, Mobile Wallets & Cash-on-Delivery Escrow
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Because up to 70% of transactions in Haiti, Guyana, and Suriname rely on mobile money or physical cash,
          while French Guiana operates under strict EU banking (EUR / SEPA / Carte Bancaire), Wap implements a dual
          fiat-and-mobile-money payments routing hub with driver cash-on-delivery escrow caps.
        </p>
      </div>

      {/* Regional Gateway Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {PAYMENT_SPECS.map((spec, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-sm">{spec.region}</div>
              <span className="font-mono text-amber-400 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                {spec.currency}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-400 text-[11px]">Primary Integrations:</div>
              <div className="flex flex-wrap gap-1.5">
                {spec.primaryGateways.map((g) => (
                  <span key={g} className="bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 text-[11px]">
              <div>
                <span className="font-bold text-neutral-300">API Architecture: </span>
                <span className="text-neutral-400">{spec.apiDetails}</span>
              </div>
              <div>
                <span className="font-bold text-neutral-300">Transaction Flow: </span>
                <span className="text-neutral-400">{spec.flow}</span>
              </div>
              <div>
                <span className="font-bold text-neutral-300">Driver Settlement: </span>
                <span className="text-emerald-400">{spec.settlement}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cash-on-Delivery (COD) Digital Escrow Flow */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Cash-on-Delivery (COD) Reconciliation & Driver Escrow Safeguard</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="font-bold text-amber-400">1. Floating Cash Ledger</div>
            <p className="text-neutral-400 text-[11px]">
              When a passenger or parcel recipient hands paper notes to a motorcycle driver, the driver confirms collection.
              The Wap system debits the driver’s in-app digital balance and credits the merchant/platform.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="font-bold text-red-400">2. Hard Escrow Threshold</div>
            <p className="text-neutral-400 text-[11px]">
              Each driver has an escrow limit (e.g. 5,000 HTG / 15,000 GYD / 150 EUR). If physical cash collected exceeds
              this limit, new ride dispatches are temporarily locked until the driver deposits funds.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="font-bold text-emerald-400">3. Agent Remittance Clearing</div>
            <p className="text-neutral-400 text-[11px]">
              Drivers clear their escrow balance by transferring via MonCash, Natcash, MMG, or handing cash to an authorized
              Wap regional kiosk or gas station partner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

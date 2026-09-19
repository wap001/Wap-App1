import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe,
  TrendingUp,
  DollarSign,
  Layers,
  MapPin,
  RefreshCw,
  Lock,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Activity,
  Bike,
  Car,
  Filter,
  BarChart3,
  Server
} from 'lucide-react';
import {
  OPERATIONAL_COUNTRIES,
  FLEET_HEATMAP_DATA,
  VEHICLE_CLASSES,
  COUNTRY_LOOKUP
} from '../data/internationalData';
import { CountryOperationalConfig, VehicleClass } from '../types/internationalScope';

export const AdminOperationsConsole: React.FC = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('HT');
  const [activeTab, setActiveTab] = useState<'heatmaps' | 'fx_rates' | 'trip_floors' | 'surge_caps' | 'rate_controls' | 'geofence_audit'>('heatmaps');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleClass>('all');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    OPERATIONAL_COUNTRIES.reduce((acc, c) => {
      acc[c.currencyCode] = c.exchangeRateToUSD;
      return acc;
    }, {} as Record<string, number>)
  );

  // Mutable country config states for manual rate-adjustment simulation
  const [countryConfigs, setCountryConfigs] = useState<Record<string, CountryOperationalConfig>>(
    OPERATIONAL_COUNTRIES.reduce((acc, c) => {
      acc[c.code] = { ...c };
      return acc;
    }, {} as Record<string, CountryOperationalConfig>)
  );

  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('12:15:00 UTC (Live Stream)');
  const [isRefreshingFx, setIsRefreshingFx] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedCountry = countryConfigs[selectedCountryCode] || countryConfigs['HT'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefreshFx = () => {
    setIsRefreshingFx(true);
    setTimeout(() => {
      setExchangeRates((prev) => ({
        ...prev,
        HTG: Number((132 + (Math.random() - 0.5) * 1.5).toFixed(2)),
        COP: Number((4100 + (Math.random() - 0.5) * 25).toFixed(0)),
        BRL: Number((5.45 + (Math.random() - 0.5) * 0.05).toFixed(3)),
        KES: Number((129 + (Math.random() - 0.5) * 0.8).toFixed(2)),
        XOF: Number((605 + (Math.random() - 0.5) * 3).toFixed(1)),
        EGP: Number((48.5 + (Math.random() - 0.5) * 0.4).toFixed(2))
      }));
      setLastRefreshedTime(new Date().toLocaleTimeString() + ' (ECB/Reuters Direct)');
      setIsRefreshingFx(false);
      showToast('Exchange rates updated from Reuters / Central Bank FX stream.');
    }, 900);
  };

  const handleUpdateCountryRate = (
    field: 'baseFareUSD' | 'perMinuteRateUSD' | 'perKmRateUSD' | 'minimumTripFloorUSD' | 'surgeCapMultiplier',
    val: number
  ) => {
    setCountryConfigs((prev) => ({
      ...prev,
      [selectedCountryCode]: {
        ...prev[selectedCountryCode],
        [field]: val
      }
    }));
    showToast(`Updated ${field} for ${selectedCountry.name} to ${val}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>GLOBAL DISPATCH & REGULATORY OPERATIONS CONSOLE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Wap Multi-Modal Central Control Center
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
            Real-time fleet telemetry, multi-currency algorithmic pricing, automated minimum earnings floor management,
            and strict geofence compliance across North America, Central America, Caribbean, South America, and Africa.
          </p>
        </div>

        {/* Global Key Metrics */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
            <div className="text-neutral-500 text-[10px]">Active Countries</div>
            <div className="text-sm font-bold text-white">18 Operative</div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
            <div className="text-neutral-500 text-[10px]">Strict Exclusions</div>
            <div className="text-sm font-bold text-red-400">Argentina & Uruguay</div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
            <div className="text-neutral-500 text-[10px]">Target Earnings Floor</div>
            <div className="text-sm font-bold text-emerald-400">$5.00 - $12.00 / hr</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-1.5 border-b border-neutral-800 pb-2 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('heatmaps')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'heatmaps'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Fleet Heatmaps & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('fx_rates')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'fx_rates'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-Time Currency Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('trip_floors')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'trip_floors'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Minimum Trip Floor Management</span>
        </button>

        <button
          onClick={() => setActiveTab('surge_caps')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'surge_caps'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Developing Market Surge Caps</span>
        </button>

        <button
          onClick={() => setActiveTab('rate_controls')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'rate_controls'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Country Rate Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('geofence_audit')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'geofence_audit'
              ? 'bg-red-500 text-white shadow'
              : 'bg-neutral-900 text-red-300 hover:text-white border border-neutral-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Geofence Exclusions Audit (AR & UY)</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. REAL-TIME CITY FLEET HEATMAPS & TELEMETRY                          */}
      {/* ===================================================================== */}
      {activeTab === 'heatmaps' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-semibold">Filter Vehicle Distribution:</span>
              <div className="flex gap-1">
                {(['all', '2_wheeler', '3_wheeler', '4_wheeler'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setVehicleFilter(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium ${
                      vehicleFilter === mode
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {mode === 'all' ? 'All Classes' : mode.replace('_', '-')}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-neutral-400 text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live WebSocket Stream • 1.0s telemetry ping rate</span>
            </div>
          </div>

          {/* Interactive Heatmap Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FLEET_HEATMAP_DATA.map((node) => {
              const country = COUNTRY_LOOKUP[node.countryCode];
              const isBlocked = node.status === 'excluded_blocked';

              return (
                <div
                  key={node.id}
                  className={`rounded-xl border p-4 transition-all relative overflow-hidden ${
                    isBlocked
                      ? 'bg-red-950/20 border-red-800/80 opacity-80'
                      : node.status === 'high_demand'
                      ? 'bg-neutral-900 border-amber-500/60 shadow-lg'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  {isBlocked && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" /> GEOFENCE BLOCKED
                    </div>
                  )}

                  {!isBlocked && (
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span className="text-base">{country?.flag}</span>
                        <span>{node.city}</span>
                        <span className="text-[11px] font-normal text-neutral-400">
                          ({node.countryCode})
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          node.demandSurgeLevel > 1.3
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        Surge: {node.demandSurgeLevel}x
                      </span>
                    </div>
                  )}

                  {isBlocked ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-red-300">
                        <span className="text-base">{country?.flag}</span>
                        <span>{node.city} (Argentina / Uruguay Exclusion)</span>
                      </div>
                      <p className="text-[11px] text-red-200/80 leading-snug">
                        Mandatory statutory prohibition. Zero fleet nodes registered. All dispatch API
                        endpoints returning 403 Forbidden with geofence lockdown.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {/* Active Fleet Breakdown */}
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                            <Bike className="w-3 h-3 text-amber-400" /> 2W Moto
                          </div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {node.activeTwoWheelers}
                          </div>
                        </div>

                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                            <Layers className="w-3 h-3 text-cyan-400" /> 3W Tuk
                          </div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {node.activeThreeWheelers}
                          </div>
                        </div>

                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                            <Car className="w-3 h-3 text-emerald-400" /> 4W Cab
                          </div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {node.activeFourWheelers}
                          </div>
                        </div>
                      </div>

                      {/* Driver Hourly Performance vs Target */}
                      <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Current Driver Hourly Avg:</span>
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 text-xs">
                            ${node.averageHourlyEarningUSD} USD/hr
                          </span>
                          <div className="text-[9px] text-neutral-500">
                            Target: ${country?.targetHourlyEarningsUSD.min} - $
                            {country?.targetHourlyEarningsUSD.max}/hr
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. AUTOMATED CURRENCY CONVERSION MATRIX                                */}
      {/* ===================================================================== */}
      {activeTab === 'fx_rates' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Automated Real-Time Currency Conversion Matrix (Base: USD)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Central Bank API & Interbank FX Feed with sub-minute volatility tracking and hedge spreads.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">Source: {lastRefreshedTime}</span>
              <button
                onClick={handleRefreshFx}
                disabled={isRefreshingFx}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingFx ? 'animate-spin' : ''}`} />
                <span>Sync Live Rates</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Country & Flag</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">ISO Code</th>
                  <th className="py-2.5 px-3">Exchange Rate (1 USD =)</th>
                  <th className="py-2.5 px-3">Target $10 USD Earning in Local</th>
                  <th className="py-2.5 px-3">Primary Mobile Payment Rail</th>
                  <th className="py-2.5 px-3">FX Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {OPERATIONAL_COUNTRIES.filter((c) => !c.isStrictlyExcluded).map((c) => {
                  const rate = exchangeRates[c.currencyCode] || c.exchangeRateToUSD;
                  const tenDollarsLocal = (10 * rate).toLocaleString(undefined, {
                    maximumFractionDigits: 1
                  });

                  return (
                    <tr key={c.code} className="hover:bg-neutral-800/40 transition">
                      <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span>{c.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-sans capitalize text-neutral-400 text-[11px]">
                        {c.region.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">{c.currencyCode}</td>
                      <td className="py-2.5 px-3 text-emerald-300 font-bold">
                        {rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                        {c.currencySymbol}
                      </td>
                      <td className="py-2.5 px-3 text-white">
                        {tenDollarsLocal} {c.currencySymbol}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-[11px] text-neutral-300">
                        {c.paymentRails[0]?.name || 'Cash Escrow'}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Automated (Real-time)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. MINIMUM TRIP FLOOR MANAGEMENT                                      */}
      {/* ===================================================================== */}
      {activeTab === 'trip_floors' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Minimum Trip Floor Enforcement Controls</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Guarantees driver operational safety and fuel recovery. No ride or parcel delivery can
              be booked below these thresholds, regardless of ultra-short distance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {OPERATIONAL_COUNTRIES.filter((c) => !c.isStrictlyExcluded).map((c) => {
              const currentConfig = countryConfigs[c.code] || c;
              const rate = exchangeRates[c.currencyCode] || c.exchangeRateToUSD;
              const localFloor = Math.round(currentConfig.minimumTripFloorUSD * rate);

              return (
                <div
                  key={c.code}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                      {c.currencyCode}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-400">Current Trip Floor:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400">
                        ${currentConfig.minimumTripFloorUSD.toFixed(2)} USD
                      </span>
                      <div className="text-[10px] text-neutral-400">
                        ≈ {localFloor} {c.currencySymbol}
                      </div>
                    </div>
                  </div>

                  {/* Floor Adjustment Controls */}
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
                    <button
                      onClick={() =>
                        handleUpdateCountryRate(
                          'minimumTripFloorUSD',
                          Math.max(1.0, Number((currentConfig.minimumTripFloorUSD - 0.2).toFixed(2)))
                        )
                      }
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      value={currentConfig.minimumTripFloorUSD}
                      onChange={(e) =>
                        handleUpdateCountryRate('minimumTripFloorUSD', parseFloat(e.target.value) || 1.0)
                      }
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-center font-mono text-white text-xs"
                    />
                    <button
                      onClick={() =>
                        handleUpdateCountryRate(
                          'minimumTripFloorUSD',
                          Number((currentConfig.minimumTripFloorUSD + 0.2).toFixed(2))
                        )
                      }
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. SURGE PRICING CAPS FOR DEVELOPING MARKETS                          */}
      {/* ===================================================================== */}
      {activeTab === 'surge_caps' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Surge Pricing Cap Controls for Developing Markets</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
              Unlike uncapped Western gig apps that spike to 3.5x-5.0x during heavy rain or strikes,
              Wap strictly caps surge at 1.5x - 1.8x across Central America, the Caribbean, South America,
              and Africa to safeguard working-class commuter affordability while maintaining target earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {OPERATIONAL_COUNTRIES.filter((c) => !c.isStrictlyExcluded).map((c) => {
              const currentConfig = countryConfigs[c.code] || c;

              return (
                <div
                  key={c.code}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.flag}</span>
                      <div>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[10px] text-neutral-400 uppercase">
                          {c.marketAdjustmentType.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        currentConfig.surgeCapMultiplier <= 1.6
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      Hard Cap: {currentConfig.surgeCapMultiplier.toFixed(2)}x
                    </span>
                  </div>

                  {/* Slider Control */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span>Allowed Multiplier Range:</span>
                      <span className="font-mono text-white">
                        1.0x (Flat) to {currentConfig.surgeCapMultiplier.toFixed(2)}x (Max)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.1"
                      max="2.5"
                      step="0.05"
                      value={currentConfig.surgeCapMultiplier}
                      onChange={(e) =>
                        handleUpdateCountryRate('surgeCapMultiplier', parseFloat(e.target.value))
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className="text-[11px] bg-neutral-900 p-2.5 rounded-lg border border-neutral-800/80 text-neutral-300 flex justify-between">
                    <span>Driver Target Protection:</span>
                    <span className="font-bold text-emerald-400">
                      ${c.targetHourlyEarningsUSD.min} - ${c.targetHourlyEarningsUSD.max} / hr
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MANUAL RATE-ADJUSTMENT CONTROLS PER COUNTRY                        */}
      {/* ===================================================================== */}
      {activeTab === 'rate_controls' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Fine-Tuned Country Rate Adjustment Panel</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Adjust Base Fare, Per-Minute Rate, and Per-KM Distance Rate dynamically per nation.
              </p>
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-semibold">Select Country:</span>
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer focus:outline-none focus:border-amber-400"
              >
                {OPERATIONAL_COUNTRIES.filter((c) => !c.isStrictlyExcluded).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currencyCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Country Active Editor */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedCountry.name}</h4>
                  <div className="text-xs text-neutral-400">
                    Currency: <span className="text-amber-400 font-mono">{selectedCountry.currencyCode}</span> (1 USD = {selectedCountry.exchangeRateToUSD} {selectedCountry.currencySymbol})
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-neutral-400">Market Framework: </span>
                <span className="text-white font-bold uppercase">
                  {selectedCountry.marketAdjustmentType.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Rate Adjusters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Base Fare */}
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-1.5 text-xs">
                <span className="text-neutral-400 font-semibold">Base Pickup Fare (USD):</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedCountry.baseFareUSD}
                    onChange={(e) =>
                      handleUpdateCountryRate('baseFareUSD', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-white font-mono font-bold"
                  />
                </div>
                <div className="text-[10px] text-neutral-500">
                  ≈ {(selectedCountry.baseFareUSD * selectedCountry.exchangeRateToUSD).toFixed(1)}{' '}
                  {selectedCountry.currencySymbol} local
                </div>
              </div>

              {/* Per Minute Rate */}
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-1.5 text-xs">
                <span className="text-neutral-400 font-semibold">Trip Minute Rate (USD/min):</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedCountry.perMinuteRateUSD}
                    onChange={(e) =>
                      handleUpdateCountryRate('perMinuteRateUSD', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-white font-mono font-bold"
                  />
                </div>
                <div className="text-[10px] text-neutral-500">
                  ≈ {(selectedCountry.perMinuteRateUSD * selectedCountry.exchangeRateToUSD).toFixed(2)}{' '}
                  {selectedCountry.currencySymbol}/min
                </div>
              </div>

              {/* Per KM Rate */}
              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-1.5 text-xs">
                <span className="text-neutral-400 font-semibold">Trip Distance Rate (USD/km):</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="0.02"
                    value={selectedCountry.perKmRateUSD}
                    onChange={(e) =>
                      handleUpdateCountryRate('perKmRateUSD', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-white font-mono font-bold"
                  />
                </div>
                <div className="text-[10px] text-neutral-500">
                  ≈ {(selectedCountry.perKmRateUSD * selectedCountry.exchangeRateToUSD).toFixed(2)}{' '}
                  {selectedCountry.currencySymbol}/km
                </div>
              </div>
            </div>

            {/* Target Hourly Earnings Impact Preview */}
            <div className="bg-neutral-900/80 p-3 rounded-lg border border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-neutral-400">Target Hourly Driver Earnings Bracket: </span>
                <strong className="text-emerald-400 font-bold">
                  ${selectedCountry.targetHourlyEarningsUSD.min.toFixed(2)} - $
                  {selectedCountry.targetHourlyEarningsUSD.max.toFixed(2)} USD / Hour
                </strong>
              </div>
              <div className="text-neutral-400">
                High Performers scale to:{' '}
                <strong className="text-amber-300 font-bold">
                  ${selectedCountry.targetHourlyEarningsUSD.highPerformer.toFixed(2)}+ / hr
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. GEOFENCE EXCLUSIONS AUDIT (ARGENTINA & URUGUAY STRICT PROHIBITION) */}
      {/* ===================================================================== */}
      {activeTab === 'geofence_audit' && (
        <div className="space-y-4">
          <div className="bg-red-950/40 border-2 border-red-600/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Lock className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    COMPLIANCE DIRECTIVE: STRICT TERRITORIAL EXCLUSIONS
                  </h3>
                  <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Zero Tolerance
                  </span>
                </div>
                <p className="text-xs text-red-200 mt-1">
                  Argentina and Uruguay are strictly excluded from the platform footprint.
                  No driver onboarding, geofenced GPS dispatching, or passenger booking can exist.
                </p>
              </div>
            </div>

            {/* Excluded Territory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-neutral-950 border border-red-800/80 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="flex items-center gap-2">
                    <span className="text-xl">🇦🇷</span>
                    <span>Argentina (ARS)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                    PERMANENTLY EXCLUDED
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Geofence Polygon: Bounding box [-21.8° to -55.1° Lat, -53.6° to -73.6° Lng].
                  All inbound IP requests, cellular SIM MCC 722 (Claro/Personal/Movistar), and device GPS coordinates
                  are dropped immediately at the reverse proxy edge.
                </p>
                <div className="text-[10px] font-mono text-red-400 bg-red-950/50 p-2 rounded border border-red-900/60">
                  HTTP 403: GEOFENCE_VIOLATION_TERRITORY_EXCLUDED (Argentina)
                </div>
              </div>

              <div className="bg-neutral-950 border border-red-800/80 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="flex items-center gap-2">
                    <span className="text-xl">🇺🇾</span>
                    <span>Uruguay (UYU)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                    PERMANENTLY EXCLUDED
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Geofence Polygon: Bounding box [-30.0° to -35.0° Lat, -53.1° to -58.5° Lng].
                  Cellular SIM MCC 748 (Antel/Movistar/Claro) and postal routing completely disabled.
                  Zero merchant or banking escrow settlement rails provisioned.
                </p>
                <div className="text-[10px] font-mono text-red-400 bg-red-950/50 p-2 rounded border border-red-900/60">
                  HTTP 403: GEOFENCE_VIOLATION_TERRITORY_EXCLUDED (Uruguay)
                </div>
              </div>
            </div>

            {/* Simulated Live Geofence Audit Log */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span>Edge Firewall Geofence Rejection Log (Real-Time)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Status: Active & Enforcing</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="text-red-300 flex justify-between py-1 border-b border-neutral-900">
                  <span>[12:14:22 UTC] BLOCKED: Driver Onboarding attempt from Córdoba, AR (IP: 181.44.x.x)</span>
                  <span className="text-neutral-500">REJECT_403</span>
                </div>
                <div className="text-red-300 flex justify-between py-1 border-b border-neutral-900">
                  <span>[12:12:09 UTC] BLOCKED: Ride Quote Request from Montevideo, UY (GPS: -34.9011, -56.1645)</span>
                  <span className="text-neutral-500">REJECT_403</span>
                </div>
                <div className="text-emerald-400 flex justify-between py-1">
                  <span>[12:11:45 UTC] ALLOWED: Ride Dispatch in Port-au-Prince, HT (GPS: 18.5944, -72.3074)</span>
                  <span className="text-neutral-400">AUTHORIZED_200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

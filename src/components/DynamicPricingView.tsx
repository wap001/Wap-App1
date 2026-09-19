import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  CloudRain,
  Mountain,
  Clock,
  ShieldCheck,
  Percent,
  CheckCircle2,
  FileCode,
  Bike,
  Car,
  Layers,
  AlertTriangle,
  Lock,
  Compass,
  ArrowRight,
  Info,
  Coins
} from 'lucide-react';
import {
  OPERATIONAL_COUNTRIES,
  VEHICLE_CLASSES,
  COUNTRY_LOOKUP,
  calculateDynamicFare,
  calculateLibertyCashPurchasingPowerGuarantee
} from '../data/internationalData';
import { VehicleClass } from '../types/internationalScope';

export const DynamicPricingView: React.FC = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('HT');
  const [selectedVehicleClass, setSelectedVehicleClass] = useState<VehicleClass>('2_wheeler');
  const [distanceKm, setDistanceKm] = useState<number>(6.5);
  const [durationMin, setDurationMin] = useState<number>(18);
  const [terrainType, setTerrainType] = useState<'paved' | 'urban_potholes' | 'mountain_unpaved'>('urban_potholes');
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'drizzle' | 'tropical_downpour'>('clear');
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.2);
  const [tripsPerHourPace, setTripsPerHourPace] = useState<number>(2.4);
  const [activeTab, setActiveTab] = useState<'calculator' | 'formula' | 'custom_markets' | 'vehicle_classes' | 'target_earnings' | 'purchasing_power'>('calculator');

  const selectedCountry = COUNTRY_LOOKUP[selectedCountryCode] || COUNTRY_LOOKUP['HT'];
  const isExcluded = selectedCountry.isStrictlyExcluded;

  // Multipliers
  const terrainFactor =
    terrainType === 'paved' ? 1.0 : terrainType === 'urban_potholes' ? 1.15 : 1.35;
  const weatherFactor =
    weatherCondition === 'clear' ? 1.0 : weatherCondition === 'drizzle' ? 1.2 : 1.45;

  // Run dynamic calculation if not excluded
  let fareQuote = null;
  let calculationError = null;

  if (isExcluded) {
    calculationError = selectedCountry.exclusionReason;
  } else {
    try {
      fareQuote = calculateDynamicFare({
        countryCode: selectedCountryCode,
        vehicleClass: selectedVehicleClass,
        distanceKm,
        durationMinutes: durationMin,
        requestedSurgeMultiplier: surgeMultiplier,
        terrainDifficultyMultiplier: terrainFactor,
        weatherRainMultiplier: weatherFactor
      });
    } catch (e: any) {
      calculationError = e.message;
    }
  }

  // Driver Projected Hourly Earnings at current pace
  const simulatedDriverHourlyEarnings = fareQuote
    ? Math.round(fareQuote.estimatedDriverNetUSD * tripsPerHourPace * 100) / 100
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
          <TrendingUp className="w-5 h-5" />
          <span>INTERNATIONAL MULTI-MODAL DYNAMIC PRICING ENGINE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Algorithmic Pricing Architecture & Driver Target Earnings ($5 - $12 / hr)
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed max-w-4xl">
          Core fare formula calibrated to ensure a guaranteed $5.00–$12.00 USD/hour base earnings floor across
          Central America (excl. Panama), the Caribbean, South America (excl. Argentina & Uruguay), and Africa (including Egypt & Libya),
          scaling to $15+/hr for high-volume drivers. Features customized frameworks for the United States (gig labor laws),
          French Guiana (Euro-zone purchasing power), and Panama (local transport legislation).
        </p>

        {/* Top Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-neutral-800/80 text-xs">
          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">Formula</div>
            <div className="font-mono font-bold text-white text-[11px]">Base + (min×rate) + (km×rate)</div>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">Vehicle Classes</div>
            <div className="font-bold text-amber-400">2W, 3W, 4W Multipliers</div>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">Developing Market Cap</div>
            <div className="font-bold text-emerald-400">1.5x - 1.8x Anti-Gouging Cap</div>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">Strict Exclusions</div>
            <div className="font-bold text-red-400">Argentina & Uruguay (Blocked)</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-1.5 border-b border-neutral-800 pb-2 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'calculator'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Interactive Pricing Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('formula')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'formula'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Mathematical Formulation & Code</span>
        </button>

        <button
          onClick={() => setActiveTab('custom_markets')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'custom_markets'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Custom Market Adjustments (US, GF, PA)</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicle_classes')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'vehicle_classes'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Vehicle Class Multipliers (2W, 3W, 4W)</span>
        </button>

        <button
          onClick={() => setActiveTab('target_earnings')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            activeTab === 'target_earnings'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Driver Target Earnings ($5-$12/hr & $15+ Scale)</span>
        </button>

        <button
          id="pricing-tab-purchasing-power"
          onClick={() => setActiveTab('purchasing_power')}
          className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'purchasing_power'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:text-neutral-950" />
          <span>Purchasing Power Floor ($0.50 Min / 167 LBC Peg)</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. INTERACTIVE PRICING SIMULATOR                                      */}
      {/* ===================================================================== */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Country Selector with Exclusion Warning */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Target Operating Territory:
                </label>
                <span className="text-[11px] text-neutral-400">
                  Currency: <strong className="text-amber-400">{selectedCountry.currencyCode}</strong>
                </span>
              </div>

              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white cursor-pointer focus:outline-none focus:border-amber-400"
              >
                <optgroup label="Caribbean & Guianas">
                  <option value="HT">🇭🇹 Haiti (Port-au-Prince) - HTG</option>
                  <option value="GY">🇬🇾 Guyana (Georgetown) - GYD</option>
                  <option value="SR">🇸🇷 Suriname (Paramaribo) - SRD</option>
                  <option value="JM">🇯🇲 Jamaica (Kingston) - JMD</option>
                  <option value="DM">🇩🇲 Dominica (Roseau) - XCD (EC$)</option>
                </optgroup>
                <optgroup label="Central America">
                  <option value="CR">🇨🇷 Costa Rica (San José) - CRC</option>
                  <option value="PA">🇵🇦 Panama (Panama City) - USD [Custom Law]</option>
                  <option value="GT">🇬🇹 Guatemala (Guatemala City) - GTQ</option>
                  <option value="HN">🇭🇳 Honduras (Tegucigalpa) - HNL</option>
                  <option value="NI">🇳🇮 Nicaragua (Managua) - NIO</option>
                </optgroup>
                <optgroup label="South America (Active)">
                  <option value="CO">🇨🇴 Colombia (Bogotá) - COP</option>
                  <option value="BR">🇧🇷 Brazil (Manaus / Fortaleza) - BRL</option>
                  <option value="PE">🇵🇪 Peru (Lima) - PEN</option>
                  <option value="CL">🇨🇱 Chile (Santiago) - CLP</option>
                </optgroup>
                <optgroup label="Africa (North to South & Madagascar)">
                  <option value="EG">🇪🇬 Egypt (Cairo) - EGP</option>
                  <option value="LY">🇱🇾 Libya (Tripoli) - LYD</option>
                  <option value="SN">🇸🇳 Senegal (Dakar) - XOF</option>
                  <option value="CI">🇨🇮 Ivory Coast (Abidjan) - XOF</option>
                  <option value="NG">🇳🇬 Nigeria (Lagos) - NGN</option>
                  <option value="KE">🇰🇪 Kenya (Nairobi) - KES</option>
                  <option value="MG">🇲🇬 Madagascar (Antananarivo) - MGA</option>
                  <option value="ZA">🇿🇦 South Africa (Johannesburg) - ZAR</option>
                </optgroup>
                <optgroup label="Special Markets">
                  <option value="US">🇺🇸 United States (Miami, FL) - USD [Gig Law]</option>
                  <option value="GF">🇬🇫 French Guiana (Cayenne) - EUR [EU Regulations]</option>
                </optgroup>
                <optgroup label="STRICT EXCLUSIONS (Barred from Platform)">
                  <option value="AR">🇦🇷 Argentina (PROHIBITED & EXCLUDED)</option>
                  <option value="UY">🇺🇾 Uruguay (PROHIBITED & EXCLUDED)</option>
                </optgroup>
              </select>

              {isExcluded && (
                <div className="bg-red-950/60 border border-red-700/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-200">
                  <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-red-300 block mb-1">
                      STATUTORY GEOFENCE BLOCK ACTIVE
                    </strong>
                    {selectedCountry.exclusionReason}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Class Selector */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Vehicle Class & Capacity:
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['2_wheeler', '3_wheeler', '4_wheeler'] as VehicleClass[]).map((vClass) => {
                  const cfg = VEHICLE_CLASSES[vClass];
                  const isSelected = selectedVehicleClass === vClass;

                  return (
                    <button
                      key={vClass}
                      disabled={isExcluded}
                      onClick={() => setSelectedVehicleClass(vClass)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        {cfg.iconType === 'bike' ? (
                          <Bike className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                        ) : cfg.iconType === 'trike' ? (
                          <Layers className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                        ) : (
                          <Car className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-400'}`} />
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300">
                          {cfg.baseRateMultiplier}x
                        </span>
                      </div>
                      <div className="font-bold text-xs text-white">{cfg.name.split(' ')[1]}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Cap: {cfg.passengerCapacity} pax</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trip Parameters: Distance & Duration */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300 font-semibold">Trip Distance (KM):</span>
                  <span className="font-mono text-amber-400 font-bold">{distanceKm} KM</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="35"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300 font-semibold">Trip Duration (Minutes):</span>
                  <span className="font-mono text-amber-400 font-bold">{durationMin} min</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="90"
                  step="1"
                  value={durationMin}
                  onChange={(e) => setDurationMin(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Environmental & Demand Multipliers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Terrain */}
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl space-y-1.5 text-xs">
                <span className="text-neutral-400 font-semibold flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-amber-400" /> Terrain
                </span>
                <select
                  value={terrainType}
                  onChange={(e) => setTerrainType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-white text-xs"
                >
                  <option value="paved">Paved Highway (1.0x)</option>
                  <option value="urban_potholes">Urban Potholes (1.15x)</option>
                  <option value="mountain_unpaved">Mountain Ravine (1.35x)</option>
                </select>
              </div>

              {/* Weather */}
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl space-y-1.5 text-xs">
                <span className="text-neutral-400 font-semibold flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Weather
                </span>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-white text-xs"
                >
                  <option value="clear">Clear Sky (1.0x)</option>
                  <option value="drizzle">Tropical Drizzle (1.2x)</option>
                  <option value="tropical_downpour">Flash Downpour (1.45x)</option>
                </select>
              </div>

              {/* Surge */}
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl space-y-1.5 text-xs">
                <span className="text-neutral-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Surge Demand
                </span>
                <select
                  value={surgeMultiplier}
                  onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-white text-xs"
                >
                  <option value="1.0">Standard 1.0x</option>
                  <option value="1.2">Moderate 1.2x</option>
                  <option value="1.5">High Peak 1.5x</option>
                  <option value="1.8">Extreme Peak 1.8x</option>
                  <option value="2.2">Severe 2.2x (Capped in Dev Markets)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fare Quote & Target Earnings Breakdown Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {fareQuote ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                      {fareQuote.quoteId}
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.sampleCity}</span>
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                    {fareQuote.vehicleClass.replace('_', '-')}
                  </span>
                </div>

                {/* Primary Price Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-center">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">Total Customer Fare</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">
                    {fareQuote.totalFareLocal.toLocaleString()} {fareQuote.currencyCode}
                  </div>
                  <div className="text-xs font-mono text-neutral-400 mt-0.5">
                    ≈ ${fareQuote.totalFareUSD.toFixed(2)} USD
                  </div>

                  {fareQuote.isSurgeCapped && (
                    <div className="mt-2 text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full inline-block font-semibold">
                      Developing Market Surge Capped at {fareQuote.effectiveSurgeMultiplier}x (Protects Rider)
                    </div>
                  )}

                  {fareQuote.minimumFloorApplied && (
                    <div className="mt-2 text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full inline-block font-semibold">
                      Minimum Trip Floor Enforced
                    </div>
                  )}
                </div>

                {/* Component Breakdown Table */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                    <span>Base Pickup Fare:</span>
                    <span className="font-mono text-white">
                      ${fareQuote.baseFareUSD.toFixed(2)} (
                      {(fareQuote.baseFareUSD * fareQuote.exchangeRate).toFixed(1)}{' '}
                      {fareQuote.currencyCode})
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                    <span>Time Charge ({fareQuote.durationMinutes} min):</span>
                    <span className="font-mono text-white">${fareQuote.timeChargeUSD.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                    <span>Distance Charge ({fareQuote.distanceKm} km):</span>
                    <span className="font-mono text-white">
                      ${fareQuote.distanceChargeUSD.toFixed(2)}
                    </span>
                  </div>

                  {fareQuote.surgeChargeUSD > 0 && (
                    <div className="flex justify-between py-1 border-b border-neutral-800 text-amber-300">
                      <span>Surge Multiplier ({fareQuote.effectiveSurgeMultiplier}x):</span>
                      <span className="font-mono font-bold">+${fareQuote.surgeChargeUSD.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-400 text-[11px]">
                    <span>Wap Platform Fee (12% commission):</span>
                    <span className="font-mono">-${fareQuote.platformCommissionUSD.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 font-bold text-white bg-neutral-950 px-2.5 rounded-lg">
                    <span className="text-emerald-400">Driver Net Earnings (This Trip):</span>
                    <span className="font-mono text-emerald-400">
                      ${fareQuote.estimatedDriverNetUSD.toFixed(2)} USD (
                      {(fareQuote.estimatedDriverNetUSD * fareQuote.exchangeRate).toFixed(1)}{' '}
                      {fareQuote.currencyCode})
                    </span>
                  </div>
                </div>

                {/* Driver Target Hourly Verification Card */}
                <div className="bg-neutral-950 border border-emerald-900/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Target Earnings Calibration</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">Pace: {tripsPerHourPace} trips/hr</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-neutral-400">Driver Hourly Run-Rate:</span>
                    <span className="text-lg font-black text-emerald-300 font-mono">
                      ${simulatedDriverHourlyEarnings.toFixed(2)} USD / hr
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 flex justify-between">
                    <span>Guaranteed Baseline Range:</span>
                    <span className="font-bold text-white">
                      ${fareQuote.targetHourlyEarningsRangeUSD.min} - $
                      {fareQuote.targetHourlyEarningsRangeUSD.max} USD / hr
                    </span>
                  </div>

                  {simulatedDriverHourlyEarnings >= 15.0 && (
                    <div className="text-[10px] text-amber-300 bg-amber-950/60 p-1.5 rounded border border-amber-800/80">
                      High-Performing Driver Scaling Active: Earning $15+/hr through high trip volume.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-red-800/80 rounded-2xl p-6 text-center space-y-3">
                <Lock className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-base font-bold text-white">Pricing Unavailable</h3>
                <p className="text-xs text-red-300 leading-relaxed">{calculationError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. MATHEMATICAL FORMULATION & CODE                                    */}
      {/* ===================================================================== */}
      {activeTab === 'formula' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <span>Core Fare Calculation Formulation</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Specification-compliant formula running server-side with zero client tampering.
            </p>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-xs sm:text-sm text-amber-300">
            Fare = Base_Fare + (Trip_Time_Minutes * Minute_Rate) + (Trip_Distance_KM * KM_Rate)
          </div>

          <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Mathematical Pipeline Steps:
            </h4>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>
                <strong className="text-white">Vehicle Class Scaling:</strong> Base rate, Minute rate,
                and KM rate are pre-multiplied by the vehicle class multiplier (2-Wheeler: 0.7x, 3-Wheeler: 1.0x,
                4-Wheeler: 1.85x).
              </li>
              <li>
                <strong className="text-white">Terrain & Hazard Multipliers:</strong> In Caribbean and African
                unpaved or mountainous zones, terrain multiplier (1.0x - 1.35x) and weather hazard multiplier
                (1.0x - 1.45x) are factored into the distance charge.
              </li>
              <li>
                <strong className="text-white">Developing Market Surge Cap:</strong> In developing nations, surge
                is capped between 1.5x and 1.8x to prevent gouging vulnerable commuters.
              </li>
              <li>
                <strong className="text-white">Minimum Trip Floor Enforcement:</strong> If raw calculated fare is
                below the minimum floor, <code className="text-amber-400">Math.max(Fare, Minimum_Floor)</code> is
                enforced.
              </li>
              <li>
                <strong className="text-white">Driver Target Calibration ($5 - $12 USD/hr):</strong> Commission is
                strictly 12% on standard fare components and 0% on weather hazard bonuses.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. CUSTOM MARKET ADJUSTMENTS (US, FRENCH GUIANA, PANAMA)              */}
      {/* ===================================================================== */}
      {activeTab === 'custom_markets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* United States */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl">🇺🇸</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
                US GIG COMPLIANCE
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">United States (USD)</h3>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Calibrated to comply with state and municipal gig transport regulations (e.g. California Prop 22,
              Florida driver earnings transparency, NYC minimum pay rules).
            </p>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Base Earnings Target:</span>
                <span className="text-emerald-400 font-bold">$22.00 - $32.00 / hr</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Base Fare:</span>
                <span className="text-white">$3.50 USD</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Per KM / Per Min:</span>
                <span className="text-white">$1.35 / $0.42</span>
              </div>
            </div>
          </div>

          {/* French Guiana */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl">🇬🇫</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                EU REGULATION & EUR
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">French Guiana (EUR)</h3>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Tied directly to Euro-zone purchasing power, France SMIC hourly wage benchmarks, and EU transport
              safety standards in Cayenne and Saint-Laurent du Maroni.
            </p>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Base Earnings Target:</span>
                <span className="text-emerald-400 font-bold">€18.00 - €26.00 / hr</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Base Fare:</span>
                <span className="text-white">€3.50 EUR</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Per KM / Per Min:</span>
                <span className="text-white">€1.35 / €0.41</span>
              </div>
            </div>
          </div>

          {/* Panama */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl">🇵🇦</span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                PANAMA ATTT TRANSIT LAW
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Panama (USD)</h3>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Adjusted to comply with Autoridad del Tránsito y Transporte Terrestre (ATTT) Decreto Ejecutivo 331,
              balancing dollarized economy living costs with Yappy & cash settlement.
            </p>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Base Earnings Target:</span>
                <span className="text-emerald-400 font-bold">$8.00 - $14.00 / hr</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Base Fare:</span>
                <span className="text-white">$1.60 USD</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Per KM / Per Min:</span>
                <span className="text-white">$0.65 / $0.18</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. VEHICLE CLASS MULTIPLIERS (2W, 3W, 4W)                            */}
      {/* ===================================================================== */}
      {activeTab === 'vehicle_classes' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Multi-Modal Vehicle Class Specifications</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Three tailored tiers serving distinct commuter demographics and payload constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {Object.values(VEHICLE_CLASSES).map((v) => (
              <div
                key={v.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    {v.iconType === 'bike' ? (
                      <Bike className="w-4 h-4 text-amber-400" />
                    ) : v.iconType === 'trike' ? (
                      <Layers className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Car className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{v.name}</span>
                  </div>
                  <span className="font-mono text-amber-400 text-xs font-bold">
                    {v.baseRateMultiplier}x Base
                  </span>
                </div>

                <p className="text-neutral-400 text-[11px] leading-relaxed">{v.description}</p>

                <div className="space-y-1.5 font-mono text-[11px] bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                  <div className="flex justify-between text-neutral-300">
                    <span>Passenger Capacity:</span>
                    <span className="text-white font-bold">{v.passengerCapacity} pax</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Luggage Capacity:</span>
                    <span className="text-white font-bold">{v.luggageCapacityKg} kg</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Fuel Economy:</span>
                    <span className="text-emerald-400 font-bold">{v.fuelEfficiencyKmPerLiter} km/L</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-1">
                    Optimized Use Cases:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {v.suitableUseCases.map((uc, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded"
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. DRIVER TARGET EARNINGS ($5-$12/hr & $15+ SCALE)                    */}
      {/* ===================================================================== */}
      {activeTab === 'target_earnings' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Target Earnings Guarantee ($5.00 - $12.00 / hr) & High-Performer Scale</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
              In Central America (excl. Panama), the Caribbean, South America (excl. AR/UY/GF), and Africa,
              average local daily wages are often $4-$8/day. Wap guarantees an hourly baseline of $5-$12/hr,
              transforming motorcycle drivers into middle-class micro-entrepreneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="text-neutral-400 text-[11px] font-bold uppercase">Tier 1: Baseline Floor</div>
              <div className="text-2xl font-black text-white">$5.00 - $8.00 / hr</div>
              <p className="text-neutral-400 text-[11px]">
                Guaranteed during off-peak hours with 1.5–2 trips per hour. Minimum fare floors prevent
                earnings leakage.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="text-neutral-400 text-[11px] font-bold uppercase">Tier 2: Standard Peak</div>
              <div className="text-2xl font-black text-emerald-400">$8.00 - $12.00 / hr</div>
              <p className="text-neutral-400 text-[11px]">
                Achieved during commute hours (7-9 AM, 4-7 PM) with mild 1.2x-1.4x surge and rapid dispatch.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="text-neutral-400 text-[11px] font-bold uppercase">Tier 3: High Performer</div>
              <div className="text-2xl font-black text-amber-400">$15.00+ / hr (Uncapped)</div>
              <p className="text-neutral-400 text-[11px]">
                Top drivers executing 3.5+ trips/hour with 5-star ratings, stackable multi-order parcel
                deliveries, and customer tips.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. PURCHASING POWER GUARANTEE & 167 LBC / 1 LIBERTY CASH PEG          */}
      {/* ===================================================================== */}
      {activeTab === 'purchasing_power' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>LIBERTÉ CASH & PURCHASING POWER FLOOR ARCHITECTURE</span>
              </div>
              <h2 className="text-xl font-black text-white">
                167 LBC Tokens = 1 Liberty Cash ($1.00 USD) • Min. $0.50 Purchasing Floor
              </h2>
              <p className="text-xs text-neutral-300 mt-1.5 max-w-3xl leading-relaxed">
                Empowering Drivers, Customers, and Merchants with true financial freedom and sovereign wealth creation.
                For regions where $1 USD is below 1 unit of local currency (e.g. Eurozone / French Guiana), or where $1 USD
                converts to high local denominations (e.g. Haiti HTG, Dominica XCD, Guyana GYD, Suriname SRD), 1 Liberty Cash
                guarantees a permanent floor equivalence of at least <strong>$0.50 USD in real local purchasing power</strong>.
              </p>
            </div>

            <div className="bg-neutral-950 border border-amber-500/40 rounded-xl p-3.5 text-right shrink-0">
              <div className="text-[11px] text-neutral-400">Peg Standard</div>
              <div className="text-base font-black text-amber-400">167 LBC = 1 Liberty Cash</div>
              <div className="text-[11px] text-emerald-400 font-semibold">1 Liberty Cash = $1.00 USD</div>
            </div>
          </div>

          {/* Regional Purchasing Power Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { code: 'DM', name: 'Dominica', currency: 'XCD', rate: 2.70, type: 'ECCB Peg / High Denomination', flag: '🇩🇲' },
              { code: 'HT', name: 'Haiti', currency: 'HTG', rate: 131.50, type: 'High Local Denomination', flag: '🇭🇹' },
              { code: 'GF', name: 'French Guiana', currency: 'EUR', rate: 0.92, type: 'Below 1 Unit (< 1.0 EUR)', flag: '🇬🇫' },
              { code: 'GY', name: 'Guyana', currency: 'GYD', rate: 208.50, type: 'High Local Denomination', flag: '🇬🇾' },
              { code: 'SR', name: 'Suriname', currency: 'SRD', rate: 35.60, type: 'High Local Denomination', flag: '🇸🇷' },
              { code: 'JM', name: 'Jamaica', currency: 'JMD', rate: 156.00, type: 'High Local Denomination', flag: '🇯🇲' },
            ].map((market) => {
              const guarantee = calculateLibertyCashPurchasingPowerGuarantee(market.code, 1.0);
              return (
                <div key={market.code} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{market.flag}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{market.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">1 USD = {market.rate} {market.currency}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300">
                      {market.type}
                    </span>
                  </div>

                  <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800/80 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-neutral-400">
                      <span>1 Liberty Cash (167 LBC):</span>
                      <span className="text-white font-bold">{guarantee.nominalLocalAmount} {market.currency}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Min. Purchasing Floor:</span>
                      <span>$0.50 USD equiv.</span>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>Effective Local Power:</span>
                      <span className="font-bold">{guarantee.effectiveLocalPurchasingPower} {market.currency}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {guarantee.protectiveRationale}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-neutral-950 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-neutral-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block mb-1">Voluntary & Inclusive Wealth Engine:</strong>
              Earning LBC tokens is 100% optional for all platform participants. Drivers, customers, and merchants who opt in accumulate
              daily compounding treasury yield (5.2% APY) and fractional investments in equities and treasury assets, while having the flexibility to cash out locally at any time.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

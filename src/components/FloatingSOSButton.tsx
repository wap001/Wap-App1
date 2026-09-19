import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  Phone,
  PhoneCall,
  Compass,
  AlertTriangle,
  CheckCircle,
  X,
  Mic,
  Activity,
  Users,
  Navigation,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';

interface FloatingSOSButtonProps {
  role: 'customer' | 'driver';
  region: RegionId;
  language: LanguageCode;
  userName: string;
  currentLandmark?: string;
  onPlaySpeech?: (text: string) => void;
}

interface TelemetryPing {
  lat: number;
  lng: number;
  accuracyMeters: number;
  speedKmh: number;
  heading: number;
  timestamp: string;
  h3Index: string;
}

export const FloatingSOSButton: React.FC<FloatingSOSButtonProps> = ({
  role,
  region,
  language,
  userName,
  currentLandmark,
  onPlaySpeech
}) => {
  const currentRegion = REGIONS[region];
  const [isOpen, setIsOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [beaconId, setBeaconId] = useState<string>('');
  const [audioStreaming, setAudioStreaming] = useState(false);
  const [standDownConfirm, setStandDownConfirm] = useState(false);
  const [respondersNotified, setRespondersNotified] = useState(false);

  // Live Location Telemetry State
  const baseLat = currentRegion.centerCoordinates.lat;
  const baseLng = currentRegion.centerCoordinates.lng;
  const [telemetry, setTelemetry] = useState<TelemetryPing>({
    lat: baseLat,
    lng: baseLng,
    accuracyMeters: 2.1,
    speedKmh: role === 'driver' ? 32 : 28,
    heading: 148,
    timestamp: new Date().toLocaleTimeString(),
    h3Index: '8865239a03fffff'
  });

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const telemetryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Emergency contact lines based on territory
  const emergencyNumbers = {
    haiti: {
      police: { name: 'Police Nationale d’Haïti (PNH)', number: '114' },
      ambulance: { name: 'Ambulance SAMU Haïti', number: '116' },
      dispatch: { name: 'Wap Central Incident Command', number: '+509 2810-9111' }
    },
    french_guiana: {
      police: { name: 'Police Secours (Guyane)', number: '17' },
      ambulance: { name: 'SAMU Guyane / Urgences', number: '15' },
      dispatch: { name: 'Wap Cayenne Incident Desk', number: '+594 694 99-00-11' }
    },
    guyana: {
      police: { name: 'Guyana Police Force', number: '911' },
      ambulance: { name: 'Georgetown Public Hospital EMS', number: '913' },
      dispatch: { name: 'Wap Georgetown Safety Command', number: '+592 225-9110' }
    },
    suriname: {
      police: { name: 'Korps Politie Suriname', number: '115' },
      ambulance: { name: 'Ambulance Dienst Paramaribo', number: '113' },
      dispatch: { name: 'Wap Paramaribo Security Dispatch', number: '+597 400-9110' }
    }
  }[region];

  // Telemetry stream loop when SOS is active
  useEffect(() => {
    if (sosActive) {
      telemetryIntervalRef.current = setInterval(() => {
        setTelemetry((prev) => ({
          lat: Number((prev.lat + (Math.random() - 0.5) * 0.00015).toFixed(6)),
          lng: Number((prev.lng + (Math.random() - 0.5) * 0.00015).toFixed(6)),
          accuracyMeters: Number((1.5 + Math.random() * 1.5).toFixed(1)),
          speedKmh: Math.max(0, Math.round(prev.speedKmh + (Math.random() * 4 - 2))),
          heading: Math.round((prev.heading + Math.random() * 10 - 5 + 360) % 360),
          timestamp: new Date().toLocaleTimeString(),
          h3Index: '88652' + Math.floor(100000000 + Math.random() * 900000000).toString(16)
        }));
      }, 1000);
    } else {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    }
    return () => {
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
    };
  }, [sosActive]);

  const initiateSOSCountdown = () => {
    setIsOpen(true);
    if (sosActive) return; // already active

    setCountdown(3);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          triggerDistressBeacon();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  const triggerDistressBeacon = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    setSosActive(true);
    setAudioStreaming(true);
    setRespondersNotified(true);
    const newId = `SOS-${region.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setBeaconId(newId);

    // Audio Voice Alert Prompt
    if (onPlaySpeech) {
      if (language === 'ht') {
        onPlaySpeech(
          'Alerte SOS deklannche! Pozisyon GPS ou ap difize an dirèk bay sant sipò Wap la ak sèvis sekirite yo.'
        );
      } else if (language === 'fr') {
        onPlaySpeech(
          'Alerte SOS déclenchée ! Votre position GPS en temps réel est diffusée au centre de sécurité Wap et aux secours.'
        );
      } else {
        onPlaySpeech(
          'SOS Emergency activated! Real-time GPS location broadcast is streaming to Wap Platform Support.'
        );
      }
    }
  };

  const handleStandDown = () => {
    setSosActive(false);
    setAudioStreaming(false);
    setStandDownConfirm(false);
    setCountdown(null);
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
    }
    if (onPlaySpeech) {
      if (language === 'ht') {
        onPlaySpeech('Alerte SOS la anile. Pozisyon ou pa pataje ankò.');
      } else {
        onPlaySpeech('Alerte SOS désactivée. Diffusion de localisation arrêtée.');
      }
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-1.5">
        {/* Urgent beacon badge if currently active */}
        {sosActive && (
          <div className="bg-red-950/90 text-red-200 border border-red-500/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>GPS BROADCAST ACTIVE ({beaconId})</span>
          </div>
        )}

        <button
          id={`floating-sos-btn-${role}`}
          onClick={() => {
            if (sosActive) {
              setIsOpen(true);
            } else {
              initiateSOSCountdown();
            }
          }}
          className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full font-black text-sm transition-all duration-300 shadow-2xl border-2 cursor-pointer ${
            sosActive
              ? 'bg-red-600 hover:bg-red-500 text-white border-red-300 ring-4 ring-red-500/50 animate-pulse'
              : 'bg-red-600 hover:bg-red-700 text-white border-red-400/80 hover:scale-105 active:scale-95 shadow-red-900/50'
          }`}
          title="Emergency SOS / Ijans / Urgence"
        >
          {/* Radar ping halo animation */}
          <span className="absolute -inset-1 rounded-full bg-red-500/30 animate-ping pointer-events-none" />

          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-start leading-tight">
            <span className="tracking-wider text-xs font-black flex items-center gap-1">
              SOS
              <span className="text-[10px] opacity-80 uppercase tracking-normal font-semibold">
                • {role === 'driver' ? 'Driver' : 'Passenger'}
              </span>
            </span>
            <span className="text-[10px] text-red-100 font-normal">
              {sosActive ? 'Distress Active' : 'Emergency Help'}
            </span>
          </div>
        </button>
      </div>

      {/* Emergency Modal Dialog / Broadcast Dashboard */}
      {isOpen && (
        <div
          id="sos-emergency-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
        >
          <div className="bg-neutral-900 border-2 border-red-500/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-white my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-wide">
                      WAP EMERGENCY SOS SYSTEM
                    </h2>
                    <span className="text-[10px] uppercase font-bold bg-white text-red-700 px-2 py-0.5 rounded-full">
                      P0 Critical
                    </span>
                  </div>
                  <p className="text-xs text-red-100">
                    24/7 Platform Safety Command • Real-Time Satellite Telemetry
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (countdown !== null) cancelCountdown();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Countdown State: Before beacon triggers */}
            {countdown !== null && !sosActive && (
              <div className="p-6 text-center space-y-5">
                <div className="inline-flex relative items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
                  <div className="absolute text-4xl font-black text-red-400">{countdown}</div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Broadcasting Emergency Distress Beacon...
                  </h3>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto mt-1">
                    Alerting Wap Safety Operations, nearby fleet captains, and local emergency
                    dispatchers in {currentRegion.sampleCity}.
                  </p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-400 space-y-1 text-left max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span>Target User:</span>
                    <span className="font-semibold text-white">
                      {userName} ({role.toUpperCase()})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Landmark:</span>
                    <span className="font-semibold text-amber-300 truncate max-w-[200px]">
                      {currentLandmark || currentRegion.landmarkNamingStyle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPS Coordinates:</span>
                    <span className="font-mono text-emerald-400">
                      {telemetry.lat.toFixed(5)}, {telemetry.lng.toFixed(5)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={cancelCountdown}
                    className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition border border-neutral-700"
                  >
                    Cancel / False Alarm
                  </button>
                  <button
                    onClick={triggerDistressBeacon}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" /> Trigger Immediately
                  </button>
                </div>
              </div>
            )}

            {/* Active SOS Distress Broadcast Dashboard */}
            {sosActive && (
              <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Status Bar Alert */}
                <div className="bg-red-950/70 border border-red-600/70 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <div>
                      <div className="text-xs font-black text-red-200 tracking-wide">
                        DISTRESS BEACON BROADCASTING LIVE
                      </div>
                      <div className="text-[11px] text-red-300/80 font-mono">
                        Beacon Ref: {beaconId} • 1.0s High-Rate MQTT Telemetry
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* Section 1: Real-time Location Broadcast Box */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Live Satellite Telemetry Broadcast</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Last ping: {telemetry.timestamp}
                    </span>
                  </div>

                  {/* Telemetry Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" /> Latitude
                      </div>
                      <div className="font-mono text-xs font-bold text-emerald-300 mt-0.5">
                        {telemetry.lat.toFixed(6)}°
                      </div>
                    </div>

                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-400" /> Longitude
                      </div>
                      <div className="font-mono text-xs font-bold text-emerald-300 mt-0.5">
                        {telemetry.lng.toFixed(6)}°
                      </div>
                    </div>

                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-amber-400" /> Heading / Speed
                      </div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">
                        {telemetry.heading}° • {telemetry.speedKmh} km/h
                      </div>
                    </div>

                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-cyan-400" /> Accuracy
                      </div>
                      <div className="font-mono text-xs font-bold text-cyan-300 mt-0.5">
                        ±{telemetry.accuracyMeters}m (GPS L1/L5)
                      </div>
                    </div>
                  </div>

                  {/* Dual Broadcast Channels Details */}
                  <div className="bg-neutral-900/90 rounded-lg p-2.5 border border-neutral-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Primary IP Channel:</span>
                      </span>
                      <span className="font-mono text-emerald-300">
                        WSS Encrypted Telemetry (ACK: 42ms)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Cellular Fallback:</span>
                      </span>
                      <span className="font-mono text-emerald-300">
                        USSD / SMS Burst Dispatched to Digicel/Natcom
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Spatial Index (H3):</span>
                      <span className="font-mono text-neutral-300">{telemetry.h3Index}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Platform Support Incident Command */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Platform Support Status</span>
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                      Dispatcher Connected
                    </span>
                  </div>

                  <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Agent Jean-Marc Théodore</div>
                      <div className="text-[11px] text-neutral-400">
                        {emergencyNumbers.dispatch.name} • On Duty
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">
                        Live Tracking Screen Active • Audio Feed Monitoring
                      </div>
                    </div>
                    <a
                      href={`tel:${emergencyNumbers.dispatch.number}`}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call Dispatch
                    </a>
                  </div>

                  {/* Ambient Audio Stream Status */}
                  <div className="bg-neutral-900 rounded-lg p-2.5 border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-red-400 animate-pulse" />
                      <div>
                        <div className="font-semibold text-white">
                          Ambient Mic Stream ({audioStreaming ? 'Active' : 'Muted'})
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Encrypted 48kbps Opus audio streaming to Incident Ops
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setAudioStreaming(!audioStreaming)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                        audioStreaming
                          ? 'bg-red-500/20 text-red-300 border-red-500/50'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {audioStreaming ? 'Streaming' : 'Muted'}
                    </button>
                  </div>
                </div>

                {/* Section 3: Nearby Fleet Responders & Authorities */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Nearby Rapid Responders Alerted</span>
                    </span>
                    <span className="text-[10px] text-cyan-300">3 Moto Fleets Rerouted</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-white">M. Moïse (Wap Moto #409)</span>
                        <div className="text-[10px] text-neutral-400">
                          380m away • ETA: 1.1 min (Honda CG 125)
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                        En Route
                      </span>
                    </div>

                    <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-white">K. Paul (Wap Moto #112)</span>
                        <div className="text-[10px] text-neutral-400">
                          620m away • ETA: 1.8 min (Yamaha DT 125)
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                        En Route
                      </span>
                    </div>
                  </div>

                  {/* Direct One-Tap Local Police & Ambulance Call Lines */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${emergencyNumbers.police.number}`}
                      className="p-2.5 rounded-lg bg-red-900/60 hover:bg-red-800/80 border border-red-700/60 text-white flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Phone className="w-3.5 h-3.5 text-red-300" />
                      <div>
                        <div className="text-[10px] text-red-200">Call Police</div>
                        <div className="font-bold font-mono text-xs">{emergencyNumbers.police.number}</div>
                      </div>
                    </a>

                    <a
                      href={`tel:${emergencyNumbers.ambulance.number}`}
                      className="p-2.5 rounded-lg bg-blue-900/60 hover:bg-blue-800/80 border border-blue-700/60 text-white flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-300" />
                      <div>
                        <div className="text-[10px] text-blue-200">Call Ambulance</div>
                        <div className="font-bold font-mono text-xs">{emergencyNumbers.ambulance.number}</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Section 4: De-escalation & Safe Stand Down */}
                <div className="pt-2">
                  {!standDownConfirm ? (
                    <button
                      onClick={() => setStandDownConfirm(true)}
                      className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-neutral-700 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>I Am Safe Now / De-escalate Distress Signal</span>
                    </button>
                  ) : (
                    <div className="bg-neutral-950 border border-amber-500/80 rounded-xl p-3 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Confirm Stand Down of Emergency?</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Standing down will stop the 1-second GPS location broadcast, close the audio
                        stream, and inform the platform safety desk that you are secure.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStandDownConfirm(false)}
                          className="flex-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                        >
                          Keep Alert Active
                        </button>
                        <button
                          onClick={handleStandDown}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold shadow"
                        >
                          Confirm: I Am Safe
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

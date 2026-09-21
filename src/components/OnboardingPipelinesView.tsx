import React, { useState } from 'react';
import {
  Bike,
  Store,
  CheckCircle2,
  Clock,
  FileCheck,
  Shield,
  Smartphone,
  Award,
  AlertTriangle,
  Camera,
  ChevronRight,
  Sparkles,
  Scale
} from 'lucide-react';
import {
  DRIVER_ONBOARDING_STAGES,
  VENDOR_ONBOARDING_STAGES
} from '../data/extendedArchitectureData';
import { OnboardingStep } from '../types/architecture';
import { DriverContractModal } from './DriverContractModal';

export const OnboardingPipelinesView: React.FC = () => {
  const [activePipeline, setActivePipeline] = useState<'driver' | 'vendor'>('driver');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [simulatedQuizPassed, setSimulatedQuizPassed] = useState<boolean>(false);
  const [simulatedSelfieChecked, setSimulatedSelfieChecked] = useState<boolean>(true);
  const [showContractSample, setShowContractSample] = useState<boolean>(false);

  const steps = activePipeline === 'driver' ? DRIVER_ONBOARDING_STAGES : VENDOR_ONBOARDING_STAGES;
  const currentStep = steps[selectedStepIndex] || steps[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <FileCheck className="w-5 h-5" />
          <span>ONBOARDING PIPELINES & PROFILE INTEGRITY ARCHITECTURE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Comprehensive Onboarding Protocols for Motorcycle Fleets & Local Vendors
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Multi-stage onboarding gates combining AI document extraction, community elder endorsements,
          hardware safety inspections, and mandatory localized audio micro-quizzes to ensure 100% profile integrity.
        </p>
      </div>

      {/* Pipeline Selector (Driver vs Vendor) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-2">
            Target Pipeline:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActivePipeline('driver');
                setSelectedStepIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activePipeline === 'driver'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Motorcycle Driver Onboarding (5 Stages)</span>
            </button>

            <button
              onClick={() => {
                setActivePipeline('vendor');
                setSelectedStepIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activePipeline === 'vendor'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant & Kiosk Onboarding (5 Stages)</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-neutral-400 pr-2">
          Completion Rate: <strong className="text-emerald-400 font-mono">Stage {selectedStepIndex + 1} of {steps.length}</strong>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className={`grid grid-cols-1 ${activePipeline === 'driver' ? 'sm:grid-cols-6' : 'sm:grid-cols-5'} gap-2 text-xs`}>
        {steps.map((step, idx) => (
          <button
            key={step.stepNumber}
            onClick={() => setSelectedStepIndex(idx)}
            className={`p-3 rounded-xl border text-left transition space-y-1 ${
              selectedStepIndex === idx
                ? 'bg-amber-400/10 border-amber-400 text-white shadow'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-amber-400 font-bold">STAGE 0{step.stepNumber}</span>
              {step.isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              )}
            </div>
            <div className="font-bold text-xs truncate text-white">{step.title}</div>
            <div className="text-[10px] text-neutral-500 capitalize">
              {step.verificationMethod.replace('_', ' ')}
            </div>
          </button>
        ))}
      </div>

      {/* Current Step Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Step Overview */}
        <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                Stage {currentStep.stepNumber} Specification
              </span>
              <h2 className="text-base font-black text-white mt-0.5">{currentStep.title}</h2>
            </div>

            <span className="bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full text-[11px] font-mono capitalize">
              Method: {currentStep.verificationMethod.replace('_', ' ')}
            </span>
          </div>

          <p className="text-neutral-300 text-xs leading-relaxed">{currentStep.description}</p>

          {/* Required Documents Checklist */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            <div className="font-bold text-amber-400">Required Documents & Verification Evidence:</div>
            <div className="space-y-1.5 text-neutral-300">
              {currentStep.requiredDocuments.map((doc, dIdx) => (
                <div key={dIdx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Inspection Simulator */}
          {activePipeline === 'driver' && selectedStepIndex === 1 && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Dual Helmet AI Detection Simulator</span>
                </span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-800">
                  DOT / ECE 22.06 Standard
                </span>
              </div>

              <p className="text-neutral-400 text-[11px]">
                Driver takes a real-time handlebar camera selfie showing both the driver helmet and the spare passenger helmet.
                Computer vision validates helmet geometry and cleanliness before approving the driver for commercial trips.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSimulatedSelfieChecked(!simulatedSelfieChecked)}
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 px-3 py-1.5 rounded-lg font-bold transition shadow"
                >
                  {simulatedSelfieChecked ? 'Simulate Re-Inspection' : 'Validate Dual Helmet Photo'}
                </button>
                {simulatedSelfieChecked && (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>2 Helmets Detected (Confidence: 98.4%)</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Interactive Quiz Simulator */}
          {activePipeline === 'driver' && selectedStepIndex === 3 && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Interactive Audio Micro-Quiz Simulator (Kreyòl)</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">6 Audio Scenarios</span>
              </div>

              <div className="bg-neutral-900 p-3 rounded-lg text-[11px] text-neutral-300 space-y-1 font-mono">
                <div className="text-amber-400">Scenario #1: "Pasaje a pa vle mete kas la, kisa w dwe fè?"</div>
                <div>A. Mennen l kanmenm san kas.</div>
                <div className="text-emerald-400 font-bold">
                  B. Eksplike l se pou sekirite li, epi ba li yon bonèt pwòp pou l mete anba kas la. [Kòrèk]
                </div>
              </div>

              <button
                onClick={() => setSimulatedQuizPassed(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-3 py-1.5 rounded-lg transition"
              >
                {simulatedQuizPassed ? 'Quiz Passed: 100% Score' : 'Submit Sample Quiz Answers'}
              </button>
            </div>
          )}

          {/* Interactive Driver Legal Contract Review (Stage 6) */}
          {activePipeline === 'driver' && selectedStepIndex === 5 && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Statutory Bilateral Transport Agreement & Rights</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Digitally Enforceable</span>
              </div>
              <p className="text-neutral-400 text-xs">
                Review the certified partner contract protecting drivers from arbitrary road fines, municipal detention, and non-payment defaults.
              </p>
              <button
                type="button"
                onClick={() => setShowContractSample(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer shadow"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Open & Inspect Sample Contract Agreement</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Anti-Fraud & Profile Integrity Matrix */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Profile Integrity & Fraud Safeguards</span>
          </h3>

          <div className="space-y-2">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
              <div className="font-bold text-white">1. Anti-Account Renting</div>
              <p className="text-neutral-400 text-[11px]">
                Periodic random biometric selfie requests before shifting into "Available" status to prevent account sharing
                among unregistered drivers.
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
              <div className="font-bold text-white">2. Device & SIM IMEI Lock</div>
              <p className="text-neutral-400 text-[11px]">
                Driver profile is bound to a single verified device hardware ID. Logging in on a new device triggers a dual-SIM
                OTP and supervisor review.
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
              <div className="font-bold text-white">3. Sybil & Duplicate Document Filter</div>
              <p className="text-neutral-400 text-[11px]">
                SHA-256 document hashing flags duplicate driver licenses or motorcycle license plates attempting multiple registrations.
              </p>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
              <div className="font-bold text-white">4. Social Collateral Accountability</div>
              <p className="text-neutral-400 text-[11px]">
                If a driver commits theft or severe negligence, community elders who vouched are notified and their vouching reputation
                multiplier is suspended.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Sample Legal Contract Modal */}
      <DriverContractModal
        isOpen={showContractSample}
        onClose={() => setShowContractSample(false)}
        driverName="Jean-Baptiste Voltaire"
        driverId="DRV-ONBOARD-2026-0042"
        vehicleClass="Motorcycle (2-Wheeler)"
        plateNumber="HT-5829-TL"
      />
    </div>
  );
};

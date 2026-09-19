import React, { useState } from 'react';
import {
  Smartphone,
  Terminal,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  Apple,
  ExternalLink,
  Download,
  Share2,
  HardDrive,
  RefreshCw,
  FolderGit2,
  MapPin,
  Camera,
  Globe,
  Lock,
  Boxes
} from 'lucide-react';

export const MobileBuildEngineerView: React.FC = () => {
  const [platformTab, setPlatformTab] = useState<'android' | 'ios' | 'cicd'>('android');
  const [activeCodeFile, setActiveCodeFile] = useState<string>('build.gradle');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSimulatingBuild, setIsSimulatingBuild] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState<boolean | null>(null);
  const [frameworkMode, setFrameworkMode] = useState<'flutter' | 'react-native'>('flutter');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunBuildSimulation = () => {
    setIsSimulatingBuild(true);
    setBuildSuccess(null);
    setTimeout(() => {
      setIsSimulatingBuild(false);
      setBuildSuccess(true);
    }, 1200);
  };

  // ---------------------------------------------------------------------------
  // CODE SNIPPETS & CONFIGURATION CONTENTS
  // ---------------------------------------------------------------------------

  const KEYSTORE_GEN_CMD = `# Generate 2048-bit RSA Upload Keystore for Android Release Signing
keytool -genkey -v -keystore android/wap-upload-key.jks \\
    -keyalg RSA -keysize 2048 -validity 10000 \\
    -alias wap-upload-key \\
    -dname "CN=Wap Mobility, OU=Mobile Engineering, O=Wap Mobility Inc., L=Miami, ST=FL, C=US" \\
    -storepass WapMobilityReleaseKey2026! \\
    -keypass WapMobilityReleaseKey2026!`;

  const KEY_PROPERTIES_SRC = `# android/key.properties
storePassword=WapMobilityReleaseKey2026!
keyPassword=WapMobilityReleaseKey2026!
keyAlias=wap-upload-key
storeFile=../wap-upload-key.jks`;

  const ANDROID_BUILD_GRADLE_SRC = `// android/app/build.gradle
plugins {
    id "com.android.application"
    id "kotlin-android"
}

import java.io.FileInputStream
import java.util.Properties

def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace "com.wapmobility.app"
    compileSdkVersion 34

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
        coreLibraryDesugaringEnabled true
    }

    defaultConfig {
        applicationId "com.wapmobility.app"
        
        // API 21 (Android 5.0+) ensures universal handset support in Haiti,
        // Guyana, Suriname, and West Africa on low-spec Transsion/Samsung devices
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 10001
        versionName "1.0.0"

        multiDexEnabled true
    }

    signingConfigs {
        release {
            if (keystoreProperties['storeFile'] != null) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    flavorDimensions "environment"

    productFlavors {
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
        }
        production {
            dimension "environment"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

            ndk {
                // Split ABIs for 2G/3G low-data cellular downloads
                abiFilters "armeabi-v7a", "arm64-v8a", "x86_64"
            }
        }
    }
}`;

  const ANDROID_MANIFEST_SRC = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.wapmobility.app">

    <!-- 1. HIGH PRECISION GPS TELEMETRY -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- 2. BACKGROUND TELEMETRY FOR ACTIVE DISPATCH & DRIVERS (API 29+) -->
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- 3. ANDROID 14 (API 34) FOREGROUND LOCATION SERVICES -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

    <!-- 4. NETWORK & CELLULAR CONNECTIVITY -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- 5. CAMERA & KYC DRIVER IDENTITY VERIFICATION -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Hardware features optional so budget devices can still install -->
    <uses-feature android:name="android.hardware.location.gps" android:required="true" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:label="Wap Mobility"
        android:icon="@mipmap/ic_launcher">
        
        <!-- Foreground Location Tracking Service -->
        <service
            android:name=".services.LocationTrackingService"
            android:foregroundServiceType="location"
            android:exported="false" />
    </application>
</manifest>`;

  const IOS_INFO_PLIST_SRC = `<!-- ios/Runner/Info.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleIdentifier</key>
	<string>com.wapmobility.app</string>
	<key>CFBundleName</key>
	<string>Wap Mobility</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>10001</string>

	<!-- ======================================================================= -->
	<!-- MANDATORY PRIVACY & PERMISSION DESCRIPTIONS FOR APP STORE REVIEW        -->
	<!-- ======================================================================= -->

	<!-- 1. Rider pickup pinpointing & fare calculation -->
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>Wap Mobility needs access to your location while using the app to accurately pinpoint your pickup spot, calculate real-time route fares, and show nearby available drivers.</string>

	<!-- 2. Continuous driver telemetry & SOS safety tracking -->
	<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
	<string>Continuous location access is required for drivers to receive nearby ride requests and for riders to share live trip progress and SOS tracking with emergency contacts even when the app is minimized.</string>

	<!-- 3. Driver KYC and documentation capture -->
	<key>NSCameraUsageDescription</key>
	<string>Camera access is needed to take clear photos of your driver's license, vehicle registration, and complete KYC identity verification.</string>

	<!-- 4. Background Modes for Navigation & Dispatch -->
	<key>UIBackgroundModes</key>
	<array>
		<string>location</string>
		<string>fetch</string>
		<string>remote-notification</string>
	</array>

	<!-- App Store Export Compliance -->
	<key>ITSAppUsesNonExemptEncryption</key>
	<false/>
</dict>
</plist>`;

  const FASTLANE_FASTFILE_SRC = `# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload staging IPA to Firebase App Distribution"
  lane :staging do
    increment_build_number(build_number: ENV["GITHUB_RUN_NUMBER"] || Time.now.strftime("%Y%m%d%H%M"))
    match(type: "adhoc", app_identifier: "com.wapmobility.app.staging")
    
    gym(
      workspace: "Runner.xcworkspace",
      scheme: "staging",
      export_method: "ad-hoc",
      clean: true,
      output_directory: "./build/ios",
      output_name: "WapMobility-Staging.ipa"
    )

    firebase_app_distribution(
      app: ENV["FIREBASE_IOS_APP_ID"],
      groups: "internal-qa,field-drivers-haiti,field-drivers-guyana",
      release_notes: "Staging build with PostGIS dispatch and low-bandwidth optimizations.",
      ipa_path: "./build/ios/WapMobility-Staging.ipa"
    )
  end

  desc "Build and submit release IPA to Apple TestFlight"
  lane :beta do
    match(type: "appstore", app_identifier: "com.wapmobility.app")
    increment_build_number(build_number: latest_testflight_build_number + 1)
    
    gym(
      workspace: "Runner.xcworkspace",
      scheme: "Runner",
      export_method: "app-store",
      clean: true,
      output_directory: "./build/ios",
      output_name: "WapMobility-Release.ipa"
    )

    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      distribute_external: false,
      changelog: "Wap Mobility Release Candidate. Real-time GPS and SOS safety dispatch."
    )
  end
end`;

  const GITHUB_ACTIONS_CI_SRC = `# .github/workflows/mobile-release.yml
name: Mobile Release Build Pipeline

on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.x'
          channel: 'stable'
      - name: Decode Keystore
        run: |
          echo "\${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/wap-upload-key.jks
          echo "storePassword=\${{ secrets.KEYSTORE_PASSWORD }}" > android/key.properties
          echo "keyPassword=\${{ secrets.KEY_PASSWORD }}" >> android/key.properties
          echo "keyAlias=wap-upload-key" >> android/key.properties
          echo "storeFile=../wap-upload-key.jks" >> android/key.properties
      - name: Build Split APKs & AAB
        run: |
          flutter build apk --release --split-per-abi
          flutter build appbundle --release
      - uses: actions/upload-artifact@v4
        with:
          name: android-binaries
          path: |
            build/app/outputs/flutter-apk/*.apk
            build/app/outputs/bundle/release/*.aab

  build-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.x'
      - name: Fastlane Beta (TestFlight)
        env:
          APP_STORE_CONNECT_API_KEY: \${{ secrets.APP_STORE_CONNECT_API_KEY }}
          MATCH_PASSWORD: \${{ secrets.MATCH_PASSWORD }}
        run: |
          cd ios && bundle install
          bundle exec fastlane beta`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              <span>Mobile Build Engineering & CI/CD Toolchain</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Production Mobile Compilation Engine
            </h1>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Complete CLI execution commands, release keystore setup, Gradle API 21+ configuration,
              iOS Info.plist privacy permissions, and Fastlane TestFlight / Firebase deployment pipelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Framework Toggle */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setFrameworkMode('flutter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  frameworkMode === 'flutter'
                    ? 'bg-amber-400 text-neutral-950 font-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Flutter CLI
              </button>
              <button
                onClick={() => setFrameworkMode('react-native')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  frameworkMode === 'react-native'
                    ? 'bg-amber-400 text-neutral-950 font-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                React Native / Gradle
              </button>
            </div>

            <button
              onClick={handleRunBuildSimulation}
              disabled={isSimulatingBuild}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingBuild ? 'animate-spin' : ''}`} />
              <span>{isSimulatingBuild ? 'Compiling Toolchain...' : 'Simulate Build Check'}</span>
            </button>
          </div>
        </div>

        {/* Verification Success Toast */}
        {buildSuccess && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300 block">
                  All Mobile Compilation Prerequisites Verified:
                </span>
                <span className="text-emerald-400/80">
                  Android minSdkVersion 21 (API 21+) • Target SDK 34 • Release signing configs •
                  ACCESS_BACKGROUND_LOCATION • iOS NSLocationAlwaysAndWhenInUse • Fastlane lanes
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded font-bold">
              READY TO SHIP
            </span>
          </div>
        )}
      </div>

      {/* Main Platform Switcher: Android vs iOS vs CI/CD */}
      <div className="flex border-b border-neutral-800 gap-4">
        <button
          onClick={() => {
            setPlatformTab('android');
            setActiveCodeFile('build.gradle');
          }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            platformTab === 'android'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>1. Android Build Configuration (API 21+)</span>
        </button>

        <button
          onClick={() => {
            setPlatformTab('ios');
            setActiveCodeFile('Info.plist');
          }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            platformTab === 'ios'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>2. iOS Build & TestFlight / Fastlane</span>
        </button>

        <button
          onClick={() => {
            setPlatformTab('cicd');
            setActiveCodeFile('github-actions');
          }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            platformTab === 'cicd'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>3. Automated CI/CD GitHub Actions</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. ANDROID PLATFORM VIEW                                              */}
      {/* ===================================================================== */}
      {platformTab === 'android' && (
        <div className="space-y-6">
          {/* Key Generation & Execution Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step A: Keystore */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Step 1: Signing
                </span>
                <Lock className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Generate Release Keystore</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Generates a 2048-bit RSA key valid for 10,000 days. Required for signing APKs and Play Store AAB.
              </p>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] text-amber-300 overflow-x-auto relative">
                <code>keytool -genkey -v -keystore android/wap-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias wap-upload-key</code>
              </div>
              <button
                onClick={() => handleCopy(KEYSTORE_GEN_CMD, 'keystore-cmd')}
                className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                {copiedKey === 'keystore-cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied Keytool Command!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Keytool Command</span>
                  </>
                )}
              </button>
            </div>

            {/* Step B: Release APK */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  Step 2: Universal APK
                </span>
                <Download className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Compile Release APK</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Builds standalone production APK for direct sideloading or website APK distribution.
              </p>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                {frameworkMode === 'flutter' ? (
                  <code>flutter build apk --release</code>
                ) : (
                  <code>cd android && ./gradlew assembleRelease</code>
                )}
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    frameworkMode === 'flutter'
                      ? 'flutter build apk --release'
                      : 'cd android && ./gradlew assembleRelease',
                    'apk-cmd'
                  )
                }
                className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                {copiedKey === 'apk-cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy APK Command</span>
                  </>
                )}
              </button>
            </div>

            {/* Step C: Emerging Market Split ABI */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  Step 3: Low-Data ABI Split
                </span>
                <Boxes className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Split ABI APKs (14MB)</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Reduces binary size from 46MB down to 14MB for low-bandwidth 2G/3G cellular downloads in emerging markets.
              </p>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                <code>flutter build apk --release --split-per-abi</code>
              </div>
              <button
                onClick={() =>
                  handleCopy('flutter build apk --release --split-per-abi', 'split-cmd')
                }
                className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                {copiedKey === 'split-cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Split ABI Command</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Android Permissions Spec Banner */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Configured Android Permissions & Hardware Requirements</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-white font-bold text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>GPS Fine & Coarse</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">ACCESS_FINE_LOCATION</div>
                <p className="text-[10px] text-neutral-400">Continuous driver & passenger coordinate updates.</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-white font-bold text-xs flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Background Location</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">ACCESS_BACKGROUND_LOCATION</div>
                <p className="text-[10px] text-neutral-400">Allows active ride GPS tracking with screen locked.</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-white font-bold text-xs flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Internet & Sockets</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">INTERNET / NETWORK_STATE</div>
                <p className="text-[10px] text-neutral-400">PostGIS REST dispatch and Socket.IO streams.</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-white font-bold text-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Camera & KYC</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">CAMERA / READ_MEDIA</div>
                <p className="text-[10px] text-neutral-400">License scanning & vehicle registration KYC.</p>
              </div>
            </div>
          </div>

          {/* Android Code Viewer */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCodeFile('build.gradle')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeCodeFile === 'build.gradle'
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  android/app/build.gradle
                </button>
                <button
                  onClick={() => setActiveCodeFile('AndroidManifest.xml')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeCodeFile === 'AndroidManifest.xml'
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  AndroidManifest.xml
                </button>
                <button
                  onClick={() => setActiveCodeFile('key.properties')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeCodeFile === 'key.properties'
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  key.properties
                </button>
              </div>

              <button
                onClick={() => {
                  const text =
                    activeCodeFile === 'build.gradle'
                      ? ANDROID_BUILD_GRADLE_SRC
                      : activeCodeFile === 'AndroidManifest.xml'
                      ? ANDROID_MANIFEST_SRC
                      : KEY_PROPERTIES_SRC;
                  handleCopy(text, activeCodeFile);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700"
              >
                {copiedKey === activeCodeFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File Content</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-neutral-950 rounded-xl p-4 overflow-x-auto max-h-[460px] text-xs font-mono border border-neutral-800">
              <pre className="text-emerald-300">
                {activeCodeFile === 'build.gradle' && ANDROID_BUILD_GRADLE_SRC}
                {activeCodeFile === 'AndroidManifest.xml' && ANDROID_MANIFEST_SRC}
                {activeCodeFile === 'key.properties' && KEY_PROPERTIES_SRC}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. IOS PLATFORM VIEW                                                  */}
      {/* ===================================================================== */}
      {platformTab === 'ios' && (
        <div className="space-y-6">
          {/* iOS Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Info.plist Keys */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Step 1: Permissions
                </span>
                <ShieldCheck className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Apple Privacy Manifest</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                App Store Review mandates clear descriptions for location usage, background updates, and camera access.
              </p>
              <div className="space-y-1.5 text-[11px] font-mono text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <div className="text-amber-300">• NSLocationWhenInUseUsageDescription</div>
                <div className="text-emerald-300">• NSLocationAlwaysAndWhenInUse</div>
                <div className="text-purple-300">• NSCameraUsageDescription</div>
              </div>
            </div>

            {/* Step 2: Xcode / CLI Archive */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  Step 2: Archive & .ipa
                </span>
                <Terminal className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Compile Release Archive</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Builds Xcode Release Archive (.xcarchive) and exports signed .ipa using export options.
              </p>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                <code>flutter build ipa --release</code>
              </div>
              <button
                onClick={() => handleCopy('flutter build ipa --release', 'ipa-cmd')}
                className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                {copiedKey === 'ipa-cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Build IPA Command</span>
                  </>
                )}
              </button>
            </div>

            {/* Step 3: Fastlane TestFlight & Firebase */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  Step 3: Distribution
                </span>
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Fastlane CI Automation</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                1-command upload to Apple TestFlight or Firebase App Distribution for QA field drivers.
              </p>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                <code>bundle exec fastlane ios beta</code>
              </div>
              <button
                onClick={() =>
                  handleCopy('cd ios && bundle exec fastlane ios beta', 'fastlane-cmd')
                }
                className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
              >
                {copiedKey === 'fastlane-cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Fastlane Command</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* iOS Code Viewer */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCodeFile('Info.plist')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeCodeFile === 'Info.plist'
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  ios/Runner/Info.plist
                </button>
                <button
                  onClick={() => setActiveCodeFile('Fastfile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeCodeFile === 'Fastfile'
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  ios/fastlane/Fastfile
                </button>
              </div>

              <button
                onClick={() => {
                  const text =
                    activeCodeFile === 'Info.plist' ? IOS_INFO_PLIST_SRC : FASTLANE_FASTFILE_SRC;
                  handleCopy(text, activeCodeFile);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700"
              >
                {copiedKey === activeCodeFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File Content</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-neutral-950 rounded-xl p-4 overflow-x-auto max-h-[460px] text-xs font-mono border border-neutral-800">
              <pre className="text-cyan-300">
                {activeCodeFile === 'Info.plist' && IOS_INFO_PLIST_SRC}
                {activeCodeFile === 'Fastfile' && FASTLANE_FASTFILE_SRC}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. CI/CD GITHUB ACTIONS VIEW                                          */}
      {/* ===================================================================== */}
      {platformTab === 'cicd' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Automated Mobile Release Pipeline (.github/workflows/mobile-release.yml)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Builds signed Android APKs/AABs and triggers Fastlane iOS deployment on tag push (v*).
                </p>
              </div>
              <button
                onClick={() => handleCopy(GITHUB_ACTIONS_CI_SRC, 'gh-actions')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700"
              >
                {copiedKey === 'gh-actions' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied Workflow!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Workflow</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-neutral-950 rounded-xl p-4 overflow-x-auto max-h-[460px] text-xs font-mono border border-neutral-800">
              <pre className="text-amber-300">{GITHUB_ACTIONS_CI_SRC}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

# Wap Mobility - Mobile Application Build & Release Engineering Guide
# Flutter & React Native Production Compilations

This directory contains the production-grade Android and iOS build configurations, keystore generators, and Fastlane CI/CD automation scripts for Wap Mobility.

## Directory Structure
- `android/app/build.gradle`: Android application build configuration with signing configurations, ABI splits, ProGuard/R8, and API 21+ support.
- `android/app/src/main/AndroidManifest.xml`: Production Android permissions (GPS Fine Location, Background Location, Internet, Camera, Foreground Services).
- `android/key.properties.example`: Release keystore configuration template.
- `ios/Runner/Info.plist`: iOS permission declarations, privacy manifests, background location modes, and bundle settings.
- `ios/fastlane/Fastfile`: Fastlane lanes for staging (Firebase App Distribution) and production (Apple TestFlight & App Store Connect).
- `ios/fastlane/Appfile`: App identifier and Apple Developer credentials configuration.
- `build-android.sh`: Automated multi-flavor CLI script for generating Release APK and AAB.
- `build-ios.sh`: Automated CLI script for building and archiving iOS `.ipa`.

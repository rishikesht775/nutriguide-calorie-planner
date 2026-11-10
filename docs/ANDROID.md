# NutriGuide native Android app

## Native version 0.2.0

This replaces the earlier browser-backed launcher. MainActivity renders native Android controls and screens. There is no WebView, Custom Tab, or website-launch intent in the native experience. Home, Food, Move, Journey, Reports, profile setup and email sign-in are implemented inside the APK.

Core logging works on-device without an account or internet. Guest and each verified account have separate private on-device snapshots. A guest profile is never copied into a signed-in account. No 1,800 kcal / 100 g personal fallback is supplied; a valid profile is required for personal targets. The Java profile policy matches the web calculation. Saved shared custom targets persist; explicit profile recalculation refreshes protein.

## Implemented native features

| Screen | Native behavior |
| --- | --- |
| Home / Profile | Validated profile, calorie/protein estimates, editable shared targets, water, manual steps and guide selection |
| Food | Searchable 27-food catalogue, weighed portions, custom serving nutrition, daily calorie/protein/carbs/fat/fibre totals, removal of own food logs |
| Move | Six exercise instruction cards, monotonic active-time timer, pause/resume/discard, real duration history; backgrounding pauses the timer |
| Journey | Sleep, mood, stress, reflection and recovery history |
| Reports | Seven-day real food/recovery/workout summaries and native document-picker CSV export |
| Account | Native email/password registration/sign-in calls to existing HTTPS API, explicit manual Sync, local sign-out and per-owner pending state |

Daily water, steps and independent protein items roll over by local date, preserving previous-day stats. Suggested exercise instructions are never recorded as completed sessions unless the user runs and saves a timer; the completed-session habit requires at least one active minute.

## Account and cloud contract

NativeApi calls only fixed same-origin /api/ routes over HTTPS and sends the Origin required by the existing backend. Credentials are entered in native fields and are not persisted. Session cookies are stored separately using AES-GCM and an Android Keystore key; native backup is disabled. Health logs are private application data under Android's app sandbox, not individually encrypted by this client.

The native cookie jar is separate from Chrome. Browser login is not inherited. A verified /api/me user ID selects the local account. NativeStore switches owner before loading that account and does not adopt guest data. Every sync verifies the account identity, reads cloud state first, overlays only locally dirty top-level keys, and posts only after a successful read. Unknown web fields are preserved. A failed fetch never uploads a blind snapshot. If a local edit occurs during a sync, it remains pending for another Sync. Concurrent edits to the same array/key on two devices remain last-write-wins, matching the backend's whole-state model.

Email confirmation must be completed using the received email before native sign-in. Real Supabase confirmation/signup and session refresh acceptance still require device/provider testing; compilation, local policy tests and the guest emulator scenario do not prove them. Connected ChatGPT login, native password-recovery callbacks and background automatic sync are not implemented. A previously copied cloud record is not deleted automatically.

## Current scope

This is a first native version, not full parity with every website tool. Camera/photo logging, barcode scanning, native notifications/calendar reminders, Health Connect/Fitbit integration, animated guide artwork and automatic meal-plan generation are not included. The browser-backed APK is superseded. Native profile/target behavior is packaged in this APK and does not require publication of the corresponding website UI changes. Account/cloud endpoints still require internet and the existing live backend.

Package: com.rishikesht775.nutriguide. Android 8.0+ (API 26); target/compile SDK 35. Java 17, AGP 8.9.2 and Gradle 8.11.1. Version code 2 / version name 0.2.0-native. AndroidX Browser dependency has been removed.

## Download and install

1. Open Actions -> NutriGuide Android APK -> the successful native build.
2. Download NutriGuide-Native-Android-APK and extract it.
3. Open NutriGuide-Native-Android.apk on your phone and allow installation from Files if asked.
4. If the previous debug APK has a different signing certificate, uninstall that old launcher first. Do not clear your browser data; the native app is independent.
5. Open NutriGuide: native Home appears with an unset profile. Set up your own profile, or choose Account for native email sign-in.

This is a debug-signed test APK, not a Play Store release. Fresh CI runs can use different debug keys. A production release requires a stable privately managed signing key. No signing secrets are committed.

## Kiro / local build

Pull main, then open android/ in Android Studio or use installed Gradle 8.11.1 with JDK 17 and SDK 35:

    git pull --ff-only origin main
    gradle -p android assembleDebug testDebugUnitTest lintDebug
    gradle -p android connectedDebugAndroidTest

The last command requires a running emulator/device. The project has no checked-in wrapper binary. Generated output, local.properties, caches and signing keys are ignored. APK output is android/app/build/outputs/apk/debug/app-debug.apk.

## Validation and phone acceptance

The workflow assembles the APK, runs seven JVM policy tests and Android lint, then runs a native Espresso flow on an API 30 emulator before uploading the APK. The instrumented flow verifies no WebView in the native view hierarchy, empty-profile setup, 1,950 kcal estimate for a synthetic profile, correct Paneer logging, 1,685 kcal remaining, persistence through Activity recreation and native Journey/Reports navigation.

Physical Samsung S21 FE acceptance remains required: installation, profile/target edits, food/custom portions, timer pause on background, day rollover, recovery, CSV export, native email confirmation/login, two-account isolation, explicit cloud sync and offline edits/retry. These must not be reported as passed until actually executed.

The earlier browser-backed build/run 42908566596 is historical and must not be used as the native download. Actual native build/run evidence is recorded after the new workflow completes.

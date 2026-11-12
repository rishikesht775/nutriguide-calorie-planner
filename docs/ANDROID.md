# NutriGuide native Android app

## Mobile test suite and change traceability

The complete native APK test plan is maintained in [docs/MOBILE-TESTING.md](MOBILE-TESTING.md), with a concise index in [tests/mobile/MOBILE-TEST-MATRIX.md](../tests/mobile/MOBILE-TEST-MATRIX.md). It covers authentication, safe areas, lifecycle, Today, Food date isolation, Move, Journey, Reports, network failures, privacy and physical Samsung S21 FE acceptance. Android changes must update native tests and this mobile documentation in the same change; `.github/workflows/android.yml` runs `scripts/check-mobile-test-alignment.mjs` before building.

## Native UI redesign — 11 November 2026

The Android app is being rebuilt around Jetpack Compose and Material 3. The redesign uses an app-level `Scaffold`, a Material 3 bottom navigation bar, feature-oriented screens, a ViewModel-owned UI state, and a repository boundary for persistence and sync. The current UI direction follows established nutrition-app patterns: a Today diary as the first screen, direct meal logging, visible calorie/macro summaries, quick actions, workout cards and weekly reports. It retains NutriGuide’s green visual language and account-isolation behavior.

This redesign is intentionally separate from the website DOM. The Android app is not a WebView wrapper and does not copy a website layout into native views.

## Flutter decision

The current Android client uses Kotlin, Jetpack Compose and AndroidX because this release targets Android first and needs direct control over Android system insets, lifecycle, keyboard behavior, offline storage, secure cookies, device permissions and Samsung acceptance. The existing native implementation, instrumentation tests and CI workflow are built around that choice.

Flutter would be a good choice when the product needs Android and iOS from one shared UI codebase, the team can maintain Dart and Flutter tooling, and platform-specific behavior can be isolated behind plugins or platform channels. It can also be considered for a future cross-platform redesign when feature parity, accessibility, performance and device integrations are revalidated on both platforms.

Flutter is not used for this release because switching would be a rewrite rather than a drop-in replacement. It would require rebuilding the screens, state and persistence boundaries, authentication/device integrations, CI packaging, manual device cases and the related architecture documents. The automated Flutter layers would need to move to flutter_test and integration_test. Flutter would still require the Android SDK, Java and an emulator or physical device for Android builds.

Do not mix Flutter widgets into the current Compose application. If a Flutter migration is approved later, create a separately scoped migration plan, preserve the mobile case IDs, map every case to Flutter tests, and compare the native and Flutter builds on Samsung hardware before replacing the Android client.

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

The workflow assembles the APK, runs JVM policy tests and Android lint, then runs native Jetpack Compose instrumentation on an API 30 emulator before uploading the APK. The instrumented flow verifies no WebView in the native view hierarchy, empty-profile setup, 1,950 kcal estimate for a synthetic profile, correct Paneer logging, 1,685 kcal remaining, persistence through Activity recreation and native Journey/Reports navigation.

Physical Samsung S21 FE acceptance remains required: installation, profile/target edits, food/custom portions, timer pause on background, day rollover, recovery, CSV export, native email confirmation/login, two-account isolation, explicit cloud sync and offline edits/retry. These must not be reported as passed until actually executed.

The earlier browser-backed build/run 42908566596 is historical and must not be used as the native download. Actual native build/run evidence is recorded after the new workflow completes.

The first native build compiled and reached Android lint. Lint rejected raw integer layout orientations; those were replaced by explicit LinearLayout.VERTICAL constants before rebuilding. Native APK acceptance remains tied to a subsequent successful build/emulator run.

The emulator test import conflict between Espresso and ViewActions keyboard helpers was corrected. The workflow now compiles the instrumentation APK before starting the emulator to catch test compilation problems earlier.

## Verified native build — 11 November 2026

Native workflow run 42913202451 completed successfully for source commit 5e99d52923578e50b619022c545718dbdfba9a32. Native APK and instrumentation APK compilation, seven JVM policy tests, Android lint, and the Espresso native flow on an Android 11/API 30 emulator passed. The emulator verified native views (no WebView), empty-profile setup, calculated targets, correct selected-food logging, remaining calories, Activity recreation persistence, and Journey/Reports navigation.

Download the native artifact: https://github.com/rishikesht775/nutriguide-calorie-planner/actions/runs/42913202451/artifacts/13806969124 . Its ZIP contains NutriGuide-Native-Android.apk, SHA256SUMS.txt and the installation/limitations guide. The artifact is retained for 30 days and can be regenerated by the Android workflow. Physical Samsung installation, real email/provider acceptance, cloud sync across real accounts/devices and the remaining manual cases are still pending. This native build supersedes the earlier browser-backed artifact.

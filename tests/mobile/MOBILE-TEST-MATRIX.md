# Mobile APK test suite

The native Android suite is maintained in `docs/MOBILE-TESTING.md`.

## Automated entry points

- JVM: `gradle -p android testDebugUnitTest`
- Compose instrumentation: `gradle -p android connectedDebugAndroidTest`
- Release workflow: `.github/workflows/android.yml`
- Alignment guard: `node scripts/check-mobile-test-alignment.mjs`

## Case groups

- MOB-AUTH: account gate, registration, reset, logout and owner isolation
- MOB-SYS: safe area, lifecycle, keyboard, font scale and device sizes
- MOB-TODAY: profile setup and non-mutating quick actions
- MOB-FOOD: meal isolation, nutrition, date navigation and persistence
- MOB-MOVE: filters, completion idempotency and lifecycle
- MOB-JOURNEY: mood, note and recovery persistence
- MOB-REPORT: empty state, period navigation and summaries
- MOB-NET / MOB-SEC: network failures, privacy and account separation

When an Android behavior changes, add or update an automated case where possible and update the corresponding matrix row and `docs/MOBILE-TESTING.md` traceability section in the same commit.

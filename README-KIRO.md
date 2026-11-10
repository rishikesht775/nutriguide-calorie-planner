# NutriGuide testing in Kiro (Windows)

## Android APK

The android/ directory is the browser-backed Android launcher. GitHub Actions -> NutriGuide Android APK builds a downloadable debug APK and runs Android lint. See docs/ANDROID.md for installation, local Gradle 8.11.1 / JDK 17 / SDK 35 setup, and ten phone acceptance cases. The APK opens the currently published website; it does not include unpublished web changes. No local Android setup is required to download a successful CI APK.

## Fresh-account target fix (11 November 2026)

The menu and its setup rules are unchanged. New accounts show setup prompts instead of automatic 1,800 kcal / 100 g targets. Pull main before testing. Run the focused checks after the setup commands below:

```powershell
npm.cmd run test:contracts
npx.cmd playwright test tests/e2e/unconfigured-targets.spec.ts tests/e2e/account-isolation.spec.ts tests/e2e/personal-plan.spec.ts
npm.cmd run docs:check
```

See docs/UNCONFIGURED-TARGETS.md for expected results and docs/TARGETS-VALIDATION.txt for executed checks. Automatic TXT reports remain under test-reports. Existing downloaded Word documents are snapshots; the Documentation workflow creates the updated export from docs/APPLICATION.md.

Open your actual repository folder, for example:

```powershell
cd "C:\Users\rishi\Downloads\nutriguide-kiro-project\nutriguide-calorie-planner"
git pull --ff-only origin main
npm.cmd install
npm.cmd run test:install-browsers
```

Use Node 24 LTS (Node 22.13+ also provides the required SQLite API). No manual `npm run dev` is needed: Playwright starts the local server, waits for `/legacy`, binds a dedicated test server at http://127.0.0.1:5187, and stops the server it started. Tests require their own fresh server so another checkout is never silently reused. PLAYWRIGHT_BASE_URL overrides both the readiness URL and the actual launched port for local HTTP targets; remote targets do not launch a server. PORT controls manual dev only and explicit CLI --port takes priority. Do not run separate test commands simultaneously against the same port.

If you previously set a remote URL in this terminal, clear it for local testing:

```powershell
Remove-Item Env:PLAYWRIGHT_BASE_URL -ErrorAction SilentlyContinue
```

## Run everything

```powershell
npm.cmd run test:release
```

This runs Node route/database contracts followed by every Playwright test. For just Playwright use `npm.cmd run test:all`.

## Run categories separately

```powershell
npm.cmd run test:smoke
npm.cmd run test:sanity
npm.cmd run test:functional
npm.cmd run test:integration
npm.cmd run test:system
npm.cmd run test:uat
npm.cmd run test:regression
npm.cmd run test:ui
npm.cmd run test:frontend
npm.cmd run test:accessibility
npm.cmd run test:security
npm.cmd run test:performance
npm.cmd run test:edge
npm.cmd run test:database
npm.cmd run test:backend
npm.cmd run test:contracts
```

`test:uat` includes the full E2E journey; backend includes the Node SQLite contracts. Some category coverage overlaps by design.

## Browser, debugging and reports

```powershell
npm.cmd run test:desktop
npm.cmd run test:mobile
npm.cmd run test:e2e:ui
npm.cmd run test:e2e:headed
npm.cmd run test:e2e:debug
npm.cmd run test:list
npm.cmd run test:report
npx.cmd tsc -p tests/tsconfig.json
```

Failure evidence: `playwright-report/`, `test-results/results.json`, failure screenshots, traces and retained videos. UI tests attach full-page screenshots but do not claim approved pixel baselines. Use `npx.cmd playwright show-trace <trace.zip>` to inspect a failure.

The GitHub Actions workflow runs contracts plus desktop/mobile tests on pushes and pull requests. Reports upload even on failure. External identity login and actual cloud cross-device testing are manual release checks; UI tests stub auth/state to avoid touching real accounts.

See `tests/e2e/TEST-MATRIX.md` for coverage and manual checks; `tests/VALIDATION-STATUS.md` for what has actually run and known concerns. A red test can indicate a real current product defect. Unimplemented AI/scanner/wearable features are not claimed as working.

If pull fails because of local edits, run `git status` and resolve them before pulling; do not reset or discard work blindly.

## Automatic TXT reports — send these for fixes

Every normal Playwright test command automatically writes `test-reports/playwright-latest.txt`, including individual categories, headed runs and failures. Backend/database contract runs also write `test-reports/contracts-latest.txt`. `test:release` runs both, so send both TXT files after a full release run.

Timestamped copies in the same folder preserve earlier runs. Reports contain test/project names, attempts, duration, errors, stack traces, stdout/stderr, attachment paths and a final summary. A partially completed run is labelled RUNNING until FINAL SUMMARY appears. Runner/startup errors are included when Playwright invokes the reporter; errors before Playwright can load its configuration and abrupt process termination may only appear in the terminal. `test:list` lists tests and does not constitute a test run. Reporter output can be overridden by an explicit `--reporter` CLI option; use the normal npm commands to keep automatic TXT reporting.

Open the latest report in Windows:

```powershell
notepad test-reports\playwright-latest.txt
notepad test-reports\contracts-latest.txt
```

Send the TXT files here after testing. For overlap/layout failures, also send the screenshot or trace named in the report. Text reports are ignored by Git and included in CI artifacts, so test logs do not enter the source repository.

## Current stability release

New product modules are in `public/app/`; the main page is `public/legacy.html`. The active sync implementation is `public/cloud-sync.js` (the duplicate root-level legacy copy was removed). API routes are under `app/api/`. See `docs/COMPETITOR-AND-ARCHITECTURE-REVIEW.md` for the feature comparison, implementation boundaries and remaining work.

After pulling this release, use `npm.cmd run test:release`. The new meal-plan/recovery/barcode UI cases are included in `test:all` and `test:functional`. The secure sign-in tests now check the platform account handoff instead of the removed unused password form.

## Shared profile defaults and journey guide

The latest release automatically fills every tab from the saved profile while preserving explicit edits. Use `npm.cmd run test:personalization` for the focused Playwright suite. See `docs/PROFILE-DEFAULTS-AND-GUIDE.md` for default-versus-custom behavior, guide actions and implementation boundaries.

## Maintained application document

Read `docs/APPLICATION.md` for current architecture, requirements, integrations and limits. Every code change must update relevant sections and run `npm.cmd run docs:update` followed by `npm.cmd run docs:check`. GitHub Actions checks freshness and publishes the current Word export as the NutriGuide-Application-Document artifact. See `docs/DOCUMENTATION.md` for export instructions.

## Automatic test server troubleshooting

After pulling the automatic-server fix, stop earlier manual dev/test runs with Ctrl+C in their terminals. Clear temporary overrides from older troubleshooting, then use one command:

```powershell
Remove-Item Env:PORT -ErrorAction SilentlyContinue
Remove-Item Env:PLAYWRIGHT_BASE_URL -ErrorAction SilentlyContinue
npm.cmd run test:all
```

No separate dev terminal is needed. Allow up to 180 seconds for startup. If the dedicated port is occupied, stop that specific earlier app/test run or set PLAYWRIGHT_BASE_URL to another local HTTP port; Playwright launches the app there automatically. Do not terminate unrelated processes. A test discovery command does not run browser assertions.

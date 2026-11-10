# NutriGuide testing in Kiro (Windows)

Open your actual repository folder, for example:

```powershell
cd "C:\Users\rishi\Downloads\nutriguide-kiro-project\nutriguide-calorie-planner"
git pull --ff-only origin main
npm.cmd install
npm.cmd run test:install-browsers
```

Use Node 24 LTS (Node 22.13+ also provides the required SQLite API). No manual `npm run dev` is needed: Playwright starts the local server, waits for `/legacy`, reuses an available local server, and stops the server it started. CI requires its own fresh server. Do not run separate test commands simultaneously against the same port.

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

# Testing guidance

## Commands
- `npm run dev` starts the local app.
- `npm run test:e2e` runs the Playwright suite.
- `npm run test:e2e:ui` opens Playwright UI mode.
- `npm run test:e2e:headed` runs with a visible browser.
- `npm run test:report` opens the HTML report.

## Coverage priorities
1. Profile calculation unlocks the tabs.
2. Journey story mode selection and section progression.
3. Indian food nutrition lookup and unknown-food protection.
4. Exercise checklist, timer, video link, and completion action.
5. Mobile tab and card behavior.

## Test data
Use the fixed demo profile in `tests/e2e/helpers.ts`. Do not put real account details, passwords, or tokens in the repository.

## Release checks and evidence
- Use `npm.cmd run test:release` on Windows; Playwright starts the app automatically.
- `npm.cmd run test:contracts` exercises state/barcode routes, SQLite, sync and meal/backup logic without a browser.
- Every Playwright category writes `test-reports/playwright-latest.txt`; contracts write `test-reports/contracts-latest.txt`. Preserve failure evidence.
- UI auth is mocked in test contexts only. Never add an authentication bypass to production.
- Camera, speech, actual provider login and cross-device D1 need manual/sandbox validation.
- Do not skip real failing cases to make reports green.


## Native Android mobile suite

- Read docs/MOBILE-TESTING.md before changing Android behavior.
- Run gradle -p android testDebugUnitTest lintDebug.
- Run gradle -p android connectedDebugAndroidTest with an API 30 emulator/device.
- Update android/app/src/androidTest or android/app/src/test and the matching MOB-* case whenever a native feature or bug fix changes behavior.
- Run node scripts/check-mobile-test-alignment.mjs before pushing Android changes.
- Keep real provider/email, two-account, Samsung S21 FE and physical-device checks marked manual until executed.

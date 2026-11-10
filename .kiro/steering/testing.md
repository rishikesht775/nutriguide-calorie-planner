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

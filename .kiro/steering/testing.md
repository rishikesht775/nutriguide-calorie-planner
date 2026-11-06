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

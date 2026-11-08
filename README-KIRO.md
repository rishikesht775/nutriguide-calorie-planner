# NutriGuide in Kiro

This repository is ready to open as a Kiro workspace. It includes the complete Site source, local development scripts, Kiro steering/spec files, and Playwright end-to-end tests.

## Open the repository

1. Install Kiro IDE for Windows x64 from the [official Kiro downloads page](https://kiro.dev/downloads/). Choose **Windows User Installer (x64)**.
2. Open this repository folder in Kiro.

For a one-command dependency setup, run `./scripts/setup-windows.ps1` in PowerShell.
3. Open the integrated terminal in the repository root.

## Install and run

```powershell
npm install
npm run dev
```

The local app runs at `http://127.0.0.1:5173/legacy`.

## Playwright

```powershell
npm run test:install-browsers
npm run test:e2e
```

Useful modes:

```powershell
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:debug
npm run test:report
```

To test the deployed site instead of the local server:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://nutriguide-calorie-planner.rishikesht775.chatgpt.site"
npm run test:e2e
```

Do not commit real credentials or `.env` files. Use `.env.example` as the template.

## Test suite coverage

The Playwright suite is organized in `tests/e2e/` and includes:

- Smoke and sanity release gates
- In-app authentication and sign-up/sign-in field rules
- UI and responsive mobile checks
- Frontend runtime, tab isolation, and rendering checks
- Functional calorie, food, protein, trainer, and exercise checks
- Integration and system tab/state flows
- Complete end-to-end first-day journey across every primary tab
- Accessibility labels, names, alt text, and keyboard focus
- Security checks for auth gating, credential URL leakage, and user input handling
- Backend/API checks for `/api/me` and `/api/state`
- Database checks for the D1 `user_state` schema and user isolation
- Performance checks for initial load, tab response, and scrollability
- Regression checks for Journey, Plan & reports, duplicate guides, and tab isolation
- UAT first-day user journeys
- Edge cases for required fields, unknown foods, zero-state tracking, boundary profiles, and long journal text
- Diwali visual and festival-calendar checks

See [`tests/e2e/TEST-MATRIX.md`](tests/e2e/TEST-MATRIX.md) for the full mapping.

Run one category with a title filter, for example:

```powershell
npx playwright test tests/e2e/functional.spec.ts
npx playwright test tests/e2e/complete-flow.spec.ts
npx playwright test tests/e2e/backend.spec.ts tests/e2e/database.spec.ts
npx playwright test tests/e2e/security.spec.ts tests/e2e/performance.spec.ts
npx playwright test --grep "@regression"
```

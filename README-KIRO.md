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

# NutriGuide QA bug report

Tested against the deployed app after Site version 52 and the latest GitHub sync.

| ID | Area | Result | Notes |
| --- | --- | --- | --- |
| NG-001 | Profile submission | Fixed | Guarded weekly-strip updates so profile initialization does not throw when the helper is not loaded yet. |
| NG-002 | Food Studio Indian favourites | Passed manually | Indian favourites rendered 23 food cards. |
| NG-003 | Nutrition lookup | Passed manually | Chicken biryani at 200 g returned 400 kcal, 24.0 g protein, and 48.0 g carbs. |
| NG-004 | Unknown/custom food | Covered | Existing Food Studio test covers custom/unknown food handling; rerun in Kiro after installing the browser binary. |
| NG-005 | Exercise tab and cards | Fixed and passed manually | Exercise routing now isolates the tab. Bodyweight squat opened a detail modal with instructions and checklist. |
| NG-006 | Journey story mode | Passed manually | Journey opened its mode selector and Indian Plate Adventure opened at Step 1 of 5. |
| NG-007 | Plan & Reports festival calendar | Passed manually | Calendar shows Dhanteras, Naraka Chaturdashi, Deepavali, and Bhai Dooj. The removed top celebration strip stays absent. |
| NG-008 | Diwali visual layers | Passed manually | Home, Food Studio, and Exercise each rendered their own themed canvas and garland layers; 27 canvases and 27 garlands were present across the page. |
| NG-009 | Mobile tab behavior | Pending CLI runner | Mobile Playwright coverage is committed, but this environment has no Chromium executable available. |

## Playwright runner blocker

The test command reached Playwright but could not launch because the Chromium headless shell is not installed. The browser download was attempted and the CDN archive was truncated by the current network environment. This is a runner setup issue, not an application assertion failure.

Run from Kiro in the repository root:

```powershell
npm install
npx playwright install chromium
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:5173'
npm run test:e2e
```

The new visual coverage is in `tests/e2e/diwali.spec.ts`.
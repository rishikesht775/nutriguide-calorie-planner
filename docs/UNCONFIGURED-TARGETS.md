# Fresh-account targets and Kiro acceptance

Reviewed 11 November 2026.

Before a valid profile is calculated, the wellness dashboard has no calorie or protein target. Calories remaining displays an em dash with "Complete your profile to set your calorie target". Logged protein remains a real total, with a setup prompt instead of a fabricated target. The protein-target input is empty and disabled; its progress bar stays at zero. Meal-plan generation refuses to create a personal plan without configured targets. Suggestions and guide replies do not describe generic numbers as personal targets.

After setup, every target uses the shared personal plan. A deliberate custom target of 1,800 kcal or 100 g remains valid; the repair removes automatic fallback values, not legitimate user choices. A missing or incomplete profile cannot revive targets from a stale plan or widget cache. Existing account isolation continues to preserve the previous owner's data separately.

Automatic profile restoration on page load/cloud hydration preserves saved shared calorie and protein overrides. A deliberate Home "Calculate my plan" submission continues to refresh protein from the submitted profile. Those two paths are distinguished explicitly so a refresh cannot silently replace a chosen protein target.

The menu, sidebar, tab names, responsive layout and incomplete-profile navigation rules are unchanged at the owner's request. Complete setup before expecting the existing menu to appear. This change does not unlock sections or alter navigation.

## Test cases

| ID | Scenario | Expected result |
| --- | --- | --- |
| TARGET-01 | Fresh authenticated account, no cloud profile | No numeric calorie target; calorie/protein setup prompts; empty disabled protein target; no weekly plan |
| TARGET-02 | Refresh before profile setup | Targets remain unset; no automatic meal plan is saved |
| TARGET-03 | Programmatic meal-generation attempt before setup | Setup message; no default plan is written |
| TARGET-04 | Complete synthetic profile: male, 30, 168 cm, 84 kg, activity 1.375, weight loss | Shared 1,950 kcal / 118 g targets, enabled tracker, consistent Home/Food values |
| TARGET-05 | Refresh a completed profile | Calculated/shared targets are restored |
| TARGET-06 | Alice -> new Bob -> returning Alice in one browser | Bob has no inherited targets, meal/grocery data or profile; Alice retains her own records |
| TARGET-07 | Valid custom target of 1,800 kcal / 100 g | Intentional values remain valid after setup |
| TARGET-08 | Stale shared plan with no valid profile | No personal targets are exposed |
| TARGET-09 | Save custom shared targets, then refresh/cloud hydrate | Custom calorie/protein targets persist; a deliberate Home recalculation still refreshes protein |

The automated browser cases use mocked account/state APIs, Desktop Chrome and Pixel 7 emulation. They do not prove real Supabase signup, email delivery, or cross-device provider acceptance. Use automatic TXT reports in test-reports for actual execution outcomes.

## Kiro commands

From your existing NutriGuide repository, review local changes before pulling. The fast-forward pull preserves local work and stops on conflicts.

```powershell
git status --short
git pull --ff-only origin main
Remove-Item Env:PLAYWRIGHT_BASE_URL -ErrorAction SilentlyContinue
npm.cmd run test:contracts
npx.cmd playwright test tests/e2e/unconfigured-targets.spec.ts tests/e2e/account-isolation.spec.ts tests/e2e/personal-plan.spec.ts
npm.cmd run docs:check
```

Playwright starts its own local server. Run one test command at a time. Reports are written automatically. The full release command is npm.cmd run test:release. For real-provider acceptance, use a fresh test account and verify the expected empty state, fill its own profile, sign out, and sign back into an existing account. Do not delete existing cloud records to simulate this check.

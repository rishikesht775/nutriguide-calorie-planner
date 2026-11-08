# NutriGuide Playwright test matrix

Run locally with `npm.cmd run test:e2e` or by category with a title filter.

| Suite | File | Coverage |
| --- | --- | --- |
| Smoke | `smoke.spec.ts` | Profile unlock, primary navigation, page errors |
| Authentication | `auth.spec.ts` | In-app sign-in gate, sign-up-only name field, safe auth handoff |
| UI | `ui.spec.ts` | Trainer banner, tab content, mobile overflow |
| Frontend | `frontend.spec.ts` | Runtime errors, visible-tab isolation, responsive rendering |
| Functional | `functional.spec.ts` | Calories/BMI, guide selection, food nutrition, exercise completion |
| Integration | `integration.spec.ts` | Reload persistence, story-to-tab routing, dashboard updates |
| System | `system.spec.ts` | Full tab sequence, tab isolation, offline manual logging |
| End to end | `complete-flow.spec.ts` | Profile → trainer → food → exercise → journey → reports |
| Accessibility | `accessibility.spec.ts` | Labels, names, alt text, keyboard focus |
| Security | `security.spec.ts` | Auth gating, password exposure, safe user input rendering |
| Backend/API | `backend.spec.ts` | `/api/me`, `/api/state`, invalid payloads, controlled errors |
| Database | `database.spec.ts` | D1 schema contract and unauthenticated state isolation |
| Performance | `performance.spec.ts` | Load budget, tab response budget, scrollability |
| Regression | `regression.spec.ts` | Journey/Reports navigation, duplicate guide removal, trainer switching, badge duplication |
| Sanity | `sanity.spec.ts` | Release-gate Panda flow and Diwali Food Studio |
| UAT | `uat.spec.ts` | First-day weight-loss journey and guided story onboarding |
| Edge cases | `edge-cases.spec.ts` | Required fields, unknown foods, zero state, boundary profile values, long journal text |
| Visual/festival | `diwali.spec.ts` | Firework layers, marigold decorations, festival calendar, festive food banner |

The tests use Playwright projects for Chromium desktop and mobile Chrome from `playwright.config.ts`.

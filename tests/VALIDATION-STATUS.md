# Profile defaults and journey-guide validation — 10 November 2026

- **117 Node contract checks passed**, including profile calculation/override policy, calorie+protein recipe planning, journey progress and the real personal-plan controller with a small explicit DOM adapter. This adapter is not browser/layout verification.
- Full application TypeScript and Playwright TypeScript checks passed.
- Playwright collection: **220 executions in 29 files** (110 cases × desktop/mobile), including 7 new shared-profile scenarios.
- Production build and JS syntax checks passed for this release.
- Existing automatic TXT reporting remains enabled under `test-reports/`.

## Not claimed as passing

The full signed-in Playwright suite still needs execution in Kiro or GitHub Actions. This environment previously blocked direct Chromium launch; the shared browser preview does not supply a signed-in test session. SQLite, VM and stubbed-provider checks do not certify production identity-provider behavior, actual multi-device D1, physical device speech/camera, or pixel-perfect responsive layout.

## Behavior guarded by tests

Saved profiles seed all tabs; manual targets apply everywhere; manual meal/workout plans survive profile changes; reset uses the latest profile and keeps logs; readiness can soften auto training; suggested meals never become consumed-food records; real logs advance the guide; impossible protein targets show an explicit gap. A controller test caught and fixed a first-session feedback null-state crash before publication.

Account entry now uses one explicit ChatGPT provider link; local preview limitations and identity-check failures are visible. Full provider sign-in has not been automated against a real account.

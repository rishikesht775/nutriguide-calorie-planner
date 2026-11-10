# Validation status — 10 November 2026

- Test TypeScript check: passed (`npx tsc -p tests/tsconfig.json`).
- Playwright collection: passed, 188 executions in 27 spec files (94 cases × 2 projects).
- Node backend/database contracts: 17 passed. Actual route exports and migration executed with an in-memory SQLite adapter and controlled identity; this does not validate the Cloudflare deployment.
- Local HTTP backend/database checks: 12 passed (6 cases repeated by both projects). Real local `/api/me` and `/api/state`, no mocked HTTP responses.
- Browser smoke attempt: blocked before page load. Installed Chromium exited with `socket() failed: Operation not permitted`. No browser pass rate is claimed.
- Full browser suite: requires execution in Windows Kiro or GitHub Actions. Screenshots/traces/JSON/HTML are produced by Playwright; they are not preapproved visual baselines.

## Static review findings to validate in browser

These are suspected product defects identified while writing tests, not confirmed browser results:

- New meal/grocery/trainer keys are absent from the cloud-sync allowlist.
- Trainer finish does not guard against repeat completion.
- Meal removal indexes use a sliced list index rather than the original index after eight entries.
- Planner/grocery entries interpolate user text into HTML.
- Several profile inputs lack associated `for` labels; exercise modal lacks dialog semantics/Escape behavior.
- Food quantity and profile boundaries need runtime validation checks.
- Selected-tab sections may remain inside a hidden ancestor; tests assert actual visibility without force-clicks.

Assertions intentionally remain strict. Do not mark them skipped to obtain a green report. Record an app defect for a reproducible failure and fix the app before release.

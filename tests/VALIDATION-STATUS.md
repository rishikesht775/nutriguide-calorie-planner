# Current stability release validation — 10 November 2026

## Completed

- Node contracts exercise actual state/barcode route exports, actual SQL migration with SQLite, cloud-client sync behavior, meal planning and backup validation. See `test-reports/contracts-latest.txt` for the exact run count/status.
- JS syntax checks for all new client modules and inline scripts.
- TypeScript application and Playwright checks.
- Playwright test collection: 202 executions in 28 spec files before any later additions.
- Browser preview: secure sign-in layout and successful script initialization inspected. No password is collected; no app login was bypassed for QA.

## Verification boundaries

- Authenticated full-browser flows were not executed here. The cloud preview is at the sign-in gate, and direct Playwright Chromium launch was previously blocked by workspace socket permissions. Run the release suite in Kiro or GitHub Actions.
- The local HTTP backend attempt using the managed preview URL could not reach that URL from the test runner; report startup failure is retained, not classified as an app assertion failure.
- Barcode provider behavior is tested with mocked upstream responses; a real package lookup depends on provider/network availability. Camera and speech permissions require physical browser/device testing.
- The production identity provider, actual multi-device D1 data, wearable providers and AI services were not certified by local SQLite or mocked tests.

## Defects repaired

Hidden tab ancestry, duplicate trainer completion, mismatched session block durations, unsafe HTML rendering in user-text paths, quantity/profile validation, grocery removal indexing, missing cloud keys, overlapping saves, successful-save acknowledgments, missing accessible labels/dialog focus, and private-response caching.

Existing tests remain strict. Do not skip failures to obtain a green report. Further browser findings should be reproduced and fixed before asserting full stability.

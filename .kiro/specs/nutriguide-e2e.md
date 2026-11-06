# NutriGuide E2E test environment

## Goal
Provide a repeatable local development and browser-test environment for the NutriGuide Site.

## Definition of done
- A developer can install dependencies with `npm install`.
- A developer can start the app with `npm run dev`.
- Playwright can run against the local app or any URL set in `PLAYWRIGHT_BASE_URL`.
- Tests cover profile unlock, story modes, nutrition lookup, exercise interaction, and mobile layout.
- Reports and failure artifacts are written to Playwright's standard output folders.

# NutriGuide project guidance

## Product
NutriGuide is a public, mobile-friendly calorie, food, exercise, journey, and weekly-report planner.

## App structure
- `public/legacy.html` contains the compatibility UI shell; new modules live under `public/app/`.
- `public/cloud-sync.js` syncs signed-in state through the app API.
- `app/api/me/route.ts` and `app/api/state/route.ts` provide account and state APIs.
- `.openai/hosting.json` identifies the hosted Site; preserve its project ID.

## Working rules
- Keep tab content isolated: Home, Food studio, Exercise, Journey, and Plan & reports should only show their own content.
- Keep interactions explicit. A card should not create a log entry unless its action button is clicked.
- Preserve mobile behavior and keyboard accessible buttons.
- Use original mascot artwork and avoid copying copyrighted characters.

## Current module boundaries
- `storage.js`: safe persistence and escaping.
- `meal-engine.js`: pure deterministic planning and household groceries (not generative AI).
- `wellness.js` / `wellness.css`: new tab-specific feature UI.
- `backup.js`: validates account-data restore.
- `/api/foods/barcode`: authenticated Open Food Facts proxy with fixed upstream and timeout.
- See `docs/COMPETITOR-AND-ARCHITECTURE-REVIEW.md` for delivered features and remaining provider/architecture limits.

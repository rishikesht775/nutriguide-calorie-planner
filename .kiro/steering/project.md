# NutriGuide project guidance

## Product
NutriGuide is a public, mobile-friendly calorie, food, exercise, journey, and weekly-report planner.

## App structure
- `public/legacy.html` contains the user-facing planner UI and interaction logic.
- `public/cloud-sync.js` syncs signed-in state through the app API.
- `app/api/me/route.ts` and `app/api/state/route.ts` provide account and state APIs.
- `.openai/hosting.json` identifies the hosted Site; preserve its project ID.

## Working rules
- Keep tab content isolated: Home, Food studio, Exercise, Journey, and Plan & reports should only show their own content.
- Keep interactions explicit. A card should not create a log entry unless its action button is clicked.
- Preserve mobile behavior and keyboard accessible buttons.
- Use original mascot artwork and avoid copying copyrighted characters.

# NutriGuide product and architecture review — 10 November 2026

This is a dated earlier review. For the current architecture and account implementation, use `APPLICATION.md`; Supabase email accounts and Brevo SMTP were added after the provider-only account description below.

## Basis and limits

Compared public product documentation from MyFitnessPal, Lifesum, HealthifyMe and Nike Training Club. Their private source, database schemas, performance and security controls are not public, so this is feature/workflow comparison and an assessment of NutriGuide's own architecture, not a claim that their internal implementations were inspected.

| Product | Public feature pattern | NutriGuide implementation in this release |
| --- | --- | --- |
| MyFitnessPal | Fast logging; plan-to-diary flow; preference-based meals and groceries | Packaged food lookup, browser voice entry, portions, favorites, repeat yesterday, daily plan logging, automatic ingredient list |
| Lifesum | Habit trackers; shortcuts; plans; recipes; weekly feedback | Recovery/body check-in, habit rhythm, lessons, recipe calculator, meal swaps and seven-day planner |
| HealthifyMe | Indian food focus; personalized suggestions; photo/AI coaching | Indian recipe estimates, diet/budget/protein preferences, pantry matches, rule-based guidance; photo journal only (not food recognition) |
| Nike Training Club | Home/gym choices; progressive guidance; program tracking | Trainer goals/settings; timer blocks match selected session duration; pause/resume; form guides; idempotent history and actual active seconds |

Sources:
- https://support.myfitnesspal.com/hc/en-us/articles/34603055097869-How-to-use-the-Meal-Planner
- https://support.myfitnesspal.com/hc/en-us/articles/34889191368077-The-difference-between-Free-Premium-and-Premium
- https://lifesum.com/features/
- https://www.healthifyme.com/smart/features.html
- https://www.nike.com/ntc-app

## Architecture as implemented

| Layer | Implementation | Stability work |
| --- | --- | --- |
| UI shell | Existing HTML app with current desktop sidebar/mobile bottom navigation | Extract tab sections from hidden Home ancestor; consistent SVG navigation icons; responsive cards/banners; readable colors; focus visibility; reduced-motion support |
| Shared client boundary | `public/app/storage.js` | Typed JSON fallback; HTML escaping; quota error messaging; shared local-date helper |
| Compatibility repair | `public/app/stability.js` | Visible tab isolation; input labels; modal semantics/focus/Escape; safe legacy rendering |
| Domain planning | `public/app/meal-engine.js` | Pure deterministic meal selection; 7-day dates; preference filtering; calorie-scaled portions; household ingredient aggregation |
| New feature UI | `public/app/wellness.js`, `wellness.css` | Existing-tab feature modules; no new navigation clutter; logging/recovery/pantry/recipe/guide/export flows |
| Backup boundary | `public/app/backup.js` | Allowlist; version and row-shape validation before import; no auth/sync metadata in exported backups |
| Device-only photo store | IndexedDB | Blob storage rather than huge localStorage strings; image MIME/size/count limits; per-account display; user delete; photos not cloud-synced or AI-analyzed |
| Cloud sync | `public/cloud-sync.js` | Explicit wellness-key allowlist; per-account pending snapshots; one POST at a time; ack only after success; retry/network recovery; merge changes made during hydration; visible status |
| Auth | Platform account service via existing trusted hosting integration | Removes unused password collection and misleading Google label; app data remains behind the gate; routes independently verify account identity |
| API | `/api/me`, `/api/state`, `/api/foods/barcode` | No-cache private state; controlled error responses; account-owned prepared statements; barcode validation/fixed provider origin/timeout/validated nutrition |
| Database | Existing D1 `user_state` table | Existing compatible schema retained; route/migration contract tests use actual SQLite; no destructive migration |
| Validation/CI | Node contracts + Playwright suites + GitHub Actions | TXT/JSON/HTML evidence, timestamps, meaningful strict tests and current UI selectors |

## Features and delivery boundaries

Working without an external AI subscription: deterministic meal suggestions, vegetarian/vegan/Jain recipe filtering, budget estimates, protein focus, seven-day plan, household shopping quantities, favorites, repeat-yesterday logs, portion lookup, recipe nutrition, pantry matches, healthy swaps, recovery logs, optional eating-window timer, daily lessons, habit rhythm, rule-based guide, CSV export, print/save-to-PDF, JSON backup/restore.

Barcode nutrition uses Open Food Facts on the server. Its database is user contributed: verify package labels; missing/invalid records produce manual-entry fallback. Attribution and licensing are visible. Camera recognition depends on `BarcodeDetector` and permissions. Voice uses browser speech support and may process speech through the browser vendor. Unsupported browsers keep manual entry.

Deferred because they require separate infrastructure or authorization:
- AI food recognition and a real generative AI coach: require model provider credentials, consent for image transfer, evaluated responses, cost/rate controls, and a secure server integration.
- Apple Health, Health Connect/Google Fit, Samsung Health, Fitbit and Garmin: require provider-specific authorization, approved APIs or native companion apps. No fake Connected buttons are shown.
- Human coaching and community: require operational staffing, moderation, privacy and booking/payment workflows.
- Shared plan download is available; real multi-user family accounts and permissions are not implemented.
- PDF export uses the browser's Print → Save as PDF dialog; no claim of a server-rendered PDF service.

## Remaining engineering limits

- Existing legacy inline scripts remain a compatibility layer. Further migration should separate profile/food/trainer domains behind stable interfaces, then migrate views incrementally with regression coverage.
- D1 stores one JSON document per user. It is suitable for the current scale but does not give conflict-free simultaneous multi-device edits. New client prevents same-device save races; separate-device writes remain last-write-wins. Next schema version should add revisions and explicit conflict resolution, then normalized dated events and server-side reporting.
- Local pending snapshots and photos are not encrypted against another person using the same browser profile. Do not treat a shared OS account as private storage. Backups contain wellness data and should be kept private.
- Nutrition and recipe prices are estimates. Budget is a soft guide; serving scaling may exceed it and UI warns. No medical/Jain certification or allergy safety guarantee is implied.
- Full wearable, real-provider AI and cross-device identity validation remain separate release work. This release does not claim parity with every subscription feature of every competitor.

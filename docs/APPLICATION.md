# NutriGuide Application Architecture and Requirements

Version 1.0 | Reviewed 10 November 2026 | Owner Rishikesh Tiwari

## 1 Purpose and application status

NutriGuide is a browser-based nutrition, movement and wellness planner. This document is the maintained reference for its implemented requirements, architecture, data flows, integrations, operational limits and acceptance criteria. It supports development in Kiro, release review, onboarding and regression testing.

The current application combines a legacy HTML interface with modular JavaScript and a server-backed Vinext application hosted through Sites on Cloudflare Workers. Supabase manages independent email accounts. Brevo delivers authentication emails. Cloudflare D1 stores wellness state. Supabase is not the wellness database in the current implementation.

Email registration is enabled and the owner reported receiving a real signup email. The confirmation panel was then improved to show Check your email prominently. Complete confirmation, password reset, separate-account isolation and simultaneous cross-device behavior still require live acceptance testing. Source-level implementation and a passing mocked test are not proof of those external flows.

The current product is a general wellness tool. Its calorie estimates, food data, budget estimates and exercise suggestions are not a diagnosis, prescription or medically validated care plan. The guide is rule-based; it is not a generative AI model or a human trainer.

### Status definitions

| Status | Meaning |
| --- | --- |
| Implemented | A corresponding code path and user interaction exist. Runtime acceptance can still be pending. |
| Conditional | Available only with browser support, permission, provider availability or configured runtime settings. |
| Limited | A useful subset exists, with an explicit boundary described here. |
| Planned | Requested or recommended, but no complete supported implementation exists. |
| Verified | A stated check ran with evidence. Verification is qualified by layer and environment. |

### Reference locations

| Item | Location |
| --- | --- |
| Public application | https://nutriguide-calorie-planner.rishikesht775.chatgpt.site/legacy |
| GitHub repository | https://github.com/rishikesht775/nutriguide-calorie-planner |
| Main branch | main |
| Maintained document | docs/APPLICATION.md |
| Generated source inventory | docs/GENERATED-INVENTORY.md |
| Current validation summary | docs/ACCOUNT-VALIDATION.txt |
| Detailed local test output | test-reports/contracts-latest.txt and test-reports/playwright-latest.txt |
| Windows setup | README-KIRO.md |

The generated inventory records exact source fingerprints and current file counts. Product status is reviewed narrative rather than inferred from filenames. Old screenshots and older Word exports are historical snapshots.

## 2 Users and end to end journeys

A visitor may register with email and password or continue with the existing connected-account option. The app does not implement an administrator portal, paid subscriptions, staff roles, a coach marketplace or household member permissions. Provider dashboards are operational tools for the owner, not app features for customers.

### Registration and sign in

A user chooses Create account, enters a name, email and matching password, and submits once. The server calls Supabase signup. An accepted response replaces the form with Check your email, confirmation instructions and buttons to continue to sign in or change the email. Duplicate-address handling intentionally uses a generic response rather than revealing account existence. Changing UI modes does not itself send another email.

The user opens the email confirmation link in the same browser used for signup. A successful PKCE callback exchanges the one-time code for the provider session, selects the email identity and returns to the app. Missing or expired links return a controlled error notice. If automatic sign-in cannot complete, the user can sign in after confirming the email. Never ask a user to share passwords, reset links, SMTP keys or confirmation codes in chat.

### First profile and personalization

After authentication, the user enters age, sex, height, weight, activity and goal. A valid profile creates shared estimated calories, protein and BMI. Home, Food Studio, Exercise, Journey and Plan and reports receive the same context. Suggestions are not converted into completed food or activity records automatically.

A user may override shared calorie or protein targets. Submitting Home Calculate my plan explicitly returns protein to the profile estimate, including an existing 125 g override; users may customize it again afterward. A custom meal plan and custom workout settings are kept when the profile changes. Explicit reset actions restore automatic defaults while retaining actual logs. Active training is not rewritten by a profile edit.

### Daily usage

The user checks remaining calories and protein, logs foods and servings, records water or steps, follows a workout if appropriate and completes a recovery check-in. The guide proposes a next action based on actual records and the current tab. Dated logs support weekly rhythm and review. Meal plans may be copied into today's diary only after an explicit action.

### Recovery and reporting

The user records sleep, mood, stress and optional measurements, reviews progress and prepares reminders. Available exports include CSV, text shopping and family-plan files, JSON backup and browser print or Save as PDF. These are user-controlled downloads; they are not automatic clinical reports or scheduled email summaries.

## 3 System architecture

![NutriGuide system architecture](assets/architecture.dot)

### Components and responsibilities

| Layer | Component | Responsibility |
| --- | --- | --- |
| Entry and views | public/legacy.html | Authentication shell, five main tabs, profile, original food and exercise UI, trainer and compatibility scripts |
| Styling | public/app/wellness.css and inline CSS | Responsive wellness theme, cards, navigation, form states and confirmation panel |
| Shared client helpers | public/app/storage.js | JSON fallback, escaping, storage errors, local calendar dates and change events |
| Planning policy | personal-plan-engine.js and meal-engine.js | Pure profile estimates, override policy, deterministic recipe selection and ingredient aggregation |
| View controllers | wellness.js and personal-plan.js | Logging, weekly plans, recovery, guide, defaults, exports and browser capabilities |
| Compatibility layer | stability.js | Tab isolation, labels, modal focus behavior and safe legacy rendering |
| Account UI | account-gate.js and account-reset.js | Session/configuration checks, actual email API calls, confirmation and password reset forms |
| Sync client | public/cloud-sync.js | Per-account local snapshots, hydration, save queue and visible sync status |
| Server routes | app/api and app/account | Identity, provider calls, state persistence, barcode lookup and fixed callbacks |
| Runtime | worker/index.ts and vite.config.ts | Vinext request handler, request-scoped connector boundary and Cloudflare build integration |
| Durable wellness storage | Cloudflare D1 user_state | One JSON state document per authenticated user |
| Account service | Supabase Auth | Signup, email verification, credential validation, sessions, reset and logout |
| Email delivery | Brevo SMTP | Verification and recovery email transport configured in Supabase |
| Local media | IndexedDB nutriguide-photos | Device-only meal photo blobs and notes |

### Trust and data boundaries

The browser sends same-origin JSON requests to the NutriGuide server. The server verifies identity before reading or writing D1. A visitor cannot choose a different user's database key in the state API. The email identity is validated with Supabase getUser rather than trusting a cookie payload. Connected-account identity uses the hosting platform's trusted request headers. Header trust depends on the deployed ingress; it must be tested there rather than assumed from local mocks.

Supabase sends account emails through Brevo. NutriGuide does not need a Supabase service-role key for normal login. The publishable key and runtime settings are held in hosting configuration. SMTP credentials are held in Supabase; they must not be committed to source, exported in backups or returned by the app API.

Open Food Facts receives a package barcode from the server and returns label nutrition. Optional voice recognition uses the browser's speech implementation and may process audio online through the browser vendor. Meal photos remain local and are not sent to an image-recognition service.

### Runtime and deployment

The repository uses React and Next-compatible route conventions through Vinext and Vite. The visible application remains the legacy HTML shell, not a completed React component migration. The root page redirects into the application. The Worker entry delegates requests through the request-scoped connector context to Vinext.

Sites manages production runtime variables, source versions, the deployed Worker and its D1 binding. The hosting manifest identifies the existing project and DB binding. R2 is not configured for current media uploads. A local build outputs dist/server; deployment requires a saved version from the matching pushed source. GitHub is the collaboration and Kiro synchronization repository; it is distinct from the Site's managed source endpoint.

Local portable preview can supply development-only mocked identity through the Sites Vite plugin. That is a local testing facility, not production identity or evidence of real login. Playwright's fixtures also stub identity for UI testing. Email auth in a local environment needs its own permitted origin and Worker runtime values.

## 4 Functional requirements catalogue

The requirements below describe current behavior and user-requested scope. Implemented does not mean every browser or provider path has completed live acceptance testing. File names are relative to the repository.

### Accounts and profile

| ID | Requirement | Status and acceptance |
| --- | --- | --- |
| ACC01 | Independent email registration | Implemented. Valid name, email and matching 12 to 128 character passwords invoke Supabase signup. |
| ACC02 | Visible registration result | Implemented. Accepted signup hides the form, focuses and scrolls to Check your email. Failure keeps the form visible. |
| ACC03 | Verified sign in | Implemented. Unconfirmed or invalid credentials cannot access authenticated state. Live full-flow acceptance pending. |
| ACC04 | Password recovery | Implemented. Generic reset response, fixed recovery callback and password update route; live delivery and old-password rejection pending. |
| ACC05 | Logout | Implemented. Email logout ends the local provider session; password updates request global provider sign-out. |
| ACC06 | Connected account option | Implemented. A top-level link preserves platform sign-in and sign-out. Customer wording uses NutriGuide. |
| ACC07 | Identity separation | Implemented. Native IDs include provider project and user ID. Matching emails do not automatically link old connected profiles. |
| PRO01 | Validate a profile | Implemented. Age 14 to 90, height 80 to 250 cm, weight 20 to 350 kg, supported activity, sex and goal. |
| PRO02 | Shared targets in all tabs | Implemented. Profile estimates and shared manual targets drive each module. |
| PRO03 | Preserve deliberate choices | Implemented. Manual meal/workout settings survive profile changes; reset actions are explicit. |

### Home and food

| ID | Requirement | Status and acceptance |
| --- | --- | --- |
| HOM01 | Today summary | Implemented. Remaining calories, protein, manually logged steps and five-part habit rhythm. |
| HOM02 | Weekly activity strip | Implemented. Dated food, workout and recovery records determine displayed activity. |
| HOM03 | Daily habit lesson | Implemented. Curated rotating lessons and completion records; not generated AI lessons. |
| FOD01 | Food catalogue and lookup | Implemented. Curated Indian food estimates and categories, serving quantities, manual custom values. Not a complete regional reference database. |
| FOD02 | Macro and protein logging | Implemented. Calories, protein, carbs, fat and fibre in food logs plus a separate protein shortcut. Users must avoid logging the same protein twice. |
| FOD03 | Packaged food barcode | Conditional. Authenticated server lookup through Open Food Facts; product errors retain manual entry. |
| FOD04 | Camera barcode detection | Conditional. Requires BarcodeDetector, getUserMedia and permission. Unsupported browsers retain typed barcode lookup. |
| FOD05 | Voice food entry | Conditional. Browser speech fills food and grams for review; it does not silently save recognized food. |
| FOD06 | Meal photo journal | Limited. Device-only images and notes. No recognition, calorie estimation or cloud image backup. |
| FOD07 | Favorites | Implemented. Save a logged food, log again or delete. Up to 50 retained favorite entries. |
| FOD08 | Repeat yesterday | Implemented. Copies dated prior-day food entries only after user confirmation; empty history has a controlled response. |
| FOD09 | Personalized meal suggestions | Limited. Deterministic curated recipes respond to calories, protein, preference and budget. Not a generative AI service. |
| FOD10 | Seven day planner | Implemented. Four meal slots per day, portions, calories, protein, cost estimates and recipe explanations. |
| FOD11 | Diet preferences | Implemented for vegetarian, vegan and Jain recipe tags. No allergy-safety or medical-diet certification. |
| FOD12 | Grocery list | Implemented. Aggregates recipe ingredients by grams and household portions; manual groceries remain available. |
| FOD13 | Pantry suggestions | Limited. Ingredient name matches against curated recipes; not stock depletion or expiry tracking. |
| FOD14 | Recipe nutrition calculator | Implemented. Known ingredients and grams, per-serving totals, clear/remove and diary logging. |
| FOD15 | Healthy swaps | Implemented as curated suggestions and recipe swaps. Nutrients and suitability vary by product and user. |
| FOD16 | Remaining target suggestions | Limited. Rule guide uses remaining calories/protein; no clinically reviewed adaptive meal replacement service. |
| FOD17 | Family plan sharing | Limited. Household quantities and text export; no shared accounts, invitations or access roles. |

### Movement and trainer

| ID | Requirement | Status and acceptance |
| --- | --- | --- |
| MOV01 | Exercise guidance cards | Implemented. View exercise details, instructions and checklist/timer interactions. |
| MOV02 | Trainer settings | Implemented. Balanced, strength, cardio or mobility; home/gym; 10, 20 or 30 minute proposals. |
| MOV03 | Active session lifecycle | Implemented. Start, pause/resume, next movement and finish; completed history should be idempotent. |
| MOV04 | Actual duration tracking | Implemented. Active elapsed seconds recorded separately from planned session minutes. |
| MOV05 | Readiness and effort | Implemented. Low-energy/soreness or prior hard effort can soften an automatic recommendation; manual settings are retained. |
| MOV06 | Live guide cues | Conditional. Movement/rest cues and optional browser speech synthesis; no camera form correction. |
| MOV07 | Walking and mobility | Limited. Walking/mobility recommendations and manual logs; not automatic activity recognition or a full reviewed yoga curriculum. |
| MOV08 | Trainer across the journey | Implemented rule-based companion in all five tabs with next actions tied to current context. |

### Recovery and reports

| ID | Requirement | Status and acceptance |
| --- | --- | --- |
| REC01 | Water and steps | Implemented manual counters/logs. Not smartwatch measurements; thresholds are habit heuristics. |
| REC02 | Weight history | Implemented bounded local history. Not an adaptive weight-trend calorie engine. |
| REC03 | Sleep and measurements | Implemented daily sleep, mood, stress, optional waist, chest and arm records with input limits. |
| REC04 | Fasting timer | Limited. Start/stop and elapsed/last duration only; no clinical fasting prescription. |
| JRN01 | Journal and mood | Implemented. User entries, mood selection and selectable story modes. |
| JRN02 | Journey progression | Implemented. Learn, repeat, consistency and review stages with real daily completion indicators. |
| REP01 | Reports and review | Implemented summaries, explicit review acknowledgement and current target context. |
| REP02 | Reminders | Limited. Manual reminders, browser notifications when permitted and calendar-file download. No server push scheduler. |
| REP03 | Progress export | Implemented CSV, report text, shopping/plan text and browser print. PDF uses the browser's Save as PDF. |
| REP04 | Backup and restore | Implemented allowlisted versioned JSON with size/shape checks and explicit replacement confirmation. Photos and credentials excluded. |
| SYN01 | Account cloud sync | Implemented queued JSON state sync and account-specific pending snapshots. Actual multi-device acceptance remains pending. |

## 5 Calculation and planning rules

The shared profile policy is in personal-plan-engine.js. It calculates a Mifflin-St Jeor style baseline as 10 times weight in kg plus 6.25 times height in cm minus 5 times age, then adds 5 for male or subtracts 161 for female. Activity multipliers are 1.2, 1.375, 1.55 and 1.725. Loss applies minus 450 kcal; gain applies plus 300; maintenance applies no adjustment. The result rounds to the nearest 10 kcal, with minimum estimates of 1500 for male and 1200 for female.

Estimated protein is weight multiplied by 1.6 for gain or 1.4 otherwise, rounded to a whole gram. BMI is weight divided by squared height in metres, rounded to one decimal. These exact implemented rules should be reviewed before any medical positioning or pediatric use; the input range includes ages below 18 and does not establish clinical suitability.

Shared manual calorie targets accept 1200 to 5000 kcal and protein accepts 20 to 300 g. Recipe planning scales to 1200 to 3500 kcal. Above that meal-planning range, the interface should disclose a gap rather than claim a complete target match. Budget is a soft estimate, not a guaranteed quote or shopping cost.

The weekly plan uses Breakfast, Lunch, Snack and Dinner pools filtered by dietary tags. Calorie and protein goals influence deterministic recipe/portion selection. Ingredient quantities aggregate across plan days and multiply by household portions. The UI accepts budget 80 to 1000 rupees per person and 1 to 10 household portions. Infeasible protein targets show an explicit shortfall. Suggested meals are kept separate from actual consumed-food logs.

The daily habit rhythm counts five booleans: food logged, protein target reached, at least 5000 manually logged steps, at least 8 water glasses and at least 7 hours sleep. This is a product habit heuristic, not a health-risk score. Current implementation keeps both nutrition entries and separate protein items, so duplicate user recording can inflate totals. Further log unification is a known design improvement.

## 6 Authentication and session architecture

### Native email identity

The account server creates a fresh Supabase SSR client per request. Its cookie adapter sets HttpOnly, Secure on HTTPS, SameSite Lax and path slash. Server getUser validates the account and requires an email-confirmed user. The app does not authorize based on editable user metadata; the name is a display value only.

The selector cookie ng-account-source records email or connected mode. A detected Supabase session cookie can retain native identity selection if the selector expires. Logout deliberately avoids silently falling back into an unrelated connected account. Cross-project native user IDs are namespaced to avoid collision with platform IDs.

Account POST routes require the configured Origin and JSON content type. Requests are capped at 8192 bytes; invalid objects and credentials receive controlled responses. Signup and recovery avoid disclosing whether a given email already exists. Provider rate errors return 429. Other errors omit provider internals and credentials.

### Connected identity and reserved routes

The platform owns /signin-with-chatgpt, /signout-with-chatgpt and /callback. NutriGuide must not override them. /account/connected selects connected mode and redirects to the reserved platform flow with a fixed return path. The app's /account/callback is separate and handles Supabase PKCE codes. Labels in the customer application use NutriGuide wording, while an external provider controls its own screens.

### Operational configuration

| Setting | Purpose | Handling |
| --- | --- | --- |
| NUTRIGUIDE_EMAIL_AUTH_ENABLED | Feature switch for native accounts | Runtime value; keep disabled when the provider is not ready |
| SUPABASE_URL | Supabase project origin | HTTPS project endpoint, no paths or credentials |
| SUPABASE_PUBLISHABLE_KEY | Public-client compatible provider key | Hosting configuration; never substitute a service-role key |
| AUTH_SITE_URL | Exact permitted app origin | Must match mutation Origin and callback configuration |
| Supabase SMTP password | Brevo SMTP credential | Stored in Supabase only; never in repository or backups |
| DB | Cloudflare D1 binding | Required for durable account-owned wellness state |

The hosted deployment has native accounts enabled and Brevo SMTP configured. The sender is a verified freemail account, with provider-managed sender rewriting rather than an owned authenticated domain. This is a temporary delivery arrangement. Registration email receipt was reported by the owner; inbox placement, other recipients, password reset and production provider approval must still be checked. The app remains on its existing hosted subdomain; no purchased custom domain has been configured.

## 7 API contracts

All examples describe response shape, not a promise that every provider is available. See route source for exact current text. Do not include live credentials in test payloads or reports.

| Method and path | Contract | Main failure behavior |
| --- | --- | --- |
| GET /api/me | authenticated, user or null, provider mode, sign-in/out URLs | Anonymous response is valid; identity lookup failure must not expose app data |
| GET /api/account/config | emailPasswordEnabled boolean | Never returns the provider key |
| GET /api/account/session | Verified native account summary | Anonymous/native unavailable returns no authenticated user |
| POST /api/account/sign-up | name, email, password, confirmPassword; accepted generic message with 202 | 400 validation/provider rejection; 403 origin; 413 body; 415 media; 429 limit; 503 unavailable |
| POST /api/account/sign-in | email and password; signedIn true | 401 invalid/unconfirmed; 429 or 503 provider issues |
| POST /api/account/request-reset | email; generic account-existence message | 429 limit; 503 delivery issue |
| POST /api/account/update-password | password and confirmPassword; verified native session | 401 no session; 400 validation/provider; sign-out failure can return 503 after password update |
| POST /api/account/logout | JSON object; local session sign-out | 503 if sign-out cannot be completed |
| GET /account/callback | One-time code, optional recovery intent | Fixed app redirect or controlled link-error route; never arbitrary next URL |
| GET /account/connected | Select platform identity | Fixed top-level provider return path |
| GET /api/state | Current user's state object | 401 anonymous; 503 DB or corrupt stored state |
| POST /api/state | Object containing state; saved and updatedAt | 401 anonymous; 400 malformed; 413 size; 503 storage unavailable |
| GET /api/foods/barcode | 8 to 14 digits; normalized per-100-g nutrition and attribution | 401 anonymous; 400 barcode; 404 incomplete/missing; 502 provider HTTP; 503 network |

The barcode server uses a fixed Open Food Facts origin and a seven-second timeout. It bounds product names and rejects invalid or absent calorie labels. Missing noncalorie nutrients may normalize to zero; users must verify package labels. It does not imply the product record is complete or clinically accurate.

The state API limits streamed request bytes to 1048576 and serialized state to 250000 characters. It uses prepared user-owned SELECT and UPSERT statements. Unlike the account POST handler, the state POST handler currently does not explicitly check Origin or content type. Its browser/session ingress boundary needs a specific CSRF and forged-header acceptance check; do not describe it as fully security-certified.

## 8 Database and client storage

### D1 schema

| Column | Type and rule | Meaning |
| --- | --- | --- |
| user_id | TEXT primary key not null | Verified account identity and ownership key |
| email | TEXT nullable | Display/contact metadata from identity |
| full_name | TEXT nullable | Display name metadata |
| state_json | TEXT not null default empty object | Serialized wellness document |
| created_at | TEXT not null | Initial ISO timestamp preserved on upsert |
| updated_at | TEXT not null | Last successful write timestamp |

An index exists on updated_at. Migration SQL is in drizzle. db/schema.ts is only a placeholder; it is not the complete schema authority. The state route creates no separate tables for food, workouts, habits or reminders. There is no server-side normalized event history, revision token or multi-device conflict merger.

### State groups

| Group | Main keys | Persistence |
| --- | --- | --- |
| Profile and defaults | profile, selectedGuide, proteinTarget, ngPersonalSettings, ngPlanContext | Local JSON and sync allowlist |
| Food and protein | nutritionLog, proteinItems, foodLogs, ngFavouriteMeals | Local JSON and sync allowlist |
| Planning | ngWeeklyPlans, ngPlanSettings, ngPreferences, ngAutoGroceries, grocery, ngRecipeDraft, ngPantry | Local JSON and sync allowlist; some legacy keys retained |
| Training | ngTrainerHistory, exerciseLogs | Local JSON and sync allowlist; active timer is runtime state |
| Recovery | water, steps, weights, ngMeasurements, ngHabits, ngFasting, ngDailyStats, ngLogDate | Local JSON and sync allowlist |
| Journey and reporting | journal, reminders, journeyStep, journeyMode, ngLessonState, ngCoachHistory | Local JSON and sync allowlist |
| Photos | IndexedDB photos with owner, date, blob and note | Device only; not D1, not JSON backup |
| Account/session | Provider HttpOnly cookies and mode selector | Not wellness JSON or exported backup |
| Sync metadata | Account owner and pending/acknowledged snapshots | Local operational metadata; excluded from user backups |

The sync and backup allowlists are not identical. Sync retains some legacy ngRecipes and ngMealArchive keys that the current backup export does not include. Treat the relevant explicit allowlist as authoritative; review both when adding persistent fields.

Cloud sync allows one active POST from a client, acknowledges only the successfully sent snapshot and queues later changes. Hydration preserves edits made while a cloud read was in flight. Account-specific pending snapshots reduce accidental cross-account display. A successful cloud acknowledgement differs from a local write. Offline changes remain on the device until reconciliation succeeds.

Independent devices still use last-write-wins JSON documents. Concurrent edits can overwrite each other. Photos and pending wellness state are not encrypted against another person using the same browser/OS profile. Server-side access control does not make shared-device local storage private.

## 9 Interface and accessibility requirements

The visual direction is a calm wellness theme with light surfaces, green/teal actions, readable dark text and rounded cards. Desktop and mobile navigation expose the same five areas. The old festive runtime assets must not reappear. Legacy source remnants are not evidence that the festive experience is active.

No banner should crop essential wording or cover navigation, login controls or account status. Tab switches must expose their own content and hide unrelated tab sections. Input labels must remain programmatically associated. Buttons must have meaningful names and visible focus. Dialogs must support close and Escape with a usable focus path. Reduced-motion preferences must be respected where effects are present.

Registration success is an explicit view state. The original form is hidden, Check your email is focused and scrolled into view, next steps are readable and the user can return to sign in. A failed provider response must not show that success state. Password fields are cleared on accepted submission. The same feedback pattern is used for recovery requests while preserving generic account-existence wording.

Physical Android and iPhone checks, screen readers, 200 percent zoom and slow network testing remain required acceptance activities. The automated suite is not a full WCAG conformance audit. No approved pixel baseline or general accessibility certification is claimed.

## 10 Validation and edge cases

| Area | Current boundary | Expected behavior |
| --- | --- | --- |
| Profile | Age, height, weight, activity and goals | Reject out-of-range values without inventing a plan |
| Account request | 8192 bytes; JSON object | Reject oversized, malformed, cross-origin or wrong-media input |
| Password | 12 to 128 for signup/update | Require matching confirmation; never persist browser credentials |
| State request | 1 MiB streamed bytes and 250000 serialized characters | Reject over-limit input even with misleading Content-Length |
| Photo | JPEG, PNG or WebP; at most 5 MiB per file; 20 stored records | Reject invalid type/oversize; handle quota/storage failure; current global store count can limit another account on same device |
| Recipe ingredient | Positive amount up to 5000 g | Known ingredient lookup required; no invented nutrient result |
| Recipe servings | Integer 1 to 20 | Per-serving nutrition scales consistently |
| Recovery | Sleep 0 to 24 h; waist/chest 30 to 250 cm; arm 10 to 100 cm when supplied | Validate displayed inputs and retain explicit zero sleep |
| Favorites | Last 50 saved entries | No silent duplicate name creation from same favorite action |
| Trainer finish | Completion guard and active seconds | Finish twice must not duplicate the same history entry |
| Daily rollover | Local date boundary | Archive daily counters appropriately; do not label old food as newly eaten |
| Import | Version 1, allowlisted keys, valid shapes, under 250 KB with confirmation | Reject before replacement when invalid; never import auth metadata |
| CSV | Formula-leading cell protection and quote escaping | User text must not become a spreadsheet formula |
| Network | Provider timeout or failed state save | Show a controlled error or pending status; keep manual and retry paths |

## 11 Test strategy and release evidence

Node contract tests execute route code, planning modules and controllers with explicit stubs at external boundaries. SQLite tests use an in-memory database and the real route SQL. They cover ownership, upsert, corruption, bounded streams and provider failure cases. UI state adapters check controller behavior but do not measure rendered layout.

The latest recorded contract run passed 166 checks. TypeScript, JavaScript syntax and production build checks passed for the confirmation release. Playwright discovery previously reported 228 desktop/mobile executions in 29 spec files. Re-run discovery for current counts; the generated inventory avoids treating counts as test results.

The Playwright suite uses Desktop Chrome and Pixel 7 emulation. It covers smoke, sanity, functional, integration, system, regression, UAT/E2E, frontend, UI, accessibility, security, performance, backend, database and edge cases. Categories overlap. Most signed-in UI tests use mocked identity/state; they do not log into real provider accounts.

| Coverage | Primary suite | Release interpretation |
| --- | --- | --- |
| Account and security | auth.spec.ts, security.spec.ts, email-account and account-gate contracts | Real route validation plus mocked provider/UI; live session acceptance separate |
| Profile and guide | personal-plan specs and contracts | Shared defaults, edits, resets, readiness and real-log progression |
| Trainer and exercise | trainer.spec.ts, exercise.spec.ts | Timer lifecycle, duration, controls and completion history |
| Food and planning | food, planner, wellness-features specs; meal-engine contracts | Servings, logs, weekly recipes, groceries and fallbacks |
| Storage and sync | cloud-sync, backend, database specs; state and backup contracts | Queues, retries, ownership, SQL and malformed/corrupt state |
| UI and accessibility | ui, mobile, frontend, accessibility specs | Bounds, tab visibility, labels, keyboard/dialog behavior; emulated devices |
| Performance | performance.spec.ts | Local response/interaction budgets; not load, stress or capacity certification |
| Complete journey | complete-flow, uat, system and journey specs | Cross-module behavior with controlled fixtures |

The signed-in Playwright release run remains unverified in this environment because Chromium installation/download attempts failed. Do not relabel discovery, a build or a UI screenshot as a passed full browser suite. Real signup email receipt is user-reported evidence; full confirmation and reset results remain pending.

### Required live acceptance checklist

Use disposable consenting test accounts and avoid production user health data. Register, receive mail, confirm in the requesting browser, sign in, refresh, sign out and reject an old session. Request and complete recovery, verify the new password and reject the old one. Test duplicate and unconfirmed addresses without enumeration. Use two accounts and two devices to verify state ownership and document any write conflict. Exercise denied camera/microphone permissions and an unsupported browser. Check narrow banners, keyboard navigation and physical-device layout. Verify quotas and provider delivery logs without exposing secrets.

### Commands and reports

Use npm.cmd on Windows to avoid PowerShell npm.ps1 execution-policy failures. In the actual checkout, run git pull --ff-only origin main, npm.cmd install and npm.cmd run test:install-browsers. Playwright starts a fresh local server at http://127.0.0.1:5187 and stops the server it launched. A local PLAYWRIGHT_BASE_URL override sets both the actual CLI port/bind address and the readiness URL. Existing servers are not silently reused. The launcher honors PORT for manual development and explicit CLI ports take precedence without duplicate defaults. Do not run multiple test commands concurrently against the same port.

Run npm.cmd run test:release for contracts plus all Playwright cases. Use the individual test scripts for separate categories. Normal runs generate latest and timestamped TXT reports under test-reports. Browser reports also include HTML, JSON and retained failure screenshots/traces/video. Reporter overrides or failures before configuration loads may only appear in terminal output. Secrets and sensitive wellness data should be removed before sharing evidence.

## 12 Known gaps and requested roadmap

| Requested capability | Current gap | Completion evidence needed |
| --- | --- | --- |
| Photo food recognition | Photo journal only | Provider integration, image consent, estimates, correction workflow and evaluated accuracy |
| Generative AI meal planner and coach | Deterministic rules only | Secure model endpoint, cost/rate controls, response evaluation and safe escalation |
| Wearable and health sync | None configured for Apple Health, Health Connect/Google Fit, Fitbit, Garmin or Samsung Health | Provider approval, OAuth/native permissions, revocation and reconciliation tests |
| Automatic movement tracking | Manual steps/activity only | Device/background permissions and real-device verification |
| Clinical or diabetic meal plans | No medically validated plans | Qualified review, approved requirements and clinical boundaries |
| Adaptive calorie targets | Profile changes and manual overrides, not weight-trend automation | Trend policy, safeguards, transparent proposals and validation |
| Smart missed-habit reminders | Manual and rule prompts, no background push service | Scheduler, permissions, delivery, time-zone handling and opt-out |
| Family collaboration | Household portions/text export only | Member identities, invitations, permissions and conflict handling |
| Human coach handoff | No staffed service | Coach operations, consent, booking and escalation process |
| Community | No moderated social feature | Moderation, reporting, abuse controls and privacy design |
| Milestones and badges | Basic rhythm/journey indicators | Explicit achievement policy and persisted award history |
| Full regional Indian food database | Curated estimates only | Provenance, serving standards, coverage and correction/version process |
| Hosted PDF service | Browser print only | Server renderer, export privacy and reproducible document tests |
| Conflict-safe multi-device sync | Last-write-wins JSON | Revisions, conflict resolution, merge policy and concurrent-client tests |
| Account data deletion/export portal | Backup export exists; no complete self-service account deletion workflow | Identity confirmation, session revocation and coordinated provider/D1/local retention policy |

Prioritize account acceptance, storage conflict protection and UI reliability before expanding provider-dependent features. Next separate legacy profile, food and trainer domains behind stable interfaces. Add features as reviewed vertical slices with visible failure handling rather than presenting unconfigured integrations as working buttons.

## 13 Security and operational requirements

The application must keep authorization on the server, restrict state operations to verified identity and keep credentials out of browser storage, logs and exported wellness data. Use fixed external API origins and callback destinations. Do not trust display names or editable provider metadata as access rules. Keep private responses out of shared caches.

Known limitations require follow-up rather than blanket assurance: the state API needs explicit CSRF/ingress acceptance review; the JSON state document is not a field-level schema validator; local data is not encrypted against shared-device access; dependency and provider configurations need periodic review; no complete retention/deletion workflow exists; no penetration test or formal compliance certification is recorded.

On a provider or SMTP outage, preserve useful error text and manual options. Account forms must not claim an email was sent after a failed server response. A generic accepted signup response must not claim the account is fully usable before email confirmation. Investigate provider logs with minimal personal data; never copy SMTP credentials, access tokens or private callback URLs into a support report.

For releases, validate the current source, keep the audience unchanged, publish the matching saved version, confirm runtime variables applied and record the public URL. Configuration-only changes belong in the hosting/provider configuration, not in Git. Roll back code by redeploying a known saved version only after reviewing compatibility with current runtime configuration and data.

## 14 Documentation maintenance and ownership

This Markdown document is the source of truth. The Word document is a generated snapshot from it and the current inventory. Update the narrative for changes to features, API contracts, calculations, storage, authentication, limits, UI states, external dependencies, tests or delivery status. Do not update only a timestamp.

The repository instruction file AGENTS.md requires future development work to update documentation in the same change. The docs:update command refreshes a source fingerprint manifest and generated route/module/test inventory after review. docs:check fails if application/test/configuration sources or maintained documentation have changed without regeneration. This detects stale fingerprints; it cannot understand whether the narrative is semantically correct. Human or agent review remains required.

The documentation CI workflow runs the freshness check, builds the Word export from Markdown and uploads it as an artifact. Every passing change therefore produces a current export without manually editing Word. A downloaded Word file does not update itself; fetch the new CI artifact or regenerate it. Export creation needs Python and python-docx; normal application usage and Playwright tests do not depend on Python.

### Required change workflow

1. Implement and review the change, including failure and edge behavior.
2. Update relevant sections of this document, specialist guides and the revision log.
3. Run npm.cmd run docs:update, then npm.cmd run docs:check.
4. Run appropriate tests and record actual results and known limits. Regenerate documentation if test/source changes affect inventory.
5. Commit documentation and code together. Push GitHub main or open a reviewed pull request; do not discard Kiro edits to force a pull.
6. Let CI generate the Word export, review release evidence and publish application changes using the normal Sites workflow.
7. In Kiro run git pull --ff-only origin main before further work. Runtime secrets stay outside Git.

### Documentation map

| File | Responsibility |
| --- | --- |
| APPLICATION.md | Product requirements, architecture and current boundaries |
| GENERATED-INVENTORY.md | Generated file hashes, routes, modules and test-file inventory |
| source-manifest.json | Machine-readable freshness fingerprints, not credentials |
| DOCUMENTATION.md | Update commands, generation and CI instructions |
| EMAIL-ACCOUNTS.md and ACCOUNT-FLOW.md | Account operations and external acceptance details |
| PROFILE-DEFAULTS-AND-GUIDE.md | Shared defaults and override behavior |
| COMPETITOR-AND-ARCHITECTURE-REVIEW.md | Dated comparison and earlier engineering review |
| ACCOUNT-VALIDATION.txt | Last recorded account/confirmation checks |
| tests/e2e/TEST-MATRIX.md | Test category map and manual boundaries |
| README-KIRO.md | Windows setup, separate test commands and reports |

### Revision log

| Date | Version | Change and evidence |
| --- | --- | --- |
| 11 November 2026 | 1.6 | Home Calculate my plan now resets the protein override and recalculates the Home results card, tracker and all-tab shared target from the submitted profile. Custom protein edits remain available afterward and survive refresh until the next Home calculation. Added existing-125 override regression and browser scenario; 176 contracts pass. |
| 11 November 2026 | 1.5 | Protein defaults no longer promote the legacy proteinTarget cache into a custom shared override. Home profile estimates update automatic targets; deliberate shared overrides remain intact and can be reset. Added stale-125, multi-profile and explicit-custom/reset regression contracts. |
| 11 November 2026 | 1.4 | Four failed-only tests now pass on Windows; one tablet UI failure remains in the supplied report. Captured DOM replay identified nowrap header badges overflowing the sidebar content column. Header flex wrapping and badge text wrapping remove replay overflow (document 785 to 753 px at viewport 768). Full Playwright rerun pending. |
| 11 November 2026 | 1.3 | Windows rerun at 457cc8a: 223 passed, five failed, no skipped tests. Corrected meal-removal test to select the named meal and check reload, froze trainer test clock before actions, and allowed food form grid tracks to shrink at tablet widths. Browser rerun pending. |
| 11 November 2026 | 1.2 | Repaired four truncated fragments in the GitHub legacy page (food catalogue, download link, nutrition log markup, trainer progress). Captured trace reproduced three syntax errors; new whole-page inline syntax gate and 172 contracts pass. Windows rerun still required; previous run had 161 passed and 67 failed/timeouts. |
| 10 November 2026 | 1.1 | Automatic test startup uses a dedicated port and one shared target for launch/readiness; Windows invokes Node directly. Five new launcher contract checks; browser execution on Windows still requires confirmation. |
| 10 November 2026 | 1.0 | Consolidated current source, native accounts, Brevo setup, confirmation UI, profile propagation, trainer, APIs, D1/local storage, tests and deferred scope. Contract baseline 166 passed; full external account acceptance remains pending. |

## 15 Source evidence

Primary implementation references are public/legacy.html, public/cloud-sync.js, public/app modules, app/account-auth.ts, app/chatgpt-auth.ts, app/api routes, app/account routes, drizzle SQL, worker/index.ts, vite.config.ts, package.json and playwright.config.ts. Generated inventory lists current files and fingerprints.

Operational observations recorded in this project session include Supabase email confirmation enabled, Brevo SMTP stored in Supabase, hosted native-auth feature switch enabled, a verified freemail sender and the owner's signup-email receipt. These are dated deployment observations, not source-code guarantees of future provider availability. Keep secrets and user identifiers out of this reference.

Earlier specialist documents and test notes are useful context but cannot override current route code or the explicit status catalogue above. Competitor feature research describes public product behavior only; it does not establish access to competitors' internal architecture, database, security controls or test results.

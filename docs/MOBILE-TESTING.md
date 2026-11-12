# NutriGuide Mobile APK Testing Strategy

## Purpose

This document is the maintained test plan for the native Android APK under `android/`. It is separate from the browser Playwright matrix because Android status bars, lifecycle, keyboard behavior, offline storage, account switching and device capabilities need native coverage.

The suite is aligned to the current Jetpack Compose app:

- authentication gate: sign in, create account, confirmation and password reset
- Today, Food diary, Move, Journey and Reports tabs
- profile targets, daily logs, date navigation and account isolation
- Android safe-area handling for status and navigation bars
- local persistence, process recreation, network failures and logout

## Test layers

| Layer | Location | Purpose |
| --- | --- | --- |
| JVM policy | `android/app/src/test/` | Pure nutrition, date, merge and validation rules |
| Compose instrumentation | `android/app/src/androidTest/` | Native semantics, auth controls, navigation and lifecycle on an emulator |
| Manual device acceptance | This document, `MAN-*` cases | Samsung S21 FE and real provider/email/device behavior |
| CI release gate | `.github/workflows/android.yml` | Build, unit tests, lint, emulator tests and APK artifact |

A passing emulator run does not prove real Supabase email delivery, provider callbacks, two physical accounts or Samsung hardware behavior.

## Traceability rule

Every Android feature, bug fix, UI change, API change or persistence change must update all applicable items in the same change:

1. Add or change an automated test under `android/app/src/test/` or `android/app/src/androidTest/`.
2. Update the matching case or requirement in this document.
3. Record the acceptance boundary or manual limitation.
4. Update `docs/APPLICATION.md` and the revision log.
5. Run the Android workflow. Do not mark a case passed from source inspection alone.

The CI alignment check fails an Android source change when neither the mobile test suite nor this document changes with it.

## Automated case inventory

### Authentication and account boundaries

| ID | Scenario | Automated coverage |
| --- | --- | --- |
| MOB-AUTH-01 | Auth gate renders without a WebView and exposes email/password sign in | `NativeFlowTest.authGateShowsRealAccountActions` |
| MOB-AUTH-02 | Create-account mode exposes name, email, password and confirmation fields | Compose instrumentation; add to `NativeFlowTest` when the form changes |
| MOB-AUTH-03 | Forgot-password mode hides the password field and keeps the email field | Compose instrumentation |
| MOB-AUTH-04 | Unverified or invalid sign-in stays signed out with a safe error | JVM/API contract plus manual provider acceptance |
| MOB-AUTH-05 | Successful sign-in selects the verified email owner | Native API contract and manual provider acceptance |
| MOB-AUTH-06 | Logout clears the native session and returns to the auth gate | Instrumentation/manual provider acceptance |
| MOB-AUTH-07 | Guest data is never copied into a new account | `NativeStore` policy test and two-account manual acceptance |
| MOB-AUTH-08 | Passwords and session tokens are not persisted in app state or logs | Native policy review; provider response contract |
| MOB-AUTH-09 | Auth mode controls remain reachable after switching between registration and reset | Compose instrumentation: `NativeFlowTest.accountModesRemainReachableAfterNavigation` |
| MOB-AUTH-10 | Reset mode removes the password control after recomposition | Compose instrumentation: `NativeFlowTest.resetModeDoesNotShowPasswordField` |

### Safe area, device and lifecycle

| ID | Scenario | Expected result |
| --- | --- | --- |
| MOB-SYS-01 | API 26, API 30 and API 35 launch | No crash; auth/app content renders |
| MOB-SYS-02 | Status bar contains time, battery and Wi-Fi | Header starts below the status bar |
| MOB-SYS-03 | Navigation bar and gesture inset are present | Bottom navigation remains tappable and is not covered |
| MOB-SYS-04 | 320dp, 360dp, 390dp and tablet width | No clipped cards, horizontal overflow or hidden buttons |
| MOB-SYS-05 | 200% font scale | Labels wrap without overlapping adjacent controls |
| MOB-SYS-06 | Keyboard opens for auth, profile and Journey note | Focused field and submit action remain reachable |
| MOB-SYS-07 | Rotate or recreate Activity | Current account and local state remain intact |
| MOB-SYS-08 | Background and resume during a network call | No duplicate submission or corrupted state |
| MOB-SYS-09 | Back button closes dialog before leaving the app | Modal focus and navigation remain correct |

### Today and profile

| ID | Scenario | Expected result |
| --- | --- | --- |
| MOB-TODAY-01 | New account opens Today | Profile setup card is shown; no fabricated 1800 kcal value |
| MOB-TODAY-02 | Save profile targets | Targets appear on the account only |
| MOB-TODAY-03 | Add food from Today | Navigates to Food without logging an unintended item |
| MOB-TODAY-04 | Browse workouts from Today | Navigates to Move without changing Food or Journey |
| MOB-TODAY-05 | Do a check-in from Today | Navigates to Journey without writing a check-in |
| MOB-TODAY-06 | Add water and steps | Only the selected metric changes and the action is idempotent per tap |
| MOB-TODAY-07 | Account icon and notification icon | Account opens logout/details; notification action does not mutate wellness data |

### Food diary and nutrition

| ID | Scenario | Expected result |
| --- | --- | --- |
| MOB-FOOD-01 | Food tab opens | Breakfast, Lunch, Dinner and Snacks rows are isolated |
| MOB-FOOD-02 | Add food opens picker | Only the chosen food is logged |
| MOB-FOOD-03 | Log each food choice | Correct meal, calories and protein are shown |
| MOB-FOOD-04 | Log the same food twice | Two deliberate entries are shown; no unrelated meal changes |
| MOB-FOOD-05 | Previous/next day | Selected date changes and entries do not bleed across dates |
| MOB-FOOD-06 | Empty selected day | All meal rows show no entries and no stale totals |
| MOB-FOOD-07 | Process recreation after logging | Entry and totals remain for the same account |
| MOB-FOOD-08 | Offline food logging | Local edit remains available; sync is not falsely reported as complete |
| MOB-FOOD-09 | Invalid custom serving or nutrition values | Validation blocks unsafe values and keeps existing entries |
| MOB-FOOD-10 | Remove or edit an entry when implemented | Only the selected entry changes; update this matrix when the control is added |

### Move

| ID | Scenario | Expected result |
| --- | --- | --- |
| MOB-MOVE-01 | All, Strength, Cardio and Mobility filters | Only matching workout cards are shown |
| MOB-MOVE-02 | Start session | One deliberate tap records one completion |
| MOB-MOVE-03 | Repeat the same button | No duplicate completion from repeated recomposition or double tap |
| MOB-MOVE-04 | Switch tabs after completion | Move count remains; Food, Journey and Reports do not receive phantom data |
| MOB-MOVE-05 | Back/background during a session when timer is present | Timer pauses or discards according to the documented behavior |

### Journey and recovery

| ID | Scenario | Expected result |
| --- | --- | --- |
| MOB-JOURNEY-01 | Select each mood | Only the selected mood is active |
| MOB-JOURNEY-02 | Save with note | Mood and note persist for this account |
| MOB-JOURNEY-03 | Save without note | Check-in still saves with an empty optional note |
| MOB-JOURNEY-04 | Reopen Journey | Saved values are shown; no duplicate check-in is created |
| MOB-JOURNEY-05 | Long note and keyboard | Text remains usable without layout overlap |

### Reports and navigation

| ID | Scenario | Expected result |
| --- | --- | --- |
| MOB-REPORT-01 | Reports with no activity | No weekly progress state and Start logging action are shown |
| MOB-REPORT-02 | Start logging | Navigates to Food and does not log data |
| MOB-REPORT-03 | Weekly/monthly toggle | Summary heading and period context update |
| MOB-REPORT-04 | Previous/next period | Selected report period changes without changing source logs |
| MOB-NAV-01 | Visit all five tabs repeatedly | Content remains isolated and no crash occurs |
| MOB-NAV-02 | Bottom navigation on small display | Labels and hit targets remain usable |
| MOB-NAV-03 | Account logout from any tab | Auth gate returns and previous account data is not visible |

### Network, privacy and failure handling

| ID | Scenario | Expected result |
| --- | --- | --- |
| MOB-NET-01 | DNS/timeout during session check | App remains usable at the auth gate with a safe message |
| MOB-NET-02 | 401/403/429 account response | No tokens or provider internals appear in the UI |
| MOB-NET-03 | 5xx state/sync response | Local edits remain pending and are retryable |
| MOB-NET-04 | Malformed JSON or oversized response | Request fails safely without corrupting local state |
| MOB-SEC-01 | Inspect SharedPreferences and logcat | No plaintext password or session token |
| MOB-SEC-02 | Switch between two test accounts | Each owner sees only their own local and cloud state |
| MOB-SEC-03 | Reinstall or stale debug APK | Install instructions explain signing-key and data consequences |

## Manual Samsung S21 FE acceptance

Run these on a test account and a separate second test account:

- install, upgrade and uninstall/reinstall
- portrait, landscape, gesture navigation and three-button navigation
- status-bar and navigation-bar overlap
- small/large font and keyboard
- create account, confirm email, sign in, reset password and logout
- profile setup with blank targets, custom targets and invalid values
- Food day navigation, repeated logging, offline use and relaunch
- Move filters and completion idempotency
- Journey mood/note persistence
- Reports period navigation
- two-account isolation and explicit sync
- slow network, airplane mode, retry and process death

Record device model, Android version, build commit, case ID, result, evidence and known limitation. Never use a real personal password or health record in a committed report.

## Release gate

The Android release is eligible for a test APK only when:

- Gradle build, unit tests and lint pass
- Compose instrumentation passes on the configured emulator
- changed Android behavior has a matching case and document update
- manual/provider cases are clearly marked pending rather than implied as passed
- APK checksum and the current commit are recorded in the workflow artifact

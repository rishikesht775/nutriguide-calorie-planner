# Profile defaults and journey companion

## User behavior

Once a valid profile is saved, it supplies one calorie target, protein target, BMI estimate and goal for the entire app. The same context is visible in the guide on Home, Food, Exercise, Journey and Reports.

| Area | Automatic default | What the user can change |
| --- | --- | --- |
| Home | Shared estimates, profile-based day plan and next useful action | Profile details, shared calorie/protein overrides, guide character |
| Food | Seven-day portions optimized toward calorie AND protein targets; household ingredient list | Food preference, budget, household size, recipe swaps, servings, custom meal plan and shared protein target |
| Exercise | Goal and initial session duration from profile goal/activity; Home setting until user chooses equipment | Goal, equipment, duration; readiness and session-effort feedback |
| Journey | Goal-specific path, real daily completion and four stages: learn/repeat/consistency/review | Recovery check-ins, reflection, measurements and optional story modes |
| Reports | Current shared targets, actual logged activity and a proposed movement week | Profile updates, reminder date/time, exports and review acknowledgement |

Defaults are suggestions, not completed entries. The app never invents eaten meals, sleep, water, steps, completed training or reminders. A proposed reminder fills the form; the user still chooses **Add reminder**.

## Overrides and profile updates

- Shared calorie/protein edits apply everywhere. Editing protein target in Food changes the same shared target.
- A changed profile updates automatic plans; manually generated/swapped meal plans and custom workout settings are preserved.
- **Use profile targets**, **Use profile meal plan** and **Use profile workout** reset the respective override. Actual logs are kept.
- Existing saved meal plans from earlier versions are treated as custom during migration, because their edit history is unknown. They are not silently discarded.
- An active workout is not rewritten by a profile edit. Finish the session before applying new session defaults.
- The standalone 100 g protein default is replaced by the shared profile estimate unless it represents an identified older custom target.
- Personal settings and source metadata sync using `ngPersonalSettings` and `ngPlanContext` and are included in backups.

## Guide behavior

One companion follows all five tabs, displays the selected character, explains the current recommendation and opens the relevant action. Its checklist reflects dated food, active training, recovery and explicit plan review.

In training, it shows movement/rest cues, optional spoken instructions, the current exercise and paused/finished states. Honest Easy / About right / Too hard feedback shapes the next automatic suggestion. Low energy or soreness offers a gentler automatic recommendation. A manually selected workout stays unchanged. Pain or feeling unwell calls for stopping and appropriate professional advice; there is no camera-based form assessment.

Food questions use remaining calories and protein from actual logs. Questions about targets/BMI and workouts use the same profile snapshot. The assistant remains an explainable rule-based guide, not a human coach or a generative AI service.

## Implementation and evidence

- `public/app/personal-plan-engine.js`: pure profile calculation, override policy, progress/stage model.
- `public/app/personal-plan.js`: automatic defaults, current-tab guide, legacy widget synchronization, readiness, voice cues and review scheduling.
- `public/app/meal-engine.js`: recipe/portion optimization with explicit protein gaps when a target is unreachable. Recipe scaling supports 1200–3500 kcal; higher shared targets show a warning rather than claiming a complete matching meal plan.
- Node contracts include profile/override/reset policy and the real controller module under a small DOM adapter. The adapter is not browser/layout validation.
- `tests/e2e/personal-plan.spec.ts`: seven desktop/mobile scenarios for shared defaults, edits, persistence, reset and actual-log progression.

Useful future upgrades are professionally reviewed form videos, an optional qualified-coach review workflow, and provider-backed AI with separate response evaluation. They should preserve this explicit default/override model.

## Protein target provenance

A legacy proteinTarget cache (including 125 g) does not establish a custom target. On first migration the app derives the automatic target from the saved Home profile. Only an explicit ngPersonalSettings.targets.protein value overrides that estimate. Existing shared custom settings remain preserved; use Personalize your plan > Use profile targets to remove them. Weight/goal changes refresh automatic protein targets across shared context and the tracker; other profile fields affect calorie/BMI estimates according to the documented policy.

## Home recalculation behavior

Submitting valid Home details with Calculate my plan resets any saved protein override, including an existing 125 g custom value, and updates the Home protein card, tracker and shared targets from that submitted profile. Custom protein edits made afterward remain shared and survive reload until the next Home calculation or explicit reset. This exception takes precedence over earlier general statements about preserving targets through profile edits. Food logs and deliberate meal/workout choices are retained.

# NutriGuide validation status

Latest recorded contract run: 166 passed after the registration confirmation update. TypeScript, JavaScript syntax and production build passed. The account confirmation UI is covered by five small-DOM state tests; these are not layout tests.

Full signed-in Playwright execution remains pending in Kiro/GitHub Actions because Chromium install/download attempts failed here. Discovery previously reported 228 executions across desktop/mobile and 29 spec files; re-run collection for current counts.

Native Supabase accounts and Brevo SMTP are configured. The owner reported receiving a signup email. Complete confirmation, login, recovery, two-account cloud isolation, physical-device browser capabilities and simultaneous cross-device behavior remain external acceptance checks.

See docs/APPLICATION.md, docs/ACCOUNT-VALIDATION.txt and generated test-reports TXT files. Neither source inventory nor UI fixtures certify provider behavior, clinical accuracy, production load capacity or WCAG compliance.

## 11 November 2026 trace diagnosis

The supplied Windows trace/report at ea4b4e showed 161 passed, 45 failed assertions and 22 timeouts out of 228 executions. All 18 mocked auth UI cases passed. Four legacy-page fragments were missing in the GitHub copy; the served HTML reproduces three syntax errors, then nutrition state resolves to a DOM element and dependent controllers fail. The corrected page passes the inline syntax regression gate and all 172 Node contracts. The fourth trainer fragment parsed but used an incorrect property. No claim is made that all 67 browser failures are fixed: cloud-hydration policy, controls/selectors and responsive overflow require rerun evidence.

## Follow-up Windows run

Uploaded report for 457cc8a: 223 passed, five failed, zero skipped. Two meal-removal tests clicked Meal-0 but asserted Meal-2 removed; corrected to target Meal-2 and verify count, preserved neighbor and reload. Two pause tests allowed the installed clock to continue during action/expect polling; pause the clock before starting so advancing time is explicit. Tablet food form grid tracks now use minmax(0, ...) with shrinkable children. These follow-up changes require browser verification and are not reported as passing browser tests.

## Tablet badge overflow follow-up

Failed-only Windows run at 4fb6049: four passed, one failed (768px Food Studio, 19px horizontal overflow). Reconstructed the supplied trace DOM in an inert iframe at the original 768x900 viewport with the current CSS. Before: document scrollWidth 785; nowrap ngFoodTools heading badge extended its text beyond its own box. After wrapping ng-heading children and ng-section ng-chip text: document scrollWidth 753, within viewport 768. This is captured-DOM browser verification, not execution of the full live Playwright suite. User should rerun --last-failed, then full regression.

## Account isolation repair — 11 November 2026

180 contract tests passed, including unowned-data quarantine, new-account empty state, prior-owner preservation, returning-owner restoration and matching-identity UI gate. TypeScript passed. Added tests/e2e/account-isolation.spec.ts for Alice → new Bob → Alice with empty Bob profile and preserved Alice water/profile. Browser execution and real-provider account-switch acceptance remain pending. No existing cloud wellness records were deleted. See docs/ACCOUNT-ISOLATION-VALIDATION.txt.

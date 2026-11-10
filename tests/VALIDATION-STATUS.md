# NutriGuide validation status

Latest recorded contract run: 166 passed after the registration confirmation update. TypeScript, JavaScript syntax and production build passed. The account confirmation UI is covered by five small-DOM state tests; these are not layout tests.

Full signed-in Playwright execution remains pending in Kiro/GitHub Actions because Chromium install/download attempts failed here. Discovery previously reported 228 executions across desktop/mobile and 29 spec files; re-run collection for current counts.

Native Supabase accounts and Brevo SMTP are configured. The owner reported receiving a signup email. Complete confirmation, login, recovery, two-account cloud isolation, physical-device browser capabilities and simultaneous cross-device behavior remain external acceptance checks.

See docs/APPLICATION.md, docs/ACCOUNT-VALIDATION.txt and generated test-reports TXT files. Neither source inventory nor UI fixtures certify provider behavior, clinical accuracy, production load capacity or WCAG compliance.

## 11 November 2026 trace diagnosis

The supplied Windows trace/report at ea4b4e showed 161 passed, 45 failed assertions and 22 timeouts out of 228 executions. All 18 mocked auth UI cases passed. Four legacy-page fragments were missing in the GitHub copy; the served HTML reproduces three syntax errors, then nutrition state resolves to a DOM element and dependent controllers fail. The corrected page passes the inline syntax regression gate and all 172 Node contracts. The fourth trainer fragment parsed but used an incorrect property. No claim is made that all 67 browser failures are fixed: cloud-hydration policy, controls/selectors and responsive overflow require rerun evidence.

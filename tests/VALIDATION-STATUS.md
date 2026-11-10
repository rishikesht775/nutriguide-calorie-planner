# NutriGuide validation status

Latest recorded contract run: 166 passed after the registration confirmation update. TypeScript, JavaScript syntax and production build passed. The account confirmation UI is covered by five small-DOM state tests; these are not layout tests.

Full signed-in Playwright execution remains pending in Kiro/GitHub Actions because Chromium install/download attempts failed here. Discovery previously reported 228 executions across desktop/mobile and 29 spec files; re-run collection for current counts.

Native Supabase accounts and Brevo SMTP are configured. The owner reported receiving a signup email. Complete confirmation, login, recovery, two-account cloud isolation, physical-device browser capabilities and simultaneous cross-device behavior remain external acceptance checks.

See docs/APPLICATION.md, docs/ACCOUNT-VALIDATION.txt and generated test-reports TXT files. Neither source inventory nor UI fixtures certify provider behavior, clinical accuracy, production load capacity or WCAG compliance.

# NutriGuide email accounts

Status: implemented, provider activation pending. Existing connected-account login remains available. The UI only shows email Sign in / Create account when the server reports a valid enabled provider configuration. Never enable this as a cosmetic-only change.

## Activation
1. Connect a Supabase project. Configure Email/Password Auth with email confirmation enabled and password minimum length 12.
2. Configure production SMTP, sender domain and delivery. Supabase's default mail service is limited and is not suitable for production delivery.
3. Set the project Site URL to the exact production origin. Allow `/account/callback` and `/account/callback?intent=recovery` redirect URLs on that origin. PKCE email links must open in the browser used to request them.
4. Set runtime bindings: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `AUTH_SITE_URL` (origin only, no trailing path), and `NUTRIGUIDE_EMAIL_AUTH_ENABLED=true`. No service-role key is required or permitted in browser code. Local tests require the equivalent local Worker bindings, not just Playwright settings.
5. Verify with real test accounts before release: registration, delivered confirmation, duplicate address, unconfirmed login rejection, confirmed login, refresh, logout, reset delivery, reset callback, new password, old password rejection, separate-user state isolation, provider rate limits and mobile layouts.

## Implemented flow
The server uses the official Supabase SSR client with per-request HttpOnly cookies, HTTPS secure cookies, SameSite Lax, fixed redirects, bounded JSON requests, same-origin mutation checks and provider-verified `getUser()` identity. Passwords are never persisted in browser storage or returned in API responses. Password updates revoke provider sessions; normal logout ends the current session. Email identity is namespaced by provider project and user ID. Existing connected-account profiles remain separate: matching email addresses do not automatically link accounts or migrate health records.

The customer UI uses NutriGuide wording; the connected provider controls its own external authentication screen. Existing platform-owned auth routes are preserved.

## Verification scope
`npm.cmd run test:contracts` executes real route code with mocked provider SDK responses, not a live Supabase project. `npm.cmd run test:security` includes account UI response fixtures and security checks. TXT reports are generated under `test-reports`. Passing these tests does not verify email delivery, remote provider configuration or real account creation. Complete the real-provider checks above after connecting the project.

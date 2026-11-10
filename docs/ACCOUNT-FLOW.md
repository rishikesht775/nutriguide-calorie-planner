# NutriGuide account flow

NutriGuide currently uses the hosting platform's **Sign in with ChatGPT** integration. It does not operate a separate email/password account database or a Google OAuth provider.

The earlier Sign in/Create account buttons changed a local UI mode but both continued to the same provider. They have been removed because that distinction suggested a separate registration flow that was not implemented.

The entry page now has one ordinary anchor with `target="_top"` to `/signin-with-chatgpt?return_to=%2Flegacy.html`. The hosting platform owns the sign-in, sign-out and callback routes. After identity is established, `/api/me` identifies the user and `/api/state` reads/writes that user's state using the trusted user ID. Saving a profile associates it with this account; NutriGuide never collects its password.

Local Kiro development has no hosted identity gateway. The preview explains this and points the account link to the hosted site. Playwright mocks identity and intercepts provider navigation for UI tests, while API tests check anonymous denial. There is no development auth bypass in production.

The gate is visible before JavaScript executes; an authenticated response hides it. Failed identity checks keep the app gated and offer a retry. The real link remains navigable on the hosted site even when the gate script fails.

Actual provider login/consent and cross-device persistence require a signed-in browser test. Test fixtures or an API mock do not prove those external steps passed.

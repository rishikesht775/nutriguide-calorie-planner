# NutriGuide account flow

NutriGuide offers real independent email registration/sign-in through Supabase Auth, plus its preserved connected-account option. See APPLICATION.md sections 2, 6 and 7 and EMAIL-ACCOUNTS.md for the current contracts and release limits. Earlier descriptions of provider-only login are superseded.

Registration calls the server sign-up action. Accepted requests show a prominent Check your email panel, hide the original form and offer Continue to sign in or Use a different email. These controls do not send another email by themselves. Generic duplicate-address wording avoids account enumeration. Failure keeps the form visible and displays the error.

Supabase email confirmation is required. The PKCE callback uses /account/callback, and recovery uses the same callback with recovery intent followed by /account-reset.html. Use the requesting browser for confirmation links. Sign-in validates the provider identity and confirmed email; HttpOnly cookies hold native sessions. Passwords and SMTP keys are not wellness state.

/account/connected selects the hosting platform identity and redirects through its reserved sign-in path at the top level. The platform owns /signin-with-chatgpt, /signout-with-chatgpt and /callback. Matching email addresses never silently link separate provider identities or migrate profiles.

Local portable previews may have development-only mock identity, and Playwright tests mock account endpoints. These are not real provider verification. Production identity, confirmation, recovery and cross-device persistence require external acceptance. Registration email receipt has been reported by the owner; complete confirmation/login/reset acceptance remains pending.

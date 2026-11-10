import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  return Response.json({
    authenticated: Boolean(user),
    user: user
      ? { id: user.userId, email: user.email, name: user.displayName, authProvider: user.authProvider || "connected" }
      : null,
    signInUrl: chatGPTSignInPath("/legacy.html"),
    signOutUrl: chatGPTSignOutPath("/legacy.html"),
  }, { headers: { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}

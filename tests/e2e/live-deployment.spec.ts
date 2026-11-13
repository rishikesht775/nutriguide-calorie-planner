import { test, expect } from "@playwright/test";

const LIVE_URL = "https://nutriguide-calorie-planner.rishikesht775.chatgpt.site";

test("live deployment serves the current premium UI", async ({ request }) => {
  const response = await request.get(LIVE_URL, { timeout: 30000 });
  expect(response.ok()).toBeTruthy();

  const html = await response.text();
  expect(html).toContain("/app/premium-ui.css");
  expect(html).toContain("/app/premium-ui.js");
  expect(html).toContain("Your wellness");
});

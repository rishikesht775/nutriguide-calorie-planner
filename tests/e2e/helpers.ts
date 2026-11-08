import { expect, Page } from '@playwright/test';

export type ProfileValues = {
  age?: string;
  height?: string;
  weight?: string;
  activity?: string;
  goal?: string;
};

const authRoutesInstalled = new WeakSet<Page>();

/** Keep local Playwright runs deterministic without requiring a real platform login. */
export async function mockAuthenticatedSession(page: Page) {
  if (authRoutesInstalled.has(page)) return;
  await page.route('**/api/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ authenticated: true, user: { email: 'playwright@example.test' } }),
  }));
  authRoutesInstalled.add(page);
}

export async function startFresh(page: Page) {
  await mockAuthenticatedSession(page);
  await page.goto('/legacy');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

export async function completeProfile(page: Page, values: ProfileValues = {}) {
  await startFresh(page);
  await page.locator('#age').fill(values.age ?? '30');
  await page.locator('#height').fill(values.height ?? '170');
  await page.locator('#weight').fill(values.weight ?? '70');
  await page.locator('#activity').selectOption(values.activity ?? '1.375');
  await page.locator('#goal').selectOption(values.goal ?? 'loss');
  await page.getByRole('button', { name: 'Calculate my plan', exact: true }).click({ force: true });
  await expect(page.locator('body')).toHaveClass(/post-profile/);
  await expect(page.getByRole('button', { name: /Food studio/i })).toBeVisible();
}

export async function openTab(page: Page, label: RegExp | string) {
  const tab = page.locator('.app-nav button').filter({ hasText: label }).first();
  await expect(tab).toBeVisible();
  await tab.click({ force: true });
}

export async function chooseGuide(page: Page, guide: RegExp = /Panda trainer Martial arts Calm strength/) {
  const card = page.getByRole('button', { name: guide }).first();
  await card.click({ force: true });
  await expect(page.locator('#coachName')).toContainText(/Panda trainer|Fresh-start kid|hydration cat|Workout duo|Adventure explorer|Star fitness hero/i);
}

export async function visibleTabSection(page: Page, tab: string) {
  return page.locator(`[data-ng-tab="${tab}"]:visible`);
}

import { expect, Page } from '@playwright/test';

export type ProfileValues = {
  age?: string;
  sex?: string;
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
  await page.route('**/api/state', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify(route.request().method() === 'POST' ? { saved: true } : { authenticated: true, state: {} }),
  }));
  authRoutesInstalled.add(page);
}

export async function startFresh(page: Page) {
  await mockAuthenticatedSession(page);
  await page.goto('/legacy');
  await expect(page.locator('body')).not.toHaveClass(/auth-pending/);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/auth-pending/);
}

export async function completeProfile(page: Page, values: ProfileValues = {}) {
  await startFresh(page);
  // premium-ui.js presents the profile form as four visible wizard steps.
  // Keep a fallback for pages/configurations that still render the legacy
  // single form so every suite can share the same setup helper.
  const next = page.locator('.ng-profile-next');
  if (await next.count()) {
    await page.locator('#age').fill(values.age ?? '30');
    await page.locator('#sex').selectOption(values.sex ?? 'male');
    await next.click();

    await page.locator('#height').fill(values.height ?? '170');
    await page.locator('#weight').fill(values.weight ?? '70');
    await next.click();

    await page.locator('#activity').selectOption(values.activity ?? '1.375');
    await next.click();

    await page.locator('#goal').selectOption(values.goal ?? 'loss');
  } else {
    await page.locator('#age').fill(values.age ?? '30');
    await page.locator('#sex').selectOption(values.sex ?? 'male');
    await page.locator('#height').fill(values.height ?? '170');
    await page.locator('#weight').fill(values.weight ?? '70');
    await page.locator('#activity').selectOption(values.activity ?? '1.375');
    await page.locator('#goal').selectOption(values.goal ?? 'loss');
  }
  await page.getByRole('button', { name: /^(Complete setup|Calculate my plan|Save profile details)$/i }).click();
  await expect(page.locator('body')).toHaveClass(/post-profile/);
  await expect(page.locator('.app-nav button[data-tab=food]')).toBeVisible();
}

export async function openTab(page: Page, label: RegExp | string) {
  const tab = page.locator('.app-nav button').filter({ hasText: label }).first();
  await expect(tab).toBeVisible();
  await tab.click();
}

export async function chooseGuide(page: Page, guide: RegExp = /Panda trainer Martial arts Calm strength/) {
  const choices = page.locator('#guideChoices');
  const guideButton = page.locator("#ngHomeGuideButton");
  if (await guideButton.count()) {
    await openTab(page, /Home/i);
    await expect(guideButton).toBeVisible();
    await guideButton.click();
  } else if (!(await choices.isVisible())) {
    await openTab(page, /Home/i);
  }
  await expect(choices).toBeVisible({ timeout: 10000 });
  if (await choices.getAttribute('open') === null) {
    await choices.locator('summary').click();
  }
  const guidePattern = guide instanceof RegExp ? new RegExp(guide.source.replace(/\s+/g, "\\s*"), guide.flags) : guide;
  const card = choices.locator(".guide-card").filter({ hasText: guidePattern }).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator('#coachName')).toContainText(/Panda trainer|Fresh-start kid|hydration cat|Workout duo|Adventure explorer|Star fitness hero/i);
}

export async function openProfileEditor(page: Page) {
  const form = page.locator('#form');
  if (!(await form.isVisible())) {
    const trigger = page.locator('#ngHomeProfileButton:visible, #ngProfilePromptButton:visible').first();
    if (await trigger.count()) await trigger.click();
  }
  const detailsTab = page.locator('[data-ng-profile-tab="details"]:visible');
  if (await detailsTab.count()) await detailsTab.click();
  await expect(form).toBeVisible();
  const weight = page.locator('#weight');
  while (!(await weight.isVisible())) {
    const next = form.locator('.ng-profile-next:visible');
    if (!(await next.count())) break;
    await next.click();
  }
  await expect(weight).toBeVisible();
}

export async function visibleTabSection(page: Page, tab: string) {
  return page.locator(({ home: '.dashboard-summary', food: '.food-nutrition', move: '.exercise-library', journey: '.journey', plan: '.weekly-report' } as Record<string, string>)[tab] + ':visible');
}

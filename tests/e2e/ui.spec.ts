import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@ui visual and layout behavior', () => {
  test('trainer banner and coach card are visible after profile completion', async ({ page }) => {
    await completeProfile(page);
    await expect(page.locator('#ngAppBanner')).toBeVisible();
    await expect(page.locator('#guideCoach')).toBeVisible();
    await expect(page.getByText('PERSONAL GYM TRAINER', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start training', exact: true })).toBeVisible();
  });

  test('each tab displays its own content area', async ({ page }) => {
    await completeProfile(page);
    for (const [label, section] of [[/Home/i, 'home'], [/Food studio/i, 'food'], [/Exercise/i, 'move'], [/Journey/i, 'journey'], [/Plan & reports/i, 'plan']] as const) {
      await openTab(page, label);
      await expect(page.locator(`[data-ng-tab="${section}"]:visible`).first()).toBeVisible();
      await expect(page.locator(`[data-ng-tab]:visible`).count()).toBeGreaterThan(0);
    }
  });

  test('mobile layout does not create horizontal page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await completeProfile(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBeFalsy();
  });
});

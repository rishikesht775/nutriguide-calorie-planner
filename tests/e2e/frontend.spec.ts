import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@frontend rendering and interaction integrity', () => {
  test('no uncaught page errors occur while moving through every feature tab', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await completeProfile(page);
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i, /Home/i]) await openTab(page, label);
    expect(errors).toEqual([]);
  });

  test('only the selected tab content is visible', async ({ page }) => {
    await completeProfile(page);
    for (const [label, tab] of [[/Home/i, 'home'], [/Food studio/i, 'food'], [/Exercise/i, 'move'], [/Journey/i, 'journey'], [/Plan & reports/i, 'plan']] as const) {
      await openTab(page, label);
      await expect(page.locator(`[data-ng-tab="${tab}"]:visible`).first()).toBeVisible();
      await expect(page.locator('[data-ng-tab]:visible')).toHaveCount(1);
    }
  });

  test('mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await completeProfile(page);
    for (const label of [/Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) await openTab(page, label);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBeFalsy();
  });
});

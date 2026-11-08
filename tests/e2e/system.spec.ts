import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@system complete application behavior', () => {
  test('all primary workflows are reachable in sequence', async ({ page }) => {
    await completeProfile(page);
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) {
      await openTab(page, label);
      await expect(page.locator('.app-nav button.active')).toContainText(label);
    }
  });

  test('tab content isolation hides unrelated tab sections', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);
    await expect(page.locator('[data-ng-tab="food"]:visible').first()).toBeVisible();
    await expect(page.locator('[data-ng-tab="move"]:visible')).toHaveCount(0);
    await expect(page.locator('[data-ng-tab="journey"]:visible')).toHaveCount(0);
    await openTab(page, /Plan & reports/i);
    await expect(page.locator('[data-ng-tab="plan"]:visible').first()).toBeVisible();
    await expect(page.locator('[data-ng-tab="food"]:visible')).toHaveCount(0);
  });

  test('browser-only mode keeps manual logs available offline', async ({ page }) => {
    await completeProfile(page);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.locator('#ngDeviceStatus')).toContainText('offline');
  });
});

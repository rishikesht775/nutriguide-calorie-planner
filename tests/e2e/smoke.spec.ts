import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@smoke core availability', () => {
  test('profile unlocks all primary tabs', async ({ page }) => {
    await completeProfile(page);
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) {
      const tab = page.locator('.app-nav button:visible, #ng-phase2-demo .ng-nav button:visible')
        .filter({ hasText: label })
        .first();
      await expect(tab).toBeVisible();
    }
  });

  test('primary tabs open without a page error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await completeProfile(page);
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) {
      await openTab(page, label);
    }
    expect(errors).toEqual([]);
  });
});

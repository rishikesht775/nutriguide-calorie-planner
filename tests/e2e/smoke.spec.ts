import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@smoke core availability', () => {
  test('profile unlocks all primary tabs', async ({ page }) => {
    await completeProfile(page);
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) {
      await expect(page.locator('.app-nav').getByRole('button', { name: label })).toBeVisible();
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

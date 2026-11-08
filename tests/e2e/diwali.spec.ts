import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@visual Diwali theme', () => {
  test('festive layers render in the correct tabs', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Home/i);
    await expect(page.locator('.ng-theme-courtyard .ng-firework-canvas').first()).toBeAttached();
    await expect(page.locator('.ng-theme-courtyard .ng-festive-garland').first()).toBeAttached();
    await openTab(page, /Food studio/i);
    await expect(page.locator('.ng-theme-bazaar .ng-firework-canvas').first()).toBeAttached();
    await expect(page.locator('.ng-diwali-food-banner')).toBeVisible();
    await expect(page.locator('.ng-food-guides')).toHaveCount(0);
    await openTab(page, /Exercise/i);
    await expect(page.locator('.ng-theme-palace .ng-firework-canvas').first()).toBeAttached();
    await openTab(page, /Plan & reports/i);
    await expect(page.getByRole('heading', { name: 'Diwali festival calendar' })).toBeVisible();
    await expect(page.getByText('Deepavali', { exact: false })).toBeVisible();
  });
});

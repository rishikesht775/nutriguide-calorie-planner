import { test, expect } from '@playwright/test';
import { chooseGuide, completeProfile, openTab } from './helpers';

test.describe('@regression previously reported bugs', () => {
  test('Journey and Plan & reports tabs are clickable', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Journey/i);
    await expect(page.locator('[data-ng-tab="journey"]:visible').first()).toBeVisible();
    await openTab(page, /Plan & reports/i);
    await expect(page.locator('[data-ng-tab="plan"]:visible').first()).toBeVisible();
  });

  test('only one trainer is used and food guide cards are removed', async ({ page }) => {
    await completeProfile(page);
    await chooseGuide(page);
    await expect(page.locator('.ng-food-guides')).toHaveCount(0);
    await expect(page.locator('.ng-app-banner')).toContainText('Panda trainer');
    await expect(page.locator('.guide-coach')).toContainText('Panda trainer');
  });

  test('changing trainer updates the global guide message', async ({ page }) => {
    await completeProfile(page);
    await page.getByRole('button', { name: /Fresh-start kid Food buddy/i }).click();
    await expect(page.locator('#coachName')).toHaveText('Fresh-start kid');
    await expect(page.locator('#ngAppBanner')).toContainText('Fresh-start kid is your trainer');
  });

  test('festival decoration does not create duplicate badge content in every tab', async ({ page }) => {
    await completeProfile(page);
    await expect(page.locator('.ng-tab-section .ng-diwali-badge')).toHaveCount(1);
  });
});

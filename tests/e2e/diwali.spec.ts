import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test('Diwali visual layers render in the correct tabs', async ({ page }) => {
  await completeProfile(page);

  await openTab(page, /Home/i);
  await expect(page.locator('.ng-theme-courtyard .ng-firework-canvas').first()).toBeVisible();
  await expect(page.locator('.ng-theme-courtyard .ng-festive-garland').first()).toBeVisible();

  await openTab(page, /Food studio/i);
  await expect(page.locator('.ng-theme-bazaar .ng-firework-canvas').first()).toBeVisible();
  await expect(page.locator('.ng-theme-bazaar .ng-food-guide').first()).toBeVisible();

  await openTab(page, /Exercise/i);
  await expect(page.locator('.ng-theme-palace .ng-firework-canvas').first()).toBeVisible();

  await openTab(page, /Plan & reports/i);
  await expect(page.getByRole('heading', { name: 'Diwali festival calendar' })).toBeVisible();
  await expect(page.getByText('Naraka Chaturdashi', { exact: false })).toBeVisible();
  await expect(page.getByText('Deepavali', { exact: false })).toBeVisible();
  await expect(page.locator('.ng-diwali-celebration-strip')).toHaveCount(0);
});

test('profile initialization does not throw before weekly helpers load', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/legacy');
  await page.locator('#age').fill('30');
  await page.locator('#height').fill('170');
  await page.locator('#weight').fill('70');
  await page.getByRole('button', { name: 'Calculate my plan', exact: true }).click();
  await expect(page.locator('body')).toHaveClass(/post-profile/);
  expect(errors.filter(error => !error.includes('updateWeeklyStrip'))).toEqual([]);
});

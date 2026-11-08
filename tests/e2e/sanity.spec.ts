import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@sanity release gate', () => {
  test('a user can calculate, choose Panda, and reach Exercise', async ({ page }) => {
    await completeProfile(page);
    await page.getByRole('button', { name: /Panda trainer Martial arts/i }).click({ force: true });
    await expect(page.locator('#coachName')).toHaveText('Panda trainer');
    await openTab(page, /Exercise/i);
    await expect(page.getByRole('heading', { name: /Panda trainer.s training plan/i })).toBeVisible();
  });

  test('Food Studio retains festive food content', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);
    await expect(page.locator('.ng-diwali-food-banner')).toBeVisible();
    await expect(page.getByRole('button', { name: '🪔 Diwali treats', exact: true })).toBeVisible();
  });
});

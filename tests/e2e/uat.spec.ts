import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@uat acceptance journeys', () => {
  test('weight-loss user completes a guided first day', async ({ page }) => {
    await completeProfile(page, { age: '30', height: '168', weight: '84', activity: '1.55', goal: 'loss' });
    await page.getByRole('button', { name: /Panda trainer Martial arts/i }).click({ force: true });
    await openTab(page, /Food studio/i);
    await page.locator('#nutritionFood').fill('dal');
    await page.locator('#nutritionQuantity').fill('200');
    await page.locator('#nutritionQuantity').press('Tab');
    await page.getByRole('button', { name: 'Save food', exact: true }).click();
    await openTab(page, /Exercise/i);
    await page.getByRole('button', { name: 'Done', exact: true }).first().click();
    await openTab(page, /Plan & reports/i);
    await expect(page.getByRole('heading', { name: 'Share your progress with one person' })).toBeVisible();
  });

  test('new user can select a story mode after choosing a guide', async ({ page }) => {
    await completeProfile(page);
    await page.getByRole('button', { name: /Panda trainer Martial arts/i }).click({ force: true });
    await openTab(page, /Journey/i);
    await page.getByRole('button', { name: /Steady Start/i }).click();
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.locator('#journeyGuideAvatar')).toHaveText('🐼🥋');
  });
});

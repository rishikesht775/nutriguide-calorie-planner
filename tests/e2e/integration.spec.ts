import { test, expect } from '@playwright/test';
import { chooseGuide, completeProfile, openTab } from './helpers';

test.describe('@integration state and feature connections', () => {
  test('profile and selected trainer persist after reload', async ({ page }) => {
    await completeProfile(page, { weight: '84', goal: 'loss' });
    await chooseGuide(page);
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/post-profile/);
    await expect(page.locator('#coachName')).toHaveText('Panda trainer');
    await expect(page.locator('#ngTrainerFocus')).toContainText('101 g protein target');
  });

  test('story mode opens the matching app section', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Journey/i);
    await page.getByRole('button', { name: /Strength Quest/i }).click();
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    await page.getByRole('button', { name: 'Open Food studio', exact: true }).click();
    await expect(page.locator('[data-ng-tab="food"]:visible').first()).toBeVisible();
  });

  test('food log updates today dashboard totals', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);
    await page.locator('#nutritionFood').fill('paneer');
    await page.locator('#nutritionQuantity').fill('100');
    await page.locator('#nutritionQuantity').press('Tab');
    await page.getByRole('button', { name: 'Save food', exact: true }).click();
    await openTab(page, /Home/i);
    await expect(page.locator('#ngCaloriesLeft')).not.toHaveText('—');
  });
});

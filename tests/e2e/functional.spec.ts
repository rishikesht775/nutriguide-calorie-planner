import { test, expect } from '@playwright/test';
import { chooseGuide, completeProfile, openTab } from './helpers';

test.describe('@functional user actions', () => {
  test('calculates calorie target, BMI, and meal plan from profile', async ({ page }) => {
    await completeProfile(page, { age: '30', height: '168', weight: '84', activity: '1.55', goal: 'loss' });
    await expect(page.locator('#cal')).toContainText('kcal');
    await expect(page.locator('#bmi')).not.toHaveText('—');
    await expect(page.locator('#meals')).toContainText('Breakfast');
    await expect(page.locator('#meals')).toContainText('Dinner');
  });

  test('selected guide becomes the active trainer', async ({ page }) => {
    await completeProfile(page);
    await chooseGuide(page);
    await expect(page.locator('#coachName')).toHaveText('Panda trainer');
    await expect(page.locator('#guideStageTitle')).toContainText('Panda trainer');
    await expect(page.locator('#guideStageAvatar')).toHaveText('🐼🥋');
  });

  test('nutrition lookup calculates values for an Indian food portion', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);
    await page.locator('#nutritionFood').fill('chicken biryani');
    await page.locator('#nutritionQuantity').fill('200');
    await page.locator('#nutritionQuantity').press('Tab');
    await expect(page.locator('#nutritionCalories')).toHaveValue('400');
    await expect(page.locator('#nutritionProtein')).toHaveValue('24.0');
  });

  test('exercise plan supports start and completion actions', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Exercise/i);
    await page.getByRole('button', { name: 'Start session', exact: true }).click();
    await expect(page.locator('#ngTrainerStatus')).toHaveText('Session in progress');
    await page.getByRole('button', { name: 'Finish session', exact: true }).click();
    await expect(page.locator('#ngTrainerHistory')).toContainText('Full-body');
  });
});

import { test, expect } from '@playwright/test';
import { completeProfile, openTab, startFresh } from './helpers';

test.describe('@edge cases validation and resilience', () => {
  test('required profile fields prevent an empty calculation', async ({ page }) => {
    await startFresh(page);
    await page.getByRole('button', { name: 'Calculate my plan', exact: true }).click();
    await expect(page.locator('body')).toHaveClass(/needs-profile/);
  });

  test('unknown food cannot silently create a zero nutrition entry', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);
    await page.locator('#nutritionFood').fill('unknown test dish');
    await page.locator('#nutritionFood').press('Tab');
    await page.getByRole('button', { name: 'Save food', exact: true }).click();
    await expect(page.getByText(/Food not found/i)).toBeVisible();
    await expect(page.locator('#nutritionLog')).toContainText('No foods logged yet');
  });

  test('zero steps and zero water produce a valid empty progress state', async ({ page }) => {
    await completeProfile(page);
    await expect(page.locator('#ngStepsToday')).toHaveText('0');
    await expect(page.locator('#ngWaterToday')).toHaveText('0 / 8');
    await expect(page.locator('#ngTodayProgress')).toHaveCSS('width', /0px|0%/);
  });

  test('large but valid profile values still calculate a plan', async ({ page }) => {
    await completeProfile(page, { age: '89', height: '210', weight: '200', activity: '1.2', goal: 'maintain' });
    await expect(page.locator('#cal')).toContainText('kcal');
    await expect(page.locator('#bmi')).not.toHaveText('—');
  });

  test('long journal text stays inside the journal field', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Journey/i);
    const text = 'A'.repeat(2000);
    await page.locator('#journalText').fill(text);
    await expect(page.locator('#journalText')).toHaveValue(text);
  });
});

import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@e2e complete first-day wellness flow', () => {
  test('profile to trainer, food, exercise, journey, reminders, and report', async ({ page }) => {
    await completeProfile(page, { age: '30', height: '168', weight: '84', activity: '1.55', goal: 'loss' });

    await page.getByRole('button', { name: /Panda trainer Martial arts/i }).click({ force: true });
    await expect(page.locator('#coachName')).toHaveText('Panda trainer');

    await openTab(page, /Food studio/i);
    await page.locator('#nutritionFood').fill('dal');
    await page.locator('#nutritionQuantity').fill('200');
    await page.locator('#nutritionQuantity').press('Tab');
    await expect(page.locator('#nutritionCalories')).not.toHaveValue('0');
    await page.getByRole('button', { name: 'Save food', exact: true }).click();

    await openTab(page, /Exercise/i);
    const start = page.getByRole('button', { name: 'Start', exact: true }).first();
    if (await start.isVisible()) await start.click();
    const done = page.getByRole('button', { name: 'Done', exact: true }).first();
    if (await done.isVisible()) await done.click();

    await openTab(page, /Journey/i);
    const story = page.getByRole('button', { name: /Steady Start|Strength Quest|Indian Plate Adventure/i }).first();
    if (await story.isVisible()) await story.click();
    await expect(page.locator('[data-ng-tab="journey"]:visible').first()).toBeVisible();

    await openTab(page, /Plan & reports/i);
    await expect(page.locator('[data-ng-tab="plan"]:visible').first()).toBeVisible();
    await expect(page.getByText(/weekly|report|reminder/i).first()).toBeVisible();
  });
});

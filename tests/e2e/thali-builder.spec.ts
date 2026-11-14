import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@thali Indian Plate Intelligence', () => {
  test('builds an Indian thali, suggests protein swaps, and hands off to food logging', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);
    const builder = page.locator('#ngThaliBuilder');
    await expect(builder).toBeVisible();
    await builder.locator('[data-thali-select="protein"]').selectOption('soya');
    await expect(builder.locator('#ngThaliResult')).toContainText('Protein-forward plate');
    await expect(builder.locator('#ngThaliResult')).toContainText('Soya chunk curry');
    await builder.getByRole('button', { name: 'Use in food log' }).click();
    await expect(page.locator('#nutritionFood')).toHaveValue(/Soya chunk curry/);
    await expect(page.locator('#nutritionCalories')).not.toHaveValue('');
  });
});

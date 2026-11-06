import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test('Indian food cards and nutrition lookup work', async ({ page }) => {
  await completeProfile(page);
  await openTab(page, /Food studio/i);
  await page.getByRole('button', { name: 'Indian favourites', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Chicken biryani' })).toBeVisible();
  await page.locator('#nutritionFood').fill('chicken biryani');
  await page.locator('#nutritionQuantity').fill('200');
  await page.locator('#nutritionQuantity').press('Tab');
  await expect(page.locator('#nutritionCalories')).toHaveValue('400');
  await expect(page.locator('#nutritionProtein')).toHaveValue('24.0');
  await expect(page.locator('#nutritionCarbs')).toHaveValue('48.0');
});

test('unknown food does not silently save zero values', async ({ page }) => {
  await completeProfile(page);
  await openTab(page, /Food studio/i);
  await page.locator('#nutritionFood').fill('unknown test dish');
  await page.locator('#nutritionQuantity').press('Tab');
  await page.getByRole('button', { name: 'Save food', exact: true }).click();
  await expect(page.getByText(/Food not found/i)).toBeVisible();
  await expect(page.getByText('No foods logged yet.', { exact: true })).toBeVisible();
});

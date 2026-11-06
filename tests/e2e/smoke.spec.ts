import { test, expect } from '@playwright/test';
import { completeProfile } from './helpers';

test('profile unlocks the main app tabs', async ({ page }) => {
  await completeProfile(page);
  await expect(page.getByRole('button', { name: /Home/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Food studio/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Exercise/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Journey/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Plan & reports/i })).toBeVisible();
});

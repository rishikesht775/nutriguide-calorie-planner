import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test('exercise card opens a guided checklist', async ({ page }) => {
  await completeProfile(page);
  await openTab(page, /Exercise/i);
  await page.getByRole('button', { name: 'Open Bodyweight squat details', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bodyweight squat' })).toBeVisible();
  await expect(page.getByText('0/4 steps', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Keep feet about shoulder-width apart/i }).click();
  await expect(page.getByText('1/4 steps', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start 60 sec timer', exact: true }).click();
  await expect(page.getByText(/60s remaining/)).toBeVisible();
});

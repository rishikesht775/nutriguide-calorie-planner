import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test('user chooses a story mode and moves through app sections', async ({ page }) => {
  await completeProfile(page);
  await openTab(page, /Journey/i);
  await expect(page.getByRole('heading', { name: 'How do you want to begin?' })).toBeVisible();
  await page.getByRole('button', { name: /Indian Plate Adventure/i }).click();
  await expect(page.getByText('Step 1 of 5')).toBeVisible();
  await expect(page.getByText('Home', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.getByText('Step 2 of 5')).toBeVisible();
  await expect(page.getByText('Food studio', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open Food studio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Food studio' })).toBeVisible();
});

test('story mode can be changed later', async ({ page }) => {
  await completeProfile(page);
  await openTab(page, /Journey/i);
  await page.getByRole('button', { name: /Mindful Reset/i }).click();
  await page.getByRole('button', { name: 'Change story mode', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'How do you want to begin?' })).toBeVisible();
});

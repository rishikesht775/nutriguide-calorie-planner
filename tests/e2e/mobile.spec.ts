import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

test('mobile tabs and story cards remain usable', async ({ page }) => {
  await completeProfile(page);
  await openTab(page, /Journey/i);
  await expect(page.getByRole('heading', { name: 'How do you want to begin?' })).toBeVisible();
  await page.getByRole('button', { name: /Steady Start/i }).click();
  await expect(page.getByRole('button', { name: 'Open Home', exact: true })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBeFalsy();
});

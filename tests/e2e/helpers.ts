import { expect, Page } from '@playwright/test';

export async function completeProfile(page: Page) {
  await page.goto('/legacy');
  await page.locator('#age').fill('30');
  await page.locator('#height').fill('170');
  await page.locator('#weight').fill('70');
  await page.getByRole('button', { name: 'Calculate my plan', exact: true }).click();
  await expect(page.getByRole('button', { name: /Food studio/i })).toBeVisible();
}

export async function openTab(page: Page, label: RegExp | string) {
  await page.getByRole('button', { name: label }).click();
}

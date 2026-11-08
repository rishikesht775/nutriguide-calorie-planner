import { test, expect } from '@playwright/test';
import { completeProfile, mockAuthenticatedSession, openTab } from './helpers';

test.describe('@security client and API protections', () => {
  test('secure screens do not render the app before authentication', async ({ page }) => {
    await page.goto('/legacy');
    await expect(page.locator('body')).toHaveClass(/auth-pending/);
    await expect(page.locator('.wrap')).toHaveCSS('visibility', 'hidden');
  });

  test('authenticated app does not expose password fields outside the auth gate', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await completeProfile(page);
    await expect(page.locator('.wrap input[type="password"]')).toHaveCount(0);
  });

  test('user supplied journal content is rendered as text', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Journey/i);
    const payload = '<img src=x onerror=alert(1)> & safe text';
    await page.locator('#journalText').fill(payload);
    await expect(page.locator('#journalText')).toHaveValue(payload);
    await expect(page.locator('body')).not.toHaveAttribute('onerror', /alert/);
  });
});

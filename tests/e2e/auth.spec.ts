import { test, expect } from '@playwright/test';

test.describe('@security @auth in-app authentication gate', () => {
  test('unauthenticated users start inside the app auth gate', async ({ page }) => {
    await page.goto('/legacy');
    await expect(page.locator('#appAuthGate')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Nourish.*Move.*Thrive/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveClass(/active/);
    await expect(page.locator('#gateNameWrap')).toBeHidden();
    await expect(page.locator('#gateName')).toBeDisabled();
  });

  test('name is requested only when creating an account', async ({ page }) => {
    await page.goto('/legacy');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await expect(page.locator('#gateNameWrap')).toBeVisible();
    await expect(page.locator('#gateName')).toBeEnabled();
    await expect(page.locator('#gateName')).toHaveAttribute('required', '');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.locator('#gateNameWrap')).toBeHidden();
    await expect(page.locator('#gateName')).toBeDisabled();
    await expect(page.locator('#gateName')).not.toHaveAttribute('required');
  });

  test('auth handoff does not place credentials in the URL', async ({ page }) => {
    await page.goto('/legacy');
    await page.locator('#gateEmail').fill('test@example.com');
    await page.locator('#gatePassword').fill('not-a-real-password');
    const requestPromise = page.waitForRequest(request => request.url().includes('/signin-with-chatgpt'));
    await page.getByRole('button', { name: /secure sign in/i }).click();
    const request = await requestPromise;
    expect(request.url()).not.toMatch(/password|not-a-real-password|test%40example/);
  });
});

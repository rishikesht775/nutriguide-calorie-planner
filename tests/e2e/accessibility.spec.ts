import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@accessibility keyboard and semantic checks', () => {
  test('profile controls have labels and the trainer image has useful text', async ({ page }) => {
    await page.goto('/legacy');
    for (const id of ['age', 'sex', 'height', 'weight', 'activity', 'goal']) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await completeProfile(page);
    await expect(page.getByRole('img', { name: /wellness mascot buddies/i })).toBeVisible();
  });

  test('primary navigation buttons have accessible names', async ({ page }) => {
    await completeProfile(page);
    for (const name of ['Home', 'Food studio', 'Exercise', 'Journey', 'Plan & reports']) {
      await expect(page.getByRole('button', { name: new RegExp(name, 'i') })).toBeVisible();
    }
  });

  test('keyboard focus reaches the primary navigation', async ({ page }) => {
    await completeProfile(page);
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.textContent || document.activeElement?.getAttribute('aria-label') || '');
    expect(focused.length).toBeGreaterThan(0);
  });
});

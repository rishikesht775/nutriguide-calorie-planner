import { test, expect } from '@playwright/test';
import { completeProfile, startFresh } from './helpers';

test.describe('@home-profile setup-gated Home and dedicated My Profile', () => {
  test('first-time users see setup Home with locked navigation and no profile button', async ({ page }) => {
    await startFresh(page);

    await expect(page.locator('#ngFirstLoginHome')).toBeVisible();
    await expect(page.locator('#ngHomeRedesign')).toBeHidden();
    await expect(page.locator('#ngHomeProfileButton')).toBeHidden();

    await expect(page.locator('.app-nav button[data-tab="home"]')).toBeEnabled();
    for (const tab of ['food', 'move', 'journey', 'plan']) {
      await expect(page.locator('.app-nav button[data-tab="' + tab + '"]')).toBeDisabled();
    }
  });

  test('completing setup unlocks regular Home and the single My Profile entry point', async ({ page }) => {
    await completeProfile(page);

    await expect(page.locator('#ngFirstLoginHome')).toBeHidden();
    await expect(page.locator('#ngHomeRedesign')).toBeVisible();
    await expect(page.locator('#ngHomeProfileButton')).toBeVisible();
    await expect(page.locator('#ngProfilePrompt')).toBeHidden();
    await expect(page.locator('.grid')).toBeHidden();

    for (const tab of ['food', 'move', 'journey', 'plan']) {
      await expect(page.locator('.app-nav button[data-tab="' + tab + '"]')).toBeEnabled();
    }
  });

  test('My Profile opens as an isolated page with all profile sections', async ({ page }) => {
    await completeProfile(page);
    await page.locator('#ngHomeProfileButton').click();

    await expect(page.locator('#ngProfilePage')).toBeVisible();
    await expect(page.locator('#ngHomeRedesign')).toBeHidden();
    await expect(page.locator('[data-ng-profile-panel="overview"]')).toBeVisible();

    for (const tab of ['details', 'goals', 'preferences', 'connections', 'privacy']) {
      await page.locator('[data-ng-profile-tab="' + tab + '"]').click();
      await expect(page.locator('[data-ng-profile-panel="' + tab + '"]')).toBeVisible();
    }

    await page.locator('#ngProfileBack').click();
    await expect(page.locator('#ngProfilePage')).toBeHidden();
    await expect(page.locator('#ngHomeRedesign')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@smoke core availability', () => {
  test('desktop sidebar stays clear of lower Home content after profile gate changes', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) <= 760, 'desktop sidebar layout only');
    await completeProfile(page);
    const geometry = await page.evaluate(() => {
      document.body.classList.remove('post-profile');
      window.scrollTo(0, document.documentElement.scrollHeight);
      const sidebar = document.querySelector('.app-nav')!.getBoundingClientRect();
      const home = document.querySelector('#ngHomeRedesign')!.getBoundingClientRect();
      return { sidebarRight: sidebar.right, homeLeft: home.left };
    });
    expect(geometry.homeLeft).toBeGreaterThanOrEqual(geometry.sidebarRight);
  });

  test('profile unlocks all primary tabs', async ({ page }) => {
    await completeProfile(page);
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) {
      const tab = page.locator('.app-nav button:visible, #ng-phase2-demo .ng-nav button:visible')
        .filter({ hasText: label })
        .first();
      await expect(tab).toBeVisible();
    }
  });

  test('primary tabs open without a page error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await completeProfile(page);
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) {
      await openTab(page, label);
    }
    expect(errors).toEqual([]);
  });
});

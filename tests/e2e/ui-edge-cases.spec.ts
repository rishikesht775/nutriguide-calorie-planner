import { test, expect } from '@playwright/test';
import { completeProfile, openTab, startFresh } from './helpers';

const desktopWidths = [761, 768, 1024, 1440];
const tabs: RegExp[] = [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i];

async function expectHomeSidebarClearance(page: import('@playwright/test').Page) {
  const geometry = await page.evaluate(() => {
    const side = document.querySelector('#ng-phase2-demo .ng-side');
    const main = document.querySelector('#ng-phase2-demo .ng-main');
    if (!side || !main) return null;
    return { side: side.getBoundingClientRect().toJSON(), main: main.getBoundingClientRect().toJSON() };
  });
  expect(geometry, 'the rendered Home shell should expose its side navigation and main content').not.toBeNull();
  expect(geometry!.side.right, 'Home main content starts after the side menu').toBeLessThanOrEqual(geometry!.main.left + 1);
}

test.describe('@ui @edge responsive states and sidebar geometry', () => {
  for (const width of desktopWidths) {
    test(`${width}px: sidebar stays clear during setup, tab changes, scrolling and profile view`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await startFresh(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
      await completeProfile(page);
      await expect(page.locator('#ng-phase2-demo .ng-side')).toBeVisible();
      for (const scrollRatio of [0, 0.5, 1]) {
        await page.evaluate((ratio) => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, max * ratio);
        }, scrollRatio);
        await expectHomeSidebarClearance(page);
      }
      for (const label of tabs) {
        await openTab(page, label);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${label} at ${width}px`).toBeLessThanOrEqual(1);
      }
    });
  }

  for (const width of [320, 390, 768, 1440]) {
    test(`${width}px: profile panels remain visible without horizontal page overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await completeProfile(page);
      await page.locator('#ng-demo-profile').click();

      for (const profileTab of ['overview', 'details', 'goals', 'preferences', 'connections', 'privacy']) {
        const tab = page.locator(`[data-ng-profile-tab="${profileTab}"]`);
        await tab.scrollIntoViewIfNeeded();
        await tab.click();
        await expect(tab).toHaveClass(/active/);
        const panel = page.locator(`[data-ng-profile-panel="${profileTab}"]:visible`);
        await expect(panel).toBeVisible();
        const panelBox = await panel.boundingBox();
        expect(panelBox, `${profileTab} panel needs rendered bounds`).not.toBeNull();
        expect(panelBox!.x, `${profileTab} panel starts inside viewport`).toBeGreaterThanOrEqual(-1);
        expect(panelBox!.x + panelBox!.width, `${profileTab} panel ends inside viewport`).toBeLessThanOrEqual(width + 1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${profileTab} panel causes horizontal overflow`).toBeLessThanOrEqual(1);
      }
    });
  }

  test('resizing across the mobile navigation breakpoint keeps every tab usable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await completeProfile(page);

    for (const width of [1440, 761, 760, 390, 320, 768, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      for (const label of tabs) {
        await openTab(page, label);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
          `${width}px ${label} after viewport resize`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});

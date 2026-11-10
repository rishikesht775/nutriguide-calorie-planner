import { test, expect } from '@playwright/test';
import { completeProfile, openTab, chooseGuide, startFresh } from './helpers';

test.describe('@regression @ui retired festival theme', () => {
 test('festival runtime and decorations stay removed across all tabs', async ({ page }) => {
  await completeProfile(page);
  for (const name of [/Home/i,/Food studio/i,/Exercise/i,/Journey/i,/Plan & reports/i]) {
   await openTab(page,name);
   await expect(page.locator('body')).not.toHaveClass(/diwali/);
   await expect(page.locator('.ng-diwali-welcome,.ng-diwali-live-ticker,.ng-firework-canvas')).toHaveCount(0);
  }
  await expect(page.locator('script[src="/nutri-upgrade.js"]')).toHaveCount(0);
 });
});

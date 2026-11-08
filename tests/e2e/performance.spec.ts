import { test, expect } from '@playwright/test';
import { completeProfile, openTab } from './helpers';

test.describe('@performance navigation and interaction budgets', () => {
  test('initial app load completes within the release budget', async ({ page }) => {
    await page.goto('/legacy');
    const timing = await page.evaluate(() => {
      const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { response: entry.responseEnd, dom: entry.domContentLoadedEventEnd, load: entry.loadEventEnd };
    });
    expect(timing.response).toBeLessThan(5000);
    expect(timing.dom).toBeLessThan(8000);
  });

  test('primary tabs respond without long synchronous stalls', async ({ page }) => {
    await completeProfile(page);
    const durations: number[] = [];
    for (const label of [/Home/i, /Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) {
      const start = Date.now();
      await openTab(page, label);
      durations.push(Date.now() - start);
    }
    expect(Math.max(...durations)).toBeLessThan(2500);
  });

  test('page stays scrollable after all major sections are opened', async ({ page }) => {
    await completeProfile(page);
    for (const label of [/Food studio/i, /Exercise/i, /Journey/i, /Plan & reports/i]) await openTab(page, label);
    const metrics = await page.evaluate(() => ({ scrollHeight: document.documentElement.scrollHeight, clientHeight: document.documentElement.clientHeight }));
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  });
});

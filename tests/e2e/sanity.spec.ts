import { test, expect } from '@playwright/test';
import { completeProfile, openTab, chooseGuide, startFresh } from './helpers';

test.describe('@sanity release gate', () => {
 test('profile, trainer, nutrition and reports are usable', async ({page}) => {
  await completeProfile(page); await chooseGuide(page);
  await openTab(page,/Exercise/i);
  await expect(page.locator('#ngTrainerHub')).toBeVisible();
  await page.getByRole('button',{name:'Start session',exact:true}).click();
  await expect(page.locator('#ngTrainerSession')).toBeVisible();
  await openTab(page,/Food studio/i);
  await expect(page.locator('#nutritionFood')).toBeEditable();
  await openTab(page,/Plan & reports/i);
  await expect(page.locator('.weekly-report')).toBeVisible();
 });
});

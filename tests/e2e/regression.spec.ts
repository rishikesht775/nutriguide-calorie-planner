import { test, expect } from '@playwright/test';
import { completeProfile, openTab, chooseGuide, startFresh } from './helpers';

test.describe('@regression reported failures', () => {
 test('Journey and reports remain clickable after repeat navigation', async ({page}) => {
  await completeProfile(page);
  for(let i=0;i<3;i++){await openTab(page,/Journey/i);await expect(page.locator('.journey')).toBeVisible();await openTab(page,/Plan & reports/i);await expect(page.locator('.weekly-report')).toBeVisible();}
 });
 test('guide changes update banner and persist',async({page})=>{
  await completeProfile(page);await chooseGuide(page,/Fresh-start kid Food buddy Gentle beginnings/);
  await expect(page.locator('#coachName')).toHaveText('Fresh-start kid');
  await page.reload();await expect(page.locator('#coachName')).toHaveText('Fresh-start kid');
 });
 test('exercise dialog opens above navigation and closes',async({page})=>{
  await completeProfile(page);await openTab(page,/Exercise/i);
  await page.locator('[data-exercise-index="1"]').click();
  await expect(page.locator('#exerciseModal')).toBeVisible();
  await page.locator('#exerciseModal .close').click();
  await expect(page.locator('#exerciseModal')).toBeHidden();
 });
});

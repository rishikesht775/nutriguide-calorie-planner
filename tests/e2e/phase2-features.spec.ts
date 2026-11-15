import {expect,test} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@phase2 Phase 2 integrated features',()=>{
 test('Home shows Wellness Compass with the complete demo layout',async({page})=>{
  await completeProfile(page);await openTab(page,/Home/i);
  await expect(page.locator('#ng-phase2-demo')).toBeVisible();
  await expect(page.locator('#ng-home-final')).toContainText('Your Wellness Compass');
  await page.locator('#fh-companion-button').click();
  await page.locator('[data-fh-companion="Mithai fox"]').click();
  await expect(page.locator('#fh-companion')).toHaveText('Mithai fox');
 });
 test('Food Studio shows adaptive plan and grocery handoff',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);
  await expect(page.locator('#ngPhase2FoodPlan')).toBeVisible();
  await page.locator('[data-ng-phase2-action="grocery"]').click();
  await expect(page.locator('#ngPhase2GroceryStatus')).toHaveText('24 of 24 items ready');
 });
 test('Exercise includes readiness based recommendations',async({page})=>{
  await completeProfile(page);await openTab(page,/Exercise/i);
  await expect(page.locator('#ngPhase2Exercise')).toBeVisible();
  await expect(page.locator('#ngPhase2Exercise')).toContainText('Movement matched to your readiness');
 });
 test('Journey includes private challenges',async({page})=>{
  await completeProfile(page);await openTab(page,/Journey/i);
  await expect(page.locator('#ngPhase2Challenges')).toBeVisible();
  const join=page.locator('[data-ng-phase2-action="challenge"]').first();await join.click();await expect(join).toHaveText('Joined');
 });
 test('Plan and Reports includes explainable insights',async({page})=>{
  await completeProfile(page);await openTab(page,/Plan & reports/i);
  await expect(page.locator('#ngPhase2Insights')).toBeVisible();
  await expect(page.locator('#ngPhase2Insights')).toContainText('Why your target changed');
 });
 test('My Profile includes connections and privacy',async({page})=>{
  await completeProfile(page);await page.locator('#ng-demo-profile').click();
  await expect(page.locator('[data-ng-profile-panel=connections]')).toBeVisible();
  await expect(page.locator('[data-ng-profile-panel=connections]')).toContainText('Connected data');
 });
});


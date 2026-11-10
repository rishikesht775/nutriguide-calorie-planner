import {test,expect} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@functional @integration @regression shared profile defaults',()=>{
 test('profile automatically fills meal plan, protein target, training and all-tab context',async({page})=>{
  await completeProfile(page,{height:'168',weight:'84',activity:'1.375',goal:'loss'});
  await expect(page.locator('#cal')).toHaveText('1950 kcal');await expect(page.locator('#protein')).toHaveText('118 g');
  for(const tab of [/Home/i,/Food studio/i,/Exercise/i,/Journey/i,/Plan & reports/i]){
   await openTab(page,tab);await expect(page.locator('#ngSharedTargets')).toContainText('1950 kcal');await expect(page.locator('#ngSharedTargets')).toContainText('118 g protein');await expect(page.locator('#ngSharedTargets')).toContainText('BMI 29.8');
  }
  await openTab(page,/Food studio/i);await expect(page.locator('#ngWeeklyPlan .ng-day')).toHaveCount(7);await expect(page.locator('#proteinTarget')).toHaveValue('118');
  await openTab(page,/Exercise/i);await expect(page.locator('#ngTrainerGoal')).toHaveValue('balanced');await expect(page.locator('#ngTrainerDuration')).toHaveValue('20');
 });
 test('shared edits propagate to every tab and survive refresh',async({page})=>{
  await completeProfile(page);await page.locator('.ng-guide-options summary').click();await page.locator('#ngPersonalCalories').fill('2100');await page.locator('#ngPersonalProtein').fill('125');await page.getByRole('button',{name:'Save shared targets',exact:true}).click();
  await openTab(page,/Food studio/i);await expect(page.locator('#proteinTarget')).toHaveValue('125');await expect(page.locator('#ngMealPlanSource')).toContainText('2100 kcal');
  await page.reload();await expect(page.locator('#ngSharedTargets')).toContainText('2100 kcal');await expect(page.locator('#ngSharedTargets')).toContainText('125 g protein');
 });
 test('profile update refreshes automatic defaults but preserves manual meal and workout edits',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.getByRole('button',{name:'Generate 7-day plan',exact:true}).click();const before=await page.locator('#ngWeeklyPlan').textContent();
  await openTab(page,/Exercise/i);await page.locator('#ngTrainerGoal').selectOption('cardio');await page.locator('#ngTrainerSetting').selectOption('gym');await page.locator('#ngTrainerDuration').selectOption('30');
  await openTab(page,/Home/i);await page.locator('#weight').fill('80');await page.locator('#goal').selectOption('gain');await page.getByRole('button',{name:'Calculate my plan',exact:true}).click();
  await openTab(page,/Food studio/i);await expect(page.locator('#ngWeeklyPlan')).toHaveText(before||'');await expect(page.locator('#ngMealPlanSource')).toContainText('saved meal plan is kept');
  await openTab(page,/Exercise/i);await expect(page.locator('#ngTrainerGoal')).toHaveValue('cardio');await expect(page.locator('#ngTrainerDuration')).toHaveValue('30');await expect(page.locator('#ngTrainerSetting')).toHaveValue('gym');
  await page.getByRole('button',{name:'Use profile workout',exact:true}).click();await expect(page.locator('#ngTrainerGoal')).toHaveValue('strength');
 });
 test('protein target edit in Food changes the shared plan',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#proteinTarget').fill('135');await page.locator('#proteinTarget').press('Tab');await openTab(page,/Home/i);await expect(page.locator('#protein')).toHaveText('135 g');await expect(page.locator('#ngSharedTargets')).toContainText('135 g protein');
 });
 test('readiness changes recommendations while preserving a custom workout',async({page})=>{
  await completeProfile(page);await openTab(page,/Exercise/i);await page.getByRole('button',{name:'Low energy',exact:true}).click();await expect(page.locator('#ngTrainerGoal')).toHaveValue('mobility');await expect(page.locator('#ngTrainerDuration')).toHaveValue('10');
  await page.locator('#ngTrainerGoal').selectOption('strength');await page.getByRole('button',{name:'Sore / take it easy',exact:true}).click();await expect(page.locator('#ngTrainerGoal')).toHaveValue('strength');await expect(page.locator('#ngTrainingSource')).toHaveText('Your saved workout');
 });
 test('guide changes next action from real logs rather than marking generated meals done',async({page})=>{
  await completeProfile(page);await expect(page.locator('#ngGuideNextTitle')).toHaveText('Start with a food log');await expect(page.getByRole('button',{name:'Food logged: open',exact:true})).toBeVisible();
  await page.locator('#ngGuideNext').click();await page.locator('#nutritionFood').fill('dal');await page.getByRole('button',{name:'Save food',exact:true}).click();
  await openTab(page,/Home/i);await expect(page.getByRole('button',{name:'Food logged: completed',exact:true})).toBeVisible();await expect(page.locator('#ngGuideNextTitle')).toHaveText('Make time for comfortable movement');
 });
 test('reset shared targets uses the latest profile without deleting logs',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#nutritionFood').fill('dal');await page.getByRole('button',{name:'Save food',exact:true}).click();
  await page.locator('.ng-guide-options summary').click();await page.locator('#ngPersonalProtein').fill('140');await page.getByRole('button',{name:'Save shared targets',exact:true}).click();await page.getByRole('button',{name:'Use profile targets',exact:true}).click();await expect(page.locator('#proteinTarget')).toHaveValue('98');await expect(page.locator('#nutritionCalTotal')).toHaveText('116');
 });
});

test('@regression Home calculation replaces fixed 125g on results and every tab',async({page})=>{
 await completeProfile(page);await openTab(page,/Food studio/i);
 await page.locator('#proteinTarget').fill('125');await page.locator('#proteinTarget').press('Tab');
 await openTab(page,/Home/i);await expect(page.locator('#protein')).toHaveText('125 g');
 await page.locator('#weight').fill('70');await page.getByRole('button',{name:'Calculate my plan',exact:true}).click();
 await expect(page.locator('#protein')).toHaveText('98 g');
 for(const tab of [/Home/i,/Food studio/i,/Exercise/i,/Journey/i,/Plan & reports/i]){await openTab(page,tab);await expect(page.locator('#ngSharedTargets')).toContainText('98 g protein');}
 await page.reload();await openTab(page,/Home/i);await expect(page.locator('#protein')).toHaveText('98 g');
});

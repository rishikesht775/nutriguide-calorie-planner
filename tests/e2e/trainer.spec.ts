import {test,expect} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@functional @integration @regression trainer sessions',()=>{
 test.beforeEach(async({page})=>{await completeProfile(page);await openTab(page,/Exercise/i);});
 for(const [goal,first] of [['balanced','Brisk walking'],['strength','Bodyweight squat'],['cardio','Brisk walking'],['mobility','Cat-cow mobility']]){
  test(`${goal} builds the selected plan`,async({page})=>{
   await page.locator('#ngTrainerGoal').selectOption(goal);
   await page.getByRole('button',{name:'Start session',exact:true}).click();
   await expect(page.locator('#ngTrainerExercise')).toHaveText(first);
   await expect(page.locator('#ngTrainerStep')).toHaveText('Step 1 of 4');
  });
 }
 for(const minutes of ['10','20','30']){
  test(`${minutes}-minute gym session has a consistent title and step count`,async({page})=>{
   await page.locator('#ngTrainerSetting').selectOption('gym');await page.locator('#ngTrainerDuration').selectOption(minutes);
   await page.getByRole('button',{name:'Start session',exact:true}).click();
   await expect(page.locator('#ngTrainerPlanTitle')).toContainText(`${minutes} minute plan`);
   await expect(page.locator('#ngTrainerStep')).toHaveText(`Step 1 of ${minutes==='10'?2:minutes==='30'?5:4}`);
  });
 }
 test('pause freezes timer and resume continues',async({page})=>{
  await page.clock.install();await page.getByRole('button',{name:'Start session',exact:true}).click();
  await page.clock.runFor(2000);await expect(page.locator('#ngTrainerTimer')).toHaveText('04:58');
  await page.getByRole('button',{name:'Pause',exact:true}).click();await page.clock.runFor(5000);
  await expect(page.locator('#ngTrainerTimer')).toHaveText('04:58');await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.clock.runFor(1000);await expect(page.locator('#ngTrainerTimer')).toHaveText('04:57');
 });
 test('timer advances automatically to next exercise',async({page})=>{
  await page.clock.install();await page.getByRole('button',{name:'Start session',exact:true}).click();await page.clock.runFor(300000);
  await expect(page.locator('#ngTrainerStep')).toHaveText('Step 2 of 4');
 });
 test('last next completes a session and saves history after reload',async({page})=>{
  await page.locator('#ngTrainerDuration').selectOption('10');await page.getByRole('button',{name:'Start session',exact:true}).click();
  await page.getByRole('button',{name:'Next exercise',exact:true}).click();await page.getByRole('button',{name:'Next exercise',exact:true}).click();
  await expect(page.locator('#ngTrainerStatus')).toHaveText('Session complete ✓');
  await expect(page.locator('#ngTrainerHistory span')).toHaveCount(1);await page.reload();await openTab(page,/Exercise/i);
  await expect(page.locator('#ngTrainerHistory span')).toHaveCount(1);
 });
 test('@edge finishing twice must not duplicate history',async({page})=>{
  await page.getByRole('button',{name:'Start session',exact:true}).click();
  await page.getByRole('button',{name:'Finish session',exact:true}).click();await page.getByRole('button',{name:'Finish session',exact:true}).click();
  await expect(page.locator('#ngTrainerHistory span')).toHaveCount(1);
 });
 test('@edge starting again resets progress without duplicate active timers',async({page})=>{
  await page.clock.install();await page.getByRole('button',{name:'Start session',exact:true}).click();await page.getByRole('button',{name:'Next exercise',exact:true}).click();
  await page.getByRole('button',{name:'Start session',exact:true}).click();await page.clock.runFor(1000);
  await expect(page.locator('#ngTrainerStep')).toHaveText('Step 1 of 4');await expect(page.locator('#ngTrainerTimer')).toHaveText('04:59');
 });
 test('corrupt history does not prevent starting training',async({page})=>{
  await page.evaluate(()=>localStorage.setItem('ngTrainerHistory','not-json'));await page.reload();await openTab(page,/Exercise/i);
  await page.getByRole('button',{name:'Start session',exact:true}).click();await expect(page.locator('#ngTrainerSession')).toBeVisible();
 });
});

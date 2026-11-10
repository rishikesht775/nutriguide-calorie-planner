import { test, expect } from '@playwright/test';
import { completeProfile, openTab, chooseGuide, startFresh } from './helpers';

test.describe('@uat user acceptance',()=>{
 test('beginner chooses home mobility and finishes a session',async({page})=>{
  await completeProfile(page);await openTab(page,/Exercise/i);await page.locator('#ngTrainerGoal').selectOption('mobility');await page.locator('#ngTrainerDuration').selectOption('10');await page.getByRole('button',{name:'Start session',exact:true}).click();await expect(page.locator('#ngTrainerExercise')).toHaveText('Cat-cow mobility');await page.getByRole('button',{name:'Finish session',exact:true}).click();await expect(page.locator('#ngTrainerHistory')).toContainText('Mobility');
 });
 test('story can start and be changed',async({page})=>{await completeProfile(page);await openTab(page,/Journey/i);await page.getByRole('button',{name:/Steady Start/}).click();await expect(page.locator('#journeyStepLabel')).toHaveText('Step 1 of 5');await page.getByRole('button',{name:'Change story mode',exact:true}).click();await expect(page.locator('#storyModeGrid')).toBeVisible();});
});

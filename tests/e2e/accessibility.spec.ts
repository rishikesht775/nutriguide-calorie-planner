import {test,expect} from '@playwright/test';
import {completeProfile,openTab,startFresh} from './helpers';

test.describe('@accessibility keyboard and semantic checks',()=>{
 test('profile inputs have programmatically associated labels',async({page})=>{
  await startFresh(page);
  const steps=[[['age','Age'],['sex','Sex']],[['height','Height'],['weight','Weight']],[['activity','Activity level']],[['goal','Goal']]];
  const next=page.locator('.ng-profile-next:visible');
  for(let i=0;i<steps.length;i++){
   for(const [id,label] of steps[i]){await expect(page.locator('#'+id)).toBeVisible();await expect(page.locator('#'+id)).toHaveAccessibleName(new RegExp(label,'i'));}
   if(i===0){await page.locator('#age').fill('30');await page.locator('#sex').selectOption('male');}
   if(i===1){await page.locator('#height').fill('170');await page.locator('#weight').fill('70');}
   if(i===2)await page.locator('#activity').selectOption('1.375');
   if(i<steps.length-1){await expect(next).toBeVisible();await next.click();await expect(page.locator('#'+steps[i+1][0][0])).toBeVisible();}
  }
 });
 test('navigation exposes meaningful names and receives keyboard focus',async({page})=>{
  await completeProfile(page);
  for(const name of ['Home','Food studio','Exercise','Journey','Plan & reports'])await expect(page.locator('.app-nav').getByRole('button',{name:new RegExp(name,'i')})).toBeVisible();
  await page.locator('.app-nav button').first().focus();await expect(page.locator('.app-nav button').first()).toBeFocused();await page.keyboard.press('Tab');await expect(page.locator('.app-nav button').nth(1)).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('.food-nutrition')).toBeVisible();
 });
 test('trainer selects are labelled and keyboard-operable',async({page})=>{
  await completeProfile(page);await openTab(page,/Exercise/i);
  await expect(page.locator('#ngTrainerGoal')).toHaveAccessibleName('Goal');await expect(page.locator('#ngTrainerSetting')).toHaveAccessibleName('Setting');
  await page.getByRole('button',{name:'Start session',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('#ngTrainerSession')).toBeVisible();
 });
 test('exercise modal supports dialog semantics and Escape dismissal',async({page})=>{
  await completeProfile(page);await openTab(page,/Exercise/i);await page.locator('[data-exercise-index="1"]').click();
  await expect(page.locator('#exerciseModal')).toHaveAttribute('role','dialog');await expect(page.locator('#exerciseModal')).toHaveAttribute('aria-modal','true');
  await page.keyboard.press('Escape');await expect(page.locator('#exerciseModal')).toBeHidden();
 });
 test('informative images provide nonempty alt text',async({page})=>{
  await completeProfile(page);
  const missing=await page.locator('img').evaluateAll(els=>els.filter(el=>!el.hasAttribute('alt')).map(el=>(el as HTMLImageElement).src));expect(missing).toEqual([]);
 });
});

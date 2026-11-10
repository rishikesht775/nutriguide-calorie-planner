import {test,expect} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@integration cloud-sync client contract (mock server)',()=>{
 test('profile is sent to cloud and success is shown',async({page})=>{
  await completeProfile(page);const writes:any[]=[];
  await page.route('**/api/state',r=>{if(r.request().method()==='POST')writes.push(r.request().postDataJSON());return r.fulfill({json:r.request().method()==='POST'?{saved:true}:{authenticated:true,state:{}}});});
  await page.reload();await expect.poll(()=>writes.length).toBeGreaterThan(0);
  expect(writes.at(-1).state.profile.weight).toBe('70');await expect(page.locator('#cloud-sync-status')).toHaveText('Cloud synced');
 });
 test('server failure shows pending sync then retries successfully',async({page})=>{
  await completeProfile(page);let fail=true;
  await page.route('**/api/state',r=>r.fulfill({status:r.request().method()==='POST'&&fail?503:200,json:r.request().method()==='POST'?{saved:!fail}:{state:{}}}));
  await page.reload();await expect(page.locator('#cloud-sync-status')).toHaveText('Cloud sync waiting');fail=false;
  await expect(page.locator('#cloud-sync-status')).toHaveText('Cloud synced',{timeout:12000});
 });
 test('remote profile hydrates the visible form',async({page})=>{
  await completeProfile(page);await page.route('**/api/state',r=>r.fulfill({json:r.request().method()==='GET'?{state:{profile:{age:'35',sex:'female',height:'165',weight:'65',activity:'1.2',goal:'maintain'}}}:{saved:true}}));
  await page.reload();await expect(page.locator('#weight')).toHaveValue('65');await expect(page.locator('#age')).toHaveValue('35');
 });
 test('new planner and trainer keys are included in cloud save payload',async({page})=>{
  await completeProfile(page);await page.evaluate(()=>{localStorage.setItem('ngMeals',JSON.stringify([{day:'Today',name:'Dal'}]));localStorage.setItem('ngGroceries',JSON.stringify(['Oats']));localStorage.setItem('ngTrainerHistory',JSON.stringify([{goal:'Mobility',duration:10,date:'2030-01-01'}]));});
  const writes:any[]=[];await page.route('**/api/state',r=>{if(r.request().method()==='POST')writes.push(r.request().postDataJSON());return r.fulfill({json:r.request().method()==='POST'?{saved:true}:{state:{}}});});await page.reload();
  await expect.poll(()=>writes.length).toBeGreaterThan(0);expect(writes.at(-1).state).toHaveProperty('ngMeals');expect(writes.at(-1).state).toHaveProperty('ngGroceries');expect(writes.at(-1).state).toHaveProperty('ngTrainerHistory');
 });
});

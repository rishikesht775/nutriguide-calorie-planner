import {test,expect} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@security storage and auth boundaries',()=>{
 test('anonymous user cannot see app content',async({page})=>{
  await page.route('**/api/me',r=>r.fulfill({json:{authenticated:false,user:null}}));await page.goto('/legacy');
  await expect(page.locator('#appAuthGate')).toBeVisible();await expect(page.locator('.wrap')).toHaveCSS('visibility','hidden');
 });
 for(const target of ['journal','meal','grocery'])test(`persisted ${target} text cannot execute markup`,async({page})=>{
  await completeProfile(page);
  const payload='<img src=x onerror="window.__xss=1">';
  if(target==='journal'){await openTab(page,/Journey/i);await page.locator('#journalText').fill(payload);await page.getByRole('button',{name:'Save journal entry',exact:true}).click();}
  else{const input=target==='meal'?'#ngMealName':'#ngGroceryName';await page.locator(input).fill(payload);await page.locator('.ng-smart-card').nth(target==='meal'?0:1).getByRole('button',{name:'Add',exact:true}).click();}
  const container=target==='journal'?'#timeline':target==='meal'?'#ngMealList':'#ngGroceryList';
  await expect(page.locator(container)).toContainText(payload);await expect(page.locator(`${container} img`)).toHaveCount(0);
  expect(await page.evaluate(()=>(window as any).__xss)).toBeUndefined();
  await page.reload();if(target==='journal')await openTab(page,/Journey/i);
  await expect(page.locator(`${container} img`)).toHaveCount(0);expect(await page.evaluate(()=>(window as any).__xss)).toBeUndefined();
 });
 test('password is never written to browser storage during auth handoff',async({page})=>{
  await page.route('**/api/me',r=>r.fulfill({json:{authenticated:false,user:null}}));await page.route('**/signin-with-chatgpt**',r=>r.fulfill({status:200,body:'Test auth handoff'}));
  await page.goto('/legacy');await page.locator('#gateEmail').fill('qa@example.test');await page.locator('#gatePassword').fill('test-secret-54321');
  const req=page.waitForRequest('**/signin-with-chatgpt**');await page.locator('#gateSubmit').click();const r=await req;
  expect(r.url()).not.toContain('test-secret');expect(r.postData()||'').not.toContain('test-secret');
  expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain('test-secret');
 });
});

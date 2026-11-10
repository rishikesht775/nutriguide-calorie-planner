import { test, expect } from '@playwright/test';
test.describe('@security @auth honest provider account flow',()=>{
 test.beforeEach(async({page})=>{await page.route('**/api/me',r=>r.fulfill({json:{authenticated:false,user:null}}));await page.goto('/legacy');});
 test('one real sign-in link replaces fake sign-in/sign-up mode buttons',async({page})=>{
  await expect(page.locator('#appAuthGate')).toBeVisible();await expect(page.locator('#appAuthGate input[type=password]')).toHaveCount(0);
  await expect(page.locator('#gateSignIn,#gateSignUp')).toHaveCount(0);await expect(page.locator('#gateSubmit')).toHaveAttribute('target','_top');await expect(page.locator('#gateSubmit')).toHaveAttribute('href',/\/signin-with-chatgpt\?return_to=%2Flegacy.html$/);
 });
 test('the account flow is explained accurately',async({page})=>{
  await expect(page.locator('#appAuthGate')).toContainText('no separate NutriGuide password');
  const isLocal=['localhost','127.0.0.1','[::1]'].includes(new URL(page.url()).hostname);
  if(isLocal){await expect(page.locator('#gateSubtitle')).toContainText('local preview does not create accounts');await expect(page.locator('#gateSubmit')).toHaveText('Open live account sign-in');}else await expect(page.locator('#gateSubmit')).toHaveText('Sign in with ChatGPT');
 });
 test('click uses top-level provider navigation and a fixed safe return path',async({page})=>{
  await page.route('**/signin-with-chatgpt**',r=>r.fulfill({body:'Test provider handoff'}));const request=page.waitForRequest('**/signin-with-chatgpt**');await page.locator('#gateSubmit').click();const req=await request,url=new URL(req.url());expect(url.pathname).toBe('/signin-with-chatgpt');expect(url.searchParams.get('return_to')).toBe('/legacy.html');expect(req.method()).toBe('GET');expect(req.postData()).toBeNull();
 });
 test('failed identity check stays gated and can be retried',async({page})=>{
  let fail=true;await page.route('**/api/me',r=>r.fulfill({status:fail?503:200,json:{authenticated:false,user:null}}));await page.reload();await expect(page.locator('#gateStatus')).toContainText('Could not check');await expect(page.locator('.wrap')).toHaveCSS('visibility','hidden');fail=false;await page.locator('#gateRetry').click();await expect(page.locator('#gateRetry')).toBeHidden();await expect(page.locator('#gateStatus')).not.toContainText('Could not check');
 });
 test('provider link remains available with JavaScript disabled',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});try{const p=await context.newPage();await p.goto((baseURL||'http://127.0.0.1:5173')+'/legacy');await expect(p.locator('#gateSubmit')).toBeVisible();await expect(p.locator('#gateSubmit')).toHaveAttribute('target','_top');}finally{await context.close()}
 });
});

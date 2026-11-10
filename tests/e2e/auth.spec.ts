import { test, expect } from '@playwright/test';
test.describe('@security @auth secure platform sign-in',()=>{
 test.beforeEach(async({page})=>{await page.route('**/api/me',r=>r.fulfill({json:{authenticated:false,user:null}}));await page.goto('/legacy');});
 test('sign-in gate explains platform handoff without collecting credentials',async({page})=>{
  await expect(page.locator('#appAuthGate')).toBeVisible();await expect(page.getByRole('heading',{name:/Nourish.*Move.*Thrive/})).toBeVisible();
  await expect(page.locator('#appAuthGate input[type=password]')).toHaveCount(0);await expect(page.locator('#gateSubmit')).toHaveText('Continue with secure account');
 });
 test('sign-up intent changes heading without claiming a direct password service',async({page})=>{
  await page.locator('#gateSignUp').click();await expect(page.locator('#gateTitle')).toHaveText('Create your wellness account');await page.locator('#gateSignIn').click();await expect(page.locator('#gateTitle')).toHaveText('Welcome back');
 });
 test('handoff uses fixed same-origin return path',async({page})=>{
  await page.route('**/signin-with-chatgpt**',r=>r.fulfill({body:'Test handoff'}));const request=page.waitForRequest('**/signin-with-chatgpt**');await page.locator('#gateSubmit').click();const url=new URL((await request).url());expect(url.pathname).toBe('/signin-with-chatgpt');expect(url.searchParams.get('return_to')).toBe('/legacy.html');expect(url.search).not.toMatch(/password|email/);
 });
});

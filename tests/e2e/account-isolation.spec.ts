import {test, expect} from '@playwright/test';

test('new account starts empty and returning account keeps its own profile', async ({page}) => {
  let account = 'alice';
  const states: Record<string, Record<string, unknown>> = {
    alice: {profile: {age:'30', sex:'male', height:'170', weight:'70', activity:'1.375', goal:'loss'}, water:7},
    bob: {},
  };
  await page.route('**/api/me', route => route.fulfill({json:{authenticated:true,user:{id:account,email:`${account}@example.test`}}}));
  await page.route('**/api/state', async route => {
    if(route.request().method()==='POST') states[account]=route.request().postDataJSON().state;
    await route.fulfill({json:route.request().method()==='POST'?{saved:true}:{state:states[account]}});
  });
  await page.goto('/legacy');
  await expect(page.locator('body')).not.toHaveClass(/auth-pending/);
  await expect(page.locator('#weight')).toHaveValue('70');
  account='bob';
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/auth-pending/);
  await expect(page.locator('body')).toHaveClass(/needs-profile/);
  await expect(page.locator('#weight')).toHaveValue('');
  await expect(page.locator('#ngTodayCal')).toHaveText('—');
  await expect(page.locator('#ngTodayCalHint')).toContainText('Complete your profile');
  await expect(page.locator('#ngTodayProteinHint')).toContainText('Complete your profile');
  await expect(page.locator('#proteinTarget')).toHaveValue('');
  expect(await page.locator('#ngWeeklyPlan .ng-day').count()).toBe(0);
  expect(await page.locator('#ngMealList').textContent()).toMatch(/No meals planned yet|Your first meal starts your journey/i);
  expect(await page.locator('#ngGroceryList').textContent()).toMatch(/empty|Your pantry is ready for a fresh start/i);
  const bobStorage=await page.evaluate(()=>({profile:localStorage.getItem('profile'),water:localStorage.getItem('water'),owner:localStorage.getItem('_ngCloudOwner')}));
  expect(bobStorage.profile).toBeNull();
  expect(Number(bobStorage.water)).toBe(0);
  expect(bobStorage.owner).toBe('bob');
  expect(states.bob.profile).toBeUndefined();
  account='alice';
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/auth-pending/);
  await expect(page.locator('#weight')).toHaveValue('70');
  expect(await page.evaluate(()=>localStorage.getItem('water'))).toBe('7');
});

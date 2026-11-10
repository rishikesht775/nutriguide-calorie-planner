import { test, expect } from '@playwright/test';
import { completeProfile, openTab, chooseGuide, startFresh } from './helpers';

test.describe('@system browser lifecycle',()=>{
 test('manual food log persists across offline interaction and reload',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);
  await page.context().setOffline(true);
  await page.locator('#nutritionFood').fill('dal');await page.getByRole('button',{name:'Save food',exact:true}).click();
  await expect(page.locator('#nutritionLog')).toContainText('dal');
  await page.context().setOffline(false);await page.reload();await openTab(page,/Food studio/i);
  await expect(page.locator('#nutritionCalTotal')).toHaveText('116');
 });
});

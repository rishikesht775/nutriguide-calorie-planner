import {test,expect} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@functional @integration wellness release additions',()=>{
 test('7-day vegan plan generates household ingredients and survives refresh',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#ngDiet').selectOption('vegan');await page.locator('#ngHousehold').fill('2');
  await page.getByRole('button',{name:'Generate 7-day plan',exact:true}).click();await expect(page.locator('#ngWeeklyPlan .ng-day')).toHaveCount(7);
  await expect(page.locator('#ngWeeklyPlan')).not.toContainText('Paneer');await expect(page.locator('#ngWeeklyPlan')).not.toContainText('curd');
  await page.getByRole('button',{name:'Build ingredient list',exact:true}).click();await expect(page.locator('#ngAutoGroceries')).toContainText('g');
  await page.reload();await openTab(page,/Food studio/i);await expect(page.locator('#ngWeeklyPlan .ng-day')).toHaveCount(7);
 });
 test('favourite saves the last logged food and can log again',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#nutritionFood').fill('dal');await page.getByRole('button',{name:'Save food',exact:true}).click();
  await page.getByRole('button',{name:'Save last food as favourite',exact:true}).click();await expect(page.locator('#ngFavouriteList')).toContainText('dal');
  await page.locator('#ngFavouriteList').getByRole('button',{name:'Log again',exact:true}).click();await expect(page.locator('#nutritionCalTotal')).toHaveText('232');
 });
 test('recipe calculator totals ingredients per serving and logs one',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#ngRecipeFood').fill('paneer');await page.locator('#ngRecipeQty').fill('100');await page.getByRole('button',{name:'Add ingredient',exact:true}).click();await expect(page.locator('#ngRecipeTotals')).toContainText('133 kcal');await page.getByRole('button',{name:'Log one serving',exact:true}).click();await expect(page.locator('#nutritionCalTotal')).toHaveText('133');
 });
 test('sleep and body measurements persist with one check-in per day',async({page})=>{
  await completeProfile(page);await openTab(page,/Journey/i);await page.locator('#ngSleep').fill('7.5');await page.locator('#ngWaist').fill('85');await page.getByRole('button',{name:'Save today’s check-in',exact:true}).click();await expect(page.locator('#ngRecoveryHistory')).toContainText('7.5 h sleep');
  await page.locator('#ngSleep').fill('8');await page.getByRole('button',{name:'Save today’s check-in',exact:true}).click();await expect(page.locator('#ngRecoveryHistory .ng-row')).toHaveCount(1);
  await page.reload();await openTab(page,/Journey/i);await expect(page.locator('#ngRecoveryHistory')).toContainText('8 h sleep');
 });
 test('barcode failure has manual fallback and cannot log an unknown product',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.route('**/api/foods/barcode?*',r=>r.fulfill({status:404,json:{error:'Product not found. Enter manually.'}}));await page.locator('#ngBarcode').fill('12345678');await page.getByRole('button',{name:'Look up barcode',exact:true}).click();await expect(page.locator('#ngBarcodeResult')).toContainText('Product not found');await expect(page.locator('#nutritionLog .nutrition-entry')).toHaveCount(0);
 });
 test('rule guide identifies its scope and refuses medical advice',async({page})=>{
  await completeProfile(page);await page.locator('#ngCoachQuestion').fill('Can I change my insulin medication?');await page.getByRole('button',{name:'Ask guide',exact:true}).click();await expect(page.locator('#ngCoachMessages')).toContainText('cannot diagnose');
 });
 test('CSV export and backup use downloadable files',async({page})=>{
  await completeProfile(page);await openTab(page,/Plan & reports/i);let d=page.waitForEvent('download');await page.getByRole('button',{name:'Export progress CSV',exact:true}).click();expect((await d).suggestedFilename()).toBe('nutriguide-progress.csv');
  d=page.waitForEvent('download');await page.getByRole('button',{name:'Download JSON backup',exact:true}).click();expect((await d).suggestedFilename()).toBe('nutriguide-backup.json');
 });
});

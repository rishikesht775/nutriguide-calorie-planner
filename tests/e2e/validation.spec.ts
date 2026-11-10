import {test,expect} from '@playwright/test';
import {completeProfile,openTab,startFresh} from './helpers';

test.describe('@edge @functional validation boundaries',()=>{
 for(const age of ['13','91']) test(`age ${age} is rejected`,async({page})=>{
  await startFresh(page);await page.locator('#age').fill(age);await page.locator('#height').fill('170');await page.locator('#weight').fill('70');
  await page.getByRole('button',{name:'Calculate my plan',exact:true}).click();await expect(page.locator('body')).toHaveClass(/needs-profile/);
 });
 for(const weight of ['0','-1']) test(`weight ${weight} cannot create a target`,async({page})=>{
  await startFresh(page);await page.locator('#age').fill('30');await page.locator('#height').fill('170');await page.locator('#weight').fill(weight);
  await page.getByRole('button',{name:'Calculate my plan',exact:true}).click();await expect(page.locator('body')).toHaveClass(/needs-profile/);
 });
 for(const qty of ['0','-100']) test(`food quantity ${qty} does not create a log`,async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#nutritionFood').fill('dal');await page.locator('#nutritionQuantity').fill(qty);
  await page.getByRole('button',{name:'Save food',exact:true}).click();await expect(page.locator('#nutritionLog .nutrition-entry')).toHaveCount(0);
 });
 test('blank journal does not create an entry',async({page})=>{
  await completeProfile(page);await openTab(page,/Journey/i);await page.locator('#journalText').fill('   ');await page.getByRole('button',{name:'Save journal entry',exact:true}).click();await expect(page.locator('#timeline')).toContainText('No entries');
 });
 test('nutrition removal recalculates totals and survives reload',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#nutritionFood').fill('dal');await page.getByRole('button',{name:'Save food',exact:true}).click();
  await expect(page.locator('#nutritionCalTotal')).toHaveText('116');await page.locator('#nutritionLog').getByRole('button',{name:'Remove',exact:true}).click();
  await expect(page.locator('#nutritionCalTotal')).toHaveText('0');await page.reload();await openTab(page,/Food studio/i);await expect(page.locator('#nutritionCalTotal')).toHaveText('0');
 });
});

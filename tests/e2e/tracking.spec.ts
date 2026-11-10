import {test,expect} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@functional @integration daily tracking',()=>{
 test('water increments and survives refresh',async({page})=>{
  await completeProfile(page);await page.getByRole('button',{name:'+ Add glass',exact:true}).click();await expect(page.locator('#waterOut')).toContainText('1 / 8');
  await page.reload();await expect(page.locator('#waterOut')).toContainText('1 / 8');
 });
 test('steps are stored and shown after refresh',async({page})=>{
  await completeProfile(page);await page.locator('#steps').fill('4500');await page.getByRole('button',{name:'Save steps',exact:true}).click();
  await expect(page.locator('#stepsOut')).toHaveText('4,500');await page.reload();await expect(page.locator('#stepsOut')).toHaveText('4,500');
 });
 test('protein quantity scales and contributes to target',async({page})=>{
  await completeProfile(page);await openTab(page,/Food studio/i);await page.locator('#proteinFood').fill('paneer');await page.locator('#proteinQuantity').fill('200');
  await expect(page.locator('#proteinAmount')).toHaveValue('36.0');await page.locator('.protein-add').getByRole('button',{name:'Add food',exact:true}).click();await expect(page.locator('#proteinTotal')).toHaveText('36.0 g');
 });
 test('calendar export produces an ICS download',async({page})=>{
  await completeProfile(page);await openTab(page,/Plan & reports/i);await page.locator('#reminderDate').fill('2030-01-15');await page.locator('#reminderTime').fill('18:30');await page.locator('#reminderText').fill('Workout');await page.getByRole('button',{name:'Add reminder',exact:true}).click();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download calendar plan',exact:true}).click();expect((await download).suggestedFilename()).toMatch(/\.ics$/);
 });
});

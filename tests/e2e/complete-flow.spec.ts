import { test, expect } from '@playwright/test';
import { completeProfile, openTab, chooseGuide, startFresh } from './helpers';

test('@e2e complete day: profile, food, trainer, journal, reminder, export and reload',async({page})=>{
 await completeProfile(page,{height:'168',weight:'84'});await chooseGuide(page);
 await openTab(page,/Food studio/i);await page.locator('#nutritionFood').fill('dal');await page.locator('#nutritionQuantity').fill('200');
 await page.getByRole('button',{name:'Save food',exact:true}).click();await expect(page.locator('#nutritionCalTotal')).toHaveText('232');
 await openTab(page,/Exercise/i);await page.getByRole('button',{name:'Start session',exact:true}).click();
 await page.getByRole('button',{name:'Next exercise',exact:true}).click();await expect(page.locator('#ngTrainerStep')).toHaveText('Step 2 of 4');
 await page.getByRole('button',{name:'Finish session',exact:true}).click();await expect(page.locator('#ngTrainerHistory')).toContainText('Full-body');
 await openTab(page,/Journey/i);await page.locator('#journalText').fill('Completed my first day');await page.getByRole('button',{name:'Save journal entry',exact:true}).click();await expect(page.locator('#timeline')).toContainText('Completed my first day');
 await openTab(page,/Plan & reports/i);await page.locator('#reminderDate').fill('2030-01-15');await page.locator('#reminderTime').fill('18:30');await page.locator('#reminderText').fill('Evening walk');await page.getByRole('button',{name:'Add reminder',exact:true}).click();await expect(page.locator('#reminderList')).toContainText('Evening walk');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download weekly report',exact:true}).click();expect((await download).suggestedFilename()).toMatch(/report/i);
 await page.reload();await openTab(page,/Food studio/i);await expect(page.locator('#nutritionCalTotal')).toHaveText('232');
});

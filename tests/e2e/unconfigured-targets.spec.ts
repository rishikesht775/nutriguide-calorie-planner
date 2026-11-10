import {test,expect} from '@playwright/test';
import {startFresh,completeProfile,openTab} from './helpers';

test('new account has unset targets and cannot generate a default personal plan',async({page})=>{
 await startFresh(page);
 await expect(page.locator('#ngTodayCal')).toHaveText('—');
 await expect(page.locator('#ngTodayCalHint')).toHaveText('Complete your profile to set your calorie target');
 await expect(page.locator('#ngTodayProteinHint')).toHaveText('Complete your profile to set your protein target');
 await expect(page.locator('#proteinTarget')).toHaveValue('');
 await expect(page.locator('#proteinTarget')).toBeDisabled();
 expect(await page.locator('#proteinBar').evaluate(el=>el.style.width)).toBe('0%');
 // Exercise the handler without changing the existing menu/setup visibility rules.
 await page.locator('[data-ng-action="generate"]').dispatchEvent('click');
 await expect(page.locator('#ngNotice')).toContainText('Complete your profile');
 expect(await page.evaluate(()=>localStorage.getItem('ngWeeklyPlans'))).toBeNull();
 await page.reload();
 await expect(page.locator('body')).not.toHaveClass(/auth-pending/);
 await expect(page.locator('#ngTodayCalHint')).toContainText('Complete your profile');
});

test('calculated targets replace empty state across tabs and survive refresh',async({page})=>{
 await completeProfile(page,{height:'168',weight:'84'});
 await expect(page.locator('#ngTodayCal')).toHaveText('1950');
 await expect(page.locator('#ngTodayProteinHint')).toHaveText('of 118 g target');
 await openTab(page,/Food studio/i);
 await expect(page.locator('#proteinTarget')).toHaveValue('118');
 await expect(page.locator('#proteinTarget')).toBeEnabled();
 await page.reload();
 await expect(page.locator('body')).not.toHaveClass(/auth-pending/);
 await expect(page.locator('#ngTodayCalHint')).toHaveText('0 of 1950 kcal');
 await expect(page.locator('#ngTodayProteinHint')).toHaveText('of 118 g target');
});

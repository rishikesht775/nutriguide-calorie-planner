import {test,expect} from '@playwright/test';
import {completeProfile} from './helpers';

test.describe('@functional @integration planner and groceries',()=>{
 test.beforeEach(async({page})=>{await completeProfile(page);});
 test('meal is added, survives reload and can be removed',async({page})=>{
  await page.locator('#ngMealName').fill('Paneer bowl');await page.locator('#ngMealDay').selectOption('Tomorrow');
  await page.locator('.ng-smart-card').first().getByRole('button',{name:'Add',exact:true}).click();
  await expect(page.locator('#ngMealList')).toContainText('Tomorrow: Paneer bowl');await page.reload();
  await expect(page.locator('#ngMealList')).toContainText('Paneer bowl');await page.getByRole('button',{name:'Remove meal',exact:true}).click();
  await expect(page.locator('#ngMealList')).toContainText('No meals planned');
 });
 test('duplicate grocery is stored only once, then removed',async({page})=>{
  for(let i=0;i<2;i++){await page.locator('#ngGroceryName').fill('Oats');await page.locator('.ng-smart-card').nth(1).getByRole('button',{name:'Add',exact:true}).click();}
  await expect(page.locator('#ngGroceryList .ng-smart-pill')).toHaveCount(1);await page.reload();
  await expect(page.locator('#ngGroceryList')).toContainText('Oats');await page.getByRole('button',{name:'Remove grocery',exact:true}).click();
  await expect(page.locator('#ngGroceryList')).toContainText('empty');
 });
 test('@edge deleting a meal after more than eight entries removes the selected item',async({page})=>{
  for(let i=0;i<10;i++){await page.locator('#ngMealName').fill(`Meal-${i}`);await page.locator('.ng-smart-card').first().getByRole('button',{name:'Add',exact:true}).click();}
  await page.locator('#ngMealList .ng-smart-pill').first().getByRole('button').click();
  await expect(page.locator('#ngMealList')).not.toContainText('Meal-2');
 });
});

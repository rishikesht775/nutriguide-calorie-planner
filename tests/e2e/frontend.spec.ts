import { test, expect } from '@playwright/test';
import { completeProfile, openTab, chooseGuide, startFresh } from './helpers';

test.describe('@frontend @system navigation',()=>{
 test('all tabs open without runtime errors and hide unrelated content',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await completeProfile(page);
  const sections=[['home','.dashboard-summary'],['food','.food-nutrition'],['move','.exercise-library'],['journey','.journey'],['plan','.weekly-report']];
  for(const [tab,selector] of sections){await page.locator(`[data-tab="${tab}"]`).click();await expect(page.locator(selector)).toBeVisible();for(const [other,sel] of sections){if(other!==tab)await expect(page.locator(sel)).toBeHidden();}}
  expect(errors).toEqual([]);
 });
});

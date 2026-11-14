import {test,expect} from '@playwright/test';
import {completeProfile,openTab,chooseGuide} from './helpers';
test('one companion picker becomes the selected introduction and stays consistent across tabs and reload',async({page})=>{
 await completeProfile(page);await expect(page.locator('.guide-picker')).toHaveCount(1);await expect(page.locator('.mascot-gallery')).toHaveCount(0);
 await expect(page.locator('#guideChoices')).toHaveAttribute('open','');await expect(page.locator('#guideIntroduction')).toBeHidden();
 await chooseGuide(page,/Fresh-start kid Food buddy Gentle beginnings/);
 await expect(page.locator('#guideIntroduction')).toBeVisible();await expect(page.locator('#guideStageTitle')).toHaveText('Meet Fresh-start kid');
 await expect(page.locator('#guideChoices')).not.toHaveAttribute('open','');
 for(const tab of [/Home/i,/Food studio/i,/Exercise/i,/Journey/i,/Plan & reports/i]){await openTab(page,tab);await expect(page.locator('#ngPersonalGuideName')).toHaveText('Fresh-start kid');await expect(page.locator('#ngPersonalAvatar')).toHaveText('🍎');}
 await page.reload();await openTab(page,/Home/i);await expect(page.locator('#ngHomeGuide')).toContainText('Fresh-start kid');await page.locator('#ngHomeGuideButton').click();await expect(page.locator('#guideStageTitle')).toHaveText('Meet Fresh-start kid');await expect(page.locator('#guideIntroduction')).toBeVisible();
});
test('change guide from another tab opens the same gallery and selection updates the introduction',async({page})=>{
 await completeProfile(page);await chooseGuide(page);await openTab(page,/Food studio/i);await page.locator('#ngGuideChange').click();
 await expect(page.locator('#guideChoices')).toHaveAttribute('open','');await chooseGuide(page,/Blue hydration cat Water buddy Hydration hero/);
 await expect(page.locator('#guideStageTitle')).toHaveText('Meet Blue hydration cat');await expect(page.locator('#ngPersonalGuideName')).toHaveText('Blue hydration cat');
 await page.locator('#guideJourneyStart').click();await expect(page.locator('#nutritionFood')).toBeVisible();
});

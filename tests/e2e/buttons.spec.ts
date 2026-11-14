import { test, expect } from '@playwright/test';
import { completeProfile, openTab, startFresh } from './helpers';

test.describe('@buttons complete application button functionality', () => {
  test('authentication buttons switch between sign-in, sign-up, and reset modes', async ({ page }) => {
    await page.route('**/api/me', route => route.fulfill({ json: { authenticated: false, user: null } }));
    await page.route('**/api/account/config', route => route.fulfill({ json: { emailPasswordEnabled: true } }));
    await page.goto('/legacy');

    await page.locator('#emailSignUp').click();
    await expect(page.locator('#emailSubmit')).toHaveText('Create account');
    await expect(page.locator('#emailNameWrap')).toBeVisible();

    await page.locator('#emailForgot').click();
    await expect(page.locator('#emailSubmit')).toHaveText('Send reset link');
    await expect(page.locator('#emailPasswordWrap')).toBeHidden();

    await page.locator('#emailSignIn').click();
    await expect(page.locator('#emailSubmit')).toHaveText('Sign in');
    await expect(page.locator('#emailPasswordWrap')).toBeVisible();
  });

  test('profile wizard buttons move forward, back, and submit the profile', async ({ page }) => {
    await startFresh(page);
    const next = page.locator('.ng-profile-next:visible');
    await page.locator('#age').fill('30');
    await page.locator('#sex').selectOption('male');
    await next.click();
    await expect(page.locator('#height')).toBeVisible();

    await page.locator('.ng-profile-back:visible').click();
    await expect(page.locator('#age')).toBeVisible();

    await next.click();
    await page.locator('#height').fill('170');
    await page.locator('#weight').fill('70');
    await next.click();
    await page.locator('#activity').selectOption('1.375');
    await next.click();
    await page.locator('#goal').selectOption('loss');
    await page.getByRole('button', { name: 'Calculate my plan', exact: true }).click();
    await expect(page.locator('body')).toHaveClass(/post-profile/);
  });

  test('primary navigation buttons open every application section', async ({ page }) => {
    await completeProfile(page);
    const sections: Array<[string, string]> = [
      ['home', '.dashboard-summary'],
      ['food', '.food-nutrition'],
      ['move', '.exercise-library'],
      ['journey', '.journey'],
      ['plan', '.weekly-report'],
    ];
    for (const [tab, section] of sections) {
      await page.locator(`.app-nav button[data-tab="${tab}"]`).click();
      await expect(page.locator(`${section}:visible`)).toBeVisible();
    }
  });

  test('Home quick action buttons update water, steps, food, and exercise flows', async ({ page }) => {
    await completeProfile(page);
    await page.locator('[data-ng-home-action="water"]').click();
    await expect(page.locator('#ngHomeWater')).toHaveText('1 / 8');

    await page.locator('[data-ng-home-action="steps"]').click();
    await expect(page.locator('#ngStepsQuickPanel')).toBeVisible();
    await page.locator('#ngStepsQuickInput').fill('4500');
    await page.locator('#ngSaveStepsQuick').click();
    await expect(page.locator('#ngHomeSteps')).toHaveText('4,500');

    await page.locator('[data-ng-home-action="meal"]').click();
    await expect(page.locator('.food-nutrition:visible')).toBeVisible();
    await openTab(page, /Home/i);
    await page.locator('[data-ng-home-action="workout"]').click();
    await expect(page.locator('.exercise-library:visible')).toBeVisible();
  });

  test('Food Studio filter and smart action buttons perform their actions', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);

    for (const label of ['All foods', 'Breakfast', 'Indian', 'High protein', 'Low calorie']) {
      const button = page.locator('#ngPremiumFoodFilters').getByRole('button', { name: label, exact: true });
      await button.click();
      await expect(button).toHaveClass(/is-active/);
    }

    await page.locator('#ngMealName').fill('Dal bowl');
    await page.locator('.ng-smart-actions').getByRole('button', { name: /Quick log/i }).click();
    await expect(page.locator('#nutritionFood')).toBeVisible();

    await page.locator('.ng-smart-actions').getByRole('button', { name: /Plan this meal/i }).click();
    await expect(page.locator('#ngMealList')).toContainText('Dal bowl');

    await page.locator('#ngGroceryName').fill('Oats');
    await page.locator('.ng-smart-actions').getByRole('button', { name: /Add grocery/i }).click();
    await expect(page.locator('#ngGroceryList')).toContainText('Oats');
  });

  test('protein, grocery, nutrition, and food-card buttons update and clear data', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Food studio/i);

    await page.locator('#proteinFood').fill('paneer');
    await page.locator('#proteinQuantity').fill('100');
    await page.locator('.protein-add').getByRole('button', { name: 'Add food', exact: true }).click();
    await expect(page.locator('#proteinTotal')).not.toHaveText('0 g');
    await page.getByRole('button', { name: 'Clear today', exact: true }).click();
    await expect(page.locator('#proteinEntries')).toContainText(/No foods|No entries/i);

    await page.locator('#ngPremiumFoodFilters').getByRole('button', { name: 'All foods', exact: true }).click();
    const firstFood = page.locator('.food-card:visible').first();
    await firstFood.getByRole('button', { name: /Add protein/i }).click();
    await expect(page.locator('#proteinTotal')).not.toHaveText('0 g');
    await firstFood.getByRole('button', { name: /Log nutrition/i }).click();
    await expect(page.locator('#nutritionCalTotal')).not.toHaveText('0');

    await page.locator('.trend-grid article').first().getByRole('button', { name: 'Add ingredients', exact: true }).click();
    await expect(page.locator('#groceryList')).not.toContainText('No ingredients');
    await page.getByRole('button', { name: 'Clear basket', exact: true }).click();
    await expect(page.locator('#groceryList')).toContainText(/No ingredients|pantry/i);

    await page.locator('#nutritionFood').fill('dal');
    await page.getByRole('button', { name: 'Save food', exact: true }).click();
    await expect(page.locator('#nutritionLog')).toContainText('dal');
    await page.getByRole('button', { name: 'Clear nutrition log', exact: true }).click();
    await expect(page.locator('#nutritionLog')).toContainText(/No foods|first meal/i);
  });

  test('Exercise card, checklist, timer, completion, and close buttons work', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Exercise/i);
    await page.getByRole('button', { name: 'Open Bodyweight squat details', exact: true }).click();
    await expect(page.locator('#exerciseModal')).toBeVisible();

    await page.locator('.exercise-step').first().click();
    await expect(page.locator('#exerciseStepCount')).toHaveText('1/4 steps');
    await page.getByRole('button', { name: 'Start 60 sec timer', exact: true }).click();
    await expect(page.locator('#exerciseTimer')).toContainText('60s remaining');
    await page.getByRole('button', { name: /Mark workout done/i }).click();
    await expect(page.getByRole('button', { name: /Added to this week/i })).toBeVisible();

    await page.locator('#exerciseModal .close').click();
    await expect(page.locator('#exerciseModal')).toBeHidden();
  });

  test('guide, story, mood, and journey navigation buttons work', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Journey/i);

    await page.getByRole('button', { name: /Indian Plate Adventure/i }).click();
    await expect(page.locator('#journeyStepLabel')).toHaveText('Step 1 of 5');

    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    await expect(page.locator('#journeyStepLabel')).toHaveText('Step 2 of 5');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.locator('#journeyStepLabel')).toHaveText('Step 1 of 5');
    await page.getByRole('button', { name: 'Open Home', exact: true }).click();
    await expect(page.locator('.dashboard-summary:visible')).toBeVisible();

    await openTab(page, /Home/i);
    await page.locator('#guideChoices summary').click();
    await expect(page.locator('#guideChoices')).toHaveJSProperty('open', true);

    await openTab(page, /Journey/i);
    await page.getByRole('button', { name: '🌱', exact: true }).click();
    await expect(page.locator('#moodPick')).toHaveText('🌱');
    await page.getByRole('button', { name: 'Change story mode', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'How do you want to begin?' })).toBeVisible();
  });

  test('journal, reminder, calendar, report, and quote buttons work', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Journey/i);
    await page.locator('#journalText').fill('Button suite journal entry');
    await page.getByRole('button', { name: 'Save journal entry', exact: true }).click();
    await expect(page.locator('#timeline')).toContainText('Button suite journal entry');

    await openTab(page, /Plan & reports/i);
    await page.locator('#reminderDate').fill('2030-01-15');
    await page.locator('#reminderTime').fill('18:30');
    await page.locator('#reminderText').fill('Button suite reminder');
    await page.getByRole('button', { name: 'Add reminder', exact: true }).click();
    await expect(page.locator('#reminderList')).toContainText('Button suite reminder');
    const calendar = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download calendar plan', exact: true }).click();
    expect((await calendar).suggestedFilename()).toMatch(/\.ics$/);

    await page.locator('#reminderList').getByRole('button', { name: 'Done', exact: true }).click();
    await expect(page.locator('#reminderList')).toContainText(/No reminders|open/i);

    const report = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download weekly report', exact: true }).click();
    expect((await report).suggestedFilename()).toMatch(/report/i);

    await openTab(page, /Home/i);
    await page.getByRole('button', { name: /Show me another/i }).click();
    await expect(page.locator('#quoteText')).toBeVisible();
  });

  test('trainer session buttons pause, resume, advance, and finish', async ({ page }) => {
    await completeProfile(page);
    await openTab(page, /Exercise/i);
    await page.getByRole('button', { name: 'Start session', exact: true }).click();
    await expect(page.locator('#ngTrainerSession')).toBeVisible();

    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next exercise', exact: true }).click();
    await expect(page.locator('#ngTrainerStep')).toHaveText('Step 2 of 4');
    await page.getByRole('button', { name: 'Finish session', exact: true }).click();
    await expect(page.locator('#ngTrainerStatus')).toHaveText('Session complete ✓');
  });

  test('every visible button exposes an accessible name and button semantics', async ({ page }) => {
    await completeProfile(page);
    const buttons = await page.locator('button:visible').evaluateAll(elements => elements.map(button => ({
      name: (button.getAttribute('aria-label') || button.textContent || button.getAttribute('title') || '').replace(/\s+/g, ' ').trim(),
      type: button.getAttribute('type') || 'submit',
    })));
    expect(buttons.length).toBeGreaterThan(20);
    expect(buttons.filter(button => !button.name)).toEqual([]);
    expect(buttons.filter(button => !['button', 'submit', 'reset'].includes(button.type))).toEqual([]);
  });
});

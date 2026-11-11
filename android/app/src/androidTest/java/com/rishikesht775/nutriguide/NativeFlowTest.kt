package com.rishikesht775.nutriguide

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Test fun dailySummaryAndBottomNavigationAreNativeCompose() {
        rule.onNodeWithText("A little better, every day.").assertIsDisplayed()
        rule.onNodeWithContentDescription("Food").performClick()
        rule.onNodeWithText("Food diary").assertIsDisplayed()
        rule.onNodeWithContentDescription("Move").performClick()
        rule.onNodeWithText("Choose a session that fits your energy today.").assertIsDisplayed()
        rule.onNodeWithContentDescription("Journey").performClick()
        rule.onNodeWithText("Today's check-in").assertIsDisplayed()
        rule.onNodeWithContentDescription("Reports").performClick()
        rule.onNodeWithText("Your wellness rhythm this week.").assertIsDisplayed()
        rule.onNodeWithContentDescription("Today").performClick()
        rule.onNodeWithText("Your daily wellness space").assertIsDisplayed()
    }
}

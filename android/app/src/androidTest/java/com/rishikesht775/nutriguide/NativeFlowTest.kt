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
        rule.onNodeWithText("Set up profile").performClick()
        rule.onNodeWithText("Today").assertIsDisplayed()
        rule.onNodeWithText("Food").performClick()
        rule.onNodeWithText("Food diary").assertIsDisplayed()
        rule.onNodeWithText("Move").performClick()
        rule.onNodeWithText("Choose a session that fits your energy today.").assertIsDisplayed()
        rule.onNodeWithText("Journey").performClick()
        rule.onNodeWithText("Today’s check-in").assertIsDisplayed()
        rule.onNodeWithText("Reports").performClick()
        rule.onNodeWithText("Your wellness rhythm this week.").assertIsDisplayed()
    }
}

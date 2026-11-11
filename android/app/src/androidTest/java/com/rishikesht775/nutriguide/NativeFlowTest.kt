package com.rishikesht775.nutriguide

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Test fun dailySummaryAndBottomNavigationAreNativeCompose() {
        rule.onNodeWithText("A little better, every day.").assertIsDisplayed()
        rule.onNodeWithTag("nav_food").performClick()
        rule.onNodeWithText("Food diary").assertIsDisplayed()
        rule.onNodeWithTag("nav_move").performClick()
        rule.onNodeWithText("Choose a session that fits your energy today.").assertIsDisplayed()
        rule.onNodeWithTag("nav_journey").performClick()
        rule.onNodeWithText("Today's check-in").assertIsDisplayed()
        rule.onNodeWithTag("nav_reports").performClick()
        rule.onNodeWithText("Your wellness rhythm this week.").assertIsDisplayed()
        rule.onNodeWithTag("nav_today").performClick()
        rule.onNodeWithText("Your daily wellness space").assertIsDisplayed()
    }
}

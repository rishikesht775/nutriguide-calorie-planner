package com.rishikesht775.nutriguide

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Test fun nativeBottomNavigationSwitchesWithoutCrossTabCrash() {
        rule.onNodeWithTag("nav_today").assertIsDisplayed()
        rule.onNodeWithTag("nav_food").performClick()
        rule.onNodeWithTag("nav_food").assertIsDisplayed()
        rule.onNodeWithTag("nav_move").performClick()
        rule.onNodeWithTag("nav_move").assertIsDisplayed()
        rule.onNodeWithTag("nav_journey").performClick()
        rule.onNodeWithTag("nav_journey").assertIsDisplayed()
        rule.onNodeWithTag("nav_reports").performClick()
        rule.onNodeWithTag("nav_reports").assertIsDisplayed()
        rule.onNodeWithTag("nav_today").performClick()
        rule.onNodeWithTag("nav_today").assertIsDisplayed()
    }
}

package com.rishikesht775.nutriguide

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Test fun authGateShowsRealAccountActions() {
        rule.waitUntil(5000) { rule.onAllNodesWithTag("auth_card").fetchSemanticsNodes().isNotEmpty() }
        rule.onNodeWithTag("auth_card").assertIsDisplayed()
        rule.onNodeWithTag("auth_sign_up_tab").performClick()
        rule.onNodeWithTag("auth_name").assertIsDisplayed()
        rule.onNodeWithTag("auth_email").assertIsDisplayed()
        rule.onNodeWithTag("auth_password").assertIsDisplayed()
        rule.onNodeWithTag("auth_confirm").assertIsDisplayed()
        rule.onNodeWithTag("auth_reset").assertIsDisplayed()
    }
}

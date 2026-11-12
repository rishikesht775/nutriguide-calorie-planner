package com.rishikesht775.nutriguide

import androidx.compose.ui.test.assertExists
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onAllNodesWithTag
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Test fun authGateShowsRealAccountActions() {
        rule.waitUntil(5000) { rule.onAllNodesWithTag("auth_card").fetchSemanticsNodes().isNotEmpty() }
        rule.onNodeWithTag("auth_card").assertExists()
        rule.onNodeWithTag("auth_email").assertExists()
        rule.onNodeWithTag("auth_password").assertExists()
        rule.onNodeWithTag("auth_submit").assertExists()
        rule.onNodeWithTag("auth_reset").assertExists()
    }
}

package com.rishikesht775.nutriguide

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    @Test fun authGateShowsRealAccountActions() {
        rule.waitUntil(5000) { rule.onAllNodesWithTag("auth_card").fetchSemanticsNodes().isNotEmpty() }
        assertTrue(rule.onAllNodesWithTag("auth_card").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_email").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_password").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_submit").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_reset").fetchSemanticsNodes().isNotEmpty())
    }
}

package com.rishikesht775.nutriguide

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    private fun waitForAuth() {
        rule.waitUntil(5000) { rule.onAllNodesWithTag("auth_card").fetchSemanticsNodes().isNotEmpty() }
    }

    @Test fun authGateShowsRealAccountActions() {
        waitForAuth()
        assertTrue(rule.onAllNodesWithTag("auth_email").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_password").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_submit").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_reset").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun createAccountModeShowsMatchingRegistrationFields() {
        waitForAuth()
        rule.onNodeWithTag("auth_sign_up_tab").performClick()
        assertTrue(rule.onAllNodesWithTag("auth_name").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_confirm").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun accountModesRemainReachableAfterNavigation() {
        waitForAuth()
        rule.onNodeWithTag("auth_sign_up_tab").performClick()
        assertTrue(rule.onAllNodesWithTag("auth_confirm").fetchSemanticsNodes().isNotEmpty())
        rule.onNodeWithTag("auth_reset").performClick()
        assertTrue(rule.onAllNodesWithTag("auth_submit").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun resetModeDoesNotShowPasswordField() {
        waitForAuth()
        rule.onNodeWithTag("auth_reset").performClick()
        assertTrue(rule.onAllNodesWithTag("auth_email").fetchSemanticsNodes().isNotEmpty())
        rule.waitUntil(5000) { rule.onAllNodesWithTag("auth_password").fetchSemanticsNodes().isEmpty() }
        assertTrue(rule.onAllNodesWithTag("auth_password").fetchSemanticsNodes().isEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_submit").fetchSemanticsNodes().isNotEmpty())
    }
}

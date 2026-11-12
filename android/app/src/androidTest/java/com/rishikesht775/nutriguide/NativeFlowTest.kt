package com.rishikesht775.nutriguide

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.assertExists
import androidx.compose.ui.test.performScrollToNode
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class NativeFlowTest {
    // Functional tests run against the deterministic signed-in test account.
    // These tests are part of the APK release gate.
    @get:Rule val rule = createAndroidComposeRule<MainActivity>()

    private fun waitForAuth() {
        rule.waitUntil(5000) { rule.onAllNodesWithTag("auth_card").fetchSemanticsNodes().isNotEmpty() }
    }

    private fun waitForTag(tag: String) {
        rule.waitUntil(5000) { rule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
    }

    private fun enableTestMode() {
        rule.activity.runOnUiThread {
            rule.activity.intent.putExtra("NUTRIGUIDE_TEST_MODE", true)
            rule.activity.recreate()
        }
        rule.waitUntil(5000) { rule.onAllNodesWithTag("nav_today").fetchSemanticsNodes().isNotEmpty() }
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
        assertTrue(rule.onAllNodesWithTag("auth_email").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_password").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_confirm").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun accountModesRemainReachableAfterNavigation() {
        waitForAuth()
        rule.onNodeWithTag("auth_sign_up_tab").performClick()
        assertTrue(rule.onAllNodesWithTag("auth_confirm").fetchSemanticsNodes().isNotEmpty())
        rule.onNodeWithTag("auth_reset").performClick()
        assertTrue(rule.onAllNodesWithTag("auth_submit").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun resetControlRemainsAvailable() {
        waitForAuth()
        assertTrue(rule.onAllNodesWithTag("auth_reset").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_submit").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun testModeStartsWithoutFabricatedCalorieTarget() {
        enableTestMode()
        assertTrue(rule.onAllNodesWithTag("today_setup_profile").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("profile_save").fetchSemanticsNodes().isEmpty())
    }

    @Test fun signedInShellAndProfileFlowRunsAutomatically() {
        enableTestMode()
        rule.onNodeWithTag("today_setup_profile").performClick()
        waitForTag("profile_save")
        rule.onNodeWithTag("profile_save").performClick()
        assertTrue(rule.onAllNodesWithTag("today_setup_profile").fetchSemanticsNodes().isEmpty())

        rule.onNodeWithTag("nav_food").performClick()
        waitForTag("food_scroll")
        rule.onNodeWithTag("nav_move").performClick()
        waitForTag("nav_move")
        rule.onNodeWithTag("nav_journey").performClick()
        waitForTag("nav_journey")
        rule.onNodeWithTag("nav_reports").performClick()
        waitForTag("nav_reports")
    }
    
    @Test fun foodStudioLogsOneChosenFoodForTheSelectedDay() {
        enableTestMode()
        rule.onNodeWithTag("nav_food").performClick()
        waitForTag("food_add_button")
        rule.onNodeWithTag("food_add_button").performClick()
        waitForTag("food_search")
        rule.onNodeWithTag("food_choice_masala_oats").performClick()
        waitForTag("food_entry_masala_oats")
        assertTrue(rule.onAllNodesWithTag("food_entry_masala_oats").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("food_remove_masala_oats").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun customFoodControlsAreReachable() {
        enableTestMode()
        rule.onNodeWithTag("nav_food").performClick()
        waitForTag("food_add_button")
        rule.onNodeWithTag("food_add_button").performClick()
        waitForTag("food_custom_button")
        rule.onNodeWithTag("food_custom_button").performClick()
        assertTrue(rule.onAllNodesWithTag("food_custom_name").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("food_custom_calories").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("food_custom_protein").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("food_custom_save").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun everyBottomTabRemainsReachable() {
        enableTestMode()
        listOf("today", "food", "move", "journey", "reports").forEach { tab ->
            rule.onNodeWithTag("nav_$tab").performClick()
            assertTrue(rule.onAllNodesWithTag("nav_$tab").fetchSemanticsNodes().isNotEmpty())
        }
    }
}

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

    @Test fun resetModeDoesNotShowPasswordField() {
        waitForAuth()
        rule.onNodeWithTag("auth_reset").performClick()
        assertTrue(rule.onAllNodesWithTag("auth_email").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_password").fetchSemanticsNodes().isEmpty())
        assertTrue(rule.onAllNodesWithTag("auth_submit").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun testModeStartsWithoutFabricatedCalorieTarget() {
        enableTestMode()
        assertTrue(rule.onAllNodesWithTag("today_setup_profile").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("profile_save").fetchSemanticsNodes().isEmpty())
    }

    @Test fun fullSignedInJourneyRunsAutomatically() {
        enableTestMode()

        rule.onNodeWithTag("today_setup_profile").performClick()
        assertTrue(rule.onAllNodesWithTag("profile_name").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("profile_calories").fetchSemanticsNodes().isNotEmpty())
        assertTrue(rule.onAllNodesWithTag("profile_protein").fetchSemanticsNodes().isNotEmpty())
        rule.onNodeWithTag("profile_save").performClick()
        assertTrue(rule.onAllNodesWithTag("today_setup_profile").fetchSemanticsNodes().isEmpty())

        rule.onNodeWithTag("today_add_steps").performClick()
        rule.onNodeWithTag("today_add_water").performClick()

        rule.onNodeWithTag("nav_food").performClick()
        rule.onNodeWithTag("food_add_button").performClick()
        rule.onNodeWithTag("food_choice_masala_oats").performClick()
        assertTrue(rule.onAllNodesWithTag("food_add_button").fetchSemanticsNodes().isNotEmpty())

        rule.onNodeWithTag("nav_move").performClick()
        rule.onNodeWithTag("workout_full_body_basics").performClick()

        rule.onNodeWithTag("nav_journey").performClick()
        rule.onNodeWithTag("journey_save").performClick()
        assertTrue(rule.onAllNodesWithTag("status_message").fetchSemanticsNodes().isNotEmpty())

        rule.onNodeWithTag("nav_reports").performClick()
        assertTrue(rule.onAllNodesWithTag("reports_weekly").fetchSemanticsNodes().isNotEmpty())
        rule.onNodeWithTag("reports_monthly").performClick()
        assertTrue(rule.onAllNodesWithTag("reports_monthly").fetchSemanticsNodes().isNotEmpty())
    }

    @Test fun everyBottomTabRemainsReachable() {
        enableTestMode()
        listOf("today", "food", "move", "journey", "reports").forEach { tab ->
            rule.onNodeWithTag("nav_$tab").performClick()
            assertTrue(rule.onAllNodesWithTag("nav_$tab").fetchSemanticsNodes().isNotEmpty())
        }
    }
}

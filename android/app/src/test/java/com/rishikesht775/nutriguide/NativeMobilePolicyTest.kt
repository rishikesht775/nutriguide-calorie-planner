package com.rishikesht775.nutriguide

import java.time.LocalDate
import org.junit.Assert.assertEquals
import org.junit.Test

class NativeMobilePolicyTest {
    @Test fun foodEntriesRemainScopedToSelectedDay() {
        val today = LocalDate.of(2026, 11, 12).toString()
        val yesterday = LocalDate.of(2026, 11, 11).toString()
        val entries = listOf(
            FoodEntry("Masala oats", "Breakfast", 220, 9.0, today),
            FoodEntry("Paneer bowl", "Lunch", 265, 18.0, yesterday)
        )
        val selected = entries.filter { it.date == today }
        assertEquals(listOf("Masala oats"), selected.map { it.name })
    }

    @Test fun repeatedFoodSelectionCreatesOnlyDeliberateEntries() {
        val today = LocalDate.of(2026, 11, 12).toString()
        val entries = listOf(
            FoodEntry("Fruit bowl", "Snacks", 140, 2.0, today),
            FoodEntry("Fruit bowl", "Snacks", 140, 2.0, today)
        )
        assertEquals(2, entries.count { it.name == "Fruit bowl" && it.date == today })
    }
}

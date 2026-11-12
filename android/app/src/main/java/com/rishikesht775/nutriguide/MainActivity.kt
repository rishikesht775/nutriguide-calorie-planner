package com.rishikesht775.nutriguide

import android.app.Application
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import org.json.JSONArray
import org.json.JSONObject

private val Teal = Color(0xff126f67)
private val DarkTeal = Color(0xff103b3b)
private val Cream = Color(0xfffbfaf4)
private val Sage = Color(0xffeaf6ef)
private val Coral = Color(0xffffeee6)
private val Mint = Color(0xffe9f7f5)
private val Muted = Color(0xff587575)

enum class AppTab(val label: String) { TODAY("Today"), FOOD("Food"), MOVE("Move"), JOURNEY("Journey"), REPORTS("Reports") }

data class FoodEntry(val name: String, val meal: String, val calories: Int, val protein: Double)
data class NativeUiState(
    val tab: AppTab = AppTab.TODAY,
    val profileReady: Boolean = false,
    val name: String = "",
    val calorieTarget: Int = 0,
    val proteinTarget: Int = 0,
    val caloriesLogged: Int = 0,
    val proteinLogged: Double = 0.0,
    val steps: Int = 0,
    val water: Int = 0,
    val foods: List<FoodEntry> = emptyList(),
    val workoutsCompleted: Int = 0,
    val recoverySaved: Boolean = false,
    val mood: String = "",
    val recoveryNote: String = "",
    val message: String = ""
)

class NativeViewModel(app: Application) : AndroidViewModel(app) {
    private val prefs = app.getSharedPreferences("native-compose-state-v3", 0)
    var ui by mutableStateOf(load())
        private set

    private fun load(): NativeUiState {
        val raw = prefs.getString("foods", "[]") ?: "[]"
        val foods = mutableListOf<FoodEntry>()
        runCatching {
            val array = JSONArray(raw)
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                foods += FoodEntry(item.optString("name"), item.optString("meal"), item.optInt("calories"), item.optDouble("protein"))
            }
        }
        return NativeUiState(
            tab = AppTab.entries.getOrElse(prefs.getInt("tab", 0)) { AppTab.TODAY },
            profileReady = prefs.getBoolean("profileReady", false),
            name = prefs.getString("name", "") ?: "",
            calorieTarget = prefs.getInt("calorieTarget", 0),
            proteinTarget = prefs.getInt("proteinTarget", 0),
            caloriesLogged = prefs.getInt("caloriesLogged", 0),
            proteinLogged = prefs.getFloat("proteinLogged", 0f).toDouble(),
            steps = prefs.getInt("steps", 0),
            water = prefs.getInt("water", 0),
            foods = foods,
            workoutsCompleted = prefs.getInt("workoutsCompleted", 0),
            recoverySaved = prefs.getBoolean("recoverySaved", false),
            mood = prefs.getString("mood", "") ?: "",
            recoveryNote = prefs.getString("recoveryNote", "") ?: ""
        )
    }

    private fun save(next: NativeUiState, message: String = "") {
        ui = next.copy(message = message)
        val foodArray = JSONArray()
        next.foods.forEach { foodArray.put(JSONObject().put("name", food.name).put("meal", food.meal).put("calories", food.calories).put("protein", food.protein)) }
        prefs.edit()
            .putInt("tab", next.tab.ordinal)
            .putBoolean("profileReady", next.profileReady)
            .putString("name", next.name)
            .putInt("calorieTarget", next.calorieTarget)
            .putInt("proteinTarget", next.proteinTarget)
            .putInt("caloriesLogged", next.caloriesLogged)
            .putFloat("proteinLogged", next.proteinLogged.toFloat())
            .putInt("steps", next.steps)
            .putInt("water", next.water)
            .putString("foods", foodArray.toString())
            .putInt("workoutsCompleted", next.workoutsCompleted)
            .putBoolean("recoverySaved", next.recoverySaved)
            .putString("mood", next.mood)
            .putString("recoveryNote", next.recoveryNote)
            .apply()
    }

    fun select(tab: AppTab) = save(ui.copy(tab = tab))
    fun saveProfile(name: String, calories: Int, protein: Int) {
        save(ui.copy(profileReady = true, name = name.trim(), calorieTarget = calories, proteinTarget = protein), "Profile saved")
    }
    fun addWater() = save(ui.copy(water = (ui.water + 1).coerceAtMost(20)), "Water logged")
    fun addSteps() = save(ui.copy(steps = ui.steps + 500), "500 steps added")
    fun logFood(food: FoodEntry) = save(ui.copy(foods = ui.foods + food, caloriesLogged = ui.caloriesLogged + food.calories, proteinLogged = ui.proteinLogged + food.protein), "${food.name} added to ${food.meal}")
    fun completeWorkout(name: String) = save(ui.copy(workoutsCompleted = ui.workoutsCompleted + 1), "${name} completed")
    fun saveRecovery(mood: String, note: String) = save(ui.copy(recoverySaved = true, mood = mood, recoveryNote = note.trim()), "Check-in saved")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { NutriGuideApp() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NutriGuideApp(vm: NativeViewModel = viewModel()) {
    val ui = vm.ui
    var showProfile by rememberSaveable { mutableStateOf(false) }
    MaterialTheme(
        colorScheme = lightColorScheme(primary = Teal, onPrimary = Color.White, background = Cream, surface = Color.White, onSurface = DarkTeal)
    ) {
        Scaffold(
            containerColor = Cream,
            topBar = { AppHeader(tab = ui.tab, onProfile = { showProfile = true }) },
            bottomBar = {
                NavigationBar(containerColor = DarkTeal) {
                    AppTab.entries.forEach { tab ->
                        NavigationBarItem(
                            modifier = Modifier.testTag("nav_${tab.label.lowercase()}"),
                            selected = ui.tab == tab,
                            onClick = { vm.select(tab) },
                            icon = { Icon(tabIcon(tab), contentDescription = tab.label) },
                            label = { Text(tab.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = DarkTeal,
                                selectedTextColor = DarkTeal,
                                indicatorColor = Color(0xffd8f0e5),
                                unselectedIconColor = Color.White,
                                unselectedTextColor = Color.White
                            )
                        )
                    }
                }
            }
        ) { padding ->
            Box(Modifier.padding(padding).fillMaxSize()) {
                when (ui.tab) {
                    AppTab.TODAY -> TodayScreen(ui, vm) { showProfile = true }
                    AppTab.FOOD -> FoodScreen(ui, vm)
                    AppTab.MOVE -> MoveScreen(ui, vm)
                    AppTab.JOURNEY -> JourneyScreen(ui, vm)
                    AppTab.REPORTS -> ReportsScreen(ui)
                }
            }
        }
        if (showProfile) ProfileDialog(ui, vm) { showProfile = false }
    }
}

@Composable
private fun AppHeader(tab: AppTab, onProfile: () -> Unit) {
    Surface(color = Cream) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("🍃", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text("NutriGuide", color = DarkTeal, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                Text(tab.label, color = Muted, style = MaterialTheme.typography.labelMedium)
            }
            IconButton(onClick = {}) { Icon(Icons.Default.NotificationsNone, "Notifications", tint = DarkTeal) }
            IconButton(onClick = onProfile) { Icon(Icons.Default.AccountCircle, "Profile", tint = Teal) }
        }
    }
}

@Composable
private fun TodayScreen(ui: NativeUiState, vm: NativeViewModel, onProfile: () -> Unit) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("A little better, every day.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text("Your wellness, in one place.", color = Muted)
        }
        item {
            if (!ui.profileReady) {
                WellnessCard(Sage) {
                    Text("Set up your profile", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Tell us a bit about you to get a personalised plan.", color = Muted)
                    Button(onClick = onProfile, modifier = Modifier.testTag("today_setup_profile")) { Text("Create profile") }
                }
            } else {
                WellnessCard(Coral) {
                    Text("Good morning${if (ui.name.isBlank()) "" else ", ${ui.name}"}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Your targets are ready for today.", color = Muted)
                    Text("${(ui.calorieTarget - ui.caloriesLogged).coerceAtLeast(0)} kcal remaining", style = MaterialTheme.typography.headlineSmall, color = Teal, fontWeight = FontWeight.Bold)
                    LinearProgressIndicator(progress = { if (ui.calorieTarget == 0) 0f else (ui.caloriesLogged.toFloat() / ui.calorieTarget).coerceIn(0f, 1f) }, modifier = Modifier.fillMaxWidth())
                    Text("${ui.proteinLogged.toInt()} of ${ui.proteinTarget} g protein", color = Muted)
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SummaryMetric("Steps", ui.steps.toString(), Icons.Default.DirectionsWalk, Modifier.weight(1f))
                SummaryMetric("Water", "${ui.water}/8", Icons.Default.WaterDrop, Modifier.weight(1f))
            }
        }
        item {
            WellnessCard(Mint) {
                Text("Small actions", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Keep your next step simple.", color = Muted)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedButton(onClick = vm::addWater, modifier = Modifier.weight(1f).testTag("today_add_water")) { Text("+ Water") }
                    OutlinedButton(onClick = vm::addSteps, modifier = Modifier.weight(1f).testTag("today_add_steps")) { Text("+ Steps") }
                }
            }
        }
        if (ui.message.isNotBlank()) item { Text(ui.message, color = Teal, modifier = Modifier.testTag("status_message")) }
    }
}

@Composable
private fun FoodScreen(ui: NativeUiState, vm: NativeViewModel) {
    var showFoodPicker by rememberSaveable { mutableStateOf(false) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Food diary", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text("Log meals without changing anything else in the app.", color = Muted)
        }
        item {
            Button(onClick = { showFoodPicker = true }, modifier = Modifier.fillMaxWidth().testTag("food_add_button"), shape = RoundedCornerShape(14.dp)) {
                Icon(Icons.Default.Add, null)
                Spacer(Modifier.width(8.dp))
                Text("Add food")
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                SummaryMetric("Calories", ui.caloriesLogged.toString(), Icons.Default.LocalFireDepartment, Modifier.weight(1f))
                SummaryMetric("Protein", "${ui.proteinLogged.toInt()} g", Icons.Default.FitnessCenter, Modifier.weight(1f))
            }
        }
        item { Text("Today", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal) }
        if (ui.foods.isEmpty()) item { EmptyState("No food logged yet", "Tap Add food and choose a meal.") }
        else items(ui.foods, key = { "${it.name}-${it.meal}-${it.calories}-${it.protein}" }) { food -> FoodRow(food) }
    }
    if (showFoodPicker) FoodPickerDialog(vm) { showFoodPicker = false }
}

@Composable
private fun FoodPickerDialog(vm: NativeViewModel, close: () -> Unit) {
    val choices = listOf(
        FoodEntry("Paneer bowl", "Lunch", 265, 18.0),
        FoodEntry("Dal rice", "Lunch", 390, 14.0),
        FoodEntry("Masala oats", "Breakfast", 220, 9.0),
        FoodEntry("Fruit bowl", "Snack", 140, 2.0)
    )
    AlertDialog(
        onDismissRequest = close,
        title = { Text("Choose food") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                choices.forEach { food ->
                    OutlinedButton(
                        onClick = { vm.logFood(food); close() },
                        modifier = Modifier.fillMaxWidth().testTag("food_choice_${food.name.lowercase().replace(" ", "_")}")
                    ) {
                        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.Start) {
                            Text(food.name, fontWeight = FontWeight.Bold)
                            Text("${food.meal} · ${food.calories} kcal · ${food.protein.toInt()} g protein", color = Muted)
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = close) { Text("Cancel") } }
    )
}

@Composable
private fun MoveScreen(ui: NativeUiState, vm: NativeViewModel) {
    val sessions = listOf("Full Body Basics" to "20 min · Strength", "Energy Boost" to "15 min · Cardio", "Mobility Flow" to "10 min · Mobility")
    var started by rememberSaveable { mutableStateOf<String?>(null) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Move", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text("Simple workouts to build strength, energy, and consistency.", color = Muted)
        }
        items(sessions) { (name, detail) ->
            WellnessCard(if (name == "Full Body Basics") Coral else Sage) {
                Text(name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(detail, color = Muted)
                Button(onClick = { started = name; vm.completeWorkout(name) }, modifier = Modifier.testTag("workout_${name.lowercase().replace(" ", "_")}")) {
                    Icon(if (started == name) Icons.Default.Check else Icons.Default.PlayArrow, null)
                    Spacer(Modifier.width(6.dp))
                    Text(if (started == name) "Completed" else "Start session")
                }
            }
        }
        item { if (started != null) Text("${started} completed. It is counted only in Move.", color = Teal) }
    }
}

@Composable
private fun JourneyScreen(ui: NativeUiState, vm: NativeViewModel) {
    var mood by rememberSaveable(ui.mood) { mutableStateOf(ui.mood) }
    var note by rememberSaveable(ui.recoveryNote) { mutableStateOf(ui.recoveryNote) }
    val moods = listOf("Low", "Okay", "Steady", "Good", "Great")
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Journey", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text("Check in, reflect, and support your recovery.", color = Muted)
        }
        item {
            WellnessCard(Sage) {
                Text("How are you feeling today?", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Take a quick check-in to track your recovery and overall well-being.", color = Muted)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                    moods.forEach { option ->
                        FilterChip(selected = mood == option, onClick = { mood = option }, label = { Text(option, style = MaterialTheme.typography.labelSmall) }, modifier = Modifier.weight(1f))
                    }
                }
                OutlinedTextField(value = note, onValueChange = { note = it }, label = { Text("Anything you’d like to note?") }, placeholder = { Text("Energy, mood, sleep, cravings…") }, modifier = Modifier.fillMaxWidth().testTag("journey_note"))
                Button(onClick = { vm.saveRecovery(mood.ifBlank { "Steady" }, note) }, modifier = Modifier.fillMaxWidth().testTag("journey_save")) {
                    Icon(Icons.Default.Check, null)
                    Spacer(Modifier.width(6.dp))
                    Text(if (ui.recoverySaved) "Check-in saved" else "Save check-in")
                }
            }
        }
        if (ui.message.isNotBlank()) item { Text(ui.message, color = Teal, modifier = Modifier.testTag("status_message")) }
    }
}

@Composable
private fun ReportsScreen(ui: NativeUiState) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Reports", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text("Your progress and trends over time.", color = Muted)
        }
        item {
            WellnessCard(Sage) {
                Text("This week", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Food logged: ${ui.foods.size}", color = Muted)
                Text("Workouts completed: ${ui.workoutsCompleted}", color = Muted)
                Text("Check-ins saved: ${if (ui.recoverySaved) 1 else 0}", color = Muted)
                if (ui.foods.isEmpty() && ui.workoutsCompleted == 0 && !ui.recoverySaved) Text("Start logging to see your weekly summary.", color = DarkTeal, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun ProfileDialog(ui: NativeUiState, vm: NativeViewModel, close: () -> Unit) {
    var name by rememberSaveable { mutableStateOf(ui.name) }
    var calories by rememberSaveable { mutableStateOf(if (ui.calorieTarget == 0) "" else ui.calorieTarget.toString()) }
    var protein by rememberSaveable { mutableStateOf(if (ui.proteinTarget == 0) "" else ui.proteinTarget.toString()) }
    AlertDialog(
        onDismissRequest = close,
        title = { Text("Your profile") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(name, { name = it }, label = { Text("Name") }, singleLine = true)
                OutlinedTextField(calories, { calories = it.filter(Char::isDigit) }, label = { Text("Daily calories") }, singleLine = true)
                OutlinedTextField(protein, { protein = it.filter(Char::isDigit) }, label = { Text("Daily protein (g)") }, singleLine = true)
                Text("Targets are saved only when you press Save.", color = Muted, style = MaterialTheme.typography.bodySmall)
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val kcal = calories.toIntOrNull()
                    val grams = protein.toIntOrNull()
                    if (name.isNotBlank() && kcal != null && kcal > 0 && grams != null && grams > 0) {
                        vm.saveProfile(name, kcal, grams)
                        close()
                    }
                },
                modifier = Modifier.testTag("profile_save")
            ) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = close) { Text("Cancel") } }
    )
}

@Composable
private fun WellnessCard(color: Color, content: @Composable ColumnScope.() -> Unit) {
    Card(shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = color)) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp), content = content)
    }
}

@Composable
private fun SummaryMetric(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
        Column(Modifier.padding(14.dp)) {
            Icon(icon, null, tint = Teal)
            Text(title, color = Muted, style = MaterialTheme.typography.labelMedium)
            Text(value, color = DarkTeal, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun FoodRow(food: FoodEntry) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
        ListItem(
            headlineContent = { Text(food.name, fontWeight = FontWeight.Bold) },
            supportingContent = { Text("${food.meal} · ${food.calories} kcal · ${food.protein.toInt()} g protein", color = Muted) },
            leadingContent = { Icon(Icons.Default.Restaurant, null, tint = Teal) }
        )
    }
}

@Composable
private fun EmptyState(title: String, body: String) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Sage)) {
        Column(Modifier.fillMaxWidth().padding(18.dp)) {
            Text(title, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text(body, color = Muted)
        }
    }
}

private fun tabIcon(tab: AppTab) = when (tab) {
    AppTab.TODAY -> Icons.Default.Home
    AppTab.FOOD -> Icons.Default.Restaurant
    AppTab.MOVE -> Icons.Default.DirectionsRun
    AppTab.JOURNEY -> Icons.Default.AutoStories
    AppTab.REPORTS -> Icons.Default.BarChart
}

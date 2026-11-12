
package com.rishikesht775.nutriguide

import android.app.Application
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

private val Teal = Color(0xff177d72)
private val DarkTeal = Color(0xff173f3d)
private val Cream = Color(0xfffbfaf4)
private val Sage = Color(0xffedf7ee)
private val Coral = Color(0xffffeee6)
private val Lilac = Color(0xfff0f1fb)
private val Mint = Color(0xffeaf7f5)
private val Border = Color(0xffd9e7df)
private val Muted = Color(0xff5b7470)

enum class AppTab(val title: String) { TODAY("Today"), FOOD("Food"), MOVE("Move"), JOURNEY("Journey"), REPORTS("Reports") }
enum class AuthStatus { CHECKING, SIGNED_OUT, SIGNED_IN }
data class FoodEntry(val name: String, val meal: String, val calories: Int, val protein: Double, val date: String = LocalDate.now().toString())
data class Workout(val name: String, val detail: String, val category: String, val tone: Color)
internal fun safeFinite(value: Double, fallback: Double = 0.0): Double = if (value.isFinite()) value else fallback
internal fun safeLocalDate(value: String): String = runCatching { LocalDate.parse(value) }.getOrElse { LocalDate.now() }.toString()
data class NativeUiState(
    val auth: AuthStatus = AuthStatus.CHECKING, val authEmail: String = "", val authBusy: Boolean = false,
    val tab: AppTab = AppTab.TODAY, val profileReady: Boolean = false, val name: String = "",
    val calorieTarget: Int = 0, val proteinTarget: Int = 0, val caloriesLogged: Int = 0, val proteinLogged: Double = 0.0,
    val foods: List<FoodEntry> = emptyList(), val workoutsCompleted: Int = 0, val mood: String = "",
    val recoveryNote: String = "", val steps: Int = 0, val water: Int = 0, val message: String = "", val confirmation: String = ""
)

class NativeViewModel(app: Application) : AndroidViewModel(app) {
    private val api = NativeApi(app)
    private var testMode = false
    private val store = NativeStore(app)
    var ui by mutableStateOf(NativeUiState())
        private set

    init { checkSession() }

    private fun checkSession() {
        if (testMode) return
        viewModelScope.launch {
            try {
                val response = withContext(Dispatchers.IO) { api.request("/api/account/session", null) }
                if (response.optBoolean("authenticated")) {
                    val user = response.optJSONObject("user")
                    openAccount(user?.optString("email").orEmpty(), user?.optString("name").orEmpty())
                } else ui = ui.copy(auth = AuthStatus.SIGNED_OUT)
            } catch (_: Exception) { ui = ui.copy(auth = AuthStatus.SIGNED_OUT) }
        }
    }

    private fun openAccount(email: String, displayName: String) {
        if (email.isBlank()) { ui = ui.copy(auth = AuthStatus.SIGNED_OUT, message = "The account session did not include an email address."); return }
        val normalizedEmail = email.trim().lowercase(Locale.ROOT)
        store.switchOwner("email:$normalizedEmail", normalizedEmail)
        val saved = store.snapshot()
        val foods = mutableListOf<FoodEntry>()
        val array = saved.optJSONArray("foods") ?: JSONArray()
        for (i in 0 until array.length()) {
            val item = array.optJSONObject(i) ?: continue
            val foodName = item.optString("name").trim()
            if (foodName.isBlank()) continue
            foods += FoodEntry(
                foodName,
                item.optString("meal", "Snacks"),
                item.optInt("calories", 0).coerceAtLeast(0),
                safeFinite(item.optDouble("protein", 0.0)).coerceAtLeast(0.0),
                safeLocalDate(item.optString("date", LocalDate.now().toString()))
            )
        }
        ui = NativeUiState(
            auth = AuthStatus.SIGNED_IN, authEmail = normalizedEmail, name = saved.optString("name", displayName),
            tab = runCatching { AppTab.valueOf(saved.optString("tab", AppTab.TODAY.name)) }.getOrDefault(AppTab.TODAY),
            profileReady = saved.optBoolean("profileReady"), calorieTarget = saved.optInt("calorieTarget", 0).coerceAtLeast(0),
            proteinTarget = saved.optInt("proteinTarget", 0).coerceAtLeast(0), caloriesLogged = saved.optInt("caloriesLogged", 0).coerceAtLeast(0),
            proteinLogged = safeFinite(saved.optDouble("proteinLogged", 0.0)).coerceAtLeast(0.0), foods = foods, workoutsCompleted = saved.optInt("workoutsCompleted", 0).coerceAtLeast(0),
            mood = saved.optString("mood"), recoveryNote = saved.optString("recoveryNote"),
            steps = saved.optInt("steps", 0).coerceAtLeast(0), water = saved.optInt("water", 0).coerceAtLeast(0)
        )
    }

    private fun persist(next: NativeUiState, message: String = "") {
        val safeFoods = next.foods.mapNotNull { food ->
            val name = food.name.trim()
            if (name.isBlank()) null else food.copy(
                name = name,
                calories = food.calories.coerceAtLeast(0),
                protein = safeFinite(food.protein).coerceAtLeast(0.0),
                date = safeLocalDate(food.date)
            )
        }
        val normalized = next.copy(
            caloriesLogged = next.caloriesLogged.coerceAtLeast(0),
            proteinLogged = safeFinite(next.proteinLogged).coerceAtLeast(0.0),
            workoutsCompleted = next.workoutsCompleted.coerceAtLeast(0),
            steps = next.steps.coerceAtLeast(0),
            water = next.water.coerceAtLeast(0),
            foods = safeFoods
        )
        ui = normalized.copy(message = message)
        if (normalized.auth != AuthStatus.SIGNED_IN) return
        store.put("tab", normalized.tab.name); store.put("profileReady", normalized.profileReady); store.put("name", normalized.name)
        store.put("calorieTarget", normalized.calorieTarget); store.put("proteinTarget", normalized.proteinTarget)
        store.put("caloriesLogged", normalized.caloriesLogged); store.put("proteinLogged", normalized.proteinLogged)
        store.put("workoutsCompleted", normalized.workoutsCompleted); store.put("mood", normalized.mood)
        store.put("recoveryNote", normalized.recoveryNote); store.put("steps", normalized.steps); store.put("water", normalized.water)
        val foods = JSONArray()
        normalized.foods.forEach { f -> foods.put(JSONObject().put("name", f.name).put("meal", f.meal).put("calories", f.calories).put("protein", f.protein).put("date", f.date)) }
        store.put("foods", foods)
    }

    fun enableTestMode() {
        testMode = true
        api.clear()
        ui = NativeUiState(
            auth = AuthStatus.SIGNED_IN,
            authEmail = "automation@example.test",
            name = "",
            profileReady = false,
            calorieTarget = 0,
            proteinTarget = 0
        )
    }

    fun select(tab: AppTab) = persist(ui.copy(tab = tab))
    fun saveProfile(name: String, calories: Int, protein: Int) = persist(ui.copy(profileReady = true, name = name.trim(), calorieTarget = calories, proteinTarget = protein), "Profile saved")
    fun addWater() = persist(ui.copy(water = (ui.water + 1).coerceAtMost(12)), "Water logged")
    fun addSteps() = persist(ui.copy(steps = ui.steps + 500), "500 steps added")
    fun logFood(food: FoodEntry) = persist(ui.copy(foods = ui.foods + food, caloriesLogged = ui.caloriesLogged + food.calories, proteinLogged = ui.proteinLogged + food.protein), "${food.name} added to ${food.meal}")
    fun completeWorkout(name: String) = persist(ui.copy(workoutsCompleted = ui.workoutsCompleted + 1), "${name} completed")
    fun saveRecovery(mood: String, note: String) = persist(ui.copy(mood = mood, recoveryNote = note.trim()), "Check-in saved")

    fun signIn(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) { ui = ui.copy(message = "Enter your email and password."); return }
        val requestedEmail = email.trim().lowercase(Locale.ROOT)
        api.clear()
        ui = ui.copy(authBusy = true, message = "")
        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) { api.request("/api/account/sign-in", JSONObject().put("email", requestedEmail).put("password", password)) }
                val session = withContext(Dispatchers.IO) { api.request("/api/account/session", null) }
                val user = session.optJSONObject("user")
                val sessionEmail = user?.optString("email").orEmpty().trim().lowercase(Locale.ROOT)
                if (!session.optBoolean("authenticated") || sessionEmail.isBlank() || sessionEmail != requestedEmail) {
                    throw Exception("The server returned a different account session. Please sign in again.")
                }
                openAccount(sessionEmail, user?.optString("name").orEmpty())
            } catch (e: Exception) { ui = ui.copy(authBusy = false, message = e.message ?: "Sign-in failed. Check your credentials and confirm your email.") }
        }
    }

    fun signUp(name: String, email: String, password: String, confirm: String) {
        if (name.isBlank() || email.isBlank() || password.length !in 12..128 || password != confirm) {
            ui = ui.copy(message = "Enter your name and matching passwords of 12–128 characters."); return
        }
        api.clear()
        ui = ui.copy(authBusy = true, message = "")
        viewModelScope.launch {
            try {
                val result = withContext(Dispatchers.IO) { api.request("/api/account/sign-up", JSONObject().put("name", name.trim()).put("email", email.trim()).put("password", password).put("confirmPassword", confirm)) }
                ui = ui.copy(authBusy = false, confirmation = result.optString("message", "Check your email to confirm your account."))
            } catch (e: Exception) { ui = ui.copy(authBusy = false, message = e.message ?: "Account creation could not be completed.") }
        }
    }

    fun resetPassword(email: String) {
        if (email.isBlank()) { ui = ui.copy(message = "Enter your email address."); return }
        ui = ui.copy(authBusy = true, message = "")
        viewModelScope.launch {
            try {
                val result = withContext(Dispatchers.IO) { api.request("/api/account/request-reset", JSONObject().put("email", email.trim())) }
                ui = ui.copy(authBusy = false, confirmation = result.optString("message", "If an account exists for this email, a reset link will be sent."))
            } catch (e: Exception) { ui = ui.copy(authBusy = false, message = e.message ?: "The reset email could not be sent.") }
        }
    }

    fun clearConfirmation() { ui = ui.copy(confirmation = "", message = "") }
    fun logout() {
        viewModelScope.launch {
            runCatching { withContext(Dispatchers.IO) { api.request("/api/account/logout", JSONObject()) } }
            api.clear(); store.switchOwner("guest", ""); ui = NativeUiState(auth = AuthStatus.SIGNED_OUT)
        }
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(251, 250, 244)
        window.navigationBarColor = android.graphics.Color.rgb(23, 63, 61)
        val testMode = intent.getBooleanExtra("NUTRIGUIDE_TEST_MODE", false)
        setContent { NutriGuideApp(testMode = testMode) }
    }
}

@Composable
fun NutriGuideApp(vm: NativeViewModel = viewModel(), testMode: Boolean = false) {
    if (testMode) LaunchedEffect(Unit) { vm.enableTestMode() }
    val ui = vm.ui
    MaterialTheme(colorScheme = lightColorScheme(primary = Teal, onPrimary = Color.White, background = Cream, surface = Color.White, onSurface = DarkTeal)) {
        if (ui.auth != AuthStatus.SIGNED_IN) AuthScreen(ui, vm) else MainShell(ui, vm)
    }
}

@Composable
private fun AuthScreen(ui: NativeUiState, vm: NativeViewModel) {
    var mode by rememberSaveable { mutableStateOf("sign-in") }
    var reset by rememberSaveable { mutableStateOf(false) }
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirm by rememberSaveable { mutableStateOf("") }

    Surface(Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding(), color = Cream) {
        Column(Modifier.fillMaxSize().padding(22.dp).verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(24.dp)); Text("🍃", style = MaterialTheme.typography.displaySmall)
            Text("NutriGuide", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text("Your wellness, in one place", color = Muted); Spacer(Modifier.height(22.dp))
            if (ui.confirmation.isNotBlank()) {
                Card(colors = CardDefaults.cardColors(containerColor = Sage), shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth().testTag("auth_confirmation")) {
                    Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Check your email", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = DarkTeal)
                        Text(ui.confirmation, color = Muted)
                        Button(onClick = { vm.clearConfirmation(); reset = false; mode = "sign-in" }, modifier = Modifier.fillMaxWidth()) { Text("Return to sign in") }
                    }
                }
            } else {
                Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth().testTag("auth_card")) {
                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(if (reset) "Reset your password" else if (mode == "sign-up") "Create your account" else "Welcome back", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = DarkTeal)
                        Text(if (reset) "We’ll send a secure reset link to your email." else "Save your nutrition, movement and recovery in your own account.", color = Muted)
                        if (!reset) Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FilterChip(selected = mode == "sign-in", onClick = { mode = "sign-in" }, label = { Text("Sign in") }, modifier = Modifier.weight(1f).testTag("auth_sign_in_tab"))
                            FilterChip(selected = mode == "sign-up", onClick = { mode = "sign-up" }, label = { Text("Create account") }, modifier = Modifier.weight(1f).testTag("auth_sign_up_tab"))
                        }
                        if (mode == "sign-up" && !reset) OutlinedTextField(name, { name = it }, label = { Text("Name") }, singleLine = true, modifier = Modifier.fillMaxWidth().testTag("auth_name"))
                        OutlinedTextField(email, { email = it }, label = { Text("Email address") }, singleLine = true, modifier = Modifier.fillMaxWidth().testTag("auth_email"))
                        if (!reset) {
                            OutlinedTextField(password, { password = it }, label = { Text("Password") }, singleLine = true, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth().testTag("auth_password"))
                            if (mode == "sign-up") OutlinedTextField(confirm, { confirm = it }, label = { Text("Confirm password") }, singleLine = true, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth().testTag("auth_confirm"))
                        }
                        Button(onClick = { if (reset) vm.resetPassword(email) else if (mode == "sign-up") vm.signUp(name, email, password, confirm) else vm.signIn(email, password) }, enabled = !ui.authBusy, modifier = Modifier.fillMaxWidth().testTag("auth_submit")) {
                            Text(if (ui.authBusy) "Please wait…" else if (reset) "Send reset link" else if (mode == "sign-up") "Create account" else "Sign in")
                        }
                        TextButton(onClick = { reset = !reset; vm.clearConfirmation() }, modifier = Modifier.align(Alignment.CenterHorizontally).testTag("auth_reset")) { Text(if (reset) "Back to sign in" else "Forgot password?") }
                        if (ui.message.isNotBlank()) Text(ui.message, color = Color(0xffa13d3d), modifier = Modifier.testTag("auth_message"))
                        if (mode == "sign-up" && !reset) Text("Use 12–128 characters for your password.", color = Muted, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            Spacer(Modifier.height(18.dp)); Text("Each account starts with its own private wellness data.", color = Muted, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun MainShell(ui: NativeUiState, vm: NativeViewModel) {
    var account by rememberSaveable { mutableStateOf(false) }
    var notifications by rememberSaveable { mutableStateOf(false) }
    var profile by rememberSaveable { mutableStateOf(false) }
    Scaffold(
        containerColor = Cream,
        topBar = { AppHeader(ui.tab, { account = true }, { notifications = true }) },
        bottomBar = {
            NavigationBar(containerColor = DarkTeal, modifier = Modifier.navigationBarsPadding()) {
                AppTab.entries.forEach { tab ->
                    NavigationBarItem(modifier = Modifier.testTag("nav_${tab.title.lowercase()}"), selected = ui.tab == tab, onClick = { vm.select(tab) }, icon = { Icon(tabIcon(tab), tab.title) }, label = { Text(tab.title) }, colors = NavigationBarItemDefaults.colors(selectedIconColor = DarkTeal, selectedTextColor = DarkTeal, indicatorColor = Color(0xffd8f0e5), unselectedIconColor = Color.White, unselectedTextColor = Color.White))
                }
            }
        }
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            when (ui.tab) {
                AppTab.TODAY -> TodayScreen(ui, vm) { profile = true }
                AppTab.FOOD -> FoodScreen(ui, vm)
                AppTab.MOVE -> MoveScreen(ui, vm)
                AppTab.JOURNEY -> JourneyScreen(ui, vm)
                AppTab.REPORTS -> ReportsScreen(ui, vm)
            }
        }
    }
    if (account) AccountSheet(ui, vm) { account = false }
    if (profile) ProfileDialog(ui, vm) { profile = false }
    if (notifications) AlertDialog(onDismissRequest = { notifications = false }, title = { Text("Notifications") }, text = { Text("No new notifications yet.") }, confirmButton = { TextButton(onClick = { notifications = false }) { Text("Close") } })
}

@Composable
private fun AppHeader(tab: AppTab, onAccount: () -> Unit, onNotifications: () -> Unit) {
    Surface(color = Cream, modifier = Modifier.statusBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("🍃", style = MaterialTheme.typography.titleLarge); Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) { Text("NutriGuide", color = DarkTeal, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge); Text(tab.title, color = Muted, style = MaterialTheme.typography.labelMedium) }
            IconButton(onClick = onNotifications) { Icon(Icons.Default.NotificationsNone, "Notifications", tint = DarkTeal) }
            IconButton(onClick = onAccount) { Icon(Icons.Default.AccountCircle, "Account", tint = Teal) }
        }
    }
}


@Composable
private fun TodayScreen(ui: NativeUiState, vm: NativeViewModel, onProfile: () -> Unit) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Text("Today", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal)
            Text("Your wellness, in one place", color = Muted)
        }
        item {
            PreviewCard(Sage) {
                Text("Set up your profile", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal)
                Text(if (ui.profileReady) "Your personalized targets are ready." else "Tell us a bit about you to get a personalized plan.", color = Muted)
                if (!ui.profileReady) {
                    Button(onClick = onProfile, modifier = Modifier.testTag("today_setup_profile")) { Text("Set up profile") }
                } else {
                    Text("${ui.calorieTarget} kcal · ${ui.proteinTarget} g protein target", color = Teal, fontWeight = FontWeight.SemiBold)
                }
            }
        }
        item {
            PreviewCard(Coral) {
                Text(if (ui.foods.isEmpty()) "No food logged yet" else "${ui.foods.size} food entries today", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal)
                Text(if (ui.foods.isEmpty()) "Start your food diary to build healthy habits." else "${ui.caloriesLogged} kcal · ${ui.proteinLogged.toInt()} g protein logged", color = Muted)
                OutlinedButton(onClick = { vm.select(AppTab.FOOD) }, modifier = Modifier.testTag("today_add_food")) { Text("Add food") }
            }
        }
        item {
            PreviewCard(Lilac) {
                Text(if (ui.workoutsCompleted == 0) "No workouts yet" else "${ui.workoutsCompleted} workout completed", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal)
                Text(if (ui.workoutsCompleted == 0) "Choose a workout and get moving today." else "Nice work. Keep your movement consistent.", color = Muted)
                OutlinedButton(onClick = { vm.select(AppTab.MOVE) }, modifier = Modifier.testTag("today_browse_workouts")) { Text("Browse workouts") }
            }
        }
        item {
            PreviewCard(Mint) {
                Text(if (ui.mood.isBlank()) "No check-ins yet" else "Check-in saved: ${ui.mood}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal)
                Text(if (ui.mood.isBlank()) "Check in with how you're feeling and track your recovery." else "Your recovery note is saved for this account.", color = Muted)
                OutlinedButton(onClick = { vm.select(AppTab.JOURNEY) }, modifier = Modifier.testTag("today_check_in")) { Text("Do a check-in") }
            }
        }
        item {
            PreviewCard(Color.White) {
                Text("Daily rhythm", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SmallMetric("Steps", ui.steps.toString(), Modifier.weight(1f))
                    SmallMetric("Water", "${ui.water}/8", Modifier.weight(1f))
                    SmallMetric("Calories", ui.caloriesLogged.toString(), Modifier.weight(1f))
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = vm::addSteps, modifier = Modifier.weight(1f).testTag("today_add_steps")) { Text("+500 steps") }
                    OutlinedButton(onClick = vm::addWater, modifier = Modifier.weight(1f).testTag("today_add_water")) { Text("+ water") }
                }
            }
        }
        if (ui.message.isNotBlank()) {
            item { Text(ui.message, color = Teal, modifier = Modifier.testTag("status_message")) }
        }
    }
}

@Composable
private fun ProfileDialog(ui: NativeUiState, vm: NativeViewModel, close: () -> Unit) {
    var name by rememberSaveable(ui.name) { mutableStateOf(ui.name) }
    var calories by rememberSaveable(ui.calorieTarget) { mutableStateOf(if (ui.calorieTarget == 0) "" else ui.calorieTarget.toString()) }
    var protein by rememberSaveable(ui.proteinTarget) { mutableStateOf(if (ui.proteinTarget == 0) "" else ui.proteinTarget.toString()) }
    AlertDialog(
        onDismissRequest = close,
        title = { Text("Set up your profile") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Tell us a bit about you to get a personalized plan.", color = Muted)
                OutlinedTextField(name, { name = it }, label = { Text("Your name") }, singleLine = true, modifier = Modifier.fillMaxWidth().testTag("profile_name"))
                OutlinedTextField(calories, { calories = it.filter(Char::isDigit).take(5) }, label = { Text("Daily calorie target") }, singleLine = true, modifier = Modifier.fillMaxWidth().testTag("profile_calories"))
                OutlinedTextField(protein, { protein = it.filter(Char::isDigit).take(4) }, label = { Text("Daily protein target (g)") }, singleLine = true, modifier = Modifier.fillMaxWidth().testTag("profile_protein"))
            }
        },
        confirmButton = {
            Button(onClick = {
                vm.saveProfile(name, calories.toIntOrNull()?.coerceAtLeast(1) ?: 1800, protein.toIntOrNull()?.coerceAtLeast(1) ?: 100)
                close()
            }, modifier = Modifier.testTag("profile_save")) { Text("Save profile") }
        },
        dismissButton = { TextButton(onClick = close) { Text("Cancel") } }
    )
}

@Composable
private fun FoodScreen(ui: NativeUiState, vm: NativeViewModel) {
    var showPicker by rememberSaveable { mutableStateOf(false) }
    val meals = listOf("Breakfast", "Lunch", "Dinner", "Snacks")
    var selectedDate by rememberSaveable { mutableStateOf(LocalDate.now().toString()) }
    val day = runCatching { LocalDate.parse(selectedDate) }.getOrElse { LocalDate.now() }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("Food diary", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal); Text("Log your meals and build balanced habits", color = Muted) }
        item { PreviewCard(Color.White) { Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) { IconButton(onClick = { selectedDate = day.minusDays(1).toString() }) { Icon(Icons.Default.ChevronLeft, "Previous day", tint = DarkTeal) }; Column(horizontalAlignment = Alignment.CenterHorizontally) { Text(if (day == LocalDate.now()) "Today" else day.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.getDefault()), color = Muted, style = MaterialTheme.typography.labelMedium); Text(day.format(DateTimeFormatter.ofPattern("MMM d", Locale.getDefault())), fontWeight = FontWeight.Bold, color = DarkTeal) }; IconButton(onClick = { selectedDate = day.plusDays(1).toString() }) { Icon(Icons.Default.ChevronRight, "Next day", tint = DarkTeal) } } } }
        meals.forEach { meal -> item { MealRow(meal, ui.foods.filter { it.date == selectedDate && it.meal == meal }) } }
        item { Button(onClick = { showPicker = true }, modifier = Modifier.fillMaxWidth().testTag("food_add_button"), shape = RoundedCornerShape(16.dp)) { Icon(Icons.Default.Add, null); Spacer(Modifier.width(8.dp)); Text("Add food") } }
    }
    if (showPicker) FoodPicker(vm) { showPicker = false }
}

@Composable
private fun MealRow(meal: String, entries: List<FoodEntry>) {
    PreviewCard(if (meal == "Breakfast") Sage else Color.White) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) { Text(meal, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = DarkTeal, modifier = Modifier.weight(1f)); Text(if (entries.isEmpty()) "No entries" else "${entries.size} item${if (entries.size == 1) "" else "s"}", color = Muted) }
        if (entries.isEmpty()) Text("Tap Add food to log this meal.", color = Muted, style = MaterialTheme.typography.bodySmall)
        entries.forEach { food -> Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) { Text(food.name, color = DarkTeal); Text("${food.calories} kcal · ${food.protein.toInt()} g", color = Muted, style = MaterialTheme.typography.bodySmall) } }
    }
}

@Composable
private fun FoodPicker(vm: NativeViewModel, close: () -> Unit) {
    val choices = listOf(FoodEntry("Masala oats", "Breakfast", 220, 9.0), FoodEntry("Paneer bowl", "Lunch", 265, 18.0), FoodEntry("Dal rice", "Dinner", 390, 14.0), FoodEntry("Fruit bowl", "Snacks", 140, 2.0))
    AlertDialog(onDismissRequest = close, title = { Text("Choose food") }, text = { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { choices.forEach { food -> OutlinedButton(onClick = { vm.logFood(food); close() }, modifier = Modifier.fillMaxWidth().testTag("food_choice_${food.name.lowercase().replace(" ", "_")}")) { Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.Start) { Text(food.name, fontWeight = FontWeight.Bold, color = DarkTeal); Text("${food.meal} · ${food.calories} kcal · ${food.protein.toInt()} g protein", color = Muted, style = MaterialTheme.typography.bodySmall) } } } } }, confirmButton = { TextButton(onClick = close) { Text("Cancel") } })
}

@Composable
private fun MoveScreen(ui: NativeUiState, vm: NativeViewModel) {
    val sessions = listOf(Workout("Full Body Basics", "20 min · Strength", "Strength", Coral), Workout("Energy Boost", "15 min · Cardio", "Cardio", Sage), Workout("Mobility Flow", "10 min · Mobility", "Mobility", Lilac))
    var category by rememberSaveable { mutableStateOf("All") }
    var started by rememberSaveable { mutableStateOf<String?>(null) }
    val filtered = sessions.filter { category == "All" || it.category == category }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("Move", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal); Text("Simple workouts to build strength, energy, and consistency", color = Muted) }
        item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(5.dp)) { listOf("All", "Strength", "Cardio", "Mobility").forEach { chip -> FilterChip(selected = category == chip, onClick = { category = chip }, label = { Text(chip) }, modifier = Modifier.weight(1f).testTag("move_filter_${chip.lowercase()}")) } } }
        items(filtered, key = { it.name }) { workout -> PreviewCard(workout.tone) { Text(workout.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal); Text(workout.detail, color = Muted); Button(onClick = { if (started != workout.name) { started = workout.name; vm.completeWorkout(workout.name) } }, modifier = Modifier.testTag("workout_${workout.name.lowercase().replace(" ", "_")}")) { Icon(if (started == workout.name) Icons.Default.Check else Icons.Default.PlayArrow, null); Spacer(Modifier.width(6.dp)); Text(if (started == workout.name) "Completed" else "Start session") } } }
    }
}

@Composable
private fun JourneyScreen(ui: NativeUiState, vm: NativeViewModel) {
    var mood by rememberSaveable(ui.mood) { mutableStateOf(ui.mood) }
    var note by rememberSaveable(ui.recoveryNote) { mutableStateOf(ui.recoveryNote) }
    val moods = listOf("Low", "Okay", "Steady", "Good", "Great")
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("Journey", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal); Text("Check in, reflect, and support your recovery", color = Muted) }
        item { PreviewCard(Sage) { Text("How are you feeling today?", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal); Text("Take a moment to reflect on your energy, mood, sleep, and cravings.", color = Muted); Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(5.dp)) { moods.forEach { option -> FilterChip(selected = mood == option, onClick = { mood = option }, label = { Text(option, style = MaterialTheme.typography.labelSmall) }, modifier = Modifier.weight(1f)) } }; OutlinedTextField(note, { note = it }, label = { Text("Anything you'd like to note?") }, placeholder = { Text("E.g., energy, mood, sleep, cravings…") }, modifier = Modifier.fillMaxWidth().testTag("journey_note")); Button(onClick = { vm.saveRecovery(mood.ifBlank { "Steady" }, note) }, modifier = Modifier.fillMaxWidth().testTag("journey_save")) { Icon(Icons.Default.Check, null); Spacer(Modifier.width(6.dp)); Text("Save check-in") } } }
        if (ui.message.isNotBlank()) item { Text(ui.message, color = Teal, modifier = Modifier.testTag("status_message")) }
    }
}

@Composable
private fun ReportsScreen(ui: NativeUiState, vm: NativeViewModel) {
    var range by rememberSaveable { mutableStateOf("Weekly") }
    var periodOffset by rememberSaveable { mutableIntStateOf(0) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("Reports", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = DarkTeal); Text("Your progress and trends over time", color = Muted) }
        item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) { FilterChip(selected = range == "Weekly", onClick = { range = "Weekly" }, label = { Text("Weekly") }, modifier = Modifier.weight(1f).testTag("reports_weekly")); FilterChip(selected = range == "Monthly", onClick = { range = "Monthly" }, label = { Text("Monthly") }, modifier = Modifier.weight(1f).testTag("reports_monthly")) } }
        item { PreviewCard(Color.White) { Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) { IconButton(onClick = { periodOffset-- }) { Icon(Icons.Default.ChevronLeft, "Previous period", tint = DarkTeal) }; Text(if (range == "Weekly") "Week " + periodOffset else "Month " + periodOffset, fontWeight = FontWeight.Bold, color = DarkTeal); IconButton(onClick = { periodOffset++ }) { Icon(Icons.Default.ChevronRight, "Next period", tint = DarkTeal) } } } }
        item { if (ui.foods.isEmpty() && ui.workoutsCompleted == 0 && ui.mood.isBlank()) PreviewCard(Sage) { Text("No weekly progress yet", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal); Text("Log your food, workouts, and check-ins to see your weekly summary and insights here.", color = Muted); Button(onClick = { vm.select(AppTab.FOOD) }, modifier = Modifier.testTag("reports_start_logging")) { Text("Start logging") } } else PreviewCard(Sage) { Text(if (range == "Weekly") "This week" else "This month", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = DarkTeal); Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) { SmallMetric("Food", ui.foods.size.toString(), Modifier.weight(1f)); SmallMetric("Move", ui.workoutsCompleted.toString(), Modifier.weight(1f)); SmallMetric("Check-ins", if (ui.mood.isBlank()) "0" else "1", Modifier.weight(1f)) } } }
    }
}

@Composable
private fun AccountSheet(ui: NativeUiState, vm: NativeViewModel, close: () -> Unit) {
    AlertDialog(onDismissRequest = close, title = { Text("Your account") }, text = { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { Text(ui.name.ifBlank { "NutriGuide member" }, fontWeight = FontWeight.Bold, color = DarkTeal); Text(ui.authEmail, color = Muted); Text("Your entries are stored separately for this account.", color = Muted, style = MaterialTheme.typography.bodySmall) } }, confirmButton = { Button(onClick = { close(); vm.logout() }, modifier = Modifier.testTag("account_logout")) { Text("Log out") } }, dismissButton = { TextButton(onClick = close) { Text("Close") } })
}

@Composable
private fun PreviewCard(color: Color, content: @Composable ColumnScope.() -> Unit) {
    Card(shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = color), border = BorderStroke(1.dp, Border), modifier = Modifier.fillMaxWidth()) { Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp), content = content) }
}

@Composable
private fun SmallMetric(label: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) { Text(value, color = Teal, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium); Text(label, color = Muted, style = MaterialTheme.typography.labelSmall) }
}

private fun tabIcon(tab: AppTab) = when (tab) {
    AppTab.TODAY -> Icons.Default.Home
    AppTab.FOOD -> Icons.Default.Restaurant
    AppTab.MOVE -> Icons.Default.DirectionsRun
    AppTab.JOURNEY -> Icons.Default.SelfImprovement
    AppTab.REPORTS -> Icons.Default.Insights
}

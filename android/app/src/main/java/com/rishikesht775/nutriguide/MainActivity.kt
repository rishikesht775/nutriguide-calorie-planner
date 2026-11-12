package com.rishikesht775.nutriguide

import android.os.Bundle
import android.app.Application
import org.json.JSONArray
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewmodel.compose.viewModel

private val Green = Color(0xff147d68)
private val Ink = Color(0xff183f38)
private val Soft = Color(0xfff3f9f4)

enum class AppTab(val label: String) { TODAY("Today"), FOOD("Food"), MOVE("Move"), JOURNEY("Journey"), REPORTS("Reports") }

data class NativeUiState(
    val tab: AppTab = AppTab.TODAY,
    val calories: Int = 0,
    val caloriesLogged: Int = 0,
    val protein: Double = 0.0,
    val proteinTarget: Int = 0,
    val steps: Int = 0,
    val water: Int = 0,
    val profileReady: Boolean = false,
    val foods: List<String> = emptyList(),
    val message: String = "",
    val workouts: Int = 0,
    val recoverySaved: Boolean = false
)

class NativeViewModel(app: Application) : AndroidViewModel(app) {
    private val prefs=app.getSharedPreferences("native-compose-state",0)
    var ui by mutableStateOf(load()); private set
    private fun load(): NativeUiState { val foods=prefs.getStringSet("foods",emptySet())!!.toList(); return NativeUiState(calories=prefs.getInt("calories",0),caloriesLogged=prefs.getInt("logged",0),protein=prefs.getFloat("protein",0f).toDouble(),proteinTarget=prefs.getInt("proteinTarget",0),steps=prefs.getInt("steps",0),water=prefs.getInt("water",0),profileReady=prefs.getBoolean("profile",false),foods=foods,workouts=prefs.getInt("workouts",0),recoverySaved=prefs.getBoolean("recovery",false)) }
    private fun save(next:NativeUiState){ui=next;prefs.edit().putInt("calories",next.calories).putInt("logged",next.caloriesLogged).putFloat("protein",next.protein.toFloat()).putInt("proteinTarget",next.proteinTarget).putInt("steps",next.steps).putInt("water",next.water).putBoolean("profile",next.profileReady).putStringSet("foods",next.foods.toSet()).putInt("workouts",next.workouts).putBoolean("recovery",next.recoverySaved).apply()}
    fun select(tab: AppTab){save(ui.copy(tab=tab,message=""))}
    fun addWater(){save(ui.copy(water=(ui.water+1).coerceAtMost(30),message="Water logged"))}
    fun addFood(name:String,calories:Int,protein:Double){save(ui.copy(foods=(ui.foods+name).distinct(),caloriesLogged=ui.caloriesLogged+calories,protein=ui.protein+protein,message="$name added"))}
    fun setupDemoProfile(){save(ui.copy(profileReady=true,calories=1950,proteinTarget=118,message="Profile saved"))}
    fun saveSteps(steps:Int){save(ui.copy(steps=steps,message="Steps saved"))}
    fun completeWorkout(){save(ui.copy(workouts=ui.workouts+1,message="Workout saved"))}
    fun saveRecovery(){save(ui.copy(recoverySaved=true,message="Recovery saved"))}
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { NutriGuideApp() } }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable fun NutriGuideApp(vm: NativeViewModel = viewModel()) {
    val ui = vm.ui
    MaterialTheme(colorScheme = lightColorScheme(primary = Green, onPrimary = Color.White, background = Soft, surface = Color.White, onSurface = Ink)) {
        Scaffold(
            containerColor = Soft,
            topBar = { CenterAlignedTopAppBar(title = { Text("NutriGuide", fontWeight = FontWeight.Bold) }, actions = { IconButton(onClick = {}) { Icon(Icons.Default.Person, "Account") } }) },
            bottomBar = { NavigationBar(containerColor = Color.White) { AppTab.entries.forEach { tab -> NavigationBarItem(modifier = Modifier.testTag("nav_${tab.label.lowercase()}"), selected = ui.tab == tab, onClick = { vm.select(tab) }, icon = { Icon(tabIcon(tab), tab.label) }, label = { Text(tab.label) }) } } },
            floatingActionButton = { if (ui.tab == AppTab.TODAY || ui.tab == AppTab.FOOD) FloatingActionButton(onClick = { vm.addFood("Quick add", 100, 5.0) }, containerColor = Green) { Icon(Icons.Default.Add, "Quick add") } }
        ) { padding -> Box(Modifier.padding(padding).fillMaxSize()) { when (ui.tab) { AppTab.TODAY -> TodayScreen(ui, vm); AppTab.FOOD -> FoodScreen(ui, vm); AppTab.MOVE -> MoveScreen(vm); AppTab.JOURNEY -> JourneyScreen(vm); AppTab.REPORTS -> ReportsScreen(ui) } } }
    }
}

@Composable private fun TodayScreen(ui: NativeUiState, vm: NativeViewModel) {
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { Text("Your daily wellness space", style = MaterialTheme.typography.labelLarge, color = Green); Text("A little better, every day.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold); Text("Food, movement and recovery in one place.", color = Color(0xff536f67)) }
        item { if (!ui.profileReady) SetupCard(vm) else SummaryCard(ui) }
        item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { MetricCard("Steps", ui.steps.toString(), Icons.Default.DirectionsWalk, Modifier.weight(1f)); MetricCard("Water", "${ui.water}/8", Icons.Default.WaterDrop, Modifier.weight(1f)) } }
        item { Text("Today’s focus", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold); Card(shape = RoundedCornerShape(20.dp)) { Column(Modifier.padding(18.dp)) { Text("Keep the next step simple", fontWeight = FontWeight.Bold); Text("Log one meal, take a comfortable walk, and protect your recovery time.", color = Color(0xff536f67)) } } }
        if (ui.message.isNotBlank()) item { Text(ui.message, color = Green) }
    }
}

@Composable private fun SetupCard(vm: NativeViewModel) { Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = Color(0xffeaf6ef))) { Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) { Text("Set up your personal plan", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold); Text("Your new account starts empty. Add your profile before personal calorie and protein targets are shown."); Button(onClick = vm::setupDemoProfile) { Text("Set up profile") } } } }

@Composable private fun SummaryCard(ui: NativeUiState) { Card(shape = RoundedCornerShape(22.dp)) { Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { Text("Today", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold); Text("${(ui.calories - ui.caloriesLogged).coerceAtLeast(0)} kcal remaining", style = MaterialTheme.typography.headlineSmall, color = Green, fontWeight = FontWeight.Bold); LinearProgressIndicator(progress = { (ui.caloriesLogged.toFloat() / ui.calories).coerceIn(0f, 1f) }, modifier = Modifier.fillMaxWidth()); Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("${ui.caloriesLogged} of ${ui.calories} kcal"); Text("${ui.protein.toInt()} of ${ui.proteinTarget} g protein") } } } }

@Composable private fun FoodScreen(ui: NativeUiState, vm: NativeViewModel) { LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { item { Text("Food diary", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold); Text("Search, review and log familiar Indian foods.", color = Color(0xff536f67)) }; item { OutlinedButton(onClick = { vm.addFood("Paneer", 265, 18.0) }, modifier = Modifier.fillMaxWidth()) { Icon(Icons.Default.Search, null); Spacer(Modifier.width(8.dp)); Text("Search foods") } }; item { Text("Today’s nutrition", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }; item { Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { MetricCard("Calories", ui.caloriesLogged.toString(), Icons.Default.LocalFireDepartment, Modifier.weight(1f)); MetricCard("Protein", "${ui.protein.toInt()} g", Icons.Default.FitnessCenter, Modifier.weight(1f)) } }; item { Text("Logged foods", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }; if (ui.foods.isEmpty()) item { Text("No food logged yet. Use the + button to add a quick entry.", color = Color(0xff536f67)) } else items(ui.foods) { food -> ListItem(headlineContent = { Text(food) }, leadingContent = { Icon(Icons.Default.Restaurant, null, tint = Green) }) } } }

@Composable private fun MoveScreen(vm: NativeViewModel) { LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { item { Text("Move", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold); Text("Choose a session that fits your energy today.", color = Color(0xff536f67)) }; items(listOf("Comfortable walking" to "10–30 min", "Chair squat" to "3 sets", "Wall push-up" to "3 sets", "Gentle mobility" to "10 min")) { (name, detail) -> Card { ListItem(headlineContent = { Text(name, fontWeight = FontWeight.Bold) }, supportingContent = { Text(detail) }, leadingContent = { Icon(Icons.Default.DirectionsRun, null, tint = Green) }, trailingContent = { Button(onClick = {}) { Text("Start") } }) } } } }

@Composable private fun JourneyScreen(vm: NativeViewModel) { LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { item { Text("Journey", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold); Text("Recovery and reflection belong beside food and movement.", color = Color(0xff536f67)) }; item { Card { Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) { Text("Today's check-in", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold); OutlinedTextField(value = "", onValueChange = {}, label = { Text("How are you feeling?") }, modifier = Modifier.fillMaxWidth()); Button(onClick = vm::saveRecovery) { Text("Save check-in") } } } } } }

@Composable
private fun ReportsScreen(ui: NativeUiState) {
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Text("Reports", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Your wellness rhythm this week.", color = Color(0xff536f67))
        }
        item {
            Card {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("This week", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Food logged: ${ui.foods.size}")
                    Text("Current protein: ${ui.protein.toInt()} g")
                    Text("Water today: ${ui.water} glasses")
                }
            }
        }
    }
}

@Composable private fun MetricCard(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier) { Card(modifier = modifier, shape = RoundedCornerShape(18.dp)) { Column(Modifier.padding(14.dp)) { Icon(icon, null, tint = Green); Text(title, color = Color(0xff536f67)); Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) } } }

private fun tabIcon(tab: AppTab) = when (tab) { AppTab.TODAY -> Icons.Default.Home; AppTab.FOOD -> Icons.Default.Restaurant; AppTab.MOVE -> Icons.Default.DirectionsRun; AppTab.JOURNEY -> Icons.Default.AutoStories; AppTab.REPORTS -> Icons.Default.BarChart }

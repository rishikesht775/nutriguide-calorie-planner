(function () {
  'use strict';

  const root = document.querySelector('.wrap');
  if (!root) return;
  const get = (id) => document.getElementById(id);
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const today = () => new Date().toISOString().slice(0, 10);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const style = document.createElement('style');
  style.textContent = `
    .ng-tab-section{display:none;margin-top:18px}
    .post-profile .ng-tab-section{display:block}
    .needs-profile .ng-tab-section{display:none!important}
    .ng-card{background:linear-gradient(135deg,#ffffffef,#f5fff8e8);border:1px solid var(--line);border-radius:24px;padding:22px;box-shadow:0 12px 30px #214b3110}
    .ng-card h2,.ng-card h3{margin:0 0 8px}.ng-sub{color:var(--muted);font-size:13px;line-height:1.5;margin:0 0 14px}
    .ng-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.ng-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .ng-metric{border:1px solid var(--line);background:#fff;border-radius:18px;padding:14px;min-height:108px}.ng-metric span{font-size:24px}.ng-metric b{display:block;font-size:24px;margin-top:4px}.ng-metric small{color:var(--muted)}
    .ng-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.ng-actions button,.ng-actions a{width:auto;margin:0;padding:10px 13px;font-size:12px;text-decoration:none}.ng-secondary{background:#eaf7ef!important;color:var(--ink)!important}.ng-gold{background:#f5c96a!important;color:#173c31!important}
    .ng-progress{height:10px;background:#e8f1eb;border-radius:99px;overflow:hidden;margin:8px 0}.ng-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#1f8a5b,#f0b24e);border-radius:99px;transition:width .35s}
    .ng-next{display:flex;align-items:center;gap:14px;background:linear-gradient(120deg,#173c31,#2b7858);color:white}.ng-next .ng-next-icon{font-size:42px}.ng-next p{margin:3px 0;color:#d7f2e2;font-size:13px}.ng-next button{margin:0;width:auto;background:#f5c96a;color:#173c31;font-size:12px;padding:10px 14px}
    .ng-pill{display:inline-flex;align-items:center;gap:5px;border-radius:999px;background:#e6f7ec;padding:7px 10px;color:#26784c;font-size:11px;font-weight:800}
    .ng-form{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;align-items:end}.ng-form label{margin:0}.ng-form input,.ng-form select{padding:11px;font-size:13px}.ng-form button{margin:0}
    .ng-food-row,.ng-ex-row,.ng-grocery-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid var(--line)}.ng-food-row:last-child,.ng-ex-row:last-child,.ng-grocery-row:last-child{border-bottom:0}
    .ng-food-row small,.ng-ex-row small,.ng-grocery-row small{display:block;color:var(--muted);font-size:11px;margin-top:3px}.ng-food-row button,.ng-ex-row button,.ng-grocery-row button{width:auto;margin:0;padding:7px 10px;font-size:11px}
    .ng-swap-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.ng-swap{border-radius:16px;background:#fff;padding:13px;border:1px solid var(--line)}.ng-swap b{display:block;margin-bottom:6px}.ng-swap span{font-size:12px;color:#26784c}
    .ng-device{display:flex;align-items:center;gap:10px;padding:12px;border-radius:15px;background:#fff;border:1px solid var(--line)}.ng-device .ng-device-icon{font-size:26px}.ng-device button{width:auto;margin:0;margin-left:auto;padding:8px 11px;font-size:11px}.ng-device small{display:block;color:var(--muted);font-size:11px;margin-top:3px}
    .ng-exercise-plan{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ng-exercise-plan article{border-radius:18px;background:#fff;border:1px solid var(--line);padding:14px}.ng-exercise-plan span{font-size:30px}.ng-exercise-plan b{display:block;margin-top:5px}.ng-exercise-plan small{color:var(--muted)}
    .ng-check{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px}.ng-check input{width:auto}.ng-checklist{display:grid;gap:2px}
    .ng-story-badge{display:flex;align-items:center;gap:10px;padding:13px;border-radius:17px;background:#fff5dc;border:1px solid #ead8a9}.ng-story-badge strong{display:block}.ng-story-badge small{color:var(--muted)}
    .ng-status{font-size:12px;color:var(--muted);margin-top:8px}.ng-offline{background:#fff1dd!important;color:#72501c!important}
    .ng-dark{--ink:#ecfff4;--muted:#b7cec1;--mint:#1e4936;--cream:#1e3029;--line:#315444;background:#10241c}.ng-dark .card,.ng-dark .ng-card,.ng-dark .stat,.ng-dark .ng-metric,.ng-dark .ng-device,.ng-dark .ng-swap,.ng-dark .ng-exercise-plan article{background:#173329;color:var(--ink)}.ng-dark input,.ng-dark select,.ng-dark textarea{background:#10241c;color:var(--ink);border-color:#315444}.ng-dark .hero{background:linear-gradient(90deg,#173329ee,#173329aa),url('mascot-buddies.jpg') center/cover}
    .ng-large{font-size:18px}.ng-large .ng-card,.ng-large .card{padding:25px}.ng-large button{min-height:48px}
    .ng-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;background:#173c31;color:#fff;border-radius:999px;padding:11px 16px;font-size:12px;box-shadow:0 8px 22px #0003;opacity:0;pointer-events:none;transition:opacity .2s}.ng-toast.show{opacity:1}
    @media(max-width:900px){.ng-grid{grid-template-columns:repeat(2,1fr)}.ng-swap-grid{grid-template-columns:repeat(2,1fr)}.ng-form{grid-template-columns:1fr 1fr}.ng-exercise-plan{grid-template-columns:1fr 1fr}}
    @media(max-width:760px){.ng-card{padding:18px;border-radius:20px}.ng-grid-2{grid-template-columns:1fr}.ng-form{grid-template-columns:1fr 1fr}.ng-form button{grid-column:span 2}.ng-exercise-plan{grid-template-columns:1fr}.ng-swap-grid{grid-template-columns:1fr 1fr}.ng-metric{min-height:96px}.ng-next{align-items:flex-start}.ng-next .ng-actions{width:100%}.ng-device{align-items:flex-start}.ng-device button{margin-top:2px}}
  `;
  document.head.appendChild(style);

  const sections = `
    <section class="ng-card ng-tab-section ng-home-section" data-ng-tab="home" id="ngToday">
      <div class="eyebrow">TODAY AT A GLANCE</div>
      <h2>Your wellness cockpit</h2>
      <p class="ng-sub">Everything you need for today, in one calm view.</p>
      <div class="ng-grid">
        <div class="ng-metric"><span>🔥</span><b id="ngCaloriesLeft">—</b><small>calories target</small></div>
        <div class="ng-metric"><span>💪</span><b id="ngProteinToday">0 g</b><small>protein logged</small></div>
        <div class="ng-metric"><span>👟</span><b id="ngStepsToday">0</b><small>steps today</small></div>
        <div class="ng-metric"><span>💧</span><b id="ngWaterToday">0 / 8</b><small>water glasses</small></div>
      </div>
      <div class="ng-progress"><i id="ngTodayProgress"></i></div>
      <p class="ng-status" id="ngTodayStatus">Log one small win to start your day.</p>
    </section>

    <section class="ng-card ng-tab-section ng-home-section ng-next" data-ng-tab="home" id="ngNextAction">
      <div class="ng-next-icon" id="ngNextIcon">🌱</div>
      <div style="flex:1"><div class="eyebrow" style="color:#b4f2cd">YOUR NEXT BEST STEP</div><h2 id="ngNextTitle">Choose one small win</h2><p id="ngNextText">Your guide will suggest the next action from your activity.</p></div>
      <button type="button" id="ngNextButton" onclick="ngOpenNext()">Open</button>
    </section>

    <section class="ng-card ng-tab-section ng-home-section" data-ng-tab="home" id="ngRecovery">
      <div class="eyebrow">RECOVERY CHECK-IN</div><h2>How are you feeling today?</h2><p class="ng-sub">Your answers help adjust the plan. They stay on this device.</p>
      <div class="ng-form">
        <label>Sleep hours<input id="ngSleep" type="number" min="0" max="24" step="0.5" placeholder="e.g. 7"></label>
        <label>Energy<select id="ngEnergy"><option value="high">High</option><option value="medium" selected>Okay</option><option value="low">Low</option></select></label>
        <label>Soreness<select id="ngSoreness"><option value="none">None</option><option value="mild">Mild</option><option value="high">High</option></select></label>
        <label>Stress<select id="ngStress"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></label>
        <button type="button" onclick="ngSaveRecovery()">Save check-in</button>
      </div>
      <p class="ng-status" id="ngRecoveryStatus">No check-in saved today.</p>
    </section>

    <section class="ng-card ng-tab-section ng-home-section" data-ng-tab="home" id="ngWearables">
      <div class="eyebrow">CONNECTED ACTIVITY</div><h2>Android wearable hub</h2><p class="ng-sub">Connect a provider when you are ready. You can keep using manual logging without a device.</p>
      <div class="ng-grid-2">
        <div class="ng-device"><span class="ng-device-icon">⌚</span><div><b>Google Health Connect</b><small>Steps, workouts, sleep</small></div><button type="button" onclick="ngConnectDevice('Health Connect')">Connect</button></div>
        <div class="ng-device"><span class="ng-device-icon">🏃</span><div><b>Fitbit</b><small>Activity and recovery</small></div><button type="button" onclick="ngConnectDevice('Fitbit')">Connect</button></div>
        <div class="ng-device"><span class="ng-device-icon">🚴</span><div><b>Garmin</b><small>Workouts and steps</small></div><button type="button" onclick="ngConnectDevice('Garmin')">Connect</button></div>
        <div class="ng-device"><span class="ng-device-icon">📱</span><div><b>Samsung Health</b><small>Android activity data</small></div><button type="button" onclick="ngConnectDevice('Samsung Health')">Connect</button></div>
      </div>
      <p class="ng-status" id="ngDeviceStatus">No device connected. Real account authorization can be added when the cloud connector is enabled.</p>
    </section>

    <section class="ng-card ng-tab-section ng-food-section" data-ng-tab="food" id="ngQuickLog">
      <div class="eyebrow">QUICK LOG</div><h2>Add a meal in seconds</h2><p class="ng-sub">Search a food, choose the portion, and save it to today’s nutrition log.</p>
      <div class="ng-form">
        <label>Food<input id="ngQuickFood" list="nutritionSuggestions" placeholder="Paneer, idli, poha…" oninput="ngLookupQuickFood()"></label>
        <label>Portion (g)<input id="ngQuickQty" type="number" value="100" min="1" step="1" oninput="ngLookupQuickFood()"></label>
        <label>Meal<select id="ngQuickMeal"><option>Breakfast</option><option>Lunch</option><option>Snack</option><option>Dinner</option></select></label>
        <button type="button" onclick="ngQuickAdd()">＋ Log meal</button>
      </div>
      <div class="ng-actions"><button type="button" class="ng-secondary" onclick="ngStartVoice()">🎙 Voice entry</button><button type="button" class="ng-secondary" onclick="ngShowFavorites()">⭐ Recent favourites</button></div>
      <p class="ng-status" id="ngQuickStatus">Nutrition values will fill from the food database.</p>
    </section>

    <section class="ng-card ng-tab-section ng-food-section" data-ng-tab="food" id="ngSmartSwaps">
      <div class="eyebrow">SMART SWAPS</div><h2>Keep the flavour, improve the balance</h2><p class="ng-sub">Simple substitutions for familiar Indian meals.</p>
      <div class="ng-swap-grid">
        <div class="ng-swap"><b>🍚 White rice</b><span>→ Brown rice or millet</span></div><div class="ng-swap"><b>🥟 Fried samosa</b><span>→ Air-fried samosa</span></div><div class="ng-swap"><b>🥤 Sweet drink</b><span>→ Lemon mint water</span></div><div class="ng-swap"><b>🧀 Full-fat paneer</b><span>→ Low-fat paneer or tofu</span></div><div class="ng-swap"><b>🫓 Refined naan</b><span>→ Whole-wheat roti</span></div><div class="ng-swap"><b>🍟 Fried snack</b><span>→ Roasted chana or makhana</span></div><div class="ng-swap"><b>🍨 Ice cream</b><span>→ Curd and fruit bowl</span></div><div class="ng-swap"><b>🍛 Heavy gravy</b><span>→ Tomato-based light gravy</span></div>
      </div>
    </section>

    <section class="ng-card ng-tab-section ng-food-section" data-ng-tab="food" id="ngGroceryPlanner">
      <div class="eyebrow">SMART SHOPPING</div><h2>Weekly grocery planner</h2><p class="ng-sub">Turn your meal ideas into a simple checklist with an estimated budget.</p>
      <div class="ng-form"><label>Add item<input id="ngGroceryItem" placeholder="Tomatoes, curd, oats…"></label><label>Quantity<input id="ngGroceryQty" placeholder="1 kg / 2 packs"></label><label>Budget (₹)<input id="ngGroceryBudget" type="number" min="0" placeholder="Optional"></label><button type="button" onclick="ngAddGrocery()">＋ Add item</button></div>
      <div id="ngGroceryRows"></div><div class="ng-actions"><button type="button" class="ng-secondary" onclick="ngBuildGroceries()">Build from food log</button><button type="button" class="ng-secondary" onclick="ngClearGroceries()">Clear list</button></div><p class="ng-status" id="ngGroceryTotal">Estimated budget: ₹0</p>
    </section>

    <section class="ng-card ng-tab-section ng-move-section" data-ng-tab="move" id="ngExerciseCoach">
      <div class="eyebrow">ADAPTIVE EXERCISE COACH</div><h2 id="ngExerciseTitle">Your movement menu</h2><p class="ng-sub" id="ngExerciseSubtitle">Choose a session that matches your energy today.</p>
      <div class="ng-exercise-plan" id="ngExercisePlan"></div>
      <p class="ng-status" id="ngExerciseStatus">Completed sessions this week: 0</p>
    </section>

    <section class="ng-card ng-tab-section ng-journey-section" data-ng-tab="journey" id="ngJourneyBadge">
      <div class="eyebrow">YOUR STORY</div><h2>Make the journey yours</h2><p class="ng-sub">Your selected guide follows your mode across every section.</p>
      <div class="ng-story-badge"><span style="font-size:38px" id="ngJourneyGuide">🐼🥋</span><div><strong id="ngJourneyMode">Choose a story mode</strong><small id="ngJourneyModeText">Open Journey to begin your chapter.</small></div></div>
    </section>

    <section class="ng-card ng-tab-section ng-plan-section" data-ng-tab="plan" id="ngShareCard">
      <div class="eyebrow">PRIVATE SHARING</div><h2>Share your progress with one person</h2><p class="ng-sub">Create a reviewable summary for someone you trust. Nothing is shared automatically.</p>
      <div class="ng-actions"><button type="button" onclick="ngShareProgress()">↗ Share weekly summary</button><button type="button" class="ng-secondary" onclick="ngCopyProgress()">Copy summary</button></div><p class="ng-status" id="ngShareStatus">Ready when you are.</p>
    </section>

    <section class="ng-card ng-tab-section ng-plan-section" data-ng-tab="plan" id="ngControls">
      <div class="eyebrow">YOUR PREFERENCES</div><h2>Make NutriGuide comfortable</h2>
      <div class="ng-form"><label>Appearance<select id="ngTheme" onchange="ngSetTheme(this.value)"><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Text size<select id="ngTextSize" onchange="ngSetTextSize(this.value)"><option value="normal">Normal</option><option value="large">Large</option></select></label><label>Language<select id="ngLanguage" onchange="ngSetLanguage(this.value)"><option value="en">English</option><option value="hi">हिन्दी</option></select></label><button type="button" class="ng-secondary" onclick="ngExportData()">Download my data</button></div>
      <p class="ng-status" id="ngControlStatus">Your preferences are saved on this device.</p>
    </section>
  `;
  root.insertAdjacentHTML('beforeend', sections);

  const toast = document.createElement('div');
  toast.className = 'ng-toast';
  document.body.appendChild(toast);
  let toastTimer;
  function notify(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400); }

  const originalSetTab = window.setTab;
  window.setTab = function (tab) {
    if (typeof originalSetTab === 'function') originalSetTab(tab);
    document.querySelectorAll('.ng-tab-section').forEach((section) => {
      section.style.display = section.dataset.ngTab === tab ? 'block' : 'none';
    });
    if (tab === 'home') renderToday();
    if (tab === 'food') { renderQuickStatus(); renderGroceries(); }
    if (tab === 'move') renderExerciseCoach();
    if (tab === 'journey') renderJourneyBadge();
    if (tab === 'plan') renderShareStatus();
  };

  function profile() {
    return read('ngProfile', { age: get('age')?.value, height: get('height')?.value, weight: get('weight')?.value, goal: get('goal')?.value || 'loss' });
  }
  function nutritionTotals() {
    const log = typeof nutritionLog !== 'undefined' ? nutritionLog : read('nutritionLog', []);
    return (log || []).reduce((a, x) => ({ cal: a.cal + Number(x.cal || 0), p: a.p + Number(x.p || 0), f: a.f + Number(x.f || 0) }), { cal: 0, p: 0, f: 0 });
  }
  function targetCalories() { return Number(get('cal')?.textContent?.replace(/[^0-9]/g, '')) || 0; }
  function proteinTotal() { return (typeof proteinItems !== 'undefined' ? proteinItems : read('proteinItems', [])).reduce((a, x) => a + Number(x.g || 0), 0); }
  function renderToday() {
    const totals = nutritionTotals();
    const stepsValue = Number(localStorage.getItem('steps') || 0);
    const waterValue = Number(localStorage.getItem('water') || 0);
    const calorieTarget = targetCalories();
    const proteinValue = proteinTotal();
    if (get('ngCaloriesLeft')) get('ngCaloriesLeft').textContent = calorieTarget ? `${Math.max(0, calorieTarget - Math.round(totals.cal))}` : '—';
    if (get('ngProteinToday')) get('ngProteinToday').textContent = `${proteinValue.toFixed(1)} g`;
    if (get('ngStepsToday')) get('ngStepsToday').textContent = stepsValue.toLocaleString();
    if (get('ngWaterToday')) get('ngWaterToday').textContent = `${waterValue} / 8`;
    const progress = Math.min(100, Math.round((Math.min(stepsValue / 8000, 1) * 40) + (Math.min(waterValue / 8, 1) * 25) + (Math.min(proteinValue / (Number(localStorage.getItem('proteinTarget')) || 100), 1) * 35)));
    if (get('ngTodayProgress')) get('ngTodayProgress').style.width = `${progress}%`;
    if (get('ngTodayStatus')) get('ngTodayStatus').textContent = progress >= 80 ? 'Lovely rhythm today. Keep the next choice simple.' : 'Your progress builds from small, repeatable actions.';
    const recovery = read('ngRecovery', {});
    if (get('ngSleep') && recovery.date === today()) get('ngSleep').value = recovery.sleep || '';
    if (get('ngEnergy') && recovery.date === today()) get('ngEnergy').value = recovery.energy || 'medium';
    if (get('ngSoreness') && recovery.date === today()) get('ngSoreness').value = recovery.soreness || 'none';
    if (get('ngStress') && recovery.date === today()) get('ngStress').value = recovery.stress || 'medium';
    if (get('ngRecoveryStatus')) get('ngRecoveryStatus').textContent = recovery.date === today() ? `Saved today • ${recovery.sleep || '—'} hours sleep • ${recovery.energy || 'okay'} energy` : 'No check-in saved today.';
    renderNextAction();
  }
  function renderNextAction() {
    const recovery = read('ngRecovery', {});
    const stepsValue = Number(localStorage.getItem('steps') || 0);
    let next = ['🌱', 'Choose one small win', 'Log a meal, water glass, or short walk to begin.', 'food'];
    if (!nutritionTotals().cal) next = ['🥗', 'Log your next meal', 'Add a portion and NutriGuide will calculate the nutrition.', 'food'];
    else if (!stepsValue) next = ['🚶', 'Take a short walk', 'Start with ten comfortable minutes and build from there.', 'move'];
    else if (recovery.date !== today()) next = ['💧', 'Check your recovery', 'Tell your guide how you slept and how your energy feels.', 'home'];
    else next = ['✨', 'Review your plan', 'Your next step is ready. Keep it realistic and repeatable.', 'plan'];
    if (get('ngNextIcon')) get('ngNextIcon').textContent = next[0];
    if (get('ngNextTitle')) get('ngNextTitle').textContent = next[1];
    if (get('ngNextText')) get('ngNextText').textContent = next[2];
    window.ngNextTab = next[3];
  }
  window.ngOpenNext = function () { if (window.ngNextTab && typeof window.setTab === 'function') window.setTab(window.ngNextTab); };

  window.ngSaveRecovery = function () {
    write('ngRecovery', { date: today(), sleep: get('ngSleep').value, energy: get('ngEnergy').value, soreness: get('ngSoreness').value, stress: get('ngStress').value });
    if (get('ngRecoveryStatus')) get('ngRecoveryStatus').textContent = `Saved today • ${get('ngSleep').value || '—'} hours sleep • ${get('ngEnergy').value} energy`;
    renderToday(); notify('Recovery check-in saved');
  };
  window.ngConnectDevice = function (name) {
    const connected = read('ngDevices', []);
    if (!connected.includes(name)) connected.push(name);
    write('ngDevices', connected);
    if (get('ngDeviceStatus')) get('ngDeviceStatus').textContent = `${name} selected. Account authorization will be used when the connector is enabled.`;
    document.querySelectorAll('#ngWearables .ng-device').forEach((row) => { if (row.textContent.includes(name)) row.querySelector('button').textContent = 'Selected'; });
    notify(`${name} selected`);
  };

  window.ngLookupQuickFood = function () {
    const name = get('ngQuickFood').value;
    const qty = get('ngQuickQty').value;
    let n = null;
    try { n = typeof nutritionForQuantity === 'function' ? nutritionForQuantity(name, qty) : null; } catch { n = null; }
    if (get('ngQuickStatus')) get('ngQuickStatus').textContent = n ? `✓ ${n.item.label}: ${Math.round(n.cal)} kcal • ${n.p.toFixed(1)} g protein` : 'Nutrition values will fill from the food database.';
  };
  window.ngQuickAdd = function () {
    const name = get('ngQuickFood').value.trim();
    const qty = Number(get('ngQuickQty').value) || 100;
    if (!name) { notify('Enter a food first'); return; }
    let n = null;
    try { n = typeof nutritionForQuantity === 'function' ? nutritionForQuantity(name, qty) : null; } catch { n = null; }
    if (!n) { notify('Choose a food from the suggestions'); return; }
    if (typeof nutritionLog !== 'undefined') { nutritionLog.unshift({ emoji: n.item.emoji || '🍽️', name: n.item.label, qty, cal: n.cal, p: n.p, c: n.c, fat: n.fat, f: n.f, meal: get('ngQuickMeal').value }); if (typeof saveNutritionLog === 'function') saveNutritionLog(); }
    get('ngQuickFood').value = ''; get('ngQuickQty').value = 100; renderQuickStatus(); renderToday(); notify(`${n.item.label} added to ${get('ngQuickMeal').value.toLowerCase()}`);
  };
  function renderQuickStatus() { const total = nutritionTotals(); if (get('ngQuickStatus')) get('ngQuickStatus').textContent = `${Math.round(total.cal)} kcal and ${total.p.toFixed(1)} g protein logged today.`; }
  window.ngShowFavorites = function () { const log = typeof nutritionLog !== 'undefined' ? nutritionLog : []; const last = log?.slice(0, 3).map((x) => x.name).join(', '); if (get('ngQuickStatus')) get('ngQuickStatus').textContent = last ? `Recent foods: ${last}` : 'No recent foods yet.'; };
  window.ngStartVoice = function () {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { notify('Voice entry is not supported in this browser'); return; }
    const recognition = new Recognition(); recognition.lang = localStorage.getItem('ngLanguage') === 'hi' ? 'hi-IN' : 'en-IN'; recognition.interimResults = false; recognition.onresult = (event) => { get('ngQuickFood').value = event.results[0][0].transcript; ngLookupQuickFood(); }; recognition.onerror = () => notify('Voice entry could not start'); recognition.start(); notify('Listening for a food name');
  };

  function groceryItems() { return read('ngGroceryItems', []); }
  function renderGroceries() {
    const items = groceryItems(); const rows = get('ngGroceryRows'); if (!rows) return;
    rows.innerHTML = items.length ? items.map((x, i) => `<div class="ng-grocery-row"><label class="ng-check"><input type="checkbox" ${x.done ? 'checked' : ''} onchange="ngToggleGrocery(${i})"><span><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.qty || 'Flexible quantity')}</small></span></label><button type="button" class="ng-secondary" onclick="ngRemoveGrocery(${i})">Remove</button></div>`).join('') : '<p class="ng-status">Your weekly shopping list is empty.</p>';
    const total = items.reduce((sum, x) => sum + Number(x.budget || 0), 0); if (get('ngGroceryTotal')) get('ngGroceryTotal').textContent = `Estimated budget: ₹${total.toLocaleString('en-IN')}`;
  }
  window.ngAddGrocery = function () { const name = get('ngGroceryItem').value.trim(); if (!name) return; const items = groceryItems(); items.push({ name, qty: get('ngGroceryQty').value.trim(), budget: Number(get('ngGroceryBudget').value) || 0, done: false }); write('ngGroceryItems', items); get('ngGroceryItem').value = ''; get('ngGroceryQty').value = ''; get('ngGroceryBudget').value = ''; renderGroceries(); notify('Grocery item added'); };
  window.ngToggleGrocery = function (i) { const items = groceryItems(); if (items[i]) items[i].done = !items[i].done; write('ngGroceryItems', items); renderGroceries(); };
  window.ngRemoveGrocery = function (i) { const items = groceryItems(); items.splice(i, 1); write('ngGroceryItems', items); renderGroceries(); };
  window.ngClearGroceries = function () { write('ngGroceryItems', []); renderGroceries(); };
  window.ngBuildGroceries = function () { const defaults = [{ name: 'Seasonal vegetables', qty: '1 basket', budget: 250 }, { name: 'Dal or chana', qty: '1 kg', budget: 160 }, { name: 'Curd', qty: '2 tubs', budget: 120 }, { name: 'Fruit', qty: '1 week', budget: 250 }, { name: 'Paneer or tofu', qty: '500 g', budget: 220 }, { name: 'Oats or millet', qty: '1 pack', budget: 140 }]; write('ngGroceryItems', [...groceryItems(), ...defaults.filter((d) => !groceryItems().some((x) => x.name === d.name))]); renderGroceries(); notify('Starter grocery list created'); };

  const ngExerciseData = [
    ['🚶', 'Walk & reset', '10–30 min', 'Low impact cardio'], ['💪', 'Strength basics', '20 min', 'Squat, push, hinge'], ['🧘', 'Mobility flow', '10 min', 'Stretch and breathe'], ['🚴', 'Cycling session', '25 min', 'Steady endurance'], ['🥋', 'Panda balance', '12 min', 'Balance and control'], ['🎵', 'Dance break', '15 min', 'Fun cardio']
  ];
  function renderExerciseCoach() {
    const recovery = read('ngRecovery', {}); const low = recovery.energy === 'low' || recovery.soreness === 'high';
    if (get('ngExerciseTitle')) get('ngExerciseTitle').textContent = low ? 'Gentle movement for today' : 'Your movement menu';
    if (get('ngExerciseSubtitle')) get('ngExerciseSubtitle').textContent = low ? 'Your check-in suggests a lighter session with more recovery.' : 'Choose a session that matches your energy today.';
    const done = read('ngExerciseDone', []); const weekDone = done.filter((x) => x.week === getWeekKey()).length;
    if (get('ngExerciseStatus')) get('ngExerciseStatus').textContent = `Completed sessions this week: ${weekDone}`;
    if (get('ngExercisePlan')) get('ngExercisePlan').innerHTML = ngExerciseData.map((x, i) => `<article><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]} • ${x[3]}</small><div class="ng-actions"><button type="button" class="ng-secondary" onclick="ngStartSession(${i})">Start</button><button type="button" class="ng-secondary" onclick="ngCompleteSession(${i})">Done</button></div></article>`).join('');
  }
  function getWeekKey() { const d = new Date(); const one = new Date(d.getFullYear(), 0, 1); return `${d.getFullYear()}-${Math.ceil((((d - one) / 86400000) + one.getDay() + 1) / 7)}`; }
  window.ngStartSession = function (i) { const x = ngExerciseData[i]; notify(`${x[1]} started — follow the detailed exercise card below`); const card = document.querySelector('.exercise-card'); if (card) card.scrollIntoView({ behavior: 'smooth' }); };
  window.ngCompleteSession = function (i) { const done = read('ngExerciseDone', []); done.push({ date: today(), week: getWeekKey(), name: ngExerciseData[i][1] }); write('ngExerciseDone', done.slice(-100)); renderExerciseCoach(); renderToday(); notify(`${ngExerciseData[i][1]} marked complete`); };

  function renderJourneyBadge() {
    const guide = (typeof guides !== 'undefined' ? guides[Number(localStorage.getItem('selectedGuide') || 5)] : null) || ['🐼🥋', 'Panda trainer'];
    const mode = (typeof journeyModes !== 'undefined' && localStorage.getItem('journeyMode')) ? journeyModes[localStorage.getItem('journeyMode')] : null;
    if (get('ngJourneyGuide')) get('ngJourneyGuide').textContent = guide[0];
    if (get('ngJourneyMode')) get('ngJourneyMode').textContent = mode ? `${mode.icon} ${mode.name}` : 'Choose a story mode';
    if (get('ngJourneyModeText')) get('ngJourneyModeText').textContent = mode ? mode.desc : 'Open Journey to begin your chapter.';
  }
  function summaryText() { const totals = nutritionTotals(); const done = read('ngExerciseDone', []).filter((x) => x.week === getWeekKey()).length; return `NutriGuide weekly summary\nSteps: ${Number(localStorage.getItem('steps') || 0).toLocaleString()}\nWater: ${localStorage.getItem('water') || 0}/8 glasses\nCalories logged: ${Math.round(totals.cal)}\nProtein: ${proteinTotal().toFixed(1)} g\nWorkouts: ${done}\nJourney mode: ${localStorage.getItem('journeyMode') || 'Not selected'}`; }
  window.ngCopyProgress = async function () { const text = summaryText(); try { await navigator.clipboard.writeText(text); if (get('ngShareStatus')) get('ngShareStatus').textContent = 'Summary copied to your clipboard.'; notify('Summary copied'); } catch { if (get('ngShareStatus')) get('ngShareStatus').textContent = text; } };
  window.ngShareProgress = async function () { const text = summaryText(); if (navigator.share) { try { await navigator.share({ title: 'My NutriGuide progress', text }); if (get('ngShareStatus')) get('ngShareStatus').textContent = 'Share sheet opened.'; } catch {} } else ngCopyProgress(); };
  function renderShareStatus() { if (get('ngShareStatus')) get('ngShareStatus').textContent = navigator.share ? 'Ready to open your phone’s share sheet.' : 'Copy the summary and send it through WhatsApp.'; }

  window.ngSetTheme = function (value) { document.body.classList.toggle('ng-dark', value === 'dark'); localStorage.setItem('ngTheme', value); };
  window.ngSetTextSize = function (value) { document.body.classList.toggle('ng-large', value === 'large'); localStorage.setItem('ngTextSize', value); };
  window.ngSetLanguage = function (value) { localStorage.setItem('ngLanguage', value); document.documentElement.lang = value === 'hi' ? 'hi' : 'en'; if (get('ngControlStatus')) get('ngControlStatus').textContent = value === 'hi' ? 'भाषा हिन्दी पर सेट है।' : 'Your preferences are saved on this device.'; notify(value === 'hi' ? 'हिन्दी चुनी गई' : 'English selected'); };
  window.ngExportData = function () { const data = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && (key.startsWith('ng') || ['nutritionLog','proteinItems','weights','journal','reminders','grocery'].includes(key))) data[key] = read(key, localStorage.getItem(key)); } const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'nutriguide-data.json'; a.click(); notify('Your data download started'); };

  function applyPreferences() { ngSetTheme(localStorage.getItem('ngTheme') || 'light'); ngSetTextSize(localStorage.getItem('ngTextSize') || 'normal'); if (get('ngTheme')) get('ngTheme').value = localStorage.getItem('ngTheme') || 'light'; if (get('ngTextSize')) get('ngTextSize').value = localStorage.getItem('ngTextSize') || 'normal'; if (get('ngLanguage')) get('ngLanguage').value = localStorage.getItem('ngLanguage') || 'en'; const connected = read('ngDevices', []); if (connected.length && get('ngDeviceStatus')) get('ngDeviceStatus').textContent = `Selected: ${connected.join(', ')}. Authorization can be connected later.`; }

  function storeProfile() { if (!get('age')?.value) return; write('ngProfile', { age: get('age').value, sex: get('sex').value, height: get('height').value, weight: get('weight').value, goal: get('goal').value, activity: get('activity').value }); }
  get('form')?.addEventListener('submit', () => setTimeout(() => { storeProfile(); document.body.classList.remove('needs-profile'); document.body.classList.add('post-profile'); renderToday(); renderExerciseCoach(); renderJourneyBadge(); }, 60));
  const savedProfile = read('ngProfile', null);
  if (savedProfile && get('age') && !get('age').value) { ['age','sex','height','weight','goal','activity'].forEach((id) => { if (savedProfile[id] != null && get(id)) get(id).value = savedProfile[id]; }); document.body.classList.remove('needs-profile'); document.body.classList.add('post-profile'); }
  window.addEventListener('online', () => { if (get('ngDeviceStatus')) get('ngDeviceStatus').classList.remove('ng-offline'); });
  window.addEventListener('offline', () => { if (get('ngDeviceStatus')) { get('ngDeviceStatus').textContent = 'You are offline. Manual logs still work and will remain on this device.'; get('ngDeviceStatus').classList.add('ng-offline'); } });

  applyPreferences();
  renderToday(); renderQuickStatus(); renderGroceries(); renderExerciseCoach(); renderJourneyBadge();
  if (typeof window.setTab === 'function') window.setTab(document.querySelector('.app-nav button.active')?.dataset.tab || 'home');
})();

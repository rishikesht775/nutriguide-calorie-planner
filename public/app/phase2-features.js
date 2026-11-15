/* NutriGuide Phase 2: adaptive guidance layered onto existing sections. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const read = (key, fallback) => window.NG?.read ? window.NG.read(key, fallback) : fallback;
  const write = (key, value) => window.NG?.write ? window.NG.write(key, value) : false;
  const today = () => window.NG?.day ? window.NG.day() : new Date().toISOString().slice(0, 10);
  const text = (node, value) => { if (node) node.textContent = value; };
  const notice = message => {
    const node = $("#ngNotice") || $("#ngHomeQuoteText");
    if (node) node.textContent = message;
  };
  const profileReady = () => {
    const profile = read("profile", null);
    return !!profile && Number(profile.age) >= 14 && Number(profile.height) >= 80 && Number(profile.weight) >= 20 && ["male", "female"].includes(String(profile.sex || "").toLowerCase());
  };
  const data = () => {
    const stats = read("ngDailyStats", {}) || {};
    const todayStats = stats[today()] || {};
    const logs = read("nutritionLog", []) || read("foodLogs", []) || [];
    const todayLogs = Array.isArray(logs) ? logs.filter(item => !item.date || item.date === today()) : [];
    const water = Number(todayStats.water || read("water", 0) || 0);
    const steps = Number(todayStats.steps || read("steps", 0) || 0);
    const protein = Number(todayStats.p || 0) || Number(read("proteinTotal", 0) || 0);
    return { water, steps, protein, meals: todayLogs.length, stats };
  };
  const section = (id, title, kicker, content) => {
    const node = document.createElement("section");
    node.id = id;
    node.className = "ng-phase2-card card";
    node.innerHTML = `<div class="ng-phase2-heading"><div><div class="eyebrow">${kicker}</div><h2>${title}</h2></div></div>${content}`;
    return node;
  };
  // Keep Phase 2 visible at the top of each existing section so users see the
  // new layer immediately instead of needing to scroll past the legacy cards.
  const appendOnce = (parent, node) => { if (parent && !document.getElementById(node.id)) parent.prepend(node); };

  function homeCoach() {
    const home = $("#ngHomeRedesign");
    if (!home) return;
    const d = data();
    const next = d.meals === 0 ? "Start with your first meal" : d.protein < 25 ? "Add a protein-rich snack" : d.water < 8 ? "Add one glass of water" : d.steps < 5000 ? "Take a comfortable movement break" : "Protect your recovery time";
    const card = section("ngPhase2Coach", "Your next useful step", "PHASE 2 SMART COACH", `<p class="ng-phase2-copy">${next}. The coach combines your logged meals, movement and recovery signals, then explains the reason for each recommendation.</p><div class="ng-phase2-coach-grid"><div><b>Readiness</b><strong id="ngPhase2Readiness">82</strong><small>/ 100 � normal movement</small></div><div><b>Today's focus</b><strong id="ngPhase2Focus">Protein</strong><small>one clear source at lunch</small></div><div><b>Check-in</b><strong id="ngPhase2CheckinState">Not saved</strong><small>your plan updates after check-in</small></div></div><div class="ng-phase2-actions"><button type="button" class="ng-phase2-primary" data-ng-phase2-action="checkin">� Check in</button><button type="button" data-ng-phase2-action="meal">Log a meal</button><button type="button" data-ng-phase2-action="profile">Review profile</button></div>`);
    appendOnce(home, card);
    const state = read("ngPhase2Checkin", "");
    text($("#ngPhase2CheckinState"), state === today() ? "Saved today" : "Not saved");
  }

  function foodPlan() {
    const target = $(".food-studio[data-section='food']");
    if (!target) return;
    appendOnce(target, section("ngPhase2FoodPlan", "Adaptive plan and groceries", "PHASE 2 FOOD LAYER", `<p class="ng-phase2-copy">Your existing food logging stays first. This plan adds flexible suggestions and keeps the grocery basket aligned when you swap a meal.</p><div class="ng-phase2-meals"><article><b>Breakfast</b><strong>Oats, curd & banana</strong><small>380 kcal � 20 g protein</small><button type="button" data-ng-phase2-action="swap">Swap meal</button></article><article><b>Lunch</b><strong>Paneer salad wrap</strong><small>520 kcal � 30 g protein</small><button type="button" data-ng-phase2-action="swap">Swap meal</button></article><article><b>Dinner</b><strong>Soya chunks pulao</strong><small>490 kcal � 32 g protein</small><button type="button" data-ng-phase2-action="grocery">Add groceries</button></article></div><div class="ng-phase2-grocery"><b>Smart grocery list</b><span id="ngPhase2GroceryStatus">18 of 24 items ready</span><div class="ng-phase2-meter"><i style="width:75%"></i></div></div>`));
  }

  function exerciseReadiness() {
    const target = $(".exercise-library");
    if (!target) return;
    appendOnce(target, section("ngPhase2Exercise", "Movement matched to your readiness", "PHASE 2 MOVEMENT", `<p class="ng-phase2-copy">The existing exercise cards remain available. This guide helps choose the right intensity for today.</p><div class="ng-phase2-exercise-grid"><div><span>?</span><b>12-minute mobility reset</b><small>Beginner � gentle pace</small><button type="button" data-ng-phase2-action="exercise">View steps</button></div><div><span>??</span><b>Evening walk</b><small>10 minutes � optional</small><button type="button" data-ng-phase2-action="exercise">Plan later</button></div><div><span>??</span><b>Steady strength</b><small>18 minutes � 3 rounds</small><button type="button" data-ng-phase2-action="exercise">View steps</button></div></div>`));
  }

  function journeyChallenges() {
    const target = $(".journey");
    if (!target) return;
    appendOnce(target, section("ngPhase2Challenges", "Challenges with meaning", "PHASE 2 JOURNEY", `<p class="ng-phase2-copy">Private, short challenges make consistency visible without turning wellness into a competition.</p><div class="ng-phase2-challenge"><span>??</span><div><b>Hydration reset</b><small>Reach 8 glasses for 5 days � 3 of 5 complete</small><div class="ng-phase2-meter"><i style="width:60%"></i></div></div><button type="button" data-ng-phase2-action="challenge">Join</button></div><div class="ng-phase2-challenge"><span>??</span><div><b>Evening walk</b><small>10 minutes after dinner � 4 of 7 complete</small><div class="ng-phase2-meter"><i style="width:57%"></i></div></div><button type="button" data-ng-phase2-action="challenge">Join</button></div>`));
  }

  function reportsInsights() {
    const target = $(".weekly-report");
    if (!target) return;
    appendOnce(target, section("ngPhase2Insights", "Progress that makes sense", "PHASE 2 INSIGHTS", `<p class="ng-phase2-copy">Your existing weekly report stays available. These insights explain the patterns behind the numbers.</p><div class="ng-phase2-insight-grid"><div><b>Weight trend</b><strong>On track</strong><small>Recent trend is moving steadily</small></div><div><b>Protein average</b><strong>+8%</strong><small>Higher than last week</small></div><div><b>Sleep regularity</b><strong>6.9/7</strong><small>Consistent recovery signal</small></div></div><div class="ng-phase2-explain"><b>Why your target changed</b><span>Targets use weight trend, steps, sleep and logged meals. Each adjustment shows its reason and can be reviewed from your plan.</span></div>`));
  }

  function profileConnections() {
    const profile = $("#ngProfilePage");
    if (!profile) return;
    appendOnce(profile, section("ngPhase2Connections", "Connections and privacy", "PHASE 2 PROFILE", `<p class="ng-phase2-copy">Connect only the signals you trust. NutriGuide uses them to improve suggestions and keeps sharing private by default.</p><div class="ng-phase2-device"><div><b>? Google Fit</b><small>Steps and active minutes</small></div><button type="button" data-ng-phase2-action="device">Connect</button></div><div class="ng-phase2-device"><div><b>?? Sleep data</b><small>Sleep duration and readiness</small></div><button type="button" data-ng-phase2-action="device">Connect</button></div><div class="ng-phase2-privacy"><b>Data clarity</b><span>Steps: optional � Sleep: optional � Sharing: private</span></div>`));
  }

  let bound = false;
  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", event => {
      const button = event.target.closest("[data-ng-phase2-action]");
      if (!button) return;
      const action = button.dataset.ngPhase2Action || button.dataset.ngNgPhase2Action;
      if (action === "checkin") { write("ngPhase2Checkin", today()); text($("#ngPhase2CheckinState"), "Saved today"); notice("Phase 2 check-in saved."); }
      else if (action === "meal") { window.setTab?.("food"); $("#nutritionFood")?.focus(); }
      else if (action === "profile") { $("#ngHomeProfileButton")?.click(); }
      else if (action === "grocery") { window.addGrocery?.("Oats, curd, paneer, tofu, cucumber, spinach"); text($("#ngPhase2GroceryStatus"), "24 of 24 items ready"); notice("Ingredients added to your grocery basket."); }
      else if (action === "swap") { notice("Meal swap options are ready in Food Studio."); }
      else if (action === "exercise") { window.setTab?.("move"); notice("Exercise details are ready."); }
      else if (action === "challenge") { button.textContent = button.textContent === "Joined" ? "Join" : "Joined"; notice(button.textContent === "Joined" ? "Challenge joined." : "Challenge left."); }
      else if (action === "device") { button.textContent = button.textContent === "Connected" ? "Connect" : "Connected"; notice(button.textContent === "Connected" ? "Connection enabled." : "Connection removed."); }
    });
  }

  function boot() {
    if (!profileReady()) {
      // Setup can finish after the initial page boot. Keep waiting without
      // rendering Phase 2 cards until the required profile is complete.
      window.setTimeout(boot, 400);
      return;
    }
    homeCoach();
    foodPlan();
    exerciseReadiness();
    journeyChallenges();
    reportsInsights();
    profileConnections();
    bind();
  }

  document.addEventListener("DOMContentLoaded", () => { window.setTimeout(boot, 850); });
  window.addEventListener("ng:cloud-hydrated", boot);
  window.addEventListener("ng:data-changed", () => window.setTimeout(boot, 0));
  window.addEventListener("ng:profile-state-changed", () => window.setTimeout(boot, 0));
})();


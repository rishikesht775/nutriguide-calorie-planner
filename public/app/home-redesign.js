/* NutriGuide Today/Home redesign: compact, explicit, account-aware actions. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const read = (key, fallback) => {
    try {
      if (window.NG && typeof window.NG.read === "function") return window.NG.read(key, fallback);
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value === null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      if (window.NG && typeof window.NG.write === "function") return window.NG.write(key, value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  };
  const today = () => window.NG && typeof window.NG.day === "function"
    ? window.NG.day()
    : new Date().toISOString().slice(0, 10);
  const valueOf = (id, fallback = "-") => {
    const node = document.getElementById(id);
    return node && node.textContent.trim() ? node.textContent.trim() : fallback;
  };
  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };
  const numberFrom = (value) => {
    const match = String(value || "").replace(/,/g, "").match(/-?[\d.]+/);
    return match ? Number(match[0]) : 0;
  };

  let originalSetTab;
  let activeTab = "home";
  let bound = false;
  let booted = false;

  function profileReady() {
    const profile = read("profile", null);
    return !!profile &&
      Number(profile.age) >= 14 &&
      Number(profile.height) >= 80 &&
      Number(profile.weight) >= 20 &&
      ["male", "female"].includes(profile.sex);
  }

  function accountName() {
    const profile = read("profile", {}) || {};
    const account = read("account", {}) || {};
    return profile.name || account.name || read("name", "Rishikesh") || "Rishikesh";
  }

  function currentRows() {
    const stats = read("ngDailyStats", {}) || {};
    const rows = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = today(-offset);
      if (offset === 0) {
        rows.push({
          p: numberFrom(valueOf("ngTodayProtein", "0")),
          steps: numberFrom(valueOf("ngTodaySteps", "0")),
          water: numberFrom(valueOf("waterOut", "0"))
        });
      } else if (stats[date]) rows.push(stats[date]);
    }
    return rows.filter(Boolean);
  }

  function greeting() {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }

  function brief() {
    const ready = profileReady();
    const protein = numberFrom(valueOf("ngTodayProtein", "0"));
    const water = numberFrom(valueOf("waterOut", "0"));
    const steps = numberFrom(valueOf("ngTodaySteps", "0"));
    const logs = read("nutritionLog", []) || read("foodLogs", []) || [];
    const todayLogs = Array.isArray(logs) ? logs.filter((item) => !item.date || item.date === today()) : [];

    if (!ready) return {
      kind: "profile",
      title: "Set up your personal plan",
      text: "Add your profile once and NutriGuide will personalize food, movement, and recovery guidance.",
      button: "Set up now",
      activity: "Your plan is waiting for your details."
    };
    if (!todayLogs.length && protein === 0) return {
      kind: "meal",
      title: "Start with your first meal",
      text: "A simple meal log gives your day a clear starting point.",
      button: "Log meal",
      activity: "Next meal: choose a balanced, protein-rich option."
    };
    if (protein < 25) return {
      kind: "meal",
      title: "Add a protein-rich snack",
      text: "Paneer, curd, dal, soya, or roasted chana can move your protein forward.",
      button: "Find food",
      activity: "Next meal: add one clear protein source."
    };
    if (water < 8) return {
      kind: "water",
      title: "Add a glass of water",
      text: "You are building a steady hydration rhythm. One glass is the next easy win.",
      button: "Add water",
      activity: "Recovery reminder: keep water nearby for the next hour."
    };
    if (steps < 5000) return {
      kind: "workout",
      title: "Take a comfortable movement break",
      text: "A short walk or gentle exercise session is enough to keep your rhythm moving.",
      button: "Open Move",
      activity: "Recommended exercise: a comfortable 20-minute walk."
    };
    return {
      kind: "recovery",
      title: "Protect your recovery time",
      text: "Your basic targets are moving well. Use the next few minutes for sleep, stretching, or a check-in.",
      button: "Check in",
      activity: "Recovery reminder: finish the day with one calm habit."
    };
  }

  function renderWeekly() {
    const rows = currentRows();
    const count = rows.length;
    const averageProtein = count ? Math.round(rows.reduce((sum, row) => sum + Number(row.p || 0), 0) / count) : 0;
    const averageSteps = count ? Math.round(rows.reduce((sum, row) => sum + Number(row.steps || 0), 0) / count) : 0;
    let streak = 0;
    for (const row of rows) {
      if (Number(row.p || 0) > 0 || Number(row.steps || 0) > 0 || Number(row.water || 0) > 0) streak += 1;
      else break;
    }
    setText("ngWeekConsistency", Math.round((count / 7) * 100) + "%");
    setText("ngWeekStreak", streak + (streak === 1 ? " day" : " days"));
    setText("ngWeekProtein", averageProtein + " g");
    setText("ngWeekSteps", averageSteps.toLocaleString("en-IN"));
  }

  function createHome() {
    if ($("#ngHomeRedesign")) return;
    const anchor = $("#ngToday") || document.querySelector(".grid") || document.querySelector(".wrap");
    if (!anchor || !anchor.parentNode) return;
    const section = document.createElement("section");
    section.id = "ngHomeRedesign";
    section.className = "ng-home-redesign";
    section.dataset.ngTab = "home";
    section.innerHTML = [
      '<header class="ng-home-header"><div class="ng-home-person"><div class="ng-home-avatar" id="ngHomeAvatar">🐼</div><div><span class="ng-kicker" id="ngHomeGreeting"></span><h1 id="ngHomeName"></h1><p id="ngHomeGuide"></p></div></div><div class="ng-home-tools"><button type="button" class="ng-icon-button" id="ngThemeButton" aria-label="Toggle dark mode">☼</button><button type="button" class="ng-icon-button" id="ngDensityButton" aria-label="Toggle comfortable spacing">↕</button><button type="button" class="ng-icon-button" id="ngHomeProfileButton" aria-label="Open profile settings">⚙</button></div></header>',
      '<section class="ng-next-action-card"><div><span class="ng-kicker">SMART DAILY BRIEF</span><h2 id="ngNextActionTitle"></h2><p id="ngNextActionText"></p></div><button type="button" class="ng-primary-action" id="ngNextActionButton">Log now</button></section>',
      '<section class="ng-progress-grid" aria-label="Today progress"><article class="ng-progress-card"><span>Calories</span><strong id="ngHomeCalories">—</strong><small>remaining</small><i></i></article><article class="ng-progress-card"><span>Protein</span><strong id="ngHomeProtein">0 g</strong><small>today</small><i></i></article><article class="ng-progress-card"><span>Steps</span><strong id="ngHomeSteps">0</strong><small>today</small><i></i></article><article class="ng-progress-card"><span>Water</span><strong id="ngHomeWater">0 / 8</strong><small>glasses</small><i></i></article></section>',
      '<section class="ng-quick-action-block"><div class="ng-section-heading"><div><span class="ng-kicker">QUICK ACTIONS</span><h2>Keep it simple</h2></div><span class="ng-muted-label">One action at a time</span></div><div class="ng-quick-actions"><button type="button" data-ng-home-action="meal"><span>🥗</span><b>Log meal</b><small>Food Studio</small></button><button type="button" data-ng-home-action="water"><span>💧</span><b>Add water</b><small>+ one glass</small></button><button type="button" data-ng-home-action="steps"><span>👟</span><b>Add steps</b><small>Manual entry</small></button><button type="button" data-ng-home-action="workout"><span>🏃</span><b>Log workout</b><small>Move</small></button></div><div class="ng-steps-quick-panel" id="ngStepsQuickPanel" hidden><label for="ngStepsQuickInput">Steps today<input id="ngStepsQuickInput" type="number" min="0" inputmode="numeric" placeholder="e.g. 4500"></label><button type="button" id="ngSaveStepsQuick">Save steps</button></div></section>',
      '<div class="ng-home-columns"><section class="ng-home-card"><div class="ng-section-heading"><div><span class="ng-kicker">NEXT UP</span><h2>Your next small win</h2></div><span class="ng-card-icon">✦</span></div><p id="ngNextActivityText"></p><div class="ng-activity-row"><span>🍽️ Next meal</span><span>🏃 Recommended exercise</span><span>🌙 Recovery reminder</span></div></section><section class="ng-home-card"><div class="ng-section-heading"><div><span class="ng-kicker">THIS WEEK</span><h2>Wellness rhythm</h2></div><span class="ng-card-icon">↗</span></div><div class="ng-week-grid"><div><strong id="ngWeekConsistency">0%</strong><small>consistency</small></div><div><strong id="ngWeekStreak">0 days</strong><small>streak</small></div><div><strong id="ngWeekProtein">0 g</strong><small>avg protein</small></div><div><strong id="ngWeekSteps">0</strong><small>avg steps</small></div></div></section></div>',
      '<details class="ng-more-today"><summary><span><span class="ng-kicker">MORE FOR TODAY</span><b>Recovery and reminders</b></span><span class="ng-summary-chevron">⌄</span></summary><div class="ng-more-grid"><button type="button" data-ng-home-action="recovery"><span>🌙</span><b id="ngSleepValue">Sleep not logged</b><small>Recovery check-in</small></button><button type="button" data-ng-home-action="recovery"><span>🧘</span><b id="ngRecoveryValue">Add a calm habit</b><small>Journey check-in</small></button><button type="button" data-ng-home-action="recovery"><span>🔔</span><b id="ngReminderValue">Review reminders</b><small>Plan & reports</small></button><button type="button" data-ng-home-action="recovery"><span>📖</span><b id="ngJourneyValue">Continue your story</b><small>Journey</small></button></div></details>',
      '<section class="ng-profile-prompt" id="ngProfilePrompt"><div><span class="ng-kicker">PERSONALIZE YOUR PLAN</span><h2>Make this dashboard yours</h2><p>Complete your profile to unlock personal calorie, protein, meal, movement, and recovery guidance.</p></div><button type="button" class="ng-primary-action" id="ngProfilePromptButton">Set up profile</button></section>'
    ].join("");
    anchor.parentNode.insertBefore(section, anchor);
  }

  function action(kind) {
    if (kind === "meal") {
      window.setTab?.("food");
      window.setTimeout(() => ($("#nutritionFood") || $("#ngPortionFood"))?.focus(), 220);
    } else if (kind === "water") {
      window.addWater?.();
    } else if (kind === "steps") {
      const panel = $("#ngStepsQuickPanel");
      if (panel) {
        panel.hidden = false;
        $("#ngStepsQuickInput")?.focus();
      }
    } else if (kind === "workout") {
      window.setTab?.("move");
      window.setTimeout(() => ($("#exerciseCards") || $(".exercise-library"))?.scrollIntoView({ behavior: "smooth", block: "start" }), 220);
    } else if (kind === "recovery") {
      window.setTab?.("journey");
    } else if (kind === "profile") {
      showProfile();
    }
  }

  function showProfile() {
    window.setTab?.("home");
    document.body.classList.add("ng-show-profile");
    const form = $("#form");
    form?.scrollIntoView({ behavior: "smooth", block: "center" });
    form?.querySelector("input,select")?.focus();
  }

  function hideLegacyHome() {
    document.body.classList.add("ng-redesign");
    $("#ngToday")?.classList.add("ng-legacy-today");
  }

  function sync() {
    if (!$("#ngHomeRedesign")) return;
    const coachAvatar = $("#coachAvatar");
    const coachName = $("#coachName");
    const coachText = $("#coachText");
    const briefState = brief();
    setText("ngHomeGreeting", greeting().toUpperCase());
    setText("ngHomeName", accountName());
    setText("ngHomeGuide", coachText?.textContent || (coachName?.textContent ? coachName.textContent + " is ready to guide you." : "One small action is enough for today."));
    if (coachAvatar?.textContent) setText("ngHomeAvatar", coachAvatar.textContent.trim());
    setText("ngHomeCalories", valueOf("ngTodayCal", "-"));
    setText("ngHomeProtein", valueOf("ngTodayProtein", "0 g"));
    setText("ngHomeSteps", valueOf("ngTodaySteps", "0"));
    setText("ngHomeWater", valueOf("waterOut", "0 / 8"));
    setText("ngNextActionTitle", briefState.title);
    setText("ngNextActionText", briefState.text);
    setText("ngNextActionButton", briefState.button);
    setText("ngNextActivityText", briefState.activity);
    const habits = read("ngHabits", {}) || {};
    const habit = habits[today()] || {};
    setText("ngSleepValue", habit.sleep ? habit.sleep + " hours logged" : "Sleep not logged");
    setText("ngRecoveryValue", habit.recovery || "Add a calm habit");
    const reminders = read("reminders", []) || [];
    setText("ngReminderValue", Array.isArray(reminders) && reminders.length ? reminders.length + " reminders active" : "Review reminders");
    setText("ngJourneyValue", read("journeyMode", "") ? "Continue your story" : "Choose a story mode");
    const prompt = $("#ngProfilePrompt");
    if (prompt) prompt.hidden = profileReady();
    renderWeekly();
    document.body.classList.toggle("ng-home-mode", activeTab === "home");
    document.body.classList.toggle("ng-profile-ready", profileReady());
  }

  function installTabBridge() {
    if (originalSetTab || typeof window.setTab !== "function") return;
    originalSetTab = window.setTab;
    window.setTab = function () {
      activeTab = arguments[0] || "home";
      const result = originalSetTab.apply(this, arguments);
      sync();
      return result;
    };
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ng-home-action]");
      if (button) {
        event.preventDefault();
        action(button.dataset.ngHomeAction);
        return;
      }
      if (event.target.closest("#ngNextActionButton")) {
        action(brief().kind);
        return;
      }
      if (event.target.closest("#ngHomeProfileButton, #ngProfilePromptButton")) {
        showProfile();
        return;
      }
      if (event.target.closest("#ngThemeButton")) {
        const dark = !document.body.classList.contains("ng-dark-mode");
        document.body.classList.toggle("ng-dark-mode", dark);
        write("ngTheme", dark ? "dark" : "light");
        return;
      }
      if (event.target.closest("#ngDensityButton")) {
        const comfortable = !document.body.classList.contains("ng-comfortable");
        document.body.classList.toggle("ng-comfortable", comfortable);
        write("ngDensity", comfortable ? "comfortable" : "compact");
        return;
      }
      if (event.target.closest("#ngSaveStepsQuick")) {
        const input = $("#ngStepsQuickInput");
        const legacyInput = $("#steps");
        if (input && legacyInput && input.value !== "") {
          legacyInput.value = input.value;
          window.saveSteps?.();
          $("#ngStepsQuickPanel").hidden = true;
          sync();
        }
      }
    });
  }

  function boot() {
    if (booted) return;
    createHome();
    if (!$("#ngHomeRedesign")) {
      window.setTimeout(boot, 300);
      return;
    }
    booted = true;
    hideLegacyHome();
    installTabBridge();
    bind();
    document.body.classList.toggle("ng-dark-mode", read("ngTheme", "light") === "dark");
    document.body.classList.toggle("ng-comfortable", read("ngDensity", "compact") === "comfortable");
    sync();
    window.setInterval(sync, 1200);
    window.addEventListener("ng:cloud-hydrated", sync);
    window.setTab?.(activeTab);
  }

  document.addEventListener("DOMContentLoaded", boot);
  window.setTimeout(boot, 500);
})();
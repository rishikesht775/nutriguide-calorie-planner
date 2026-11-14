
/* NutriGuide setup-gated Home and dedicated My Profile view. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => {
    try {
      if (window.NG && typeof window.NG.read === "function") return window.NG.read(key, fallback);
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value === null ? fallback : value;
    } catch (_) { return fallback; }
  };
  const write = (key, value) => {
    try {
      if (window.NG && typeof window.NG.write === "function") return window.NG.write(key, value);
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) { return false; }
  };
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" }[c]));
  let form;
  let home;
  let firstHome;
  let profilePage;
  let setupSlot;
  let profileFormSlot;
  let ready = false;
  let profileOpen = false;
  let booted = false;

  function validProfile(profile) {
    return !!profile &&
      Number(profile.age) >= 14 &&
      Number(profile.height) >= 80 &&
      Number(profile.weight) >= 20 &&
      ["male", "female"].includes(String(profile.sex || "").toLowerCase()) &&
      ["loss", "maintain", "gain"].includes(String(profile.goal || ""));
  }

  function profile() {
    return read("profile", null) || {};
  }

  function accountName() {
    const p = profile();
    const account = read("account", {}) || {};
    return p.name || account.name || read("name", "there") || "there";
  }

  function goalLabel(goal) {
    return goal === "gain" ? "Gain weight" : goal === "maintain" ? "Maintain weight" : "Lose weight";
  }

  function notice(message) {
    const node = $("#ngSetupNotice");
    if (node) {
      node.textContent = message;
      node.classList.add("show");
      window.setTimeout(() => node.classList.remove("show"), 2600);
    }
    const toast = $("#toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 1800);
    }
  }

  function makeFirstHome() {
    if ($("#ngFirstLoginHome")) return $("#ngFirstLoginHome");
    const section = document.createElement("section");
    section.id = "ngFirstLoginHome";
    section.className = "ng-first-login-home";
    section.innerHTML =
      "<div class='ng-first-login-hero'><div><span class='ng-setup-kicker'>FIRST TIME HERE</span><h1>Welcome to NutriGuide</h1><p>Let’s set up your personal plan. Your Home dashboard and guidance will unlock after these details are saved.</p></div><div class='ng-first-login-mascot'>🐼<small>Your trainer is ready</small></div></div>" +
      "<div class='ng-setup-progress'><div><span>SETUP PROGRESS</span><b id='ngSetupStep'>Step 1 of 1</b></div><strong id='ngSetupProgressValue'>25%</strong><i><em id='ngSetupProgressBar'></em></i></div>" +
      "<div class='ng-first-login-grid'><article class='ng-setup-card'><span class='ng-setup-kicker'>WHY THIS IS NEEDED</span><h2>Your plan uses your details</h2><ul><li>Calorie and protein targets</li><li>Meal and exercise suggestions</li><li>Progress and recovery guidance</li></ul><p class='ng-setup-note'>You can edit these details anytime from My Profile after setup.</p></article><article class='ng-setup-card ng-setup-form-card'><div id='ngSetupFormSlot'></div><p id='ngSetupNotice' class='ng-setup-notice' role='status' aria-live='polite'></p></article></div>";
    const anchor = home || document.querySelector(".wrap");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(section, anchor);
    setupSlot = $("#ngSetupFormSlot", section);
    return section;
  }

  function makeProfilePage() {
    if ($("#ngProfilePage")) return $("#ngProfilePage");
    const section = document.createElement("section");
    section.id = "ngProfilePage";
    section.className = "ng-profile-page";
    section.hidden = true;
    section.innerHTML =
      "<header class='ng-profile-header'><div class='ng-profile-person'><div class='ng-profile-avatar'>🐼</div><div><span class='ng-setup-kicker'>DEDICATED PROFILE SECTION</span><h1>My Profile</h1><p>Personal details, goals, preferences, connections, and privacy.</p></div></div><div class='ng-profile-header-actions'><span class='ng-profile-complete' id='ngProfileComplete'>Complete</span><button type='button' class='ng-profile-back' id='ngProfileBack'>Back to Home</button></div></header>" +
      "<nav class='ng-profile-tabs' aria-label='Profile sections'>" +
        "<button type='button' class='active' data-ng-profile-tab='overview'>Overview</button>" +
        "<button type='button' data-ng-profile-tab='details'>Personal details</button>" +
        "<button type='button' data-ng-profile-tab='goals'>Goals & targets</button>" +
        "<button type='button' data-ng-profile-tab='preferences'>Preferences</button>" +
        "<button type='button' data-ng-profile-tab='connections'>Connections</button>" +
        "<button type='button' data-ng-profile-tab='privacy'>Privacy & data</button>" +
      "</nav>" +
      "<section class='ng-profile-panel active' data-ng-profile-panel='overview'><div class='ng-profile-metrics'><article><small>Profile</small><strong id='ngProfileMetricName'>—</strong><span>Account details</span></article><article><small>Goal</small><strong id='ngProfileMetricGoal'>—</strong><span id='ngProfileMetricTarget'>Adaptive plan</span></article><article><small>Daily plan</small><strong id='ngProfileMetricCalories'>—</strong><span id='ngProfileMetricProtein'>Protein target</span></article><article><small>Account</small><strong>Private</strong><span>Cloud synced</span></article></div><div class='ng-profile-columns'><article class='ng-profile-card'><div class='ng-profile-card-head'><h2>Personal snapshot</h2><span class='ng-profile-tag'>Saved</span></div><div class='ng-profile-row'><div><b id='ngProfileSnapshotName'>—</b><small id='ngProfileSnapshotAge'>—</small></div><button type='button' class='ng-profile-ghost' data-ng-profile-edit='details'>Edit</button></div><div class='ng-profile-row'><div><b id='ngProfileSnapshotBody'>—</b><small id='ngProfileSnapshotActivity'>—</small></div><span class='ng-profile-tag'>Updated</span></div><div class='ng-profile-row'><div><b>Plan preferences</b><small>Food, movement, and recovery guidance</small></div><button type='button' class='ng-profile-ghost' data-ng-profile-edit='preferences'>Change</button></div></article><article class='ng-profile-card'><div class='ng-profile-card-head'><h2>Profile access</h2><span class='ng-profile-tag'>Top-right</span></div><p class='ng-profile-help'>My Profile is available from the single button in the Home header. All profile sections stay inside this dedicated page.</p><div class='ng-profile-access-row'><span>My Profile button</span><b>Primary</b></div><div class='ng-profile-access-row'><span>Side menu</span><b>Home tabs</b></div></article></div></section>" +
      "<section class='ng-profile-panel' data-ng-profile-panel='details'><article class='ng-profile-card'><div class='ng-profile-card-head'><div><h2>Personal details</h2><p class='ng-profile-help'>These values are used for plan calculations.</p></div><span class='ng-profile-tag'>Editable</span></div><div id='ngProfileFormSlot'></div></article></section>" +
      "<section class='ng-profile-panel' data-ng-profile-panel='goals'><article class='ng-profile-card'><div class='ng-profile-card-head'><h2>Goals & targets</h2><span class='ng-profile-tag'>Adaptive</span></div><p class='ng-profile-help'>Targets can adapt to your weight trend, steps, exercise, sleep, and logged meals.</p><div class='ng-profile-row'><div><b id='ngGoalPrimary'>—</b><small>Primary goal</small></div><button type='button' class='ng-profile-ghost' data-ng-profile-edit='details'>Change</button></div><div class='ng-profile-row'><div><b id='ngGoalWeight'>—</b><small>Current weight</small></div><span class='ng-profile-tag'>Saved</span></div><div class='ng-profile-row'><div><b id='ngGoalProtein'>—</b><small>Daily protein target</small></div><span class='ng-profile-tag'>Calculated</span></div></article></section>" +
      "<section class='ng-profile-panel' data-ng-profile-panel='preferences'><article class='ng-profile-card'><div class='ng-profile-card-head'><h2>Dashboard preferences</h2><span class='ng-profile-tag'>Home view</span></div><label class='ng-profile-toggle'><span><b>Calories and protein</b><small>Show on Home progress cards</small></span><input type='checkbox' checked></label><label class='ng-profile-toggle'><span><b>Steps and water</b><small>Keep movement and hydration visible</small></span><input type='checkbox' checked></label><label class='ng-profile-toggle'><span><b>Gentle reminders</b><small>Meal, water, walk, and sleep prompts</small></span><input type='checkbox'></label><button type='button' class='ng-profile-primary' id='ngSavePreferences'>Save preferences</button></article></section>" +
      "<section class='ng-profile-panel' data-ng-profile-panel='connections'><article class='ng-profile-card'><div class='ng-profile-card-head'><h2>Connected data</h2><span class='ng-profile-tag'>User controlled</span></div><div class='ng-profile-row'><div><b>Google Fit / Health Connect</b><small>Steps, activity, and sleep summaries</small></div><button type='button' class='ng-profile-primary ng-connect'>Connect</button></div><div class='ng-profile-row'><div><b>Fitbit</b><small>Steps, workouts, heart rate, and sleep</small></div><button type='button' class='ng-profile-ghost ng-connect'>Connect</button></div><div class='ng-profile-row'><div><b>Manual logging</b><small>Steps, water, meals, and workouts</small></div><span class='ng-profile-tag'>Enabled</span></div></article></section>" +
      "<section class='ng-profile-panel' data-ng-profile-panel='privacy'><article class='ng-profile-card'><div class='ng-profile-card-head'><h2>Privacy & data</h2><span class='ng-profile-tag'>Private by default</span></div><div class='ng-profile-row'><div><b>Export wellness data</b><small>Profile, logs, goals, and reports</small></div><button type='button' class='ng-profile-ghost' id='ngExportProfile'>Export</button></div><div class='ng-profile-row'><div><b>Sign-in and security</b><small>Password and active sessions</small></div><span class='ng-profile-tag'>Protected</span></div></article></section>";
    const anchor = firstHome || home || document.querySelector(".wrap");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(section, anchor.nextSibling);
    profileFormSlot = $("#ngProfileFormSlot", section);
    return section;
  }

  function moveForm(target) {
    if (form && target && form.parentNode !== target) target.appendChild(form);
  }

  function setupNav(isReady) {
    const nav = document.querySelector(".app-nav");
    if (!nav) return;
    $$(".app-nav button").forEach((button) => {
      const isHome = button.dataset.tab === "home";
      const base = button.dataset.ngBaseLabel || button.textContent.replace(/\s*🔒\s*$/, "").trim();
      button.dataset.ngBaseLabel = base;
      button.disabled = !isReady && !isHome;
      button.setAttribute("aria-disabled", String(button.disabled));
      button.classList.toggle("ng-locked-tab", button.disabled);
      button.textContent = button.disabled ? base + " 🔒" : base;
    });
  }

  function setProfileTab(tab) {
    $$(".ng-profile-tabs button").forEach((button) => button.classList.toggle("active", button.dataset.ngProfileTab === tab));
    $$(".ng-profile-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.ngProfilePanel === tab);
      panel.hidden = panel.dataset.ngProfilePanel !== tab;
    });
    if (tab === "details") moveForm(profileFormSlot);
    renderProfile();
  }

  function openProfile() {
    if (!ready) {
      notice("Complete your setup to unlock My Profile.");
      return;
    }
    profileOpen = true;
    document.body.classList.add("ng-profile-open");
    if (profilePage) profilePage.hidden = false;
    if (home) home.hidden = true;
    moveForm(profileFormSlot);
    setProfileTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeProfile() {
    profileOpen = false;
    document.body.classList.remove("ng-profile-open");
    if (profilePage) profilePage.hidden = true;
    if (home) home.hidden = false;
    if (ready) moveForm(profileFormSlot);
  }

  function renderProfile() {
    const p = profile();
    if (!profilePage) return;
    const name = accountName();
    const sex = String(p.sex || "—");
    const age = p.age ? String(p.age) + " years" : "Age not set";
    const height = p.height ? String(p.height) + " cm" : "Height not set";
    const weight = p.weight ? String(p.weight) + " kg" : "Weight not set";
    const activity = p.activity === "1.2" ? "Mostly sitting / little exercise" : p.activity === "1.375" ? "Light exercise 1–3 days/week" : p.activity === "1.55" ? "Moderate exercise 3–5 days/week" : p.activity === "1.725" ? "Hard exercise 6–7 days/week" : "Activity not set";
    const calorie = $("#cal")?.textContent.trim() || "—";
    const protein = $("#protein")?.textContent.trim() || "—";
    const profileMetricName = $("#ngProfileMetricName");
    if (profileMetricName) profileMetricName.textContent = name;
    if ($("#ngProfileMetricGoal")) $("#ngProfileMetricGoal").textContent = goalLabel(p.goal);
    if ($("#ngProfileMetricTarget")) $("#ngProfileMetricTarget").textContent = weight + " current";
    if ($("#ngProfileMetricCalories")) $("#ngProfileMetricCalories").textContent = calorie;
    if ($("#ngProfileMetricProtein")) $("#ngProfileMetricProtein").textContent = protein + " target";
    if ($("#ngProfileSnapshotName")) $("#ngProfileSnapshotName").textContent = name;
    if ($("#ngProfileSnapshotAge")) $("#ngProfileSnapshotAge").textContent = age + " · " + (sex === "male" ? "Male" : sex === "female" ? "Female" : sex);
    if ($("#ngProfileSnapshotBody")) $("#ngProfileSnapshotBody").textContent = height + " · " + weight;
    if ($("#ngProfileSnapshotActivity")) $("#ngProfileSnapshotActivity").textContent = activity;
    if ($("#ngGoalPrimary")) $("#ngGoalPrimary").textContent = goalLabel(p.goal);
    if ($("#ngGoalWeight")) $("#ngGoalWeight").textContent = weight;
    if ($("#ngGoalProtein")) $("#ngGoalProtein").textContent = protein;
    if ($("#ngProfileComplete")) $("#ngProfileComplete").textContent = validProfile(p) ? "Setup complete" : "Incomplete";
  }


  function hideLegacyCalculator() {
    const grid = document.querySelector(".grid");
    if (grid) grid.style.setProperty("display", "none", "important");
  }

  function installHomeDisplayGuard() {
    if (window.__ngHomeDisplayGuard) return;
    const original = window.setTab;
    if (typeof original !== "function") return;
    window.setTab = function () {
      const result = original.apply(this, arguments);
      hideLegacyCalculator();
      return result;
    };
    window.__ngHomeDisplayGuard = true;
  }

  function renderState() {
    ready = validProfile(profile());
    document.body.classList.toggle("ng-first-login", !ready);
    document.body.classList.toggle("ng-regular-user", ready);
    document.body.classList.toggle("post-profile", ready);
    if (firstHome) firstHome.hidden = ready;
    if (home) home.hidden = !ready || profileOpen;
    if (profilePage) profilePage.hidden = !profileOpen;
    setupNav(ready);
    if (!ready) {
      moveForm(setupSlot);
      if (form) {
        const title = $("h2", form);
        if (title) title.textContent = "Set up your personal plan";
        const submit = $("button[type='submit']", form);
        if (submit) submit.textContent = "Complete setup";
      }
    } else {
      if (form) {
        const submit = $("button[type='submit']", form);
        if (submit) submit.textContent = "Save profile details";
      }
    }
    renderProfile();
    hideLegacyCalculator();
    installHomeDisplayGuard();
    if (window.ngRefreshWellness) window.ngRefreshWellness();
    window.dispatchEvent(new Event("ng:profile-state-changed"));
  }

  function attach() {
    if (!form) return;
    form.addEventListener("submit", () => {
      window.setTimeout(() => {
        if (validProfile(profile())) {
          write("ngProfileSetupComplete", true);
          profileOpen = false;
          notice("Setup complete. Your Home is ready.");
          renderState();
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 40);
        }
      }, 100);
    });
  }

  function bind() {
    const profileButton = $("#ngHomeProfileButton");
    if (profileButton) {
      $$("#ngHomeTools > button").forEach((button) => { if (button !== profileButton) button.hidden = true; });
      profileButton.classList.remove("ng-icon-button");
      profileButton.classList.add("ng-profile-button");
      profileButton.textContent = "My Profile";
      profileButton.setAttribute("aria-label", "Open My Profile");
      profileButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openProfile();
      }, true);
    }
    document.addEventListener("click", (event) => {
      const profileButtonTarget = event.target.closest("#ngHomeProfileButton");
      if (profileButtonTarget) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openProfile();
        return;
      }
      const tab = event.target.closest("[data-ng-profile-tab]");
      if (tab) {
        event.preventDefault();
        setProfileTab(tab.dataset.ngProfileTab);
        return;
      }
      const edit = event.target.closest("[data-ng-profile-edit]");
      if (edit) {
        event.preventDefault();
        setProfileTab(edit.dataset.ngProfileEdit);
        return;
      }
      if (event.target.closest("#ngProfileBack")) {
        event.preventDefault();
        closeProfile();
        return;
      }
      if (event.target.closest("#ngSavePreferences")) {
        event.preventDefault();
        notice("Preferences saved.");
        return;
      }
      if (event.target.closest("#ngExportProfile")) {
        event.preventDefault();
        const payload = { profile: profile(), nutritionLog: read("nutritionLog", []), steps: read("steps", 0), water: read("water", 0) };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nutriguide-profile-data.json";
        a.click();
        URL.revokeObjectURL(url);
        notice("Profile export prepared.");
        return;
      }
      if (event.target.closest(".ng-connect")) {
        event.preventDefault();
        notice("Connection setup will be available after provider authorization.");
        return;
      }
      if (event.target.closest(".app-nav button")) {
        if (!ready) {
          event.preventDefault();
          notice("Complete your setup to unlock the rest of NutriGuide.");
          return;
        }
        closeProfile();
      }
      if (event.target.closest("#ngSetupStart")) {
        event.preventDefault();
        $("#form")?.scrollIntoView({ behavior: "smooth", block: "center" });
        $("#age")?.focus({ preventScroll: true });
        return;
      }
      if (event.target.closest("#ngFillDemo")) {
        event.preventDefault();
        if ($("#age")) $("#age").value = "30";
        if ($("#height")) $("#height").value = "170";
        if ($("#weight")) $("#weight").value = "70";
        if ($("#sex")) $("#sex").value = "male";
        if ($("#activity")) $("#activity").value = "1.375";
        if ($("#goal")) $("#goal").value = "loss";
        notice("Demo values filled. Review them before completing setup.");
      }
    }, true);
  }

  function boot() {
    if (booted) return;
    home = $("#ngHomeRedesign");
    form = $("#form");
    if (!home || !form) {
      window.setTimeout(boot, 250);
      return;
    }
    booted = true;
    firstHome = makeFirstHome();
    profilePage = makeProfilePage();
    setupSlot = $("#ngSetupFormSlot", firstHome);
    profileFormSlot = $("#ngProfileFormSlot", profilePage);
    moveForm(setupSlot);
    attach();
    bind();
    renderState();
  }

  document.addEventListener("DOMContentLoaded", boot);
  window.setTimeout(boot, 250);
  window.setTimeout(boot, 900);
  window.setInterval(hideLegacyCalculator, 250);
})();

/* NutriGuide premium UI enhancements */
(function () {
  "use strict";

  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };
  var once = function (el, key) {
    if (!el || el.dataset[key]) return false;
    el.dataset[key] = "1";
    return true;
  };

  function pandaGuide() {
    var hero = $(".hero");
    if (!hero || $("#ngPremiumPanda")) return;
    var card = document.createElement("aside");
    card.id = "ngPremiumPanda";
    card.className = "ng-panda-guide";
    card.innerHTML =
      '<span class="ng-panda-face" aria-hidden="true">🐼</span>' +
      '<span><strong>Panda’s small win</strong><em>One small action today is enough.</em></span>';
    hero.appendChild(card);
  }

  function heroCopy() {
    var title = $(".hero h1");
    if (title) {
      title.innerHTML = "Your wellness,<br><span>beautifully organized.</span>";
    }
    var intro = $(".hero p");
    if (intro) intro.textContent = "Nutrition, movement, recovery, and progress in one calm space.";
  }

  function foodFilters() {
    var anchor = $("#foodGrid") || $(".food-library") || $(".food-studio");
    if (!anchor || $("#ngPremiumFoodFilters")) return;
    var row = document.createElement("div");
    row.id = "ngPremiumFoodFilters";
    row.className = "ng-food-filter-row";
    row.setAttribute("aria-label", "Food filters");
    [
      ["all", "All foods"],
      ["breakfast", "Breakfast"],
      ["indian", "Indian"],
      ["protein", "High protein"],
      ["light", "Low calorie"]
    ].forEach(function (item, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "ng-food-filter" + (index === 0 ? " is-active" : "");
      button.dataset.filter = item[0];
      button.textContent = item[1];
      button.addEventListener("click", function () {
        $$(".ng-food-filter", row).forEach(function (b) { b.classList.remove("is-active"); });
        button.classList.add("is-active");
        var fn = window.showFoods;
        if (typeof fn === "function") {
          var map = { all: "balanced", breakfast: "breakfast", indian: "indian", protein: "balanced", light: "salads" };
          try { fn(map[item[0]]); } catch (e) { try { fn(); } catch (_) {} }
        }
        $$(".food-card, .food-item, .food-result").forEach(function (card) {
          var text = (card.textContent || "").toLowerCase();
          var visible = item[0] === "all" ||
            (item[0] === "protein" && /protein|paneer|soya|dal|egg|chickpea/.test(text)) ||
            (item[0] === "light" && /salad|fruit|light|low calorie|vegetable/.test(text)) ||
            (item[0] === "breakfast" && /breakfast|oats|poha|upma|idli|paratha/.test(text)) ||
            (item[0] === "indian" && /roti|dal|paneer|poha|idli|biryani|rice|indian/.test(text));
          card.hidden = !visible;
        });
      });
      row.appendChild(button);
    });
    anchor.parentNode.insertBefore(row, anchor);
  }

  function profileWizard() {
    var form = $("#form");
    if (!form || form.dataset.ngPremiumWizard) return;
    var ids = ["age", "sex", "height", "weight", "activity", "goal"];
    var fields = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (fields.length < 4) return;
    form.dataset.ngPremiumWizard = "1";
    var heading = $("h2", form);
    var progress = document.createElement("div");
    progress.id = "ngProfileProgress";
    progress.className = "ng-profile-progress";
    progress.innerHTML = '<span>Step <b>1</b> of 4</span><i><b></b></i>';
    if (heading) heading.after(progress); else form.prepend(progress);

    var groups = [["age", "sex"], ["height", "weight"], ["activity"], ["goal"]];
    var steps = [];
    groups.forEach(function (group, index) {
      var step = document.createElement("div");
      step.className = "ng-profile-step";
      step.dataset.step = String(index);
      group.forEach(function (id) {
        var input = document.getElementById(id);
        if (!input) return;
        var label = form.querySelector('label[for="' + id + '"]') || input.previousElementSibling;
        if (label && label.parentNode === form) step.appendChild(label);
        step.appendChild(input);
      });
      form.appendChild(step);
      steps.push(step);
    });
    var submit = form.querySelector('button[type="submit"], input[type="submit"]');
    var hint = form.querySelector(".hint, .form-hint, small");
    if (submit && submit.parentNode === form) steps[3].appendChild(submit);
    if (hint && hint.parentNode === form) steps[3].appendChild(hint);

    var controls = document.createElement("div");
    controls.className = "ng-profile-controls";
    controls.innerHTML = '<button type="button" class="ng-profile-back" disabled>Back</button><button type="button" class="ng-profile-next">Continue</button>';
    form.appendChild(controls);
    var current = 0;
    function render() {
      steps.forEach(function (step, i) { step.hidden = i !== current; });
      var back = $(".ng-profile-back", controls);
      var next = $(".ng-profile-next", controls);
      back.disabled = current === 0;
      next.hidden = current === steps.length - 1;
      if (submit) submit.hidden = current !== steps.length - 1;
      var label = $("span", progress);
      var bar = $("i b", progress);
      if (label) label.innerHTML = "Step <b>" + (current + 1) + "</b> of 4";
      if (bar) bar.style.width = (((current + 1) / 4) * 100) + "%";
    }
    $(".ng-profile-next", controls).addEventListener("click", function () {
      var invalid = $$("input, select", steps[current]).find(function (input) { return !input.checkValidity(); });
      if (invalid) { invalid.reportValidity(); return; }
      if (current < steps.length - 1) { current += 1; render(); }
    });
    $(".ng-profile-back", controls).addEventListener("click", function () {
      if (current > 0) { current -= 1; render(); }
    });
    render();
  }

  function exerciseCards() {
    $$("#exerciseCards .exercise-card, #exerciseCards .exercise, .exercise-cards .exercise-card").forEach(function (card, index) {
      if (!once(card, "ngPremiumExercise")) return;
      var meta = document.createElement("div");
      meta.className = "ng-exercise-meta";
      var values = [
        ["Difficulty", index % 3 === 0 ? "Beginner" : index % 3 === 1 ? "Moderate" : "Advanced"],
        ["Duration", (10 + index * 5) + " min"],
        ["Calories", (60 + index * 35) + " kcal"]
      ];
      values.forEach(function (value) {
        var span = document.createElement("span");
        span.innerHTML = "<b>" + value[1] + "</b><small>" + value[0] + "</small>";
        meta.appendChild(span);
      });
      var action = document.createElement("span");
      action.className = "ng-view-steps";
      action.textContent = "View steps →";
      meta.appendChild(action);
      card.appendChild(meta);
    });
  }

  function friendlyEmptyStates() {
    var messages = [
      ["#timeline", "Your first meal starts your journey.", "Log a meal and your day will begin to take shape."],
      ["#groceryList, #ngGroceryList", "Your pantry is ready for a fresh start.", "Add ingredients to build your next healthy plan."],
      ["#reminderList", "Your day is still open.", "Add a reminder to protect time for yourself."],
      ["#ngMealList, #nutritionLog", "Your first meal starts your journey.", "Use Add to today to see your nutrition rhythm here."]
    ];
    messages.forEach(function (item) {
      $$(item[0]).forEach(function (target) {
        var text = (target.textContent || "").trim().toLowerCase();
        if (target.querySelector(".ng-empty-state") || !text) return;
        if (!/no entries|no ingredients|no reminders|nothing logged|no meals|empty/.test(text)) return;
        target.innerHTML = '<div class="ng-empty-state"><span class="ng-empty-icon">✦</span><strong>' + item[1] + '</strong><em>' + item[2] + '</em></div>';
      });
    });
  }

  function weeklyChart() {
    var report = $(".weekly-report");
    if (!report || $("#ngPremiumWeeklyChart")) return;
    var wrap = document.createElement("section");
    wrap.id = "ngPremiumWeeklyChart";
    wrap.className = "ng-weekly-chart";
    wrap.innerHTML = '<div class="ng-chart-heading"><div><span class="eyebrow">THIS WEEK</span><h3>Your wellness rhythm</h3></div><span class="ng-chart-pill">7 day view</span></div><div class="ng-week-bars"></div><p class="ng-weekly-insight"></p>';
    var bars = $(".ng-week-bars", wrap);
    ["M", "T", "W", "T", "F", "S", "S"].forEach(function (day, index) {
      var item = document.createElement("div");
      item.className = "ng-week-bar";
      item.innerHTML = '<i></i><span>' + day + '</span>';
      item.querySelector("i").style.height = ([38, 52, 68, 46, 78, 61, 86][index]) + "%";
      bars.appendChild(item);
    });
    report.appendChild(wrap);
    var insight = $(".ng-weekly-insight", wrap);
    if (insight) insight.textContent = "You are building a steady rhythm. Keep one small promise to yourself today.";
  }

  function transitions() {
    $$(".app-nav button, .app-nav a").forEach(function (button) {
      if (!once(button, "ngPremiumTransition")) return;
      button.addEventListener("click", function () {
        document.body.classList.add("ng-premium-transition");
        window.setTimeout(function () { document.body.classList.remove("ng-premium-transition"); }, 280);
      });
    });
  }

  function boot() {
    heroCopy();
    pandaGuide();
    foodFilters();
    profileWizard();
    exerciseCards();
    friendlyEmptyStates();
    weeklyChart();
    transitions();
  }

  var timer;
  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(boot, 80);
  }

  document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("ng:cloud-hydrated", schedule);
  if (window.MutationObserver) {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  window.setTimeout(boot, 450);
})();
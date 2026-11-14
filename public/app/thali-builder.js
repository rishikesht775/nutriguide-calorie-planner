(() => {
  "use strict";
  const components = {
    grain: [
      { id: "roti", label: "2 whole-wheat rotis", cal: 220, p: 7, fiber: 6, cost: 18 },
      { id: "rice", label: "1 bowl brown rice", cal: 215, p: 5, fiber: 3, cost: 22 },
      { id: "millet", label: "1 bowl millet khichdi", cal: 260, p: 9, fiber: 7, cost: 35 }
    ],
    protein: [
      { id: "dal", label: "1 bowl dal", cal: 180, p: 10, fiber: 8, cost: 28 },
      { id: "paneer", label: "Paneer bhurji", cal: 265, p: 18, fiber: 3, cost: 65 },
      { id: "tofu", label: "Tofu bhurji", cal: 190, p: 20, fiber: 3, cost: 55 },
      { id: "soya", label: "Soya chunk curry", cal: 210, p: 24, fiber: 8, cost: 35 },
      { id: "chana", label: "Chana masala", cal: 240, p: 13, fiber: 11, cost: 32 }
    ],
    vegetable: [
      { id: "mixed", label: "1 bowl mixed vegetables", cal: 120, p: 4, fiber: 7, cost: 35 },
      { id: "palak", label: "Palak sabzi", cal: 105, p: 5, fiber: 5, cost: 30 },
      { id: "salad", label: "Large kachumber salad", cal: 55, p: 2, fiber: 4, cost: 20 }
    ],
    side: [
      { id: "curd", label: "1 bowl curd", cal: 95, p: 5, fiber: 0, cost: 25 },
      { id: "raita", label: "Cucumber raita", cal: 80, p: 4, fiber: 1, cost: 28 },
      { id: "buttermilk", label: "1 glass chaas", cal: 55, p: 3, fiber: 0, cost: 15 }
    ]
  };
  const find = (group, id) => components[group].find(x => x.id === id) || components[group][0];
  const total = selection => ["grain", "protein", "vegetable", "side"].map(k => find(k, selection[k])).reduce((a, x) => ({ cal: a.cal + x.cal, p: a.p + x.p, fiber: a.fiber + x.fiber, cost: a.cost + x.cost }), { cal: 0, p: 0, fiber: 0, cost: 0 });
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let current = null;

  function addStyles() {
    if (document.getElementById("ngThaliStyles")) return;
    const style = document.createElement("style");
    style.id = "ngThaliStyles";
    style.textContent = ".ng-thali-builder{margin:18px auto;max-width:940px}.ng-thali-builder .ng-thali-layout{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}.ng-thali-builder .ng-thali-plate{display:grid;gap:12px}.ng-thali-builder .ng-thali-result{border:1px solid var(--ng-line,#dbe9e4);border-radius:18px;padding:18px;background:linear-gradient(145deg,#fffaf1,#f0fbf6)}.ng-thali-builder .ng-thali-result h3{margin:0 0 8px}.ng-thali-builder .ng-thali-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.ng-thali-builder .ng-thali-metrics span{padding:10px;border-radius:12px;background:#fff;border:1px solid #dbe9e4}.ng-thali-builder .ng-thali-metrics b,.ng-thali-builder .ng-thali-metrics small{display:block}.ng-thali-builder .ng-thali-metrics small{color:#6c7d76;margin-top:3px}.ng-thali-builder .ng-thali-swaps{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.ng-thali-builder .ng-thali-swap{width:auto;margin:0;padding:8px 11px;background:#fff;border:1px solid #b9ddd1;color:#176c58;box-shadow:none}.ng-thali-builder .ng-thali-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.ng-thali-builder .ng-thali-actions button{width:auto;margin:0}.ng-thali-builder .ng-thali-note{color:#61766f;font-size:12px}.ng-thali-builder .ng-thali-plate label{margin:0}.ng-thali-builder .ng-thali-plate select{width:100%}@media(max-width:760px){.ng-thali-builder .ng-thali-layout{grid-template-columns:1fr}.ng-thali-builder .ng-thali-metrics{grid-template-columns:repeat(2,1fr)}}";
    document.head.append(style);
  }

  function build() {
    const root = document.getElementById("ngThaliBuilder");
    if (!root) return;
    const selection = Object.fromEntries(["grain", "protein", "vegetable", "side"].map(group => [group, root.querySelector('[data-thali-select="' + group + '"]').value]));
    const values = total(selection);
    const parts = ["grain", "protein", "vegetable", "side"].map(group => find(group, selection[group]).label);
    const proteinStatus = values.p >= 25 ? "Protein-forward plate" : "Add a higher-protein swap for a stronger meal";
    current = { name: "Custom Indian thali", selection, ...values, parts, proteinStatus };
    root.querySelector("#ngThaliResult").innerHTML = "<h3>" + esc(proteinStatus) + "</h3><p>" + esc(parts.join(" · ")) + "</p><div class=\"ng-thali-metrics\"><span><b>" + values.cal + "</b><small>kcal</small></span><span><b>" + values.p + " g</b><small>protein</small></span><span><b>" + values.fiber + " g</b><small>fibre</small></span><span><b>₹" + values.cost + "</b><small>estimated</small></span></div><div class=\"ng-thali-swaps\"><button type=\"button\" class=\"ng-thali-swap\" data-thali-swap=\"tofu\">Swap to tofu</button><button type=\"button\" class=\"ng-thali-swap\" data-thali-swap=\"soya\">Swap to soya</button><button type=\"button\" class=\"ng-thali-swap\" data-thali-swap=\"salad\">Add salad</button></div><div class=\"ng-thali-actions\"><button type=\"button\" class=\"primary\" data-thali-action=\"use\">Use in food log</button><button type=\"button\" data-thali-action=\"save\">Save thali draft</button></div><p class=\"ng-thali-note\">Values are estimates. Review portions and ingredients before saving.</p>";
    root.querySelector("#ngThaliStatus").textContent = "Your plate is ready. Adjust a component or send it to the food log.";
  }

  function applySwap(id) {
    const root = document.getElementById("ngThaliBuilder");
    if (!root) return;
    if (id === "tofu" || id === "soya") root.querySelector('[data-thali-select="protein"]').value = id;
    if (id === "salad") root.querySelector('[data-thali-select="vegetable"]').value = id;
    build();
  }

  function useInLog() {
    if (!current) build();
    if (!current) return;
    const food = document.getElementById("nutritionFood");
    const qty = document.getElementById("nutritionQuantity");
    const cal = document.getElementById("nutritionCalories");
    const protein = document.getElementById("nutritionProtein");
    const fiber = document.getElementById("nutritionFiber");
    if (food) food.value = current.parts.join(", ");
    if (qty) qty.value = "1";
    if (cal) cal.value = String(current.cal);
    if (protein) protein.value = String(current.p);
    if (fiber) fiber.value = String(current.fiber);
    document.querySelector(".food-nutrition")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("ngThaliStatus").textContent = "Food log filled. Review the serving and press Save food.";
  }

  function saveDraft() {
    if (!current) build();
    if (!current) return;
    window.NG?.write?.("ngThaliDraft", current);
    document.getElementById("ngThaliStatus").textContent = "Thali draft saved to this account.";
  }

  function create() {
    if (document.getElementById("ngThaliBuilder")) return;
    const anchor = document.getElementById("ngMealPlanner") || document.querySelector(".ng-section[data-ng-tab='food']");
    if (!anchor || !anchor.parentNode) return;
    addStyles();
    const section = document.createElement("section");
    section.id = "ngThaliBuilder";
    section.className = "ng-section ng-thali-builder";
    section.dataset.ngTab = "food";
    section.innerHTML = "<div class=\"ng-heading\"><div><div class=\"ng-kicker\">INDIAN PLATE INTELLIGENCE</div><h2>Build your thali</h2><p>Choose familiar components and see the protein, fibre, calorie and budget balance before logging.</p></div><span class=\"ng-chip\">Indian portions • smart swaps</span></div><div class=\"ng-thali-layout\"><div class=\"ng-thali-plate\"><label>Grain or base<select data-thali-select=\"grain\"><option value=\"roti\">2 whole-wheat rotis</option><option value=\"rice\">1 bowl brown rice</option><option value=\"millet\">1 bowl millet khichdi</option></select></label><label>Protein centre<select data-thali-select=\"protein\"><option value=\"dal\">1 bowl dal</option><option value=\"paneer\">Paneer bhurji</option><option value=\"tofu\">Tofu bhurji</option><option value=\"soya\">Soya chunk curry</option><option value=\"chana\">Chana masala</option></select></label><label>Vegetable side<select data-thali-select=\"vegetable\"><option value=\"mixed\">1 bowl mixed vegetables</option><option value=\"palak\">Palak sabzi</option><option value=\"salad\">Large kachumber salad</option></select></label><label>Cooling side<select data-thali-select=\"side\"><option value=\"curd\">1 bowl curd</option><option value=\"raita\">Cucumber raita</option><option value=\"buttermilk\">1 glass chaas</option></select></label><button type=\"button\" class=\"primary\" data-thali-action=\"build\">Calculate this thali</button></div><div><div id=\"ngThaliResult\" class=\"ng-thali-result\"><h3>Your thali preview</h3><p>Choose your components, then calculate the balance.</p></div><div id=\"ngThaliStatus\" class=\"ng-status\" role=\"status\">This planner keeps the estimate visible before anything is logged.</div></div></div>";
    anchor.insertAdjacentElement("afterend", section);
    section.addEventListener("change", event => { if (event.target.matches("[data-thali-select]")) build(); });
    section.addEventListener("click", event => {
      const swap = event.target.closest("[data-thali-swap]");
      const action = event.target.closest("[data-thali-action]");
      if (swap) applySwap(swap.dataset.thaliSwap);
      if (action?.dataset.thaliAction === "build") build();
      if (action?.dataset.thaliAction === "use") useInLog();
      if (action?.dataset.thaliAction === "save") saveDraft();
    });
    build();
    const active = document.querySelector(".app-nav button.active")?.dataset.tab || "home";
    window.setTab?.(active);
  }

  create();
  window.setTimeout(create, 400);
})();

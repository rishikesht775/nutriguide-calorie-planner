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
    .ng-preference-note{display:flex;align-items:flex-start;gap:10px;margin-top:12px;padding:12px 14px;border-radius:16px;background:#effaf3;border:1px solid #cfe6d7;color:#245c42;font-size:12px;line-height:1.45}.ng-preference-note span{font-size:22px}
    .ng-allergy-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.ng-allergy{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:12px}.ng-allergy input{width:auto;margin:0}
    .diwali-mode{background:radial-gradient(circle at 12% 10%,#fff2b8 0,transparent 24%),radial-gradient(circle at 88% 8%,#ffe0a3 0,transparent 22%),linear-gradient(135deg,#fffaf0,#fff6e3 45%,#fffaf1)}
    .diwali-mode .card,.diwali-mode .ng-card{border-color:#e9bd62;box-shadow:0 14px 34px #bd731d18}.diwali-mode .card,.diwali-mode .ng-card{position:relative;overflow:hidden}.diwali-mode .card::after,.diwali-mode .ng-card::after{content:'✨';position:absolute;right:14px;top:10px;font-size:18px;opacity:.72;pointer-events:none}.diwali-mode .hero{box-shadow:0 18px 45px #bd731d22}.ng-diwali-lights{position:fixed;inset:0;pointer-events:none;z-index:10}.ng-diwali-lights span{position:absolute;font-size:22px;filter:drop-shadow(0 4px 8px #c2791d44);animation:ngDiwaliFloat 3.4s ease-in-out infinite}.ng-diwali-lights span:nth-child(1){top:88px;left:18px}.ng-diwali-lights span:nth-child(2){top:120px;right:20px;animation-delay:.6s}.ng-diwali-lights span:nth-child(3){bottom:22px;left:20px;animation-delay:1.1s}.ng-diwali-lights span:nth-child(4){bottom:28px;right:22px;animation-delay:1.7s}.ng-diwali-welcome{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px;padding:18px 20px;border:1px solid #e8b54f;border-radius:26px;color:#fff7df;background:linear-gradient(115deg,#5d1b2a,#a7442f 48%,#7a3d1b);box-shadow:0 18px 36px #7d351d2a;overflow:hidden;position:relative}.ng-diwali-welcome::before{content:'🌸 ✨ 🪔 ✨ 🌼 ✨ 🪔 ✨ 🌸';position:absolute;left:0;right:0;bottom:5px;text-align:center;font-size:17px;letter-spacing:9px;opacity:.82}.ng-diwali-welcome h2{margin:4px 0;font-size:clamp(22px,4vw,34px);color:#fff3bc}.ng-diwali-welcome p{margin:5px 0 13px;color:#ffeec8;font-size:13px;line-height:1.45}.ng-diwali-art{font-size:48px;min-width:100px;text-align:center;filter:drop-shadow(0 8px 10px #16070a55);animation:ngDiwaliFloat 3s ease-in-out infinite}.ng-diwali-calendar{display:flex;flex-wrap:wrap;gap:7px;position:relative;z-index:1}.ng-diwali-calendar span{padding:6px 9px;border-radius:999px;background:#ffffff1f;border:1px solid #ffffff44;color:#fff7df;font-size:10px;font-weight:800}.ng-diwali-calendar .today{background:#ffd86f;color:#5d1b2a;border-color:#ffeab0}.ng-diwali-badge{display:flex;align-items:center;gap:8px;margin:-4px 0 14px;padding:8px 11px;border-radius:999px;background:linear-gradient(90deg,#fff1b7,#ffe2a1);border:1px solid #e8bf62;color:#7b4b16;font-size:11px;font-weight:800;letter-spacing:.2px}.ng-diwali-badge span{margin-left:auto}.ng-diwali-food-banner{display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:16px 18px;border-radius:20px;color:#fff7df;background:linear-gradient(110deg,#6b1e27,#b55729 50%,#7d351d);box-shadow:0 12px 24px #7d351d2b}.ng-diwali-food-banner strong{display:block;font-size:18px}.ng-diwali-food-banner small{display:block;margin-top:3px;color:#ffeec0}.ng-diwali-food-banner .ng-diwali-food-icon{font-size:34px;white-space:nowrap}@keyframes ngDiwaliFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}
    .ng-status{font-size:12px;color:var(--muted);margin-top:8px}.ng-offline{background:#fff1dd!important;color:#72501c!important}
    .ng-dark{--ink:#ecfff4;--muted:#b7cec1;--mint:#1e4936;--cream:#1e3029;--line:#315444;background:#10241c}.ng-dark .card,.ng-dark .ng-card,.ng-dark .stat,.ng-dark .ng-metric,.ng-dark .ng-device,.ng-dark .ng-swap,.ng-dark .ng-exercise-plan article{background:#173329;color:var(--ink)}.ng-dark input,.ng-dark select,.ng-dark textarea{background:#10241c;color:var(--ink);border-color:#315444}.ng-dark .hero{background:linear-gradient(90deg,#173329ee,#173329aa),url('mascot-buddies.png') center/cover}
    .ng-large{font-size:18px}.ng-large .ng-card,.ng-large .card{padding:25px}.ng-large button{min-height:48px}
    .ng-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;background:#173c31;color:#fff;border-radius:999px;padding:11px 16px;font-size:12px;box-shadow:0 8px 22px #0003;opacity:0;pointer-events:none;transition:opacity .2s}.ng-toast.show{opacity:1}
    @media(max-width:900px){.ng-grid{grid-template-columns:repeat(2,1fr)}.ng-swap-grid{grid-template-columns:repeat(2,1fr)}.ng-form{grid-template-columns:1fr 1fr}.ng-exercise-plan{grid-template-columns:1fr 1fr}}
    @media(max-width:760px){.ng-card{padding:18px;border-radius:20px}.ng-grid-2{grid-template-columns:1fr}.ng-form{grid-template-columns:1fr 1fr}.ng-form button{grid-column:span 2}.ng-exercise-plan{grid-template-columns:1fr}.ng-swap-grid{grid-template-columns:1fr 1fr}.ng-metric{min-height:96px}.ng-next{align-items:flex-start}.ng-next .ng-actions{width:100%}.ng-device{align-items:flex-start}.ng-device button{margin-top:2px}.ng-diwali-welcome{padding:16px 14px}.ng-diwali-art{font-size:34px;min-width:58px}.ng-diwali-calendar span{font-size:9px;padding:5px 7px}}

    /* Premium Royal Palace + Jewel Rangoli direction */
    body.diwali-premium{--ink:#2c1a2d;--muted:#786979;--line:#ead9b7;background:radial-gradient(circle at 8% 6%,#ffe5a8 0,transparent 22%),radial-gradient(circle at 92% 12%,#f7c2c2 0,transparent 20%),linear-gradient(135deg,#fffaf1 0%,#fff1dc 52%,#fffaf4 100%);color:var(--ink)}
    body.diwali-premium:before{opacity:.18;background-image:radial-gradient(#b47a2a 1px,transparent 1px),radial-gradient(#7a2f47 1px,transparent 1px);background-size:26px 26px,54px 54px;background-position:0 0,14px 18px}
    .diwali-premium .wrap{max-width:1120px}
    .diwali-premium .app-nav{background:linear-gradient(100deg,#3a1734f5,#6b2443ef 48%,#8a4a1df0);border:1px solid #e8bd64;box-shadow:0 12px 28px #6b24432e}
    .diwali-premium .app-nav button{background:#ffffff18;color:#fff3cf;border:1px solid #ffffff2c}
    .diwali-premium .app-nav button:hover,.diwali-premium .app-nav button.active{background:linear-gradient(135deg,#ffd76c,#e9a947);color:#3c1b2e;box-shadow:0 7px 18px #ffd76c40}
    .diwali-premium .card,.diwali-premium .ng-card{border-color:#e7bd69;background:linear-gradient(145deg,#fffdf8f5,#fff5e5ed);box-shadow:0 16px 36px #7d351d18,0 0 0 1px #fff9e8 inset}
    .diwali-premium .card:hover,.diwali-premium .ng-card:hover{box-shadow:0 20px 42px #7d351d25,0 0 0 1px #fff9e8 inset}
    .diwali-premium .hero{background:linear-gradient(90deg,#fff9eef2 0%,#fff3d9d9 42%,#fff3d933 76%),url('mascot-buddies.png') center/cover;box-shadow:0 22px 48px #7d351d24;border:1px solid #e8bd64}
    .diwali-premium .hero h1{color:#3a1734;text-shadow:0 2px 0 #fff5d2}.diwali-premium .hero h1 span{color:#a4472b!important}
    .diwali-premium .eyebrow{color:#9d4a28}
    .diwali-premium button{background:linear-gradient(135deg,#7a2443,#b4572c);box-shadow:0 8px 18px #7a24432b}.diwali-premium button:hover{filter:saturate(1.15) brightness(1.04);transform:translateY(-1px)}
    .diwali-premium .ng-diwali-welcome{border:1px solid #f2cc70;background:linear-gradient(120deg,#3a1734 0%,#702642 46%,#a84b2a 100%);box-shadow:0 22px 44px #5f1e3d3d}
    .diwali-premium .ng-diwali-welcome:after{content:'✦  ✧  ✦  ✧  ✦';position:absolute;right:18px;top:12px;color:#ffe39a;letter-spacing:8px;font-size:17px;opacity:.8}
    .diwali-premium .ng-diwali-badge{background:linear-gradient(90deg,#fff0b7,#ffe0a1);color:#6e2933;border-color:#e8b95c;box-shadow:0 5px 14px #c17b2020}
    .ng-diwali-topline{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-2px 0 9px;color:#ffe4a0;font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
    .ng-diwali-sound{width:auto!important;margin:0!important;padding:8px 11px!important;border:1px solid #ffe7a6!important;background:#ffffff19!important;color:#fff6d3!important;font-size:11px!important;box-shadow:none!important}
    .ng-diwali-sound[aria-pressed="false"]{opacity:.7}
    .diwali-premium .ng-diwali-food-banner{border:1px solid #f1c968;background:linear-gradient(110deg,#4a1735,#8d2f46 48%,#b75a2b);box-shadow:0 18px 32px #6c233b2e}
    .ng-food-guides{margin:0 0 16px;padding:16px;border-radius:24px;background:linear-gradient(135deg,#fff3c9,#fffaf1 48%,#f6dfeb);border:1px solid #e8bd69;box-shadow:0 12px 24px #7d351d14}
    .ng-food-guides-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.ng-food-guides-head h3{margin:2px 0 4px;color:#4b1b38}.ng-food-guides-head p{margin:0;color:#786979;font-size:12px;line-height:1.45}.ng-food-guide-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.ng-food-guide{border:1px solid #e8d0a1;border-radius:18px;padding:12px;background:#fffaf4;cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s;text-align:left}.ng-food-guide:hover,.ng-food-guide.active{transform:translateY(-4px);border-color:#b34f2c;box-shadow:0 12px 22px #7d351d1f}.ng-food-guide .avatar{font-size:36px;display:block;filter:drop-shadow(0 4px 5px #7d351d22)}.ng-food-guide b{display:block;margin-top:6px;color:#4b1b38;font-size:13px}.ng-food-guide small{display:block;margin-top:3px;color:#786979;font-size:11px;line-height:1.35}.ng-food-guide em{display:block;margin-top:7px;color:#a4472b;font-size:10px;font-style:normal;font-weight:800}.ng-food-guide-message{margin:12px 0 0;padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #efd6a0;color:#5c3d45;font-size:12px;line-height:1.45}
    .diwali-premium .food-tabs button{background:linear-gradient(145deg,#fff8e4,#f7e3ec);border:1px solid #e8c27b;color:#5b2940}.diwali-premium .food-tabs button:hover,.diwali-premium .food-tabs button:focus{background:linear-gradient(145deg,#7a2443,#b4572c);color:#fff7db}
    .diwali-premium .food-card,.diwali-premium .food-item,.diwali-premium .ng-swap,.diwali-premium .ng-metric,.diwali-premium .ng-device,.diwali-premium .ng-exercise-plan article{border-color:#ecd4a5;background:linear-gradient(145deg,#fffef9,#fff4e4);box-shadow:0 8px 18px #7d351d12}
    .diwali-premium .food-card:hover{box-shadow:0 16px 26px #7d351d20}
    .diwali-premium .guide-coach{background:linear-gradient(100deg,#3a1734,#7a2443 55%,#b4572c);border:1px solid #e8bd69;box-shadow:0 12px 25px #6b24432b}
    .diwali-premium .weekly-strip{background:linear-gradient(100deg,#3a1734,#6b2443 55%,#8d4a20);border:1px solid #e8bd69;box-shadow:0 14px 28px #6b24432e}
    .diwali-premium .inspiration{background:linear-gradient(135deg,#4a1735,#7b2949 52%,#9e4b27);border:1px solid #e9bd67}
    .diwali-premium .ng-next{background:linear-gradient(120deg,#3a1734,#7a2443 58%,#a84b2a);border:1px solid #edc66b}
    .diwali-premium .ng-toast{background:#3a1734;border:1px solid #f0c766;box-shadow:0 10px 26px #3a17345c}
    .diwali-premium .ng-diwali-lights span{filter:drop-shadow(0 4px 10px #e5a42b66)}
    @media(max-width:760px){.ng-food-guide-grid{grid-template-columns:1fr}.ng-food-guides{padding:14px}.ng-food-guides-head{display:block}.ng-diwali-topline{align-items:flex-start}.diwali-premium .app-nav{box-shadow:0 8px 20px #6b24432e}}
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

    <section class="ng-card ng-tab-section ng-food-section" data-ng-tab="food" id="ngDietPreferences">
      <div class="eyebrow">PERSONALISE YOUR PLAN</div><h2>Set your food preferences</h2>
      <p class="ng-sub">These choices shape meal suggestions across your journey. You can change them anytime.</p>
      <div class="ng-form">
        <label>Food style<select id="ngDietStyle"><option value="balanced">Balanced</option><option value="high-protein">High-protein vegetarian</option><option value="vegan">Vegan</option><option value="jain">Jain-friendly</option><option value="eggetarian">Eggetarian</option><option value="non-vegetarian">Non-vegetarian</option><option value="low-carb">Low-carb / keto</option></select></label>
        <label>Regional focus<select id="ngDietRegion"><option value="any">Any Indian region</option><option value="north">North Indian</option><option value="south">South Indian</option><option value="bengali">Bengali</option><option value="maharashtrian">Maharashtrian</option><option value="gujarati">Gujarati</option><option value="punjabi">Punjabi</option></select></label>
        <label>Weekly budget<select id="ngDietBudget"><option value="low">Budget-friendly</option><option value="medium" selected>Balanced budget</option><option value="flexible">Flexible</option></select></label>
        <button type="button" onclick="ngSaveDietPrefs()">Save preferences</button>
      </div>
      <div class="ng-allergy-list" aria-label="Food exclusions">
        <label class="ng-allergy"><input id="ngAvoidDairy" type="checkbox"> Avoid dairy</label>
        <label class="ng-allergy"><input id="ngAvoidNuts" type="checkbox"> Avoid nuts</label>
        <label class="ng-allergy"><input id="ngAvoidGluten" type="checkbox"> Avoid gluten</label>
        <label class="ng-allergy"><input id="ngAvoidSoy" type="checkbox"> Avoid soy</label>
      </div>
      <div class="ng-preference-note"><span>🥗</span><div><b id="ngDietPreferenceTitle">Balanced Indian meals</b><br><span id="ngDietPreferenceText">Save your preferences and your guide will use them when suggesting meals and swaps.</span></div></div>
    </section>

    <section class="ng-card ng-tab-section ng-plan-section" data-ng-tab="plan" id="ngRecovery">
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

    <section class="ng-card ng-tab-section ng-plan-section" data-ng-tab="plan" id="ngWearables">
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

  const diwaliFoods = [
    ['🪔', 'Makhana kheer', 'Roasted fox nuts simmered in milk with cardamom; keep sugar light.', 180, 7, 24, 6, 3],
    ['🍬', 'Anjeer date ladoo', 'Naturally sweet dried-fruit ladoo with a small celebration portion.', 145, 3, 24, 5, 4],
    ['🥥', 'Ragi coconut ladoo', 'Ragi, coconut and dates for a fibre-rich festive bite.', 135, 3, 21, 5, 3],
    ['🥜', 'Peanut sesame chikki', 'Roasted peanut and sesame brittle; enjoy one small piece.', 155, 5, 16, 8, 3],
    ['🥟', 'Baked gujiya', 'A lighter baked version filled with coconut and khoya.', 210, 6, 30, 8, 2],
    ['🍿', 'Diwali masala makhana', 'Roasted fox nuts with chilli, cumin and a little ghee.', 150, 5, 22, 5, 4],
    ['🌾', 'Roasted chana chivda', 'Crispy chana, poha and curry leaves with less oil.', 190, 8, 29, 5, 6],
    ['🍎', 'Festive fruit chaat', 'Apple, guava, orange and pomegranate with lime and chaat masala.', 120, 2, 28, 1, 6],
    ['🥣', 'Steamed dhokla bites', 'Soft besan dhokla with coriander and a light tempering.', 165, 7, 25, 4, 3],
    ['🍛', 'Light festive thali', 'Dal, seasonal sabzi, salad and one small roti for balance.', 420, 18, 55, 14, 12],
    ['🥗', 'Sprouts festive chaat', 'Moong sprouts, pomegranate, cucumber and mint.', 210, 13, 31, 4, 9],
    ['🥛', 'Kesar almond milk', 'Warm saffron milk; use a small portion and unsweetened milk.', 130, 6, 10, 7, 2]
  ];
  const foodGuides = {
    panda: { avatar: '🐼👨‍🍳', name: 'Panda Chef', role: 'Balanced festive plates', message: 'I will help you enjoy mithai, colourful vegetables, and enough protein without taking the joy out of Diwali.' },
    peacock: { avatar: '🦚🌸', name: 'Peacock Plater', role: 'Colour and variety', message: 'Let us make every plate feel like a rangoli with fruits, salads, pulses, and regional flavours.' },
    fox: { avatar: '🦊🍬', name: 'Mithai Fox', role: 'Smarter sweets', message: 'Choose a small serving, savour it slowly, and pair festive sweets with a nourishing meal.' },
    elephant: { avatar: '🐘🪔', name: 'Diya Elephant', role: 'Mindful traditions', message: 'A calm pace, warm food, and a short walk can keep your festive rhythm comfortable.' }
  };
  let festiveAudioContext;
  function playFestiveSound(kind) {
    if (localStorage.getItem('ngFestiveSound') === 'off') return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      festiveAudioContext = festiveAudioContext || new AudioContextClass();
      const ctx = festiveAudioContext;
      if (ctx.state === 'suspended') ctx.resume();
      const gain = ctx.createGain(); gain.gain.value = 0.0001; gain.connect(ctx.destination);
      const now = ctx.currentTime;
      const tones = kind === 'success' ? [523.25, 659.25, 783.99] : kind === 'crackle' ? [220, 277.18, 329.63] : [392, 523.25];
      tones.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator(); oscillator.type = index === 0 ? 'sine' : 'triangle'; oscillator.frequency.value = frequency;
        oscillator.connect(gain); oscillator.start(now + index * 0.07); oscillator.stop(now + 0.23 + index * 0.07);
      });
      if (kind === 'crackle') {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.24, ctx.sampleRate); const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
        const noise = ctx.createBufferSource(); noise.buffer = buffer; const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.045; noise.connect(noiseGain); noiseGain.connect(gain); noise.start(now);
      }
      gain.gain.exponentialRampToValueAtTime(kind === 'crackle' ? 0.14 : 0.09, now + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    } catch {}
  }
  function renderFoodGuide() {
    const selected = localStorage.getItem('ngFoodGuide') || 'panda'; const guide = foodGuides[selected] || foodGuides.panda;
    document.querySelectorAll('.ng-food-guide').forEach((card) => card.classList.toggle('active', card.dataset.guide === selected));
    const message = document.getElementById('ngFoodGuideMessage'); if (message) message.innerHTML = `<b>${guide.name}:</b> ${guide.message}`;
  }
  window.ngChooseFoodGuide = function (key) {
    if (!foodGuides[key]) return; localStorage.setItem('ngFoodGuide', key); renderFoodGuide(); playFestiveSound('success'); notify(`${foodGuides[key].name} is now your food guide`);
  };
  function installFestiveSoundControls() {
    if (!localStorage.getItem('ngFestiveSound')) localStorage.setItem('ngFestiveSound', 'on');
    const button = document.getElementById('ngFestiveSound');
    const update = () => { if (!button) return; const on = localStorage.getItem('ngFestiveSound') !== 'off'; button.textContent = on ? '🔊 Festive sounds' : '🔇 Sounds off'; button.setAttribute('aria-pressed', String(on)); };
    if (button && !button.dataset.bound) { button.dataset.bound = 'true'; button.addEventListener('click', () => { const on = localStorage.getItem('ngFestiveSound') !== 'off'; localStorage.setItem('ngFestiveSound', on ? 'off' : 'on'); update(); if (!on) playFestiveSound('success'); }); }
    update();
    if (!document.body.dataset.festiveSoundBound) {
      document.body.dataset.festiveSoundBound = 'true';
      document.addEventListener('click', (event) => { const target = event.target.closest('button,.food-card,.ng-food-guide,.exercise-card'); if (!target || target.id === 'ngFestiveSound') return; if (target.matches('.app-nav button,.food-tabs button,.ng-food-guide,.exercise-card,.ng-actions button')) playFestiveSound(target.matches('.food-tabs button,.ng-food-guide') ? 'success' : 'tap'); });
    }
  }
  const diwaliDays2026 = {
    '2026-11-05': { name: 'Govatsa Dwadashi', short: 'Day 1', message: 'Begin the festive week with gratitude, nourishment, and a calm home.', next: 'Dhanteras is next.' },
    '2026-11-06': { name: 'Dhanteras', short: 'Day 2', message: 'Welcome prosperity with a warm lamp, a mindful meal, and a little kindness.', next: 'Kali Chaudas is next.' },
    '2026-11-07': { name: 'Kali Chaudas / Choti Diwali', short: 'Day 3', message: 'Light the home, prepare the sweets, and enjoy a colourful festive plate.', next: 'Lakshmi Puja and Deepavali are tomorrow.' },
    '2026-11-08': { name: 'Naraka Chaturdashi / Lakshmi Puja', short: 'Day 4', message: 'Celebrate the main Diwali night with diyas, flowers, family, and joyful moderation.', next: 'Govardhan Puja follows.' },
    '2026-11-09': { name: 'Govardhan Puja / Annakut', short: 'Day 5', message: 'Celebrate abundance with a shared, colourful meal and gratitude for nature.', next: 'Festive reflection continues tomorrow.' },
    '2026-11-10': { name: 'Gujarati New Year', short: 'Day 6', message: 'Start the new year with fresh intentions, movement, and nourishing leftovers.', next: 'Bhai Dooj is tomorrow.' },
    '2026-11-11': { name: 'Bhai Dooj', short: 'Day 7', message: 'Celebrate the bond of family with a sweet moment, a walk, and a grateful heart.', next: 'Keep the light and your healthy rhythm going.' }
  };
  const defaultDiwaliDay = { name: 'Diwali wellness season', short: 'Festival week', message: 'Celebrate with light, colour, movement, and mindful festive choices.', next: 'Your next small win is waiting.' };
  function indiaTodayKey() { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()); } catch { return new Date().toISOString().slice(0, 10); } }
  function renderDiwaliCalendar() {
    const day = diwaliDays2026[indiaTodayKey()] || defaultDiwaliDay;
    const title = document.getElementById('ngDiwaliDayTitle'); if (title) title.textContent = `${day.name} • ${day.short}`;
    const message = document.getElementById('ngDiwaliDayMessage'); if (message) message.textContent = day.message;
    const next = document.getElementById('ngDiwaliNextMessage'); if (next) next.textContent = day.next;
    document.querySelectorAll('[data-diwali-day-label]').forEach((el) => { el.textContent = day.name; });
  }
  function installDiwaliExperience() {
    document.body.classList.add('diwali-mode', 'diwali-premium');
    if (!document.querySelector('.ng-diwali-lights')) document.body.insertAdjacentHTML('beforeend', '<div class="ng-diwali-lights" aria-hidden="true"><span>🪔</span><span>🎇</span><span>✨</span><span>🎆</span></div>');
    if (!root.querySelector('.ng-diwali-welcome')) root.insertAdjacentHTML('afterbegin', '<section class="ng-diwali-welcome"><div class="ng-diwali-art">🪔<br>🌸</div><div style="flex:1;position:relative;z-index:1"><div class="ng-diwali-topline"><span>✦ NUTRIGUIDE ROYAL DEEPAVALI ✦</span><button type="button" class="ng-diwali-sound" id="ngFestiveSound" aria-pressed="true">🔊 Festive sounds</button></div><h2 id="ngDiwaliDayTitle">Diwali wellness season</h2><p id="ngDiwaliDayMessage">Celebrate with light, colour, movement, and mindful festive choices.</p><div class="ng-diwali-calendar"><span>🪔 Dhanteras</span><span class="today" data-diwali-day-label>Today</span><span>🎆 Deepavali</span><span>🌸 Bhai Dooj</span></div><small id="ngDiwaliNextMessage" style="display:block;margin-top:10px;color:#ffeec8;position:relative;z-index:1">Your next small win is waiting.</small></div><div class="ng-diwali-art">🍬<br>🎇</div></section>');
    if (typeof foodSets !== 'undefined') foodSets.diwali = diwaliFoods;
    if (typeof nutritionDatabase !== 'undefined') Object.assign(nutritionDatabase, {
      makhanakheer:{label:'Makhana kheer',emoji:'🪔',cal:180,p:7,c:24,fat:6,f:3}, anjeerdateladoo:{label:'Anjeer date ladoo',emoji:'🍬',cal:145,p:3,c:24,fat:5,f:4}, ragicoconutladoo:{label:'Ragi coconut ladoo',emoji:'🥥',cal:135,p:3,c:21,fat:5,f:3},
      peanutseasamechikki:{label:'Peanut sesame chikki',emoji:'🥜',cal:155,p:5,c:16,fat:8,f:3}, bakedgujiya:{label:'Baked gujiya',emoji:'🥟',cal:210,p:6,c:30,fat:8,f:2}, diwalimakhanamasala:{label:'Diwali masala makhana',emoji:'🍿',cal:150,p:5,c:22,fat:5,f:4},
      roastedchanachivda:{label:'Roasted chana chivda',emoji:'🌾',cal:190,p:8,c:29,fat:5,f:6}, festivefruitchaat:{label:'Festive fruit chaat',emoji:'🍎',cal:120,p:2,c:28,fat:1,f:6}, steamedhoklaybites:{label:'Steamed dhokla bites',emoji:'🥣',cal:165,p:7,c:25,fat:4,f:3},
      lightfestivethali:{label:'Light festive thali',emoji:'🍛',cal:420,p:18,c:55,fat:14,f:12}, sproutsfestivechaat:{label:'Sprouts festive chaat',emoji:'🥗',cal:210,p:13,c:31,fat:4,f:9}, kesaralmondmilk:{label:'Kesar almond milk',emoji:'🥛',cal:130,p:6,c:10,fat:7,f:2}
    });
    const tabs = document.querySelector('.food-tabs');
    if (tabs && !tabs.querySelector('[data-diwali-foods]')) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.diwaliFoods = 'true'; button.textContent = '🪔 Diwali treats'; button.addEventListener('click', () => window.showFoods?.('diwali')); tabs.appendChild(button);
    }
    const foodStudio = document.querySelector('.food-studio');
    if (foodStudio && !foodStudio.querySelector('.ng-diwali-food-banner')) foodStudio.insertAdjacentHTML('afterbegin', '<div class="ng-diwali-food-banner"><span class="ng-diwali-food-icon">🪔✨</span><div><strong>Diwali, with balance</strong><small>Enjoy traditional flavours, smaller portions, and lighter homemade festive choices.</small></div></div>');
    if (foodStudio && !foodStudio.querySelector('.ng-food-guides')) foodStudio.insertAdjacentHTML('afterbegin', '<div class="ng-food-guides"><div class="ng-food-guides-head"><div><div class="eyebrow">YOUR FESTIVE FOOD COMPANIONS</div><h3>Choose who helps you build the plate</h3><p>Tap a character for a gentle food message. Your choice stays in Food Studio.</p></div><span style="font-size:38px;filter:drop-shadow(0 5px 6px #7d351d22)">🍽️✨</span></div><div class="ng-food-guide-grid"><button type="button" class="ng-food-guide" data-guide="panda" onclick="ngChooseFoodGuide(\'panda\')"><span class="avatar">🐼👨‍🍳</span><b>Panda Chef</b><small>Balanced festive plates</small><em>Protein + joy</em></button><button type="button" class="ng-food-guide" data-guide="peacock" onclick="ngChooseFoodGuide(\'peacock\')"><span class="avatar">🦚🌸</span><b>Peacock Plater</b><small>Colour and variety</small><em>Rainbow meals</em></button><button type="button" class="ng-food-guide" data-guide="fox" onclick="ngChooseFoodGuide(\'fox\')"><span class="avatar">🦊🍬</span><b>Mithai Fox</b><small>Smarter sweets</small><em>Sweet moments</em></button><button type="button" class="ng-food-guide" data-guide="elephant" onclick="ngChooseFoodGuide(\'elephant\')"><span class="avatar">🐘🪔</span><b>Diya Elephant</b><small>Mindful traditions</small><em>Calm rhythm</em></button></div><p class="ng-food-guide-message" id="ngFoodGuideMessage"></p></div>');
    const messages = {home:'A little light, a little movement, and a calm celebration.',food:'Enjoy your Diwali favourites with colourful plates and mindful portions.',move:'Bring firework energy to your movement, one safe step at a time.',journey:'Light one healthy habit and carry it into the next chapter.',plan:'Your festive week can be joyful, social, and still supportive of your goals.'};
    document.querySelectorAll('.ng-tab-section').forEach((section) => { if (!section.querySelector('.ng-diwali-badge')) { const tab = section.dataset.ngTab || 'home'; section.insertAdjacentHTML('afterbegin', `<div class="ng-diwali-badge">🪔 Diwali wellness <span>${messages[tab] || messages.home} ✨</span></div>`); } });
    renderDiwaliCalendar();
    renderFoodGuide();
    installFestiveSoundControls();
  }

  function dietPreferences() {
    return read('ngDietPrefs', { style: 'balanced', region: 'any', budget: 'medium', dairy: false, nuts: false, gluten: false, soy: false });
  }
  const dietLabels = {
    balanced: 'Balanced Indian meals', 'high-protein': 'High-protein vegetarian meals', vegan: 'Plant-based meals', jain: 'Jain-friendly meals',
    eggetarian: 'Eggetarian meals', 'non-vegetarian': 'Balanced meals with non-vegetarian options', 'low-carb': 'Lower-carb meals'
  };
  const regionLabels = { any: 'any Indian region', north: 'North Indian flavours', south: 'South Indian flavours', bengali: 'Bengali flavours', maharashtrian: 'Maharashtrian flavours', gujarati: 'Gujarati flavours', punjabi: 'Punjabi flavours' };
  function renderDietPrefs() {
    const prefs = dietPreferences();
    ['ngDietStyle', 'ngDietRegion', 'ngDietBudget'].forEach((id) => { if (get(id) && prefs[id.replace('ngDiet', '').toLowerCase()]) get(id).value = prefs[id.replace('ngDiet', '').toLowerCase()]; });
    if (get('ngDietStyle')) get('ngDietStyle').value = prefs.style || 'balanced';
    if (get('ngDietRegion')) get('ngDietRegion').value = prefs.region || 'any';
    if (get('ngDietBudget')) get('ngDietBudget').value = prefs.budget || 'medium';
    if (get('ngAvoidDairy')) get('ngAvoidDairy').checked = Boolean(prefs.dairy);
    if (get('ngAvoidNuts')) get('ngAvoidNuts').checked = Boolean(prefs.nuts);
    if (get('ngAvoidGluten')) get('ngAvoidGluten').checked = Boolean(prefs.gluten);
    if (get('ngAvoidSoy')) get('ngAvoidSoy').checked = Boolean(prefs.soy);
    const exclusions = [['dairy', 'dairy'], ['nuts', 'nuts'], ['gluten', 'gluten'], ['soy', 'soy']].filter(([key]) => prefs[key]).map(([, label]) => label);
    const title = dietLabels[prefs.style] || dietLabels.balanced;
    const detail = `${regionLabels[prefs.region] || regionLabels.any} • ${prefs.budget === 'low' ? 'budget-aware' : prefs.budget === 'flexible' ? 'flexible budget' : 'balanced budget'}${exclusions.length ? ` • avoids ${exclusions.join(', ')}` : ''}.`;
    if (get('ngDietPreferenceTitle')) get('ngDietPreferenceTitle').textContent = title;
    if (get('ngDietPreferenceText')) get('ngDietPreferenceText').textContent = detail;
  }
  function foodMatchesPreferences(food, prefs) {
    const text = `${food[1] || ''} ${food[2] || ''}`.toLowerCase();
    const contains = (words) => words.some((word) => text.includes(word));
    if (prefs.dairy && contains(['paneer', 'curd', 'yoghurt', 'cheese', 'whey', 'milk', 'butter', 'ghee'])) return false;
    if (prefs.nuts && contains(['almond', 'peanut', 'cashew', 'pistachio', 'walnut', 'nut'])) return false;
    if (prefs.gluten && contains(['roti', 'paratha', 'naan', 'wheat', 'bread', 'wrap', 'pasta'])) return false;
    if (prefs.soy && contains(['tofu', 'soy', 'soya', 'edamame'])) return false;
    if (prefs.style === 'vegan' && contains(['paneer', 'curd', 'cheese', 'whey', 'milk', 'butter', 'ghee', 'egg', 'chicken', 'fish', 'mutton'])) return false;
    if (prefs.style === 'jain' && contains(['onion', 'garlic', 'potato', 'root vegetable'])) return false;
    if (prefs.style === 'low-carb' && Number(food[5] || 0) > 35) return false;
    return true;
  }
  function installFoodPreferenceFilter() {
    if (typeof window.showFoods !== 'function' || typeof foodSets === 'undefined' || typeof foodCard !== 'function') return;
    const originalShowFoods = window.showFoods;
    window.showFoods = function (type) {
      window.ngCurrentFoodCategory = type;
      const prefs = dietPreferences();
      const list = foodSets[type] || foodSets.balanced;
      const filtered = list.map((food, index) => ({ food, index })).filter(({ food }) => foodMatchesPreferences(food, prefs));
      const grid = get('foodGrid');
      if (grid) grid.innerHTML = filtered.length ? filtered.map(({ food, index }) => foodCard(type, index, food)).join('') : '<p class="ng-status">No foods match these exclusions. Try changing your preferences.</p>';
      const label = get('foodCategoryLabel');
      if (label) label.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} ideas${filtered.length < list.length ? ` • ${filtered.length} shown for your preferences` : ''}`;
    };
    window.showFoods(window.ngCurrentFoodCategory || 'balanced');
  }
  window.ngSaveDietPrefs = function () {
    const prefs = {
      style: get('ngDietStyle')?.value || 'balanced', region: get('ngDietRegion')?.value || 'any', budget: get('ngDietBudget')?.value || 'medium',
      dairy: Boolean(get('ngAvoidDairy')?.checked), nuts: Boolean(get('ngAvoidNuts')?.checked), gluten: Boolean(get('ngAvoidGluten')?.checked), soy: Boolean(get('ngAvoidSoy')?.checked)
    };
    write('ngDietPrefs', prefs); renderDietPrefs(); renderNextAction(); installFoodPreferenceFilter(); notify('Food preferences saved');
    if (get('ngTodayStatus')) get('ngTodayStatus').textContent = `${dietLabels[prefs.style] || 'Your plan'} will guide your next meal suggestions.`;
  };

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

  function applyPreferences() { ngSetTheme(localStorage.getItem('ngTheme') || 'light'); ngSetTextSize(localStorage.getItem('ngTextSize') || 'normal'); if (get('ngTheme')) get('ngTheme').value = localStorage.getItem('ngTheme') || 'light'; if (get('ngTextSize')) get('ngTextSize').value = localStorage.getItem('ngTextSize') || 'normal'; if (get('ngLanguage')) get('ngLanguage').value = localStorage.getItem('ngLanguage') || 'en'; const connected = read('ngDevices', []); if (connected.length && get('ngDeviceStatus')) get('ngDeviceStatus').textContent = `Selected: ${connected.join(', ')}. Authorization can be connected later.`; renderDietPrefs(); }

  function storeProfile() { if (!get('age')?.value) return; write('ngProfile', { age: get('age').value, sex: get('sex').value, height: get('height').value, weight: get('weight').value, goal: get('goal').value, activity: get('activity').value }); }
  get('form')?.addEventListener('submit', () => setTimeout(() => { storeProfile(); document.body.classList.remove('needs-profile'); document.body.classList.add('post-profile'); renderToday(); renderExerciseCoach(); renderJourneyBadge(); }, 60));
  const savedProfile = read('ngProfile', null);
  if (savedProfile && get('age') && !get('age').value) { ['age','sex','height','weight','goal','activity'].forEach((id) => { if (savedProfile[id] != null && get(id)) get(id).value = savedProfile[id]; }); document.body.classList.remove('needs-profile'); document.body.classList.add('post-profile'); }
  window.addEventListener('online', () => { if (get('ngDeviceStatus')) get('ngDeviceStatus').classList.remove('ng-offline'); });
  window.addEventListener('offline', () => { if (get('ngDeviceStatus')) { get('ngDeviceStatus').textContent = 'You are offline. Manual logs still work and will remain on this device.'; get('ngDeviceStatus').classList.add('ng-offline'); } });

  applyPreferences();
  installDiwaliExperience();
  installFoodPreferenceFilter();
  renderToday(); renderQuickStatus(); renderGroceries(); renderExerciseCoach(); renderJourneyBadge();
  if (typeof window.setTab === 'function') window.setTab(document.querySelector('.app-nav button.active')?.dataset.tab || 'home');
})();

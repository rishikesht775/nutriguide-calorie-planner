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
    .diwali-mode .card,.diwali-mode .ng-card{border-color:#e9bd62;box-shadow:0 14px 34px #bd731d18}.diwali-mode .card,.diwali-mode .ng-card{position:relative;overflow:hidden}.diwali-mode .card::after,.diwali-mode .ng-card::after{content:'✨';position:absolute;right:14px;top:10px;font-size:18px;opacity:.72;pointer-events:none}.diwali-mode .hero{box-shadow:0 18px 45px #bd731d22}.ng-diwali-lights{position:fixed;inset:0;pointer-events:none;z-index:10}.ng-diwali-lights span{position:absolute;font-size:22px;filter:drop-shadow(0 4px 8px #c2791d44);animation:ngDiwaliFloat 3.4s ease-in-out infinite}.ng-diwali-lights span:nth-child(1){top:88px;left:18px}.ng-diwali-lights span:nth-child(2){top:120px;right:20px;animation-delay:.6s}.ng-diwali-lights span:nth-child(3){bottom:22px;left:20px;animation-delay:1.1s}.ng-diwali-lights span:nth-child(4){bottom:28px;right:22px;animation-delay:1.7s}.ng-diwali-welcome{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px;padding:18px 20px;border:1px solid #e8b54f;border-radius:26px;color:#fff7df;background:linear-gradient(115deg,#5d1b2a,#a7442f 48%,#7a3d1b);box-shadow:0 18px 36px #7d351d2a;overflow:hidden;position:relative}.ng-diwali-welcome::before{content:'🌼 ✨ 🪔 ✨ 🌼 ✨ 🪔 ✨ 🌼';position:absolute;left:0;right:0;bottom:5px;text-align:center;font-size:17px;letter-spacing:9px;opacity:.82}.ng-diwali-welcome h2{margin:4px 0;font-size:clamp(22px,4vw,34px);color:#fff3bc}.ng-diwali-welcome p{margin:5px 0 13px;color:#ffeec8;font-size:13px;line-height:1.45}.ng-diwali-art{font-size:48px;min-width:100px;text-align:center;filter:drop-shadow(0 8px 10px #16070a55);animation:ngDiwaliFloat 3s ease-in-out infinite}.ng-diwali-calendar{display:flex;flex-wrap:wrap;gap:7px;position:relative;z-index:1}.ng-diwali-calendar span{padding:6px 9px;border-radius:999px;background:#ffffff1f;border:1px solid #ffffff44;color:#fff7df;font-size:10px;font-weight:800}.ng-diwali-calendar .today{background:#ffd86f;color:#5d1b2a;border-color:#ffeab0}.ng-diwali-badge{display:flex;align-items:center;gap:8px;margin:-4px 0 14px;padding:8px 11px;border-radius:999px;background:linear-gradient(90deg,#fff1b7,#ffe2a1);border:1px solid #e8bf62;color:#7b4b16;font-size:11px;font-weight:800;letter-spacing:.2px}.ng-diwali-badge span{margin-left:auto}.ng-diwali-food-banner{display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:16px 18px;border-radius:20px;color:#fff7df;background:linear-gradient(110deg,#6b1e27,#b55729 50%,#7d351d);box-shadow:0 12px 24px #7d351d2b}.ng-diwali-food-banner strong{display:block;font-size:18px}.ng-diwali-food-banner small{display:block;margin-top:3px;color:#ffeec0}.ng-diwali-food-banner .ng-diwali-food-icon{font-size:34px;white-space:nowrap}@keyframes ngDiwaliFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}
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
    .ng-food-guides-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.ng-food-guides-head h3{margin:2px 0 4px;color:#4b1b38}.ng-food-guides-head p{margin:0;color:#786979;font-size:12px;line-height:1.45}.ng-food-guide-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.ng-food-guide{width:100%!important;margin:0!important;border:1px solid #e8d0a1;border-radius:18px;padding:12px;background:#fffaf4;cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s;text-align:left}.ng-food-guide:hover,.ng-food-guide.active{transform:translateY(-4px);border-color:#b34f2c;box-shadow:0 12px 22px #7d351d1f}.ng-food-guide .avatar{font-size:36px;display:block;filter:drop-shadow(0 4px 5px #7d351d22)}.ng-food-guide b{display:block;margin-top:6px;color:#4b1b38;font-size:13px}.ng-food-guide small{display:block;margin-top:3px;color:#786979;font-size:11px;line-height:1.35}.ng-food-guide em{display:block;margin-top:7px;color:#a4472b;font-size:10px;font-style:normal;font-weight:800}.ng-food-guide-message{margin:12px 0 0;padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #efd6a0;color:#5c3d45;font-size:12px;line-height:1.45}
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

    /* Diwali Celebration Street: bright market colours, rangoli, torans and live festival motion */
    body.diwali-street{--ink:#32133d;--muted:#745f7d;--line:#edc86b;background:linear-gradient(125deg,#fff0b8 0%,#ffd5ae 24%,#ffc8d8 52%,#b8e6ed 78%,#ffe5a2 100%);color:var(--ink)}
    body.diwali-street:before{opacity:.26;background-image:radial-gradient(#ec5a3d 1.4px,transparent 1.4px),radial-gradient(#1296a5 1px,transparent 1px),radial-gradient(#e8a52a 1.2px,transparent 1.2px);background-size:24px 24px,37px 37px,58px 58px;background-position:0 0,12px 16px,22px 10px}
    .diwali-street .wrap{max-width:1160px;position:relative}
    .diwali-street .app-nav{background:linear-gradient(100deg,#7d164eF5,#d54454F2 45%,#f08c27F0);border:2px solid #ffe27b;box-shadow:0 14px 30px #9d2d4b42}
    .diwali-street .app-nav:before{content:'🌼 🪔 🌼 🪔 🌼 🪔 🌼';display:block;position:absolute;left:18px;right:18px;top:-17px;text-align:center;font-size:15px;letter-spacing:8px;pointer-events:none;filter:drop-shadow(0 3px 2px #7d164e55)}
    .diwali-street .app-nav button{background:#ffffff24;color:#fffbe7;border:1px solid #ffffff52;border-radius:999px}
    .diwali-street .app-nav button:hover,.diwali-street .app-nav button.active{background:linear-gradient(135deg,#ffe36f,#ffad3d);color:#61133d;box-shadow:0 8px 18px #ffcf524c}
    .diwali-street .card,.diwali-street .ng-card{border:2px solid #f0c65e;background:linear-gradient(145deg,#fffef9f5,#fff1dcf2);box-shadow:0 18px 38px #a33a4b26,0 0 0 2px #fff8cf inset}
    .diwali-street .card:hover,.diwali-street .ng-card:hover{box-shadow:0 24px 46px #a33a4b35,0 0 0 2px #fff8cf inset}
    .diwali-street .hero{border:2px solid #ffe07a;background:linear-gradient(90deg,#fff2c9f5 0%,#ffd9c9dc 44%,#ffb44766 78%),url('market-hero.png') center/cover;box-shadow:0 26px 55px #9d2d4b3b;min-height:335px}
    .diwali-street .hero h1{color:#6d1247;text-shadow:0 3px 0 #fff4ad}.diwali-street .hero h1 span{color:#e4502e!important}.diwali-street .hero .badge{background:#fffdf0e8;border:2px solid #f0c65e;color:#7d164e;box-shadow:0 12px 24px #8e26402e}
    .diwali-street .eyebrow{color:#c72f42}
    .diwali-street button{background:linear-gradient(135deg,#c51e5a,#ef642f);box-shadow:0 9px 18px #b72b4c32}.diwali-street button:hover{filter:saturate(1.2) brightness(1.06);transform:translateY(-2px)}
    .diwali-street .ng-diwali-welcome{border:2px solid #ffe58a;background:linear-gradient(115deg,#76164f 0%,#c52859 40%,#f2762f 72%,#f3b82f 100%);box-shadow:0 26px 52px #9d2d4b55;min-height:170px}
    .diwali-street .ng-diwali-welcome:before{content:'🌼🌼🌼🌼🌼🌼🌼🌼🌼🌼🌼🌼🌼';bottom:auto;top:-2px;font-size:16px;letter-spacing:8px;color:#ffe16b;opacity:1}
    .diwali-street .ng-diwali-welcome:after{content:'🎇  ✨  🎆  ✨  🎇';right:20px;top:16px;color:#fff4a8;font-size:21px;letter-spacing:5px;opacity:.95}
    .diwali-street .ng-diwali-welcome h2{font-size:clamp(26px,5vw,42px);color:#fff7bf;text-shadow:0 3px 0 #7d164e88}.diwali-street .ng-diwali-welcome p{font-size:14px;color:#fff7de}
    .diwali-street .ng-diwali-calendar span{background:#ffffff32;border:1px solid #fff0a0;color:#fff9dd}.diwali-street .ng-diwali-calendar .today{background:#ffe16b;color:#711543;border-color:#fff3bb}
    .diwali-street .ng-diwali-sound{background:#ffffff2c!important;border:1px solid #fff4b5!important;color:#fff9dd!important}
    .ng-diwali-live-ticker{display:flex;align-items:center;gap:10px;margin:0 0 15px;padding:11px 14px;border:2px solid #f0c65e;border-radius:999px;background:linear-gradient(90deg,#7d164e,#d54454 48%,#f08c27);color:#fff9dc;box-shadow:0 11px 24px #9d2d4b30;font-size:12px;font-weight:800;overflow:hidden}.ng-diwali-live-ticker b{white-space:nowrap;color:#ffe574}.ng-diwali-live-ticker span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ng-diwali-street-effects{position:fixed;inset:0;pointer-events:none;z-index:9;overflow:hidden}.ng-diwali-street-effects .petal{position:absolute;font-size:22px;animation:ngStreetPetal 8s linear infinite}.ng-diwali-street-effects .petal:nth-child(1){left:8%;top:-6%;animation-delay:0s}.ng-diwali-street-effects .petal:nth-child(2){left:30%;top:-8%;animation-delay:2s}.ng-diwali-street-effects .petal:nth-child(3){right:25%;top:-7%;animation-delay:4s}.ng-diwali-street-effects .petal:nth-child(4){right:7%;top:-5%;animation-delay:6s}.ng-diwali-street-effects .spark{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff38c;box-shadow:0 0 12px 4px #ffe16b;animation:ngStreetSpark 2.2s ease-in-out infinite}.ng-diwali-street-effects .spark:nth-child(5){left:17%;top:32%}.ng-diwali-street-effects .spark:nth-child(6){right:18%;top:48%;animation-delay:.7s}.ng-diwali-street-effects .spark:nth-child(7){left:58%;top:24%;animation-delay:1.2s}
    .ng-diwali-rangoli{position:fixed;left:50%;bottom:-72px;transform:translateX(-50%);width:210px;height:210px;border-radius:50%;background:conic-gradient(#ee5a3b 0 12.5%,#ffd95d 12.5% 25%,#20a7aa 25% 37.5%,#db3f76 37.5% 50%,#ff9e2c 50% 62.5%,#4d55b4 62.5% 75%,#ffd95d 75% 87.5%,#ee5a3b 87.5% 100%);box-shadow:0 0 0 10px #fff1b5,0 0 0 16px #d5445477,0 0 28px 12px #ffcd4caa;opacity:.88;z-index:8;animation:ngRangoliSpin 20s linear infinite;pointer-events:none}.ng-diwali-rangoli:after{content:'🪔';position:absolute;inset:32px;border-radius:50%;background:radial-gradient(circle,#fff4a9 0 18%,#f08c27 19% 32%,#7d164e 33% 49%,#20a7aa 50% 66%,#fff1b5 67%);display:grid;place-items:center;font-size:52px;animation:ngRangoliSpinReverse 20s linear infinite}
    .ng-diwali-fireworks{position:absolute;inset:0;pointer-events:none;overflow:hidden}.ng-diwali-fireworks i{position:absolute;width:8px;height:8px;border-radius:50%;background:#ffe16b;box-shadow:0 0 0 5px #ffe16b22,0 0 20px 8px #fff4a4;animation:ngFirework 2.8s ease-in-out infinite}.ng-diwali-fireworks i:nth-child(1){right:17%;top:16%}.ng-diwali-fireworks i:nth-child(2){right:31%;top:34%;animation-delay:1.1s}.ng-diwali-fireworks i:nth-child(3){left:18%;top:22%;animation-delay:1.8s}
    .diwali-street .food-card{background:linear-gradient(145deg,#fff3a9,#ffd5d8 52%,#b9e7e3);border:2px solid #efb64d;box-shadow:0 12px 22px #a33a4b21}.diwali-street .food-card:hover{box-shadow:0 20px 30px #a33a4b35}.diwali-street .ng-food-guides{background:linear-gradient(135deg,#ffd56d,#ff9d6c 47%,#86d7d2);border:2px solid #ffe27b;box-shadow:0 16px 30px #a33a4b27}.diwali-street .ng-food-guide{background:linear-gradient(145deg,#fffbe8,#ffd9c9 52%,#bce9e2);border:2px solid #efb64d}.diwali-street .ng-food-guide b{color:#701543}.diwali-street .ng-food-guide-message{background:#fffbe8;border:2px solid #efb64d;color:#5b2948}
    .diwali-street .ng-diwali-badge{background:linear-gradient(90deg,#ffe36f,#ffb24b);border:2px solid #f0a336;color:#6d1247;box-shadow:0 7px 16px #b72b4c22}.diwali-street .ng-diwali-badge span{color:#7d164e}
    .diwali-street .weekly-strip,.diwali-street .guide-coach,.diwali-street .ng-next,.diwali-street .inspiration{background:linear-gradient(100deg,#76164f,#d54454 52%,#ef8b28);border:2px solid #ffe27b;box-shadow:0 16px 32px #9d2d4b35}
    @keyframes ngStreetPetal{0%{transform:translate3d(0,-10vh,0) rotate(0);opacity:0}12%{opacity:1}100%{transform:translate3d(80px,110vh,0) rotate(300deg);opacity:.2}}
    @keyframes ngStreetSpark{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.7)}}
    @keyframes ngRangoliSpin{to{transform:translateX(-50%) rotate(360deg)}}@keyframes ngRangoliSpinReverse{to{transform:rotate(-360deg)}}
    @keyframes ngFirework{0%,100%{transform:scale(.4);opacity:.3}35%{transform:scale(1.8);opacity:1}65%{transform:scale(.9);opacity:.75}}
    @media(max-width:760px){.diwali-street .app-nav:before{font-size:11px;letter-spacing:4px;top:-13px}.ng-diwali-live-ticker{border-radius:18px;align-items:flex-start}.ng-diwali-rangoli{width:145px;height:145px;bottom:-52px}.ng-diwali-rangoli:after{inset:24px;font-size:35px}.diwali-street .ng-diwali-welcome{min-height:190px}}

    /* Grand Indian decor: keep the celebration in dedicated spaces so it never covers controls */
    .diwali-street .ng-diwali-lights{display:none}
    .ng-diwali-decor{position:relative;z-index:1;height:126px;margin:0 0 8px;overflow:hidden;border-bottom:2px solid #f2c45b;background:linear-gradient(180deg,#27104d 0%,#5b154d 52%,#d24b3d 100%);box-shadow:0 14px 28px #54134244}
    .ng-diwali-decor:before{content:'✦  ✧  ✦  ✧  ✦  ✧  ✦';position:absolute;left:0;right:0;top:12px;text-align:center;color:#ffd95d;font-size:14px;letter-spacing:12px;opacity:.9}
    .ng-toran-line{position:absolute;left:0;right:0;top:34px;text-align:center;color:#ffe486;font-size:26px;letter-spacing:8px;white-space:nowrap;filter:drop-shadow(0 4px 4px #17082e88)}
    .ng-toran-line .leaves{display:block;margin-top:-7px;color:#4db66b;font-size:21px;letter-spacing:7px}
    .ng-light-string{position:absolute;left:5%;right:5%;bottom:25px;height:30px;border-top:2px solid #ffd45d;border-radius:50% 50% 0 0;display:flex;justify-content:space-around;align-items:flex-start}
    .ng-light-string i{display:block;width:10px;height:15px;margin-top:-2px;border-radius:50% 50% 45% 45%;background:#ffd84d;box-shadow:0 0 13px 5px #ffd84d99;animation:ngLightBlink 1.7s ease-in-out infinite}.ng-light-string i:nth-child(2n){background:#42e0e3;box-shadow:0 0 13px 5px #42e0e399;animation-delay:.4s}.ng-light-string i:nth-child(3n){background:#ff6c9a;box-shadow:0 0 13px 5px #ff6c9a99;animation-delay:.8s}.ng-light-string i:nth-child(4n){background:#a9f06a;box-shadow:0 0 13px 5px #a9f06a99;animation-delay:1.2s}
    .ng-decor-fireworks{position:absolute;inset:0;pointer-events:none}.ng-decor-fireworks span{position:absolute;font-size:24px;filter:drop-shadow(0 0 9px #ffe98a);animation:ngStreetSpark 2.8s ease-in-out infinite}.ng-decor-fireworks span:nth-child(1){left:11%;top:16%}.ng-decor-fireworks span:nth-child(2){right:13%;top:18%;animation-delay:.7s}.ng-decor-fireworks span:nth-child(3){right:28%;top:48%;animation-delay:1.4s}.ng-decor-fireworks span:nth-child(4){left:29%;top:48%;animation-delay:2s}
    .ng-decor-diya{position:absolute;bottom:12px;font-size:28px;filter:drop-shadow(0 0 10px #ffcb4d);animation:ngDiyaGlow 2.4s ease-in-out infinite}.ng-decor-diya.left{left:18px}.ng-decor-diya.right{right:18px;animation-delay:1.2s}
    .ng-diwali-celebration-strip{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 2px}.ng-diwali-celebration-strip span{padding:7px 9px;border-radius:999px;background:#fff5b52e;border:1px solid #ffeaa2;color:#fff8dc;font-size:10px;font-weight:800;box-shadow:0 4px 10px #58133b25}
    .ng-diwali-rangoli{position:fixed;left:50%;bottom:-30px;transform:translateX(-50%);width:230px;height:88px;border-radius:50% 50% 0 0;background:radial-gradient(ellipse at center,#ffe26b 0 16%,#e64d62 17% 34%,#2bb6b2 35% 51%,#7b2b87 52% 69%,#ff9d35 70% 100%);box-shadow:0 0 0 6px #fff2b5,0 0 0 10px #d5445488,0 0 28px 8px #ffcd4c77;opacity:.82;z-index:8;animation:ngRangoliGlow 3.8s ease-in-out infinite;pointer-events:none}.ng-diwali-rangoli:after{content:'✦  🪔  ✦';position:absolute;inset:16px;border-radius:50%;background:radial-gradient(circle,#fff4a9 0 24%,#f08c27 25% 42%,#7d164e 43% 60%,#20a7aa 61% 100%);display:grid;place-items:center;font-size:28px;animation:none}
    @keyframes ngLightBlink{0%,100%{opacity:.55;transform:scale(.86)}50%{opacity:1;transform:scale(1.14)}}@keyframes ngDiyaGlow{0%,100%{transform:translateY(0);filter:drop-shadow(0 0 6px #ffcb4d)}50%{transform:translateY(-4px);filter:drop-shadow(0 0 16px #fff2a0)}}@keyframes ngRangoliGlow{0%,100%{filter:saturate(1);opacity:.68}50%{filter:saturate(1.35);opacity:.9}}
    .diwali-street .ng-diwali-welcome{min-height:208px}.diwali-street .ng-diwali-welcome .ng-diwali-art{font-size:54px}.diwali-street .ng-diwali-welcome .ng-diwali-fireworks{z-index:0}.diwali-street .ng-diwali-welcome>div:nth-child(2){z-index:1}
    @media(max-width:760px){.ng-diwali-decor{height:112px}.ng-toran-line{font-size:18px;letter-spacing:4px;top:39px}.ng-toran-line .leaves{font-size:16px;letter-spacing:3px}.ng-light-string{left:3%;right:3%;bottom:22px}.ng-diwali-celebration-strip span{font-size:9px;padding:6px 7px}.ng-diwali-rangoli{width:170px;height:65px;bottom:-23px}.ng-diwali-rangoli:after{inset:12px;font-size:21px}.diwali-street .ng-diwali-welcome{min-height:230px}}

    /* Three visual directions assigned across existing tabs */
    .diwali-street .ng-theme-courtyard,.diwali-street .ng-theme-bazaar,.diwali-street .ng-theme-palace{position:relative;overflow:hidden;border:2px solid #f3c75f;background-position:center;background-size:cover;isolation:isolate}
    .diwali-street .ng-theme-courtyard{background-image:linear-gradient(135deg,#fff1bdde,#ffd3b8c9),url('/diwali-courtyard.png')}.diwali-street .ng-theme-bazaar{background-image:linear-gradient(135deg,#ffe0a9d8,#f5a3c4c7),url('/diwali-fireworks-bazaar.png')}.diwali-street .ng-theme-palace{background-image:linear-gradient(135deg,#21124bd6,#8d2758bd),url('/diwali-palace-night.png');color:#fff7dc}
    .diwali-street .ng-theme-palace .ng-sub,.diwali-street .ng-theme-palace .ng-status{color:#ffe9c3}.diwali-street .ng-theme-courtyard>*,.diwali-street .ng-theme-bazaar>*,.diwali-street .ng-theme-palace>*{position:relative;z-index:2}
    .ng-3d-fireworks{position:absolute!important;inset:0;z-index:1!important;pointer-events:none;overflow:hidden;perspective:700px}.ng-3d-fireworks .ng-3d-toran{position:absolute;left:-3%;right:-3%;top:-3px;height:46px;text-align:center;color:#ffcc52;font-size:25px;letter-spacing:8px;filter:drop-shadow(0 5px 3px #7a1b4544);transform:rotateX(24deg);transform-origin:top center}.ng-3d-fireworks .ng-3d-toran:after{content:'🍃 🍃 🍃 🍃 🍃 🍃 🍃 🍃 🍃 🍃 🍃';display:block;margin-top:-7px;color:#4fb96b;font-size:18px;letter-spacing:5px}.ng-3d-fireworks .fx{position:absolute;display:block;transform-style:preserve-3d;filter:drop-shadow(0 7px 5px #2a0b3155)}.ng-3d-fireworks .skyshot{font-size:32px;left:14%;bottom:-40px;animation:ng3dSkyshot 4.5s ease-in infinite}.ng-3d-fireworks .skyshot.two{left:auto;right:19%;animation-delay:2.1s}.ng-3d-fireworks .anaar{font-size:35px;left:7%;bottom:17px;animation:ng3dAnaar 2.4s ease-in-out infinite}.ng-3d-fireworks .anaar.two{left:auto;right:7%;animation-delay:1.2s}.ng-3d-fireworks .chakri{font-size:29px;left:28%;bottom:13px;animation:ng3dChakri 2.1s linear infinite}.ng-3d-fireworks .chakri.two{left:auto;right:28%;animation-delay:.8s}.ng-3d-fireworks .fuljhari{font-size:29px;left:43%;bottom:13px;animation:ng3dFuljhari 1.4s ease-in-out infinite}.ng-3d-fireworks .popup{font-size:31px;left:48%;top:22px;animation:ng3dPopup 2.8s ease-out infinite}.ng-3d-fireworks .popup.two{left:auto;right:12%;top:45px;animation-delay:1.4s}.ng-3d-fireworks .ladi{font-size:27px;left:50%;bottom:11px;animation:ng3dLadi 1.8s ease-in-out infinite}.ng-3d-fireworks .marigold{font-size:25px;top:54px;animation:ng3dFlower 3.3s ease-in-out infinite}.ng-3d-fireworks .marigold.one{left:9%}.ng-3d-fireworks .marigold.two{left:82%;animation-delay:1.1s}.ng-3d-fireworks .marigold.three{left:58%;top:auto;bottom:42px;animation-delay:2s}
    @keyframes ng3dSkyshot{0%{transform:translate3d(0,0,0) scale(.5) rotateX(35deg);opacity:0}16%{opacity:1}58%{transform:translate3d(35px,-150px,80px) scale(1.4) rotateX(0);opacity:1}74%{transform:translate3d(35px,-150px,80px) scale(2.2) rotateZ(25deg);opacity:.9}100%{transform:translate3d(35px,-150px,80px) scale(2.8);opacity:0}}
    @keyframes ng3dAnaar{0%,100%{transform:translateZ(0) scale(.85);filter:drop-shadow(0 4px 4px #2a0b3155)}50%{transform:translateZ(60px) scale(1.3);filter:drop-shadow(0 0 18px #ffb52e)}}@keyframes ng3dChakri{to{transform:rotateZ(360deg) rotateX(35deg) rotateY(360deg)}}@keyframes ng3dFuljhari{0%,100%{transform:rotateY(-18deg) translateY(0) scale(.9);opacity:.75}50%{transform:rotateY(18deg) translateY(-13px) scale(1.25);opacity:1;filter:drop-shadow(0 0 15px #ffe26f)}}@keyframes ng3dPopup{0%{transform:translateZ(-80px) scale(.2);opacity:0}35%{transform:translateZ(20px) scale(1.6);opacity:1}70%{transform:translateZ(70px) scale(1.1);opacity:.85}100%{transform:translateZ(130px) scale(2.4);opacity:0}}@keyframes ng3dLadi{0%,100%{transform:rotateX(20deg) scale(.95)}50%{transform:rotateX(-20deg) scale(1.2);filter:drop-shadow(0 0 13px #ffdb61)}}@keyframes ng3dFlower{0%,100%{transform:rotateY(-25deg) translateY(0)}50%{transform:rotateY(25deg) translateY(-8px) scale(1.15)}}
    @media(max-width:760px){.ng-3d-fireworks .ng-3d-toran{font-size:17px;letter-spacing:4px}.ng-3d-fireworks .ng-3d-toran:after{font-size:13px;letter-spacing:2px}.ng-3d-fireworks .skyshot{font-size:24px}.ng-3d-fireworks .anaar{font-size:27px}.ng-3d-fireworks .chakri,.ng-3d-fireworks .fuljhari,.ng-3d-fireworks .ladi{font-size:23px}.ng-3d-fireworks .popup{font-size:24px}}
    /* Visible 3D-style fireworks stage and festive borders in every themed section */
    .diwali-street .ng-theme-courtyard,.diwali-street .ng-theme-bazaar,.diwali-street .ng-theme-palace{border:3px solid transparent;background-clip:padding-box;box-shadow:0 0 0 2px #ffd75b,0 0 0 6px #ef5b6b,0 0 0 9px #2bc3c0,0 18px 42px #7d164e38}
    .diwali-street .ng-theme-courtyard:before,.diwali-street .ng-theme-bazaar:before,.diwali-street .ng-theme-palace:before{content:'🌼  🪔  🌼  🪔  🌼  🪔  🌼  🪔  🌼';position:absolute;left:10px;right:10px;top:4px;height:28px;z-index:5;text-align:center;color:#ffd75b;font-size:19px;letter-spacing:4px;text-shadow:0 2px 5px #5a174c;pointer-events:none;white-space:nowrap}
    .diwali-street .ng-theme-courtyard:after,.diwali-street .ng-theme-bazaar:after,.diwali-street .ng-theme-palace:after{content:'';position:absolute;left:10px;right:10px;bottom:7px;height:4px;z-index:5;border-radius:99px;background:linear-gradient(90deg,#ffcf4a,#f14e87,#4dd9dc,#ffe579,#f14e87,#4dd9dc,#ffcf4a);box-shadow:0 0 10px #ffe16b;animation:ngLedBorder 2.8s linear infinite;pointer-events:none}
    .ng-firework-canvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:1!important;display:block;pointer-events:none;mix-blend-mode:screen;opacity:.98;contain:strict}
    .ng-festive-garland{position:absolute!important;left:0;right:0;top:29px;height:27px;z-index:4!important;display:flex;justify-content:space-around;align-items:flex-start;pointer-events:none;overflow:hidden}.ng-festive-garland span{font-size:22px;filter:drop-shadow(0 4px 4px #55133d);animation:ngMarigoldSway 2.6s ease-in-out infinite}.ng-festive-garland i{width:9px;height:9px;margin-top:7px;border-radius:50%;background:#ffe66b;box-shadow:0 0 12px 4px #ffe66b;animation:ngLedBlink 1.1s ease-in-out infinite}.ng-festive-garland i:nth-of-type(2n){background:#ff5e88;box-shadow:0 0 12px 4px #ff5e88;animation-delay:.3s}.ng-festive-garland i:nth-of-type(3n){background:#43e5e2;box-shadow:0 0 12px 4px #43e5e2;animation-delay:.6s}
    .diwali-street .ng-theme-bazaar .ng-food-card,.diwali-street .ng-theme-bazaar .food-card,.diwali-street .ng-theme-bazaar .ng-food-guide{border:2px solid #f2bf4c;box-shadow:0 0 0 2px #ff7995,0 10px 25px #7d164e2b;background:linear-gradient(145deg,#fffbd8,#ffd7c8 52%,#bde9e4)}
    .diwali-street .ng-theme-bazaar .ng-food-card:before,.diwali-street .ng-theme-bazaar .food-card:before,.diwali-street .ng-theme-bazaar .ng-food-guide:before{content:'🪔🌼';position:absolute;top:7px;right:10px;font-size:17px;filter:drop-shadow(0 2px 3px #7d164e55);pointer-events:none}
    .diwali-street .ng-theme-palace .ng-card,.diwali-street .ng-theme-courtyard .ng-card{box-shadow:0 0 0 2px #f4c84d,0 0 0 5px #ec5d7c,0 0 0 8px #31c7c2,0 12px 30px #4b123b30}
    .ng-diwali-festival-calendar{margin:12px 0 0;padding:15px;border:2px solid #ffd65b;border-radius:20px;background:linear-gradient(135deg,#6d164cdd,#d84b58dd 50%,#f28e2bdd);color:#fff9df;box-shadow:0 12px 24px #7d164e38}.ng-diwali-festival-calendar h3{margin:0 0 10px;color:#ffe78b}.ng-diwali-festival-calendar .festival-days{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.ng-diwali-festival-calendar .festival-days span{padding:10px 8px;text-align:center;border-radius:14px;background:#ffffff22;border:1px solid #ffe88f;font-size:11px;font-weight:800}.ng-diwali-festival-calendar .festival-days .today{background:#ffe16b;color:#68133f}
    @keyframes ngLedBorder{to{filter:hue-rotate(360deg)}}@keyframes ngLedBlink{0%,100%{opacity:.45;transform:scale(.7)}50%{opacity:1;transform:scale(1.25)}}@keyframes ngMarigoldSway{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(4px) rotate(4deg)}}
    @media(max-width:760px){.diwali-street .ng-theme-courtyard:before,.diwali-street .ng-theme-bazaar:before,.diwali-street .ng-theme-palace:before{font-size:14px;letter-spacing:1px}.ng-festive-garland span{font-size:16px}.ng-festive-garland i{width:6px;height:6px}.ng-diwali-festival-calendar .festival-days{grid-template-columns:repeat(2,1fr)}}
    /* Distinct 3D-style firework props with visible trails and bursts. */
    .ng-3d-fireworks .fx{font-size:0;width:34px;height:34px;filter:drop-shadow(0 7px 7px #2a0b3155)}
    .ng-3d-fireworks .skyshot{width:12px;height:38px;border-radius:8px 8px 4px 4px;background:linear-gradient(90deg,#3b236e,#ff4f85 48%,#ffd95e);box-shadow:0 42px 0 -4px #fff0a3,0 54px 0 -6px #ff9b45;animation:ngRealSkyshot 4.8s ease-in infinite}
    .ng-3d-fireworks .skyshot:after{content:'';position:absolute;left:50%;top:-22px;width:120px;height:120px;transform:translateX(-50%) scale(.1);opacity:0;border-radius:50%;background:radial-gradient(circle,#fff 0 2%,transparent 3%),radial-gradient(circle at 50% 0,#ffd95e 0 3%,transparent 4%),radial-gradient(circle at 100% 50%,#ff5b8e 0 3%,transparent 4%),radial-gradient(circle at 50% 100%,#4de1df 0 3%,transparent 4%),radial-gradient(circle at 0 50%,#9ef06f 0 3%,transparent 4%);animation:ngRealBurst 4.8s ease-out infinite}
    .ng-3d-fireworks .anaar{width:28px;height:21px;bottom:17px;border-radius:4px 4px 14px 14px;background:linear-gradient(135deg,#8e2f67,#f05d3e 48%,#ffd55a);box-shadow:0 0 18px #ffb52e,0 -20px 0 -8px #ffe66b,12px -30px 0 -10px #ff5b8e,-12px -36px 0 -10px #4de1df,0 -48px 0 -11px #fff;animation:ngRealAnaar 2.3s ease-in-out infinite}
    .ng-3d-fireworks .chakri{width:34px;height:34px;border-radius:50%;background:conic-gradient(#ffd95e,#ff5b8e,#4de1df,#9ef06f,#ffd95e);box-shadow:inset 0 0 0 5px #3b236e,0 0 17px #ffcf4f;animation:ngRealChakri 1.55s linear infinite}
    .ng-3d-fireworks .fuljhari{width:7px;height:43px;border-radius:5px;background:linear-gradient(#a56832,#ffe66b 50%,#a56832);box-shadow:0 0 10px #ffe66b;animation:ngRealFuljhari 1.2s ease-in-out infinite}
    .ng-3d-fireworks .fuljhari:after{content:'';position:absolute;left:50%;top:-30px;width:90px;height:90px;transform:translateX(-50%);background:radial-gradient(circle at 50% 0,#fff 0 2%,transparent 3%),radial-gradient(circle at 90% 30%,#ffe66b 0 2%,transparent 3%),radial-gradient(circle at 12% 42%,#ff9f43 0 2%,transparent 3%),radial-gradient(circle at 75% 82%,#ff5b8e 0 2%,transparent 3%);animation:ngSparkBurst 1.2s ease-in-out infinite}
    .ng-3d-fireworks .popup{width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,#fff 0 5%,#ffd95e 6% 14%,transparent 15%),conic-gradient(#ff5b8e 0 10%,transparent 10% 20%,#4de1df 20% 30%,transparent 30% 40%,#9ef06f 40% 50%,transparent 50% 60%,#ff9f43 60% 70%,transparent 70% 80%,#d79cff 80% 90%,transparent 90%);animation:ngRealPopup 2.9s ease-out infinite}
    .ng-3d-fireworks .ladi{width:76px;height:12px;border-radius:6px;background:repeating-linear-gradient(90deg,#d72e3d 0 9px,#ffd95e 9px 12px);box-shadow:0 0 14px #ff5b5b;animation:ngRealLadi 1.9s ease-in-out infinite}
    @keyframes ngRealSkyshot{0%{transform:translate3d(0,0,0) scale(.55);opacity:0}12%{opacity:1}56%{transform:translate3d(38px,-155px,75px) scale(1.2);opacity:1}70%{transform:translate3d(38px,-155px,75px) scale(1.4);opacity:0}100%{opacity:0}}
    @keyframes ngRealBurst{0%,58%{opacity:0;transform:translateX(-50%) scale(.1)}70%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) scale(1.45)}}
    @keyframes ngRealAnaar{0%,100%{transform:translateZ(0) scale(.8)}50%{transform:translateZ(45px) scale(1.12)}}
    @keyframes ngRealChakri{to{transform:rotateZ(360deg) rotateX(28deg) rotateY(360deg)}}
    @keyframes ngRealFuljhari{0%,100%{transform:rotateY(-12deg) translateY(0)}50%{transform:rotateY(18deg) translateY(-9px)}}
    @keyframes ngSparkBurst{0%,100%{transform:translateX(-50%) scale(.5);opacity:.35}50%{transform:translateX(-50%) scale(1.18);opacity:1}}
    @keyframes ngRealPopup{0%{transform:translateZ(-80px) scale(.15);opacity:0}35%{transform:translateZ(25px) scale(1.15);opacity:1}100%{transform:translateZ(110px) scale(1.6);opacity:0}}
    @keyframes ngRealLadi{0%,100%{transform:rotateX(18deg) scale(.9)}50%{transform:rotateX(-18deg) scale(1.08)}}
    @media(prefers-reduced-motion:reduce){.ng-3d-fireworks .fx,.ng-3d-fireworks .fx:after{animation-duration:8s!important}}
    /* Keep the festive layer inside its section and leave a clear reading area. */
    .diwali-street .ng-theme-courtyard,.diwali-street .ng-theme-bazaar,.diwali-street .ng-theme-palace{padding-top:52px!important;overflow:hidden;isolation:isolate}
    .diwali-street .ng-theme-courtyard>.ng-3d-fireworks,.diwali-street .ng-theme-bazaar>.ng-3d-fireworks,.diwali-street .ng-theme-palace>.ng-3d-fireworks{z-index:0!important}
    .diwali-street .ng-theme-courtyard>.ng-firework-canvas,.diwali-street .ng-theme-bazaar>.ng-firework-canvas,.diwali-street .ng-theme-palace>.ng-firework-canvas{z-index:0!important;opacity:.72}
    .diwali-street .ng-theme-courtyard>.ng-festive-garland,.diwali-street .ng-theme-bazaar>.ng-festive-garland,.diwali-street .ng-theme-palace>.ng-festive-garland{z-index:1!important}
    .diwali-street .ng-theme-courtyard>h1,.diwali-street .ng-theme-courtyard>h2,.diwali-street .ng-theme-courtyard>h3,.diwali-street .ng-theme-courtyard>p,.diwali-street .ng-theme-courtyard>div:not(.ng-3d-fireworks):not(.ng-festive-garland),.diwali-street .ng-theme-bazaar>h1,.diwali-street .ng-theme-bazaar>h2,.diwali-street .ng-theme-bazaar>h3,.diwali-street .ng-theme-bazaar>p,.diwali-street .ng-theme-bazaar>div:not(.ng-3d-fireworks):not(.ng-festive-garland),.diwali-street .ng-theme-palace>h1,.diwali-street .ng-theme-palace>h2,.diwali-street .ng-theme-palace>h3,.diwali-street .ng-theme-palace>p,.diwali-street .ng-theme-palace>div:not(.ng-3d-fireworks):not(.ng-festive-garland){position:relative;z-index:2}
    .diwali-street .ng-theme-palace p,.diwali-street .ng-theme-palace small,.diwali-street .ng-theme-palace label{color:#fff1cf}
    .ng-diwali-festival-calendar .ng-calendar-status{margin:0 0 10px;color:#ffeec5;font-size:12px;line-height:1.4}
    .ng-diwali-festival-calendar .festival-days span{min-height:58px;display:flex;flex-direction:column;justify-content:center}
    @media(max-width:760px){.diwali-street .ng-theme-courtyard,.diwali-street .ng-theme-bazaar,.diwali-street .ng-theme-palace{padding-top:44px!important}.ng-diwali-festival-calendar .festival-days span{min-height:64px;font-size:10px}}
    .ng-app-banner{display:none;align-items:center;gap:16px;margin:0 0 16px;padding:16px 18px;border:2px solid #ffd86a;border-radius:22px;background:linear-gradient(105deg,#3b1737,#7a2443 52%,#b75a2b);color:#fff7df;box-shadow:0 16px 32px #6b24433d;position:relative;z-index:3}
    .post-profile .ng-app-banner{display:flex}.ng-app-banner .trainer-mark{display:grid;place-items:center;min-width:70px;height:70px;border-radius:20px;background:linear-gradient(145deg,#ffd96b,#ef7a36);font-size:42px;filter:drop-shadow(0 8px 7px #16081b66)}.ng-app-banner small{display:block;color:#ffe08e;font-weight:900;letter-spacing:1.2px;font-size:10px}.ng-app-banner h2{margin:3px 0;font-size:22px;color:#fff4b0}.ng-app-banner p{margin:0;color:#ffe9c8;font-size:12px;line-height:1.45}.ng-app-banner button{width:auto;margin:0 0 0 auto;background:#ffd86a;color:#3b1737;padding:10px 13px;font-size:11px;white-space:nowrap}.guide-coach{position:relative}.guide-coach .coach-role{display:block;margin-bottom:3px;color:#ffe08e;font-size:9px;font-weight:900;letter-spacing:1px;text-transform:uppercase}.guide-coach .coach-training{display:block;color:#fff4c7;font-size:10px;font-weight:800;margin-top:3px}.guide-coach .coach-start{width:auto;margin:0;padding:8px 10px;background:#ffd86a;color:#3b1737;font-size:10px;white-space:nowrap}
    @media(max-width:760px){.ng-app-banner{align-items:flex-start;padding:13px}.ng-app-banner .trainer-mark{min-width:52px;height:52px;font-size:30px}.ng-app-banner h2{font-size:17px}.ng-app-banner button{margin:8px 0 0 auto}.guide-coach .coach-start{display:none}}
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
    else {
      const groups = { home: ['.guide-picker','.mascot-gallery','.motivation','.dashboard-summary','.grid'], food: ['.protein-tracker','.food-nutrition','.food-library','.food-studio','.market-banner','.stories','.all-foods'], move: ['.inspiration','.exercise-library'], journey: ['.journey'], plan: ['.reminders','.weekly-report'] };
      document.querySelectorAll('.app-nav button').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
      new Set(Object.values(groups).flat()).forEach((selector) => document.querySelectorAll(selector).forEach((element) => element.style.setProperty('display','none','important')));
      (groups[tab] || groups.home).forEach((selector) => document.querySelectorAll(selector).forEach((element) => element.style.setProperty('display', selector === '.grid' ? 'grid' : 'block','important')));
    }
    document.querySelectorAll('.ng-tab-section').forEach((section) => {
      section.style.display = section.dataset.ngTab === tab ? 'block' : 'none';
    });
    if (tab === 'home') renderToday();
    if (tab === 'food') { renderQuickStatus(); renderGroceries(); }
    if (tab === 'move') renderExerciseCoach();
    if (tab === 'journey') renderJourneyBadge();
    if (tab === 'plan') renderShareStatus();
    const coach = document.getElementById('coachText');
    if (coach) coach.textContent = (window.storyTabMessages?.[tab]) || ({ home: 'Let’s start with one small win today.', food: 'Build a colourful plate and add your protein foods.', move: 'Train with control. I’ll stay beside you for every rep.', journey: 'Choose a story mode and make this journey yours.', plan: 'Your plan is ready. Keep the next step simple.' }[tab] || 'I’m here to coach your next step.');
    requestAnimationFrame(() => window.ngResumeFireworks?.());
  };
  document.querySelectorAll('.app-nav button').forEach((button) => {
    if (button.dataset.ngTabBound) return;
    button.dataset.ngTabBound = 'true';
    button.addEventListener('click', () => window.setTab(button.dataset.tab));
  });

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
    ['🥛', 'Kesar almond milk', 'Warm saffron milk; use a small portion and unsweetened milk.', 130, 6, 10, 7, 2],
    ['🍯', 'Date and walnut barfi', 'Dates, walnuts and coconut with no refined sugar; enjoy one square.', 155, 3, 19, 8, 3],
    ['🥥', 'Light coconut barfi', 'Fresh coconut and low-sugar milk solids in a small festive portion.', 145, 4, 18, 7, 2],
    ['🌾', 'Besan ladoo, mini', 'Roasted gram flour, cardamom and a little ghee in a mini portion.', 135, 4, 16, 6, 2],
    ['🫘', 'Til and jaggery ladoo', 'Sesame, peanuts and jaggery for a mineral-rich traditional sweet.', 150, 5, 18, 7, 3],
    ['🍮', 'Moong dal halwa cup', 'A lighter small cup with roasted moong, saffron and less ghee.', 190, 7, 24, 8, 4],
    ['🥜', 'Pista almond burfi', 'Nut-rich burfi made with less sugar and a small serving size.', 165, 5, 14, 10, 3],
    ['🌀', 'Baked chakli', 'A crisp millet and rice flour chakli baked with a light oil brush.', 175, 4, 25, 6, 3],
    ['🧨', 'Roasted firework chivda', 'Poha, roasted makhana, curry leaves and peanuts with less oil.', 180, 7, 27, 5, 5],
    ['🌋', 'Baked anaar kachori', 'A small baked lentil kachori with a bright pomegranate chutney.', 205, 7, 29, 7, 4],
    ['✨', 'Fuljhari makhana', 'Crunchy roasted makhana dusted with chilli, lime and chaat masala.', 145, 5, 22, 4, 4],
    ['🌀', 'Chakri corn chaat', 'Sweet corn, cucumber, pomegranate and lime in a colourful bowl.', 135, 5, 25, 2, 5],
    ['🥨', 'Millet namak para', 'Oven-baked millet bites with ajwain and a gentle spice mix.', 165, 4, 24, 6, 3],
    ['🥟', 'Air-fried samosa bites', 'Mini potato and pea samosas with coriander mint chutney.', 190, 5, 28, 7, 4],
    ['🌽', 'Masala roasted corn', 'Charred corn with lime, chilli and coriander instead of fried snacks.', 125, 4, 23, 2, 4]
  ];
  const foodGuides = {
    panda: { avatar: '🐼👨‍🍳', name: 'Panda Chef', role: 'Balanced festive plates', message: 'I will help you enjoy mithai, colourful vegetables, and enough protein without taking the joy out of Diwali.' },
    peacock: { avatar: '🦚🌼', name: 'Peacock Plater', role: 'Colour and variety', message: 'Let us make every plate feel like a rangoli with fruits, salads, pulses, and regional flavours.' },
    fox: { avatar: '🦊🍬', name: 'Mithai Fox', role: 'Smarter sweets', message: 'Choose a small serving, savour it slowly, and pair festive sweets with a nourishing meal.' },
    elephant: { avatar: '🐘🪔', name: 'Diya Elephant', role: 'Mindful traditions', message: 'A calm pace, warm food, and a short walk can keep your festive rhythm comfortable.' }
  };
  const festiveSoundFiles = { crackle: '/diwali-crackers.wav', success: '/diwali-dhol.wav', tap: '/diwali-diya.wav' };
  const festiveAudio = {};
  function playFestiveSound(kind) {
    if (localStorage.getItem('ngFestiveSound') === 'off') return;
    try {
      const src = festiveSoundFiles[kind] || festiveSoundFiles.tap;
      const audio = festiveAudio[kind] || (festiveAudio[kind] = new Audio(src));
      audio.currentTime = 0; audio.volume = kind === 'crackle' ? 0.42 : 0.32;
      const promise = audio.play(); if (promise?.catch) promise.catch(() => {});
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
      document.addEventListener('click', (event) => { const target = event.target.closest('button,.food-card,.exercise-card'); if (!target || target.id === 'ngFestiveSound' || target.matches('.ng-food-guide')) return; if (target.matches('.app-nav button')) playFestiveSound('crackle'); else if (target.matches('.food-tabs button')) playFestiveSound('success'); else if (target.matches('.exercise-card,.ng-actions button')) playFestiveSound('tap'); });
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
  const diwaliStreetMessages = [
    'Good morning! Light your first diya and begin with one bright, nourishing choice.',
    'The market is waking up: add colour to breakfast with fruit, curd, or a warm bowl.',
    'A little movement makes the morning sparkle. Take a joyful stretch or short walk.',
    'Panda says: fill half your plate with colourful vegetables before the sweets arrive.',
    'Fresh flowers, fresh water, fresh energy. Keep your next choice simple and beautiful.',
    'Your festive plate can be both delicious and balanced. Try one protein-rich food now.',
    'Midday glow: pause, breathe, and enjoy your meal slowly without rushing.',
    'Choose a market favourite, then add a salad or fruit to make the plate more complete.',
    'Firework energy check: log your steps and let your guide suggest the next celebration move.',
    'Mithai Fox reminds you: choose one sweet you love and savour every bite.',
    'A colourful snack stall is open: roasted chana, makhana, fruit, or sprouts are ready.',
    'Drink some water before the next round of festive treats and keep your evening comfortable.',
    'The rangoli is growing. Add one small win to your journey before the evening lamps.',
    'Golden hour: a calm ten-minute walk can make space for a joyful dinner.',
    'Peacock Plater says: variety is the celebration. Add two colours you have not logged yet.',
    'Light a diya, check your energy, and choose gentle movement if your body asks for it.',
    'Evening bazaar time: enjoy your favourite food and keep the portion intentional.',
    'Your guide is cheering: protein, fibre, water, and joy can share the same festive plate.',
    'Lanterns are glowing. Write one thought about what made today feel special.',
    'Cracker sparkle outside, calm breath inside. Try a short stretch before bed.',
    'The celebration continues: review your meals, movement, and water with kindness.',
    'One sweet moment is enough to create a memory. Let the rest of your plate nourish you.',
    'Diya Elephant says: slow down, enjoy family time, and protect your sleep tonight.',
    'The street is quieting. Celebrate your progress and choose tomorrow’s first small win.'
  ];
  function indiaTodayKey() { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()); } catch { return new Date().toISOString().slice(0, 10); } }
  function indiaHour() { try { return Number(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date())) % 24; } catch { return new Date().getHours(); } }
  function renderDiwaliStreetMessage() {
    const day = diwaliDays2026[indiaTodayKey()] || defaultDiwaliDay;
    const live = `${day.name}: ${diwaliStreetMessages[indiaHour()]}`;
    document.querySelectorAll('[data-diwali-live-message]').forEach((el) => { el.textContent = live; });
    const banner = document.getElementById('ngDiwaliDayMessage'); if (banner) banner.textContent = live;
    const ticker = document.getElementById('ngDiwaliLiveMessage'); if (ticker) ticker.textContent = live;
  }
  function renderDiwaliCalendar() {
    const day = diwaliDays2026[indiaTodayKey()] || defaultDiwaliDay;
    const title = document.getElementById('ngDiwaliDayTitle'); if (title) title.textContent = `${day.name} • ${day.short}`;
    const next = document.getElementById('ngDiwaliNextMessage'); if (next) next.textContent = day.next;
    document.querySelectorAll('[data-diwali-day-label]').forEach((el) => { el.textContent = day.name; });
    const calendar = document.querySelector('.ng-diwali-festival-calendar');
    const grid = calendar?.querySelector('.festival-days');
    const currentKey = indiaTodayKey();
    if (calendar) calendar.dataset.currentDate = currentKey;
    if (grid) {
      grid.innerHTML = Object.entries(diwaliDays2026).map(([date, item]) => `<span class="${date === currentKey ? 'today' : ''}" data-date="${date}" title="${item.message}">${item.name}<br><small>${item.short}</small></span>`).join('');
      const status = calendar.querySelector('.ng-calendar-status');
      if (status) status.textContent = `${day.name} is today • ${day.message}`;
    }
    renderDiwaliStreetMessage();
  }
  const diwaliFireworkTypes = ['Anaar', 'Rocket', 'Skyshot', 'Fuljadi', 'Chakri', 'Popup', 'Ladi'];
  const fireworksControllers = [];
  function mount3DFireworks(section) {
    if (!section || section.querySelector('.ng-firework-canvas')) return;
    const garland = document.createElement('div'); garland.className = 'ng-festive-garland'; garland.setAttribute('aria-hidden','true');
    garland.innerHTML = '<span>🌼</span><i></i><span>🌼</span><i></i><span>🌼</span><i></i><span>🌼</span><i></i><span>🌼</span><i></i><span>🌼</span>';
    section.appendChild(garland);
    const canvas = document.createElement('canvas'); canvas.className = 'ng-firework-canvas'; canvas.setAttribute('aria-hidden','true'); section.prepend(canvas);
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let width = 1, height = 1, dpr = 1, last = 0, nextLaunch = 0, raf = 0, inViewport = false, pageVisible = !document.hidden;
    const palette = ['#ffe66b','#ff5b8e','#4de1df','#9ef06f','#ff9f43','#d79cff','#ffffff'];
    const particles = [];
    function resize(){ const rect=section.getBoundingClientRect(); width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0); }
    function burst(type, x, y){
      const color=palette[Math.floor(Math.random()*palette.length)], count=type==='Popup'?34:type==='Chakri'?22:type==='Ladi'?14:28;
      if(type==='Ladi'){ for(let n=0;n<7;n++) setTimeout(()=>burst('Popup',Math.max(35,Math.min(width-35,x-180+n*60)),Math.max(45,y-80-Math.random()*70)),n*110); return; }
      for(let i=0;i<count;i++){ const a=(Math.PI*2*i/count)+(type==='Chakri'?Date.now()/500:0), speed=(type==='Anaar'?1.2+Math.random()*2.2:2+Math.random()*3.8); particles.push({x,y,z:Math.random()*70,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,vz:(Math.random()-.5)*2,life:1,decay:.012+Math.random()*.014,color,type,trail:[]}); }
      if (particles.length > 260) particles.splice(0, particles.length - 260);
    }
    function launch(){ const type=diwaliFireworkTypes[Math.floor(Math.random()*diwaliFireworkTypes.length)]; const x=40+Math.random()*(width-80); const y=height*.2+Math.random()*height*.35; if(type==='Fuljadi'){ for(let i=0;i<18;i++) particles.push({x:width*.25+Math.random()*width*.5,y:height*.7+Math.random()*height*.2,z:Math.random()*35,vx:(Math.random()-.5)*1.2,vy:-1.2-Math.random()*2.5,vz:(Math.random()-.5)*1.5,life:1,decay:.018+Math.random()*.018,color:'#ffe66b',type,trail:[]}); } else if(type==='Rocket'||type==='Skyshot'){ burst(type,x,y); } else burst(type,x,type==='Anaar'?height*.68:y); }
    function project(p){ const scale=280/(280+p.z); return {x:width/2+(p.x-width/2)*scale,y:height/2+(p.y-height/2)*scale,scale}; }
    function draw(t){
      if (!pageVisible || !inViewport || section.offsetParent === null) { raf = 0; return; }
      if(!last) last=t; const dt=Math.min(32,t-last); last=t; if(t>nextLaunch){launch();nextLaunch=t+1400+Math.random()*1200;} ctx.clearRect(0,0,width,height);
      for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx*dt/16;p.y+=p.vy*dt/16;p.z+=p.vz*dt/16;p.vy+=p.type==='Anaar'?0.018:0.035;p.vx*=.995;p.vy*=.995;p.life-=p.decay*dt/16; const q=project(p); if(p.life<=0||q.y<-80||q.y>height+80){particles.splice(i,1);continue;} const r=Math.max(.8,3.8*q.scale);ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.shadowBlur=13*q.scale;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill(); if(p.trail.length){const old=p.trail[p.trail.length-1];ctx.globalAlpha*=.45;ctx.strokeStyle=p.color;ctx.lineWidth=1.4*q.scale;ctx.beginPath();ctx.moveTo(old.x,old.y);ctx.lineTo(q.x,q.y);ctx.stroke();} p.trail.push(q);if(p.trail.length>3)p.trail.shift(); }
      ctx.globalAlpha=1;ctx.shadowBlur=0;raf=requestAnimationFrame(draw);
    }
    const start = () => { if (!raf && pageVisible && inViewport && section.offsetParent !== null) { last = 0; raf = requestAnimationFrame(draw); } };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const viewportObserver = new IntersectionObserver((entries) => { inViewport = Boolean(entries[0]?.isIntersecting); if (inViewport) start(); else stop(); }, { threshold: 0.01 });
    viewportObserver.observe(section);
    const visibilityHandler = () => { pageVisible = !document.hidden; if (pageVisible) start(); else stop(); };
    document.addEventListener('visibilitychange', visibilityHandler, { passive: true });
    const displayObserver = new MutationObserver(start);
    displayObserver.observe(section, { attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize',resize,{passive:true});
    fireworksControllers.push({ start, stop });
    window.ngResumeFireworks = () => fireworksControllers.forEach((controller) => controller.start());
    resize();
  }
  function install3DFireworks(){ document.querySelectorAll('.ng-theme-courtyard,.ng-theme-bazaar,.ng-theme-palace').forEach(mount3DFireworks); }

  function installFallbackTabRouter() {
    if (typeof window.setTab === 'function') return;
    const groups = {
      home: ['.ng-home-section','.guide-picker','.mascot-gallery','.motivation','.dashboard-summary','.grid'],
      food: ['.ng-food-section','.protein-tracker','.food-nutrition','.food-library','.food-studio','.market-banner','.stories','.all-foods'],
      move: ['.ng-move-section','.inspiration','.exercise-library'],
      journey: ['.ng-journey-section','.journey'],
      plan: ['.ng-plan-section','.reminders','.weekly-report']
    };
    window.setTab = function(tab) {
      document.querySelectorAll('.app-nav button').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
      const all = new Set(Object.values(groups).flat());
      all.forEach((selector) => document.querySelectorAll(selector).forEach((element) => element.style.setProperty('display','none','important')));
      (groups[tab] || groups.home).forEach((selector) => document.querySelectorAll(selector).forEach((element) => element.style.setProperty('display', selector === '.grid' ? 'grid' : 'block','important')));
      document.querySelectorAll(`[data-ng-tab="${tab}"]`).forEach((element) => element.style.setProperty('display','block','important'));
      const coach = document.getElementById('coachText'); if (coach) coach.textContent = ({home:'Let’s start with one small win today.',food:'Build a colourful plate and add your protein foods.',move:'Train with control. I’ll stay beside you for every rep.',journey:'Choose a story mode and make this journey yours.',plan:'Your plan is ready. Keep the next step simple.'})[tab] || '';
    };
    document.querySelectorAll('.app-nav button').forEach((button) => button.addEventListener('click', () => window.setTab(button.dataset.tab)));
  }

  function installDiwaliExperience() {
    document.body.classList.add('diwali-mode', 'diwali-premium', 'diwali-street');
    installFallbackTabRouter();
    if (!document.querySelector('.ng-diwali-decor')) document.body.insertAdjacentHTML('afterbegin', '<div class="ng-diwali-decor" aria-hidden="true"><div class="ng-decor-fireworks"><span>🎇</span><span>🎆</span><span>🌀</span><span>🌋</span></div><div class="ng-toran-line">🌼 🍃 🌼 🍃 🌼 🍃 🌼 🍃 🌼<span class="leaves">🍃 🍃 🍃 🍃 🍃 🍃 🍃 🍃</span></div><div class="ng-light-string"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="ng-decor-diya left">🪔</span><span class="ng-decor-diya right">🪔</span></div>');
    if (!document.querySelector('.ng-diwali-street-effects')) document.body.insertAdjacentHTML('beforeend', '<div class="ng-diwali-street-effects" aria-hidden="true"><span class="petal">🌼</span><span class="petal">🌼</span><span class="petal">🌼</span><span class="petal">🌼</span><i class="spark"></i><i class="spark"></i><i class="spark"></i></div><div class="ng-diwali-rangoli" aria-hidden="true"></div>');
    if (!root.querySelector('.ng-diwali-live-ticker')) root.insertAdjacentHTML('afterbegin', '<div class="ng-diwali-live-ticker"><b>🪔 LIVE DIWALI STREET</b><span id="ngDiwaliLiveMessage">The celebration is glowing.</span></div>');
    if (!root.querySelector('.ng-app-banner')) root.insertAdjacentHTML('afterbegin', '<section class="ng-app-banner" id="ngAppBanner"><div class="trainer-mark">🐼🥋</div><div><small>YOUR PERSONAL GYM TRAINER</small><h2>Train with your guide</h2><p>Panda Trainer will coach your warm-up, form, workout, recovery, and next small win.</p></div><button type="button" onclick="window.setTab(\'move\')">Start training</button></section>');
    const guideCoach = document.getElementById('guideCoach');
    if (guideCoach && !guideCoach.querySelector('.coach-role')) {
      const copy = guideCoach.querySelector(':scope > div:nth-child(2)');
      if (copy) copy.insertAdjacentHTML('afterbegin', '<small class="coach-role">PERSONAL GYM TRAINER</small><small class="coach-training">Warm-up • form • reps • recovery</small>');
      const change = guideCoach.querySelector('button'); if (change) change.textContent = 'Change trainer';
      guideCoach.insertAdjacentHTML('beforeend', '<button type="button" class="coach-start" onclick="window.setTab(\'move\')">Start workout</button>');
    }
    if (!root.querySelector('.ng-diwali-welcome')) root.insertAdjacentHTML('afterbegin', '<section class="ng-diwali-welcome"><div class="ng-diwali-art">🪔<br>🌼</div><div style="flex:1;position:relative;z-index:1"><div class="ng-diwali-topline"><span>✦ DIWALI CELEBRATION STREET ✦</span><button type="button" class="ng-diwali-sound" id="ngFestiveSound" aria-pressed="true">🔊 Enable Diwali sounds</button></div><h2 id="ngDiwaliDayTitle">Diwali wellness season</h2><p id="ngDiwaliDayMessage">The celebration is glowing.</p><div class="ng-diwali-calendar"><span>🌼 Dhanteras</span><span class="today" data-diwali-day-label>Today</span><span>🎆 Deepavali</span><span>🌼 Bhai Dooj</span></div><small id="ngDiwaliNextMessage" style="display:block;margin-top:10px;color:#ffeec8;position:relative;z-index:1">Your next small win is waiting.</small><div class="ng-diwali-fireworks"><i></i><i></i><i></i></div></div><div class="ng-diwali-art">🍬<br>🎇</div></section>');
    if (typeof foodSets !== 'undefined') foodSets.diwali = diwaliFoods;
    if (typeof nutritionDatabase !== 'undefined') Object.assign(nutritionDatabase, {
      makhanakheer:{label:'Makhana kheer',emoji:'🪔',cal:180,p:7,c:24,fat:6,f:3}, anjeerdateladoo:{label:'Anjeer date ladoo',emoji:'🍬',cal:145,p:3,c:24,fat:5,f:4}, ragicoconutladoo:{label:'Ragi coconut ladoo',emoji:'🥥',cal:135,p:3,c:21,fat:5,f:3},
      peanutseasamechikki:{label:'Peanut sesame chikki',emoji:'🥜',cal:155,p:5,c:16,fat:8,f:3}, bakedgujiya:{label:'Baked gujiya',emoji:'🥟',cal:210,p:6,c:30,fat:8,f:2}, diwalimakhanamasala:{label:'Diwali masala makhana',emoji:'🍿',cal:150,p:5,c:22,fat:5,f:4},
      roastedchanachivda:{label:'Roasted chana chivda',emoji:'🌾',cal:190,p:8,c:29,fat:5,f:6}, festivefruitchaat:{label:'Festive fruit chaat',emoji:'🍎',cal:120,p:2,c:28,fat:1,f:6}, steamedhoklaybites:{label:'Steamed dhokla bites',emoji:'🥣',cal:165,p:7,c:25,fat:4,f:3},
      lightfestivethali:{label:'Light festive thali',emoji:'🍛',cal:420,p:18,c:55,fat:14,f:12}, sproutsfestivechaat:{label:'Sprouts festive chaat',emoji:'🥗',cal:210,p:13,c:31,fat:4,f:9}, kesaralmondmilk:{label:'Kesar almond milk',emoji:'🥛',cal:130,p:6,c:10,fat:7,f:2}
    });
    if (typeof nutritionDatabase !== 'undefined') Object.assign(nutritionDatabase, {
      datewalnutbarfi:{label:'Date and walnut barfi',emoji:'🍯',cal:155,p:3,c:19,fat:8,f:3}, lightcoconutbarfi:{label:'Light coconut barfi',emoji:'🥥',cal:145,p:4,c:18,fat:7,f:2}, besanladduomini:{label:'Besan ladoo, mini',emoji:'🌾',cal:135,p:4,c:16,fat:6,f:2},
      tiljaggeryladoo:{label:'Til and jaggery ladoo',emoji:'🫘',cal:150,p:5,c:18,fat:7,f:3}, moongdalhalwacup:{label:'Moong dal halwa cup',emoji:'🍮',cal:190,p:7,c:24,fat:8,f:4}, pistaburfi:{label:'Pista almond burfi',emoji:'🥜',cal:165,p:5,c:14,fat:10,f:3},
      bakedchakli:{label:'Baked chakli',emoji:'🌀',cal:175,p:4,c:25,fat:6,f:3}, fireworkchivda:{label:'Roasted firework chivda',emoji:'🧨',cal:180,p:7,c:27,fat:5,f:5}, bakedanaarkachori:{label:'Baked anaar kachori',emoji:'🌋',cal:205,p:7,c:29,fat:7,f:4}, fuljharimakhana:{label:'Fuljhari makhana',emoji:'✨',cal:145,p:5,c:22,fat:4,f:4},
      chakricornchaat:{label:'Chakri corn chaat',emoji:'🌀',cal:135,p:5,c:25,fat:2,f:5}, milletnamakpara:{label:'Millet namak para',emoji:'🥨',cal:165,p:4,c:24,fat:6,f:3}, airfriedsamosabites:{label:'Air-fried samosa bites',emoji:'🥟',cal:190,p:5,c:28,fat:7,f:4}, masalaroastedcorn:{label:'Masala roasted corn',emoji:'🌽',cal:125,p:4,c:23,fat:2,f:4}
    });
    const tabs = document.querySelector('.food-tabs');
    if (tabs && !tabs.querySelector('[data-diwali-foods]')) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.diwaliFoods = 'true'; button.textContent = '🪔 Diwali treats'; button.addEventListener('click', () => window.showFoods?.('diwali')); tabs.appendChild(button);
    }
    const foodStudio = document.querySelector('.food-studio');
    if (foodStudio && !foodStudio.querySelector('.ng-diwali-food-banner')) foodStudio.insertAdjacentHTML('afterbegin', '<div class="ng-diwali-food-banner"><span class="ng-diwali-food-icon">🪔✨</span><div><strong>Diwali, with balance</strong><small>Enjoy traditional flavours, smaller portions, and lighter homemade festive choices.</small></div></div>');
    if (foodStudio && !foodStudio.querySelector('.ng-food-guides')) foodStudio.insertAdjacentHTML('afterbegin', '<div class="ng-food-guides"><div class="ng-food-guides-head"><div><div class="eyebrow">YOUR FESTIVE FOOD COMPANIONS</div><h3>Choose who helps you build the plate</h3><p>Tap a character for a gentle food message. Your choice stays in Food Studio.</p></div><span style="font-size:38px;filter:drop-shadow(0 5px 6px #7d351d22)">🍽️✨</span></div><div class="ng-food-guide-grid"><button type="button" class="ng-food-guide" data-guide="panda" onclick="ngChooseFoodGuide(\'panda\')"><span class="avatar">🐼👨‍🍳</span><b>Panda Chef</b><small>Balanced festive plates</small><em>Protein + joy</em></button><button type="button" class="ng-food-guide" data-guide="peacock" onclick="ngChooseFoodGuide(\'peacock\')"><span class="avatar">🦚🌼</span><b>Peacock Plater</b><small>Colour and variety</small><em>Rainbow meals</em></button><button type="button" class="ng-food-guide" data-guide="fox" onclick="ngChooseFoodGuide(\'fox\')"><span class="avatar">🦊🍬</span><b>Mithai Fox</b><small>Smarter sweets</small><em>Sweet moments</em></button><button type="button" class="ng-food-guide" data-guide="elephant" onclick="ngChooseFoodGuide(\'elephant\')"><span class="avatar">🐘🪔</span><b>Diya Elephant</b><small>Mindful traditions</small><em>Calm rhythm</em></button></div><p class="ng-food-guide-message" id="ngFoodGuideMessage"></p></div>');
    const fireworksMarkup = '<div class="ng-3d-fireworks" aria-hidden="true"><div class="ng-3d-toran">🌼 🌼 🌼 🌼 🌼 🌼 🌼</div><span class="fx skyshot"></span><span class="fx skyshot two"></span><span class="fx anaar"></span><span class="fx anaar two"></span><span class="fx chakri"></span><span class="fx chakri two"></span><span class="fx fuljhari"></span><span class="fx popup"></span><span class="fx popup two"></span><span class="fx ladi"></span><span class="fx marigold one">🌼</span><span class="fx marigold two">🌼</span><span class="fx marigold three">🌼</span></div>';
    const addTheme = (selectors, theme) => selectors.forEach((selector) => document.querySelectorAll(selector).forEach((section) => { section.classList.add(theme); if (!section.querySelector('.ng-3d-fireworks')) section.insertAdjacentHTML('afterbegin', fireworksMarkup); }));
    addTheme(['.ng-home-section','.dashboard-summary','.motivation','.guide-picker','.mascot-gallery','.ng-journey-section','.journey','.stories'], 'ng-theme-courtyard');
    addTheme(['.ng-food-section','.food-studio','.food-nutrition','.food-library','.market-banner','.all-foods'], 'ng-theme-bazaar');
    addTheme(['.ng-move-section','.exercise-library','.inspiration','.ng-plan-section','.weekly-report','.reminders'], 'ng-theme-palace');
    document.querySelectorAll('.ng-tab-section').forEach((section) => { if (!section.querySelector('.ng-diwali-badge')) section.insertAdjacentHTML('afterbegin', '<div class="ng-diwali-badge">🪔 Diwali Celebration Street <span data-diwali-live-message>Light, joy, movement, and mindful festive choices ✨</span></div>'); });
    const planSection = document.querySelector('[data-ng-tab="plan"]');
    if (planSection && !planSection.querySelector('.ng-diwali-festival-calendar')) planSection.insertAdjacentHTML('afterbegin', '<div class="ng-diwali-festival-calendar"><h3>🪔 Diwali festival calendar</h3><p class="ng-calendar-status" aria-live="polite">Loading today’s festival…</p><div class="festival-days"></div></div>');
    install3DFireworks();
    renderDiwaliCalendar();
    renderFoodGuide();
    installFestiveSoundControls();
    clearInterval(window.ngDiwaliStreetTimer); window.ngDiwaliStreetTimer = setInterval(renderDiwaliCalendar, 60000);
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
  style.textContent += `.guide-coach{flex-wrap:wrap}.ng-trainer-plan{display:flex;flex-direction:column;gap:3px;min-width:240px;flex:1 1 260px;padding:7px 10px;border-left:1px solid #ffffff35}.ng-trainer-role{display:block;color:#ffe08e;font-size:10px;font-weight:900;letter-spacing:.7px;text-transform:uppercase}.ng-trainer-focus{display:block;color:#e4f7eb;font-size:11px;line-height:1.35}.ng-food-guides,.mascot-gallery{display:none!important}@media(max-width:760px){.ng-trainer-plan{flex-basis:100%;border-left:0;border-top:1px solid #ffffff35;padding:8px 0 0}.guide-coach{align-items:flex-start}}`;

  /* Central trainer experience: one selected guide, one personalized plan across tabs. */
  const trainerProfiles = {
    0: { role: 'Fresh-start nutrition coach', focus: 'easy meal wins', workout: 'gentle walking and mobility', voice: 'We will keep your first steps simple and repeatable.' },
    1: { role: 'Hydration and recovery coach', focus: 'hydration and balanced meals', workout: 'low-impact movement and recovery', voice: 'We will build your energy one glass and one calm session at a time.' },
    2: { role: 'Workout partner coach', focus: 'fuel for movement', workout: 'fun cardio and bodyweight strength', voice: 'I will count the reps with you and keep the pace comfortable.' },
    3: { role: 'Outdoor fitness coach', focus: 'fresh food and active days', workout: 'walking, cycling, and outdoor stamina', voice: 'Let us turn your daily routine into an active adventure.' },
    4: { role: 'Performance motivation coach', focus: 'protein and consistent meals', workout: 'progressive strength and stamina', voice: 'We will make each session stronger through steady practice.' },
    5: { role: 'Personal gym trainer', focus: 'protein, recovery, and mindful portions', workout: 'warm-up, form, strength, and martial-arts balance', voice: 'I will coach your warm-up, form, reps, recovery, and next small win.' }
  };
  function activeTrainer() {
    const index = Number(localStorage.getItem('selectedGuide') || 5);
    const guide = (typeof guides !== 'undefined' && guides[index]) || ['🐼🥋', 'Panda trainer', 'Personal gym trainer', 'Breathe, balance, and train with calm strength!', 'Calm strength'];
    return { index, guide, plan: trainerProfiles[index] || trainerProfiles[5] };
  }
  function trainerGoalText() {
    const p = profile();
    return p.goal === 'gain' ? 'support healthy weight gain' : p.goal === 'maintain' ? 'maintain your current weight' : 'support gradual weight loss';
  }
  function trainerPlanText() {
    const p = profile();
    const weight = Number(p.weight || 0);
    const proteinTarget = Math.max(70, Math.round((weight || 70) * (p.goal === 'gain' ? 1.4 : 1.2)));
    const activity = Number(p.activity || 1.2);
    const session = activity >= 1.55 ? '25–35 min training' : activity >= 1.375 ? '20–30 min training' : '10–20 min beginner training';
    return { proteinTarget, session, goal: trainerGoalText() };
  }
  function renderTrainerExperience(tab) {
    const { guide, plan } = activeTrainer();
    const next = trainerPlanText();
    const tabCopy = {
      home: `${guide[1]} is setting today’s plan to ${next.goal}. Start with one small win.`,
      food: `${guide[1]} says: build your plate around ${plan.focus}; your protein target is about ${next.proteinTarget} g today.`,
      move: `${guide[1]} is your ${plan.role.toLowerCase()}. Today’s session: ${next.session} focused on ${plan.workout}.`,
      journey: `${guide[1]} will guide your story chapter and check in after every step.`,
      plan: `${guide[1]} has your reminders and weekly review ready. Keep the next action realistic.`
    };
    const coachAvatar = document.getElementById('coachAvatar');
    const coachName = document.getElementById('coachName');
    const coachText = document.getElementById('coachText');
    if (coachAvatar) coachAvatar.textContent = guide[0];
    if (coachName) coachName.textContent = guide[1];
    if (coachText) coachText.textContent = tabCopy[tab] || plan.voice;
    const coach = document.getElementById('guideCoach');
    if (coach) {
      let card = coach.querySelector('.ng-trainer-plan');
      if (!card) { coach.insertAdjacentHTML('beforeend', '<div class="ng-trainer-plan"><span class="ng-trainer-role" id="ngTrainerRole"></span><span class="ng-trainer-focus" id="ngTrainerFocus"></span></div>'); card = coach.querySelector('.ng-trainer-plan'); }
      const role = document.getElementById('ngTrainerRole');
      const focus = document.getElementById('ngTrainerFocus');
      if (role) role.textContent = `${plan.role} • ${plan.workout}`;
      if (focus) focus.textContent = `Plan: ${next.goal} • ${next.proteinTarget} g protein target • ${next.session}`;
    }
    const banner = document.getElementById('ngAppBanner');
    if (banner) {
      const mark = banner.querySelector('.trainer-mark');
      const heading = banner.querySelector('h2');
      const copy = banner.querySelector('p');
      const small = banner.querySelector('small');
      if (mark) mark.textContent = guide[0];
      if (small) small.textContent = plan.role.toUpperCase();
      if (heading) heading.textContent = `${guide[1]} is your trainer`;
      if (copy) copy.textContent = `${plan.voice} I’ll plan your food focus, workout, recovery, and motivation around your details.`;
    }
    if (document.getElementById('ngExerciseTitle') && tab === 'move') document.getElementById('ngExerciseTitle').textContent = `${guide[1]}'s training plan`;
    if (document.getElementById('ngExerciseSubtitle') && tab === 'move') document.getElementById('ngExerciseSubtitle').textContent = `${plan.workout} • ${next.session} • adjusted for your ${trainerGoalText()} goal.`;
    if (document.getElementById('ngJourneyGuide')) document.getElementById('ngJourneyGuide').textContent = guide[0];
    if (document.getElementById('ngJourneyModeText') && !localStorage.getItem('journeyMode')) document.getElementById('ngJourneyModeText').textContent = `${guide[1]} is ready. Choose a story mode to start your guided journey.`;
  }
  const routedSetTab = window.setTab;
  window.setTab = function (tab) { routedSetTab(tab); renderTrainerExperience(tab); };
  const existingChooseGuide = window.chooseGuide;
  window.chooseGuide = function (index) {
    if (typeof existingChooseGuide === 'function') existingChooseGuide(index);
    else localStorage.setItem('selectedGuide', String(index));
    localStorage.setItem('ngTrainerChosen', 'true');
    renderTrainerExperience(document.querySelector('.app-nav button.active')?.dataset.tab || 'home');
    if (typeof renderJourneyGuide === 'function') renderJourneyGuide();
    notify(`${activeTrainer().guide[1]} is now your personal trainer`);
  };
  window.changeGuide = function () {
    const picker = document.querySelector('.guide-picker');
    if (picker) { picker.scrollIntoView({ behavior: 'smooth', block: 'center' }); picker.animate([{ boxShadow: '0 0 0 0 #e7a92f00' }, { boxShadow: '0 0 0 8px #e7a92f55' }, { boxShadow: '0 0 0 0 #e7a92f00' }], { duration: 700 }); }
  };
  document.getElementById('form')?.addEventListener('submit', () => setTimeout(() => {
    if (!localStorage.getItem('ngTrainerChosen')) {
      const picker = document.querySelector('.guide-picker');
      if (picker) { picker.scrollIntoView({ behavior: 'smooth', block: 'start' }); picker.animate([{ transform: 'scale(.98)' }, { transform: 'scale(1)' }], { duration: 400 }); }
      const message = document.getElementById('guideMessage');
      if (message) message.textContent = 'Your details are saved. Choose the guide who will plan your meals, workouts, and motivation.';
    }
    renderTrainerExperience(document.querySelector('.app-nav button.active')?.dataset.tab || 'home');
  }, 120));
  document.querySelectorAll('.ng-food-guides').forEach((element) => element.remove());
  document.querySelectorAll('.ng-tab-section .ng-diwali-badge').forEach((element) => element.remove());
  const foodHost = document.querySelector('.food-studio');
  if (foodHost && !foodHost.querySelector('.ng-diwali-badge')) foodHost.insertAdjacentHTML('afterbegin', '<div class="ng-diwali-badge">🪔 Diwali Food Studio <span>Festive favourites with lighter portions and trainer guidance ✨</span></div>');
  renderTrainerExperience(document.querySelector('.app-nav button.active')?.dataset.tab || 'home');

})();

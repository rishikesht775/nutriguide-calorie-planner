(() => {
  'use strict';
  // Versioned, explicit allowlist: never upload auth credentials or arbitrary storage.
  const keys = ['profile','selectedGuide','proteinItems','proteinTarget','journal','reminders','steps','water','weights','grocery','foodLogs','exerciseLogs','nutritionLog','journeyStep','journeyMode','ngMeals','ngGroceries','ngTrainerHistory','ngFavouriteMeals','ngHabits','ngMeasurements','ngFasting','ngPreferences','ngPantry','ngLessonState','ngCoachHistory','ngRecipes','ngMealArchive','ngRecipeDraft','ngPlanSettings','ngWeeklyPlans','ngDailyStats','ngAutoGroceries','ngLogDate','ngPersonalSettings','ngPlanContext'];
  const ownerKey = '_ngCloudOwner';
  let user = null, ready = false, busy = false, queued = false, acknowledged = '', metaKey = '', reading = false, pendingWithoutAck = false;
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const get = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const put = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
  const remove = key => { try { localStorage.removeItem(key); } catch {} };
  const readState = () => {
    const state = {};
    for (const key of keys) { const raw = get(key); if (raw !== null) state[key] = parse(raw, raw); }
    return state;
  };
  const writeState = state => {
    if (!object(state)) return;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(state, key)) put(key, typeof state[key] === 'string' ? state[key] : JSON.stringify(state[key]));
      else remove(key);
    }
  };
  const setStatus = text => { const el = document.getElementById('cloud-sync-status'); if (el) el.textContent = text; };
  const persist = () => {
    if (!metaKey) return;
    put(metaKey, JSON.stringify({ version: 1, acknowledged, pending: readState() }));
  };
  const rerender = () => {
    // Existing legacy models are lexical globals, not window properties.
    try { if (typeof selectedGuide !== 'undefined') selectedGuide = get('selectedGuide') || '5'; } catch {}
    try { if (typeof water !== 'undefined') water = Number(get('water') || 0); } catch {}
    try { if (typeof steps !== 'undefined') steps = Number(get('steps') || 0); } catch {}
    try { if (typeof weights !== 'undefined') weights = parse(get('weights') || '[]', []); } catch {}
    try { if (typeof journal !== 'undefined') journal = parse(get('journal') || '[]', []); } catch {}
    try { if (typeof reminders !== 'undefined') reminders = parse(get('reminders') || '[]', []); } catch {}
    try { if (typeof proteinItems !== 'undefined') proteinItems = parse(get('proteinItems') || '[]', []); } catch {}
    try { if (typeof proteinTarget !== 'undefined') proteinTarget = Number(get('proteinTarget') || 100); } catch {}
    try { if (typeof nutritionLog !== 'undefined') nutritionLog = parse(get('nutritionLog') || '[]', []); } catch {}
    try { if (typeof journeyModeKey !== 'undefined') journeyModeKey = get('journeyMode') || ''; } catch {}
    try { if (typeof journeyStep !== 'undefined') journeyStep = Number(get('journeyStep') || 0); } catch {}
    for (const render of [
      () => { if (typeof renderGuides === 'function') renderGuides(); },
      () => { if (typeof renderProtein === 'function') renderProtein(); },
      () => { if (typeof renderJournal === 'function') renderJournal(); },
      () => { if (typeof renderReminders === 'function') renderReminders(); },
      () => { if (typeof renderGrocery === 'function') renderGrocery(); },
      () => { if (typeof ngRender === 'function') ngRender(); },
      () => { if (typeof renderTracker === 'function') renderTracker(); },
      () => { if (typeof renderNutritionLog === 'function') renderNutritionLog(); },
      () => { if (typeof renderJourneyGuide === 'function') renderJourneyGuide(); },
      () => { if (typeof updateDashboard === 'function') updateDashboard(); },
      () => { if (typeof updateWeeklyStrip === 'function') updateWeeklyStrip(); },
    ]) { try { render(); } catch {} }
    const profile = parse(get('profile') || 'null', null);
    if (object(profile) && document.getElementById('form')) {
      for (const key of ['age','sex','height','weight','activity','goal']) {
        const el = document.getElementById(key); if (el && profile[key] !== undefined) el.value = profile[key];
      }
      try { document.getElementById('form').requestSubmit(); } catch {}
    }
    window.dispatchEvent(new Event('ng:cloud-hydrated'));
  };
  const sync = async (force = false) => {
    if (!user || !ready) return;
    persist();
    if (busy) { queued = true; return; }
    const state = readState(), encoded = JSON.stringify(state);
    if (!force && encoded === acknowledged) return;
    if (encoded.length > 250000) { setStatus('Cloud storage limit reached — export your data'); return; }
    busy = true; queued = false; setStatus('Saving to cloud…');
    try {
      const response = await fetch('/api/state', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state }), cache: 'no-store',
      });
      if (!response.ok) throw new Error('save failed');
      // Acknowledge only the exact successfully sent snapshot. Later edits remain dirty.
      acknowledged = encoded;
      if (JSON.stringify(readState()) !== acknowledged) queued = true;
      persist();
      setStatus(JSON.stringify(readState()) === acknowledged ? 'Cloud synced' : 'Changes waiting to sync');
    } catch { persist(); setStatus('Cloud sync waiting'); }
    finally {
      busy = false;
      if (queued) { queued = false; setTimeout(() => sync(false), 0); }
    }
  };
  const injectBar = me => {
    if (document.getElementById('cloud-account-bar')) return;
    const bar = document.createElement('div'); bar.id = 'cloud-account-bar';
    bar.style.cssText = 'position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;justify-content:flex-end;flex-wrap:wrap;padding:8px 14px;background:#173c31;color:#fff;font:600 12px system-ui;box-shadow:0 4px 14px #173c3130';
    const status = document.createElement('span'); status.id = 'cloud-sync-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); status.textContent = me ? 'Cloud ready' : 'Browser-only until you sign in';
    const text = document.createElement('span'); text.textContent = me ? `Signed in as ${me.name || me.email}` : 'Sign in to save your wellness journey across devices';
    const link = document.createElement(me?.authProvider==='email'?'button':'a'); link.target = '_top'; link.href = me ? '/signout-with-chatgpt?return_to=%2Flegacy.html' : '/account/connected'; link.textContent = me ? 'Sign out' : 'Sign in / Sign up'; link.style.cssText = 'background:#fff;color:#173c31;border-radius:999px;padding:7px 11px;text-decoration:none;font-weight:800';
    if(me?.authProvider==='email'){link.type='button';link.style.width='auto';link.style.margin='0';link.onclick=async()=>{link.disabled=true;try{const response=await fetch('/api/account/logout',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});if(!response.ok)throw Error('logout');location.href='/legacy.html'}catch{setStatus('Sign-out failed — please try again');link.disabled=false}};}bar.append(text,status,link); document.body.prepend(bar);
  };
  const hydrate = async () => {
    if (reading) return false;
    reading = true;
    const before = readState();
    try {
      const response = await fetch('/api/state', { cache: 'no-store' });
      if (!response.ok) throw new Error('state unavailable');
      const data = await response.json();
      if (!object(data.state)) throw new Error('invalid cloud state');
      const cloud = Object.fromEntries(keys.filter(key => Object.prototype.hasOwnProperty.call(data.state,key)).map(key => [key,data.state[key]]));
      const baseline = parse(acknowledged || '{}', {}), current = readState();
      const merged = { ...cloud };
      // Retain edits since the last confirmed cloud snapshot, including edits
      // made while GET was in flight. A fresh device otherwise hydrates cloud data.
      for (const key of keys) {
        const changedSinceAck = (Boolean(acknowledged) && JSON.stringify(before[key]) !== JSON.stringify(baseline[key])) || (pendingWithoutAck && Object.prototype.hasOwnProperty.call(before,key));
        const changedDuringRead = JSON.stringify(current[key]) !== JSON.stringify(before[key]);
        const initialLocal = !Object.keys(cloud).length && Object.prototype.hasOwnProperty.call(current,key);
        if (changedSinceAck || changedDuringRead || initialLocal) {
          if (Object.prototype.hasOwnProperty.call(current,key)) merged[key] = current[key]; else delete merged[key];
        }
      }
      writeState(merged); acknowledged = JSON.stringify(cloud); pendingWithoutAck = false; ready = true; persist(); rerender();
      if (JSON.stringify(readState()) === acknowledged) setStatus('Cloud synced');
      else await sync(false);
      return true;
    } catch { ready = false; pendingWithoutAck = !acknowledged && Object.keys(readState()).length > 0; persist(); setStatus('Cloud unavailable — changes saved on this device'); return false; }
    finally { reading = false; }
  };
  const boot = async () => {
    try {
      const meResponse = await fetch('/api/me', { cache: 'no-store' });
      if (!meResponse.ok) throw new Error('identity unavailable');
      const me = await meResponse.json(); user = me.user || null; injectBar(user);
      if (!user) return;
      const identity = String(user.id || user.email || '');
      if (!identity) { user = null; return; }
      metaKey = `_ngCloudState:${identity}`;
      const previousOwner = get(ownerKey);
      // Keep prior user's unsynced state in their own metadata, never upload it
      // into a newly authenticated account on a shared browser.
      if (previousOwner !== identity) {
        const priorKey = previousOwner ? `_ngCloudState:${previousOwner}` : '_ngUnassignedState';
        const prior = parse(get(priorKey) || '{}', {});
        put(priorKey, JSON.stringify({ ...prior, pending: readState() }));
        for (const key of keys) remove(key);
        // Clear the prior account's visible profile while the new cloud state loads.
        try {
          document.body.classList.remove('post-profile');
          document.body.classList.add('needs-profile');
          document.getElementById('form')?.reset();
          rerender();
        } catch {}
      }
      const metadata = parse(get(metaKey) || '{}', {});
      acknowledged = typeof metadata.acknowledged === 'string' ? metadata.acknowledged : '';
      pendingWithoutAck = !acknowledged && object(metadata.pending) && Object.keys(metadata.pending).length > 0;
      if (previousOwner !== identity && object(metadata.pending)) writeState(metadata.pending);
      put(ownerKey,identity);
      const form = document.getElementById('form');
      form?.addEventListener('submit', () => {
        if (!form.checkValidity()) return;
        const profile = {};
        for (const key of ['age','sex','height','weight','activity','goal']) { const el = document.getElementById(key); if (el) profile[key] = el.value; }
        put('profile',JSON.stringify(profile)); persist(); setTimeout(() => sync(false),300);
      });
      await hydrate();
      window.ngCloudIdentity=identity;window.dispatchEvent(new Event('ng:account-ready'));
      setInterval(() => ready ? sync(false) : hydrate(),3500);
      window.addEventListener('online', () => ready ? sync(false) : hydrate());
      window.addEventListener('pagehide', persist);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') persist(); });
      window.addEventListener('ng:data-changed', () => { persist(); sync(false); });
      window.addEventListener('storage', event => { if (keys.includes(event.key)) { persist(); if (ready) sync(false); } });
    } catch { injectBar(null); setStatus('Cloud unavailable — changes saved on this device'); }
  };
  boot();
})();

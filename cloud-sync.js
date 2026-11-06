(() => {
  const keys = ['profile','selectedGuide','proteinItems','proteinTarget','journal','reminders','steps','water','weights','grocery','foodLogs','exerciseLogs','nutritionLog','journeyStep','journeyMode','ngProfile','ngRecovery','ngDevices','ngGroceryItems','ngExerciseDone','ngTheme','ngTextSize','ngLanguage'];
  const bannerId = 'cloud-account-bar';
  let user = null;
  let hydrated = false;
  let lastSent = '';

  const readState = () => {
    const state = {};
    keys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try { state[key] = JSON.parse(value); } catch { state[key] = value; }
      }
    });
    return state;
  };
  const writeState = (state) => {
    if (!state || typeof state !== 'object') return;
    keys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        const value = state[key];
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });
  };
  const rerender = () => {
    try { if (typeof renderGuides === 'function') renderGuides(); } catch {}
    try { if (typeof renderProtein === 'function') renderProtein(); } catch {}
    try { if (typeof renderJournal === 'function') renderJournal(); } catch {}
    try { if (typeof renderReminders === 'function') renderReminders(); } catch {}
    try { if (typeof renderGrocery === 'function') renderGrocery(); } catch {}
    try { if (typeof renderTracker === 'function') renderTracker(); } catch {}
    try { if (typeof updateDashboard === 'function') updateDashboard(); } catch {}
    try { if (typeof updateWeeklyStrip === 'function') updateWeeklyStrip(); } catch {}
    const profile = JSON.parse(localStorage.getItem('profile') || 'null');
    if (profile && document.getElementById('form')) {
      Object.entries(profile).forEach(([key, value]) => { const el = document.getElementById(key); if (el) el.value = value; });
      try { document.getElementById('form').requestSubmit(); } catch {}
    }
  };
  const sync = async (force = false) => {
    if (!user || !hydrated) return;
    const state = readState();
    const encoded = JSON.stringify(state);
    if (!force && encoded === lastSent) return;
    lastSent = encoded;
    try {
      const response = await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ state }), keepalive: true });
      if (!response.ok) throw new Error('save failed');
      setStatus('Cloud synced');
    } catch { lastSent = ''; setStatus('Cloud sync waiting'); }
  };
  const setStatus = (text) => { const el = document.getElementById('cloud-sync-status'); if (el) el.textContent = text; };
  const injectBar = (me) => {
    if (document.getElementById(bannerId)) return;
    const bar = document.createElement('div');
    bar.id = bannerId;
    bar.style.cssText = 'position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;justify-content:flex-end;flex-wrap:wrap;padding:8px 14px;background:#173c31;color:#fff;font:600 12px system-ui;box-shadow:0 4px 14px #173c3130';
    const status = document.createElement('span'); status.id = 'cloud-sync-status'; status.textContent = me ? 'Cloud ready' : 'Browser-only until you sign in';
    const text = document.createElement('span'); text.textContent = me ? `Signed in as ${me.name || me.email}` : 'Sign in to save your wellness journey across devices';
    const link = document.createElement('a'); link.target = '_top'; link.href = me ? '/signout-with-chatgpt?return_to=%2Flegacy.html' : '/signin-with-chatgpt?return_to=%2Flegacy.html'; link.textContent = me ? 'Sign out' : 'Sign in / Sign up'; link.style.cssText = 'background:#fff;color:#173c31;border-radius:999px;padding:7px 11px;text-decoration:none;font-weight:800';
    bar.append(text, status, link); document.body.prepend(bar);
  };
  const watchProfile = () => {
    const form = document.getElementById('form');
    form?.addEventListener('submit', () => {
      const profile = {};
      ['age','sex','height','weight','activity','goal'].forEach((key) => { const el = document.getElementById(key); if (el) profile[key] = el.value; });
      localStorage.setItem('profile', JSON.stringify(profile));
      setTimeout(() => sync(true), 300);
    });
  };
  const boot = async () => {
    try {
      watchProfile();
      const meResponse = await fetch('/api/me', { cache: 'no-store' });
      const me = await meResponse.json();
      user = me.user;
      injectBar(user);
      if (!user) return;
      const stateResponse = await fetch('/api/state', { cache: 'no-store' });
      if (stateResponse.ok) {
        const data = await stateResponse.json();
        const hasCloudData = Boolean(data.state && Object.keys(data.state).length);
        writeState(data.state || {});
        hydrated = true;
        rerender();
        if (hasCloudData) {
          lastSent = JSON.stringify(readState());
          setStatus('Cloud synced');
        } else {
          lastSent = '';
          setStatus('Saving your local data to cloud');
          await sync(true);
        }
      } else {
        hydrated = true;
        setStatus('Cloud database is initializing');
      }
      setInterval(() => sync(false), 3500);
      window.addEventListener('pagehide', () => sync(true));
    } catch {
      injectBar(null);
    }
  };
  boot();
})();

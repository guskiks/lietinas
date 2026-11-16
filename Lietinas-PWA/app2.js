'use strict';

/* ============================================================ konstantes */
const KEY = 'lietinas-local-v1';
const PREV_KEY = 'lietinas-v2-prev';
const THEME_KEY = 'lietinas-theme';
const DARK_KEY = 'lietinas-dark';
const SNAP_KEY = 'lietinas-v2-snap';
const VER_KEY = 'lietinas-v2-ver-tried';
const BACKUP_KEY = 'lietinas-backup-at';
const SNOOZE_KEY = 'lietinas-backup-snooze';
const BACKUP_DAYS = 7;
const APP_VERSION = '7';

const TABS = [
  { id: 'today',  label: 'Šodien',   icon: 'home' },
  { id: 'tasks',  label: 'Darbi',    icon: 'tasks' },
  { id: 'notes',  label: 'Piezīmes', icon: 'notes' },
  { id: 'habits', label: 'Paradumi', icon: 'habits' },
  { id: 'goals',  label: 'Mērķi',    icon: 'goals' }
];

const QUOTES = [
  'Mazs solis šodien ir liels solis uz priekšu.',
  'Tu vari vairāk, nekā šodien šķiet.',
  'Atceries arī par sevi un savu mieru.',
  'Tavas mazās lietiņas veido lielu dienu.',
  'Lēni un mierīgi — tu visu paspēsi.',
  'Šodien izvēlies vienu lietu, kas iepriecinās tevi.',
  'Miers sākas ar vienu apzinātu elpu.',
  'Dari maz, bet dari ar sirdi.',
  'Skaista diena sākas ar skaistu domu.',
  'Tu esi tuvāk, nekā domā.'
];

/* ================================================================== utils */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const nf = new Intl.NumberFormat('lv-LV', { maximumFractionDigits: 2 });
const curSym = c => (c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : (c || '€'));
const money = (v, c = 'EUR') => nf.format(num(v)) + ' ' + curSym(c);
const dateKey = (d = new Date()) => {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
};
const fmtDate = s => {
  const d = new Date(String(s) + 'T00:00:00');
  return isNaN(d) ? String(s || '') : d.toLocaleDateString('lv-LV', { day: '2-digit', month: 'short' });
};

/* ================================================================= ikonas */
const ICONS = {
  home: '<path d="M3 10.7 12 3l9 7.7"/><path d="M5.5 9.6V21h13V9.6"/><path d="M9.8 21v-6h4.4v6"/>',
  tasks: '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.4"/><path d="m7.9 12.2 2.7 2.7 5.6-5.8"/>',
  notes: '<path d="M6.2 3.4h8.4l4.2 4.2V20a.6.6 0 0 1-.6.6H6.2a.6.6 0 0 1-.6-.6V4a.6.6 0 0 1 .6-.6z"/><path d="M14.4 3.6v4.2h4.2"/><path d="M8.6 12.2h6.8M8.6 16h4.6"/>',
  habits: '<path d="M20.2 12a8.2 8.2 0 1 1-2.9-6.3"/><path d="M20.4 4.2v5.2h-5.2"/>',
  goals: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.1 14.9a1.6 1.6 0 0 0 .32 1.76l.05.05a1.9 1.9 0 1 1-2.69 2.69l-.05-.05a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-.97 1.47V21a1.9 1.9 0 1 1-3.8 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.76.32l-.05.05a1.9 1.9 0 1 1-2.69-2.69l.05-.05a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.47-.97H3a1.9 1.9 0 1 1 0-3.8h.09A1.6 1.6 0 0 0 4.56 9.1a1.6 1.6 0 0 0-.32-1.76l-.05-.05a1.9 1.9 0 1 1 2.69-2.69l.05.05a1.6 1.6 0 0 0 1.76.32h.08A1.6 1.6 0 0 0 9.74 3.5V3a1.9 1.9 0 1 1 3.8 0v.09a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.76-.32l.05-.05a1.9 1.9 0 1 1 2.69 2.69l-.05.05a1.6 1.6 0 0 0-.32 1.76v.08a1.6 1.6 0 0 0 1.47.97H21a1.9 1.9 0 1 1 0 3.8h-.09a1.6 1.6 0 0 0-1.47.97z"/>',
  moon: '<path d="M21 12.9A8.6 8.6 0 1 1 11.1 3a6.7 6.7 0 0 0 9.9 9.9z"/>',
  sun: '<circle cx="12" cy="12" r="4.1"/><path d="M12 2.4v2.2M12 19.4v2.2M4.6 4.6 6.2 6.2M17.8 17.8l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
  search: '<circle cx="11" cy="11" r="6.6"/><path d="m15.9 15.9 4.4 4.4"/>',
  left: '<path d="M15 19.2 7.8 12 15 4.8"/>',
  right: '<path d="m9 4.8 7.2 7.2L9 19.2"/>',
  check: '<path d="m5.2 12.4 4.6 4.6L18.9 7"/>',
  download: '<path d="M12 3.4v11.8"/><path d="m7.6 11 4.4 4.4L16.4 11"/><path d="M4.2 20.6h15.6"/>',
  upload: '<path d="M12 16.2V4.4"/><path d="M7.6 8.8 12 4.4l4.4 4.4"/><path d="M4.2 20.6h15.6"/>',
  heart: '<path d="M12 20.4c-.5 0-1-.2-1.4-.5C6.3 16.2 3 13.1 3 9.2 3 6.1 5.4 4 8.2 4c1.6 0 2.9.8 3.8 2 1-1.2 2.3-2 3.8-2C19.6 4 22 6.1 22 9.2c0 3.9-3.3 7-7.6 10.7-.4.3-.9.5-1.4.5z"/>',
  sparkle: '<path d="M12 3.4l1.7 4.4 4.4 1.7-4.4 1.7L12 15.6l-1.7-4.4L5.9 9.5l4.4-1.7z"/><path d="M18.4 15.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'
};

function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* =================================================================== dati */
function normalize(data) {
  const d = (data && typeof data === 'object') ? data : {};
  const out = { tasks: [], notes: [], habits: [], goals: [], ...d };
  ['tasks', 'notes', 'habits', 'goals'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
  return out;
}

function loadDb() {
  try { return normalize(JSON.parse(localStorage.getItem(KEY) || 'null')); }
  catch (e) { return normalize(null); }
}

let db = loadDb();
const state = {
  tab: 'today',
  theme: 'auto',
  query: { tasks: '', notes: '' },
  cat: { tasks: '', notes: '' }
};

function save() {
  try {
    if (!sessionStorage.getItem(SNAP_KEY)) {
      const raw = localStorage.getItem(KEY);
      if (raw) localStorage.setItem(PREV_KEY, raw);
      sessionStorage.setItem(SNAP_KEY, '1');
    }
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) { toast('Neizdevās saglabāt datus'); }
}

/* ================================================================== tēma */
function resolvedDark() {
  return state.theme === 'dark' || (state.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function applyTheme() {
  const dark = resolvedDark();
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#100d10' : '#fdf6f9');
  const btn = $('#theme-btn');
  if (btn) btn.innerHTML = icon(dark ? 'sun' : 'moon');
}

function setTheme(t) {
  state.theme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
    localStorage.setItem(DARK_KEY, resolvedDark() ? '1' : '0');
  } catch (e) {}
  applyTheme();
}

function initTheme() {
  let t = null;
  try { t = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (t !== 'light' && t !== 'dark' && t !== 'auto') {
    let d = null;
    try { d = localStorage.getItem(DARK_KEY); } catch (e) {}
    t = d === '1' ? 'dark' : 'auto';
  }
  state.theme = t;
  applyTheme();
}

/* ============================================================== palīgi */
function quoteOfDay() {
  const d = new Date();
  const n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return QUOTES[n % QUOTES.length];
}

function categories() {
  const all = [...db.tasks, ...db.notes, ...db.habits, ...db.goals].map(x => x.category).filter(Boolean);
  return [...new Set(all)];
}

/* ------- rezerves kopijas atgādinājums (tikai lokāli, bez servera) ------- */
function dateKeyPlus(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

function backupInfo() {
  let at = null;
  try { at = localStorage.getItem(BACKUP_KEY); } catch (e) {}
  if (!at) return { need: true, never: true, days: 0 };
  const diff = Math.round((new Date(dateKey() + 'T00:00:00') - new Date(String(at) + 'T00:00:00')) / 86400000);
  const days = Math.max(0, Number.isFinite(diff) ? diff : 0);
  return { need: days >= BACKUP_DAYS, never: false, days };
}

function backupSnoozed() {
  try { return (localStorage.getItem(SNOOZE_KEY) || '') > dateKey(); } catch (e) { return false; }
}

function markBackup() {
  try {
    localStorage.setItem(BACKUP_KEY, dateKey());
    localStorage.removeItem(SNOOZE_KEY);
  } catch (e) {}
}

function snoozeBackup() {
  try { localStorage.setItem(SNOOZE_KEY, dateKeyPlus(3)); } catch (e) {}
  render();
}

function hasAnyData() {
  return !!(db.tasks.length || db.notes.length || db.habits.length || db.goals.length);
}

function backupCard(bk) {
  const when = bk.never
    ? 'Vēl nav nevienas rezerves kopijas.'
    : 'Pēdējā kopija pirms ' + bk.days + ' ' + (bk.days === 1 ? 'dienas' : 'dienām') + '.';
  return `<section class="backup-card">
  <div class="backup-ico">${icon('download')}</div>
  <div class="backup-main">
    <b>Rezerves kopija</b>
    <p>${when} Viens pieskāriens — un dati būs Failos vai Notās.</p>
  </div>
  <div class="backup-actions">
    <button class="btn soft sm" data-action="export">Saglabāt kopiju</button>
    <button class="btn ghost sm" data-action="snooze">Vēlāk</button>
  </div>
</section>`;
}

function titlesFor(type, current) {
  return [...new Set((db[type + 's'] || []).map(x => x.title).filter(t => t && t !== current))].slice(-15);
}

function datalist(id, items) {
  return `<datalist id="${id}">${items.map(v => `<option value="${esc(v)}"></option>`).join('')}</datalist>`;
}

function goalPct(g) {
  if (g.money) return Math.max(0, Math.min(100, num(g.target) > 0 ? (num(g.saved) / num(g.target)) * 100 : 0));
  return Math.max(0, Math.min(100, num(g.progress)));
}

function ring(pct, id) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100), gid = 'rg-' + String(id).replace(/[^a-zA-Z0-9_-]/g, '');
  return `<div class="ring-wrap"><svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffa6c6"/><stop offset="1" stop-color="#e15b90"/></linearGradient></defs><circle class="ring-track" cx="32" cy="32" r="${r}"/><circle class="ring-bar" cx="32" cy="32" r="${r}" stroke="url(#${gid})" style="stroke-dasharray:${c.toFixed(1)};stroke-dashoffset:${off.toFixed(1)}"/></svg><b>${Math.round(pct)}%</b></div>`;
}

function weekDots(h) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return `<div class="week">${days.map(d => {
    const on = (h.days || []).includes(dateKey(d));
    return `<i class="dot ${on ? 'on' : ''}" title="${esc(d.toLocaleDateString('lv-LV'))}"></i>`;
  }).join('')}</div>`;
}

const EMOJI = { task: '🌸', note: '📝', habit: '🌿', goal: '🎯' };

function emptyState(title, sub, type) {
  return `<div class="empty"><div class="emoji">${EMOJI[type] || '🌸'}</div><b>${esc(title)}</b><p>${esc(sub)}</p><button class="btn primary sm" data-action="new" data-type="${type}">${icon('plus')} Pievienot</button></div>`;
}

function searchBox(type) {
  return `<div class="search-wrap">${icon('search')}<input class="search" type="search" inputmode="search" placeholder="Meklēt…" value="${esc(state.query[type] || '')}" data-search="${type}" aria-label="Meklēt"></div>`;
}

function chips(type, cats) {
  const active = state.cat[type] || '';
  const all = [''].concat(cats);
  return `<div class="chips" role="group" aria-label="Kategorijas">${all.map(c => `<button class="chip ${active === c ? 'active' : ''}" data-action="filter" data-type="${type}" data-cat="${esc(c)}">${c ? esc(c) : 'Visi'}</button>`).join('')}</div>`;
}

/* ============================================================ komponentes */
function taskRow(t) {
  return `<article class="card item item-task ${t.done ? 'is-done' : ''}" data-search="${esc(((t.title || '') + ' ' + (t.body || '') + ' ' + (t.category || '')).toLowerCase())}" data-cat="${esc(t.category || '')}">
  <button class="check" data-action="toggle" data-type="task" data-id="${esc(t.id)}" aria-pressed="${t.done ? 'true' : 'false'}" aria-label="${t.done ? 'Atzīmēt kā neizpildītu' : 'Atzīmēt kā izpildītu'}">${icon('check')}</button>
  <div class="item-main">
    <h3 class="item-title">${esc(t.title)}</h3>
    ${t.body ? `<p class="item-sub">${esc(t.body)}</p>` : ''}
    ${t.category ? `<span class="tag">${esc(t.category)}</span>` : ''}
  </div>
  <button class="more" data-action="edit" data-type="task" data-id="${esc(t.id)}" aria-label="Rediģēt">${icon('right')}</button>
</article>`;
}

function habitRow(h) {
  const on = (h.days || []).includes(dateKey());
  return `<article class="card item">
  <button class="check" data-action="toggle" data-type="habit" data-id="${esc(h.id)}" aria-pressed="${on ? 'true' : 'false'}" aria-label="Atzīmēt šodienu">${icon('check')}</button>
  <div class="item-main">
    <h3 class="item-title">${esc(h.title)}</h3>
    <p class="item-sub">${esc(h.category || 'Personīgais')}${h.repeat ? ' · ' + esc(h.repeat) : ''}</p>
    ${weekDots(h)}
  </div>
  <button class="more" data-action="edit" data-type="habit" data-id="${esc(h.id)}" aria-label="Rediģēt">${icon('right')}</button>
</article>`;
}

function noteCard(n) {
  return `<article class="note item-note" data-action="edit" data-type="note" data-id="${esc(n.id)}" role="button" tabindex="0" data-search="${esc(((n.title || '') + ' ' + (n.body || '') + ' ' + (n.category || '')).toLowerCase())}" data-cat="${esc(n.category || '')}">
  <h3>${esc(n.title)}</h3>
  ${n.body ? `<p>${esc(n.body)}</p>` : ''}
  <span class="tag">${esc(n.category || 'Personīgais')}</span>
</article>`;
}

function goalCard(g) {
  const pct = goalPct(g);
  if (g.money) {
    const left = Math.max(0, num(g.target) - num(g.saved));
    return `<article class="card goal">
  ${ring(pct, g.id)}
  <div class="goal-main">
    <h3 class="item-title">${esc(g.title)}</h3>
    <p class="item-sub">${money(g.saved, g.currency)} no ${money(g.target, g.currency)}</p>
    <p class="item-sub ${left <= 0 ? 'ok' : ''}">${left > 0 ? 'Atlicis ' + money(left, g.currency) : 'Mērķis sasniegts 🎉'}</p>
    <div class="goal-actions">
      <button class="btn soft sm" data-action="saving" data-id="${esc(g.id)}">${icon('plus')} Pievienot</button>
      <button class="btn ghost sm" data-action="edit" data-type="goal" data-id="${esc(g.id)}">Rediģēt</button>
    </div>
  </div>
</article>`;
  }
  return `<article class="card goal">
  ${ring(pct, g.id)}
  <div class="goal-main">
    <h3 class="item-title">${esc(g.title)}</h3>
    <p class="item-sub">${esc(g.category || 'Personīgais')}</p>
    <div class="bar"><i style="width:${pct}%"></i></div>
  </div>
  <button class="more" data-action="edit" data-type="goal" data-id="${esc(g.id)}" aria-label="Rediģēt">${icon('right')}</button>
</article>`;
}
/* ================================================================ skati */
function viewToday() {
  const open = db.tasks.filter(t => !t.done);
  const done = db.tasks.filter(t => t.done).length;
  const hDone = db.habits.filter(h => (h.days || []).includes(dateKey())).length;
  const savings = db.goals.filter(g => g.money).reduce((s, g) => s + num(g.saved), 0);
  const mainCur = (db.goals.find(g => g.money && g.currency) || {}).currency || 'EUR';
  const taskList = open.slice(0, 4).map(taskRow).join('');
  const habitList = db.habits.slice(0, 4).map(habitRow).join('');
  const bk = backupInfo();

  return `<section class="hero">
    <h1>Sveika, Vika 💗</h1>
    <blockquote class="quote">${esc(quoteOfDay())}</blockquote>
  </section>
  <div class="stat-cards">
    <div class="stat-card"><b>${open.length}</b><span>darbi atlikuši</span></div>
    <div class="stat-card"><b>${hDone}<i>/${db.habits.length}</i></b><span>paradumi šodien</span></div>
    <div class="stat-card"><b class="sm">${db.goals.some(g => g.money) ? money(savings, mainCur) : '—'}</b><span>uzkrāts kopā</span></div>
  </div>
  ${hasAnyData() && bk.need && !backupSnoozed() ? backupCard(bk) : ''}
  <div class="section-head">
    <h2>Šodienas darbi</h2>
    <button class="link" data-action="tab" data-tab="tasks">Visi darbi ${done ? '· ' + done + ' ✓' : ''}</button>
  </div>
  ${open.length ? `<div class="list">${taskList}</div>` : emptyState('Neviens darbs nav atlicis', 'Pievieno jaunu lietiņu un sāc dienu mierīgi.', 'task')}
  ${db.habits.length ? `<div class="section-head"><h2>Paradumi</h2><button class="link" data-action="tab" data-tab="habits">Visi</button></div>
  <div class="list">${habitList}</div>` : ''}`;
}

function viewTasks() {
  const cats = [...new Set(db.tasks.map(t => t.category).filter(Boolean))];
  const list = [...db.tasks].sort((a, b) => Number(!!a.done) - Number(!!b.done));
  return `<div class="page-head">
    <h1>Darbi</h1>
    <p class="page-sub">${db.tasks.filter(t => !t.done).length} atlikuši · ${db.tasks.filter(t => t.done).length} pabeigti</p>
  </div>
  ${searchBox('tasks')}
  ${cats.length ? chips('tasks', cats) : ''}
  <div class="list">${list.map(taskRow).join('') || emptyState('Vēl nav darbu', 'Pirmā lietiņa ir tikai viens solis.', 'task')}</div>
  <p class="no-results" hidden>Nekas neatrasts</p>`;
}

function viewNotes() {
  const cats = [...new Set(db.notes.map(n => n.category).filter(Boolean))];
  return `<div class="page-head">
    <h1>Piezīmes</h1>
    <p class="page-sub">${db.notes.length} ${db.notes.length === 1 ? 'piezīme' : 'piezīmes'}</p>
  </div>
  ${searchBox('notes')}
  ${cats.length ? chips('notes', cats) : ''}
  <div class="grid">${db.notes.map(noteCard).join('') || emptyState('Vēl nav piezīmju', 'Pieraksti domas, kamēr tās svaigas.', 'note')}</div>
  <p class="no-results" hidden>Nekas neatrasts</p>`;
}

function viewHabits() {
  return `<div class="page-head">
    <h1>Paradumi</h1>
    <p class="page-sub">Mazas lietas, kas atkārtojas katru dienu</p>
  </div>
  <div class="list">${db.habits.map(habitRow).join('') || emptyState('Vēl nav paradumu', 'Sāc ar vienu vienkāršu ieradumu.', 'habit')}</div>`;
}

function viewGoals() {
  const moneyGoals = db.goals.filter(g => g.money);
  const total = moneyGoals.reduce((s, g) => s + num(g.saved), 0);
  return `<div class="page-head">
    <h1>Mērķi</h1>
    <p class="page-sub">${db.goals.length ? db.goals.length + ' ' + (db.goals.length === 1 ? 'mērķis' : 'mērķi') : 'Lieli un mazi sapņi'}</p>
  </div>
  ${moneyGoals.length ? `<div class="hint">${icon('sparkle')}<span>Kopā uzkrāts <b>${money(total)}</b> ${moneyGoals.length === 1 ? 'vienā mērķī' : moneyGoals.length + ' mērķos'}</span></div>` : ''}
  <div class="list">${db.goals.map(goalCard).join('') || emptyState('Vēl nav mērķu', 'Sapņo drosmīgi — mēs palīdzēsim soli pa solim.', 'goal')}</div>`;
}

function statsBlock() {
  const total = db.tasks.length;
  const done = db.tasks.filter(t => t.done).length;
  const cats = [...new Set(db.tasks.map(t => t.category).filter(Boolean))];
  const hDone = db.habits.filter(h => (h.days || []).includes(dateKey())).length;
  const moneyGoals = db.goals.filter(g => g.money);

  return `<section class="card">
    <h3 class="card-title">Statistika</h3>
    <div class="stat-line"><span>Darbi pabeigti</span><b>${done}/${total}</b></div>
    <div class="bar lg"><i style="width:${total ? Math.round((done / total) * 100) : 0}%"></i></div>
    ${cats.map(c => {
      const t = db.tasks.filter(x => x.category === c);
      const d = t.filter(x => x.done).length;
      return `<div class="stat-row"><span>${esc(c)}</span><div class="bar"><i style="width:${t.length ? Math.round((d / t.length) * 100) : 0}%"></i></div><b>${d}/${t.length}</b></div>`;
    }).join('')}
    <div class="divider"></div>
    <div class="stat-line"><span>Paradumi šodien</span><b>${hDone}/${db.habits.length}</b></div>
    ${moneyGoals.length ? moneyGoals.map(g => `<div class="stat-line"><span>${esc(g.title)}</span><b>${money(g.saved, g.currency)} / ${money(g.target, g.currency)}</b></div>`).join('') : ''}
  </section>`;
}

function viewSettings() {
  const seg = (v, label) => `<label><input type="radio" name="theme" value="${v}" ${state.theme === v ? 'checked' : ''}><span>${label}</span></label>`;
  return `<button class="back" data-action="tab" data-tab="today">${icon('left')} Atpakaļ uz Lietiņām</button>
  <div class="page-head"><h1>Iestatījumi</h1><p class="page-sub">Izskats, dati un statistika</p></div>
  <section class="card">
    <h3 class="card-title">Izskats</h3>
    <div class="seg" role="radiogroup" aria-label="Izskats">${seg('auto', 'Automātiski')}${seg('light', 'Gaišs')}${seg('dark', 'Tumšs')}</div>
  </section>
  <section class="card">
    <h3 class="card-title">Datu drošība</h3>
    <p class="muted">Tavi dati paliek tikai šajā ierīcē. Saglabā rezerves kopiju failā un vajadzības gadījumā atjauno to.</p>
    <div class="btn-row">
      <button class="btn soft" data-action="export">${icon('download')} Saglabāt</button>
      <button class="btn soft" data-action="import">${icon('upload')} Atjaunot</button>
    </div>
    <button class="btn danger-link" data-action="restore-prev">Atjaunot iepriekšējo stāvokli</button>
  </section>
  ${statsBlock()}
  <p class="footnote">Lietiņas · v2 · dati glabājas lokāli</p>`;
}

const VIEWS = { today: viewToday, tasks: viewTasks, notes: viewNotes, habits: viewHabits, goals: viewGoals, settings: viewSettings };
/* =============================================================== modāls */
let modalSeq = 0;

function openModal(inner, focusField) {
  const m = $('#modal');
  if (!m) return;
  modalSeq++;
  m.innerHTML = `<div class="backdrop" data-action="close"></div>${inner}`;
  m.hidden = false;
  document.body.classList.add('locked');
  requestAnimationFrame(() => m.classList.add('open'));
  if (focusField) setTimeout(() => {
    const i = m.querySelector('input[name="title"], input[name="amount"]');
    if (i) i.focus({ preventScroll: true });
  }, 150);
}

function closeModal() {
  const m = $('#modal');
  if (!m || m.hidden) return;
  const seq = ++modalSeq;
  m.classList.remove('open');
  document.body.classList.remove('locked');
  setTimeout(() => {
    if (seq !== modalSeq) return;
    m.hidden = true;
    m.innerHTML = '';
  }, 200);
}

let toastTimer = null, toastSeq = 0;

function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  const seq = ++toastSeq;
  t.textContent = msg;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (seq !== toastSeq) return;
    t.classList.remove('show');
    setTimeout(() => { if (seq === toastSeq) t.hidden = true; }, 260);
  }, 2200);
}

function confirmTwice(btn, label, fn) {
  if (btn.dataset.confirm === '1') { fn(); return; }
  const old = btn.textContent;
  btn.dataset.confirm = '1';
  btn.textContent = label;
  setTimeout(() => {
    if (btn.isConnected && btn.dataset.confirm === '1') {
      btn.dataset.confirm = '';
      btn.textContent = old;
    }
  }, 3200);
}

/* ================================================================ formas */
function openForm(type, id) {
  const list = db[type + 's'] || [];
  const it = (id && list.find(x => x.id === id)) || {};
  let fields = '';

  if (type === 'task' || type === 'note') {
    fields = `<label class="field"><span>Kategorija</span><input name="category" list="dl-cat" value="${esc(it.category || 'Personīgais')}" placeholder="Personīgais" autocomplete="off"></label>
    <label class="field"><span>${type === 'note' ? 'Piezīme' : 'Apraksts'}</span><textarea name="body" rows="4" placeholder="${type === 'note' ? 'Raksti savas domas…' : 'Kas jādara?'}">${esc(it.body || '')}</textarea></label>`;
  } else if (type === 'habit') {
    fields = `<label class="field"><span>Kategorija</span><input name="category" list="dl-cat" value="${esc(it.category || 'Personīgais')}" placeholder="Personīgais" autocomplete="off"></label>
    <label class="field"><span>Atkārtošanās</span><select name="repeat">${['Katru dienu', 'Darba dienās', 'Katru nedēļu'].map(r => `<option ${(it.repeat || 'Katru dienu') === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>`;
  } else {
    const kind = it.money ? 'money' : 'personal';
    fields = `<div class="field"><span>Veids</span><div class="seg" role="radiogroup" aria-label="Mērķa veids">
      <label><input type="radio" name="kind" value="personal" ${kind === 'personal' ? 'checked' : ''}><span>Personīgais</span></label>
      <label><input type="radio" name="kind" value="money" ${kind === 'money' ? 'checked' : ''}><span>Naudas mērķis</span></label>
    </div></div>
    <label class="field"><span>Kategorija</span><input name="category" list="dl-cat" value="${esc(it.category || 'Personīgais')}" placeholder="Personīgais" autocomplete="off"></label>
    <div class="money-fields">
      <div class="field-row">
        <label class="field"><span>Mērķa summa</span><input name="target" type="number" inputmode="decimal" min="0" step="0.01" value="${num(it.target) || ''}" placeholder="0"></label>
        <label class="field"><span>Jau sakrāts</span><input name="saved" type="number" inputmode="decimal" min="0" step="0.01" value="${num(it.saved) || ''}" placeholder="0"></label>
      </div>
      <label class="field"><span>Valūta</span><select name="currency">${['EUR', 'USD', 'GBP'].map(c => `<option ${(it.currency || 'EUR') === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
    </div>
    <label class="field personal-fields"><span>Progress</span><input name="progress" type="number" inputmode="numeric" min="0" max="100" value="${num(it.progress)}"></label>`;
  }

  const kindAttr = type === 'goal' ? (it.money ? 'money' : 'personal') : '';
  openModal(`<form class="sheet-form" data-type="${type}" data-id="${esc(id || '')}" data-kind="${kindAttr}">
    <div class="sheet-grab"></div>
    <div class="sheet-head"><h2>${id ? 'Rediģēt' : 'Jauns ieraksts'}</h2><button type="button" class="icon-btn ghost" data-action="close" aria-label="Aizvērt">✕</button></div>
    <label class="field"><span>Nosaukums</span><input name="title" list="dl-titles" value="${esc(it.title || '')}" required maxlength="120" autocomplete="off" enterkeyhint="done"></label>
    ${fields}
    ${datalist('dl-titles', titlesFor(type, it.title))}
    ${datalist('dl-cat', categories())}
    <div class="sheet-foot"><button type="button" class="btn ghost" data-action="close">Atcelt</button><button type="submit" class="btn primary">Saglabāt</button></div>
    ${id ? `<button type="button" class="btn danger-link" data-action="delete" data-type="${type}" data-id="${esc(id)}">Dzēst</button>` : ''}
  </form>`, true);
}

function openSaving(id) {
  const g = db.goals.find(x => x.id === id);
  if (!g) return;
  const pct = goalPct(g);
  const left = Math.max(0, num(g.target) - num(g.saved));
  const hist = (g.history || []).slice(-6).reverse();
  openModal(`<form class="sheet-form" data-type="saving" data-id="${esc(g.id)}">
    <div class="sheet-grab"></div>
    <div class="sheet-head"><h2>Pievienot uzkrājumu</h2><button type="button" class="icon-btn ghost" data-action="close" aria-label="Aizvērt">✕</button></div>
    <div class="saving-summary">
      ${ring(pct, 's' + g.id)}
      <div>
        <b>${esc(g.title)}</b>
        <p class="muted">${money(g.saved, g.currency)} no ${money(g.target, g.currency)}</p>
        <p class="muted ${left <= 0 ? 'ok' : ''}">${left > 0 ? 'Atlicis ' + money(left, g.currency) : 'Mērķis sasniegts 🎉'}</p>
      </div>
    </div>
    <label class="field"><span>Summa</span><input name="amount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0" required></label>
    <div class="quick">${[5, 10, 20, 50].map(v => `<button type="button" class="chip" data-action="quick" data-value="${v}">+${v}</button>`).join('')}</div>
    <div class="sheet-foot"><button type="button" class="btn ghost" data-action="close">Atcelt</button><button type="submit" class="btn primary">Pievienot</button></div>
    ${hist.length ? `<p class="muted small">Pēdējie uzkrājumi</p><div class="history">${hist.map(h => `<span class="tag">${esc(fmtDate(h.date))} · +${esc(money(h.amount, g.currency))}</span>`).join('')}</div>` : ''}
  </form>`, true);
}

function onSave(form) {
  const type = form.dataset.type;
  const id = form.dataset.id;
  const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim();
  if (!title) { toast('Ievadi nosaukumu'); return; }

  const list = db[type + 's'];
  let x = id ? list.find(a => a.id === id) : null;
  const isNew = !x;
  if (isNew) x = { id: uid() };

  x.title = title;
  x.category = String(fd.get('category') || '').trim() || 'Personīgais';
  if (type === 'task' || type === 'note') x.body = String(fd.get('body') || '').trim();
  if (type === 'task') x.done = !!x.done;
  if (type === 'habit') { x.days = x.days || []; x.repeat = String(fd.get('repeat') || 'Katru dienu'); }
  if (type === 'goal') {
    const kind = String(fd.get('kind') || 'personal');
    x.money = kind === 'money';
    x.currency = String(fd.get('currency') || 'EUR');
    if (x.money) {
      x.target = num(fd.get('target'));
      x.saved = num(fd.get('saved'));
      x.history = x.history || [];
    } else {
      x.progress = Math.max(0, Math.min(100, num(fd.get('progress'))));
    }
  }
  if (isNew) list.push(x);
  save(); closeModal(); render();
  toast(isNew ? 'Pievienots' : 'Saglabāts');
}

function onSaving(form) {
  const g = db.goals.find(x => x.id === form.dataset.id);
  if (!g) return;
  const n = num(new FormData(form).get('amount'));
  if (!(n > 0)) { toast('Ievadi summu'); return; }
  g.money = true;
  g.saved = num(g.saved) + n;
  g.history = (g.history || []).concat([{ amount: n, date: dateKey() }]);
  save(); closeModal(); render();
  toast('Pievienots ' + money(n, g.currency));
}

/* ============================================================== darbības */
function go(tab) {
  state.tab = tab;
  render();
  window.scrollTo(0, 0);
}

function fabType() {
  return state.tab === 'notes' ? 'note' : state.tab === 'habits' ? 'habit' : state.tab === 'goals' ? 'goal' : 'task';
}

function fabLabel() {
  const t = fabType();
  return t === 'note' ? 'Pievienot piezīmi' : t === 'habit' ? 'Pievienot paradumu' : t === 'goal' ? 'Pievienot mērķi' : 'Pievienot darbu';
}

function toggleItem(type, id) {
  if (type === 'task') {
    const t = db.tasks.find(x => x.id === id);
    if (t) t.done = !t.done;
  } else if (type === 'habit') {
    const h = db.habits.find(x => x.id === id);
    if (h) {
      h.days = h.days || [];
      const k = dateKey(), i = h.days.indexOf(k);
      if (i < 0) h.days.push(k); else h.days.splice(i, 1);
    }
  }
  save(); render();
}

function applyFilters(type) {
  const q = (state.query[type] || '').trim().toLowerCase();
  const c = state.cat[type] || '';
  const sel = type === 'notes' ? '.item-note' : '.item-task';
  let visible = 0;
  $$(sel).forEach(el => {
    const okQ = !q || (el.dataset.search || '').includes(q);
    const okC = !c || el.dataset.cat === c;
    el.hidden = !(okQ && okC);
    if (!el.hidden) visible++;
  });
  const nr = $('.no-results');
  if (nr) nr.hidden = !(q || c) || visible > 0 || $$(sel).length === 0;
}

async function exportBackup() {
  const payload = JSON.stringify({ version: 2, app: 'Lietiņas', data: db }, null, 2);
  const file = new File([payload], 'lietinas-backup.json', { type: 'application/json' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Lietiņas rezerves kopija' });
      markBackup(); render();
      toast('Kopija saglabāta');
      return;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  markBackup(); render();
  toast('Rezerves kopija sagatavota');
}

function onImportFile(e) {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const v = JSON.parse(String(r.result));
      const data = v && v.data ? v.data : v;
      if (!data || typeof data !== 'object') throw new Error('bad');
      db = normalize(data);
      save(); render();
      toast('Dati atjaunoti');
    } catch (err) { toast('Nederīgs backup fails'); }
  };
  r.onerror = () => toast('Neizdevās nolasīt failu');
  r.readAsText(f);
}

function restorePrev(btn) {
  confirmTwice(btn, 'Tiešām atjaunot?', () => {
    let raw = null;
    try { raw = localStorage.getItem(PREV_KEY); } catch (e) {}
    if (!raw) { toast('Nav iepriekšējā stāvokļa'); return; }
    try {
      db = normalize(JSON.parse(raw));
      save(); render();
      toast('Atjaunots iepriekšējais stāvoklis');
    } catch (e) { toast('Neizdevās atjaunot'); }
  });
}

/* ================================================================ render */
function buildNav() {
  const dock = $('#dock');
  if (!dock) return;
  dock.innerHTML = TABS.map(t => `<button data-action="tab" data-tab="${t.id}">${icon(t.icon)}<span>${t.label}</span></button>`).join('');
}

function updateNav() {
  $$('#dock button').forEach(b => {
    const on = b.dataset.tab === state.tab;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
}

function render() {
  const app = $('#app');
  if (!app) return;
  app.innerHTML = (VIEWS[state.tab] || viewToday)();
  app.classList.remove('in');
  void app.offsetWidth;
  app.classList.add('in');
  updateNav();
  const fab = $('#fab');
  if (fab) {
    fab.hidden = state.tab === 'settings';
    fab.setAttribute('aria-label', fabLabel());
  }
  if (state.tab === 'tasks' || state.tab === 'notes') applyFilters(state.tab);
}

/* ================================================================ notikumi */
function onClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  switch (action) {
    case 'tab': go(btn.dataset.tab); break;
    case 'settings': go('settings'); break;
    case 'theme': setTheme(resolvedDark() ? 'light' : 'dark'); render(); break;
    case 'fab': openForm(fabType()); break;
    case 'new': openForm(btn.dataset.type); break;
    case 'edit': openForm(btn.dataset.type, btn.dataset.id); break;
    case 'toggle': toggleItem(btn.dataset.type, btn.dataset.id); break;
    case 'saving': openSaving(btn.dataset.id); break;
    case 'filter': {
      const type = btn.dataset.type;
      state.cat[type] = btn.dataset.cat;
      $$('.chip[data-type="' + type + '"]').forEach(c => c.classList.toggle('active', c.dataset.cat === state.cat[type]));
      applyFilters(type);
      break;
    }
    case 'close': closeModal(); break;
    case 'quick': {
      const form = btn.closest('form');
      const inp = form && form.querySelector('input[name="amount"]');
      if (inp) inp.value = String(num(inp.value) + num(btn.dataset.value));
      break;
    }
    case 'delete': {
      const type = btn.dataset.type, id = btn.dataset.id;
      confirmTwice(btn, 'Tiešām dzēst?', () => {
        db[type + 's'] = db[type + 's'].filter(x => x.id !== id);
        save(); closeModal(); render(); toast('Dzēsts');
      });
      break;
    }
    case 'export': exportBackup(); break;
    case 'snooze': snoozeBackup(); break;
    case 'import': $('#backup-file').click(); break;
    case 'restore-prev': restorePrev(btn); break;
  }
}

function onSubmit(e) {
  const form = e.target.closest('form[data-type]');
  if (!form) return;
  e.preventDefault();
  if (form.dataset.type === 'saving') onSaving(form); else onSave(form);
}

function onInput(e) {
  const inp = e.target.closest('input[data-search]');
  if (!inp) return;
  state.query[inp.dataset.search] = inp.value;
  applyFilters(inp.dataset.search);
}

function onChange(e) {
  const theme = e.target.closest('input[name="theme"]');
  if (theme) { setTheme(theme.value); render(); return; }
  if (e.target.name === 'kind') {
    const form = e.target.closest('form');
    if (form) form.dataset.kind = e.target.value;
  }
}

function onKey(e) {
  if (e.key === 'Escape') { closeModal(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-action]')) {
    e.preventDefault();
    e.target.click();
  }
}

/* =================================================================== PWA */
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    const m = $('#modal');
    if (!m || m.hidden) location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then(r => { r.update(); setInterval(() => r.update(), 3600000); })
    .catch(() => {});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then(r => r && r.update()).catch(() => {});
    }
  });
}

function checkVersion() {
  fetch('version.json?' + Date.now(), { cache: 'no-store' })
    .then(r => r.json())
    .then(v => {
      const ver = v && v.version;
      if (!ver) return;
      if (ver === APP_VERSION) {
        try { sessionStorage.removeItem(VER_KEY); } catch (e) {}
        return;
      }
      let tried = null;
      try { tried = sessionStorage.getItem(VER_KEY); } catch (e) {}
      if (tried === ver) return;
      try { sessionStorage.setItem(VER_KEY, ver); } catch (e) {}
      location.reload();
    })
    .catch(() => {});
}

/* ================================================================== start */
function init() {
  initTheme();
  const brand = $('#brand-mark'); if (brand) brand.innerHTML = icon('heart');
  const gear = $('#settings-btn'); if (gear) gear.innerHTML = icon('gear');
  const fab = $('#fab'); if (fab) fab.innerHTML = icon('plus');

  buildNav();
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', onKey);
  const file = $('#backup-file');
  if (file) file.addEventListener('change', onImportFile);

  render();
  registerSW();
  checkVersion();

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', () => { if (state.theme === 'auto') applyTheme(); });
}

init();

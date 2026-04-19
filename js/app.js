/* ═══════════════════════════════════════════
   NUTRIMOVE — app.js
   Prototip P3 — FHiC 25-26, Grup AF1
   ═══════════════════════════════════════════ */

'use strict';

// ── STATE ──────────────────────────────────

const DAYS_ABBR  = ['Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const DAYS_FULL  = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
const DATES      = ['14', '15', '16', '17', '18', '19', '20'];
const TODAY_IDX  = 1; // Dimarts = index 1

const SESSION_TYPES = [
  { id: 'cycling',  name: 'Ciclisme',      icon: '🚴', matIcon: 'directions_bike' },
  { id: 'swim',     name: 'Natació',        icon: '🏊', matIcon: 'pool' },
  { id: 'force',    name: 'Força',          icon: '🏋️', matIcon: 'fitness_center' },
  { id: 'double',   name: 'Sessió doble',   icon: '⚡', matIcon: 'bolt' },
  { id: 'cardio',   name: 'Cardio',         icon: '🏃', matIcon: 'directions_run' },
  { id: 'yoga',     name: 'Flexibilitat',   icon: '🧘', matIcon: 'self_improvement' },
];

let state = {
  sessions: [
    { day: 0, typeId: 'force',   name: 'Força',     durationH: 1, durationM: 0,  intensity: 'Moderada', icon: '🏋️' },
    null,
    null,
    { day: 3, typeId: 'swim',    name: 'Natació',   durationH: 0, durationM: 45, intensity: 'Moderada', icon: '🏊' },
    null,
    { day: 5, typeId: 'cycling', name: 'Ciclisme',  durationH: 2, durationM: 0,  intensity: 'Alta',     icon: '🚴' },
    null,
  ],
  meals: [
    { kcal: 1820, status: 'ok',      adjusted: false },
    { kcal: 1750, status: 'ok',      adjusted: false },
    { kcal: 1760, status: 'ok',      adjusted: false },
    { kcal: 1900, status: 'ok',      adjusted: false },
    { kcal: 1650, status: 'ok',      adjusted: false },
    { kcal: 2100, status: 'warning', adjusted: false },
    { kcal: 1800, status: 'ok',      adjusted: false },
  ],
  editingDay: null,
  addingDay: null,
  // Edit panel temp values
  editTypeId: 'cycling',
  editDurH: 2,
  editDurM: 0,
  editIntensity: 'Alta',
  // Add modal temp values
  addTypeId: 'force',
  addDurH: 1,
  addDurM: 0,
  addIntensity: 'Moderada',
  // UI state
  aiBannerVisible: false,
  popoverVisible: false,
  drawerVisible: false,
};

// ── INIT ──────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  renderDayHeaders();
  renderSessionCells();
  renderMealCells();
  renderFooterCells();
  updateWeekStats();
  initEditPanel();
  initAddModal();
  initPopover();
  initDrawer();
  initBanner();
  initMiscButtons();
});

// ── NAVIGATION ────────────────────────────

function initNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPage(link.dataset.page);
    });
  });
}

function switchPage(page) {
  document.querySelectorAll('.nav-item[data-page]').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${page}`);
  });
  const titles = {
    dashboard: 'Dashboard setmanal',
    sessions:  'Les meves sessions',
    apats:     'Els meus àpats',
    consells:  'Consells',
    progres:   'Progrés',
    jo:        'Jo',
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  const weekEls = document.getElementById('weekLabel').parentElement.parentElement;
  const statsEl = document.getElementById('weeklyStats');
  const saveBtnEl = document.getElementById('saveWeekBtn');
  if (page === 'dashboard') {
    weekEls.style.display = '';
    statsEl.style.display = '';
    saveBtnEl.style.display = '';
  } else {
    weekEls.style.display = 'none';
    statsEl.style.display = 'none';
    saveBtnEl.style.display = 'none';
  }
}

// ── RENDER CALENDAR ────────────────────────

function renderDayHeaders() {
  const container = document.getElementById('dayHeaders');
  container.innerHTML = DAYS_ABBR.map((abbr, i) => `
    <div class="day-header ${i === TODAY_IDX ? 'today' : ''}">
      <div class="day-abbr">${abbr}</div>
      <div class="day-date-num">${DATES[i]}</div>
    </div>
  `).join('');
}

function renderSessionCells() {
  const container = document.getElementById('sessionCells');
  container.innerHTML = '';
  state.sessions.forEach((sess, i) => {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.dataset.day = i;
    if (sess) {
      cell.innerHTML = buildSessionBlock(sess, i);
      cell.querySelector('.session-block').addEventListener('click', () => openEditPanel(i));
    } else {
      cell.innerHTML = `<button class="add-session-btn" data-day="${i}">
        <span class="material-icons-round">add</span>
        <span>Afegir</span>
      </button>`;
      cell.querySelector('.add-session-btn').addEventListener('click', () => openAddModal(i));
    }
    container.appendChild(cell);
  });
}

function buildSessionBlock(sess, idx) {
  const intClass = sess.intensity.toLowerCase();
  const isHighLoad = sess.typeId === 'double' || (sess.intensity === 'Alta' && sess.durationH >= 3);
  const highLoadClass = isHighLoad ? ' high-load' : '';
  const intBadgeClass = isHighLoad ? 'warning' : intClass;
  const intLabel = isHighLoad ? '⚠ Càrrega alta' : sess.intensity;
  const durStr = formatDur(sess.durationH, sess.durationM);
  const highBadge = isHighLoad ? `
    <div class="high-load-badge">
      <span class="material-icons-round">warning</span>Càrrega alta
    </div>` : '';
  return `
    <div class="session-block intensity-${intClass}${highLoadClass}" data-day="${idx}">
      <span class="session-icon">${sess.icon}</span>
      <div class="session-name">${sess.name}</div>
      <div class="session-meta">
        <span class="session-dur">${durStr}</span>
        <span class="int-badge ${intBadgeClass}">${isHighLoad ? '🔥 Alta' : sess.intensity}</span>
      </div>
      ${highBadge}
    </div>`;
}

function renderMealCells() {
  const container = document.getElementById('mealCells');
  container.innerHTML = '';
  state.meals.forEach((meal, i) => {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.dataset.day = i;
    const dotClass = meal.status === 'ok' ? '' : ` ${meal.status}`;
    const adjClass = meal.adjusted ? ' adjusted' : '';
    cell.innerHTML = `
      <div class="meal-block">
        <div class="meal-kcal">${meal.kcal.toLocaleString('ca')}<span class="meal-kcal-label"> kcal</span></div>
        <div class="meal-indicators">
          <div class="meal-dot${dotClass}${adjClass}" title="Esmorzar"></div>
          <div class="meal-dot${dotClass}${adjClass}" title="Dinar"></div>
          <div class="meal-dot${meal.status === 'warning' ? ' warning' : ''}${adjClass}" title="Sopar"></div>
        </div>
        <div class="macro-mini-bar">
          <div class="macro-mini-seg" style="width:35%;background:#10B981"></div>
          <div class="macro-mini-seg" style="width:40%;background:#3B82F6"></div>
          <div class="macro-mini-seg" style="width:20%;background:#F59E0B"></div>
        </div>
      </div>`;
    container.appendChild(cell);
  });
}

function renderFooterCells() {
  const container = document.getElementById('footerCells');
  container.innerHTML = state.meals.map((meal, i) => {
    const sess = state.sessions[i];
    const status = meal.adjusted ? 'ok' : meal.status;
    const label = status === 'ok' ? '✓ Cobert' : '⚠ Revisar';
    const cls = status === 'ok' ? 'ok' : 'warning';
    return `
      <div class="footer-cell">
        <div class="footer-kcal">${meal.kcal.toLocaleString('ca')}</div>
        <div class="footer-status ${cls}">${label}</div>
      </div>`;
  }).join('');
}

function updateWeekStats() {
  const total = state.sessions.filter(Boolean).length;
  document.getElementById('totalSessions').textContent = `${total} sessió${total !== 1 ? 'ns' : ''}`;
  const avgKcal = Math.round(state.meals.reduce((a, m) => a + m.kcal, 0) / 7);
  document.getElementById('totalKcal').textContent = `≈ ${avgKcal.toLocaleString('ca')} kcal/dia`;
}

function refreshCalendar() {
  renderSessionCells();
  renderMealCells();
  renderFooterCells();
  updateWeekStats();
}

// ── EDIT PANEL (Task 1) ────────────────────

function initEditPanel() {
  document.getElementById('panelOverlay').addEventListener('click', closeEditPanel);
  document.getElementById('closePanel').addEventListener('click', closeEditPanel);
  document.getElementById('cancelEdit').addEventListener('click', closeEditPanel);
  document.getElementById('saveSession').addEventListener('click', saveSessionEdit);

  document.getElementById('durMinus').addEventListener('click', () => adjustDuration(-1, false));
  document.getElementById('durPlus').addEventListener('click',  () => adjustDuration( 1, false));

  document.querySelectorAll('#intensityButtons .int-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#intensityButtons .int-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.editIntensity = btn.dataset.int;
    });
  });
}

function openEditPanel(dayIdx) {
  const sess = state.sessions[dayIdx];
  if (!sess) return;
  state.editingDay = dayIdx;
  state.editTypeId = sess.typeId;
  state.editDurH   = sess.durationH;
  state.editDurM   = sess.durationM;
  state.editIntensity = sess.intensity;

  document.getElementById('panelTitle').textContent = `Edita — ${DAYS_FULL[dayIdx]}`;

  // Render type selector
  const typeContainer = document.getElementById('sessionTypeSelect');
  typeContainer.innerHTML = SESSION_TYPES.map(t => `
    <div class="session-type-option ${t.id === state.editTypeId ? 'selected' : ''}" data-type="${t.id}">
      <span class="type-icon">${t.icon}</span> ${t.name}
    </div>`).join('');
  typeContainer.querySelectorAll('.session-type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      typeContainer.querySelectorAll('.session-type-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.editTypeId = opt.dataset.type;
    });
  });

  updateDurDisplay(false);
  // Set intensity active
  document.querySelectorAll('#intensityButtons .int-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.int === state.editIntensity);
  });

  document.getElementById('editPanel').classList.add('open');
  document.getElementById('panelOverlay').classList.add('active');
}

function closeEditPanel() {
  document.getElementById('editPanel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('active');
  state.editingDay = null;
}

function adjustDuration(delta, isAdd) {
  const hKey = isAdd ? 'addDurH' : 'editDurH';
  const mKey = isAdd ? 'addDurM' : 'editDurM';
  let totalMin = state[hKey] * 60 + state[mKey] + delta * 30;
  totalMin = Math.max(30, Math.min(totalMin, 480));
  state[hKey] = Math.floor(totalMin / 60);
  state[mKey] = totalMin % 60;
  updateDurDisplay(isAdd);
}

function updateDurDisplay(isAdd) {
  const h = isAdd ? state.addDurH : state.editDurH;
  const m = isAdd ? state.addDurM : state.editDurM;
  const prefix = isAdd ? 'add' : '';
  document.getElementById(`${prefix}durValue`).textContent = h;
  document.getElementById(`${prefix}durMins`).textContent = m === 0 ? '00 min' : `${m} min`;
}

function saveSessionEdit() {
  const day = state.editingDay;
  if (day === null) return;
  const typeObj = SESSION_TYPES.find(t => t.id === state.editTypeId) || SESSION_TYPES[0];

  state.sessions[day] = {
    day,
    typeId:     state.editTypeId,
    name:       typeObj.name,
    durationH:  state.editDurH,
    durationM:  state.editDurM,
    intensity:  state.editIntensity,
    icon:       typeObj.icon,
  };

  closeEditPanel();
  refreshCalendar();

  // Check if AI suggestion needed (long high intensity session)
  const sess = state.sessions[day];
  const totalMin = sess.durationH * 60 + sess.durationM;
  const needsAI = sess.intensity === 'Alta' && totalMin >= 180;

  if (needsAI) {
    // Mark the meal as warning
    if (day > 0) state.meals[day - 1].status = 'warning';
    state.meals[day].status = 'warning';
    renderMealCells();
    renderFooterCells();
    setTimeout(() => showAIPopover(day), 400);
  } else {
    showToast('Sessió actualitzada correctament', 'check_circle');
  }
}

// ── ADD SESSION MODAL (Task 2) ─────────────

function initAddModal() {
  document.getElementById('closeAddModal').addEventListener('click', closeAddModal);
  document.getElementById('cancelAddModal').addEventListener('click', closeAddModal);
  document.getElementById('confirmAddSession').addEventListener('click', confirmAddSession);
  document.getElementById('addDurMinus').addEventListener('click', () => adjustDuration(-1, true));
  document.getElementById('addDurPlus').addEventListener('click',  () => adjustDuration( 1, true));
  document.getElementById('addModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAddModal();
  });
  document.querySelectorAll('#addIntensityButtons .int-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#addIntensityButtons .int-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.addIntensity = btn.dataset.int;
    });
  });
}

function openAddModal(dayIdx) {
  state.addingDay = dayIdx;
  state.addTypeId = 'force';
  state.addDurH = 1;
  state.addDurM = 0;
  state.addIntensity = 'Moderada';

  document.getElementById('addModalDay').textContent = DAYS_FULL[dayIdx];
  updateDurDisplay(true);

  const grid = document.getElementById('addSessionTypeGrid');
  grid.innerHTML = SESSION_TYPES.map(t => `
    <div class="session-type-option ${t.id === 'force' ? 'selected' : ''}" data-type="${t.id}">
      <span class="type-icon">${t.icon}</span> ${t.name}
    </div>`).join('');
  grid.querySelectorAll('.session-type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      grid.querySelectorAll('.session-type-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.addTypeId = opt.dataset.type;
    });
  });

  document.querySelectorAll('#addIntensityButtons .int-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.int === 'Moderada');
  });

  document.getElementById('addModalOverlay').classList.remove('hidden');
}

function closeAddModal() {
  document.getElementById('addModalOverlay').classList.add('hidden');
  state.addingDay = null;
}

function confirmAddSession() {
  const day = state.addingDay;
  if (day === null) return;
  const typeObj = SESSION_TYPES.find(t => t.id === state.addTypeId) || SESSION_TYPES[0];

  state.sessions[day] = {
    day,
    typeId:    state.addTypeId,
    name:      typeObj.name,
    durationH: state.addDurH,
    durationM: state.addDurM,
    intensity: state.addIntensity,
    icon:      typeObj.icon,
  };

  closeAddModal();
  refreshCalendar();

  // Check for high load double session → show AI banner
  const isDouble = state.addTypeId === 'double';
  const totalMin = state.addDurH * 60 + state.addDurM;
  const isHighLoad = isDouble || (state.addIntensity === 'Alta' && totalMin >= 180);

  if (isHighLoad) {
    state.meals[day].status = 'warning';
    if (day > 0) state.meals[day - 1].status = 'warning';
    renderMealCells();
    renderFooterCells();
    showBanner();
    showToast('Sessió afegida — Revisa la nutrició ⚠', 'warning');
  } else {
    showToast('Sessió afegida correctament', 'check_circle');
  }
}

// ── AI POPOVER (Task 1 — after edit) ──────

function initPopover() {
  document.getElementById('popoverClose').addEventListener('click', hidePopover);
  document.getElementById('popoverDismiss').addEventListener('click', () => {
    hidePopover();
    showToast('Canvis desats. Revisa la nutrició quan vulguis.', 'info');
  });
  document.getElementById('popoverApply').addEventListener('click', applyPopoverAdjustment);
}

function showAIPopover(dayIdx) {
  const popover = document.getElementById('aiPopover');

  // Position popover near the session block
  const cells = document.querySelectorAll('#sessionCells .day-cell');
  const targetCell = cells[dayIdx];
  if (targetCell) {
    const rect = targetCell.getBoundingClientRect();
    const mainEl = document.querySelector('.main');
    const mainRect = mainEl.getBoundingClientRect();
    let top  = rect.bottom + 8;
    let left = rect.left - mainRect.left + 200; // offset for sidebar
    // Ensure popover stays within viewport
    if (left + 310 > window.innerWidth) left = window.innerWidth - 320;
    popover.style.top  = `${top}px`;
    popover.style.left = `${left}px`;
  } else {
    popover.style.top  = '120px';
    popover.style.left = '240px';
  }

  const sess = state.sessions[dayIdx];
  const dur = formatDur(sess.durationH, sess.durationM);
  const extraKcal = Math.round((sess.durationH * 60 + sess.durationM) * 8.5);
  document.getElementById('popoverMsg').textContent =
    `La ruta de demà (${dur}, ${sess.intensity}) requereix energia extra. Afegeix hidrats (ex: arròs o pasta) al teu sopar d'avui.`;
  document.getElementById('popoverAnalysis').textContent =
    `Sessió ${dur} ${sess.intensity} → +${extraKcal} kcal necessàries. Dèficit detectat al sopar de ${DAYS_FULL[dayIdx > 0 ? dayIdx - 1 : dayIdx]}.`;

  state.popoverVisible = true;
  state._popoverDay = dayIdx;
  popover.classList.remove('hidden');
}

function hidePopover() {
  document.getElementById('aiPopover').classList.add('hidden');
  state.popoverVisible = false;
}

function applyPopoverAdjustment() {
  const day = state._popoverDay;
  // Apply nutritional adjustments
  if (day !== null) {
    state.meals[day].kcal += 350;
    state.meals[day].status = 'ok';
    state.meals[day].adjusted = true;
    if (day > 0) {
      state.meals[day - 1].kcal += 200;
      state.meals[day - 1].status = 'ok';
      state.meals[day - 1].adjusted = true;
    }
  }
  hidePopover();
  refreshCalendar();
  showToast('Fet! Nutrició ajustada automàticament ✓', 'check_circle');
}

// ── AI BANNER (Task 2 trigger) ─────────────

function initBanner() {
  document.getElementById('closeBanner').addEventListener('click', () => {
    document.getElementById('aiBanner').classList.add('hidden');
  });
  document.getElementById('reviewNutrition').addEventListener('click', openAIDrawer);
}

function showBanner() {
  document.getElementById('aiBanner').classList.remove('hidden');
  state.aiBannerVisible = true;
}

// ── AI DRAWER (Task 2) ─────────────────────

function initDrawer() {
  document.getElementById('closeDrawer').addEventListener('click', closeAIDrawer);
  document.getElementById('dismissDrawer').addEventListener('click', closeAIDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeAIDrawer);
  document.getElementById('applyAllAdjustments').addEventListener('click', applyAllAdjustments);
  document.getElementById('applyPartial').addEventListener('click', () => {
    showToast('Selecciona quins ajustos vols aplicar...', 'tune');
    closeAIDrawer();
  });
}

function openAIDrawer() {
  document.getElementById('aiDrawer').classList.remove('hidden');
  document.getElementById('drawerOverlay').classList.remove('hidden');
  state.drawerVisible = true;
}

function closeAIDrawer() {
  document.getElementById('aiDrawer').classList.add('hidden');
  document.getElementById('drawerOverlay').classList.add('hidden');
  state.drawerVisible = false;
}

function applyAllAdjustments() {
  // Apply nutritional adjustments for Wednesday high-load scenario
  // Adjust Tuesday evening and Wednesday meals
  state.meals[1].kcal = Math.round(state.meals[1].kcal * 1.15);
  state.meals[1].status = 'ok';
  state.meals[1].adjusted = true;

  state.meals[2].kcal = Math.round(state.meals[2].kcal * 1.18);
  state.meals[2].status = 'ok';
  state.meals[2].adjusted = true;

  // Fix any warning days adjacent to sessions
  state.meals.forEach((meal, i) => {
    if (meal.status === 'warning') {
      state.meals[i].status = 'ok';
      state.meals[i].adjusted = true;
      state.meals[i].kcal = Math.round(state.meals[i].kcal * 1.12);
    }
  });

  closeAIDrawer();
  document.getElementById('aiBanner').classList.add('hidden');
  refreshCalendar();
  showToast('Nutrició de la setmana ajustada! Tots els dies coberts ✓', 'check_circle');
}

// ── MISC BUTTONS ──────────────────────────

function initMiscButtons() {
  document.getElementById('saveWeekBtn').addEventListener('click', () => {
    showToast('Setmana desada correctament ✓', 'save');
  });
  document.getElementById('prevWeek').addEventListener('click', () => {
    document.getElementById('weekLabel').textContent = '7 – 13 Abr 2026';
    showToast('Setmana anterior carregada', 'navigate_before');
  });
  document.getElementById('nextWeek').addEventListener('click', () => {
    document.getElementById('weekLabel').textContent = '21 – 27 Abr 2026';
    showToast('Setmana següent carregada', 'navigate_next');
  });
}

// ── UTILS ──────────────────────────────────

function formatDur(h, m) {
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

let toastTimer = null;
function showToast(msg, icon = 'check_circle') {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = icon;
  toast.classList.remove('hidden');
  // Force reflow
  toast.getBoundingClientRect();
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 320);
  }, 3200);
}

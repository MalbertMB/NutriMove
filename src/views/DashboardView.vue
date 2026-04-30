<template>
  <div class="dashboard">
    <!-- Topbar -->
    <AppTopBar
      title="Inici"
      :subtitle="weekLabel"
      :show-week-nav="true"
      :show-save="true"
      :week-label="weekLabel"
      @prev-week="weekOffset--"
      @next-week="weekOffset++"
      @save="handleSave"
    />

    <SectionNav
      :items="[
        { label: 'Setmana', target: 'dashboard-calendar', icon: 'calendar_month' },
        { label: 'Avui', target: 'dashboard-today', icon: 'today' },
        { label: 'Biblioteca', target: 'dashboard-library', icon: 'library_books' }
      ]"
    />

    <!-- KPI strip -->
    <div class="kpi-strip">
      <StatCard
        icon="fitness_center"
        label="Sessions setmanals"
        :value="totals.totalSessions"
        :meta="`Objectiu: 5 sessions`"
        :trend="{ dir: 'up', label: '+1 vs. setmana passada' }"
        :delay="0"
      />
      <StatCard
        icon="local_fire_department"
        label="Kcal cremades"
        :value="totals.totalKcalBurned"
        unit="kcal"
        :meta="`Setmana en curs`"
        icon-bg="rgba(239,68,68,0.1)"
        icon-color="#EF4444"
        :delay="60"
      />
      <StatCard
        icon="warning"
        label="Dies de càrrega alta"
        :value="totals.highLoadDays"
        :meta="totals.highLoadDays > 0 ? 'Reviseu la nutrició' : 'Tot correcte'"
        icon-bg="rgba(255,122,53,0.1)"
        icon-color="var(--warning)"
        :delay="120"
      />
      <StatCard
        icon="check_circle"
        label="Nutrició coberta"
        :value="coveredDays"
        unit="/ 7 dies"
        :meta="coveredDays === 7 ? 'Setmana completa ✓' : 'Ajusta els àpats pendents'"
        :delay="180"
      />
    </div>

    <!-- Main content: Calendar + library sidebar -->
    <div class="dashboard__main">
      <!-- Library sidebar -->
      <aside id="dashboard-library" class="dashboard__library" tabindex="-1">
        <SessionLibrary @add-session="handleAddFromLibrary" />

        <!-- High-load alert banner -->
        <transition name="fade">
          <div v-if="highLoadDaysList.length > 0" class="alert-banner">
            <div class="alert-banner__header">
              <span class="material-symbols-rounded icon-fill" aria-hidden="true">warning</span>
              Revisió nutricional
            </div>
            <p class="alert-banner__text">
              {{ highLoadDaysList.map(d => weekStore.daysFull[d]).join(', ') }}
              {{ highLoadDaysList.length === 1 ? 'té' : 'tenen' }} càrrega alta. L'assistent IA pot ajustar la nutrició automàticament.
            </p>
            <button class="alert-banner__cta" @click="openWeekAIDrawer">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              Revisar nutrició amb IA
            </button>
          </div>
        </transition>

        <!-- Quick add form -->
        <div id="dashboard-today" class="quick-add">
          <div class="quick-add__header">
            <span class="material-symbols-rounded">add_circle</span>
            Afegir sessió ràpida
          </div>
          <div class="field">
            <label class="field__label" for="qa-day">Dia</label>
            <select id="qa-day" v-model="qaDay" class="field__select">
              <option v-for="(day, i) in weekStore.daysFull" :key="i" :value="i">{{ day }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="qa-type">Tipus</label>
            <select id="qa-type" v-model="qaType" class="field__select">
              <option v-for="(t, key) in weekStore.sessionTypes" :key="key" :value="key">{{ t.label }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="qa-dur">Intensitat</label>
            <select id="qa-dur" v-model="qaIntensity" class="field__select">
              <option value="Baixa">Baixa</option>
              <option value="Moderada">Moderada</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
          <button class="btn btn--primary btn--full" @click="handleQuickAdd">
            <span class="material-symbols-rounded">add</span>
            Nova sessió
          </button>
        </div>
      </aside>

      <!-- Calendar -->
      <div id="dashboard-calendar" class="dashboard__cal" tabindex="-1">
        <WeekCalendar
          :week-offset="weekOffset"
          @drop-session="handleDropSession"
        />

        <!-- Week summary footer -->
        <div class="week-summary">
          <div class="summary-item">
            <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">fitness_center</span>
            <strong>{{ totals.totalSessions }}</strong> sessions
          </div>
          <div class="summary-sep" aria-hidden="true">·</div>
          <div class="summary-item">
            <span class="material-symbols-rounded icon-fill" style="color:#EF4444">local_fire_department</span>
            <strong>{{ totals.totalKcalBurned }}</strong> kcal cremades
          </div>
          <div class="summary-sep" aria-hidden="true">·</div>
          <div class="summary-item" :class="{ 'summary-item--warn': coveredDays < 7 }">
            <span class="material-symbols-rounded icon-fill" :style="{ color: coveredDays === 7 ? 'var(--accent)' : 'var(--warning)' }">restaurant</span>
            Nutrició coberta <strong>{{ coveredDays }} / 7</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlays -->
    <SessionEditPanel />
    <AIPopover />
    <AIDrawer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import SectionNav from '@/components/ui/SectionNav.vue'
import WeekCalendar from '@/components/dashboard/WeekCalendar.vue'
import SessionLibrary from '@/components/session/SessionLibrary.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import SessionEditPanel from '@/components/session/SessionEditPanel.vue'
import AIPopover from '@/components/ai/AIPopover.vue'
import AIDrawer from '@/components/ai/AIDrawer.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()

const weekOffset = ref(0)
const qaDay = ref(0)
const qaType = ref('cycling')
const qaIntensity = ref('Moderada')

const weekLabel = computed(() => {
  const today = new Date()
  const startOfWeek = new Date(today)
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  startOfWeek.setDate(today.getDate() - dayOfWeek + weekOffset.value * 7)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
  return `${fmt(startOfWeek)} – ${fmt(endOfWeek)}`
})

const totals = computed(() => weekStore.getWeekTotals())

const coveredDays = computed(() => {
  return weekStore.meals.filter(m => m.status === 'ok').length
})

const highLoadDaysList = computed(() => {
  return weekStore.meals
    .map((m, i) => ({ i, m }))
    .filter(({ m }) => m.status === 'warning')
    .map(({ i }) => i)
})

function handleDropSession({ dayIndex, type }) {
  const session = weekStore.addSession(dayIndex, type, 60, 'Moderada')
  uiStore.openEditPanel(session.id)
  uiStore.showToast(`Sessió "${weekStore.sessionTypes[type].label}" afegida el ${weekStore.daysFull[dayIndex]}.`, 'success')
}

function handleAddFromLibrary({ type, day }) {
  weekStore.addSession(day, type)
}

function handleQuickAdd() {
  const session = weekStore.addSession(qaDay.value, qaType.value, 60, qaIntensity.value)
  uiStore.showToast(`Sessió afegida el ${weekStore.daysFull[qaDay.value]}.`, 'success')
  if (qaIntensity.value === 'Alta') {
    setTimeout(() => uiStore.openEditPanel(session.id), 300)
  }
}

function openWeekAIDrawer() {
  const highDays = highLoadDaysList.value
  const startDay = Math.max(0, Math.min(...highDays) - 1)
  const endDay = Math.max(...highDays)

  uiStore.showAIDrawer({
    day: highDays.map(d => weekStore.daysFull[d]).join(', '),
    totalKcal: highDays.reduce((s, d) => s + (weekStore.sessionsByDay[d] || []).reduce((ss, sess) => ss + sess.kcal, 0), 0),
    analysis: `La setmana planificada inclou ${highDays.length} dia${highDays.length > 1 ? 'es' : ''} de càrrega alta. El desgast acumulat pot causar fatiga i reduir el rendiment si no s'ajusta la ingesta calòrica dels dies previs.`,
    adjustments: highDays.flatMap(d => [
      d > 0 ? { day: weekStore.daysFull[d - 1], label: 'Augmentar dinar i sopar', delta: '+15% kcal · +30g hidrats' } : null,
      { day: weekStore.daysFull[d], label: 'Esmorzar reforçat', delta: '+200 kcal · hidrats ràpids' }
    ]).filter(Boolean),
    startDay,
    endDay,
    daysAffected: highDays.length * 2
  })
}

function handleSave() {
  uiStore.showToast('Setmana desada correctament.', 'success')
}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; min-height: 100vh; }

/* KPI strip */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px 24px 0;
}

/* Main layout */
.dashboard__main {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  padding: 20px 24px 32px;
  flex: 1;
}

.dashboard__library {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard__cal { display: flex; flex-direction: column; gap: 12px; }

/* Alert banner */
.alert-banner {
  background: linear-gradient(135deg, var(--warning-surface-start) 0%, var(--warning-surface-end) 100%);
  border: 1px solid var(--warning-soft-border);
  border-radius: var(--radius-xl);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeInUp 0.4s var(--ease) both;
}
.alert-banner__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--warning-soft-text);
}
.alert-banner__header .material-symbols-rounded { font-size: 16px; color: var(--warning); }
.alert-banner__text { font-size: 12px; color: var(--warning-surface-text); line-height: 1.5; }
.alert-banner__cta {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--warning);
  color: white;
  padding: 9px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-fast);
  border: none;
  width: 100%;
  justify-content: center;
}
.alert-banner__cta:hover { background: #E8680A; transform: translateY(-1px); box-shadow: var(--shadow-md); }
.alert-banner__cta .material-symbols-rounded { font-size: 16px; }

/* Quick add */
.quick-add {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-sm);
}
.quick-add__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.quick-add__header .material-symbols-rounded { font-size: 16px; color: var(--accent); }

.field { display: flex; flex-direction: column; gap: 5px; }
.field__label { font-size: 11px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.4px; }
.field__select {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
  outline: none;
  cursor: pointer;
  transition: border-color var(--dur-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}
.field__select:focus { border-color: var(--accent); }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: var(--radius-md); font-family: var(--font-body); font-size: 13px; font-weight: 500; cursor: pointer; transition: all var(--dur-fast); border: none; }
.btn--primary { background: var(--accent); color: var(--navy); }
.btn--primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn--full { width: 100%; justify-content: center; }
.btn .material-symbols-rounded { font-size: 16px; }

/* Week summary */
.week-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-2);
}
.summary-item .material-symbols-rounded { font-size: 16px; }
.summary-item strong { color: var(--text); font-weight: 700; }
.summary-item--warn { color: var(--warning); }
.summary-sep { color: var(--border-2); font-size: 18px; }
</style>

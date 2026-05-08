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

      </aside>

      <!-- Calendar -->
      <div id="dashboard-calendar" class="dashboard__cal" tabindex="-1">
        <WeekCalendar
          :week-offset="weekOffset"
          @drop-session="handleDropSession"
        />

      </div>
    </div>

    <!-- Overlays -->
    <SessionPreviewCard />
    <SessionEditPanel />
    <SessionAddPanel />
    <AIPopover />
    <AIDrawer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import WeekCalendar from '@/components/dashboard/WeekCalendar.vue'
import SessionLibrary from '@/components/session/SessionLibrary.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import SessionPreviewCard from '@/components/session/SessionPreviewCard.vue'
import SessionEditPanel from '@/components/session/SessionEditPanel.vue'
import SessionAddPanel from '@/components/session/SessionAddPanel.vue'
import AIPopover from '@/components/ai/AIPopover.vue'
import AIDrawer from '@/components/ai/AIDrawer.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()

const weekOffset = ref(0)

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
.dashboard { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

/* KPI strip */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 20px 24px 0;
  flex-shrink: 0;
}

/* Main layout */
.dashboard__main {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  padding: 16px 24px 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.dashboard__library {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.dashboard__cal {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

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


</style>

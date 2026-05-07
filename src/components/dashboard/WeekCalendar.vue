<template>
  <div class="week-calendar">
    <!-- Day headers -->
    <div class="cal-header">
      <div class="cal-header__gutter"></div>
      <div class="cal-header__time-gap" aria-hidden="true"></div>
      <div
        v-for="(day, i) in weekStore.days"
        :key="day"
        class="cal-header__day"
        :class="{ 'cal-header__day--today': i === todayIndex }"
      >
        <span class="day-abbr">{{ day }}</span>
        <span class="day-num" :class="{ 'day-num--today': i === todayIndex }">
          {{ getDayNum(i) }}
        </span>
      </div>
    </div>

    <!-- Sessions track -->
    <div class="cal-track">
      <div class="cal-track__label">
        <span class="material-symbols-rounded" aria-hidden="true">fitness_center</span>
        Sessions
      </div>
      <div class="sessions-content">
        <!-- Time ruler -->
        <div class="time-ruler" aria-hidden="true">
          <div
            v-for="h in timeHours"
            :key="h"
            class="time-ruler__label"
            :style="{ top: hourToPercent(h) + '%' }"
          >
            {{ formatHour(h) }}
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="(day, i) in weekStore.days"
          :key="'s-' + i"
          class="sessions-day"
          :class="{ 'sessions-day--drop-target': dragOverDay === i, 'sessions-day--today': i === todayIndex }"
          :aria-dropeffect="uiStore.keyboardPlacementSessionType ? 'move' : 'none'"
          :aria-label="calendarCellLabel(i)"
          role="button"
          tabindex="0"
          @dragover.prevent="dragOverDay = i"
          @dragleave="dragOverDay = null"
          @drop="handleDrop(i, $event)"
          @keydown.enter.prevent="handleKeyboardDrop(i)"
          @keydown.space.prevent="handleKeyboardDrop(i)"
        >
          <!-- Hour grid lines -->
          <div
            v-for="h in allHours"
            :key="'gl-' + h"
            class="hour-line"
            :class="{ 'hour-line--major': h % 2 === 0 }"
            :style="{ top: hourToPercent(h) + '%' }"
            aria-hidden="true"
          ></div>

          <!-- Session blocks -->
          <div
            v-for="session in weekStore.sessionsByDay[i]"
            :key="session.id"
            class="session-block"
            :class="[`session-block--${session.type}`, `session-block--${session.load}`]"
            :style="{
              '--sess-color': getSessionColor(session.type),
              top: sessionTop(session),
              height: sessionHeight(session),
            }"
            @mouseenter="openPreview(session.id, $event)"
            @mouseleave="uiStore.scheduleClosePreviewSession()"
            :aria-label="`Veure: ${session.label}, ${formatDuration(session.duration)}, intensitat ${session.intensity}`"
            tabindex="0"
            @keydown.enter="openPreview(session.id, $event)"
          >
            <div class="session-block__header">
              <span class="material-symbols-rounded session-block__icon">{{ getSessionIcon(session.type) }}</span>
              <span class="session-block__label">{{ session.label }}</span>
              <span class="session-block__duration">{{ formatDuration(session.duration) }}</span>
              <span v-if="session.load === 'high'" class="session-block__warn" aria-label="Càrrega alta">
                <span class="material-symbols-rounded icon-fill" aria-hidden="true">warning</span>
              </span>
            </div>
            <div class="session-block__kcal">{{ session.kcal }} kcal · {{ session.intensity }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meals track -->
    <div class="cal-track cal-track--meals">
      <div class="cal-track__label">
        <span class="material-symbols-rounded" aria-hidden="true">restaurant</span>
        Àpats
      </div>
      <div class="cal-track__cells">
        <!-- Spacer to align with time ruler -->
        <div class="meals-spacer" aria-hidden="true"></div>

        <div
          v-for="(meal, i) in weekStore.meals"
          :key="'m-' + i"
          class="cal-cell meal-cell"
          :class="`meal-cell--${meal.status}`"
        >
          <div class="meal-cell__kcal">
            <span class="meal-kcal-val">{{ meal.total }}</span>
            <span class="meal-kcal-target">/ {{ meal.targetKcal }} kcal</span>
          </div>

          <!-- Macro mini bars -->
          <div class="meal-mini-bars">
            <div
              v-for="m in miniMacros(meal)"
              :key="m.key"
              class="mini-bar-track"
              :title="`${m.label}: ${m.val}g`"
            >
              <div
                class="mini-bar-fill"
                :style="{ width: m.pct + '%', background: m.color }"
              ></div>
            </div>
          </div>

          <!-- Status badge -->
          <div class="meal-cell__status" :class="`meal-status--${meal.status}`">
            <span class="material-symbols-rounded icon-fill" aria-hidden="true">{{ statusIcon(meal.status) }}</span>
            {{ statusLabel(meal.status) }}
          </div>

          <!-- AI adjusted badge -->
          <div v-if="meal.aiAdjusted" class="ai-adjusted-badge">
            <span class="material-symbols-rounded icon-fill" aria-hidden="true">auto_awesome</span>
            IA aplicada
          </div>
        </div>
      </div>
    </div>
  </div>  
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()

const props = defineProps({
  weekOffset: { type: Number, default: 0 }
})

const dragOverDay = ref(null)
const emit = defineEmits(['dropSession'])

// Time grid constants
const TIME_START = 6   // 6:00
const TIME_END   = 22  // 22:00
const TIME_RANGE = TIME_END - TIME_START

// Lines at every hour, labels every 2h
const allHours  = Array.from({ length: TIME_RANGE + 1 }, (_, i) => TIME_START + i)
const timeHours = allHours.filter(h => h % 2 === 0)

function hourToPercent(h) {
  return ((h - TIME_START) / TIME_RANGE) * 100
}

function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`
}

function sessionTop(session) {
  const start = session.startTime ?? 8
  const clamped = Math.max(TIME_START, Math.min(TIME_END, start))
  return hourToPercent(clamped) + '%'
}

function sessionHeight(session) {
  const hours = session.duration / 60
  return (hours / TIME_RANGE) * 100 + '%'
}

const todayIndex = computed(() => {
  const day = new Date().getDay()
  // Convert JS day (0=Sun) to our index (0=Mon)
  return day === 0 ? 6 : day - 1
})

function getDayNum(dayIdx) {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - todayIndex.value + dayIdx + props.weekOffset * 7)
  return startOfWeek.getDate()
}

function formatDuration(mins) {
  if (mins < 60) return `${mins}min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h${m}` : `${h}h`
}

function getSessionColor(type) {
  return weekStore.sessionTypes[type]?.color ?? 'var(--purple)'
}

function getSessionIcon(type) {
  return weekStore.sessionTypes[type]?.icon ?? 'fitness_center'
}

function openPreview(sessionId, event) {
  const rect = event.currentTarget?.getBoundingClientRect?.() ?? null
  uiStore.openPreviewSession(sessionId, rect)
}

function handleDrop(dayIndex, event) {
  dragOverDay.value = null
  const type = event.dataTransfer?.getData('session-type')
  if (type) {
    emit('dropSession', { dayIndex, type })
  }
}

function handleKeyboardDrop(dayIndex) {
  const type = uiStore.keyboardPlacementSessionType
  if (!type) return
  emit('dropSession', { dayIndex, type })
  uiStore.cancelKeyboardSessionPlacement()
}

function calendarCellLabel(dayIndex) {
  const label = weekStore.daysFull[dayIndex]
  const selectedType = uiStore.keyboardPlacementSessionType ? ` Sessió seleccionada: ${weekStore.sessionTypes[uiStore.keyboardPlacementSessionType].label}.` : ''
  return `${label}. Prem Enter per afegir una sessió.${selectedType}`
}

function miniMacros(meal) {
  const slots = [meal.breakfast, meal.lunch, meal.snack, meal.dinner]
  const totalCarbs = slots.reduce((s, m) => s + (m?.carbs ?? 0), 0)
  const totalProtein = slots.reduce((s, m) => s + (m?.protein ?? 0), 0)
  const totalFat = slots.reduce((s, m) => s + (m?.fat ?? 0), 0)
  return [
    { key: 'c', label: 'Hidrats', val: totalCarbs, pct: Math.min(100, (totalCarbs / 250) * 100), color: 'var(--purple)' },
    { key: 'p', label: 'Proteïna', val: totalProtein, pct: Math.min(100, (totalProtein / 120) * 100), color: '#00C896' },
    { key: 'f', label: 'Greixos', val: totalFat, pct: Math.min(100, (totalFat / 60) * 100), color: '#F59E0B' },
  ]
}

function statusIcon(status) {
  return { ok: 'check_circle', warning: 'warning', aiAdjusted: 'auto_awesome' }[status] ?? 'radio_button_unchecked'
}

function statusLabel(status) {
  return { ok: 'Cobert', warning: 'Revisar', aiAdjusted: 'Ajustat' }[status] ?? 'Pendent'
}
</script>

<style scoped>
.week-calendar {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* Header */
.cal-header {
  display: grid;
  grid-template-columns: 100px 48px repeat(7, 1fr);
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.cal-header__gutter { padding: 16px 16px; }
.cal-header__time-gap { border-left: 1px solid var(--border); }
.cal-header__day {
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-left: 1px solid var(--border);
  transition: background var(--dur-fast);
}
.cal-header__day--today { background: var(--accent-light); }
.day-abbr { font-size: 11px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.6px; }
.day-num {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; color: var(--text-2);
}
.day-num--today { background: var(--accent); color: var(--navy); }

/* ── Tracks ─────────────────────────────────────────────── */
.cal-track {
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-template-rows: 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.cal-track--meals {
  flex: 1;
  border-top: 2px solid var(--border);
  overflow: hidden;
}

.cal-track__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: var(--surface-2);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cal-track__label .material-symbols-rounded { font-size: 18px; color: var(--text-3); }

/* ── Sessions content (time-ruler + 7 day columns) ───────── */
.sessions-content {
  display: grid;
  grid-template-columns: 48px repeat(7, 1fr);
  grid-template-rows: 1fr;
  overflow: hidden;
}

/* Time ruler */
.time-ruler {
  position: relative;
  background: var(--surface-2);
  border-right: 1px solid var(--border);
}
.time-ruler__label {
  position: absolute;
  right: 6px;
  font-size: 9px;
  font-weight: 600;
  color: var(--text-3);
  transform: translateY(-50%);
  white-space: nowrap;
  letter-spacing: 0.2px;
}

/* Day columns (sessions) */
.sessions-day {
  position: relative;
  border-left: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
  cursor: default;
  transition: background var(--dur-fast);
}
.sessions-day--today { background: rgba(0, 200, 150, 0.03); }
.sessions-day--drop-target {
  background: var(--accent-light);
  border-color: var(--accent);
}

/* Hour grid lines */
.hour-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid var(--border);
  pointer-events: none;
}
.hour-line--major { border-top-color: var(--border-2); }

/* Empty drop hint */
.sessions-day__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-3);
  font-size: 11px;
  opacity: 0;
  transition: opacity var(--dur-fast);
}
.sessions-day:hover .sessions-day__empty,
.sessions-day--drop-target .sessions-day__empty { opacity: 1; }
.sessions-day__empty .material-symbols-rounded { font-size: 18px; }

/* ── Session blocks (absolutely positioned by time) ─────── */
.session-block {
  position: absolute;
  left: 4px;
  right: 4px;
  min-height: 24px;
  background: color-mix(in srgb, var(--sess-color) 14%, var(--surface));
  border: 1.5px solid color-mix(in srgb, var(--sess-color) 35%, transparent);
  border-radius: var(--radius-md);
  padding: 5px 7px;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--dur-fast);
  outline: none;
  z-index: 1;
}
.session-block:hover {
  background: color-mix(in srgb, var(--sess-color) 22%, var(--surface));
  border-color: var(--sess-color);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--sess-color) 30%, transparent);
  z-index: 2;
}
.session-block:focus-visible {
  outline: 2px solid var(--sess-color);
  outline-offset: 2px;
}
.session-block--high {
  border-color: color-mix(in srgb, var(--warning) 55%, transparent);
  background: color-mix(in srgb, var(--warning) 9%, var(--surface));
}

.session-block__header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}
.session-block__icon { font-size: 12px; color: var(--sess-color); flex-shrink: 0; }
.session-block__label { font-size: 10px; font-weight: 600; color: var(--text); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.session-block__duration { font-size: 10px; font-weight: 700; color: var(--sess-color); flex-shrink: 0; }
.session-block__warn .material-symbols-rounded { font-size: 12px; color: var(--warning); }
.session-block__kcal { font-size: 9px; color: var(--text-3); margin-top: 1px; }

/* ── Meals track cells ──────────────────────────────────── */
.cal-track__cells {
  display: grid;
  grid-template-columns: 48px repeat(7, 1fr);
  grid-template-rows: 1fr;
  overflow: hidden;
}

/* Spacer aligns meal columns with session day columns */
.meals-spacer {
  background: var(--surface-2);
  border-right: 1px solid var(--border);
}

/* Cell */
.cal-cell {
  padding: 8px;
  border-left: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background var(--dur-fast);
}

/* Meal cell */
.meal-cell { justify-content: space-between; }
.meal-cell--warning { background: rgba(255,122,53,0.04); }
.meal-cell--warning .meal-kcal-val { color: var(--warning); }

.meal-cell__kcal { display: flex; align-items: baseline; gap: 3px; }
.meal-kcal-val { font-size: 16px; font-weight: 700; color: var(--text); font-family: var(--font-display); }
.meal-kcal-target { font-size: 10px; color: var(--text-3); }

.meal-mini-bars { display: flex; flex-direction: column; gap: 3px; }
.mini-bar-track { height: 3px; background: var(--surface-3); border-radius: 99px; overflow: hidden; }
.mini-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s var(--ease); }

.meal-cell__status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 99px;
  align-self: flex-start;
}
.meal-cell__status .material-symbols-rounded { font-size: 12px; }
.meal-status--ok { background: var(--accent-light); color: var(--accent-dark); }
.meal-status--warning { background: var(--warning-light); color: var(--warning); }

.ai-adjusted-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 600;
  color: var(--accent-dark);
  opacity: 0.8;
}
.ai-adjusted-badge .material-symbols-rounded { font-size: 11px; }
</style>

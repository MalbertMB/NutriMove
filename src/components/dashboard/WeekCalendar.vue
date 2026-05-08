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
        :class="{ 'cal-header__day--today': isToday(i) }"
      >
        <span class="day-abbr">{{ day }}</span>
        <span class="day-num" :class="{ 'day-num--today': isToday(i) }">
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
      <div ref="scrollRef" class="sessions-scroll">
      <div class="sessions-content" :style="{ height: TOTAL_HEIGHT + 'px' }">
        <!-- Time ruler -->
        <div class="time-ruler" aria-hidden="true">
          <div
            v-for="h in timeHours"
            :key="h"
            class="time-ruler__label"
            :style="{ top: hourToPx(h) + 'px' }"
          >
            {{ formatHour(h) }}
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="(day, i) in weekStore.days"
          :key="'s-' + i"
          class="sessions-day"
          :class="{ 'sessions-day--drop-target': dragOverDay === i, 'sessions-day--today': isToday(i) }"
          :aria-dropeffect="uiStore.keyboardPlacementSessionType ? 'move' : 'none'"
          :aria-label="calendarCellLabel(i)"
          role="button"
          tabindex="0"
          @click="handleDayClick(i, $event)"
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
            :style="{ top: hourToPx(h) + 'px' }"
            aria-hidden="true"
          ></div>

          <!-- Current time indicator -->
          <div
            v-if="isToday(i)"
            class="current-time-line"
            :style="{ top: currentTimePx + 'px' }"
            aria-hidden="true"
          >
            <div class="current-time-dot"></div>
          </div>

          <!-- Session blocks -->
          <div
            v-for="session in weekStore.sessionsByDay[i]"
            :key="session.id"
            class="session-block"
            :class="[`session-block--${session.type}`, `session-block--${session.load}`, session.duration <= 75 && 'session-block--inline-layout']"
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
            <!-- ≤75min: icon + duration + name all inline -->
            <div v-if="session.duration <= 75" class="session-block__inline">
              <span class="material-symbols-rounded session-block__icon">{{ getSessionIcon(session.type) }}</span>
              <span class="session-block__duration">{{ formatDuration(session.duration) }}</span>
              <span class="session-block__label session-block__label--inline">{{ session.label }}</span>
              <span v-if="session.load === 'high'" class="session-block__warn" aria-label="Càrrega alta">
                <span class="material-symbols-rounded icon-fill" aria-hidden="true">warning</span>
              </span>
            </div>
            <!-- >75min and <120min: icon+duration row, name row -->
            <template v-else-if="session.duration < 120">
              <div class="session-block__header">
                <span class="material-symbols-rounded session-block__icon">{{ getSessionIcon(session.type) }}</span>
                <span class="session-block__duration">{{ formatDuration(session.duration) }}</span>
                <span v-if="session.load === 'high'" class="session-block__warn" aria-label="Càrrega alta">
                  <span class="material-symbols-rounded icon-fill" aria-hidden="true">warning</span>
                </span>
              </div>
              <span class="session-block__label">{{ session.label }}</span>
            </template>
            <!-- >120min: icon+duration, name, kcal+intensity -->
            <template v-else>
              <div class="session-block__header">
                <span class="material-symbols-rounded session-block__icon">{{ getSessionIcon(session.type) }}</span>
                <span class="session-block__duration">{{ formatDuration(session.duration) }}</span>
                <span v-if="session.load === 'high'" class="session-block__warn" aria-label="Càrrega alta">
                  <span class="material-symbols-rounded icon-fill" aria-hidden="true">warning</span>
                </span>
              </div>
              <span class="session-block__label">{{ session.label }}</span>
              <div class="session-block__kcal">{{ session.kcal }} kcal · {{ session.intensity }}</div>
            </template>
          </div>
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
              class="mini-bar-outer"
              :title="`${m.label}: ${m.val}g (mín ${m.min}g · obj ${m.target}g)`"
            >
              <div class="mini-bar-track">
                <div class="mini-bar-zone" :style="{ left: m.minPct+'%', width: (m.targetPct-m.minPct)+'%', background: m.color }"></div>
                <div class="mini-bar-fill" :style="{ width: m.pct+'%', background: m.color }"></div>
              </div>
              <div class="mini-tick" :style="{ left: m.targetPct+'%' }"></div>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()

const props = defineProps({
  weekOffset: { type: Number, default: 0 }
})

const dragOverDay = ref(null)
const emit = defineEmits(['dropSession'])
const scrollRef = ref(null)
const now = ref(new Date())
let timeInterval = null

// Time grid constants — full day, pixel-based
const TIME_START  = 0
const TIME_END    = 24
const TIME_RANGE  = TIME_END - TIME_START
const HOUR_PX     = 32
const TOTAL_HEIGHT = TIME_RANGE * HOUR_PX  // 768px

const allHours  = Array.from({ length: TIME_RANGE + 1 }, (_, i) => TIME_START + i)
const timeHours = allHours.filter(h => h % 2 === 0)

function hourToPx(h) {
  return (h - TIME_START) * HOUR_PX
}

function formatHour(h) {
  return `${String(h).padStart(2, '0')}:00`
}

function sessionTop(session) {
  const start = session.startTime ?? 8
  const clamped = Math.max(TIME_START, Math.min(TIME_END, start))
  return hourToPx(clamped) + 'px'
}

function sessionHeight(session) {
  return (session.duration / 60 * HOUR_PX) + 'px'
}

const currentTimePx = computed(() => {
  const h = now.value.getHours() + now.value.getMinutes() / 60
  return hourToPx(h)
})

function isToday(dayIdx) {
  if (props.weekOffset !== 0) return false
  return dayIdx === todayIndex.value
}

onMounted(async () => {
  await nextTick()
  if (scrollRef.value) scrollRef.value.scrollTop = 6 * HOUR_PX
  timeInterval = setInterval(() => { now.value = new Date() }, 60000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})

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

function handleDayClick(dayIndex, event) {
  // Ignore clicks on session blocks
  if (event.target.closest('.session-block')) return
  const rect = event.currentTarget.getBoundingClientRect()
  const rawHour = TIME_START + (event.clientY - rect.top) / HOUR_PX
  const snapped = Math.round(rawHour * 2) / 2  // snap to 30-min
  const clamped = Math.max(TIME_START, Math.min(23.5, snapped))
  uiStore.openAddPanel(dayIndex, clamped)
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

const MINI_MACROS_CFG = [
  { key: 'c', label: 'Hidrats',  min: 200, target: 280, max: 380, color: 'var(--purple)' },
  { key: 'p', label: 'Proteïna', min: 130, target: 155, max: 190, color: '#00C896' },
  { key: 'f', label: 'Greixos',  min: 55,  target: 72,  max: 100, color: '#F59E0B' },
]

function miniMacros(meal) {
  const slots = [meal.breakfast, meal.lunch, meal.snack, meal.dinner]
  const vals = {
    c: slots.reduce((s, m) => s + (m?.carbs ?? 0), 0),
    p: slots.reduce((s, m) => s + (m?.protein ?? 0), 0),
    f: slots.reduce((s, m) => s + (m?.fat ?? 0), 0),
  }
  return MINI_MACROS_CFG.map(cfg => ({
    ...cfg,
    val: vals[cfg.key],
    pct:       Math.min(100, (vals[cfg.key] / cfg.max) * 100),
    minPct:    (cfg.min    / cfg.max) * 100,
    targetPct: (cfg.target / cfg.max) * 100,
  }))
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
  flex: 0 0 450px;
  overflow: hidden;
}
.cal-track--meals {
  flex: 1;
  min-height: 150px;
  border-top: 2px solid var(--border);
  overflow: hidden;
}

.cal-track__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 20px 12px;
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

/* ── Sessions scrollable wrapper ────────────────────────── */
.sessions-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-2) transparent;
}
.sessions-scroll::-webkit-scrollbar { width: 4px; }
.sessions-scroll::-webkit-scrollbar-track { background: transparent; }
.sessions-scroll::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

/* ── Sessions content (time-ruler + 7 day columns) ───────── */
.sessions-content {
  display: grid;
  grid-template-columns: 48px repeat(7, 1fr);
  /* height set via inline style from TOTAL_HEIGHT constant */
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

/* ── Current time indicator ─────────────────────────────── */
.current-time-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #EF4444;
  pointer-events: none;
  z-index: 3;
}
.current-time-dot {
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #EF4444;
}

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

/* Inline layout (≤75min): vertically centered, everything on one row */
.session-block--inline-layout {
  display: flex;
  align-items: center;
}
.session-block__inline {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  width: 100%;
}
/* Duration must not stretch in inline layout */
.session-block__inline .session-block__duration { flex: none; }
/* Name is pushed to the right edge; auto margin collapses when space is tight
   so it truncates at the right end with "…" instead of the left */
.session-block__inline .session-block__label--inline {
  margin-left: auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Stacked layout (>75min) */
.session-block__header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}
.session-block__icon { font-size: 12px; color: var(--sess-color); flex-shrink: 0; }
.session-block__duration { font-size: 10px; font-weight: 700; color: var(--sess-color); flex: 1; }
.session-block__warn .material-symbols-rounded { font-size: 12px; color: var(--warning); }
.session-block__label { font-size: 10px; font-weight: 600; color: var(--text); line-height: 1.3; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.session-block__kcal { font-size: 9px; color: var(--text-3); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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

.meal-mini-bars { display: flex; flex-direction: column; gap: 4px; }
.mini-bar-outer { position: relative; height: 3px; }
.mini-bar-track {
  position: absolute; inset: 0;
  background: var(--surface-3); border-radius: 99px; overflow: hidden;
}
.mini-bar-zone  { position: absolute; top: 0; bottom: 0; opacity: 0.2; }
.mini-bar-fill  { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 99px; transition: width 0.6s var(--ease); }
.mini-tick {
  position: absolute; top: -1px; bottom: -1px; width: 1.5px;
  background: var(--text-2); opacity: 0.5;
  transform: translateX(-50%); border-radius: 1px; pointer-events: none;
}

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

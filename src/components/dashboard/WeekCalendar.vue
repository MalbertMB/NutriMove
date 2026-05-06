<template>
  <div class="week-calendar">
    <!-- Day headers -->
    <div class="cal-header">
      <div class="cal-header__gutter"></div>
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
      <div class="cal-track__cells">
        <div
          v-for="(day, i) in weekStore.days"
          :key="'s-' + i"
          class="cal-cell"
          :class="{ 'cal-cell--drop-target': dragOverDay === i }"
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
          <!-- Session blocks -->
          <div
            v-for="session in weekStore.sessionsByDay[i]"
            :key="session.id"
            class="session-block"
            :class="[`session-block--${session.type}`, `session-block--${session.load}`]"
            :style="{ '--sess-color': getSessionColor(session.type) }"
            @click="uiStore.openEditPanel(session.id)"
            :aria-label="`Editar: ${session.label}, ${formatDuration(session.duration)}, intensitat ${session.intensity}`"
            tabindex="0"
            @keydown.enter="uiStore.openEditPanel(session.id)"
          >
            <div class="session-block__header">
              <span class="material-symbols-rounded session-block__icon">{{ getSessionIcon(session.type) }}</span>
              <span class="session-block__duration">{{ formatDuration(session.duration) }}</span>
              <span v-if="session.load === 'high'" class="session-block__warn" aria-label="Càrrega alta">
                <span class="material-symbols-rounded icon-fill" aria-hidden="true">warning</span>
              </span>
            </div>
            <span class="session-block__label">{{ session.label }}</span>
            <div class="session-block__kcal">{{ session.kcal }} kcal · {{ session.intensity }}</div>
          </div>

          <!-- Empty cell drop hint -->
          <div v-if="weekStore.sessionsByDay[i].length === 0" class="cal-cell__empty">
            <span class="material-symbols-rounded" aria-hidden="true">add_circle</span>
            <span>Afegeix sessió</span>
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
}

/* Header */
.cal-header {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}
.cal-header__gutter { padding: 16px 16px; }
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

/* Track */
.cal-track { display: grid; grid-template-columns: 100px 1fr; }
.cal-track--meals { border-top: 2px solid var(--border); }

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

.cal-track__cells {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

/* Cell */
.cal-cell {
  min-height: 110px;
  padding: 8px;
  border-left: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background var(--dur-fast);
}
.cal-cell--drop-target { background: var(--accent-light); border-color: var(--accent); }

.cal-cell__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
  color: var(--text-3);
  font-size: 11px;
  cursor: pointer;
  border-radius: var(--radius-md);
  border: 2px dashed var(--border);
  transition: all var(--dur-fast);
  padding: 12px;
  text-align: center;
}
.cal-cell__empty:hover { background: var(--surface-2); border-color: var(--border-2); color: var(--text-2); }
.cal-cell__empty .material-symbols-rounded { font-size: 20px; }

/* Session block */
.session-block {
  background: color-mix(in srgb, var(--sess-color) 12%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--sess-color) 30%, transparent);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  cursor: pointer;
  transition: all var(--dur-fast);
  position: relative;
  outline: none;
}
.session-block:hover {
  background: color-mix(in srgb, var(--sess-color) 20%, transparent);
  border-color: var(--sess-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--sess-color) 25%, transparent);
}
.session-block:focus-visible {
  outline: 2px solid var(--sess-color);
  outline-offset: 2px;
}
.session-block--high {
  border-color: color-mix(in srgb, var(--warning) 50%, transparent);
  background: color-mix(in srgb, var(--warning) 8%, transparent);
}

.session-block__header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
}
.session-block__icon { font-size: 14px; color: var(--sess-color); }
.session-block__duration {
  font-size: 11px;
  font-weight: 700;
  color: var(--sess-color);
  flex: 1;
}
.session-block__warn .material-symbols-rounded { font-size: 13px; color: var(--warning); }
.session-block__label { font-size: 11px; font-weight: 600; color: var(--text); line-height: 1.3; display: block; }
.session-block__kcal { font-size: 10px; color: var(--text-3); margin-top: 2px; }

/* Meal cell */
.meal-cell { min-height: 90px; justify-content: space-between; }
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

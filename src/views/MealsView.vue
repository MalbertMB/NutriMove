<template>
  <div class="meals-view">
    <AppTopBar title="Àpats" subtitle="Planificació nutricional setmanal" />

    <div class="meals-content">
      <div class="week-nav">
        <button class="week-nav__btn" @click="weekStore.prevWeek()" aria-label="Setmana anterior">
          <span class="material-symbols-rounded">chevron_left</span>
        </button>
        <div class="week-nav__center">
          <span class="week-nav__label">{{ weekStore.currentWeekLabel }}</span>
          <span v-if="weekStore.weekOffset === 0" class="week-nav__chip">Aquesta setmana</span>
        </div>
        <button class="week-nav__btn" @click="weekStore.nextWeek()" aria-label="Setmana següent">
          <span class="material-symbols-rounded">chevron_right</span>
        </button>
      </div>

      <!-- 7 day cards (general info) -->
      <div id="meal-plan" class="meals-grid" tabindex="-1">
        <button
          v-for="(meal, i) in weekStore.meals"
          :key="i"
          type="button"
          class="meal-card"
          :class="[
            `meal-card--${meal.status}`,
            { 'meal-card--selected': selectedDayIndex === i },
            { 'meal-card--today': i === todayIndex && weekStore.weekOffset === 0 },
          ]"
          :style="{ animationDelay: i * 60 + 'ms' }"
          :aria-pressed="selectedDayIndex === i"
          :aria-label="`Veure detall ${weekStore.daysFull[i]}`"
          @click="selectedDayIndex = i"
        >
          <div class="meal-card__top">
            <div>
              <div class="meal-card__day">{{ weekStore.days[i] }}</div>
              <div class="meal-card__num">{{ getDayNum(i) }}</div>
            </div>
            <div v-if="meal.aiAdjusted" class="meal-card__ai" title="Ajustat per IA">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
            </div>
          </div>

          <div class="meal-card__kcal">
            <transition name="kcal-count" mode="out-in">
              <span :key="meal.total" class="kcal-num">{{ meal.total }}</span>
            </transition>
            <span class="kcal-unit">kcal</span>
          </div>

          <div class="meal-card__macros">
            <div
              v-for="m in miniMacros(meal)"
              :key="m.key"
              class="mini-row"
              :title="`${m.label}: ${m.val}g (obj ${m.target}g)`"
            >
              <span class="mini-row__label">{{ m.label[0] }}</span>
              <div class="mini-row__track">
                <div class="mini-row__fill" :style="{ width: m.pct + '%', background: m.color }"></div>
              </div>
              <span class="mini-row__val">{{ m.val }}</span>
            </div>
          </div>

          <div class="meal-card__slots">
            <div
              v-for="slot in SLOTS"
              :key="slot"
              class="slot-pill"
              :title="`${meal[slot]?.label}: ${meal[slot]?.kcal} kcal`"
            >
              <span class="material-symbols-rounded">{{ slotIcon(slot) }}</span>
              <span>{{ meal[slot]?.kcal }}</span>
            </div>
          </div>

          <div class="meal-card__status" :class="`status-badge--${meal.status}`">
            <span class="material-symbols-rounded icon-fill">{{ meal.status === 'ok' ? 'check_circle' : 'warning' }}</span>
            {{ meal.status === 'ok' ? 'Cobert' : 'Revisar' }}
          </div>
        </button>
      </div>

      <!-- Inline detail area -->
      <section id="meal-detail" class="meal-detail-area" tabindex="-1">
        <MealDetailContent :day-index="selectedDayIndex" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import MealDetailContent from '@/components/meal/MealDetailContent.vue'
import { useWeekStore } from '@/stores/weekStore'

const weekStore = useWeekStore()

const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner']

const todayIndex = computed(() => {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
})

const selectedDayIndex = ref(todayIndex.value)

watch(() => weekStore.weekOffset, () => {
  selectedDayIndex.value = todayIndex.value
})

function slotIcon(slot) {
  return { breakfast: 'wb_sunny', lunch: 'lunch_dining', snack: 'cookie', dinner: 'dinner_dining' }[slot] ?? 'restaurant'
}

function getDayNum(dayIdx) {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - todayIndex.value + dayIdx + weekStore.weekOffset * 7)
  return start.getDate()
}

const MINI_MACROS_CFG = [
  { key: 'carbs',   label: 'Hidrats',  target: 280, max: 380, color: 'var(--purple)' },
  { key: 'protein', label: 'Proteïna', target: 155, max: 190, color: '#00C896' },
  { key: 'fat',     label: 'Greixos',  target: 72,  max: 100, color: '#F59E0B' },
]

function miniMacros(meal) {
  const vals = {
    carbs:   SLOTS.reduce((s, k) => s + (meal[k]?.carbs   ?? 0), 0),
    protein: SLOTS.reduce((s, k) => s + (meal[k]?.protein ?? 0), 0),
    fat:     SLOTS.reduce((s, k) => s + (meal[k]?.fat     ?? 0), 0),
  }
  return MINI_MACROS_CFG.map(cfg => ({
    ...cfg,
    val: Math.round(vals[cfg.key]),
    pct: Math.min(100, (vals[cfg.key] / cfg.max) * 100),
  }))
}
</script>

<style scoped>
.meals-view { display: flex; flex-direction: column; }
.meals-content { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Week navigation */
.week-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 10px 16px;
  box-shadow: var(--shadow-sm);
}
.week-nav__btn {
  width: 34px; height: 34px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-2);
  transition: background var(--dur-fast), color var(--dur-fast);
}
.week-nav__btn:hover { background: var(--surface-2); color: var(--accent); }
.week-nav__btn .material-symbols-rounded { font-size: 20px; }
.week-nav__center {
  display: flex; align-items: center; gap: 10px;
  flex: 1; justify-content: center;
}
.week-nav__label { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text); }
.week-nav__chip {
  font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 99px;
  background: var(--accent-light); color: var(--accent-dark);
}

/* 7-day grid */
.meals-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

/* Day card */
.meal-card {
  position: relative;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--dur-fast), box-shadow var(--dur-fast), border-color var(--dur-fast), background var(--dur-fast);
  animation: fadeInUp 0.4s var(--ease) both;
  text-align: left;
  font-family: inherit;
  color: inherit;
  min-height: 200px;
}
.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-2);
}
.meal-card--today { box-shadow: 0 0 0 1.5px var(--accent), var(--shadow-sm); }
.meal-card--warning { border-color: var(--warning-soft-border); background: var(--warning-surface-body); }
.meal-card--selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  box-shadow: 0 0 0 2px var(--accent), var(--shadow-md);
}

.meal-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.meal-card__day {
  font-family: var(--font-display);
  font-size: 11px; font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.meal-card__num {
  font-family: var(--font-display);
  font-size: 20px; font-weight: 800; color: var(--text);
  line-height: 1;
}

.meal-card__ai {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent-dark);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.meal-card__ai .material-symbols-rounded { font-size: 13px; }

.meal-card__kcal { display: flex; align-items: baseline; gap: 4px; }
.kcal-num { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); display: inline-block; }
.kcal-unit { font-size: 11px; color: var(--text-3); font-weight: 600; }

.meal-card__macros { display: flex; flex-direction: column; gap: 4px; }
.mini-row {
  display: grid;
  grid-template-columns: 10px 1fr 28px;
  align-items: center;
  gap: 6px;
}
.mini-row__label { font-size: 9px; font-weight: 700; color: var(--text-3); }
.mini-row__track {
  height: 4px;
  background: var(--surface-3);
  border-radius: 99px;
  overflow: hidden;
}
.mini-row__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s var(--ease);
}
.mini-row__val { font-size: 9px; font-weight: 600; color: var(--text-2); text-align: right; }

.meal-card__slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}
.slot-pill {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 6px;
  background: var(--surface-2);
  border-radius: var(--radius-sm);
  font-size: 10px; font-weight: 600; color: var(--text-2);
}
.slot-pill .material-symbols-rounded { font-size: 11px; color: var(--accent); }

.meal-card__status {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700;
  padding: 4px 8px; border-radius: 99px;
  align-self: flex-start;
  margin-top: auto;
}
.meal-card__status .material-symbols-rounded { font-size: 12px; }
.status-badge--ok { background: var(--accent-light); color: var(--accent-dark); }
.status-badge--warning { background: var(--warning-light); color: var(--warning); }

/* Detail area */
.meal-detail-area {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 22px 24px;
  box-shadow: var(--shadow-sm);
  outline: none;
}

/* Kcal counter transition */
.kcal-count-enter-active { animation: kcalIn 0.35s var(--ease) both; }
.kcal-count-leave-active { animation: kcalOut 0.2s var(--ease) both; }
@keyframes kcalIn  { from { transform: translateY(8px);  opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes kcalOut { from { transform: translateY(0);    opacity: 1; } to { transform: translateY(-8px); opacity: 0; } }

@media (max-width: 1100px) {
  .meals-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 700px) {
  .meals-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

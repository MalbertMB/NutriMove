<template>
  <div class="meals-view">
    <AppTopBar title="Àpats" subtitle="Planificació nutricional setmanal" />

    <div class="meals-content">
      <div class="meals-grid">
        <div
          v-for="(meal, i) in weekStore.meals"
          :key="i"
          class="meal-card"
          :class="`meal-card--${meal.status}`"
          :aria-label="`Àpats del ${weekStore.daysFull[i]}`"
        >
          <div class="meal-card__header">
            <div class="meal-card__day-info">
              <span class="meal-day-name">{{ weekStore.daysFull[i] }}</span>
              <div class="meal-status-badge" :class="`badge--${meal.status}`">
                <span class="material-symbols-rounded icon-fill">{{ meal.status === 'ok' ? 'check_circle' : 'warning' }}</span>
                {{ meal.status === 'ok' ? 'Cobert' : 'Revisar' }}
              </div>
            </div>
            <div class="meal-card__kcal-big">
              <span class="kcal-num">{{ meal.total }}</span>
              <span class="kcal-target">/ {{ meal.targetKcal }}</span>
            </div>
          </div>

          <!-- Macro bars -->
          <MacroBar
            :carbs="(meal.breakfast?.carbs || 0) + (meal.lunch?.carbs || 0)"
            :protein="(meal.breakfast?.protein || 0) + (meal.lunch?.protein || 0)"
            :fat="(meal.breakfast?.fat || 0) + (meal.dinner?.fat || 0)"
          />

          <!-- Meal slots -->
          <div class="meal-slots">
            <div v-for="slot in ['breakfast','lunch','snack','dinner']" :key="slot" class="meal-slot">
              <span class="meal-slot__icon material-symbols-rounded">{{ slotIcon(slot) }}</span>
              <div class="meal-slot__body">
                <span class="meal-slot__name">{{ meal[slot]?.label }}</span>
                <span class="meal-slot__items">{{ (meal[slot]?.items || []).join(', ') }}</span>
              </div>
              <span class="meal-slot__kcal">{{ meal[slot]?.kcal }} kcal</span>
            </div>
          </div>

          <!-- AI adjusted -->
          <div v-if="meal.aiAdjusted" class="ai-note">
            <span class="material-symbols-rounded icon-fill">auto_awesome</span>
            Ajustat per l'Assistent NutriMove
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppTopBar from '@/components/layout/AppTopBar.vue'
import MacroBar from '@/components/ui/MacroBar.vue'
import { useWeekStore } from '@/stores/weekStore'

const weekStore = useWeekStore()

function slotIcon(slot) {
  return { breakfast: 'wb_sunny', lunch: 'lunch_dining', snack: 'cookie', dinner: 'dinner_dining' }[slot] ?? 'restaurant'
}
</script>

<style scoped>
.meals-view { display: flex; flex-direction: column; }
.meals-content { padding: 24px; }
.meals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.meal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--dur-fast);
  animation: fadeInUp 0.4s var(--ease) both;
}
.meal-card:hover { box-shadow: var(--shadow-md); }
.meal-card--warning { border-color: #FCD34D; background: #FFFDF5; }

.meal-card__header { display: flex; flex-direction: column; gap: 8px; }
.meal-card__day-info { display: flex; align-items: center; justify-content: space-between; }
.meal-day-name { font-family: var(--font-display); font-size: 15px; font-weight: 700; }
.meal-status-badge {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 99px;
}
.meal-status-badge .material-symbols-rounded { font-size: 12px; }
.badge--ok { background: var(--accent-light); color: var(--accent-dark); }
.badge--warning { background: var(--warning-light); color: var(--warning); }

.meal-card__kcal-big { display: flex; align-items: baseline; gap: 3px; }
.kcal-num { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text); }
.kcal-target { font-size: 12px; color: var(--text-3); }

.meal-slots { display: flex; flex-direction: column; gap: 6px; }
.meal-slot {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
}
.meal-slot__icon { font-size: 15px; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.meal-slot__body { flex: 1; min-width: 0; }
.meal-slot__name { display: block; font-size: 12px; font-weight: 600; color: var(--text); }
.meal-slot__items { font-size: 11px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.meal-slot__kcal { font-size: 12px; font-weight: 600; color: var(--text-2); white-space: nowrap; }

.ai-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-dark);
  padding: 8px 10px;
  background: var(--accent-light);
  border-radius: var(--radius-md);
}
.ai-note .material-symbols-rounded { font-size: 13px; }
</style>

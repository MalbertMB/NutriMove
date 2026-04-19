<template>
  <div class="macro-bars">
    <div v-for="macro in macros" :key="macro.key" class="macro-row">
      <div class="macro-row__header">
        <span class="macro-row__label">{{ macro.label }}</span>
        <span class="macro-row__value">{{ macro.value }}g</span>
      </div>
      <div class="macro-row__track" :aria-label="`${macro.label}: ${macro.pct}%`">
        <div
          class="macro-row__fill"
          :style="{ width: macro.pct + '%', background: macro.color, '--target-width': macro.pct + '%' }"
          :class="{ 'animate-fill': animated }"
          role="progressbar"
          :aria-valuenow="macro.pct"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  carbs: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  carbsTarget: { type: Number, default: 250 },
  proteinTarget: { type: Number, default: 120 },
  fatTarget: { type: Number, default: 60 },
  animated: { type: Boolean, default: true }
})

const macros = computed(() => [
  {
    key: 'carbs', label: 'Hidrats', value: props.carbs,
    pct: Math.min(100, Math.round((props.carbs / props.carbsTarget) * 100)),
    color: '#6366F1'
  },
  {
    key: 'protein', label: 'Proteïna', value: props.protein,
    pct: Math.min(100, Math.round((props.protein / props.proteinTarget) * 100)),
    color: '#00C896'
  },
  {
    key: 'fat', label: 'Greixos', value: props.fat,
    pct: Math.min(100, Math.round((props.fat / props.fatTarget) * 100)),
    color: '#F59E0B'
  }
])
</script>

<style scoped>
.macro-bars { display: flex; flex-direction: column; gap: 8px; }

.macro-row { display: flex; flex-direction: column; gap: 4px; }
.macro-row__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.macro-row__label { font-size: 11px; font-weight: 500; color: var(--text-2); }
.macro-row__value { font-size: 11px; color: var(--text-3); }

.macro-row__track {
  height: 6px;
  background: var(--surface-3);
  border-radius: 99px;
  overflow: hidden;
}
.macro-row__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.8s var(--ease);
}
.animate-fill { animation: progressFill 0.8s var(--ease) both; }
</style>

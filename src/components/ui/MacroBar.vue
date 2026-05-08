<template>
  <div class="macro-bars">
    <div v-for="macro in macros" :key="macro.key" class="macro-row">
      <!-- Header: label | range hint | value -->
      <div class="macro-row__header">
        <span class="macro-row__label">{{ macro.label }}</span>
        <span class="macro-row__range">mín {{ macro.min }}g · obj {{ macro.target }}g</span>
        <span class="macro-row__val" :class="`val--${macro.status}`">{{ macro.value }}g</span>
      </div>

      <!-- Track + tick markers -->
      <div class="macro-row__outer">
        <!-- Track (overflow:hidden so fill & zone are clipped) -->
        <div class="macro-row__track">
          <!-- Optimal zone highlight (min → target) -->
          <div
            class="macro-row__zone"
            :style="{
              left: macro.minPct + '%',
              width: (macro.targetPct - macro.minPct) + '%',
              background: macro.color,
            }"
          ></div>
          <!-- Actual fill -->
          <div
            class="macro-row__fill"
            :style="{ width: macro.valuePct + '%', background: macro.fillColor }"
            :class="{ 'animate-fill': animated }"
          ></div>
        </div>

        <!-- Min tick (outside overflow:hidden, extends above/below track) -->
        <div class="tick tick--min" :style="{ left: macro.minPct + '%' }"></div>
        <!-- Target tick -->
        <div class="tick tick--target" :style="{ left: macro.targetPct + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  carbs:    { type: Number, default: 0 },
  protein:  { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  animated: { type: Boolean, default: true },
})

// Ranges calibrated for a 78 kg active male athlete (~2100–2750 kcal/day)
const MACRO_CONFIG = [
  { key: 'carbs',   label: 'Hidrats',  min: 200, target: 280, max: 380, color: 'var(--purple)' },
  { key: 'protein', label: 'Proteïna', min: 130, target: 155, max: 190, color: '#00C896' },
  { key: 'fat',     label: 'Greixos',  min: 55,  target: 72,  max: 100, color: '#F59E0B' },
]

const macros = computed(() =>
  MACRO_CONFIG.map(cfg => {
    const value     = cfg.key === 'carbs' ? props.carbs : cfg.key === 'protein' ? props.protein : props.fat
    const valuePct  = Math.min(100, Math.round((value  / cfg.max) * 100))
    const minPct    = Math.round((cfg.min    / cfg.max) * 100)
    const targetPct = Math.round((cfg.target / cfg.max) * 100)
    const status    = value < cfg.min ? 'low' : value >= cfg.target ? 'good' : 'ok'
    const fillColor = status === 'low' ? 'var(--warning)' : cfg.color
    return { ...cfg, value, valuePct, minPct, targetPct, status, fillColor }
  })
)
</script>

<style scoped>
.macro-bars { display: flex; flex-direction: column; gap: 10px; }

.macro-row { display: flex; flex-direction: column; gap: 5px; }

.macro-row__header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.macro-row__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-2);
  flex: 0 0 auto;
}
.macro-row__range {
  flex: 1;
  font-size: 9px;
  color: var(--text-3);
  text-align: center;
  letter-spacing: 0.1px;
}
.macro-row__val {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  flex: 0 0 auto;
}
.val--low  { color: var(--warning); }
.val--good { color: var(--accent-dark); }

/* Outer: position context for the ticks */
.macro-row__outer {
  position: relative;
  height: 8px;
}

/* Track: clips fill and zone to rounded corners */
.macro-row__track {
  position: absolute;
  inset: 0;
  background: var(--surface-3);
  border-radius: 99px;
  overflow: hidden;
}

.macro-row__zone {
  position: absolute;
  top: 0; bottom: 0;
  opacity: 0.18;
  pointer-events: none;
}

.macro-row__fill {
  position: absolute;
  top: 0; bottom: 0; left: 0;
  border-radius: 99px;
  transition: width 0.8s var(--ease);
  z-index: 1;
}
.animate-fill { animation: progressFill 0.8s var(--ease) both; }

/* Tick markers — sit on top of the track, extend slightly above/below */
.tick {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  border-radius: 1px;
  transform: translateX(-50%);
  z-index: 3;
  pointer-events: none;
}
.tick--min    { background: var(--text-3); opacity: 0.45; }
.tick--target { background: var(--text-2); opacity: 0.75; }
</style>

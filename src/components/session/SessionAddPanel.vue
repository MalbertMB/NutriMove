<template>
  <Teleport to="body">
    <Transition name="panel-slide">
      <div
        v-if="uiStore.addPanelOpen"
        class="add-panel-backdrop"
        @click.self="uiStore.closeAddPanel()"
        @keydown.esc.prevent="uiStore.closeAddPanel()"
      >
        <div
          ref="panelRef"
          class="add-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-panel-title"
          tabindex="-1"
        >
          <!-- Header -->
          <div class="add-panel__header">
            <span class="material-symbols-rounded" aria-hidden="true">add_circle</span>
            <h2 id="add-panel-title" class="add-panel__title">Nova sessió</h2>
            <button class="add-panel__close" @click="uiStore.closeAddPanel()" aria-label="Tancar">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <!-- Day + time row -->
          <div class="add-panel__section">
            <label class="field-label">Dia i hora</label>
            <div class="day-time-row">
              <select v-model="selectedDay" class="field-select">
                <option v-for="(day, i) in weekStore.daysFull" :key="i" :value="i">{{ day }}</option>
              </select>
              <div class="time-display">
                <span class="material-symbols-rounded">schedule</span>
                {{ formatHour(selectedTime) }}
              </div>
            </div>
            <div class="time-slider-wrap">
              <span class="time-slider__cap">00:00</span>
              <input
                type="range"
                v-model.number="selectedTime"
                min="0"
                max="23.5"
                step="0.5"
                class="time-slider"
                :aria-label="`Hora d'inici: ${formatHour(selectedTime)}`"
              />
              <span class="time-slider__cap">23:30</span>
            </div>
          </div>

          <!-- Session type grid -->
          <div class="add-panel__section">
            <label class="field-label">Tipus de sessió</label>
            <div class="type-grid">
              <button
                v-for="(typeData, key) in weekStore.sessionTypes"
                :key="key"
                class="type-chip"
                :class="{ 'type-chip--active': selectedType === key }"
                :style="{ '--chip-color': typeData.color }"
                @click="selectedType = key"
              >
                <span class="material-symbols-rounded type-chip__icon">{{ typeData.icon }}</span>
                <span class="type-chip__label">{{ typeData.label }}</span>
              </button>
            </div>
          </div>

          <!-- Duration chips -->
          <div class="add-panel__section">
            <label class="field-label">Durada</label>
            <div class="chips-row">
              <button
                v-for="d in DURATIONS"
                :key="d"
                class="dur-chip"
                :class="{ 'dur-chip--active': selectedDuration === d && !showCustomInput }"
                @click="selectPresetDuration(d)"
              >
                {{ formatDuration(d) }}
              </button>
              <button
                class="dur-chip"
                :class="{ 'dur-chip--active': showCustomInput }"
                @click="toggleCustomInput"
              >
                Personalitzat
              </button>
            </div>
            <div v-if="showCustomInput" class="custom-dur-wrap">
              <input
                type="number"
                class="custom-dur-input"
                v-model.number="customMinutes"
                min="1"
                max="600"
                step="5"
                placeholder="60"
                aria-label="Durada en minuts"
                @input="onCustomInput"
              />
              <span class="custom-dur-unit">min</span>
            </div>
          </div>

          <!-- Intensity -->
          <div class="add-panel__section">
            <label class="field-label">Intensitat</label>
            <div class="intensity-row">
              <button
                v-for="level in INTENSITIES"
                :key="level.value"
                class="intensity-chip"
                :class="[`intensity-chip--${level.value.toLowerCase()}`, { 'intensity-chip--active': selectedIntensity === level.value }]"
                @click="selectedIntensity = level.value"
              >
                <span class="material-symbols-rounded icon-fill">{{ level.icon }}</span>
                {{ level.label }}
              </button>
            </div>
          </div>

          <!-- Impact preview -->
          <div class="impact-preview">
            <div class="impact-preview__row">
              <span class="material-symbols-rounded icon-fill">local_fire_department</span>
              <span class="impact-val">{{ estimatedKcal }} kcal</span>
              <span class="impact-meta">estimades</span>
            </div>
            <div class="impact-preview__row">
              <span class="material-symbols-rounded icon-fill">timer</span>
              <span class="impact-val">{{ formatDuration(selectedDuration) }}</span>
              <span class="impact-meta">durada</span>
            </div>
            <div class="impact-preview__row">
              <span class="material-symbols-rounded icon-fill" :style="{ color: activeTypeColor }">{{ activeTypeIcon }}</span>
              <span class="impact-val">{{ activeTypeLabel }}</span>
              <span class="impact-meta">· {{ selectedIntensity }}</span>
            </div>
          </div>

          <!-- Scope -->
          <div class="add-panel__section">
            <label class="field-label">Aplicar a</label>
            <div class="scope-row">
              <button
                v-for="s in SCOPES"
                :key="s.value"
                class="scope-chip"
                :class="{ 'scope-chip--active': selectedScope === s.value }"
                @click="selectedScope = s.value"
              >
                <span class="material-symbols-rounded scope-chip__icon">{{ s.icon }}</span>
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="add-panel__footer">
            <button class="btn btn--ghost" @click="uiStore.closeAddPanel()">Cancel·lar</button>
            <button class="btn btn--primary" @click="handleAdd">
              <span class="material-symbols-rounded">add</span>
              Afegir sessió
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useWeekStore } from '@/stores/weekStore'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { useScrollLock } from '@/composables/useScrollLock'

const uiStore = useUIStore()
const weekStore = useWeekStore()
const panelRef = ref(null)
const isOpen = computed(() => uiStore.addPanelOpen)
useFocusTrap(isOpen, panelRef)
useScrollLock(isOpen)

const DURATIONS = [30, 60, 90, 120]
const INTENSITIES = [
  { value: 'Baixa',    label: 'Baixa',    icon: 'speed' },
  { value: 'Moderada', label: 'Moderada', icon: 'speed' },
  { value: 'Alta',     label: 'Alta',     icon: 'bolt' },
]
const SCOPES = [
  { value: 'week',   label: 'Aquesta setmana', icon: 'calendar_today' },
  { value: 'month',  label: 'Tot el mes',      icon: 'calendar_month' },
  { value: 'always', label: 'Sempre',          icon: 'all_inclusive'  },
]

const selectedDay = ref(0)
const selectedTime = ref(8)
const selectedType = ref('cycling')
const selectedDuration = ref(60)
const selectedIntensity = ref('Moderada')
const selectedScope = ref('always')
const showCustomInput = ref(false)
const customMinutes = ref(60)

watch(() => uiStore.addPanelContext, (ctx) => {
  if (ctx) {
    selectedDay.value = ctx.dayIndex
    selectedTime.value = ctx.startTime
  }
})

watch(() => uiStore.addPanelOpen, (open) => {
  if (!open) selectedScope.value = 'always'
})

const activeTypeData = computed(() => weekStore.sessionTypes[selectedType.value])
const activeTypeLabel = computed(() => activeTypeData.value?.label ?? '')
const activeTypeIcon = computed(() => activeTypeData.value?.icon ?? 'fitness_center')
const activeTypeColor = computed(() => activeTypeData.value?.color ?? 'var(--accent)')

const estimatedKcal = computed(() => {
  const multiplier = selectedIntensity.value === 'Alta' ? 560
    : selectedIntensity.value === 'Baixa' ? 280 : 400
  return Math.round((selectedDuration.value / 60) * multiplier)
})

function selectPresetDuration(d) {
  selectedDuration.value = d
  showCustomInput.value = false
}

function toggleCustomInput() {
  showCustomInput.value = !showCustomInput.value
  if (showCustomInput.value) {
    customMinutes.value = selectedDuration.value
  }
}

function onCustomInput() {
  if (customMinutes.value >= 1) {
    selectedDuration.value = customMinutes.value
  }
}

function formatHour(h) {
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function formatDuration(mins) {
  if (mins < 60) return `${mins}min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h${m}` : `${h}h`
}

function handleAdd() {
  weekStore.addSession(
    selectedDay.value,
    selectedType.value,
    selectedDuration.value,
    selectedIntensity.value,
    selectedTime.value,
    selectedScope.value
  )
  uiStore.showToast(`Sessió "${activeTypeLabel.value}" afegida el ${weekStore.daysFull[selectedDay.value]}.`, 'success')
  uiStore.closeAddPanel()
}
</script>

<style scoped>
.add-panel-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Header */
.add-panel__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.add-panel__header .material-symbols-rounded { font-size: 20px; color: var(--accent); }
.add-panel__title {
  flex: 1;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}
.add-panel__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--dur-fast);
  color: var(--text-2);
}
.add-panel__close:hover { background: var(--surface-3); color: var(--text); }
.add-panel__close .material-symbols-rounded { font-size: 16px; }

/* Sections */
.add-panel__section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Day + time row */
.day-time-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.field-select {
  flex: 1;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text);
  background: var(--surface-2);
  outline: none;
  cursor: pointer;
  transition: border-color var(--dur-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}
.field-select:focus { border-color: var(--accent); }

.time-display {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--accent-light);
  color: var(--accent-dark);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-display);
  white-space: nowrap;
  flex-shrink: 0;
}
.time-display .material-symbols-rounded { font-size: 14px; }

.time-slider-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.time-slider__cap {
  font-size: 10px;
  color: var(--text-3);
  flex-shrink: 0;
}
.time-slider {
  flex: 1;
  accent-color: var(--accent);
  cursor: pointer;
  height: 4px;
}

/* Type grid */
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.type-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  cursor: pointer;
  transition: all var(--dur-fast);
  color: var(--text-2);
}
.type-chip:hover {
  border-color: var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 10%, var(--surface));
  color: var(--chip-color);
}
.type-chip--active {
  border-color: var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 14%, var(--surface));
  color: var(--chip-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--chip-color) 18%, transparent);
}
.type-chip__icon { font-size: 20px; }
.type-chip__label { font-size: 10px; font-weight: 600; }

/* Duration chips */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.dur-chip {
  padding: 6px 14px;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.dur-chip:hover { border-color: var(--accent); color: var(--accent); }
.dur-chip--active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--navy);
}

/* Custom duration input */
.custom-dur-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.custom-dur-input {
  width: 72px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--accent);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  background: var(--surface);
  outline: none;
  text-align: center;
  -moz-appearance: textfield;
}
.custom-dur-input::-webkit-outer-spin-button,
.custom-dur-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.custom-dur-unit {
  font-size: 12px;
  color: var(--text-3);
}

/* Intensity */
.intensity-row {
  display: flex;
  gap: 8px;
}
.intensity-chip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 6px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.intensity-chip .material-symbols-rounded { font-size: 14px; }
.intensity-chip--active.intensity-chip--baixa   { background: rgba(16,185,129,0.12); border-color: #10B981; color: #10B981; }
.intensity-chip--active.intensity-chip--moderada { background: rgba(0,200,150,0.12); border-color: var(--accent); color: var(--accent-dark); }
.intensity-chip--active.intensity-chip--alta    { background: rgba(239,68,68,0.12); border-color: #EF4444; color: #EF4444; }
.intensity-chip:hover:not(.intensity-chip--active) { border-color: var(--accent); color: var(--text); }

/* Impact preview */
.impact-preview {
  display: flex;
  gap: 0;
  padding: 14px 20px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}
.impact-preview__row {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0 8px;
  border-right: 1px solid var(--border);
}
.impact-preview__row:last-child { border-right: none; }
.impact-preview__row .material-symbols-rounded { font-size: 16px; color: var(--text-3); }
.impact-val { font-size: 13px; font-weight: 700; color: var(--text); font-family: var(--font-display); }
.impact-meta { font-size: 10px; color: var(--text-3); }

/* Footer */
.add-panel__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  flex-shrink: 0;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--dur-fast);
  border: none;
}
.btn--ghost {
  background: var(--surface-2);
  color: var(--text-2);
  border: 1px solid var(--border);
}
.btn--ghost:hover { background: var(--surface-3); color: var(--text); }
.btn--primary {
  flex: 1;
  justify-content: center;
  background: var(--accent);
  color: var(--navy);
  font-weight: 600;
}
.btn--primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn .material-symbols-rounded { font-size: 16px; }

/* Scope selector */
.scope-row {
  display: flex;
  gap: 6px;
}
.scope-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: all var(--dur-fast);
  line-height: 1.2;
  text-align: center;
}
.scope-chip__icon { font-size: 18px; }
.scope-chip:hover { border-color: var(--accent); color: var(--accent); }
.scope-chip--active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent-dark);
}

/* Transition */
.panel-slide-enter-active, .panel-slide-leave-active { transition: all 0.25s var(--ease); }
.panel-slide-enter-from, .panel-slide-leave-to { opacity: 0; }
.panel-slide-enter-from .add-panel, .panel-slide-leave-to .add-panel { transform: scale(0.96) translateY(8px); }
</style>

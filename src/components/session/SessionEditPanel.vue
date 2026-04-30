<template>
  <transition name="slide-right">
    <div
      v-if="uiStore.editPanelOpen && session"
      ref="panelRef"
      class="edit-panel"
      role="dialog"
      aria-modal="true"
      :aria-label="`Editar sessió: ${session.label}`"
      @keydown.esc.prevent="uiStore.closeEditPanel()"
    >
      <div class="edit-panel__header">
        <div class="edit-panel__title-row">
          <div class="edit-panel__icon" :style="{ background: typeData.color + '20', color: typeData.color }">
            <span class="material-symbols-rounded">{{ typeData.icon }}</span>
          </div>
          <div>
            <h3 class="edit-panel__title">{{ session.label }}</h3>
            <span class="edit-panel__day">{{ dayName }}</span>
          </div>
        </div>
        <button ref="closeBtnRef" class="close-btn" @click="uiStore.closeEditPanel()" aria-label="Tancar">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <div class="edit-panel__body">
        <!-- Duration field -->
        <div class="field">
          <label id="duration-label" class="field__label">Durada</label>
          <div class="duration-picker" role="group" aria-labelledby="duration-label" aria-describedby="duration-hint">
            <button
              v-for="opt in durationOptions"
              :key="opt.value"
              class="dur-opt"
              :class="{ active: localDuration === opt.value }"
              @click="localDuration = opt.value"
              :aria-pressed="localDuration === opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <p id="duration-hint" class="field__hint">Durada actual: <strong>{{ formatDuration(localDuration) }}</strong></p>
        </div>

        <!-- Intensity field -->
        <div class="field">
          <label id="intensity-label" class="field__label">Intensitat</label>
          <div class="intensity-picker" role="group" aria-labelledby="intensity-label" aria-describedby="intensity-hint">
            <button
              v-for="lvl in intensityOptions"
              :key="lvl.value"
              class="int-opt"
              :class="[`int-opt--${lvl.key}`, { active: localIntensity === lvl.value }]"
              @click="localIntensity = lvl.value"
              :aria-pressed="localIntensity === lvl.value"
            >
              <span class="material-symbols-rounded">{{ lvl.icon }}</span>
              {{ lvl.value }}
            </button>
          </div>
          <p id="intensity-hint" class="field__hint">Selecciona la percepció de càrrega de la sessió.</p>
        </div>

        <!-- Notes -->
        <div class="field">
          <label class="field__label" for="notes">Notes (opcional)</label>
          <textarea
            id="notes"
            v-model="localNotes"
            class="field__textarea"
            placeholder="Descriu la sessió..."
            rows="3"
            aria-describedby="notes-hint"
          ></textarea>
          <p id="notes-hint" class="field__hint">Afegeix observacions sobre la sessió o la recuperació.</p>
        </div>

        <!-- Impact preview -->
        <div class="impact-box" v-if="hasChanges">
          <div class="impact-box__header">
            <span class="material-symbols-rounded">auto_awesome</span>
            Impacte estimat
          </div>
          <div class="impact-row">
            <span>Calories cremades:</span>
            <span class="impact-val">~{{ estimatedKcal }} kcal</span>
          </div>
          <div class="impact-row" v-if="localIntensity === 'Alta'">
            <span>Requeriment nutricional:</span>
            <span class="impact-val impact-val--warn">+15% kcal</span>
          </div>
        </div>
      </div>

      <div class="edit-panel__footer">
        <button class="btn btn--ghost" @click="uiStore.closeEditPanel()">Ara no</button>
        <button class="btn btn--danger" @click="deleteSession">
          <span class="material-symbols-rounded">delete_outline</span>
          Elimina la sessió
        </button>
        <button class="btn btn--primary" @click="applyChanges" :disabled="!hasChanges">
          <span class="material-symbols-rounded">check</span>
          Aplica el canvi
        </button>
      </div>
    </div>
  </transition>

  <!-- Backdrop -->
  <transition name="fade">
    <div v-if="uiStore.editPanelOpen" class="backdrop" @click="uiStore.closeEditPanel()" aria-hidden="true"></div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()
const panelRef = ref(null)
const closeBtnRef = ref(null)
let lastFocusedElement = null

const session = computed(() => {
  if (!uiStore.editingSessionId) return null
  return weekStore.getSessionById(uiStore.editingSessionId)
})

const typeData = computed(() => {
  if (!session.value) return { icon: 'fitness_center', color: 'var(--purple)', label: '' }
  return weekStore.sessionTypes[session.value.type] ?? { icon: 'fitness_center', color: 'var(--purple)', label: '' }
})

const dayName = computed(() => session.value ? weekStore.daysFull[session.value.day] : '')

const localDuration = ref(60)
const localIntensity = ref('Moderada')
const localNotes = ref('')

watch(session, (s) => {
  if (s) {
    localDuration.value = s.duration
    localIntensity.value = s.intensity
    localNotes.value = s.notes || ''
  }
}, { immediate: true })

watch(() => uiStore.editPanelOpen, async (open) => {
  if (open) {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    closeBtnRef.value?.focus()
    return
  }

  await nextTick()
  lastFocusedElement?.focus?.()
  lastFocusedElement = null
})

const hasChanges = computed(() => {
  if (!session.value) return false
  return localDuration.value !== session.value.duration ||
    localIntensity.value !== session.value.intensity
})

const durationOptions = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2h' },
  { value: 180, label: '3h' },
  { value: 240, label: '4h' },
]

const intensityOptions = [
  { value: 'Baixa', key: 'low', icon: 'battery_1_bar' },
  { value: 'Moderada', key: 'med', icon: 'battery_3_bar' },
  { value: 'Alta', key: 'high', icon: 'battery_full' },
]

const estimatedKcal = computed(() => {
  const rate = localIntensity.value === 'Alta' ? 560 : localIntensity.value === 'Baixa' ? 280 : 400
  return Math.round((localDuration.value / 60) * rate)
})

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function applyChanges() {
  if (!session.value || !hasChanges.value) return
  const sessionSnapshot = {
    id: session.value.id,
    day: session.value.day,
    duration: localDuration.value,
    intensity: localIntensity.value
  }
  weekStore.updateSession(session.value.id, {
    duration: localDuration.value,
    intensity: localIntensity.value,
    notes: localNotes.value
  })
  uiStore.closeEditPanel()

  // Trigger AI popover if intensity is high or duration > 180
  if (localIntensity.value === 'Alta' || localDuration.value >= 240) {
    setTimeout(() => {
      uiStore.showAIPopover({
        sessionId: sessionSnapshot.id,
        day: sessionSnapshot.day,
        duration: localDuration.value,
        intensity: localIntensity.value,
        message: `La sessió de ${formatDuration(localDuration.value)} d'intensitat ${localIntensity.value.toLowerCase()} requereix energia extra. Afegeix hidrats (ex: arròs o pasta) al teu sopar d'avui.`,
        extraKcal: 300
      })
    }, 400)
  } else {
    uiStore.showToast('Fet! Sessió actualitzada correctament.', 'success')
  }
}

function deleteSession() {
  if (!session.value) return
  const label = session.value.label
  weekStore.removeSession(session.value.id)
  uiStore.closeEditPanel()
  uiStore.showToast(`Sessió eliminada: ${label}.`, 'info')
}
</script>

<style scoped>
.edit-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.edit-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.edit-panel__title-row { display: flex; align-items: center; gap: 12px; }
.edit-panel__icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.edit-panel__icon .material-symbols-rounded { font-size: 22px; }
.edit-panel__title { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.edit-panel__day { font-size: 12px; color: var(--text-3); }

.close-btn {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  flex-shrink: 0;
  transition: all var(--dur-fast);
}
.close-btn:hover { background: var(--surface-3); color: var(--text); }

.edit-panel__body { flex: 1; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }

.field { display: flex; flex-direction: column; gap: 8px; }
.field__label { font-size: 12px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; }
.field__hint { font-size: 12px; color: var(--text-3); }

/* Duration picker */
.duration-picker { display: flex; flex-wrap: wrap; gap: 6px; }
.dur-opt {
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  background: var(--surface);
  transition: all var(--dur-fast);
}
.dur-opt:hover { border-color: var(--accent); color: var(--accent); }
.dur-opt.active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 600; }

/* Intensity picker */
.intensity-picker { display: flex; gap: 8px; }
.int-opt {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  background: var(--surface);
  transition: all var(--dur-fast);
}
.int-opt:hover { border-color: var(--border-2); }
.int-opt .material-symbols-rounded { font-size: 22px; }
.int-opt--low.active { background: var(--intensity-low-bg); border-color: var(--intensity-low-border); color: var(--intensity-low-text); }
.int-opt--med.active { background: var(--accent-light); border-color: var(--accent); color: var(--accent-dark); }
.int-opt--high.active { background: var(--warning-light); border-color: var(--warning); color: var(--warning); }

/* Textarea */
.field__textarea {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
  resize: none;
  transition: border-color var(--dur-fast);
  outline: none;
}
.field__textarea:focus { border-color: var(--accent); }
.field__textarea::placeholder { color: var(--text-3); }

/* Impact box */
.impact-box {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  animation: fadeInUp 0.3s var(--ease) both;
}
.impact-box__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 10px;
}
.impact-box__header .material-symbols-rounded { font-size: 16px; color: var(--accent); }
.impact-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-2);
  padding: 3px 0;
}
.impact-val { font-weight: 600; color: var(--text); }
.impact-val--warn { color: var(--warning); }

/* Footer */
.edit-panel__footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all var(--dur-fast);
}
.btn--primary { background: var(--accent); color: var(--navy); }
.btn--primary:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--ghost { background: transparent; color: var(--text-2); border: 1px solid var(--border); }
.btn--ghost:hover { background: var(--surface-2); }
.btn .material-symbols-rounded { font-size: 16px; }

.backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(2px);
  z-index: 199;
}

/* Transition */
.slide-right-enter-active { animation: slideInRight 0.35s var(--ease) both; }
.slide-right-leave-active {
  transition: opacity 0.25s ease, transform 0.25s var(--ease);
}
.slide-right-leave-to { opacity: 0; transform: translateX(24px); }
</style>

<template>
  <div class="library">
    <div class="library__header">
      <div class="library__title">
        <span class="material-symbols-rounded" aria-hidden="true">library_books</span>
        Biblioteca de sessions
      </div>
    </div>

    <div class="library__body">
      <p class="library__hint">
        Pots arrossegar una sessió o seleccionar-la amb teclat i després col·locar-la en un dia del calendari.
      </p>
      <div class="library__list">
        <div
          v-for="(typeData, key) in sessionTypes"
          :key="key"
          class="lib-card"
          :class="{ 'lib-card--selected': isSelected(key) }"
          :style="{ '--card-color': typeData.color }"
          draggable="true"
          @dragstart="handleDragStart(key, $event)"
          @dragend="handleDragEnd"
          @click="handleKeyboardSelect(key)"
          @keydown.enter.prevent="handleKeyboardSelect(key)"
          @keydown.space.prevent="handleKeyboardSelect(key)"
          :aria-label="`${typeData.label} – Arrossega per afegir al calendari`"
          role="button"
          tabindex="0"
          :aria-pressed="isSelected(key)"
          :aria-grabbed="isSelected(key)"
        >
          <div class="lib-card__bar" aria-hidden="true"></div>
          
          <div class="lib-card__icon">
            <span class="material-symbols-rounded">{{ typeData.icon }}</span>
          </div>
          
          <div class="lib-card__content">
            <span class="lib-card__title">{{ typeData.label }}</span>
            <span class="lib-card__duration">60 min</span>
          </div>
        </div>
      </div>

      <div v-if="uiStore.keyboardPlacementSessionType" class="library__keyboard-state">
        <span class="library__keyboard-state-label">Sessió seleccionada</span>
        <strong>{{ sessionTypes[uiStore.keyboardPlacementSessionType].label }}</strong>
        <button class="library__clear" @click="uiStore.cancelKeyboardSessionPlacement()">Cancel·la</button>
      </div>

      <!-- New activity form -->
      <div v-if="showNewForm" class="new-activity-form">
        <div class="new-activity-form__field">
          <label class="new-activity-form__label">Nom de l'activitat</label>
          <input
            v-model="newName"
            class="new-activity-form__input"
            type="text"
            placeholder="Ex: Senderisme, Padel..."
            maxlength="40"
            ref="nameInputRef"
            @keydown.enter="submitNewActivity"
            @keydown.esc="showNewForm = false"
          />
        </div>
        <div class="new-activity-form__field">
          <label class="new-activity-form__label">Descripció (opcional)</label>
          <input
            v-model="newDescription"
            class="new-activity-form__input"
            type="text"
            placeholder="Ex: Senderisme de muntanya amb desnivell..."
            maxlength="80"
            @keydown.esc="showNewForm = false"
          />
        </div>
        <div class="new-activity-form__ai">
          <span class="material-symbols-rounded new-activity-form__ai-icon">auto_awesome</span>
          <span>IA estima: <strong>~{{ aiKcal }} kcal/h</strong></span>
        </div>
        <div class="new-activity-form__actions">
          <button class="new-activity-form__cancel" @click="showNewForm = false">Cancel·la</button>
          <button
            class="new-activity-form__submit"
            :disabled="!newName.trim()"
            @click="submitNewActivity"
          >
            <span class="material-symbols-rounded">add</span>
            Afegir activitat
          </button>
        </div>
      </div>

      <button v-if="!showNewForm" class="library__add-btn" @click="openNewForm">
        <span class="material-symbols-rounded">add_circle</span>
        Nova activitat
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useWeekStore } from '@/stores/weekStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()
const sessionTypes = weekStore.sessionTypes
const emit = defineEmits(['add-session'])

const showNewForm = ref(false)
const newName = ref('')
const newDescription = ref('')
const nameInputRef = ref(null)

const EXTRA_COLORS = ['#F97316', '#84CC16', '#EC4899', '#14B8A6', '#A855F7', '#F43F5E', '#64748B', '#D97706']

const HIGH_KW   = ['crossfit', 'hiit', 'boxeo', 'combat', 'sprint', 'interval', 'intens', 'alta', 'spinning']
const MED_HI_KW = ['córrer', 'correr', 'running', 'natació', 'natacion', 'swimming', 'cycling', 'ciclisme', 'bici', 'remo', 'rem', 'padel', 'tennis', 'futbol', 'basket', 'bàsquet', 'voleibol', 'handbol', 'squash', 'surf', 'escalada', 'climbing']
const LOW_KW    = ['ioga', 'yoga', 'pilates', 'estiraments', 'meditació', 'caminar', 'passeig', 'tai chi', 'mobilitat', 'respiració']

const aiKcal = computed(() => {
  const text = (newName.value + ' ' + newDescription.value).toLowerCase()
  if (HIGH_KW.some(k => text.includes(k)))   return 600
  if (MED_HI_KW.some(k => text.includes(k))) return 490
  if (LOW_KW.some(k => text.includes(k)))    return 230
  return 380
})

function guessIcon(name, desc) {
  const t = (name + ' ' + desc).toLowerCase()
  if (t.includes('futbol'))                         return 'sports_soccer'
  if (t.includes('tennis') || t.includes('padel'))  return 'sports_tennis'
  if (t.includes('basket') || t.includes('bàsquet')) return 'sports_basketball'
  if (t.includes('escalada') || t.includes('climbing')) return 'landscape'
  if (t.includes('rem') || t.includes('kayak'))     return 'rowing'
  if (t.includes('senderisme') || t.includes('hiking')) return 'hiking'
  if (t.includes('caminar') || t.includes('passeig')) return 'directions_walk'
  if (t.includes('boxeo') || t.includes('combat'))  return 'sports_martial_arts'
  if (t.includes('dansa') || t.includes('ball'))    return 'nightlife'
  if (t.includes('ioga') || t.includes('yoga') || t.includes('pilates')) return 'self_improvement'
  if (t.includes('natació') || t.includes('swimming') || t.includes('piscina')) return 'pool'
  if (t.includes('bici') || t.includes('cycling') || t.includes('ciclisme')) return 'directions_bike'
  if (t.includes('corre') || t.includes('running')) return 'directions_run'
  if (t.includes('spinning'))                       return 'pedal_bike'
  return 'sports'
}

async function openNewForm() {
  showNewForm.value = true
  newName.value = ''
  newDescription.value = ''
  await nextTick()
  nameInputRef.value?.focus()
}

function submitNewActivity() {
  const name = newName.value.trim()
  if (!name) return
  const key = 'custom_' + Date.now()
  const existingCount = Object.keys(sessionTypes).filter(k => k.startsWith('custom_')).length
  const color = EXTRA_COLORS[existingCount % EXTRA_COLORS.length]
  const icon = guessIcon(name, newDescription.value)
  weekStore.addSessionType(key, name, icon, color, aiKcal.value)
  uiStore.showToast(`Nova activitat "${name}" afegida a la biblioteca.`, 'success')
  showNewForm.value = false
}

function handleDragStart(type, event) {
  event.dataTransfer.setData('session-type', type)
  event.dataTransfer.effectAllowed = 'copy'
}

function handleDragEnd() {}

function handleKeyboardSelect(type) {
  if (uiStore.keyboardPlacementSessionType === type) {
    uiStore.cancelKeyboardSessionPlacement()
    uiStore.showToast('Selecció de sessió cancel·lada.', 'info')
    return
  }
  uiStore.startKeyboardSessionPlacement(type)
  uiStore.showToast(`Seleccionada ${sessionTypes[type].label}. Tria un dia del calendari i prem Enter.`, 'info')
}

function isSelected(type) {
  return uiStore.keyboardPlacementSessionType === type
}
</script>

<style scoped>
.library {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.library__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.library__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.library__title .material-symbols-rounded {
  font-size: 18px;
  color: var(--accent);
}

.library__body {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.library__hint {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.5;
}

.library__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lib-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  border: 1px solid var(--border);
  cursor: grab;
  transition: all var(--dur-fast);
  outline: none;
  position: relative;
  overflow: hidden;
}

.lib-card:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.lib-card:hover {
  background: var(--surface-3);
  border-color: var(--card-color);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--card-color) 20%, transparent);
  transform: translateY(-2px);
}

.lib-card--selected {
  border-color: var(--accent);
  background: var(--accent-light);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 20%, transparent);
}

.lib-card:focus-visible {
  outline: 2px solid var(--card-color);
  outline-offset: 2px;
}

.lib-card__bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--card-color);
  pointer-events: none;
}

.lib-card__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--card-color) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lib-card__icon .material-symbols-rounded {
  color: var(--card-color);
  font-size: 20px;
}

.lib-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 4px;
}

.lib-card__title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.lib-card__duration {
  display: block;
  font-size: 11px;
  color: var(--text-3);
}

.library__keyboard-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  font-size: 12px;
  color: var(--text-2);
}

.library__keyboard-state-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: var(--text-3);
}

.library__clear {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-dark);
}

/* Add activity button */
.library__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-md);
  border: 1.5px dashed var(--border);
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.library__add-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
.library__add-btn .material-symbols-rounded { font-size: 16px; }

/* New activity form */
.new-activity-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--accent);
  background: var(--accent-light);
  animation: fadeInUp 0.2s var(--ease) both;
}
.new-activity-form__field { display: flex; flex-direction: column; gap: 4px; }
.new-activity-form__label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.new-activity-form__input {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: border-color var(--dur-fast);
}
.new-activity-form__input:focus { border-color: var(--accent); }
.new-activity-form__input::placeholder { color: var(--text-3); }

.new-activity-form__ai {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-2);
}
.new-activity-form__ai-icon { font-size: 14px; color: var(--accent); }

.new-activity-form__actions {
  display: flex;
  gap: 8px;
}
.new-activity-form__cancel {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.new-activity-form__cancel:hover { color: var(--text); background: var(--surface-2); }
.new-activity-form__submit {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--navy);
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.new-activity-form__submit:disabled { opacity: 0.4; cursor: not-allowed; }
.new-activity-form__submit:not(:disabled):hover { background: var(--accent-dark); }
.new-activity-form__submit .material-symbols-rounded { font-size: 14px; }
</style>

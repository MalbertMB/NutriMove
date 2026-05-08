<template>
  <div v-if="meal" class="meal-detail">
    <!-- Header summary -->
    <header class="detail-header">
      <div class="detail-header__title-row">
        <div class="detail-header__icon">
          <span class="material-symbols-rounded">restaurant</span>
        </div>
        <div>
          <h3 class="detail-header__title">{{ dayName }}</h3>
          <span class="detail-header__date">{{ weekStore.currentWeekLabel }}</span>
        </div>
      </div>
      <div class="detail-header__stats">
        <div class="totals-kcal">
          <span class="totals-kcal__num">{{ meal.total }}</span>
          <span class="totals-kcal__label">kcal</span>
          <span class="totals-target">/ {{ meal.targetKcal }} obj.</span>
        </div>
        <div class="status-badge" :class="`status-badge--${meal.status}`">
          <span class="material-symbols-rounded icon-fill">{{ meal.status === 'ok' ? 'check_circle' : 'warning' }}</span>
          {{ meal.status === 'ok' ? 'Cobert' : 'Revisar' }}
        </div>
      </div>
    </header>

    <!-- Macros -->
    <div class="detail-section">
      <MacroBar
        :carbs="totalMacro('carbs')"
        :protein="totalMacro('protein')"
        :fat="totalMacro('fat')"
      />
    </div>

    <!-- AI summary (subtle) -->
    <div v-if="aiSummary" class="ai-summary">
      <span class="material-symbols-rounded icon-fill">auto_awesome</span>
      <span class="ai-summary__text">
        L'Assistent NutriMove ha aplicat:
        <strong>+{{ aiSummary.kcal }} kcal</strong>
        <span v-if="aiSummary.carbs">· +{{ aiSummary.carbs }}g HC</span>
        <span v-if="aiSummary.protein">· +{{ aiSummary.protein }}g Prot</span>
        ({{ aiSummary.count }} canvi{{ aiSummary.count === 1 ? '' : 's' }})
      </span>
    </div>

    <!-- Sessions del dia -->
    <div v-if="daySessions.length" class="detail-section">
      <h4 class="section-title">Sessions del dia</h4>
      <div class="day-sessions__list">
        <div
          v-for="s in daySessions"
          :key="s.id"
          class="session-row"
          :style="{ '--row-color': weekStore.sessionTypes[s.type]?.color }"
        >
          <span class="material-symbols-rounded session-row__icon">{{ weekStore.sessionTypes[s.type]?.icon }}</span>
          <div class="session-row__body">
            <span class="session-row__label">{{ s.label }}</span>
            <span class="session-row__meta">{{ formatDuration(s.duration) }} · {{ s.intensity }}</span>
          </div>
          <span class="session-row__kcal">{{ s.kcal }} kcal</span>
        </div>
      </div>
    </div>

    <!-- Meal slots -->
    <div class="detail-section">
      <h4 class="section-title">Àpats</h4>
      <div class="meal-slots">
        <div
          v-for="slot in SLOTS"
          :key="slot"
          class="meal-slot"
          :class="{ 'meal-slot--open': editingSlot === slot, 'meal-slot--ai': hasAi(slot) }"
        >
          <div class="meal-slot__row">
            <span class="meal-slot__icon material-symbols-rounded">{{ slotIcon(slot) }}</span>
            <div class="meal-slot__body">
              <div class="meal-slot__head">
                <span class="meal-slot__name">{{ meal[slot]?.label }}</span>
                <span v-if="hasAi(slot)" class="ai-tag" :title="aiTooltip(slot)">
                  <span class="material-symbols-rounded icon-fill">auto_awesome</span>
                  IA +{{ aiTotalKcal(slot) }} kcal
                </span>
              </div>
              <span class="meal-slot__items">{{ (meal[slot]?.items || []).join(', ') }}</span>
            </div>
            <span class="meal-slot__kcal">{{ meal[slot]?.kcal }} kcal</span>
            <button
              class="meal-slot__edit-btn"
              :class="{ 'meal-slot__edit-btn--active': editingSlot === slot }"
              :aria-label="editingSlot === slot ? 'Tancar editor' : `Modificar ${meal[slot]?.label}`"
              @click.stop="toggleSlotEditor(slot)"
            >
              <span class="material-symbols-rounded">{{ editingSlot === slot ? 'close' : 'edit' }}</span>
            </button>
          </div>

          <transition name="slot-expand">
            <div v-if="editingSlot === slot" class="meal-slot__editor">
              <div class="editor-search">
                <div class="editor-search__wrap">
                  <span class="material-symbols-rounded editor-search__icon">search</span>
                  <input
                    type="text"
                    class="editor-search__input"
                    placeholder="Cerca un aliment..."
                    v-model="searchQuery"
                    @input="onSearchInput"
                    @focus="showAutocomplete = true"
                    @blur="onSearchBlur"
                    autocomplete="off"
                  />
                  <button
                    v-if="searchQuery"
                    class="editor-search__clear"
                    aria-label="Esborra la cerca"
                    @mousedown.prevent="clearSearch"
                  >
                    <span class="material-symbols-rounded">close</span>
                  </button>
                </div>
                <ul v-if="showAutocomplete && searchResults.length && !selectedFood" class="editor-autocomplete">
                  <li
                    v-for="food in searchResults"
                    :key="food.name"
                    class="editor-autocomplete__item"
                    @mousedown.prevent="selectFood(food)"
                  >
                    <span class="food-name">{{ food.name }}</span>
                    <span class="food-meta">{{ food.kcal }} kcal · {{ food.carbs }}g HC · {{ food.protein }}g Prot</span>
                  </li>
                </ul>
              </div>

              <div class="editor-qty-row">
                <label class="editor-label">Quantitat</label>
                <div class="editor-qty">
                  <input
                    type="number"
                    class="editor-qty__input"
                    v-model.number="quantity"
                    min="1"
                    max="2000"
                  />
                  <select class="editor-qty__unit" v-model="selectedUnit">
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="unitat">unitat</option>
                  </select>
                </div>
              </div>

              <transition name="preview-fade">
                <div v-if="nutritionPreview" class="editor-preview">
                  <span class="preview-pill">+{{ nutritionPreview.kcal }} kcal</span>
                  <span class="preview-pill preview-pill--carbs">+{{ nutritionPreview.carbs }}g HC</span>
                  <span class="preview-pill preview-pill--protein">+{{ nutritionPreview.protein }}g Prot</span>
                  <span class="preview-pill preview-pill--fat">+{{ nutritionPreview.fat }}g Greix</span>
                </div>
              </transition>

              <div class="editor-actions">
                <button class="btn btn--ghost" @click="closeSlotEditor">Ara no</button>
                <button
                  class="btn btn--primary"
                  :disabled="!selectedFood"
                  @click="saveSlotEdit(slot, meal[slot]?.label)"
                >
                  <span class="material-symbols-rounded">check</span>
                  Desa l'àpat
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import MacroBar from '@/components/ui/MacroBar.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const props = defineProps({
  dayIndex: { type: Number, required: true },
})

const weekStore = useWeekStore()
const uiStore = useUIStore()

const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner']

const meal = computed(() => weekStore.meals[props.dayIndex] ?? null)
const dayName = computed(() => weekStore.daysFull[props.dayIndex] ?? '')
const daySessions = computed(() => weekStore.sessionsByDay[props.dayIndex] || [])

function slotIcon(slot) {
  return { breakfast: 'wb_sunny', lunch: 'lunch_dining', snack: 'cookie', dinner: 'dinner_dining' }[slot] ?? 'restaurant'
}

function totalMacro(macro) {
  if (!meal.value) return 0
  return SLOTS.reduce((s, slot) => s + (meal.value[slot]?.[macro] || 0), 0)
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), r = mins % 60
  return r ? `${h}h ${r}min` : `${h}h`
}

function hasAi(slot) {
  return (meal.value?.[slot]?.aiAdjustments?.length ?? 0) > 0
}

function aiTotalKcal(slot) {
  return (meal.value?.[slot]?.aiAdjustments ?? []).reduce((s, a) => s + (a.kcal || 0), 0)
}

function aiTooltip(slot) {
  const adj = meal.value?.[slot]?.aiAdjustments ?? []
  return adj.map(a => `${a.item || 'Reforç'}: +${a.kcal || 0} kcal`).join(' · ')
}

const aiSummary = computed(() => {
  if (!meal.value) return null
  const all = SLOTS.flatMap(s => meal.value[s]?.aiAdjustments ?? [])
  if (!all.length) return null
  return {
    count: all.length,
    kcal: all.reduce((s, a) => s + (a.kcal || 0), 0),
    carbs: all.reduce((s, a) => s + (a.carbs || 0), 0),
    protein: all.reduce((s, a) => s + (a.protein || 0), 0),
  }
})

// Food database
const FOODS = [
  { name: 'Arròs blanc cuit', kcal: 130, carbs: 28, protein: 2.7, fat: 0.3 },
  { name: 'Arròs integral cuit', kcal: 112, carbs: 23, protein: 2.6, fat: 0.9 },
  { name: 'Pasta integral cuita', kcal: 124, carbs: 23, protein: 5, fat: 1 },
  { name: 'Pasta blanca cuita', kcal: 131, carbs: 25, protein: 5, fat: 1.1 },
  { name: 'Quinoa cuita', kcal: 120, carbs: 21, protein: 4.4, fat: 1.9 },
  { name: 'Pa integral', kcal: 247, carbs: 41, protein: 9, fat: 3.5 },
  { name: 'Pit de pollastre', kcal: 165, carbs: 0, protein: 31, fat: 3.6 },
  { name: 'Pit de gall dindi', kcal: 135, carbs: 0, protein: 28, fat: 2 },
  { name: 'Salmó', kcal: 208, carbs: 0, protein: 20, fat: 13 },
  { name: 'Tonyina al natural', kcal: 116, carbs: 0, protein: 26, fat: 1 },
  { name: 'Ou sencer', kcal: 155, carbs: 1.1, protein: 13, fat: 11 },
  { name: 'Tofu', kcal: 76, carbs: 2, protein: 8, fat: 4.5 },
  { name: 'Seitàn', kcal: 125, carbs: 6, protein: 25, fat: 2 },
  { name: 'Llentilles cuites', kcal: 116, carbs: 20, protein: 9, fat: 0.4 },
  { name: 'Cigrons cuits', kcal: 164, carbs: 27, protein: 9, fat: 2.6 },
  { name: 'Fesols cuits', kcal: 127, carbs: 22, protein: 8, fat: 0.5 },
  { name: 'Farina de civada', kcal: 371, carbs: 56, protein: 13, fat: 7 },
  { name: 'Llet semi', kcal: 47, carbs: 4.9, protein: 3.4, fat: 1.5 },
  { name: 'Iogurt grec', kcal: 97, carbs: 3.6, protein: 9, fat: 5 },
  { name: 'Mató', kcal: 98, carbs: 3, protein: 11, fat: 4.3 },
  { name: 'Plàtan', kcal: 89, carbs: 23, protein: 1.1, fat: 0.3 },
  { name: 'Poma', kcal: 52, carbs: 14, protein: 0.3, fat: 0.2 },
  { name: 'Taronja', kcal: 47, carbs: 12, protein: 0.9, fat: 0.1 },
  { name: 'Raïm', kcal: 69, carbs: 18, protein: 0.7, fat: 0.2 },
  { name: 'Bròcoli cuit', kcal: 35, carbs: 5, protein: 3, fat: 0.5 },
  { name: 'Espinacs cuits', kcal: 23, carbs: 3.6, protein: 3, fat: 0.5 },
  { name: 'Tomàquet', kcal: 18, carbs: 3.9, protein: 0.9, fat: 0.2 },
  { name: 'Avocado', kcal: 160, carbs: 9, protein: 2, fat: 15 },
  { name: 'Ametlles', kcal: 579, carbs: 22, protein: 21, fat: 50 },
  { name: 'Nous', kcal: 654, carbs: 14, protein: 15, fat: 65 },
  { name: 'Fruits secs mixtos', kcal: 607, carbs: 14, protein: 21, fat: 55 },
  { name: 'Mantega de cacauet', kcal: 598, carbs: 20, protein: 22, fat: 50 },
  { name: 'Mel', kcal: 304, carbs: 82, protein: 0.3, fat: 0 },
  { name: "Oli d'oliva", kcal: 884, carbs: 0, protein: 0, fat: 100 },
  { name: 'Barreta energètica', kcal: 380, carbs: 58, protein: 10, fat: 11 },
  { name: 'Batut de proteïnes', kcal: 120, carbs: 6, protein: 24, fat: 2 },
  { name: 'Mozzarella', kcal: 280, carbs: 2.2, protein: 17, fat: 22 },
  { name: 'Formatge cottage', kcal: 98, carbs: 3.4, protein: 11, fat: 4.3 },
]
const UNIT_GRAMS = { g: 1, ml: 1, unitat: 100 }

const editingSlot = ref(null)
const searchQuery = ref('')
const selectedFood = ref(null)
const quantity = ref(100)
const selectedUnit = ref('g')
const showAutocomplete = ref(false)

const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  const q = searchQuery.value.toLowerCase()
  return FOODS.filter(f => f.name.toLowerCase().includes(q)).slice(0, 7)
})

const nutritionPreview = computed(() => {
  if (!selectedFood.value || !quantity.value) return null
  const grams = quantity.value * UNIT_GRAMS[selectedUnit.value]
  return {
    kcal:    Math.round(selectedFood.value.kcal    * grams / 100),
    carbs:   Math.round(selectedFood.value.carbs   * grams / 100),
    protein: Math.round(selectedFood.value.protein * grams / 100),
    fat:     Math.round(selectedFood.value.fat     * grams / 100),
  }
})

function toggleSlotEditor(slot) {
  if (editingSlot.value === slot) {
    closeSlotEditor()
  } else {
    editingSlot.value = slot
    searchQuery.value = ''
    selectedFood.value = null
    quantity.value = 100
    selectedUnit.value = 'g'
    showAutocomplete.value = false
    nextTick(() => document.querySelector('.editor-search__input')?.focus())
  }
}

function closeSlotEditor() { editingSlot.value = null }
function onSearchInput()    { selectedFood.value = null; showAutocomplete.value = true }
function onSearchBlur()     { setTimeout(() => { showAutocomplete.value = false }, 150) }
function clearSearch()      { searchQuery.value = ''; selectedFood.value = null }
function selectFood(food)   { selectedFood.value = food; searchQuery.value = food.name }

function saveSlotEdit(slot, slotLabel) {
  if (!selectedFood.value) return
  const grams = quantity.value * UNIT_GRAMS[selectedUnit.value]
  weekStore.addFoodToSlot(props.dayIndex, slot, {
    name:    selectedFood.value.name,
    kcal:    Math.round(selectedFood.value.kcal    * grams / 100),
    carbs:   Math.round(selectedFood.value.carbs   * grams / 100),
    protein: Math.round(selectedFood.value.protein * grams / 100),
    fat:     Math.round(selectedFood.value.fat     * grams / 100),
  })
  const label = slotLabel?.toLowerCase() ?? slot
  uiStore.showToast(`${selectedFood.value.name} afegit al ${label}.`, 'success')
  closeSlotEditor()
}

watch(() => props.dayIndex, () => closeSlotEditor())
</script>

<style scoped>
.meal-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.detail-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.detail-header__title-row { display: flex; align-items: center; gap: 12px; }
.detail-header__icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.detail-header__icon .material-symbols-rounded { font-size: 22px; }
.detail-header__title { font-family: var(--font-display); font-size: 17px; font-weight: 700; }
.detail-header__date { font-size: 12px; color: var(--text-3); }

.detail-header__stats { display: flex; align-items: center; gap: 14px; }
.totals-kcal { display: flex; align-items: baseline; gap: 4px; }
.totals-kcal__num { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text); }
.totals-kcal__label { font-size: 12px; color: var(--text-3); font-weight: 600; }
.totals-target { font-size: 11px; color: var(--text-3); margin-left: 6px; }

.status-badge {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700;
  padding: 4px 10px; border-radius: 99px;
}
.status-badge .material-symbols-rounded { font-size: 14px; }
.status-badge--ok { background: var(--accent-light); color: var(--accent-dark); }
.status-badge--warning { background: var(--warning-light); color: var(--warning); }

/* AI summary */
.ai-summary {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  background: var(--accent-light);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent);
  font-size: 12px;
  color: var(--accent-dark);
}
.ai-summary .material-symbols-rounded { font-size: 16px; }
.ai-summary__text strong { font-weight: 700; }

.detail-section { display: flex; flex-direction: column; gap: 10px; }
.section-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }

/* Day sessions */
.day-sessions__list { display: flex; flex-direction: column; gap: 6px; }
.session-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--row-color);
}
.session-row__icon { font-size: 18px; color: var(--row-color); flex-shrink: 0; }
.session-row__body { flex: 1; min-width: 0; }
.session-row__label { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
.session-row__meta { font-size: 11px; color: var(--text-3); }
.session-row__kcal { font-size: 12px; font-weight: 600; color: var(--text-2); }

/* Meal slots */
.meal-slots { display: flex; flex-direction: column; gap: 8px; }
.meal-slot {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.meal-slot--open {
  background: color-mix(in srgb, var(--accent) 5%, var(--surface-2));
  border-color: rgba(0, 200, 150, 0.3);
}
.meal-slot--ai {
  border-left: 3px solid var(--accent);
}
.meal-slot__row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; }
.meal-slot__icon { font-size: 17px; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.meal-slot__body { flex: 1; min-width: 0; }
.meal-slot__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.meal-slot__name { font-size: 13px; font-weight: 600; color: var(--text); }
.ai-tag {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 700; color: var(--accent-dark);
  background: var(--accent-light);
  padding: 2px 7px; border-radius: 99px;
  cursor: help;
}
.ai-tag .material-symbols-rounded { font-size: 11px; }
.meal-slot__items { font-size: 11px; color: var(--text-3); display: block; margin-top: 2px; }
.meal-slot__kcal { font-size: 12px; font-weight: 600; color: var(--text-2); white-space: nowrap; }

.meal-slot__edit-btn {
  width: 26px; height: 26px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  flex-shrink: 0;
  transition: background var(--dur-fast), color var(--dur-fast);
}
.meal-slot__edit-btn:hover { background: var(--surface-3); color: var(--accent); }
.meal-slot__edit-btn--active { background: var(--surface-3); color: var(--accent); }
.meal-slot__edit-btn .material-symbols-rounded { font-size: 14px; }

/* Inline editor */
.meal-slot__editor { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 10px; }
.editor-search { position: relative; }
.editor-search__wrap {
  display: flex; align-items: center; gap: 6px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  transition: border-color var(--dur-fast);
}
.editor-search__wrap:focus-within { border-color: var(--accent); }
.editor-search__icon { font-size: 16px; color: var(--text-3); flex-shrink: 0; }
.editor-search__input {
  flex: 1; font-family: var(--font-body); font-size: 13px; color: var(--text);
  background: transparent; outline: none; border: none; min-width: 0;
}
.editor-search__input::placeholder { color: var(--text-3); }
.editor-search__clear {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  color: var(--text-3); flex-shrink: 0;
}
.editor-search__clear:hover { background: var(--surface-3); color: var(--text); }
.editor-search__clear .material-symbols-rounded { font-size: 13px; }

.editor-autocomplete {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow: hidden;
  max-height: 240px;
  overflow-y: auto;
}
.editor-autocomplete__item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 8px 12px; cursor: pointer;
}
.editor-autocomplete__item:not(:last-child) { border-bottom: 1px solid var(--border); }
.editor-autocomplete__item:hover { background: var(--surface-2); }
.food-name { font-size: 12px; font-weight: 500; color: var(--text); }
.food-meta { font-size: 11px; color: var(--text-3); white-space: nowrap; flex-shrink: 0; }

.editor-qty-row { display: flex; align-items: center; gap: 10px; }
.editor-label {
  font-size: 11px; font-weight: 600; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.editor-qty { display: flex; align-items: center; gap: 6px; flex: 1; }
.editor-qty__input {
  width: 72px; padding: 6px 8px;
  font-family: var(--font-body); font-size: 13px; color: var(--text);
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  outline: none; text-align: right;
}
.editor-qty__input:focus { border-color: var(--accent); }
.editor-qty__unit {
  padding: 6px 22px 6px 8px;
  font-family: var(--font-body); font-size: 13px; color: var(--text);
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  outline: none; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 6px center;
}

.editor-preview { display: flex; gap: 5px; flex-wrap: wrap; }
.preview-pill {
  font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 99px;
  background: var(--accent-light); color: var(--accent-dark);
}
.preview-pill--carbs   { background: rgba(99, 102, 241, 0.12); color: #4F46E5; }
.preview-pill--protein { background: rgba(16, 185, 129, 0.12); color: #059669; }
.preview-pill--fat     { background: rgba(245, 158, 11, 0.12); color: #D97706; }

.editor-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all var(--dur-fast); border: none;
}
.btn--ghost { background: var(--surface); color: var(--text-2); border: 1px solid var(--border); }
.btn--ghost:hover { background: var(--surface-3); }
.btn--primary { background: var(--accent); color: var(--navy); font-weight: 600; }
.btn--primary:hover:not(:disabled) { background: var(--accent-dark); }
.btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn .material-symbols-rounded { font-size: 14px; }

.slot-expand-enter-active { transition: opacity 0.22s var(--ease), transform 0.22s var(--ease); }
.slot-expand-leave-active { transition: opacity 0.16s var(--ease), transform 0.16s var(--ease); }
.slot-expand-enter-from, .slot-expand-leave-to { opacity: 0; transform: translateY(-5px); }

.preview-fade-enter-active { transition: opacity 0.2s var(--ease), transform 0.2s var(--ease); }
.preview-fade-leave-active { transition: opacity 0.15s var(--ease); }
.preview-fade-enter-from { opacity: 0; transform: translateY(4px); }
.preview-fade-leave-to { opacity: 0; }
</style>

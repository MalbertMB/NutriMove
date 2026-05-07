<template>
  <div class="meals-view">
    <AppTopBar title="Àpats" subtitle="Planificació nutricional setmanal" />

    <SectionNav
      :items="[
        { label: 'Pla setmanal', target: 'meal-plan', icon: 'calendar_month' },
        { label: 'Log d\'àpats', target: 'meal-log', icon: 'receipt_long' }
      ]"
    />

    <div class="meals-content">
      <div id="meal-plan" class="meals-grid" tabindex="-1">
        <div
          v-for="(meal, i) in weekStore.meals"
          :key="i"
          class="meal-card"
          :class="`meal-card--${meal.status}`"
          :style="{ animationDelay: i * 80 + 'ms' }"
          :aria-label="`Àpats del ${weekStore.daysFull[i]}`"
        >
          <!-- Card header -->
          <div class="meal-card__header">
            <div class="meal-card__day-info">
              <span class="meal-day-name">{{ weekStore.daysFull[i] }}</span>
              <div class="meal-status-badge" :class="`badge--${meal.status}`">
                <span class="material-symbols-rounded icon-fill">{{ meal.status === 'ok' ? 'check_circle' : 'warning' }}</span>
                {{ meal.status === 'ok' ? 'Cobert' : 'Revisar' }}
              </div>
            </div>
            <div class="meal-card__kcal-big">
              <transition name="kcal-count" mode="out-in">
                <span :key="meal.total" class="kcal-num">{{ meal.total }}</span>
              </transition>
              <span class="kcal-target">/ {{ meal.targetKcal }} kcal</span>
            </div>
          </div>

          <!-- Macro bars -->
          <MacroBar
            :carbs="totalMacro(meal, 'carbs')"
            :protein="totalMacro(meal, 'protein')"
            :fat="totalMacro(meal, 'fat')"
          />

          <!-- Meal slots -->
          <div class="meal-slots">
            <div
              v-for="slot in ['breakfast', 'lunch', 'snack', 'dinner']"
              :key="slot"
              class="meal-slot"
              :class="{ 'meal-slot--open': editingKey === `${i}-${slot}` }"
            >
              <!-- Slot row -->
              <div class="meal-slot__row">
                <span class="meal-slot__icon material-symbols-rounded">{{ slotIcon(slot) }}</span>
                <div class="meal-slot__body">
                  <span class="meal-slot__name">{{ meal[slot]?.label }}</span>
                  <span class="meal-slot__items">{{ (meal[slot]?.items || []).join(', ') }}</span>
                </div>
                <transition name="kcal-tick" mode="out-in">
                  <span :key="meal[slot]?.kcal" class="meal-slot__kcal">{{ meal[slot]?.kcal }} kcal</span>
                </transition>
                <button
                  class="meal-slot__edit-btn"
                  :class="{ 'meal-slot__edit-btn--active': editingKey === `${i}-${slot}` }"
                  :aria-label="editingKey === `${i}-${slot}` ? 'Tancar editor' : `Editar ${meal[slot]?.label}`"
                  @click.stop="toggleSlotEditor(i, slot)"
                >
                  <span class="material-symbols-rounded">
                    {{ editingKey === `${i}-${slot}` ? 'close' : 'add' }}
                  </span>
                </button>
              </div>

              <!-- Inline editor -->
              <transition name="slot-expand">
                <div v-if="editingKey === `${i}-${slot}`" class="meal-slot__editor">

                  <!-- Food search -->
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
                    <!-- Autocomplete dropdown -->
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

                  <!-- Quantity row -->
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

                  <!-- Nutrition preview -->
                  <transition name="preview-fade">
                    <div v-if="nutritionPreview" class="editor-preview">
                      <span class="preview-pill">+{{ nutritionPreview.kcal }} kcal</span>
                      <span class="preview-pill preview-pill--carbs">+{{ nutritionPreview.carbs }}g HC</span>
                      <span class="preview-pill preview-pill--protein">+{{ nutritionPreview.protein }}g Prot</span>
                      <span class="preview-pill preview-pill--fat">+{{ nutritionPreview.fat }}g Greix</span>
                    </div>
                  </transition>

                  <!-- Actions -->
                  <div class="editor-actions">
                    <button class="btn btn--ghost" @click="closeSlotEditor">Ara no</button>
                    <button
                      class="btn btn--primary"
                      :disabled="!selectedFood"
                      @click="saveSlotEdit(i, slot, meal[slot]?.label)"
                    >
                      <span class="material-symbols-rounded">check</span>
                      Desa l'àpat
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- AI adjusted badge -->
          <div v-if="meal.aiAdjusted" class="ai-note">
            <span class="material-symbols-rounded icon-fill">auto_awesome</span>
            Ajustat per l'Assistent NutriMove
          </div>
        </div>
      </div>

      <!-- Meal log -->
      <section id="meal-log" class="meal-log" tabindex="-1">
        <div class="meal-log__header">
          <h3 class="meal-log__title">Log d'àpats</h3>
          <p class="meal-log__subtitle">Estat ràpid de cobertura i ajustos d'aquesta setmana.</p>
        </div>
        <div class="meal-log__list">
          <div v-for="(meal, i) in weekStore.meals" :key="i" class="meal-log__row">
            <div>
              <span class="meal-log__day">{{ weekStore.daysFull[i] }}</span>
              <span class="meal-log__meta">{{ meal.total }} / {{ meal.targetKcal }} kcal</span>
            </div>
            <div class="meal-log__status" :class="`meal-log__status--${meal.status}`">
              {{ meal.status === 'ok' ? 'Cobert' : 'Revisar' }}
            </div>
            <span v-if="meal.aiAdjusted" class="meal-log__ai">IA aplicada</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import SectionNav from '@/components/ui/SectionNav.vue'
import MacroBar from '@/components/ui/MacroBar.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()

function slotIcon(slot) {
  return { breakfast: 'wb_sunny', lunch: 'lunch_dining', snack: 'cookie', dinner: 'dinner_dining' }[slot] ?? 'restaurant'
}

function totalMacro(meal, macro) {
  return ['breakfast', 'lunch', 'snack', 'dinner'].reduce((s, slot) => s + (meal[slot]?.[macro] || 0), 0)
}

// ── Food database ────────────────────────────────────────────────────────────
const FOODS = [
  { name: 'Arròs blanc cuit',      kcal: 130, carbs: 28,  protein: 2.7, fat: 0.3  },
  { name: 'Arròs integral cuit',   kcal: 112, carbs: 23,  protein: 2.6, fat: 0.9  },
  { name: 'Pasta integral cuita',  kcal: 124, carbs: 23,  protein: 5,   fat: 1    },
  { name: 'Pasta blanca cuita',    kcal: 131, carbs: 25,  protein: 5,   fat: 1.1  },
  { name: 'Quinoa cuita',          kcal: 120, carbs: 21,  protein: 4.4, fat: 1.9  },
  { name: 'Pa integral',           kcal: 247, carbs: 41,  protein: 9,   fat: 3.5  },
  { name: 'Pit de pollastre',      kcal: 165, carbs: 0,   protein: 31,  fat: 3.6  },
  { name: 'Pit de gall dindi',     kcal: 135, carbs: 0,   protein: 28,  fat: 2    },
  { name: 'Salmó',                 kcal: 208, carbs: 0,   protein: 20,  fat: 13   },
  { name: 'Tonyina al natural',    kcal: 116, carbs: 0,   protein: 26,  fat: 1    },
  { name: 'Ou sencer',             kcal: 155, carbs: 1.1, protein: 13,  fat: 11   },
  { name: 'Tofu',                  kcal: 76,  carbs: 2,   protein: 8,   fat: 4.5  },
  { name: 'Seitàn',                kcal: 125, carbs: 6,   protein: 25,  fat: 2    },
  { name: 'Llentilles cuites',     kcal: 116, carbs: 20,  protein: 9,   fat: 0.4  },
  { name: 'Cigrons cuits',         kcal: 164, carbs: 27,  protein: 9,   fat: 2.6  },
  { name: 'Fesols cuits',          kcal: 127, carbs: 22,  protein: 8,   fat: 0.5  },
  { name: 'Farina de civada',      kcal: 371, carbs: 56,  protein: 13,  fat: 7    },
  { name: 'Llet semi',             kcal: 47,  carbs: 4.9, protein: 3.4, fat: 1.5  },
  { name: 'Iogurt grec',           kcal: 97,  carbs: 3.6, protein: 9,   fat: 5    },
  { name: 'Mató',                  kcal: 98,  carbs: 3,   protein: 11,  fat: 4.3  },
  { name: 'Plàtan',                kcal: 89,  carbs: 23,  protein: 1.1, fat: 0.3  },
  { name: 'Poma',                  kcal: 52,  carbs: 14,  protein: 0.3, fat: 0.2  },
  { name: 'Taronja',               kcal: 47,  carbs: 12,  protein: 0.9, fat: 0.1  },
  { name: 'Raïm',                  kcal: 69,  carbs: 18,  protein: 0.7, fat: 0.2  },
  { name: 'Bròcoli cuit',          kcal: 35,  carbs: 5,   protein: 3,   fat: 0.5  },
  { name: 'Espinacs cuits',        kcal: 23,  carbs: 3.6, protein: 3,   fat: 0.5  },
  { name: 'Tomàquet',              kcal: 18,  carbs: 3.9, protein: 0.9, fat: 0.2  },
  { name: 'Avocado',               kcal: 160, carbs: 9,   protein: 2,   fat: 15   },
  { name: 'Ametlles',              kcal: 579, carbs: 22,  protein: 21,  fat: 50   },
  { name: 'Nous',                  kcal: 654, carbs: 14,  protein: 15,  fat: 65   },
  { name: 'Fruits secs mixtos',    kcal: 607, carbs: 14,  protein: 21,  fat: 55   },
  { name: 'Mantega de cacauet',    kcal: 598, carbs: 20,  protein: 22,  fat: 50   },
  { name: 'Mel',                   kcal: 304, carbs: 82,  protein: 0.3, fat: 0    },
  { name: "Oli d'oliva",           kcal: 884, carbs: 0,   protein: 0,   fat: 100  },
  { name: 'Barreta energètica',    kcal: 380, carbs: 58,  protein: 10,  fat: 11   },
  { name: 'Batut de proteïnes',    kcal: 120, carbs: 6,   protein: 24,  fat: 2    },
  { name: 'Mozzarella',            kcal: 280, carbs: 2.2, protein: 17,  fat: 22   },
  { name: 'Formatge cottage',      kcal: 98,  carbs: 3.4, protein: 11,  fat: 4.3  },
]

const UNIT_GRAMS = { g: 1, ml: 1, unitat: 100 }

// ── Editor state ─────────────────────────────────────────────────────────────
const editingKey    = ref(null)
const searchQuery   = ref('')
const selectedFood  = ref(null)
const quantity      = ref(100)
const selectedUnit  = ref('g')
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

function toggleSlotEditor(dayIndex, slot) {
  const key = `${dayIndex}-${slot}`
  if (editingKey.value === key) {
    closeSlotEditor()
  } else {
    editingKey.value = key
    searchQuery.value = ''
    selectedFood.value = null
    quantity.value = 100
    selectedUnit.value = 'g'
    showAutocomplete.value = false
    nextTick(() => document.querySelector('.editor-search__input')?.focus())
  }
}

function closeSlotEditor() { editingKey.value = null }

function onSearchInput()    { selectedFood.value = null; showAutocomplete.value = true }
function onSearchBlur()     { setTimeout(() => { showAutocomplete.value = false }, 150) }
function clearSearch()      { searchQuery.value = ''; selectedFood.value = null }
function selectFood(food)   { selectedFood.value = food; searchQuery.value = food.name }

function saveSlotEdit(dayIndex, slot, slotLabel) {
  if (!selectedFood.value) return
  const grams = quantity.value * UNIT_GRAMS[selectedUnit.value]
  weekStore.addFoodToSlot(dayIndex, slot, {
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

function onKeydown(e) { if (e.key === 'Escape' && editingKey.value) closeSlotEditor() }
onMounted(()   => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.meals-view { display: flex; flex-direction: column; }
.meals-content { padding: 24px; }

/* Grid */
.meals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* Card */
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
.meal-card--warning { border-color: var(--warning-soft-border); background: var(--warning-surface-body); }

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

.meal-card__kcal-big { display: flex; align-items: baseline; gap: 4px; }
.kcal-num { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text); display: inline-block; }
.kcal-target { font-size: 12px; color: var(--text-3); }

/* Slots container */
.meal-slots { display: flex; flex-direction: column; gap: 6px; }

/* Slot */
.meal-slot {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  position: relative;
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.meal-slot--open {
  background: color-mix(in srgb, var(--accent) 5%, var(--surface-2));
  border-color: rgba(0, 200, 150, 0.3);
}

/* Slot row */
.meal-slot__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
}

.meal-slot__icon { font-size: 15px; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.meal-slot__body { flex: 1; min-width: 0; }
.meal-slot__name { display: block; font-size: 12px; font-weight: 600; color: var(--text); }
.meal-slot__items {
  font-size: 11px; color: var(--text-3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
}
.meal-slot__kcal { font-size: 12px; font-weight: 600; color: var(--text-2); white-space: nowrap; }

/* Edit button */
.meal-slot__edit-btn {
  width: 22px; height: 22px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  opacity: 0;
  flex-shrink: 0;
  transition: opacity var(--dur-fast), background var(--dur-fast), color var(--dur-fast);
}
.meal-slot:hover .meal-slot__edit-btn,
.meal-slot--open .meal-slot__edit-btn { opacity: 1; }
.meal-slot__edit-btn:hover { background: var(--surface-3); color: var(--accent); }
.meal-slot__edit-btn--active { background: var(--surface-3); color: var(--accent); opacity: 1 !important; }
.meal-slot__edit-btn .material-symbols-rounded { font-size: 14px; }

/* Inline editor */
.meal-slot__editor {
  padding: 0 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Search */
.editor-search { position: relative; }

.editor-search__wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 6px 10px;
  transition: border-color var(--dur-fast);
}
.editor-search__wrap:focus-within { border-color: var(--accent); }
.editor-search__icon { font-size: 16px; color: var(--text-3); flex-shrink: 0; }

.editor-search__input {
  flex: 1;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text);
  background: transparent;
  outline: none;
  border: none;
  min-width: 0;
}
.editor-search__input::placeholder { color: var(--text-3); }

.editor-search__clear {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px;
  border-radius: 50%;
  color: var(--text-3);
  flex-shrink: 0;
  transition: background var(--dur-fast);
}
.editor-search__clear:hover { background: var(--surface-3); color: var(--text); }
.editor-search__clear .material-symbols-rounded { font-size: 13px; }

/* Autocomplete dropdown */
.editor-autocomplete {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow: hidden;
}
.editor-autocomplete__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background var(--dur-fast);
}
.editor-autocomplete__item:not(:last-child) { border-bottom: 1px solid var(--border); }
.editor-autocomplete__item:hover { background: var(--surface-2); }
.food-name { font-size: 12px; font-weight: 500; color: var(--text); }
.food-meta { font-size: 11px; color: var(--text-3); white-space: nowrap; flex-shrink: 0; }

/* Quantity row */
.editor-qty-row { display: flex; align-items: center; gap: 10px; }
.editor-label {
  font-size: 11px; font-weight: 600; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; flex-shrink: 0;
}
.editor-qty { display: flex; align-items: center; gap: 6px; flex: 1; }

.editor-qty__input {
  width: 72px;
  padding: 6px 8px;
  font-family: var(--font-body); font-size: 13px; color: var(--text);
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  outline: none;
  text-align: right;
  transition: border-color var(--dur-fast);
}
.editor-qty__input:focus { border-color: var(--accent); }

.editor-qty__unit {
  padding: 6px 22px 6px 8px;
  font-family: var(--font-body); font-size: 13px; color: var(--text);
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  outline: none; cursor: pointer;
  transition: border-color var(--dur-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
}
.editor-qty__unit:focus { border-color: var(--accent); }

/* Nutrition preview */
.editor-preview { display: flex; gap: 5px; flex-wrap: wrap; }
.preview-pill {
  font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 99px;
  background: var(--accent-light); color: var(--accent-dark);
}
.preview-pill--carbs   { background: rgba(99, 102, 241, 0.12); color: #4F46E5; }
.preview-pill--protein { background: rgba(16, 185, 129, 0.12); color: #059669; }
.preview-pill--fat     { background: rgba(245, 158, 11, 0.12); color: #D97706; }

/* Editor action buttons */
.editor-actions { display: flex; gap: 8px; justify-content: flex-end; }

/* AI note */
.ai-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600; color: var(--accent-dark);
  padding: 8px 10px;
  background: var(--accent-light);
  border-radius: var(--radius-md);
}
.ai-note .material-symbols-rounded { font-size: 13px; }

/* Meal log */
.meal-log {
  margin-top: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.meal-log__header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.meal-log__title { font-family: var(--font-display); font-size: 15px; font-weight: 700; }
.meal-log__subtitle { font-size: 12px; color: var(--text-3); }
.meal-log__list { display: flex; flex-direction: column; gap: 10px; }
.meal-log__row {
  display: flex; align-items: center; gap: 12px;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
}
.meal-log__day { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
.meal-log__meta { font-size: 11px; color: var(--text-3); }
.meal-log__status {
  font-size: 11px; font-weight: 700;
  padding: 4px 8px; border-radius: 99px;
}
.meal-log__status--ok { background: var(--accent-light); color: var(--accent-dark); }
.meal-log__status--warning { background: var(--warning-light); color: var(--warning); }
.meal-log__ai { font-size: 11px; font-weight: 600; color: var(--accent-dark); }

/* ── Transitions ─────────────────────────────────────────────────────────── */

/* Slot editor expand / collapse */
.slot-expand-enter-active { transition: opacity 0.22s var(--ease), transform 0.22s var(--ease); }
.slot-expand-leave-active { transition: opacity 0.16s var(--ease), transform 0.16s var(--ease); }
.slot-expand-enter-from,
.slot-expand-leave-to { opacity: 0; transform: translateY(-5px); }

/* Daily kcal counter */
.kcal-count-enter-active { animation: kcalIn 0.35s var(--ease) both; }
.kcal-count-leave-active { animation: kcalOut 0.2s var(--ease) both; }

/* Per-slot kcal tick */
.kcal-tick-enter-active { animation: kcalIn 0.28s var(--ease) both; }
.kcal-tick-leave-active { animation: kcalOut 0.15s var(--ease) both; }

@keyframes kcalIn  { from { transform: translateY(8px);  opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes kcalOut { from { transform: translateY(0);    opacity: 1; } to { transform: translateY(-8px); opacity: 0; } }

/* Nutrition preview pills */
.preview-fade-enter-active { transition: opacity 0.2s var(--ease), transform 0.2s var(--ease); }
.preview-fade-leave-active { transition: opacity 0.15s var(--ease); }
.preview-fade-enter-from { opacity: 0; transform: translateY(4px); }
.preview-fade-leave-to  { opacity: 0; }
</style>

<template>
  <teleport to="body">
    <transition name="slide-bottom">
      <div
        v-if="uiStore.aiDrawerOpen && uiStore.aiDrawerContext"
        ref="dialogRef"
        class="ai-drawer-wrap"
        role="dialog"
        aria-modal="true"
        aria-label="Recomanació NutriMove – Planificació setmanal"
        @keydown.esc.prevent="uiStore.closeAIDrawer()"
      >
        <div class="ai-drawer" @click.stop>
          <!-- Handle -->
          <div class="drawer-handle" @click="uiStore.closeAIDrawer()" aria-hidden="true">
            <div class="handle-bar"></div>
          </div>

          <!-- Header -->
          <div class="drawer__header">
            <div class="drawer__header-left">
              <div class="ai-icon">
                <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              </div>
              <div>
                <h2 class="drawer__title">Recomanació NutriMove</h2>
                <p class="drawer__subtitle">Planificació setmanal – {{ ctx.day }}</p>
              </div>
            </div>
            <button ref="closeBtnRef" class="close-btn" @click="uiStore.closeAIDrawer()" aria-label="Tancar">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <!-- 3-column body -->
          <div class="drawer__columns">
            <!-- Col 1: Analysis -->
            <div class="drawer-col">
              <div class="col-header">
                <span class="material-symbols-rounded">bar_chart</span>
                Anàlisi
              </div>
              <div class="analysis-card">
                <div class="analysis-stat">
                  <span class="stat-label">Càrrega total</span>
                  <span class="stat-value stat-value--warn">Alta</span>
                </div>
                <div class="analysis-stat">
                  <span class="stat-label">Kcal estimades</span>
                  <span class="stat-value">{{ ctx.totalKcal || 1200 }} kcal</span>
                </div>
                <div class="analysis-stat">
                  <span class="stat-label">Risc fatiga</span>
                  <span class="stat-value stat-value--warn">↑ Elevat</span>
                </div>
              </div>
              <p class="analysis-text">
                {{ ctx.analysis }}
              </p>
            </div>

            <!-- Col 2: Adjustments -->
            <div class="drawer-col">
              <div class="col-header">
                <span class="material-symbols-rounded">tune</span>
                Ajustos suggerits
                <span class="col-header__count">{{ selectedIds.size }}/{{ ctx.adjustments?.length ?? 0 }}</span>
              </div>
              <ul class="adjustments-list">
                <li
                  v-for="adj in ctx.adjustments"
                  :key="adj.id"
                  class="adj-item"
                  :class="{ 'adj-item--selected': selectedIds.has(adj.id) }"
                  @click="toggleAdj(adj.id)"
                >
                  <label class="adj-item__check" @click.stop>
                    <input
                      type="checkbox"
                      :checked="selectedIds.has(adj.id)"
                      @change="toggleAdj(adj.id)"
                    />
                  </label>
                  <div class="adj-item__content">
                    <div class="adj-item__top">
                      <span class="phase-badge" :class="`phase-badge--${adj.phase}`">
                        {{ phaseLabels[adj.phase] }}
                      </span>
                      <span class="adj-item__day">{{ adj.day }}</span>
                      <span class="adj-item__meal">· {{ adj.mealLabel }}</span>
                    </div>
                    <span class="adj-item__label">{{ adj.label }}</span>
                    <span class="adj-item__food">{{ adj.detail }}</span>
                    <span class="adj-item__delta">{{ adj.delta }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Col 3: Action -->
            <div class="drawer-col">
              <div class="col-header">
                <span class="material-symbols-rounded">rocket_launch</span>
                Acció
              </div>
              <div class="action-area">
                <p class="action-desc">
                  Selecciona els ajustos que vols aplicar o usa "Aplica tot" per acceptar totes les recomanacions.
                </p>
                <div class="action-preview">
                  <div class="preview-item">
                    <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">check_circle</span>
                    {{ selectedCount }} ajust{{ selectedCount !== 1 ? 'os' : '' }} seleccionat{{ selectedCount !== 1 ? 's' : '' }}
                  </div>
                  <div class="preview-item">
                    <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">local_fire_department</span>
                    +{{ totalExtraKcal }} kcal distribuïdes
                  </div>
                  <div class="preview-item">
                    <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">check_circle</span>
                    Risc de fatiga reduït
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="drawer__footer">
            <button class="btn btn--ghost" @click="uiStore.closeAIDrawer()">Ara no</button>
            <button
              class="btn btn--secondary"
              :disabled="selectedIds.size === 0"
              @click="applyPartial"
            >
              Aplica selecció ({{ selectedIds.size }})
            </button>
            <button class="btn btn--primary" @click="applyAll">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              Aplica tot ({{ ctx.adjustments?.length ?? 0 }})
            </button>
          </div>
        </div>

        <div class="drawer-overlay" @click="uiStore.closeAIDrawer()" aria-hidden="true"></div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useWeekStore } from '@/stores/weekStore'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { useScrollLock } from '@/composables/useScrollLock'

const uiStore = useUIStore()
const weekStore = useWeekStore()
const dialogRef = ref(null)
const closeBtnRef = ref(null)
let lastFocusedElement = null

const isOpen = computed(() => uiStore.aiDrawerOpen)
useFocusTrap(isOpen, dialogRef, { initialFocus: () => closeBtnRef.value })
useScrollLock(isOpen)

const ctx = computed(() => uiStore.aiDrawerContext || {})
const selectedIds = ref(new Set())

const phaseLabels = { pre: 'Pre-sessió', training: 'Sessió', recovery: 'Recuperació' }

const selectedCount = computed(() => selectedIds.value.size)
const totalExtraKcal = computed(() =>
  (ctx.value.adjustments ?? [])
    .filter(a => selectedIds.value.has(a.id))
    .reduce((sum, a) => sum + (a.extraKcal || 0), 0)
)

watch(() => uiStore.aiDrawerOpen, async (open) => {
  if (open) {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    selectedIds.value = new Set(uiStore.aiDrawerContext?.adjustments?.map(a => a.id) ?? [])
    await nextTick()
    closeBtnRef.value?.focus()
    return
  }
  await nextTick()
  lastFocusedElement?.focus?.()
  lastFocusedElement = null
})

function toggleAdj(id) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function applyPartial() {
  const adjs = (uiStore.aiDrawerContext?.adjustments ?? []).filter(a => selectedIds.value.has(a.id))
  for (const adj of adjs) {
    weekStore.applyMealAdjustment(adj.dayIndex, {
      mealSlot: adj.mealSlot,
      extraKcal: adj.extraKcal,
      extraCarbs: adj.extraCarbs,
      extraProtein: adj.extraProtein,
      item: adj.item,
      phase: adj.phase,
    })
  }
  uiStore.closeAIDrawer()
  uiStore.showToast(`${adjs.length} ajust${adjs.length !== 1 ? 'os aplicats' : ' aplicat'}. Reviseu el calendari.`, 'info')
}

function applyAll() {
  const adjs = uiStore.aiDrawerContext?.adjustments ?? []
  for (const adj of adjs) {
    weekStore.applyMealAdjustment(adj.dayIndex, {
      mealSlot: adj.mealSlot,
      extraKcal: adj.extraKcal,
      extraCarbs: adj.extraCarbs,
      extraProtein: adj.extraProtein,
      item: adj.item,
      phase: adj.phase,
    })
  }
  uiStore.closeAIDrawer()
  uiStore.showToast('Fet! Setmana planificada. Nutrició coberta per a totes les sessions.', 'success', 4500)
}
</script>

<style scoped>
.ai-drawer-wrap {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: flex-end;
}

.drawer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13, 27, 42, 0.5);
  backdrop-filter: blur(4px);
}

.ai-drawer {
  position: relative;
  z-index: 1;
  width: 100%;
  background: var(--surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  box-shadow: var(--shadow-xl);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: drawerIn 0.45s var(--ease) both;
}

.drawer-handle {
  display: flex;
  justify-content: center;
  padding: 12px;
  cursor: pointer;
  flex-shrink: 0;
}
.handle-bar {
  width: 40px; height: 4px;
  background: var(--border-2);
  border-radius: 99px;
}

/* Header */
.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 20px;
  gap: 12px;
  flex-shrink: 0;
}
.drawer__header-left { display: flex; align-items: center; gap: 14px; }
.ai-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ai-icon .material-symbols-rounded { color: var(--accent); font-size: 24px; }
.drawer__title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}
.drawer__subtitle { font-size: 12px; color: var(--text-3); margin-top: 2px; }
.close-btn {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm-plus);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3); flex-shrink: 0;
  transition: all var(--dur-fast);
}
.close-btn:hover { background: var(--surface-3); color: var(--text); }

/* Columns (scrollable middle area) */
.drawer__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  margin: 0 24px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.drawer-col {
  background: var(--surface);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  min-height: 0;
}

.col-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.col-header .material-symbols-rounded { font-size: 16px; color: var(--accent); }
.col-header__count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  background: var(--surface-2);
  padding: 2px 7px;
  border-radius: 99px;
}

/* Analysis */
.analysis-card {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.analysis-stat { display: flex; justify-content: space-between; align-items: center; }
.stat-label { font-size: 12px; color: var(--text-2); }
.stat-value { font-size: 13px; font-weight: 600; color: var(--text); }
.stat-value--warn { color: var(--warning); }
.analysis-text { font-size: 13px; color: var(--text-2); line-height: 1.6; }

/* Adjustments list */
.adjustments-list { display: flex; flex-direction: column; gap: 6px; }

.adj-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity var(--dur-fast), background var(--dur-fast), border-color var(--dur-fast);
}
.adj-item:not(.adj-item--selected) { opacity: 0.5; }
.adj-item:hover { opacity: 1; }
.adj-item--selected {
  background: color-mix(in srgb, var(--accent) 8%, var(--surface-2));
  border-color: rgba(0, 200, 150, 0.25);
}

/* Checkbox */
.adj-item__check {
  display: flex;
  align-items: flex-start;
  padding-top: 3px;
  cursor: pointer;
  flex-shrink: 0;
}
.adj-item__check input[type="checkbox"] {
  width: 15px;
  height: 15px;
  accent-color: var(--accent);
  cursor: pointer;
}

/* Content */
.adj-item__content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.adj-item__top {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

/* Phase badges */
.phase-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
  flex-shrink: 0;
}
.phase-badge--pre { background: var(--purple-light); color: var(--purple); }
.phase-badge--training { background: var(--warning-light); color: var(--warning); }
.phase-badge--recovery { background: var(--accent-light); color: var(--accent-dark); }

.adj-item__day { font-size: 11px; font-weight: 600; color: var(--text-2); }
.adj-item__meal { font-size: 11px; color: var(--text-3); }
.adj-item__label { font-size: 12px; color: var(--text); font-weight: 500; }
.adj-item__food { font-size: 11px; color: var(--text-3); font-style: italic; }
.adj-item__delta { font-size: 11px; color: var(--accent-dark); font-weight: 500; }

/* Action */
.action-area { display: flex; flex-direction: column; gap: 14px; }
.action-desc { font-size: 13px; color: var(--text-2); line-height: 1.6; }
.action-preview { display: flex; flex-direction: column; gap: 8px; }
.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}
.preview-item .material-symbols-rounded { font-size: 16px; }

/* Footer (always visible) */
.drawer__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 24px 24px;
  border-top: 1px solid var(--border);
  margin-top: 20px;
  flex-shrink: 0;
  background: var(--surface);
}

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 11px 20px; border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all var(--dur-fast);
}
.btn--primary { background: var(--accent); color: var(--navy); }
.btn--primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow-accent); }
.btn--secondary { background: var(--accent-light); color: var(--accent-dark); border: 1px solid rgba(0,200,150,0.25); }
.btn--secondary:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 20%, transparent); }
.btn--ghost { background: transparent; color: var(--text-2); border: 1px solid var(--border); }
.btn--ghost:hover { background: var(--surface-2); }
.btn .material-symbols-rounded { font-size: 16px; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Transitions */
.slide-bottom-enter-active { animation: drawerIn 0.45s var(--ease) both; }
.slide-bottom-leave-active { transition: transform 0.3s var(--ease), opacity 0.3s; }
.slide-bottom-leave-to { transform: translateY(100%); opacity: 0; }
</style>

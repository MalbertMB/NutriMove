<template>
  <teleport to="body">
    <transition name="slide-bottom">
      <div
        v-if="uiStore.aiDrawerOpen && uiStore.aiDrawerContext"
        class="ai-drawer-wrap"
        role="dialog"
        aria-modal="true"
        aria-label="Recomanació NutriMove – Planificació setmanal"
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
            <button class="close-btn" @click="uiStore.closeAIDrawer()" aria-label="Tancar">
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
              </div>
              <ul class="adjustments-list">
                <li v-for="adj in ctx.adjustments" :key="adj.day" class="adj-item">
                  <div class="adj-item__day">{{ adj.day }}</div>
                  <div class="adj-item__detail">
                    <span class="adj-item__label">{{ adj.label }}</span>
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
                  Aplica tots els ajustos nutricionals recomanats per cobrir la càrrega d'entrenament d'aquesta setmana.
                </p>
                <div class="action-preview">
                  <div class="preview-item">
                    <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">check_circle</span>
                    Nutrició ajustada {{ ctx.daysAffected || 3 }} dies
                  </div>
                  <div class="preview-item">
                    <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">check_circle</span>
                    Risc de fatiga eliminat
                  </div>
                  <div class="preview-item">
                    <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">check_circle</span>
                    Calendari en verd
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="drawer__footer">
            <button class="btn btn--ghost" @click="uiStore.closeAIDrawer()">Ara no</button>
            <button class="btn btn--secondary" @click="applyPartial">
              Aplica parcialment
            </button>
            <button class="btn btn--primary" @click="applyAll">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              Aplica tots els ajustos
            </button>
          </div>
        </div>

        <div class="drawer-overlay" @click="uiStore.closeAIDrawer()" aria-hidden="true"></div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useWeekStore } from '@/stores/weekStore'

const uiStore = useUIStore()
const weekStore = useWeekStore()

const ctx = computed(() => uiStore.aiDrawerContext || {})

function applyPartial() {
  const c = uiStore.aiDrawerContext
  if (c?.startDay !== undefined) {
    weekStore.applyAIWeekAdjustment(c.startDay, c.startDay + 1)
  }
  uiStore.closeAIDrawer()
  uiStore.showToast('Ajust parcial aplicat. Reviseu el calendari.', 'info')
}

function applyAll() {
  const c = uiStore.aiDrawerContext
  if (c?.startDay !== undefined && c?.endDay !== undefined) {
    weekStore.applyAIWeekAdjustment(c.startDay, c.endDay)
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
  max-height: 70vh;
  overflow-y: auto;
  animation: drawerIn 0.45s var(--ease) both;
}

.drawer-handle {
  display: flex;
  justify-content: center;
  padding: 12px;
  cursor: pointer;
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
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3); flex-shrink: 0;
  transition: all var(--dur-fast);
}
.close-btn:hover { background: var(--surface-3); color: var(--text); }

/* Columns */
.drawer__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  margin: 0 24px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.drawer-col {
  background: var(--surface);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

/* Adjustments */
.adjustments-list { display: flex; flex-direction: column; gap: 8px; }
.adj-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
}
.adj-item__day {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-dark);
  background: var(--accent-light);
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.adj-item__detail { display: flex; flex-direction: column; gap: 2px; }
.adj-item__label { font-size: 12px; color: var(--text); font-weight: 500; }
.adj-item__delta { font-size: 11px; color: var(--accent-dark); }

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

/* Footer */
.drawer__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 20px 24px 28px;
  border-top: 1px solid var(--border);
  margin-top: 20px;
}

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 11px 20px; border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all var(--dur-fast);
}
.btn--primary { background: var(--accent); color: var(--navy); }
.btn--primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,200,150,0.3); }
.btn--secondary { background: var(--accent-light); color: var(--accent-dark); border: 1px solid rgba(0,200,150,0.25); }
.btn--secondary:hover { background: rgba(0,200,150,0.2); }
.btn--ghost { background: transparent; color: var(--text-2); border: 1px solid var(--border); }
.btn--ghost:hover { background: var(--surface-2); }
.btn .material-symbols-rounded { font-size: 16px; }

/* Transitions */
.slide-bottom-enter-active { animation: drawerIn 0.45s var(--ease) both; }
.slide-bottom-leave-active { transition: transform 0.3s var(--ease), opacity 0.3s; }
.slide-bottom-leave-to { transform: translateY(100%); opacity: 0; }
</style>

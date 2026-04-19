<template>
  <teleport to="body">
    <transition name="scale">
      <div
        v-if="uiStore.aiPopoverOpen && uiStore.aiPopoverContext"
        class="ai-popover-wrap"
        role="dialog"
        aria-modal="true"
        aria-label="Suggeriment de l'Assistent NutriMove"
      >
        <div class="ai-popover" @click.stop>
          <!-- Header -->
          <div class="ai-popover__header">
            <div class="ai-badge">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              Assistent NutriMove
            </div>
            <button class="close-btn" @click="dismiss" aria-label="Tancar">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="ai-popover__body">
            <div class="ai-analysis">
              <span class="material-symbols-rounded icon-fill" aria-hidden="true">bolt</span>
              <div>
                <p class="ai-analysis__title">Anàlisi de la càrrega</p>
                <p class="ai-analysis__text">
                  La sessió de <strong>{{ formatDuration(ctx.duration) }}</strong>
                  d'intensitat <strong>{{ ctx.intensity }}</strong> genera un desgast important.
                </p>
              </div>
            </div>

            <div class="ai-recommendation">
              <p class="ai-recommendation__label">
                <span class="material-symbols-rounded" aria-hidden="true">restaurant</span>
                Suggeriment nutricional
              </p>
              <p class="ai-recommendation__text">{{ ctx.message }}</p>
              <div class="ai-recommendation__delta">
                <span class="delta-pill">+{{ ctx.extraKcal }} kcal</span>
                <span class="delta-pill">+{{ Math.round(ctx.extraKcal / 4) }}g hidrats</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="ai-popover__footer">
            <button class="btn btn--ghost" @click="dismiss">Ara no</button>
            <button class="btn btn--primary" @click="applyAdjustment">
              <span class="material-symbols-rounded icon-fill">check_circle</span>
              Aplica el canvi
            </button>
          </div>
        </div>

        <!-- Overlay -->
        <div class="ai-overlay" @click="dismiss" aria-hidden="true"></div>
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

const ctx = computed(() => uiStore.aiPopoverContext || {})

function formatDuration(mins) {
  if (!mins) return ''
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function dismiss() {
  uiStore.closeAIPopover()
  uiStore.showToast('Sessió actualitzada. Podeu revisar els àpats quan vulgueu.', 'info')
}

function applyAdjustment() {
  const c = uiStore.aiPopoverContext
  if (c?.day !== undefined) {
    weekStore.applyAIMealAdjustment(c.day > 0 ? c.day - 1 : 0, c.extraKcal || 300)
    weekStore.applyAIMealAdjustment(c.day, c.extraKcal || 200)
  }
  uiStore.closeAIPopover()
  uiStore.showToast('Fet! Àpats ajustats per a la sessió d\'alta intensitat.', 'success')
}
</script>

<style scoped>
.ai-popover-wrap {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.ai-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13, 27, 42, 0.5);
  backdrop-filter: blur(4px);
}

.ai-popover {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: popoverIn 0.4s var(--ease-back) both;
}

/* Header */
.ai-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 100%);
}
.ai-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
}
.ai-badge .material-symbols-rounded { font-size: 18px; }
.close-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.4);
  transition: all var(--dur-fast);
}
.close-btn:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.08); }
.close-btn .material-symbols-rounded { font-size: 16px; }

/* Body */
.ai-popover__body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.ai-analysis {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  padding: 14px;
}
.ai-analysis .material-symbols-rounded { color: var(--warning); font-size: 22px; flex-shrink: 0; margin-top: 1px; }
.ai-analysis__title { font-size: 12px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
.ai-analysis__text { font-size: 14px; color: var(--text); line-height: 1.5; }

.ai-recommendation { display: flex; flex-direction: column; gap: 8px; }
.ai-recommendation__label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--text-2);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.ai-recommendation__label .material-symbols-rounded { font-size: 14px; color: var(--accent); }
.ai-recommendation__text { font-size: 14px; color: var(--text); line-height: 1.6; }
.ai-recommendation__delta { display: flex; gap: 8px; flex-wrap: wrap; }
.delta-pill {
  background: var(--accent-light);
  color: var(--accent-dark);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 99px;
}

/* Footer */
.ai-popover__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 14px 20px 20px;
  border-top: 1px solid var(--border);
}

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 18px; border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all var(--dur-fast);
}
.btn--primary { background: var(--accent); color: var(--navy); }
.btn--primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,200,150,0.3); }
.btn--ghost { background: transparent; color: var(--text-2); border: 1px solid var(--border); }
.btn--ghost:hover { background: var(--surface-2); }
.btn .material-symbols-rounded { font-size: 16px; }

/* Transition */
.scale-enter-active { animation: popoverIn 0.35s var(--ease-back) both; }
.scale-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>

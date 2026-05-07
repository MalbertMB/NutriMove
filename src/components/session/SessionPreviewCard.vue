<template>
  <Teleport to="body">
    <transition name="preview-pop">
      <div
        v-if="uiStore.previewSessionId && session"
        class="preview-card"
        :style="cardStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="`Detalls: ${session.label}`"
        tabindex="-1"
        ref="cardRef"
        @mouseenter="uiStore.cancelClosePreviewSession()"
        @mouseleave="uiStore.scheduleClosePreviewSession()"
        @keydown.esc="uiStore.closePreviewSession()"
      >
          <!-- Header -->
          <div class="preview-card__header" :style="{ borderColor: typeData.color + '40' }">
            <div class="preview-card__icon" :style="{ background: typeData.color + '20', color: typeData.color }">
              <span class="material-symbols-rounded">{{ typeData.icon }}</span>
            </div>
            <div class="preview-card__title-group">
              <span class="preview-card__type">{{ typeData.label }}</span>
              <h3 class="preview-card__name">{{ session.label }}</h3>
            </div>
            <button class="preview-card__close" @click="uiStore.closePreviewSession()" aria-label="Tancar">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <!-- Info rows -->
          <div class="preview-card__body">
            <div class="info-row">
              <span class="material-symbols-rounded info-row__icon">calendar_today</span>
              <span class="info-row__label">Dia</span>
              <span class="info-row__val">{{ dayName }}</span>
            </div>
            <div class="info-row">
              <span class="material-symbols-rounded info-row__icon">schedule</span>
              <span class="info-row__label">Hora</span>
              <span class="info-row__val">{{ formatStartTime(session.startTime) }}</span>
            </div>
            <div class="info-row">
              <span class="material-symbols-rounded info-row__icon">timer</span>
              <span class="info-row__label">Durada</span>
              <span class="info-row__val">{{ formatDuration(session.duration) }}</span>
            </div>
            <div class="info-row">
              <span class="material-symbols-rounded info-row__icon">bolt</span>
              <span class="info-row__label">Intensitat</span>
              <span class="info-row__val intensity-badge" :class="`intensity-badge--${intensityKey}`">{{ session.intensity }}</span>
            </div>
            <div class="info-row">
              <span class="material-symbols-rounded info-row__icon">local_fire_department</span>
              <span class="info-row__label">Calories</span>
              <span class="info-row__val">{{ session.kcal }} kcal</span>
            </div>
            <div v-if="session.notes" class="info-row info-row--notes">
              <span class="material-symbols-rounded info-row__icon">notes</span>
              <span class="info-row__label">Notes</span>
              <span class="info-row__val info-row__val--notes">{{ session.notes }}</span>
            </div>
          </div>

          <!-- Load warning -->
          <div v-if="session.load === 'high'" class="preview-card__warning">
            <span class="material-symbols-rounded icon-fill">warning</span>
            Càrrega alta — revisa la nutrició d'aquest dia
          </div>

          <!-- Actions -->
          <div class="preview-card__footer">
            <button class="btn btn--danger" @click="deleteSession">
              <span class="material-symbols-rounded">delete_outline</span>
              Elimina
            </button>
            <button class="btn btn--primary" @click="goToEdit">
              <span class="material-symbols-rounded">edit</span>
              Editar sessió
            </button>
          </div>
        </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()
const cardRef = ref(null)

const CARD_WIDTH = 288

const session = computed(() => {
  if (!uiStore.previewSessionId) return null
  return weekStore.getSessionById(uiStore.previewSessionId)
})

const typeData = computed(() => {
  if (!session.value) return { icon: 'fitness_center', color: 'var(--purple)', label: '' }
  return weekStore.sessionTypes[session.value.type] ?? { icon: 'fitness_center', color: 'var(--purple)', label: '' }
})

const dayName = computed(() => session.value ? weekStore.daysFull[session.value.day] : '')

const intensityKey = computed(() => {
  const map = { Baixa: 'low', Moderada: 'med', Alta: 'high' }
  return map[session.value?.intensity] ?? 'med'
})

const cardStyle = computed(() => {
  const rect = uiStore.previewAnchorRect
  if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const CARD_HEIGHT_EST = 340

  let left = rect.right + 10
  if (left + CARD_WIDTH > vw - 8) left = rect.left - CARD_WIDTH - 10

  let top = rect.top
  if (top + CARD_HEIGHT_EST > vh - 8) top = vh - CARD_HEIGHT_EST - 8
  if (top < 8) top = 8

  return { top: top + 'px', left: left + 'px' }
})

watch(() => uiStore.previewSessionId, async (id) => {
  if (id) {
    await nextTick()
    cardRef.value?.focus()
  }
})

function formatStartTime(h) {
  if (h == null) return '—'
  const hours = Math.floor(h)
  const mins = h % 1 === 0.5 ? '30' : '00'
  return `${String(hours).padStart(2, '0')}:${mins}`
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function goToEdit() {
  const id = uiStore.previewSessionId
  uiStore.closePreviewSession()
  uiStore.openEditPanel(id)
}

function deleteSession() {
  if (!session.value) return
  const label = session.value.label
  weekStore.removeSession(session.value.id)
  uiStore.closePreviewSession()
  uiStore.showToast(`Sessió eliminada: ${label}.`, 'info')
}
</script>

<style scoped>
.preview-card {
  position: fixed;
  width: 288px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 191;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  outline: none;
}

/* Header */
.preview-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--border);
}
.preview-card__icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.preview-card__icon .material-symbols-rounded { font-size: 20px; }
.preview-card__title-group { flex: 1; min-width: 0; }
.preview-card__type { font-size: 10px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }
.preview-card__name { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.preview-card__close {
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3); flex-shrink: 0;
  transition: all var(--dur-fast);
}
.preview-card__close:hover { background: var(--surface-3); color: var(--text); }
.preview-card__close .material-symbols-rounded { font-size: 16px; }

/* Body */
.preview-card__body {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.info-row:last-child { border-bottom: none; }
.info-row__icon { font-size: 16px; color: var(--text-3); flex-shrink: 0; margin-top: 1px; }
.info-row__label { font-size: 12px; color: var(--text-3); width: 70px; flex-shrink: 0; }
.info-row__val { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; }

.info-row--notes { align-items: flex-start; }
.info-row__val--notes { font-weight: 400; color: var(--text-2); line-height: 1.4; white-space: pre-line; }

/* Intensity badge */
.intensity-badge {
  display: inline-flex; align-items: center;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
}
.intensity-badge--low { background: var(--intensity-low-bg); color: var(--intensity-low-text); }
.intensity-badge--med { background: var(--accent-light); color: var(--accent-dark); }
.intensity-badge--high { background: var(--warning-light); color: var(--warning); }

/* Warning strip */
.preview-card__warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 14px 10px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  background: var(--warning-light);
  color: var(--warning);
  font-size: 11px;
  font-weight: 600;
}
.preview-card__warning .material-symbols-rounded { font-size: 14px; }

/* Footer */
.preview-card__footer {
  display: flex;
  gap: 8px;
  padding: 10px 14px 14px;
  border-top: 1px solid var(--border);
}

.btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all var(--dur-fast);
  border: none;
}
.btn .material-symbols-rounded { font-size: 16px; }
.btn--primary { background: var(--accent); color: var(--navy); }
.btn--primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn--danger { background: transparent; color: var(--danger); border: 1px solid var(--border); }
.btn--danger:hover { background: rgba(239,68,68,0.08); border-color: var(--danger); }

/* Transition — scaleIn per a popovers (guia §12) */
.preview-pop-enter-active { animation: scaleIn 0.18s var(--ease) both; }
.preview-pop-leave-active { animation: scaleIn 0.14s var(--ease) reverse both; }
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
</style>

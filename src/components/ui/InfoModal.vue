<template>
  <transition name="info-fade">
    <div
      v-if="topic && data"
      ref="modalRef"
      class="info-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`info-modal-title-${topic}`"
      :aria-describedby="`info-modal-body-${topic}`"
      tabindex="-1"
      @click.self="$emit('close')"
      @keydown.esc="$emit('close')"
    >
      <div class="info-modal__card">
        <button ref="closeBtnRef" class="info-modal__close" @click="$emit('close')" aria-label="Tancar la finestra d'informació">
          <span class="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
        <div class="info-modal__head">
          <span class="info-modal__icon" aria-hidden="true">
            <span class="material-symbols-rounded icon-fill">{{ data.icon }}</span>
          </span>
          <h3 :id="`info-modal-title-${topic}`" class="info-modal__title">{{ data.title }}</h3>
        </div>
        <p :id="`info-modal-body-${topic}`" class="info-modal__body">{{ data.body }}</p>

        <!-- Formula + variable legend -->
        <div v-if="data.formula" class="info-modal__section">
          <h4 class="info-modal__section-title">
            <span class="material-symbols-rounded">function</span>
            Com es calcula
          </h4>
          <div class="formula-eq">{{ data.formula.equation }}</div>
          <div v-if="data.formula.legend" class="formula-legend">
            <div v-for="l in data.formula.legend" :key="l.label" class="formula-legend__item">
              <span class="formula-legend__label">{{ l.label }}</span>
              <span class="formula-legend__value">{{ l.value }}</span>
            </div>
          </div>
        </div>

        <!-- Legend without formula -->
        <div v-if="!data.formula && data.legend" class="info-modal__section">
          <h4 class="info-modal__section-title">
            <span class="material-symbols-rounded">menu_book</span>
            Llegenda
          </h4>
          <div class="formula-legend">
            <div v-for="l in data.legend" :key="l.label" class="formula-legend__item">
              <span class="formula-legend__label">{{ l.label }}</span>
              <span class="formula-legend__value">{{ l.value }}</span>
            </div>
          </div>
        </div>

        <!-- Thresholds -->
        <div v-if="data.thresholds" class="info-modal__section">
          <h4 class="info-modal__section-title">
            <span class="material-symbols-rounded">straighten</span>
            Llindars de referència
          </h4>
          <div class="threshold-grid">
            <div
              v-for="t in data.thresholds"
              :key="t.range"
              class="threshold-pill"
              :class="`threshold-pill--${t.tone}`"
            >
              <span class="threshold-pill__range">{{ t.range }}</span>
              <span class="threshold-pill__label">{{ t.label }}</span>
            </div>
          </div>
        </div>

        <!-- Decision rules -->
        <div v-if="data.rules" class="info-modal__section">
          <h4 class="info-modal__section-title">
            <span class="material-symbols-rounded">account_tree</span>
            Regles de decisió
          </h4>
          <div class="rule-list">
            <div v-for="r in data.rules" :key="r.condition" class="rule-row">
              <code class="rule-cond">{{ r.condition }}</code>
              <span class="material-symbols-rounded rule-arrow">arrow_forward</span>
              <span class="rule-verdict" :class="`rule-verdict--${r.tone}`">{{ r.verdict }}</span>
            </div>
          </div>
        </div>

        <!-- Mapping -->
        <div v-if="data.mapping" class="info-modal__section">
          <h4 class="info-modal__section-title">
            <span class="material-symbols-rounded">swap_horiz</span>
            Correspondència
          </h4>
          <div class="mapping-list">
            <div v-for="m in data.mapping" :key="m.from" class="mapping-row">
              <span class="mapping-from">{{ m.from }}</span>
              <span class="material-symbols-rounded mapping-arrow">arrow_forward</span>
              <span class="mapping-to">{{ m.to }}</span>
            </div>
          </div>
        </div>

        <!-- Example -->
        <div v-if="data.example" class="info-modal__section info-modal__section--example">
          <h4 class="info-modal__section-title">
            <span class="material-symbols-rounded icon-fill">person</span>
            Exemple amb les teves dades
          </h4>
          <div class="info-modal__example">{{ data.example }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { useScrollLock } from '@/composables/useScrollLock'

const props = defineProps({
  topic: { type: String, default: null },
  topics: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['close'])

const modalRef = ref(null)
const closeBtnRef = ref(null)
const data = computed(() => (props.topic ? props.topics[props.topic] ?? null : null))
const isOpen = computed(() => Boolean(props.topic && data.value))

useFocusTrap(isOpen, modalRef, { initialFocus: () => closeBtnRef.value })
useScrollLock(isOpen)

function handleEsc(e) {
  if (e.key === 'Escape' && props.topic) emit('close')
}
onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))
</script>

<style>
/* ─── Info button (used inside chart/KPI headers) ─── */
.info-btn {
  position: relative;
  width: 18px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  color: var(--text-3);
  background: transparent;
  cursor: pointer;
  transition: all var(--dur-fast);
  flex-shrink: 0;
  padding: 0;
  border: none;
}
.info-btn .material-symbols-rounded {
  font-size: 15px;
  font-variation-settings: 'FILL' 0, 'wght' 400;
}
.info-btn:hover {
  color: var(--accent-dark);
  background: var(--accent-light);
}
.info-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.info-btn--dark { color: rgba(255,255,255,0.5); }
.info-btn--dark:hover {
  color: var(--accent);
  background: rgba(0, 200, 150, 0.15);
}

/* Custom tooltip */
.info-btn::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(2px);
  background: var(--navy);
  color: white;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  padding: 5px 9px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 100;
  box-shadow: var(--shadow-md);
}
.info-btn::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%) translateY(2px);
  border: 4px solid transparent;
  border-top-color: var(--navy);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.info-btn:hover::after,
.info-btn:focus-visible::after,
.info-btn:hover::before,
.info-btn:focus-visible::before {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ─── Modal ─── */
.info-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
  padding: 24px;
}
.info-modal__card {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 64px rgba(0,0,0,0.35);
  padding: 28px 28px 24px;
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 14px;
}
.info-modal__close {
  position: absolute;
  top: 14px; right: 14px;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  background: transparent;
  cursor: pointer;
  transition: all var(--dur-fast);
  border: none;
}
.info-modal__close:hover { background: var(--surface-2); color: var(--text); }
.info-modal__close .material-symbols-rounded { font-size: 18px; }

.info-modal__head { display: flex; align-items: center; gap: 12px; }
.info-modal__icon {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.info-modal__icon .material-symbols-rounded { font-size: 22px; color: var(--accent-dark); }
.info-modal__title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
}

.info-modal__body {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.6;
}

.info-modal__section {
  background: var(--surface-2);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.info-modal__section--example {
  background: var(--accent-light);
  border-left-color: var(--accent-dark);
}
.info-modal__section-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 800;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.info-modal__section-title .material-symbols-rounded {
  font-size: 14px;
  color: var(--accent-dark);
}

.formula-eq {
  font-family: 'Cambria', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
  text-align: center;
  padding: 14px 16px;
  background: white;
  border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
  border-radius: var(--radius-md);
  letter-spacing: 0.4px;
  line-height: 1.45;
  box-shadow: inset 0 0 0 4px var(--surface);
}

.formula-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.formula-legend__item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.formula-legend__label {
  font-size: 11px; font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.3px;
}
.formula-legend__value {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 800;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.threshold-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
}
.threshold-pill {
  display: flex; flex-direction: column; gap: 1px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}
.threshold-pill__range {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.threshold-pill__label {
  font-size: 11px; font-weight: 600;
}
.threshold-pill--low {
  background: color-mix(in srgb, #94A3B8 12%, var(--surface));
  border-color: color-mix(in srgb, #94A3B8 30%, transparent);
}
.threshold-pill--low .threshold-pill__range  { color: var(--text-2); }
.threshold-pill--low .threshold-pill__label  { color: var(--text-3); }
.threshold-pill--good {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}
.threshold-pill--good .threshold-pill__range { color: var(--accent-dark); }
.threshold-pill--good .threshold-pill__label { color: var(--accent-dark); }
.threshold-pill--warn {
  background: color-mix(in srgb, #F97316 12%, var(--surface));
  border-color: color-mix(in srgb, #F97316 35%, transparent);
}
.threshold-pill--warn .threshold-pill__range { color: #C2410C; }
.threshold-pill--warn .threshold-pill__label { color: #C2410C; }
.threshold-pill--risk {
  background: color-mix(in srgb, #EF4444 12%, var(--surface));
  border-color: color-mix(in srgb, #EF4444 35%, transparent);
}
.threshold-pill--risk .threshold-pill__range { color: #B91C1C; }
.threshold-pill--risk .threshold-pill__label { color: #B91C1C; }

.rule-list { display: flex; flex-direction: column; gap: 6px; }
.rule-row {
  display: grid;
  grid-template-columns: 1fr 18px auto;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.rule-cond {
  font-family: 'Cambria', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 13px;
  color: var(--text);
  background: transparent;
  padding: 0;
}
.rule-arrow { font-size: 16px; color: var(--text-3); }
.rule-verdict {
  font-size: 12px; font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}
.rule-verdict--low  { background: rgba(148, 163, 184, 0.15); color: var(--text-2); }
.rule-verdict--good { background: var(--accent-light); color: var(--accent-dark); }
.rule-verdict--warn { background: rgba(249, 115, 22, 0.15); color: #C2410C; }
.rule-verdict--risk { background: rgba(239, 68, 68, 0.15); color: #B91C1C; }

.mapping-list { display: flex; flex-direction: column; gap: 4px; }
.mapping-row {
  display: grid;
  grid-template-columns: 100px 18px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.mapping-from {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 800;
  color: var(--text);
}
.mapping-arrow { font-size: 16px; color: var(--accent); }
.mapping-to {
  font-family: 'Cambria', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 13px;
  color: var(--text-2);
}
.info-modal__example {
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
}

.info-fade-enter-active, .info-fade-leave-active { transition: opacity 0.2s ease; }
.info-fade-enter-active .info-modal__card,
.info-fade-leave-active .info-modal__card {
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.info-fade-enter-from, .info-fade-leave-to { opacity: 0; }
.info-fade-enter-from .info-modal__card, .info-fade-leave-to .info-modal__card {
  transform: translateY(12px) scale(0.96);
  opacity: 0;
}
</style>

<template>
  <div class="library">
    <div class="library__header">
      <div class="library__title">
        <span class="material-symbols-rounded" aria-hidden="true">library_books</span>
        Biblioteca de sessions
      </div>
    </div>

    <div class="library__body">
      <div class="library__list">
        <div
          v-for="(typeData, key) in sessionTypes"
          :key="key"
          class="lib-card"
          :style="{ '--card-color': typeData.color }"
          draggable="true"
          @dragstart="handleDragStart(key, $event)"
          @dragend="handleDragEnd"
          :aria-label="`${typeData.label} – Arrossega per afegir al calendari`"
          role="button"
          tabindex="0"
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

      <button class="library__btn-new" @click="handleNewSession">
        <span class="material-symbols-rounded">add</span>
        Nova sessió personalitzada
      </button>
    </div>
  </div>
</template>

<script setup>
import { useWeekStore } from '@/stores/weekStore'

const weekStore = useWeekStore()
const sessionTypes = weekStore.sessionTypes
const emit = defineEmits(['add-session', 'add-custom-session'])

function handleDragStart(type, event) {
  event.dataTransfer.setData('session-type', type)
  event.dataTransfer.effectAllowed = 'copy'
}

function handleDragEnd() {}

function handleNewSession() {
  emit('add-custom-session')
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

.library__btn-new {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  background: var(--accent);
  color: var(--navy);
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all var(--dur-fast);
  outline: none;
}

.library__btn-new:hover {
  filter: brightness(0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 30%, transparent);
}

.library__btn-new:active {
  transform: translateY(0);
  filter: brightness(0.9);
}

.library__btn-new:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.library__btn-new .material-symbols-rounded {
  font-size: 18px;
}
</style>

<template>
  <div class="library" :class="{ 'library--collapsed': !isOpen }">
    <div class="library__header" @click="isOpen = !isOpen">
      <div class="library__title">
        <span class="material-symbols-rounded" aria-hidden="true">library_books</span>
        Biblioteca de sessions
      </div>
      <button class="library__toggle" :aria-expanded="isOpen" aria-controls="library-body">
        <span class="material-symbols-rounded">{{ isOpen ? 'expand_less' : 'expand_more' }}</span>
      </button>
    </div>

    <transition name="fade">
      <div v-if="isOpen" id="library-body" class="library__body">
        <p class="library__hint">Arrossega al calendari per afegir una sessió</p>
        <div class="library__grid">
          <div
            v-for="(typeData, key) in sessionTypes"
            :key="key"
            class="lib-item"
            :style="{ '--lib-color': typeData.color }"
            draggable="true"
            @dragstart="handleDragStart(key, $event)"
            @dragend="handleDragEnd"
            :aria-label="`Arrossega per afegir: ${typeData.label}`"
            role="button"
            tabindex="0"
          >
            <div class="lib-item__icon">
              <span class="material-symbols-rounded">{{ typeData.icon }}</span>
            </div>
            <span class="lib-item__label">{{ typeData.label }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWeekStore } from '@/stores/weekStore'

const weekStore = useWeekStore()
const isOpen = ref(true)
const sessionTypes = weekStore.sessionTypes

function handleDragStart(type, event) {
  event.dataTransfer.setData('session-type', type)
  event.dataTransfer.effectAllowed = 'copy'
}

function handleDragEnd() {}
</script>

<style scoped>
.library {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--dur-med) var(--ease);
}

.library__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  transition: background var(--dur-fast);
}
.library__header:hover { background: var(--surface-2); }

.library__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.library__title .material-symbols-rounded { font-size: 18px; color: var(--accent); }

.library__toggle {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  transition: all var(--dur-fast);
}
.library__toggle:hover { background: var(--surface-3); color: var(--text); }

.library__body { padding: 0 16px 16px; }
.library__hint { font-size: 11px; color: var(--text-3); margin-bottom: 12px; text-align: center; }

.library__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.lib-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border: 1.5px solid color-mix(in srgb, var(--lib-color) 25%, transparent);
  background: color-mix(in srgb, var(--lib-color) 8%, transparent);
  cursor: grab;
  transition: all var(--dur-fast);
  text-align: center;
  outline: none;
}
.lib-item:active { cursor: grabbing; transform: scale(0.96); }
.lib-item:hover {
  background: color-mix(in srgb, var(--lib-color) 16%, transparent);
  border-color: var(--lib-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--lib-color) 20%, transparent);
}
.lib-item:focus-visible {
  outline: 2px solid var(--lib-color);
  outline-offset: 2px;
}

.lib-item__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--lib-color);
  display: flex; align-items: center; justify-content: center;
}
.lib-item__icon .material-symbols-rounded { color: white; font-size: 18px; }
.lib-item__label { font-size: 11px; font-weight: 600; color: var(--text-2); line-height: 1.2; }
</style>

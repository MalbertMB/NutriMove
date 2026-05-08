<template>
  <transition name="slide-right">
    <div
      v-if="uiStore.mealPanelOpen && uiStore.mealPanelDayIndex !== null"
      class="meal-panel"
      role="dialog"
      aria-modal="true"
      @keydown.esc.prevent="uiStore.closeMealPanel()"
    >
      <div class="meal-panel__close-row">
        <button class="close-btn" @click="uiStore.closeMealPanel()" aria-label="Tancar">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="meal-panel__body">
        <MealDetailContent :day-index="uiStore.mealPanelDayIndex" />
      </div>
    </div>
  </transition>

  <transition name="fade">
    <div v-if="uiStore.mealPanelOpen" class="backdrop" @click="uiStore.closeMealPanel()" aria-hidden="true"></div>
  </transition>
</template>

<script setup>
import MealDetailContent from './MealDetailContent.vue'
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()
</script>

<style scoped>
.meal-panel {
  position: fixed;
  top: 0; right: 0;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.meal-panel__close-row {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 0;
  flex-shrink: 0;
}
.close-btn {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  transition: all var(--dur-fast);
}
.close-btn:hover { background: var(--surface-3); color: var(--text); }
.meal-panel__body {
  flex: 1;
  padding: 8px 24px 28px;
  overflow-y: auto;
}

.backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.32);
  backdrop-filter: blur(2px);
  z-index: 199;
}

.slide-right-enter-active { animation: slideInRight 0.3s var(--ease) both; }
.slide-right-leave-active { transition: opacity 0.22s ease, transform 0.22s var(--ease); }
.slide-right-leave-to { opacity: 0; transform: translateX(20px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

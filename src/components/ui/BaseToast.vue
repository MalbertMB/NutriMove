<template>
  <teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <transition-group name="toast-anim" tag="div">
        <div
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
        >
          <span class="toast__icon material-symbols-rounded icon-fill">
            {{ iconMap[toast.type] }}
          </span>
          <span class="toast__msg">{{ toast.message }}</span>
          <button class="toast__close" @click="uiStore.removeToast(toast.id)" aria-label="Tancar">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()
const iconMap = {
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
  info: 'info'
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 12px 14px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-size: 14px;
  font-weight: 500;
  min-width: 280px;
  max-width: 420px;
  pointer-events: auto;
  backdrop-filter: blur(8px);
}
.toast--success { background: var(--toast-success-bg); color: var(--toast-success-text); border: 1px solid var(--toast-success-border); }
.toast--warning { background: var(--toast-warning-bg); color: var(--toast-warning-text); border: 1px solid var(--toast-warning-border); }
.toast--error { background: var(--toast-error-bg); color: var(--toast-error-text); border: 1px solid var(--toast-error-border); }
.toast--info { background: var(--toast-info-bg); color: var(--toast-info-text); border: 1px solid var(--toast-info-border); }

.toast__icon { font-size: 18px; flex-shrink: 0; }
.toast--success .toast__icon { color: var(--toast-success-icon); }
.toast--warning .toast__icon { color: var(--toast-warning-icon); }
.toast--error .toast__icon { color: var(--toast-error-icon); }
.toast--info .toast__icon { color: var(--toast-info-icon); }

.toast__msg { flex: 1; line-height: 1.4; }
.toast__close {
  width: 24px; height: 24px;
  border-radius: var(--radius-xs);
  display: flex; align-items: center; justify-content: center;
  color: currentColor;
  opacity: 0.5;
  transition: opacity var(--dur-fast);
  flex-shrink: 0;
}
.toast__close:hover { opacity: 1; }
.toast__close .material-symbols-rounded { font-size: 14px; }

/* Transitions */
.toast-anim-enter-active { animation: toastIn 0.35s var(--ease-back) both; }
.toast-anim-leave-active { animation: toastOut 0.25s var(--ease) both; }
.toast-anim-move { transition: transform 0.3s var(--ease); }
</style>

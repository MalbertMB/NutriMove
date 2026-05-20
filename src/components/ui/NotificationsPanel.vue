<template>
  <Teleport to="body">
    <!-- Backdrop transparent per tancar en clicar fora -->
    <div
      v-if="uiStore.notifPanelOpen"
      class="notif-backdrop"
      @click="uiStore.closeNotifPanel()"
      aria-hidden="true"
    />

    <transition name="notif-slide">
      <div
        v-if="uiStore.notifPanelOpen"
        class="notif-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Notificacions"
        @keydown.esc="uiStore.closeNotifPanel()"
        ref="panelRef"
        tabindex="-1"
      >
        <!-- Header -->
        <div class="notif-panel__header">
          <span class="notif-panel__title">Notificacions</span>
          <div class="notif-panel__header-actions">
            <button
              v-if="uiStore.unreadCount > 0"
              class="notif-mark-all"
              @click="uiStore.markAllRead()"
            >
              Marcar totes com llegides
            </button>
            <button class="notif-close" @click="uiStore.closeNotifPanel()" aria-label="Tancar">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="uiStore.notifications.length === 0" class="notif-empty">
          <span class="material-symbols-rounded">notifications_off</span>
          <p>Cap notificació</p>
        </div>

        <!-- Notification list -->
        <ul v-else class="notif-list" role="list">
          <li
            v-for="n in uiStore.notifications"
            :key="n.id"
            class="notif-item"
            :class="{ 'notif-item--unread': !n.read }"
            tabindex="0"
            role="button"
            :aria-label="`${n.title}. ${n.body}${!n.read ? '. No llegida' : ''}`"
            @click="uiStore.markRead(n.id)"
            @keydown.enter.prevent="uiStore.markRead(n.id)"
            @keydown.space.prevent="uiStore.markRead(n.id)"
          >
            <div class="notif-item__icon" :class="`notif-icon--${n.type}`">
              <span class="material-symbols-rounded icon-fill">{{ n.icon }}</span>
            </div>
            <div class="notif-item__content">
              <p class="notif-item__title">{{ n.title }}</p>
              <p class="notif-item__body">{{ n.body }}</p>
              <span class="notif-item__time">{{ relativeTime(n.time) }}</span>
            </div>
            <span v-if="!n.read" class="notif-item__dot" aria-label="No llegida" />
          </li>
        </ul>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useFocusTrap } from '@/composables/useFocusTrap'

const uiStore = useUIStore()
const panelRef = ref(null)
const isOpen = computed(() => uiStore.notifPanelOpen)

useFocusTrap(isOpen, panelRef, { initialFocus: () => panelRef.value })

watch(() => uiStore.notifPanelOpen, async (open) => {
  if (open) {
    await nextTick()
    panelRef.value?.focus()
  }
})

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ara mateix'
  if (mins < 60) return `Fa ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Fa ${hours}h`
  return `Fa ${Math.floor(hours / 24)} dies`
}
</script>

<style scoped>
.notif-backdrop {
  position: fixed;
  inset: 0;
  z-index: 148;
}

.notif-panel {
  position: fixed;
  top: calc(var(--topbar-h) + 8px);
  right: 24px;
  width: 340px;
  max-height: calc(100vh - var(--topbar-h) - 24px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 149;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  outline: none;
}

/* Header */
.notif-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.notif-panel__title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
.notif-panel__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.notif-mark-all {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
  transition: color var(--dur-fast);
  background: none;
  border: none;
  padding: 0;
}
.notif-mark-all:hover { color: var(--accent-dark); }
.notif-close {
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  transition: all var(--dur-fast);
  background: none; border: none; cursor: pointer;
}
.notif-close:hover { background: var(--surface-3); color: var(--text); }
.notif-close .material-symbols-rounded { font-size: 16px; }

/* Empty state */
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: var(--text-3);
}
.notif-empty .material-symbols-rounded { font-size: 32px; }
.notif-empty p { font-size: 13px; }

/* List */
.notif-list {
  overflow-y: auto;
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--dur-fast);
  position: relative;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: var(--surface-2); }
.notif-item--unread { background: rgba(0, 200, 150, 0.04); }

/* Icon */
.notif-item__icon {
  width: 34px; height: 34px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.notif-item__icon .material-symbols-rounded { font-size: 16px; }
.notif-icon--warning { background: var(--warning-light); color: var(--warning); }
.notif-icon--ai      { background: var(--accent-light);  color: var(--accent);  }
.notif-icon--success { background: var(--accent-light);  color: var(--accent);  }
.notif-icon--info    { background: var(--surface-3);     color: var(--text-2);  }

/* Content */
.notif-item__content { flex: 1; min-width: 0; }
.notif-item__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
  line-height: 1.3;
}
.notif-item__body {
  font-size: 12px;
  color: var(--text-2);
  line-height: 1.4;
  margin-bottom: 5px;
}
.notif-item__time {
  font-size: 11px;
  color: var(--text-3);
  font-weight: 500;
}

/* Unread dot */
.notif-item__dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  margin-top: 4px;
}

/* Transition — fadeInDown (guia §12) */
.notif-slide-enter-active { animation: fadeInDown 0.22s var(--ease) both; }
.notif-slide-leave-active { animation: fadeInDown 0.15s var(--ease) reverse both; }
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

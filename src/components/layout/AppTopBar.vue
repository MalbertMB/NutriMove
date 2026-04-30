<template>
  <header class="topbar">
    <div class="topbar__left">
      <h1 class="topbar__title">{{ title }}</h1>
      <span v-if="subtitle" class="topbar__subtitle">{{ subtitle }}</span>
    </div>
    <div class="topbar__right">
      <!-- Week selector -->
      <div class="week-nav" v-if="showWeekNav">
        <button class="week-nav__btn" @click="$emit('prevWeek')" aria-label="Setmana anterior">
          <span class="material-symbols-rounded">chevron_left</span>
        </button>
        <span class="week-nav__label">{{ weekLabel }}</span>
        <button class="week-nav__btn" @click="$emit('nextWeek')" aria-label="Setmana següent">
          <span class="material-symbols-rounded">chevron_right</span>
        </button>
      </div>

      <!-- Save week button -->
      <button v-if="showSave" class="btn btn--primary btn--sm" @click="$emit('save')">
        <span class="material-symbols-rounded">save</span>
        Desa la setmana
      </button>

      <!-- Notifications bell -->
      <button class="icon-btn" aria-label="Notificacions" @click="$emit('notifications')">
        <span class="material-symbols-rounded">notifications</span>
        <span class="notif-badge" aria-hidden="true">2</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showWeekNav: { type: Boolean, default: false },
  showSave: { type: Boolean, default: false },
  weekLabel: { type: String, default: 'Setmana actual' }
})

defineEmits(['prevWeek', 'nextWeek', 'save', 'notifications'])
</script>

<style scoped>
.topbar {
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 16px;
}

.topbar__left { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
.topbar__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}
.topbar__subtitle {
  font-size: 13px;
  color: var(--text-3);
}

.topbar__right { display: flex; align-items: center; gap: 8px; }

/* Week nav */
.week-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 4px;
}
.week-nav__btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  transition: all var(--dur-fast);
}
.week-nav__btn:hover { background: var(--surface-3); color: var(--text); }
.week-nav__label { font-size: 13px; font-weight: 500; color: var(--text); padding: 0 8px; white-space: nowrap; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--dur-fast) ease;
  white-space: nowrap;
}
.btn--primary {
  background: var(--accent);
  color: var(--navy);
  padding: 8px 16px;
  font-size: 14px;
}
.btn--primary:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn--sm { padding: 7px 14px; font-size: 13px; }
.btn .material-symbols-rounded { font-size: 16px; }

/* Icon button */
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  background: var(--surface-2);
  border: 1px solid var(--border);
  transition: all var(--dur-fast);
  position: relative;
}
.icon-btn:hover { background: var(--surface-3); color: var(--text); }
.notif-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--warning);
  border-radius: 50%;
  border: 2px solid var(--surface);
}
</style>

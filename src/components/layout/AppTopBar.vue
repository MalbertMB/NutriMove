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

    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showWeekNav: { type: Boolean, default: false },
  showSave: { type: Boolean, default: false },
  weekLabel: { type: String, default: 'Setmana actual' }
})

defineEmits(['prevWeek', 'nextWeek', 'save'])
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
  gap: 2px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 5px 6px;
  box-shadow: var(--shadow-sm);
}
.week-nav__btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  transition: all var(--dur-fast);
  flex-shrink: 0;
}
.week-nav__btn:hover { background: var(--accent-light); color: var(--accent); }
.week-nav__btn .material-symbols-rounded { font-size: 20px; }
.week-nav__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  padding: 0 14px;
  white-space: nowrap;
  min-width: 180px;
  text-align: center;
}

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

</style>

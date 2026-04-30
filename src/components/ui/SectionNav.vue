<template>
  <nav class="section-nav" aria-label="Navegació secundària">
    <button
      v-for="item in items"
      :key="item.target"
      type="button"
      class="section-nav__item"
      @click="scrollToTarget(item.target)"
    >
      <span v-if="item.icon" class="material-symbols-rounded" aria-hidden="true">{{ item.icon }}</span>
      {{ item.label }}
    </button>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

function scrollToTarget(target) {
  const element = document.getElementById(target)
  if (!element) return
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (typeof element.focus === 'function') {
    window.setTimeout(() => element.focus({ preventScroll: true }), 200)
  }
}
</script>

<style scoped>
.section-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 24px 12px;
}

.section-nav__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 99px;
  background: var(--surface);
  color: var(--text-2);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  transition: all var(--dur-fast);
}

.section-nav__item:hover {
  background: var(--surface-2);
  color: var(--text);
  border-color: var(--border-2);
}

.section-nav__item .material-symbols-rounded {
  font-size: 14px;
}
</style>
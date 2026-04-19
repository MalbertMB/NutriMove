<template>
  <span class="load-badge" :class="`load-badge--${level}`" :title="label">
    <span class="material-symbols-rounded" aria-hidden="true">{{ icon }}</span>
    <span v-if="showLabel" class="load-badge__label">{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: { type: String, default: 'normal' }, // 'normal' | 'high' | 'ok'
  showLabel: { type: Boolean, default: false }
})

const label = computed(() => ({
  normal: 'Càrrega normal',
  high: 'Càrrega alta',
  ok: 'Complet'
}[props.level] ?? 'Normal'))

const icon = computed(() => ({
  normal: 'radio_button_unchecked',
  high: 'warning',
  ok: 'check_circle'
}[props.level] ?? 'radio_button_unchecked'))
</script>

<style scoped>
.load-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
}
.load-badge .material-symbols-rounded { font-size: 13px; }
.load-badge--normal { background: var(--surface-3); color: var(--text-3); }
.load-badge--high { background: var(--warning-light); color: var(--warning); }
.load-badge--ok { background: var(--accent-light); color: var(--accent-dark); }
</style>

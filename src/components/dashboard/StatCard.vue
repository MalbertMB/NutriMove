<template>
  <div class="stat-card animate-fadeInUp" :style="{ animationDelay: delay + 'ms' }">
    <div class="stat-card__icon" :style="{ background: iconBg, color: iconColor }">
      <span class="material-symbols-rounded icon-fill">{{ icon }}</span>
    </div>
    <div class="stat-card__body">
      <span class="stat-card__label">{{ label }}</span>
      <div class="stat-card__value-row">
        <span class="stat-card__value">{{ value }}</span>
        <span v-if="unit" class="stat-card__unit">{{ unit }}</span>
      </div>
      <span v-if="meta" class="stat-card__meta">{{ meta }}</span>
    </div>
    <div v-if="trend" class="stat-card__trend" :class="`trend--${trend.dir}`">
      <span class="material-symbols-rounded">{{ trend.dir === 'up' ? 'trending_up' : 'trending_down' }}</span>
      {{ trend.label }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  meta: { type: String, default: '' },
  iconBg: { type: String, default: 'var(--accent-light)' },
  iconColor: { type: String, default: 'var(--accent)' },
  trend: { type: Object, default: null },
  delay: { type: Number, default: 0 }
})
</script>

<style scoped>
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  transition: all var(--dur-fast);
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity var(--dur-med);
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.stat-card:hover::after { opacity: 1; }

.stat-card__icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card__icon .material-symbols-rounded { font-size: 22px; }

.stat-card__body { flex: 1; min-width: 0; }
.stat-card__label { font-size: 11px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.6px; display: block; margin-bottom: 4px; }
.stat-card__value-row { display: flex; align-items: baseline; gap: 4px; }
.stat-card__value { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text); line-height: 1; }
.stat-card__unit { font-size: 13px; color: var(--text-3); font-weight: 500; }
.stat-card__meta { font-size: 11px; color: var(--text-3); display: block; margin-top: 4px; }

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 99px;
  align-self: flex-start;
  flex-shrink: 0;
}
.stat-card__trend .material-symbols-rounded { font-size: 14px; }
.trend--up { background: var(--accent-light); color: var(--accent-dark); }
.trend--down { background: var(--warning-light); color: var(--warning); }
</style>

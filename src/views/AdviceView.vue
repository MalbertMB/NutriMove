<template>
  <div class="advice-view">
    <AppTopBar title="Consells" subtitle="Recomanacions personalitzades de l'Assistent NutriMove" />
    <div class="advice-content">
      <div id="predictive-tips" class="advice-list" tabindex="-1">
        <div
          v-for="tip in tips"
          :key="tip.id"
          class="tip-card"
          :class="`tip-card--${tip.type}`"
          :style="{ animationDelay: tip.id * 80 + 'ms' }"
        >
          <div class="tip-card__header">
            <div class="tip-icon">
              <span class="material-symbols-rounded icon-fill">{{ tip.icon }}</span>
            </div>
            <div class="tip-meta">
              <span class="tip-tag">{{ tip.tag }}</span>
              <span class="tip-time">Ara</span>
            </div>
            <div class="tip-ai-badge">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              IA
            </div>
          </div>
          <h3 class="tip-title">{{ tip.title }}</h3>
          <p class="tip-body">{{ tip.body }}</p>
          <div class="tip-actions">
            <button class="btn btn--primary" @click="applyTip(tip)">Aplica el bloc IA</button>
            <button class="btn btn--ghost" @click="ignoreTip(tip)">Ara no</button>
          </div>
        </div>
      </div>

      <!-- History sidebar -->
      <aside id="advice-history" class="advice-history" tabindex="-1">
        <h3 class="history-title">Historial de consells</h3>
        <div class="history-list">
          <div v-for="h in history" :key="h.id" class="history-item">
            <div class="history-item__dot" :class="`dot--${h.status}`"></div>
            <div class="history-item__body">
              <span class="history-item__label">{{ h.label }}</span>
              <span class="history-item__date">{{ h.date }}</span>
            </div>
            <span class="history-item__status">{{ h.status === 'applied' ? 'Aplicat' : 'Ignorat' }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()
const ignoredTips = ref([])
const history = ref([])

const tips = computed(() => {
  const list = []
  const warningDays = weekStore.meals
    .map((meal, day) => ({ meal, day }))
    .filter(({ meal }) => meal.status === 'warning')

  warningDays.slice(0, 3).forEach(({ day }) => {
    list.push({
      id: `meal-${day}`,
      type: 'nutrition',
      icon: 'restaurant',
      tag: 'Nutrició',
      title: `Ajust de carbohidrats per ${weekStore.daysFull[day]}`,
      body: `Aquest dia té càrrega alta. Aplica un increment nutricional automàtic de 300 kcal al sopar per millorar la recuperació.`,
      action: 'apply-day',
      day
    })
  })

  if (warningDays.length >= 2) {
    const days = warningDays.map(({ day }) => day)
    list.push({
      id: 'week-adjust',
      type: 'recovery',
      icon: 'auto_awesome',
      tag: 'Planificació',
      title: 'Ajust nutricional per tota la setmana intensa',
      body: "S'han detectat diversos dies exigents. Pots aplicar una adaptació global de calories i carbohidrats als dies de càrrega.",
      action: 'apply-week',
      startDay: Math.min(...days),
      endDay: Math.max(...days)
    })
  }

  if (!list.length) {
    list.push({
      id: 'stable-week',
      type: 'performance',
      icon: 'check_circle',
      tag: 'Rendiment',
      title: 'Setmana estable i ben compensada',
      body: 'No hi ha desajustos importants detectats. Mantén la mateixa estratègia de descans i hidratació.',
      action: 'none'
    })
  }

  return list.filter(t => !ignoredTips.value.includes(t.id))
})

function applyTip(tip) {
  if (tip.action === 'apply-day') {
    weekStore.applyAIMealAdjustment(tip.day)
    uiStore.showToast(`Ajust aplicat a ${weekStore.daysFull[tip.day]}.`, 'success')
    addHistory(`Ajust diari: ${weekStore.daysFull[tip.day]}`, 'applied')
  } else if (tip.action === 'apply-week') {
    weekStore.applyAIWeekAdjustment(tip.startDay, tip.endDay)
    uiStore.showToast('Ajust setmanal aplicat.', 'success')
    addHistory('Ajust nutricional setmanal', 'applied')
  } else {
    uiStore.showToast('No cal aplicar canvis addicionals.', 'info')
    addHistory('Consell de manteniment revisat', 'applied')
  }

  ignoredTips.value = [...ignoredTips.value, tip.id]
}

function ignoreTip(tip) {
  ignoredTips.value = [...ignoredTips.value, tip.id]
  addHistory(tip.title, 'ignored')
  uiStore.showToast('Consell ignorat.', 'info')
}

function addHistory(label, status) {
  history.value.unshift({
    id: Date.now() + Math.random(),
    label,
    date: formatNow(),
    status
  })
}

function formatNow() {
  return new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'short' }).format(new Date())
}
</script>

<style scoped>
.advice-view { display: flex; flex-direction: column; }
.advice-content { display: grid; grid-template-columns: 1fr 280px; gap: 20px; padding: 24px; }
.advice-list { display: flex; flex-direction: column; gap: 16px; }

.tip-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeInUp 0.4s var(--ease) both;
  transition: box-shadow var(--dur-fast);
}
.tip-card:hover { box-shadow: var(--shadow-md); }
.tip-card--nutrition { border-left: 4px solid var(--accent); }
.tip-card--recovery { border-left: 4px solid var(--purple); }
.tip-card--performance { border-left: 4px solid var(--warning); }

.tip-card__header { display: flex; align-items: center; gap: 10px; }
.tip-icon {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.tip-card--recovery .tip-icon { background: var(--purple-light); }
.tip-card--performance .tip-icon { background: var(--warning-light); }
.tip-icon .material-symbols-rounded { font-size: 20px; color: var(--accent); }
.tip-card--recovery .tip-icon .material-symbols-rounded { color: var(--purple); }
.tip-card--performance .tip-icon .material-symbols-rounded { color: var(--warning); }

.tip-meta { flex: 1; }
.tip-tag { display: block; font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.6px; }
.tip-time { font-size: 11px; color: var(--text-3); }

.tip-ai-badge {
  display: flex; align-items: center; gap: 4px;
  background: linear-gradient(135deg, var(--navy), var(--navy-2));
  color: var(--accent);
  font-size: 10px; font-weight: 700;
  padding: 4px 8px; border-radius: 99px;
}
.tip-ai-badge .material-symbols-rounded { font-size: 12px; }

.tip-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); }
.tip-body { font-size: 13px; color: var(--text-2); line-height: 1.65; }

.tip-actions { display: flex; gap: 8px; }

/* History */
.advice-history {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  align-self: flex-start;
  position: sticky;
  top: 80px;
}
.history-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 16px; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { display: flex; align-items: center; gap: 10px; }
.history-item__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot--applied { background: var(--accent); }
.dot--ignored { background: var(--text-3); }
.history-item__body { flex: 1; }
.history-item__label { display: block; font-size: 12px; font-weight: 500; color: var(--text); }
.history-item__date { font-size: 11px; color: var(--text-3); }
.history-item__status { font-size: 11px; font-weight: 600; color: var(--text-3); white-space: nowrap; }
</style>

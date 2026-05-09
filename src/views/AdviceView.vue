<template>
  <div class="advice-view">
    <AppTopBar
      title="Consells"
      subtitle="Recomanacions personalitzades de l'Assistent NutriMove"
      :show-week-nav="true"
      :week-label="weekStore.currentWeekLabel"
      :is-current-week="weekStore.weekOffset === 0"
      @prev-week="weekStore.prevWeek()"
      @next-week="weekStore.nextWeek()"
      @today="weekStore.goToCurrentWeek()"
    />
    <div class="advice-content">
      <div id="predictive-tips" class="advice-list" tabindex="-1">
        <div
          v-for="tip in tips"
          :key="tip.id"
          class="tip-card"
          :class="[`tip-card--${tip.type}`, { 'tip-card--info-only': tip.action === 'none' }]"
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
            <div v-if="tip.action !== 'none'" class="tip-ai-badge">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              IA
            </div>
          </div>
          <h3 class="tip-title">{{ tip.title }}</h3>
          <p class="tip-body">{{ tip.body }}</p>

          <!-- Trigger sessions (high-load) -->
          <div v-if="tip.triggerSessions?.length" class="tip-sessions">
            <div class="tip-sessions__header">
              <span class="material-symbols-rounded">fitness_center</span>
              {{ tip.triggerSessions.length === 1 ? 'Sessió detonant' : 'Sessions detonants' }}
            </div>
            <div v-for="s in tip.triggerSessions" :key="s.id" class="tip-session-row">
              <span class="tip-session__day">{{ s.day }}</span>
              <span class="tip-adj__sep">·</span>
              <span class="tip-session__label">{{ s.label }}</span>
              <span class="tip-session__kcal">{{ s.kcal }} kcal · {{ s.intensity }}</span>
            </div>
          </div>

          <!-- Adjustments preview -->
          <div v-if="tip.adjustments?.length" class="tip-adjustments">
            <div class="tip-adjustments__header">
              <span class="material-symbols-rounded">tune</span>
              {{ tip.adjustments.length }} ajust{{ tip.adjustments.length !== 1 ? 'os' : '' }} inclosos
            </div>
            <div v-for="adj in tip.adjustments" :key="adj.id" class="tip-adj">
              <span class="phase-badge" :class="`phase-badge--${adj.phase}`">{{ phaseLabels[adj.phase] }}</span>
              <span class="tip-adj__day">{{ adj.day }}</span>
              <span class="tip-adj__sep">·</span>
              <span class="tip-adj__meal">{{ adj.mealLabel }}</span>
              <span class="tip-adj__label">{{ adj.label }}</span>
              <span class="tip-adj__delta">{{ adj.delta }}</span>
            </div>
          </div>

          <div v-if="tip.action !== 'none'" class="tip-actions">
            <button class="btn btn--primary" @click="applyTip(tip)">
              Aplica {{ tip.adjustments?.length ?? '' }} ajust{{ tip.adjustments?.length !== 1 ? 'os' : '' }}
            </button>
            <button class="btn btn--ghost" @click="ignoreTip(tip)">Ara no</button>
          </div>
        </div>
      </div>

      <!-- History sidebar -->
      <aside id="advice-history" class="advice-history" tabindex="-1">
        <h3 class="history-title">Historial de consells</h3>
        <div v-if="!uiStore.adviceHistory.length" class="history-empty">
          Encara no has aplicat ni ignorat cap consell.
        </div>
        <div v-else class="history-list">
          <div v-for="h in uiStore.adviceHistory" :key="h.id" class="history-item">
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
import { computed } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()

const phaseLabels = { pre: 'Pre-sessió', training: 'Sessió', recovery: 'Recuperació' }

// Adjustments tailored to a list of high-load training days:
// pre-load on the previous day, fueling on the day itself, recovery on the next.
function generateHighLoadAdjustments(highDays) {
  const seenSlots = new Set()
  const adjustments = []
  for (const d of highDays) {
    if (d > 0) {
      const kL = `${d - 1}-lunch`
      if (!seenSlots.has(kL)) {
        seenSlots.add(kL)
        adjustments.push({
          id: `pre-${d}-lunch`, dayIndex: d - 1, day: weekStore.daysFull[d - 1],
          phase: 'pre', mealSlot: 'lunch', mealLabel: 'Dinar',
          label: 'Dinar de càrrega', detail: 'Arròs integral + llegums', delta: '+250 kcal · +45g hidrats',
          extraKcal: 250, extraCarbs: 45, extraProtein: 0, item: 'Arròs integral (extra)'
        })
      }
      const kD = `${d - 1}-dinner`
      if (!seenSlots.has(kD)) {
        seenSlots.add(kD)
        adjustments.push({
          id: `pre-${d}-dinner`, dayIndex: d - 1, day: weekStore.daysFull[d - 1],
          phase: 'pre', mealSlot: 'dinner', mealLabel: 'Sopar',
          label: 'Sopar de càrrega', detail: 'Pasta integral + salsa de tomàquet', delta: '+300 kcal · +50g hidrats',
          extraKcal: 300, extraCarbs: 50, extraProtein: 0, item: 'Pasta de càrrega'
        })
      }
    }
    const kB = `${d}-breakfast`
    if (!seenSlots.has(kB)) {
      seenSlots.add(kB)
      adjustments.push({
        id: `training-${d}-breakfast`, dayIndex: d, day: weekStore.daysFull[d],
        phase: 'training', mealSlot: 'breakfast', mealLabel: 'Esmorzar',
        label: 'Esmorzar reforçat', detail: 'Civada + mel + plàtan madur', delta: '+200 kcal · +35g hidrats',
        extraKcal: 200, extraCarbs: 35, extraProtein: 0, item: 'Civada reforçada'
      })
    }
    const kS = `${d}-snack`
    if (!seenSlots.has(kS)) {
      seenSlots.add(kS)
      adjustments.push({
        id: `training-${d}-snack`, dayIndex: d, day: weekStore.daysFull[d],
        phase: 'training', mealSlot: 'snack', mealLabel: 'Berenar',
        label: 'Berenar pre-sessió', detail: 'Plàtan + barreta energètica', delta: '+180 kcal · +25g hidrats',
        extraKcal: 180, extraCarbs: 25, extraProtein: 0, item: 'Berenar energètic'
      })
    }
    if (d < 6) {
      const kR = `${d + 1}-dinner`
      if (!seenSlots.has(kR)) {
        seenSlots.add(kR)
        adjustments.push({
          id: `recovery-${d}-dinner`, dayIndex: d + 1, day: weekStore.daysFull[d + 1],
          phase: 'recovery', mealSlot: 'dinner', mealLabel: 'Sopar',
          label: 'Sopar de recuperació', detail: 'Peix blau + quinoa + verdures', delta: '+200 kcal · +30g proteïna',
          extraKcal: 200, extraCarbs: 0, extraProtein: 30, item: 'Proteïna de recuperació'
        })
      }
    }
  }
  return adjustments
}

// Adjustment for days that are simply under the kcal target (no high-load
// sessions). Plain "increase intake" — no pre/training/recovery framing.
function generateLowKcalAdjustments(day) {
  return [{
    id: `lowkcal-${day}-snack`,
    dayIndex: day,
    day: weekStore.daysFull[day],
    phase: null,
    mealSlot: 'snack',
    mealLabel: 'Berenar',
    label: 'Berenar reforçat',
    detail: 'Iogurt grec + fruits secs + fruita',
    delta: '+220 kcal · +18g proteïna',
    extraKcal: 220, extraCarbs: 18, extraProtein: 18, item: 'Berenar complet'
  }]
}

const tips = computed(() => {
  const list = []
  const offset = weekStore.weekOffset
  const sessionsByDay = weekStore.sessionsByDay

  const warningDays = weekStore.meals
    .map((meal, day) => ({ meal, day }))
    .filter(({ meal }) => meal.status === 'warning')

  // Per-day tips — different copy/adjustments depending on whether the day
  // actually has high-load sessions or is just under-fed.
  warningDays.slice(0, 3).forEach(({ day }) => {
    const dayHighLoad = (sessionsByDay[day] || []).filter(s => s.load === 'high')
    const isHighLoadDay = dayHighLoad.length > 0

    if (isHighLoadDay) {
      const adjustments = generateHighLoadAdjustments([day])
      list.push({
        id: `meal-w${offset}-d${day}`,
        type: 'nutrition',
        icon: 'restaurant',
        tag: 'Càrrega alta',
        title: `Planificació nutricional per ${weekStore.daysFull[day]}`,
        body: `Dia de càrrega alta detectat. Es proposen ${adjustments.length} ajustos als àpats del dia i dels dies adjacents per optimitzar el rendiment i la recuperació.`,
        action: 'apply-day',
        day,
        adjustments,
        triggerSessions: dayHighLoad.map(s => ({
          id: s.id,
          day: weekStore.daysFull[day],
          label: s.label,
          kcal: s.kcal,
          intensity: s.intensity,
        })),
      })
    } else {
      const adjustments = generateLowKcalAdjustments(day)
      list.push({
        id: `meal-w${offset}-d${day}`,
        type: 'nutrition',
        icon: 'restaurant',
        tag: 'Ingesta baixa',
        title: `Ingesta insuficient ${weekStore.daysFull[day]}`,
        body: `La ingesta planificada queda per sota de l'objectiu calòric del dia. Es proposa reforçar un àpat per cobrir el dèficit.`,
        action: 'apply-day',
        day,
        adjustments,
      })
    }
  })

  // Week-level tip — only when ≥2 high-load days (not generic warning days).
  const highLoadWarningDays = warningDays
    .filter(({ day }) => (sessionsByDay[day] || []).some(s => s.load === 'high'))
    .map(({ day }) => day)

  if (highLoadWarningDays.length >= 2) {
    const adjustments = generateHighLoadAdjustments(highLoadWarningDays)
    const triggerSessions = highLoadWarningDays.flatMap(d =>
      (sessionsByDay[d] || []).filter(s => s.load === 'high').map(s => ({
        id: s.id,
        day: weekStore.daysFull[d],
        label: s.label,
        kcal: s.kcal,
        intensity: s.intensity,
      }))
    )
    list.push({
      id: `week-adjust-w${offset}`,
      type: 'recovery',
      icon: 'auto_awesome',
      tag: 'Planificació',
      title: 'Ajust nutricional per tota la setmana intensa',
      body: `S'han detectat ${highLoadWarningDays.length} dies de càrrega alta. Es proposen ${adjustments.length} ajustos distribuïts per pre-càrrega, sessió i recuperació.`,
      action: 'apply-week',
      startDay: Math.min(...highLoadWarningDays),
      endDay: Math.max(...highLoadWarningDays),
      adjustments,
      triggerSessions,
    })
  }

  if (!list.length) {
    list.push({
      id: `stable-week-w${offset}`,
      type: 'performance',
      icon: 'check_circle',
      tag: 'Rendiment',
      title: 'Setmana estable i ben compensada',
      body: 'No hi ha desajustos importants detectats. Mantén la mateixa estratègia de descans i hidratació.',
      action: 'none'
    })
  }

  return list.filter(t => !uiStore.adviceIgnoredTips.includes(t.id))
})

function applyTip(tip) {
  if (tip.action !== 'apply-day' && tip.action !== 'apply-week') return

  for (const adj of tip.adjustments ?? []) {
    weekStore.applyMealAdjustment(adj.dayIndex, {
      mealSlot: adj.mealSlot,
      extraKcal: adj.extraKcal,
      extraCarbs: adj.extraCarbs,
      extraProtein: adj.extraProtein,
      item: adj.item,
      phase: adj.phase,
    })
  }
  const n = tip.adjustments?.length ?? 0
  const label = tip.action === 'apply-day'
    ? `${n} ajust${n !== 1 ? 'os aplicats' : ' aplicat'} a ${weekStore.daysFull[tip.day]}.`
    : `${n} ajust${n !== 1 ? 'os aplicats' : ' aplicat'} a tota la setmana.`
  uiStore.showToast(label, 'success')
  uiStore.addAdviceHistoryEntry(
    tip.action === 'apply-day'
      ? `Ajust diari: ${weekStore.daysFull[tip.day]}`
      : 'Ajust nutricional setmanal',
    'applied'
  )
  uiStore.ignoreAdviceTip(tip.id)
}

function ignoreTip(tip) {
  uiStore.ignoreAdviceTip(tip.id)
  uiStore.addAdviceHistoryEntry(tip.title, 'ignored')
  uiStore.showToast('Consell ignorat.', 'info')
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

/* Targeta d'estat sense accions: lectura única */
.tip-card--info-only {
  border-left-color: var(--accent);
  background: linear-gradient(135deg, rgba(0,200,150,0.04) 0%, var(--surface) 100%);
}
.tip-card--info-only .tip-icon { background: var(--accent-light); }
.tip-card--info-only .tip-icon .material-symbols-rounded { color: var(--accent); }

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

.tip-actions { display: flex; gap: 8px; align-items: center; }

/* Phase badges */
.phase-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
  flex-shrink: 0;
}
.phase-badge--pre { background: var(--purple-light); color: var(--purple); }
.phase-badge--training { background: var(--warning-light); color: var(--warning); }
.phase-badge--recovery { background: var(--accent-light); color: var(--accent-dark); }

/* Trigger sessions block (sessions causing the high-load warning) */
.tip-sessions {
  background: var(--surface-2);
  border-left: 3px solid var(--warning);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tip-sessions__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--warning);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tip-sessions__header .material-symbols-rounded { font-size: 14px; }
.tip-session-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  flex-wrap: wrap;
}
.tip-session__day { font-weight: 600; color: var(--text-2); }
.tip-session__label { color: var(--text); font-weight: 500; flex: 1; min-width: 100px; }
.tip-session__kcal { font-size: 11px; color: var(--text-3); white-space: nowrap; margin-left: auto; }

/* Adjustments preview inside tip card */
.tip-adjustments {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.tip-adjustments__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}
.tip-adjustments__header .material-symbols-rounded { font-size: 14px; }

.tip-adj {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  flex-wrap: wrap;
}
.tip-adj__day { font-weight: 600; color: var(--text-2); }
.tip-adj__sep { color: var(--text-3); }
.tip-adj__meal { color: var(--text-3); }
.tip-adj__label { color: var(--text); font-weight: 500; flex: 1; min-width: 120px; }
.tip-adj__delta { font-size: 11px; color: var(--accent-dark); font-weight: 500; white-space: nowrap; margin-left: auto; }

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
.history-empty {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.5;
  padding: 8px 0;
}
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

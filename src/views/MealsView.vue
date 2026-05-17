<template>
  <div class="meals-view">
    <AppTopBar title="Àpats" subtitle="Planificació nutricional setmanal" />

    <!-- View switcher (only when advanced mode is enabled in Profile) -->
    <div v-if="uiStore.advancedMetrics" class="view-switch" role="tablist">
      <button
        class="view-switch__btn"
        :class="{ 'view-switch__btn--active': viewMode === 'simple' }"
        @click="viewMode = 'simple'"
        role="tab"
        :aria-selected="viewMode === 'simple'"
      >
        <span class="material-symbols-rounded">calendar_view_week</span>
        Vista setmanal
      </button>
      <button
        class="view-switch__btn"
        :class="{ 'view-switch__btn--active': viewMode === 'advanced' }"
        @click="viewMode = 'advanced'"
        role="tab"
        :aria-selected="viewMode === 'advanced'"
      >
        <span class="material-symbols-rounded">science</span>
        Anàlisi nutricional
        <span class="view-switch__badge">PRO</span>
      </button>
      <span class="view-switch__indicator" :class="`view-switch__indicator--${viewMode}`"></span>
    </div>

    <!-- ── SIMPLE VIEW ── -->
    <div v-show="viewMode === 'simple'" class="meals-content">
      <div class="week-nav">
        <button
          class="week-nav__today"
          :class="{ 'week-nav__today--disabled': weekStore.weekOffset === 0 }"
          :disabled="weekStore.weekOffset === 0"
          @click="weekStore.goToCurrentWeek()"
          :aria-label="weekStore.weekOffset === 0 ? 'Ja ets a la setmana actual' : 'Tornar a la setmana actual'"
          :title="weekStore.weekOffset === 0 ? 'Ja ets a la setmana actual' : 'Tornar a la setmana actual'"
        >
          <span class="material-symbols-rounded">today</span>
          Avui
        </button>
        <button class="week-nav__btn" @click="weekStore.prevWeek()" aria-label="Setmana anterior">
          <span class="material-symbols-rounded">chevron_left</span>
        </button>
        <div class="week-nav__center">
          <span class="week-nav__label">{{ weekStore.currentWeekLabel }}</span>
          <span v-if="weekStore.weekOffset === 0" class="week-nav__chip">Aquesta setmana</span>
        </div>
        <button class="week-nav__btn" @click="weekStore.nextWeek()" aria-label="Setmana següent">
          <span class="material-symbols-rounded">chevron_right</span>
        </button>
      </div>

      <!-- 7 day cards (general info) -->
      <div id="meal-plan" class="meals-grid" tabindex="-1">
        <button
          v-for="(meal, i) in weekStore.meals"
          :key="i"
          type="button"
          class="meal-card"
          :class="[
            `meal-card--${meal.status}`,
            { 'meal-card--selected': selectedDayIndex === i },
            { 'meal-card--today': i === todayIndex && weekStore.weekOffset === 0 },
          ]"
          :style="{ animationDelay: i * 60 + 'ms' }"
          :aria-pressed="selectedDayIndex === i"
          :aria-label="`Veure detall ${weekStore.daysFull[i]}`"
          @click="selectedDayIndex = i"
        >
          <div class="meal-card__top">
            <div>
              <div class="meal-card__day">{{ weekStore.days[i] }}</div>
              <div class="meal-card__num">{{ getDayNum(i) }}</div>
            </div>
            <div v-if="meal.aiAdjusted" class="meal-card__ai" title="Ajustat per IA">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
            </div>
          </div>

          <div class="meal-card__kcal">
            <transition name="kcal-count" mode="out-in">
              <span :key="meal.total" class="kcal-num">{{ meal.total }}</span>
            </transition>
            <span class="kcal-unit">kcal</span>
          </div>

          <div class="meal-card__macros">
            <div
              v-for="m in miniMacros(meal)"
              :key="m.key"
              class="mini-row"
              :title="`${m.label}: ${m.val}g (obj ${m.target}g)`"
            >
              <span class="mini-row__label">{{ m.label[0] }}</span>
              <div class="mini-row__track">
                <div class="mini-row__fill" :style="{ width: m.pct + '%', background: m.color }"></div>
              </div>
              <span class="mini-row__val">{{ m.val }}</span>
            </div>
          </div>

          <div class="meal-card__slots">
            <div
              v-for="slot in SLOTS"
              :key="slot"
              class="slot-pill"
              :title="`${meal[slot]?.label}: ${meal[slot]?.kcal} kcal`"
            >
              <span class="material-symbols-rounded">{{ slotIcon(slot) }}</span>
              <span>{{ meal[slot]?.kcal }}</span>
            </div>
          </div>

          <div class="meal-card__status" :class="`status-badge--${meal.status}`">
            <span class="material-symbols-rounded icon-fill">{{ meal.status === 'ok' ? 'check_circle' : 'warning' }}</span>
            {{ meal.status === 'ok' ? 'Cobert' : 'Revisar' }}
          </div>
        </button>
      </div>

      <!-- Inline detail area -->
      <section id="meal-detail" class="meal-detail-area" tabindex="-1">
        <MealDetailContent :day-index="selectedDayIndex" />
      </section>
    </div>

    <!-- ── ADVANCED VIEW ── -->
    <div v-show="viewMode === 'advanced'" class="meals-content meals-adv">

      <!-- KPI row (dark navy gradient cards) -->
      <div class="adv-kpi-row">
        <div
          v-for="(kpi, i) in advKpis"
          :key="kpi.label"
          class="adv-kpi"
          :class="kpi.tone === 'good' ? 'adv-kpi--good' : kpi.tone === 'warn' ? 'adv-kpi--warn' : ''"
          :style="{ animationDelay: i * 60 + 'ms' }"
        >
          <div class="adv-kpi__title">
            <span class="adv-kpi__title-text">
              <span class="material-symbols-rounded icon-fill">{{ kpi.icon }}</span>
              {{ kpi.label }}
              <button
                class="info-btn info-btn--dark"
                @click.stop="openInfo(kpi.key)"
                data-tip="Clica per veure més info"
                :aria-label="`Informació sobre ${kpi.label}`"
              >
                <span class="material-symbols-rounded">info</span>
              </button>
            </span>
          </div>
          <div class="adv-kpi__body">
            <span class="adv-kpi__value">{{ kpi.value }}<small v-if="kpi.unit"> {{ kpi.unit }}</small></span>
            <span class="adv-kpi__hint">{{ kpi.hint }}</span>
          </div>
        </div>
      </div>

      <!-- Distribució calòrica setmanal -->
      <section class="adv-card adv-card--wide">
        <header class="adv-card__head">
          <div>
            <h3 class="adv-card__title">
              <span class="material-symbols-rounded icon-fill">bar_chart</span>
              Distribució calòrica setmanal
              <button class="info-btn" @click.stop="openInfo('kcalChart')" data-tip="Clica per veure més info" aria-label="Informació sobre distribució calòrica">
                <span class="material-symbols-rounded">info</span>
              </button>
            </h3>
            <span class="adv-card__sub">Ingesta real (barres) vs. objectiu (línia) · kcal/dia</span>
          </div>
          <div class="chart-legend">
            <span class="chart-legend__item"><span class="dot dot--bar-ok"></span>Cobert</span>
            <span class="chart-legend__item"><span class="dot dot--bar-warn"></span>Revisar</span>
            <span class="chart-legend__item"><span class="dot dot--target"></span>Objectiu</span>
          </div>
        </header>
        <div class="svg-frame">
          <svg :viewBox="`0 0 ${MCW} ${MCH}`" preserveAspectRatio="none" class="chart-svg">
            <!-- Grid lines aligned to nice ticks -->
            <g class="grid">
              <line
                v-for="t in kcalScale.ticks" :key="'mg' + t"
                :x1="MP_L" :x2="MCW - MP_R"
                :y1="mYScale(t)"
                :y2="mYScale(t)"
              />
            </g>
            <!-- Bars -->
            <g class="bars">
              <rect
                v-for="(meal, i) in weekStore.meals"
                :key="'bar' + i"
                :x="mBandX(i) - BAR_W / 2"
                :y="mYScale(meal.total)"
                :width="BAR_W"
                :height="(MCH - MP_B) - mYScale(meal.total)"
                rx="3"
                :class="meal.status === 'ok' ? 'bar--ok' : 'bar--warn'"
              >
                <title>{{ weekStore.daysFull[i] }}: {{ meal.total }} kcal (obj. {{ meal.targetKcal }})</title>
              </rect>
            </g>
            <!-- Target line (polyline connecting per-day targets) -->
            <polyline
              :points="weekStore.meals.map((m, i) => `${mBandX(i)},${mYScale(m.targetKcal)}`).join(' ')"
              class="target-line"
              fill="none"
            />
            <circle
              v-for="(meal, i) in weekStore.meals"
              :key="'tp' + i"
              :cx="mBandX(i)" :cy="mYScale(meal.targetKcal)" r="2.5"
              class="target-dot"
            />
          </svg>
          <!-- HTML Y-axis labels (real px size, independent of SVG scale) -->
          <div class="y-axis-overlay" aria-hidden="true">
            <span
              v-for="t in kcalScale.ticks" :key="'yl' + t"
              :style="{ top: mYPercent(t) + '%' }"
            >{{ t }}</span>
          </div>
          <!-- HTML X-axis labels -->
          <div class="x-axis-overlay" aria-hidden="true">
            <span
              v-for="(d, i) in weekStore.days" :key="'xl' + i"
              :style="{ left: (mBandX(i) / MCW * 100) + '%' }"
            >{{ d }}</span>
          </div>
        </div>
      </section>

      <!-- Composició de macros per dia -->
      <section class="adv-card adv-card--wide">
        <header class="adv-card__head">
          <div>
            <h3 class="adv-card__title">
              <span class="material-symbols-rounded icon-fill">donut_large</span>
              Composició de macros per dia
              <button class="info-btn" @click.stop="openInfo('macros')" data-tip="Clica per veure més info" aria-label="Informació sobre composició de macros">
                <span class="material-symbols-rounded">info</span>
              </button>
            </h3>
            <span class="adv-card__sub">% calories: Hidrats · Proteïna · Greixos · ideal 50/28/22</span>
          </div>
          <div class="chart-legend">
            <span class="chart-legend__item"><span class="dot" style="background:#6366F1"></span>HC</span>
            <span class="chart-legend__item"><span class="dot" style="background:#10B981"></span>Prot</span>
            <span class="chart-legend__item"><span class="dot" style="background:#F59E0B"></span>Greix</span>
          </div>
        </header>
        <div class="macro-days">
          <div v-for="(day, i) in macroPerDay" :key="'md' + i" class="macro-day">
            <span class="macro-day__label">{{ weekStore.days[i] }}</span>
            <div class="macro-day__bar" :title="`HC ${day.carbsPct}% · Prot ${day.proteinPct}% · Greix ${day.fatPct}%`">
              <div class="macro-day__seg macro-day__seg--carbs"   :style="{ flexGrow: day.carbsPct }"></div>
              <div class="macro-day__seg macro-day__seg--protein" :style="{ flexGrow: day.proteinPct }"></div>
              <div class="macro-day__seg macro-day__seg--fat"     :style="{ flexGrow: day.fatPct }"></div>
            </div>
            <span class="macro-day__pcts">{{ day.carbsPct }}% · {{ day.proteinPct }}% · {{ day.fatPct }}%</span>
          </div>
          <!-- Reference row -->
          <div class="macro-day macro-day--ref">
            <span class="macro-day__label">Obj.</span>
            <div class="macro-day__bar macro-day__bar--ref" title="Objectiu: HC 50% · Prot 28% · Greix 22%">
              <div class="macro-day__seg macro-day__seg--carbs"   :style="{ flexGrow: 50 }"></div>
              <div class="macro-day__seg macro-day__seg--protein" :style="{ flexGrow: 28 }"></div>
              <div class="macro-day__seg macro-day__seg--fat"     :style="{ flexGrow: 22 }"></div>
            </div>
            <span class="macro-day__pcts macro-day__pcts--ref">50% · 28% · 22%</span>
          </div>
        </div>
      </section>

      <!-- Timing nutricional -->
      <section class="adv-card adv-card--wide">
        <header class="adv-card__head">
          <div>
            <h3 class="adv-card__title">
              <span class="material-symbols-rounded icon-fill">schedule</span>
              Timing nutricional
              <button class="info-btn" @click.stop="openInfo('timing')" data-tip="Clica per veure més info" aria-label="Informació sobre timing nutricional">
                <span class="material-symbols-rounded">info</span>
              </button>
            </h3>
            <span class="adv-card__sub">Distribució de calories per àpat i sessions del dia</span>
          </div>
        </header>
        <div class="timing-table">
          <div class="timing-head">
            <span class="timing-cell timing-cell--day"></span>
            <span class="timing-cell"><span class="material-symbols-rounded">wb_sunny</span>Esmorzar</span>
            <span class="timing-cell"><span class="material-symbols-rounded">lunch_dining</span>Dinar</span>
            <span class="timing-cell"><span class="material-symbols-rounded">cookie</span>Berenar</span>
            <span class="timing-cell"><span class="material-symbols-rounded">dinner_dining</span>Sopar</span>
            <span class="timing-cell timing-cell--total">Total</span>
          </div>
          <div
            v-for="(meal, i) in weekStore.meals"
            :key="'tr' + i"
            class="timing-row"
            :class="{ 'timing-row--session': timingDaySessions(i).length > 0 }"
          >
            <div class="timing-cell timing-cell--day">
              <span class="timing-day-name">{{ weekStore.days[i] }}</span>
              <div v-if="timingDaySessions(i).length" class="timing-sessions">
                <span
                  v-for="s in timingDaySessions(i)"
                  :key="s.id"
                  class="timing-session-tag"
                  :style="{ background: weekStore.sessionTypes[s.type]?.color + '22', color: weekStore.sessionTypes[s.type]?.color }"
                  :title="`${s.label} · ${s.duration} min · ${s.startTime}:00h`"
                >
                  <span class="material-symbols-rounded">{{ weekStore.sessionTypes[s.type]?.icon }}</span>
                  {{ s.startTime }}h
                </span>
              </div>
            </div>
            <span class="timing-cell">
              <span class="timing-kcal">{{ meal.breakfast?.kcal }}</span>
              <div class="timing-bar" :style="{ width: Math.min(100, (meal.breakfast?.kcal / meal.targetKcal) * 100) + '%' }"></div>
            </span>
            <span class="timing-cell">
              <span class="timing-kcal">{{ meal.lunch?.kcal }}</span>
              <div class="timing-bar" :style="{ width: Math.min(100, (meal.lunch?.kcal / meal.targetKcal) * 100) + '%' }"></div>
            </span>
            <span class="timing-cell">
              <span class="timing-kcal">{{ meal.snack?.kcal }}</span>
              <div class="timing-bar" :style="{ width: Math.min(100, (meal.snack?.kcal / meal.targetKcal) * 100) + '%' }"></div>
            </span>
            <span class="timing-cell">
              <span class="timing-kcal">{{ meal.dinner?.kcal }}</span>
              <div class="timing-bar" :style="{ width: Math.min(100, (meal.dinner?.kcal / meal.targetKcal) * 100) + '%' }"></div>
            </span>
            <span class="timing-cell timing-cell--total" :class="meal.status === 'ok' ? 'timing-total--ok' : 'timing-total--warn'">
              {{ meal.total }} <small>/ {{ meal.targetKcal }}</small>
            </span>
          </div>
        </div>
      </section>
    </div>

    <InfoModal :topic="infoTopic" :topics="infoTopics" @close="closeInfo" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import MealDetailContent from '@/components/meal/MealDetailContent.vue'
import InfoModal from '@/components/ui/InfoModal.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner']

// View switcher
const viewMode = ref('simple')
watch(() => uiStore.advancedMetrics, v => { if (!v) viewMode.value = 'simple' })

const todayIndex = computed(() => {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
})

const selectedDayIndex = ref(todayIndex.value)

watch(() => weekStore.weekOffset, () => {
  selectedDayIndex.value = todayIndex.value
})

function slotIcon(slot) {
  return { breakfast: 'wb_sunny', lunch: 'lunch_dining', snack: 'cookie', dinner: 'dinner_dining' }[slot] ?? 'restaurant'
}

function getDayNum(dayIdx) {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - todayIndex.value + dayIdx + weekStore.weekOffset * 7)
  return start.getDate()
}

const MINI_MACROS_CFG = computed(() => {
  const kcal = authStore.caloricGoal || 2000
  return [
    { key: 'carbs',   label: 'Hidrats',  target: Math.round(kcal * 0.50 / 4), max: Math.round(kcal * 0.65 / 4), color: 'var(--purple)' },
    { key: 'protein', label: 'Proteïna', target: Math.round(kcal * 0.28 / 4), max: Math.round(kcal * 0.35 / 4), color: '#00C896' },
    { key: 'fat',     label: 'Greixos',  target: Math.round(kcal * 0.30 / 9), max: Math.round(kcal * 0.40 / 9), color: '#F59E0B' },
  ]
})

function miniMacros(meal) {
  const vals = {
    carbs:   SLOTS.reduce((s, k) => s + (meal[k]?.carbs   ?? 0), 0),
    protein: SLOTS.reduce((s, k) => s + (meal[k]?.protein ?? 0), 0),
    fat:     SLOTS.reduce((s, k) => s + (meal[k]?.fat     ?? 0), 0),
  }
  return MINI_MACROS_CFG.value.map(cfg => ({
    ...cfg,
    val: Math.round(vals[cfg.key]),
    pct: Math.min(100, (vals[cfg.key] / cfg.max) * 100),
  }))
}

// ── Advanced view ────────────────────────────────────────────────

// KPI strip
const advKpis = computed(() => {
  const meals = weekStore.meals
  const okDays = meals.filter(m => m.status === 'ok').length
  const adherence = Math.round((okDays / 7) * 100)
  const avgProtein = Math.round(
    meals.reduce((s, m) => s + SLOTS.reduce((ts, slot) => ts + (m[slot]?.protein ?? 0), 0), 0) / 7
  )
  const avgDeviation = Math.round(
    meals.reduce((s, m) => s + Math.abs(m.total - m.targetKcal), 0) / 7
  )
  const bestIdx = meals.reduce((bi, m, i) =>
    Math.abs(m.total - m.targetKcal) < Math.abs(meals[bi].total - meals[bi].targetKcal) ? i : bi, 0)
  const proteinGoal = Math.round((authStore.caloricGoal || 2000) * 0.28 / 4)
  return [
    { key: 'adherence', icon: 'check_circle',          label: 'Adherència',       value: `${adherence}%`,    unit: '',      hint: `${okDays}/7 dies en objectiu`,         tone: adherence >= 70 ? 'good' : 'warn' },
    { key: 'protein',   icon: 'egg_alt',               label: 'Proteïna mitj.',   value: avgProtein,          unit: 'g/dia', hint: `Objectiu ${proteinGoal} g`,             tone: avgProtein >= proteinGoal ? 'good' : 'accent' },
    { key: 'deviation', icon: 'local_fire_department', label: 'Desviació mitj.',  value: avgDeviation,        unit: 'kcal',  hint: 'Desviació absoluta vs. objectiu',       tone: avgDeviation < 150 ? 'good' : 'warn' },
    { key: 'bestDay',   icon: 'star',                  label: 'Millor dia',       value: weekStore.daysFull[bestIdx].slice(0, 3), unit: '', hint: `${Math.abs(meals[bestIdx].total - meals[bestIdx].targetKcal)} kcal de desv.`, tone: 'cool' },
  ]
})

// ── Info modal — per-metric explanations ──
const infoTopic = ref(null)
function openInfo(key) { infoTopic.value = key }
function closeInfo() { infoTopic.value = null }

const infoTopics = computed(() => {
  const meals = weekStore.meals
  const okDays = meals.filter(m => m.status === 'ok').length
  const adherence = Math.round((okDays / 7) * 100)
  const proteinGoal = Math.round((authStore.caloricGoal || 2000) * 0.28 / 4)
  const avgProtein = Math.round(
    meals.reduce((s, m) => s + SLOTS.reduce((ts, slot) => ts + (m[slot]?.protein ?? 0), 0), 0) / 7
  )
  const avgDeviation = Math.round(
    meals.reduce((s, m) => s + Math.abs(m.total - m.targetKcal), 0) / 7
  )
  const bestIdx = meals.reduce((bi, m, i) =>
    Math.abs(m.total - m.targetKcal) < Math.abs(meals[bi].total - meals[bi].targetKcal) ? i : bi, 0)
  return {
    adherence: {
      icon: 'check_circle', title: "Adherència calòrica",
      body: 'Percentatge de dies de la setmana en què la ingesta total està dins del marge acceptable respecte de l\'objectiu calòric del dia (estat "Cobert").',
      formula: { equation: 'Adherència = (dies amb status "ok" ÷ 7) × 100%' },
      thresholds: [
        { range: '≥ 85%', label: 'Excel·lent', tone: 'good' },
        { range: '70 – 85%', label: 'Bona', tone: 'good' },
        { range: '50 – 70%', label: 'Millorable', tone: 'warn' },
        { range: '< 50%', label: 'Baixa', tone: 'risk' },
      ],
      example: `Aquesta setmana: ${okDays}/7 dies en objectiu (${adherence}%).`,
    },
    protein: {
      icon: 'egg_alt', title: 'Proteïna mitjana diària',
      body: 'Mitjana de grams de proteïna ingerits al dia. La proteïna afavoreix la recuperació muscular i la sacietat. El nostre objectiu es calcula com un 28% de les calories diàries / 4 kcal/g.',
      formula: {
        equation: 'Prot mitj. = Σ proteïna_dia ÷ 7      ·      Obj. = (kcal × 0.28) ÷ 4',
        legend: [
          { label: 'Objectiu kcal', value: `${authStore.caloricGoal || '–'} kcal` },
          { label: 'Objectiu prot', value: `${proteinGoal} g/dia` },
        ],
      },
      example: `La teva mitjana setmanal: ${avgProtein} g/dia (objectiu ${proteinGoal} g).`,
    },
    deviation: {
      icon: 'local_fire_department', title: 'Desviació calòrica mitjana',
      body: 'Diferència absoluta mitjana entre la ingesta real i l\'objectiu calòric de cada dia. Valors baixos indiquen que ajustes bé les calories al pla.',
      formula: { equation: 'Desviació = Σ |total_dia − objectiu_dia| ÷ 7' },
      thresholds: [
        { range: '< 150 kcal', label: 'Bona precisió', tone: 'good' },
        { range: '150 – 300', label: 'Acceptable', tone: 'warn' },
        { range: '> 300 kcal', label: 'Massa dispers', tone: 'risk' },
      ],
      example: `La teva desviació mitjana: ${avgDeviation} kcal/dia.`,
    },
    bestDay: {
      icon: 'star', title: 'Millor dia de la setmana',
      body: 'El dia amb la menor desviació absoluta entre la ingesta real i l\'objectiu calòric. És el dia que millor has ajustat la nutrició al pla.',
      formula: { equation: 'millor = argmin(|total_dia − objectiu_dia|)' },
      example: `El teu millor dia: ${weekStore.daysFull[bestIdx]} amb ${Math.abs(meals[bestIdx].total - meals[bestIdx].targetKcal)} kcal de desviació (ingesta ${meals[bestIdx].total} / obj ${meals[bestIdx].targetKcal}).`,
    },
    kcalChart: {
      icon: 'bar_chart', title: 'Distribució calòrica setmanal',
      body: 'Visualització de la ingesta calòrica real per dia (barres) comparada amb l\'objectiu calòric ajustat per la càrrega d\'entrenament (línia puntejada). Els dies d\'alta càrrega tenen un objectiu superior.',
      formula: {
        equation: 'obj_dia = base_dia × (1.12 si càrrega alta)',
        legend: [
          { label: 'Barra verda', value: 'Dia cobert' },
          { label: 'Barra taronja', value: 'Cal revisar' },
        ],
      },
      example: `Aquesta setmana ingerits ${meals.reduce((s, m) => s + m.total, 0).toLocaleString('ca-ES')} kcal vs. objectiu ${meals.reduce((s, m) => s + m.targetKcal, 0).toLocaleString('ca-ES')} kcal.`,
    },
    macros: {
      icon: 'donut_large', title: 'Composició de macronutrients',
      body: 'Percentatge de calories que aporta cada macronutrient (HC, proteïna, greixos) per dia. La distribució ideal recomanada és aproximadament 50% HC, 28% proteïna i 22% greixos, però pot variar segons l\'objectiu.',
      formula: {
        equation: '%_macro = (g_macro × kcal/g) ÷ kcal_totals × 100%',
        legend: [
          { label: 'HC', value: '4 kcal/g' },
          { label: 'Proteïna', value: '4 kcal/g' },
          { label: 'Greixos', value: '9 kcal/g' },
        ],
      },
      mapping: [
        { from: 'HC', to: '45 – 55% (resistència)' },
        { from: 'Proteïna', to: '25 – 30% (força)' },
        { from: 'Greixos', to: '20 – 30%' },
      ],
    },
    timing: {
      icon: 'schedule', title: 'Timing nutricional',
      body: 'Distribució de les calories al llarg del dia per cada àpat (esmorzar, dinar, berenar, sopar). Els dies amb sessions d\'entrenament es destaquen perquè requereixen un timing nutricional específic (pre i post entrenament).',
      legend: [
        { label: 'Pre-workout', value: '2 – 3 h abans' },
        { label: 'Post-workout', value: '0 – 1 h després' },
        { label: 'Esmorzar', value: '~ 25% kcal' },
        { label: 'Dinar', value: '~ 35% kcal' },
      ],
    },
  }
})

// Macro composition per day
const macroPerDay = computed(() => weekStore.meals.map(meal => {
  const carbs   = SLOTS.reduce((s, slot) => s + (meal[slot]?.carbs   ?? 0), 0)
  const protein = SLOTS.reduce((s, slot) => s + (meal[slot]?.protein ?? 0), 0)
  const fat     = SLOTS.reduce((s, slot) => s + (meal[slot]?.fat     ?? 0), 0)
  const totalKcalFromMacros = carbs * 4 + protein * 4 + fat * 9 || 1
  return {
    carbsPct:   Math.round((carbs   * 4 / totalKcalFromMacros) * 100),
    proteinPct: Math.round((protein * 4 / totalKcalFromMacros) * 100),
    fatPct:     Math.round((fat     * 9 / totalKcalFromMacros) * 100),
  }
}))

// Timing table helpers
function timingDaySessions(i) { return weekStore.sessionsByDay[i] ?? [] }

// Chart geometry
const MCW = 560
const MCH = 100
const MP_L = 28, MP_R = 10, MP_T = 10, MP_B = 16
const BAR_W = 11  // thinner bars

// Y-axis label position (as % of SVG frame height) — used by HTML overlay
function mYPercent(v) {
  const max = kcalChartMax.value
  const usable = MCH - MP_T - MP_B
  return ((MP_T + usable * (1 - v / Math.max(1, max))) / MCH) * 100
}

// "Nice" round-number scale (same helper as ProgressView)
function niceScale(min, max, maxTicks = 5) {
  if (!isFinite(min) || !isFinite(max) || min === max) {
    const v = max || 1
    return { min: 0, max: v, step: v, ticks: [0, v] }
  }
  const range = max - min
  const roughStep = range / Math.max(1, maxTicks - 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(roughStep))))
  const normalized = roughStep / magnitude
  let niceStep
  if (normalized <= 1) niceStep = 1
  else if (normalized <= 2) niceStep = 2
  else if (normalized <= 5) niceStep = 5
  else niceStep = 10
  const step = niceStep * magnitude
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks = []
  for (let v = niceMin; v <= niceMax + step * 0.001; v += step) {
    ticks.push(Math.round(v * 1e6) / 1e6)
  }
  return { min: niceMin, max: niceMax, step, ticks }
}

const kcalScale = computed(() => {
  const rawMax = Math.max(...weekStore.meals.map(m => Math.max(m.total, m.targetKcal)))
  return niceScale(0, rawMax, 5)
})
const kcalChartMax = computed(() => kcalScale.value.max)

function mBandX(i) {
  const step = (MCW - MP_L - MP_R) / 7
  return MP_L + step * i + step / 2
}

function mYScale(v) {
  return MP_T + (1 - v / kcalChartMax.value) * (MCH - MP_T - MP_B)
}
</script>

<style scoped>
.meals-view { display: flex; flex-direction: column; }
.meals-content { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

/* Week navigation */
.week-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 10px 16px;
  box-shadow: var(--shadow-sm);
}
.week-nav__btn {
  width: 34px; height: 34px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-2);
  transition: background var(--dur-fast), color var(--dur-fast);
}
.week-nav__btn:hover { background: var(--surface-2); color: var(--accent); }
.week-nav__btn .material-symbols-rounded { font-size: 20px; }
.week-nav__center {
  display: flex; align-items: center; gap: 10px;
  flex: 1; justify-content: center;
}
.week-nav__label { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text); }
.week-nav__chip {
  font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 99px;
  background: var(--accent-light); color: var(--accent-dark);
}

/* "Avui" pill — left of the prev arrow, disabled when already on current week */
.week-nav__today {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--navy);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--dur-fast), color var(--dur-fast),
              box-shadow var(--dur-fast), transform var(--dur-fast);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
}
.week-nav__today:hover {
  background: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px color-mix(in srgb, var(--accent) 40%, transparent);
}
.week-nav__today .material-symbols-rounded { font-size: 16px; }

.week-nav__today--disabled,
.week-nav__today--disabled:hover {
  background: var(--surface-3, var(--surface-2));
  color: var(--text-3);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

/* 7-day grid */
.meals-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

/* Day card */
.meal-card {
  position: relative;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--dur-fast), box-shadow var(--dur-fast), border-color var(--dur-fast), background var(--dur-fast);
  animation: fadeInUp 0.4s var(--ease) both;
  text-align: left;
  font-family: inherit;
  color: inherit;
  min-height: 200px;
}
.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-2);
}
.meal-card--today { box-shadow: 0 0 0 1.5px var(--accent), var(--shadow-sm); }
.meal-card--warning { border-color: var(--warning-soft-border); background: var(--warning-surface-body); }
.meal-card--selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  box-shadow: 0 0 0 2px var(--accent), var(--shadow-md);
}

.meal-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.meal-card__day {
  font-family: var(--font-display);
  font-size: 11px; font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.meal-card__num {
  font-family: var(--font-display);
  font-size: 20px; font-weight: 800; color: var(--text);
  line-height: 1;
}

.meal-card__ai {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent-dark);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.meal-card__ai .material-symbols-rounded { font-size: 13px; }

.meal-card__kcal { display: flex; align-items: baseline; gap: 4px; }
.kcal-num { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); display: inline-block; }
.kcal-unit { font-size: 11px; color: var(--text-3); font-weight: 600; }

.meal-card__macros { display: flex; flex-direction: column; gap: 4px; }
.mini-row {
  display: grid;
  grid-template-columns: 10px 1fr 28px;
  align-items: center;
  gap: 6px;
}
.mini-row__label { font-size: 9px; font-weight: 700; color: var(--text-3); }
.mini-row__track {
  height: 4px;
  background: var(--surface-3);
  border-radius: 99px;
  overflow: hidden;
}
.mini-row__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s var(--ease);
}
.mini-row__val { font-size: 9px; font-weight: 600; color: var(--text-2); text-align: right; }

.meal-card__slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}
.slot-pill {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 6px;
  background: var(--surface-2);
  border-radius: var(--radius-sm);
  font-size: 10px; font-weight: 600; color: var(--text-2);
}
.slot-pill .material-symbols-rounded { font-size: 11px; color: var(--accent); }

.meal-card__status {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700;
  padding: 4px 8px; border-radius: 99px;
  align-self: flex-start;
  margin-top: auto;
}
.meal-card__status .material-symbols-rounded { font-size: 12px; }
.status-badge--ok { background: var(--accent-light); color: var(--accent-dark); }
.status-badge--warning { background: var(--warning-light); color: var(--warning); }

/* Detail area */
.meal-detail-area {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 22px 24px;
  box-shadow: var(--shadow-sm);
  outline: none;
}

/* Kcal counter transition */
.kcal-count-enter-active { animation: kcalIn 0.35s var(--ease) both; }
.kcal-count-leave-active { animation: kcalOut 0.2s var(--ease) both; }
@keyframes kcalIn  { from { transform: translateY(8px);  opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes kcalOut { from { transform: translateY(0);    opacity: 1; } to { transform: translateY(-8px); opacity: 0; } }

@media (max-width: 1100px) {
  .meals-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 700px) {
  .meals-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ═══ View switcher ════════════════════════════════════════════════ */
.view-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 12px 24px 0;
  padding: 4px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  position: relative;
  width: fit-content;
  isolation: isolate;
}
.view-switch__btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 18px;
  border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600;
  color: var(--text-3);
  position: relative; z-index: 1;
  transition: color var(--dur-fast);
  cursor: pointer;
  white-space: nowrap;
}
.view-switch__btn:hover { color: var(--text-2); }
.view-switch__btn--active { color: var(--navy); }
.view-switch__btn .material-symbols-rounded { font-size: 16px; }
.view-switch__badge {
  font-size: 9px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;
  padding: 2px 6px; border-radius: 99px;
  background: var(--navy); color: var(--accent);
}
.view-switch__indicator {
  position: absolute; z-index: 0;
  top: 4px; bottom: 4px; left: 4px;
  width: calc(50% - 4px);
  background: var(--accent);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: transform var(--dur-med) var(--ease);
}
.view-switch__indicator--simple   { transform: translateX(0); }
.view-switch__indicator--advanced { transform: translateX(100%); }

/* ═══ Advanced view ════════════════════════════════════════════════ */
.meals-adv { animation: fadeInUp 0.3s var(--ease) both; }

/* KPI row — dark navy gradient cards (Sessions-style) */
.adv-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.adv-kpi {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 100%);
  color: white;
  border-radius: var(--radius-xl);
  padding: 16px 18px;
  box-shadow: var(--shadow-md);
  display: flex; flex-direction: column; gap: 10px;
  min-height: 130px;
  animation: fadeInUp 0.4s var(--ease) both;
}
.adv-kpi--good { background: linear-gradient(135deg, #064E3B 0%, #065F46 100%); }
.adv-kpi--warn { background: linear-gradient(135deg, #7C2D12 0%, #9A3412 100%); }
.adv-kpi__title {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.85);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.adv-kpi__title-text { display: inline-flex; align-items: center; gap: 6px; }
.adv-kpi__title .material-symbols-rounded { font-size: 16px; color: var(--accent); }
.adv-kpi__body { display: flex; flex-direction: column; gap: 4px; }
.adv-kpi__value {
  font-family: var(--font-display); font-size: 30px; font-weight: 800;
  color: white; line-height: 1;
}
.adv-kpi__value small { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 500; margin-left: 4px; }
.adv-kpi__hint { font-size: 11px; color: rgba(255,255,255,0.55); }

/* Chart cards (Sessions-style: light surface) */
.adv-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 12px;
}
.adv-card__head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  flex-wrap: wrap;
}
.adv-card__title {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text);
}
.adv-card__title .material-symbols-rounded { font-size: 16px; color: var(--accent); }
.adv-card__sub { font-size: 11px; color: var(--text-3); margin-top: 3px; display: block; }

/* Chart */
.svg-frame { position: relative; width: 100%; overflow: visible; }
.chart-svg { width: 100%; height: auto; display: block; overflow: visible; }
.grid line { stroke: var(--border); stroke-width: 0.5; vector-effect: non-scaling-stroke; }
.bars .bar--ok   { fill: var(--accent); opacity: 0.78; }
.bars .bar--warn { fill: var(--warning); opacity: 0.78; }
.target-line { stroke: var(--text-3); stroke-width: 1; stroke-dasharray: 3 2; vector-effect: non-scaling-stroke; }
.target-dot  { fill: var(--text-3); }

/* HTML axis overlays — keep label font at a fixed pixel size */
.y-axis-overlay { position: absolute; inset: 0; pointer-events: none; }
.y-axis-overlay > span {
  position: absolute;
  left: 0;
  width: 5%;
  min-width: 30px;
  text-align: right;
  padding-right: 4px;
  transform: translateY(-50%);
  font-size: 9px;
  color: var(--text-3);
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.x-axis-overlay { position: absolute; left: 0; right: 0; bottom: 0; pointer-events: none; height: 16%; }
.x-axis-overlay > span {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 9px;
  color: var(--text-3);
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.chart-legend { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.chart-legend__item { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-3); }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot--bar-ok   { background: var(--accent); }
.dot--bar-warn { background: var(--warning); }
.dot--target   { background: var(--text-3); }

/* Macro composition */
.macro-days { display: flex; flex-direction: column; gap: 6px; }
.macro-day {
  display: grid; grid-template-columns: 28px 1fr 120px;
  align-items: center; gap: 10px;
}
.macro-day--ref { margin-top: 4px; border-top: 1px dashed var(--border); padding-top: 8px; opacity: 0.7; }
.macro-day__label { font-size: 11px; font-weight: 700; color: var(--text-3); }
.macro-day__bar {
  display: flex; height: 10px; border-radius: 99px;
  overflow: hidden; background: var(--surface-3);
}
.macro-day__bar--ref { height: 8px; }
.macro-day__seg { min-width: 2px; }
.macro-day__seg--carbs   { background: #6366F1; }
.macro-day__seg--protein { background: #10B981; }
.macro-day__seg--fat     { background: #F59E0B; }
.macro-day__pcts { font-size: 10px; color: var(--text-3); text-align: right; white-space: nowrap; }
.macro-day__pcts--ref { color: var(--text-2); font-weight: 600; }

/* Timing table */
.timing-table { display: flex; flex-direction: column; }
.timing-head, .timing-row {
  display: grid;
  grid-template-columns: 110px repeat(4, 1fr) 100px;
  align-items: center;
  gap: 8px;
}
.timing-head {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}
.timing-head .timing-cell {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3);
}
.timing-head .timing-cell .material-symbols-rounded { font-size: 13px; }
.timing-row {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.timing-row:last-child { border-bottom: none; }
.timing-row--session { background: color-mix(in srgb, var(--accent) 4%, transparent); border-radius: var(--radius-md); padding: 8px 6px; }
.timing-cell { display: flex; flex-direction: column; gap: 4px; }
.timing-cell--day { gap: 6px; }
.timing-cell--total { text-align: right; align-items: flex-end; }
.timing-day-name { font-size: 12px; font-weight: 700; color: var(--text); }
.timing-sessions { display: flex; flex-wrap: wrap; gap: 4px; }
.timing-session-tag {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 9px; font-weight: 700;
  padding: 2px 6px; border-radius: 99px;
}
.timing-session-tag .material-symbols-rounded { font-size: 11px; }
.timing-kcal { font-size: 12px; font-weight: 600; color: var(--text); }
.timing-bar {
  height: 3px; border-radius: 99px;
  background: var(--accent); opacity: 0.5;
  max-width: 100%;
}
.timing-total--ok   { font-size: 12px; font-weight: 700; color: var(--accent-dark); }
.timing-total--warn { font-size: 12px; font-weight: 700; color: var(--warning); }
.timing-total--ok small, .timing-total--warn small { font-weight: 400; color: var(--text-3); margin-left: 2px; }

@media (max-width: 1100px) { .adv-kpi-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 700px) {
  .adv-kpi-row { grid-template-columns: 1fr; }
  .timing-table { overflow-x: auto; }
  .timing-head, .timing-row { min-width: 500px; }
}
</style>

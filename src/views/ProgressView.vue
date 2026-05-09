<template>
  <div class="progress-view">
    <AppTopBar title="Progrés" subtitle="Evolució setmanal del rendiment i la nutrició" />

    <!-- View switcher (only when advanced mode is enabled in Profile) -->
    <div v-if="uiStore.advancedMetrics" class="view-switch" role="tablist">
      <button
        class="view-switch__btn"
        :class="{ 'view-switch__btn--active': viewMode === 'simple' }"
        @click="viewMode = 'simple'"
        role="tab"
        :aria-selected="viewMode === 'simple'"
      >
        <span class="material-symbols-rounded">timeline</span>
        Vista simple
      </button>
      <button
        class="view-switch__btn"
        :class="{ 'view-switch__btn--active': viewMode === 'advanced' }"
        @click="viewMode = 'advanced'"
        role="tab"
        :aria-selected="viewMode === 'advanced'"
      >
        <span class="material-symbols-rounded">science</span>
        Vista avançada
        <span class="view-switch__badge">PRO</span>
      </button>
      <span class="view-switch__indicator" :class="`view-switch__indicator--${viewMode}`"></span>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- ═══ SIMPLE VIEW                                              ═══ -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div v-show="viewMode === 'simple'" class="progress-content">
      <!-- KPI strip (4 mini stats with trend deltas) -->
      <div class="kpi-strip">
        <div
          v-for="(k, i) in simpleKpis"
          :key="k.label"
          class="kpi"
          :style="{ animationDelay: i * 60 + 'ms' }"
        >
          <span class="kpi__icon" :class="`kpi__icon--${k.tone}`">
            <span class="material-symbols-rounded icon-fill">{{ k.icon }}</span>
          </span>
          <div class="kpi__body">
            <span class="kpi__label">{{ k.label }}</span>
            <span class="kpi__value">
              {{ k.value }}<small v-if="k.unit"> {{ k.unit }}</small>
            </span>
            <span class="kpi__delta" :class="deltaClass(k.delta)">
              <span class="material-symbols-rounded">{{ k.delta > 0 ? 'arrow_upward' : k.delta < 0 ? 'arrow_downward' : 'remove' }}</span>
              {{ deltaText(k.delta, k.unit, k.deltaPrecision) }} vs. mes anterior
            </span>
          </div>
        </div>
      </div>

      <!-- Volum + sessions (combo: bars = hores, line = sessions) -->
      <section class="chart-card chart-card--wide">
        <header class="chart-card__head">
          <div>
            <h3 class="chart-card__title">
              <span class="material-symbols-rounded icon-fill">stacked_line_chart</span>
              Volum d'entrenament
            </h3>
            <span class="chart-card__sub">Hores per setmana · línia: nombre de sessions</span>
          </div>
          <div class="chart-legend">
            <span class="chart-legend__item"><span class="dot dot--bar"></span>Hores</span>
            <span class="chart-legend__item"><span class="dot dot--line"></span>Sessions</span>
          </div>
        </header>
        <div class="combo-chart">
          <svg :viewBox="`0 0 ${CW} ${CH}`" preserveAspectRatio="none" class="chart-svg">
            <!-- Y grid lines -->
            <g class="grid">
              <line v-for="g in 4" :key="g" :x1="PAD_L" :x2="CW - PAD_R" :y1="PAD_T + g * (CH - PAD_T - PAD_B) / 4" :y2="PAD_T + g * (CH - PAD_T - PAD_B) / 4" />
            </g>
            <!-- Bars (hours) -->
            <g class="bars">
              <rect
                v-for="(w, i) in weeks"
                :key="'b' + i"
                :x="bandX(i) - BAR_W / 2"
                :y="yScale(w.hours, hoursMax)"
                :width="BAR_W"
                :height="(CH - PAD_B) - yScale(w.hours, hoursMax)"
                rx="3"
                :class="{ 'bar--current': i === weeks.length - 1 }"
              >
                <title>{{ w.wk }}: {{ w.hours }}h</title>
              </rect>
            </g>
            <!-- Sessions line -->
            <path :d="linePath(weeks.map(w => w.sessions), sessionsMax)" class="line line--sessions" />
            <circle
              v-for="(w, i) in weeks"
              :key="'p' + i"
              :cx="bandX(i)"
              :cy="yScale(w.sessions, sessionsMax)"
              r="3.2"
              class="line-dot line-dot--sessions"
              :class="{ 'line-dot--current': i === weeks.length - 1 }"
            >
              <title>{{ w.wk }}: {{ w.sessions }} sessions</title>
            </circle>
            <!-- X labels -->
            <g class="axis-x">
              <text v-for="(w, i) in weeks" :key="'l' + i" :x="bandX(i)" :y="CH - 4" text-anchor="middle">{{ w.wk }}</text>
            </g>
            <!-- Y axis (left = hours) -->
            <g class="axis-y">
              <text :x="PAD_L - 6" :y="PAD_T + 4" text-anchor="end">{{ hoursMax }}h</text>
              <text :x="PAD_L - 6" :y="CH - PAD_B + 4" text-anchor="end">0</text>
            </g>
          </svg>
        </div>
      </section>

      <div class="chart-row chart-row--two">
        <!-- Pes corporal -->
        <section class="chart-card">
          <header class="chart-card__head">
            <div>
              <h3 class="chart-card__title">
                <span class="material-symbols-rounded icon-fill">monitor_weight</span>
                Pes corporal
              </h3>
              <span class="chart-card__sub">Tendència 12 setmanes · objectiu 77 kg</span>
            </div>
            <span class="trend-pill" :class="`trend-pill--${weightTrend.tone}`">
              <span class="material-symbols-rounded">{{ weightTrend.icon }}</span>
              {{ weightTrend.delta }} kg
            </span>
          </header>
          <div class="line-chart">
            <svg :viewBox="`0 0 ${CW} ${CH}`" preserveAspectRatio="none" class="chart-svg">
              <!-- Goal band -->
              <rect
                :x="PAD_L"
                :y="yScale(77.5, weightYDomain.max, weightYDomain.min)"
                :width="CW - PAD_L - PAD_R"
                :height="yScale(76.5, weightYDomain.max, weightYDomain.min) - yScale(77.5, weightYDomain.max, weightYDomain.min)"
                class="goal-band"
              />
              <line
                :x1="PAD_L"
                :x2="CW - PAD_R"
                :y1="yScale(77, weightYDomain.max, weightYDomain.min)"
                :y2="yScale(77, weightYDomain.max, weightYDomain.min)"
                class="goal-line"
              />
              <!-- Area + line -->
              <path :d="areaPath(weeks.map(w => w.weight), weightYDomain.max, weightYDomain.min)" class="line-area" />
              <path :d="linePath(weeks.map(w => w.weight), weightYDomain.max, weightYDomain.min)" class="line line--weight" />
              <circle
                v-for="(w, i) in weeks"
                :key="'wg' + i"
                :cx="bandX(i)"
                :cy="yScale(w.weight, weightYDomain.max, weightYDomain.min)"
                r="2.8"
                class="line-dot line-dot--weight"
                :class="{ 'line-dot--current': i === weeks.length - 1 }"
              >
                <title>{{ w.wk }}: {{ w.weight }} kg</title>
              </circle>
              <text :x="PAD_L - 6" :y="PAD_T + 4" text-anchor="end" class="axis-y">{{ weightYDomain.max }}</text>
              <text :x="PAD_L - 6" :y="CH - PAD_B + 4" text-anchor="end" class="axis-y">{{ weightYDomain.min }}</text>
              <text v-for="(w, i) in weeks" :key="'wl' + i" :x="bandX(i)" :y="CH - 4" text-anchor="middle" class="axis-x">{{ w.wk }}</text>
            </svg>
          </div>
        </section>

        <!-- Adherència nutricional -->
        <section class="chart-card">
          <header class="chart-card__head">
            <div>
              <h3 class="chart-card__title">
                <span class="material-symbols-rounded icon-fill">restaurant</span>
                Adherència nutricional
              </h3>
              <span class="chart-card__sub">% setmanes complertes · objectiu ≥ 80%</span>
            </div>
            <span class="trend-pill trend-pill--good">
              <span class="material-symbols-rounded">arrow_upward</span>
              {{ adhAvgRecent }}% mitjana
            </span>
          </header>
          <div class="adh-bars">
            <div
              v-for="(w, i) in weeks"
              :key="'ah' + i"
              class="adh-bar"
              :class="{ 'adh-bar--current': i === weeks.length - 1 }"
            >
              <div class="adh-bar__col">
                <div
                  class="adh-bar__fill"
                  :class="`adh-bar__fill--${adhTone(w.adh)}`"
                  :style="{ height: w.adh + '%' }"
                  :title="`${w.wk}: ${w.adh}%`"
                >
                  <span v-if="w.adh >= 60" class="adh-bar__val">{{ w.adh }}</span>
                </div>
              </div>
              <span class="adh-bar__label">{{ w.wk }}</span>
            </div>
          </div>
        </section>
      </div>

      <div class="chart-row chart-row--two">
        <!-- Distribució per esport (mes actual) -->
        <section class="chart-card">
          <header class="chart-card__head">
            <div>
              <h3 class="chart-card__title">
                <span class="material-symbols-rounded icon-fill">donut_small</span>
                Distribució per esport
              </h3>
              <span class="chart-card__sub">Últimes 4 setmanes · {{ sportTotalLabel }}</span>
            </div>
          </header>
          <div class="donut-row">
            <div class="donut" :style="{ '--gradient': donutGradient }" aria-hidden="true">
              <div class="donut__center">
                <span class="donut__num">{{ sportBreakdown.length }}</span>
                <span class="donut__label">esports</span>
              </div>
            </div>
            <div class="sport-legend">
              <div v-for="s in sportBreakdown" :key="s.type" class="sport-legend__row">
                <span class="sport-legend__dot" :style="{ background: s.color }"></span>
                <span class="sport-legend__icon">
                  <span class="material-symbols-rounded">{{ s.icon }}</span>
                </span>
                <span class="sport-legend__label">{{ s.type }}</span>
                <span class="sport-legend__pct">{{ s.pct }}%</span>
                <span class="sport-legend__min">{{ formatMinutes(s.minutes) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Fites recents -->
        <section class="chart-card">
          <header class="chart-card__head">
            <div>
              <h3 class="chart-card__title">
                <span class="material-symbols-rounded icon-fill">military_tech</span>
                Fites recents
              </h3>
              <span class="chart-card__sub">Rècords personals i ratxes</span>
            </div>
          </header>
          <div class="milestones-list">
            <div v-for="(m, i) in milestones" :key="m.id" class="milestone" :style="{ animationDelay: i * 50 + 'ms' }">
              <span class="milestone__icon" :class="`milestone__icon--${m.tone}`">
                <span class="material-symbols-rounded icon-fill">{{ m.icon }}</span>
              </span>
              <div class="milestone__body">
                <span class="milestone__title">{{ m.title }}</span>
                <span class="milestone__date">{{ m.date }}</span>
              </div>
              <span class="milestone__value">{{ m.value }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- ═══ ADVANCED VIEW                                            ═══ -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div v-show="uiStore.advancedMetrics && viewMode === 'advanced'" class="progress-content">
      <!-- Advanced KPI strip -->
      <div class="kpi-strip kpi-strip--adv">
        <div v-for="(k, i) in advKpis" :key="k.label" class="kpi" :style="{ animationDelay: i * 60 + 'ms' }">
          <span class="kpi__icon" :class="`kpi__icon--${k.tone}`">
            <span class="material-symbols-rounded icon-fill">{{ k.icon }}</span>
          </span>
          <div class="kpi__body">
            <span class="kpi__label">{{ k.label }}</span>
            <span class="kpi__value">
              {{ k.value }}<small v-if="k.unit"> {{ k.unit }}</small>
            </span>
            <span class="kpi__hint">{{ k.hint }}</span>
          </div>
        </div>
      </div>

      <!-- Performance Management Chart (CTL / ATL / TSB) -->
      <section class="chart-card chart-card--wide">
        <header class="chart-card__head">
          <div>
            <h3 class="chart-card__title">
              <span class="material-symbols-rounded icon-fill">monitoring</span>
              Performance Management Chart
            </h3>
            <span class="chart-card__sub">CTL (forma) · ATL (fatiga) · TSB (frescor) — 12 setmanes</span>
          </div>
          <div class="chart-legend">
            <span class="chart-legend__item"><span class="dot" style="background: var(--accent)"></span>CTL</span>
            <span class="chart-legend__item"><span class="dot" style="background: #EF4444"></span>ATL</span>
            <span class="chart-legend__item"><span class="dot" style="background: var(--purple)"></span>TSB</span>
          </div>
        </header>
        <div class="pmc-chart">
          <svg :viewBox="`0 0 ${CW} ${PMC_H}`" preserveAspectRatio="none" class="chart-svg">
            <!-- Grid -->
            <g class="grid">
              <line v-for="g in 4" :key="g" :x1="PAD_L" :x2="CW - PAD_R" :y1="PAD_T + g * (PMC_H - PAD_T - PAD_B) / 4" :y2="PAD_T + g * (PMC_H - PAD_T - PAD_B) / 4" />
            </g>
            <!-- TSB area (positive=fresh, negative=fatigue) -->
            <path :d="pmcTsbArea" class="line-area line-area--purple" />
            <!-- Lines -->
            <path :d="linePath(performanceCurve.map(p => p.ctl), pmcDomain.max, pmcDomain.min, PMC_H)" class="line line--ctl" />
            <path :d="linePath(performanceCurve.map(p => p.atl), pmcDomain.max, pmcDomain.min, PMC_H)" class="line line--atl" />
            <path :d="linePath(performanceCurve.map(p => p.tsb), pmcDomain.max, pmcDomain.min, PMC_H)" class="line line--tsb" />
            <!-- Zero ref line (for TSB) -->
            <line
              :x1="PAD_L" :x2="CW - PAD_R"
              :y1="yScale(0, pmcDomain.max, pmcDomain.min, PMC_H)"
              :y2="yScale(0, pmcDomain.max, pmcDomain.min, PMC_H)"
              class="zero-line"
            />
            <!-- Dots on current values -->
            <circle
              :cx="bandX(performanceCurve.length - 1)"
              :cy="yScale(performanceCurve.at(-1).ctl, pmcDomain.max, pmcDomain.min, PMC_H)"
              r="3.5"
              class="line-dot line-dot--current"
              style="fill: var(--accent)"
            ><title>CTL: {{ performanceCurve.at(-1).ctl }}</title></circle>
            <circle
              :cx="bandX(performanceCurve.length - 1)"
              :cy="yScale(performanceCurve.at(-1).atl, pmcDomain.max, pmcDomain.min, PMC_H)"
              r="3.5"
              class="line-dot line-dot--current"
              style="fill: #EF4444"
            ><title>ATL: {{ performanceCurve.at(-1).atl }}</title></circle>
            <circle
              :cx="bandX(performanceCurve.length - 1)"
              :cy="yScale(performanceCurve.at(-1).tsb, pmcDomain.max, pmcDomain.min, PMC_H)"
              r="3.5"
              class="line-dot line-dot--current"
              style="fill: var(--purple)"
            ><title>TSB: {{ performanceCurve.at(-1).tsb }}</title></circle>
            <!-- Axes -->
            <text :x="PAD_L - 6" :y="PAD_T + 4" text-anchor="end" class="axis-y">{{ pmcDomain.max }}</text>
            <text :x="PAD_L - 6" :y="PMC_H - PAD_B + 4" text-anchor="end" class="axis-y">{{ pmcDomain.min }}</text>
            <text v-for="(w, i) in weeks" :key="'pmcl' + i" :x="bandX(i)" :y="PMC_H - 4" text-anchor="middle" class="axis-x">{{ w.wk }}</text>
          </svg>
          <!-- Verdict pills -->
          <div class="pmc-verdict">
            <span class="pmc-pill" :class="`pmc-pill--${pmcVerdict.tone}`">
              <span class="material-symbols-rounded icon-fill">{{ pmcVerdict.icon }}</span>
              {{ pmcVerdict.label }}
            </span>
            <span class="pmc-help">{{ pmcVerdict.detail }}</span>
          </div>
        </div>
      </section>

      <div class="chart-row chart-row--two">
        <!-- FTP progression -->
        <section class="chart-card">
          <header class="chart-card__head">
            <div>
              <h3 class="chart-card__title">
                <span class="material-symbols-rounded icon-fill">electric_bolt</span>
                Progressió FTP
              </h3>
              <span class="chart-card__sub">Functional Threshold Power · W</span>
            </div>
            <span class="trend-pill trend-pill--good">
              <span class="material-symbols-rounded">arrow_upward</span>
              +{{ ftpDelta }} W
            </span>
          </header>
          <div class="line-chart">
            <svg :viewBox="`0 0 ${CW} ${CH}`" preserveAspectRatio="none" class="chart-svg">
              <path :d="areaPath(weeks.map(w => w.ftp), ftpDomain.max, ftpDomain.min)" class="line-area line-area--accent" />
              <path :d="linePath(weeks.map(w => w.ftp), ftpDomain.max, ftpDomain.min)" class="line line--ftp" />
              <circle
                v-for="(w, i) in weeks"
                :key="'ftp' + i"
                :cx="bandX(i)"
                :cy="yScale(w.ftp, ftpDomain.max, ftpDomain.min)"
                r="2.8"
                class="line-dot line-dot--ftp"
                :class="{ 'line-dot--current': i === weeks.length - 1 }"
              >
                <title>{{ w.wk }}: {{ w.ftp }} W</title>
              </circle>
              <text :x="PAD_L - 6" :y="PAD_T + 4" text-anchor="end" class="axis-y">{{ ftpDomain.max }}</text>
              <text :x="PAD_L - 6" :y="CH - PAD_B + 4" text-anchor="end" class="axis-y">{{ ftpDomain.min }}</text>
              <text v-for="(w, i) in weeks" :key="'ftpl' + i" :x="bandX(i)" :y="CH - 4" text-anchor="middle" class="axis-x">{{ w.wk }}</text>
            </svg>
          </div>
        </section>

        <!-- VO2max trend -->
        <section class="chart-card">
          <header class="chart-card__head">
            <div>
              <h3 class="chart-card__title">
                <span class="material-symbols-rounded icon-fill">favorite</span>
                VO₂max estimat
              </h3>
              <span class="chart-card__sub">ml/kg/min · franja "Excel·lent" 50–55</span>
            </div>
            <span class="trend-pill trend-pill--good">
              <span class="material-symbols-rounded">arrow_upward</span>
              +{{ vo2Delta }}
            </span>
          </header>
          <div class="line-chart">
            <svg :viewBox="`0 0 ${CW} ${CH}`" preserveAspectRatio="none" class="chart-svg">
              <rect
                :x="PAD_L"
                :y="yScale(55, vo2Domain.max, vo2Domain.min)"
                :width="CW - PAD_L - PAD_R"
                :height="yScale(50, vo2Domain.max, vo2Domain.min) - yScale(55, vo2Domain.max, vo2Domain.min)"
                class="goal-band"
              />
              <path :d="linePath(weeks.map(w => w.vo2), vo2Domain.max, vo2Domain.min)" class="line line--vo2" />
              <circle
                v-for="(w, i) in weeks"
                :key="'vo' + i"
                :cx="bandX(i)"
                :cy="yScale(w.vo2, vo2Domain.max, vo2Domain.min)"
                r="2.8"
                class="line-dot line-dot--vo2"
                :class="{ 'line-dot--current': i === weeks.length - 1 }"
              >
                <title>{{ w.wk }}: {{ w.vo2 }}</title>
              </circle>
              <text :x="PAD_L - 6" :y="PAD_T + 4" text-anchor="end" class="axis-y">{{ vo2Domain.max }}</text>
              <text :x="PAD_L - 6" :y="CH - PAD_B + 4" text-anchor="end" class="axis-y">{{ vo2Domain.min }}</text>
              <text v-for="(w, i) in weeks" :key="'vol' + i" :x="bandX(i)" :y="CH - 4" text-anchor="middle" class="axis-x">{{ w.wk }}</text>
            </svg>
          </div>
        </section>
      </div>

      <!-- Zone time per week (stacked) -->
      <section class="chart-card chart-card--wide">
        <header class="chart-card__head">
          <div>
            <h3 class="chart-card__title">
              <span class="material-symbols-rounded icon-fill">monitor_heart</span>
              Distribució per zones FC
            </h3>
            <span class="chart-card__sub">Minuts per setmana · Z1 recuperació → Z5 VO₂max</span>
          </div>
          <div class="chart-legend chart-legend--zones">
            <span class="chart-legend__item"><span class="dot" style="background: #94A3B8"></span>Z1</span>
            <span class="chart-legend__item"><span class="dot" style="background: #10B981"></span>Z2</span>
            <span class="chart-legend__item"><span class="dot" style="background: #F59E0B"></span>Z3</span>
            <span class="chart-legend__item"><span class="dot" style="background: #F97316"></span>Z4</span>
            <span class="chart-legend__item"><span class="dot" style="background: #EF4444"></span>Z5</span>
          </div>
        </header>
        <div class="zone-bars">
          <div v-for="(zw, i) in zoneHistory" :key="'zw' + i" class="zone-bar">
            <div class="zone-bar__col">
              <div class="zone-bar__seg zone-bar__seg--z5" :style="{ flexGrow: zw.z5 }" :title="`Z5 ${zw.z5} min`"></div>
              <div class="zone-bar__seg zone-bar__seg--z4" :style="{ flexGrow: zw.z4 }" :title="`Z4 ${zw.z4} min`"></div>
              <div class="zone-bar__seg zone-bar__seg--z3" :style="{ flexGrow: zw.z3 }" :title="`Z3 ${zw.z3} min`"></div>
              <div class="zone-bar__seg zone-bar__seg--z2" :style="{ flexGrow: zw.z2 }" :title="`Z2 ${zw.z2} min`"></div>
              <div class="zone-bar__seg zone-bar__seg--z1" :style="{ flexGrow: zw.z1 }" :title="`Z1 ${zw.z1} min`"></div>
            </div>
            <span class="zone-bar__label" :class="{ 'zone-bar__label--current': i === zoneHistory.length - 1 }">{{ zw.wk }}</span>
            <span class="zone-bar__total">{{ zw.total }}min</span>
          </div>
        </div>
      </section>

      <!-- Macro adherence -->
      <section class="chart-card chart-card--wide">
        <header class="chart-card__head">
          <div>
            <h3 class="chart-card__title">
              <span class="material-symbols-rounded icon-fill">analytics</span>
              Adherència de macronutrients
            </h3>
            <span class="chart-card__sub">% setmanes que assoleixen l'objectiu de cada macro</span>
          </div>
          <div class="chart-legend">
            <span class="chart-legend__item"><span class="dot" style="background: #4F46E5"></span>HC</span>
            <span class="chart-legend__item"><span class="dot" style="background: #059669"></span>Prot</span>
            <span class="chart-legend__item"><span class="dot" style="background: #D97706"></span>Greix</span>
          </div>
        </header>
        <div class="macro-grid">
          <div v-for="(mw, i) in macroHistory" :key="'mw' + i" class="macro-week">
            <div class="macro-week__bars">
              <div class="macro-week__bar">
                <div class="macro-week__fill macro-week__fill--carbs" :style="{ height: mw.carbs + '%' }" :title="`HC ${mw.carbs}%`"></div>
              </div>
              <div class="macro-week__bar">
                <div class="macro-week__fill macro-week__fill--protein" :style="{ height: mw.protein + '%' }" :title="`Prot ${mw.protein}%`"></div>
              </div>
              <div class="macro-week__bar">
                <div class="macro-week__fill macro-week__fill--fat" :style="{ height: mw.fat + '%' }" :title="`Greix ${mw.fat}%`"></div>
              </div>
            </div>
            <span class="macro-week__label" :class="{ 'macro-week__label--current': i === macroHistory.length - 1 }">{{ mw.wk }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import { useUIStore } from '@/stores/uiStore'
import { useWeekStore } from '@/stores/weekStore'

const uiStore = useUIStore()
const weekStore = useWeekStore()

// View switcher (only visible when advancedMetrics is enabled)
const viewMode = ref('simple')
watch(() => uiStore.advancedMetrics, (v) => { if (!v) viewMode.value = 'simple' })

// ═══════════════════════════════════════════════════════════════════
// SIMULATED PAST — 11 weeks of weekly aggregates for Pau Martínez
// (current week is appended live from weekStore)
// ═══════════════════════════════════════════════════════════════════
const PAST = [
  { wk: 'S-11', sessions: 3, hours: 2.8, kcal: 2100, weight: 78.6, adh: 65, tss: 210, ftp: 200, vo2: 50.8 },
  { wk: 'S-10', sessions: 4, hours: 3.8, kcal: 2850, weight: 78.4, adh: 70, tss: 305, ftp: 202, vo2: 51.0 },
  { wk: 'S-9',  sessions: 4, hours: 4.0, kcal: 2950, weight: 78.3, adh: 72, tss: 320, ftp: 204, vo2: 51.2 },
  { wk: 'S-8',  sessions: 5, hours: 5.2, kcal: 3700, weight: 78.1, adh: 75, tss: 410, ftp: 207, vo2: 51.5 },
  { wk: 'S-7',  sessions: 5, hours: 5.5, kcal: 3900, weight: 78.0, adh: 78, tss: 450, ftp: 210, vo2: 51.8 },
  { wk: 'S-6',  sessions: 4, hours: 4.0, kcal: 2900, weight: 78.2, adh: 68, tss: 320, ftp: 210, vo2: 52.0 },
  { wk: 'S-5',  sessions: 6, hours: 6.5, kcal: 4400, weight: 77.8, adh: 82, tss: 510, ftp: 213, vo2: 52.2 },
  { wk: 'S-4',  sessions: 5, hours: 5.2, kcal: 3650, weight: 77.6, adh: 80, tss: 425, ftp: 215, vo2: 52.4 },
  { wk: 'S-3',  sessions: 5, hours: 5.5, kcal: 3800, weight: 77.7, adh: 85, tss: 445, ftp: 218, vo2: 52.6 },
  { wk: 'S-2',  sessions: 6, hours: 6.8, kcal: 4500, weight: 77.5, adh: 88, tss: 525, ftp: 220, vo2: 52.8 },
  { wk: 'S-1',  sessions: 5, hours: 5.5, kcal: 3700, weight: 77.8, adh: 82, tss: 440, ftp: 220, vo2: 53.0 },
]

// Live current-week aggregates from weekStore
const INTENSITY_FACTOR = { Baixa: 0.65, Moderada: 0.80, Alta: 0.95 }
const currentWeek = computed(() => {
  const ws = weekStore.currentWeekSessions
  const totals = weekStore.getWeekTotals()
  const minutes = ws.reduce((s, sess) => s + sess.duration, 0)
  const hours = +(minutes / 60).toFixed(1)
  const tss = Math.round(ws.reduce((s, sess) => {
    const i = INTENSITY_FACTOR[sess.intensity] ?? 0.75
    return s + (sess.duration / 60) * i * i * 100
  }, 0))
  const adh = Math.round((weekStore.meals.filter(m => m.status === 'ok').length / 7) * 100)
  return {
    wk: 'Ara',
    sessions: totals.totalSessions,
    hours,
    kcal: totals.totalKcalBurned,
    weight: 78.0,   // simulated current weight
    adh,
    tss,
    ftp: 220,
    vo2: 53.0,
  }
})

const weeks = computed(() => [...PAST, currentWeek.value])

// ═══ Chart geometry ═══════════════════════════════════════════════
const CW = 600
const CH = 200
const PMC_H = 240
const PAD_L = 26
const PAD_R = 12
const PAD_T = 14
const PAD_B = 22
const BAR_W = 22

const bandX = (i) => {
  const usable = CW - PAD_L - PAD_R
  const n = Math.max(1, weeks.value.length)
  return PAD_L + (usable / (n - 1)) * i
}

const yScale = (v, max, min = 0, h = CH) => {
  const range = max - min || 1
  const usable = h - PAD_T - PAD_B
  return PAD_T + usable - ((v - min) / range) * usable
}

const linePath = (values, max, min = 0, h = CH) => {
  if (!values.length) return ''
  return values.map((v, i) => {
    return (i === 0 ? 'M' : 'L') + bandX(i).toFixed(1) + ',' + yScale(v, max, min, h).toFixed(1)
  }).join(' ')
}

const areaPath = (values, max, min = 0, h = CH) => {
  if (!values.length) return ''
  const top = values.map((v, i) => {
    return (i === 0 ? 'M' : 'L') + bandX(i).toFixed(1) + ',' + yScale(v, max, min, h).toFixed(1)
  }).join(' ')
  const last = bandX(values.length - 1).toFixed(1)
  const first = bandX(0).toFixed(1)
  const baseY = (h - PAD_B).toFixed(1)
  return `${top} L ${last},${baseY} L ${first},${baseY} Z`
}

const hoursMax = computed(() => Math.ceil(Math.max(...weeks.value.map(w => w.hours), 7)))
const sessionsMax = computed(() => Math.max(...weeks.value.map(w => w.sessions), 7))

const weightYDomain = { max: 79, min: 76 }
const ftpDomain = { max: 230, min: 195 }
const vo2Domain = { max: 54, min: 50 }

// ═══ Simple-view KPIs (last 4 weeks vs prev 4) ═════════════════════
function avg(arr, key) { return arr.reduce((s, x) => s + x[key], 0) / arr.length }

const simpleKpis = computed(() => {
  const ws = weeks.value
  const last4 = ws.slice(-4)
  const prev4 = ws.slice(-8, -4)
  const sLast = avg(last4, 'sessions'),  sPrev = avg(prev4, 'sessions')
  const hLast = avg(last4, 'hours'),     hPrev = avg(prev4, 'hours')
  const kLast = avg(last4, 'kcal'),      kPrev = avg(prev4, 'kcal')
  const aLast = avg(last4, 'adh'),       aPrev = avg(prev4, 'adh')

  return [
    { icon: 'fitness_center',     label: 'Sessions/setmana',    value: sLast.toFixed(1), unit: '',     delta: sLast - sPrev, deltaPrecision: 1, tone: 'good' },
    { icon: 'schedule',           label: 'Volum mitjà',         value: hLast.toFixed(1), unit: 'h',    delta: hLast - hPrev, deltaPrecision: 1, tone: 'accent' },
    { icon: 'local_fire_department', label: 'Kcal/setmana',     value: Math.round(kLast).toLocaleString('ca-ES'), unit: 'kcal', delta: kLast - kPrev, deltaPrecision: 0, tone: 'warm' },
    { icon: 'restaurant',         label: 'Adherència',          value: Math.round(aLast),  unit: '%',  delta: aLast - aPrev, deltaPrecision: 0, tone: 'good' },
  ]
})

function deltaClass(d) {
  if (d > 0.05) return 'kpi__delta--up'
  if (d < -0.05) return 'kpi__delta--down'
  return 'kpi__delta--flat'
}
function deltaText(d, unit, p = 1) {
  if (Math.abs(d) < 0.05) return '–'
  const sign = d > 0 ? '+' : '−'
  const v = Math.abs(d)
  const formatted = p === 0 ? Math.round(v).toLocaleString('ca-ES') : v.toFixed(p)
  return `${sign}${formatted}${unit ? ' ' + unit : ''}`
}

// ═══ Weight trend ═══════════════════════════════════════════════════
const weightTrend = computed(() => {
  const ws = weeks.value
  const start = ws[0].weight
  const end = ws.at(-1).weight
  const diff = +(end - start).toFixed(1)
  if (diff < -0.2) return { tone: 'good', icon: 'arrow_downward', delta: diff }
  if (diff > 0.2)  return { tone: 'warn', icon: 'arrow_upward',   delta: '+' + diff }
  return { tone: 'flat', icon: 'remove', delta: diff }
})

// ═══ Adherence helpers ══════════════════════════════════════════════
function adhTone(v) {
  if (v >= 80) return 'good'
  if (v >= 60) return 'mid'
  return 'low'
}
const adhAvgRecent = computed(() => Math.round(avg(weeks.value.slice(-4), 'adh')))

// ═══ Sport breakdown (last 4 weeks, simulated) ═════════════════════
const sportBreakdown = (() => {
  const raw = [
    { type: 'Ciclisme', icon: 'directions_bike', color: '#3B82F6', minutes: 720 },
    { type: 'Natació',  icon: 'pool',            color: '#06B6D4', minutes: 240 },
    { type: 'Força',    icon: 'fitness_center',  color: '#F59E0B', minutes: 220 },
    { type: 'Curses',   icon: 'directions_run',  color: '#10B981', minutes: 180 },
  ]
  const total = raw.reduce((s, x) => s + x.minutes, 0)
  return raw.map(s => ({ ...s, pct: Math.round(s.minutes / total * 100) }))
})()
const sportTotalLabel = computed(() => {
  const total = sportBreakdown.reduce((s, x) => s + x.minutes, 0)
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h}h ${m}min` : `${h}h`
})
const donutGradient = (() => {
  let acc = 0
  const stops = []
  sportBreakdown.forEach(s => {
    const start = acc
    acc += s.pct
    stops.push(`${s.color} ${start}% ${acc}%`)
  })
  return `conic-gradient(${stops.join(', ')})`
})()

function formatMinutes(m) {
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h}h ${r}min` : `${h}h`
}

// ═══ Milestones ═════════════════════════════════════════════════════
const milestones = [
  { id: 1, icon: 'emoji_events',    title: 'Ruta més llarga',     date: '13 abr', value: '87 km',     tone: 'good' },
  { id: 2, icon: 'electric_bolt',   title: 'PR FTP',              date: '8 abr',  value: '220 W',     tone: 'accent' },
  { id: 3, icon: 'fitness_center',  title: 'PR Squat',            date: '5 abr',  value: '100 kg',    tone: 'warm' },
  { id: 4, icon: 'pool',            title: 'Natació consecutiva', date: '1 abr',  value: '21 dies',   tone: 'cool' },
  { id: 5, icon: 'timer',           title: 'Millor 10k',          date: '24 mar', value: '48:23',     tone: 'good' },
  { id: 6, icon: 'monitor_heart',   title: 'FC repòs mínima',     date: '17 mar', value: '52 bpm',    tone: 'accent' },
]

// ═══════════════════════════════════════════════════════════════════
// ADVANCED VIEW
// ═══════════════════════════════════════════════════════════════════

// PMC: CTL = 42-day EMA, ATL = 7-day EMA. Weekly granularity → α values:
//   α_CTL = 1 - exp(-7/42) ≈ 0.154
//   α_ATL = 1 - exp(-7/7)  ≈ 0.632
const performanceCurve = computed(() => {
  const aCtl = 0.154
  const aAtl = 0.632
  let ctl = 30, atl = 30
  return weeks.value.map((w) => {
    ctl = ctl + aCtl * (w.tss - ctl)
    atl = atl + aAtl * (w.tss - atl)
    return { wk: w.wk, ctl: Math.round(ctl), atl: Math.round(atl), tsb: Math.round(ctl - atl) }
  })
})
const pmcDomain = computed(() => {
  const all = performanceCurve.value.flatMap(p => [p.ctl, p.atl, p.tsb])
  return { max: Math.ceil(Math.max(...all) / 10) * 10, min: Math.floor(Math.min(...all, 0) / 10) * 10 }
})
const pmcTsbArea = computed(() => {
  // Area between TSB line and zero, drawn as a polygon (positive=above, fills downward).
  const pts = performanceCurve.value.map((p, i) => ({ x: bandX(i), y: yScale(p.tsb, pmcDomain.value.max, pmcDomain.value.min, PMC_H) }))
  if (!pts.length) return ''
  const zeroY = yScale(0, pmcDomain.value.max, pmcDomain.value.min, PMC_H).toFixed(1)
  const top = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ')
  const last = pts.at(-1).x.toFixed(1)
  const first = pts[0].x.toFixed(1)
  return `${top} L ${last},${zeroY} L ${first},${zeroY} Z`
})

const pmcVerdict = computed(() => {
  const last = performanceCurve.value.at(-1)
  if (!last) return { tone: 'flat', icon: 'help', label: 'Sense dades', detail: '' }
  const { tsb, ctl } = last
  if (tsb < -20) return { tone: 'risk', icon: 'warning',           label: 'Risc — fatiga acumulada',  detail: `TSB ${tsb}, CTL ${ctl}. Reduir càrrega aquesta setmana.` }
  if (tsb < -10) return { tone: 'warn', icon: 'priority_high',     label: 'Càrrega productiva',       detail: `TSB ${tsb}. Bona zona d'adaptació; controlar volum.` }
  if (tsb > 15)  return { tone: 'low',  icon: 'sentiment_neutral', label: 'Massa fresc',              detail: `TSB ${tsb}. Pots augmentar volum o intensitat.` }
  return                 { tone: 'good', icon: 'check_circle',       label: 'Frescor ideal',            detail: `TSB ${tsb}, CTL ${ctl}. Forma equilibrada per competir.` }
})

const ftpDelta = computed(() => weeks.value.at(-1).ftp - weeks.value[0].ftp)
const vo2Delta = computed(() => +(weeks.value.at(-1).vo2 - weeks.value[0].vo2).toFixed(1))

const advKpis = computed(() => {
  const last = performanceCurve.value.at(-1)
  const w = weeks.value.at(-1)
  return [
    { icon: 'monitoring',     label: 'CTL (forma)',    value: last.ctl, unit: '',  hint: 'Volum crònic 42d', tone: 'accent' },
    { icon: 'bolt',           label: 'ATL (fatiga)',   value: last.atl, unit: '',  hint: 'Càrrega aguda 7d', tone: 'warm' },
    { icon: 'sentiment_satisfied', label: 'TSB (frescor)', value: last.tsb >= 0 ? `+${last.tsb}` : last.tsb, unit: '', hint: 'CTL − ATL',       tone: last.tsb >= 0 ? 'good' : 'warn' },
    { icon: 'electric_bolt',  label: 'FTP actual',     value: w.ftp,    unit: 'W', hint: `+${ftpDelta.value} W vs. S-11`, tone: 'good' },
    { icon: 'favorite',       label: 'VO₂max',         value: w.vo2,    unit: '',  hint: `+${vo2Delta.value} en 12 set.`, tone: 'cool' },
  ]
})

// Zone time per week — distribution scaled by intensity profile of the week.
const zoneHistory = computed(() => weeks.value.map((w) => {
  const total = Math.round(w.hours * 60)
  // Higher TSS → more time in higher zones
  const intensity = Math.min(1, w.tss / 600)
  const z5 = Math.round(total * (0.02 + intensity * 0.06))
  const z4 = Math.round(total * (0.05 + intensity * 0.10))
  const z3 = Math.round(total * (0.12 + intensity * 0.10))
  const z2 = Math.round(total * (0.40 - intensity * 0.05))
  const z1 = Math.max(0, total - z2 - z3 - z4 - z5)
  return { wk: w.wk, z1, z2, z3, z4, z5, total }
}))

// Macro adherence (carbs / protein / fat % of weekly target hit)
const macroHistory = computed(() => weeks.value.map((w) => {
  const base = w.adh
  return {
    wk: w.wk,
    carbs: Math.min(100, Math.max(40, Math.round(base + 6))),
    protein: Math.min(100, Math.max(40, Math.round(base - 2))),
    fat: Math.min(100, Math.max(40, Math.round(base - 8))),
  }
}))
</script>

<style scoped>
.progress-view { display: flex; flex-direction: column; min-height: 100vh; }
.progress-content { padding: 18px 24px 32px; display: flex; flex-direction: column; gap: 18px; }

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
.view-switch__indicator {
  position: absolute; z-index: 0;
  top: 4px; bottom: 4px; left: 4px;
  width: calc(50% - 4px);
  background: var(--accent);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.view-switch__indicator--advanced { transform: translateX(100%); }
.view-switch__badge {
  font-size: 9px; font-weight: 800; letter-spacing: 0.5px;
  padding: 2px 6px; border-radius: 99px;
  background: var(--navy);
  color: var(--accent);
  text-transform: uppercase;
  margin-left: 2px;
}
.view-switch__btn--active .view-switch__badge { background: var(--navy); color: var(--accent); }

/* ═══ KPI strip ═══════════════════════════════════════════════════ */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.kpi-strip--adv { grid-template-columns: repeat(5, 1fr); }
.kpi {
  display: flex; align-items: flex-start; gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
  animation: fadeInUp 0.4s var(--ease) both;
}
.kpi__icon {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.kpi__icon .material-symbols-rounded { font-size: 20px; }
.kpi__icon--good   { background: var(--accent-light); color: var(--accent-dark); }
.kpi__icon--accent { background: rgba(99, 102, 241, 0.12); color: #4F46E5; }
.kpi__icon--warm   { background: rgba(239, 68, 68, 0.12); color: #DC2626; }
.kpi__icon--cool   { background: rgba(6, 182, 212, 0.12); color: #0891B2; }
.kpi__icon--warn   { background: rgba(245, 158, 11, 0.14); color: #B45309; }
.kpi__body { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
.kpi__label {
  font-size: 10px; font-weight: 700; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.kpi__value {
  font-family: var(--font-display); font-size: 22px; font-weight: 800;
  color: var(--text); line-height: 1.05;
}
.kpi__value small { font-size: 12px; color: var(--text-3); font-weight: 500; margin-left: 2px; }
.kpi__delta, .kpi__hint {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 11px; color: var(--text-3); font-weight: 600; margin-top: 1px;
}
.kpi__delta .material-symbols-rounded { font-size: 12px; }
.kpi__delta--up   { color: var(--accent-dark); }
.kpi__delta--down { color: #DC2626; }
.kpi__delta--flat { color: var(--text-3); }

/* ═══ Chart card ══════════════════════════════════════════════════ */
.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.chart-card__head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.chart-card__title {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text);
}
.chart-card__title .material-symbols-rounded { font-size: 18px; color: var(--accent); }
.chart-card__sub { font-size: 11px; color: var(--text-3); margin-top: 3px; display: block; }

.chart-row { display: grid; gap: 18px; }
.chart-row--two { grid-template-columns: 1fr 1fr; }
@media (max-width: 1100px) {
  .chart-row--two { grid-template-columns: 1fr; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .kpi-strip--adv { grid-template-columns: repeat(2, 1fr); }
}

/* ═══ Chart legend ════════════════════════════════════════════════ */
.chart-legend {
  display: flex; gap: 12px; flex-wrap: wrap;
  font-size: 11px; color: var(--text-2); font-weight: 600;
}
.chart-legend--zones { gap: 8px; }
.chart-legend__item { display: inline-flex; align-items: center; gap: 5px; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot--bar  { background: var(--accent); }
.dot--line { background: var(--purple); border: 2px solid var(--purple-light-strong); }

/* ═══ Trend pill ══════════════════════════════════════════════════ */
.trend-pill {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 99px;
  white-space: nowrap;
}
.trend-pill .material-symbols-rounded { font-size: 13px; }
.trend-pill--good { background: var(--accent-light); color: var(--accent-dark); }
.trend-pill--warn { background: var(--warning-light); color: var(--warning); }
.trend-pill--flat { background: var(--surface-3); color: var(--text-3); }

/* ═══ SVG charts (shared) ═════════════════════════════════════════ */
.chart-svg { width: 100%; display: block; height: auto; }
.combo-chart, .line-chart, .pmc-chart { background: linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%); border-radius: var(--radius-lg); padding: 12px; }
.combo-chart svg, .line-chart svg { height: 200px; }
.pmc-chart svg { height: 240px; }

.grid line { stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 4; }
.zero-line { stroke: var(--text-3); stroke-width: 1; stroke-dasharray: 4 4; opacity: 0.6; }
.axis-x text, .axis-y text, text.axis-x, text.axis-y { font-size: 9px; fill: var(--text-3); font-weight: 600; }

.bars rect { fill: color-mix(in srgb, var(--accent) 60%, transparent); transition: fill var(--dur-fast); }
.bars rect.bar--current { fill: var(--accent); }
.bars rect:hover { fill: var(--accent-dark); }

.line { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.line--sessions { stroke: var(--purple); stroke-dasharray: 0; }
.line--weight   { stroke: var(--accent-dark); }
.line--ftp      { stroke: var(--accent-dark); }
.line--vo2      { stroke: #0891B2; }
.line--ctl      { stroke: var(--accent); stroke-width: 2.5; }
.line--atl      { stroke: #EF4444; stroke-width: 2.5; }
.line--tsb      { stroke: var(--purple); stroke-width: 2; stroke-dasharray: 4 3; }

.line-area      { fill: var(--accent-light); }
.line-area--accent { fill: var(--accent-light); }
.line-area--purple { fill: rgba(99, 102, 241, 0.10); }

.line-dot { stroke: var(--surface); stroke-width: 1.5; }
.line-dot--sessions { fill: var(--purple); }
.line-dot--weight   { fill: var(--accent-dark); }
.line-dot--ftp      { fill: var(--accent-dark); }
.line-dot--vo2      { fill: #0891B2; }
.line-dot--current  { stroke-width: 2.2; r: 4; }

.goal-band { fill: color-mix(in srgb, var(--accent) 8%, transparent); }
.goal-line { stroke: var(--accent); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.55; }

/* ═══ Adherència nutrition bars ═══════════════════════════════════ */
.adh-bars { display: flex; align-items: flex-end; gap: 4px; height: 200px; padding: 8px 4px 0; }
.adh-bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
.adh-bar__col { flex: 1; width: 100%; display: flex; align-items: flex-end; padding: 0 2px; }
.adh-bar__fill {
  width: 100%; min-height: 3px;
  border-radius: var(--radius-xs) var(--radius-xs) 0 0;
  transition: height 0.6s var(--ease);
  display: flex; justify-content: center; align-items: flex-start;
  padding-top: 3px;
}
.adh-bar__fill--good { background: linear-gradient(180deg, var(--accent), var(--accent-dark)); }
.adh-bar__fill--mid  { background: linear-gradient(180deg, #F59E0B, #D97706); }
.adh-bar__fill--low  { background: linear-gradient(180deg, #EF4444, #DC2626); }
.adh-bar__val { font-size: 9px; font-weight: 700; color: white; }
.adh-bar__label { font-size: 9px; color: var(--text-3); font-weight: 600; }
.adh-bar--current .adh-bar__label { color: var(--accent-dark); font-weight: 800; }

/* ═══ Donut + sport legend ════════════════════════════════════════ */
.donut-row { display: grid; grid-template-columns: 130px 1fr; gap: 18px; align-items: center; }
.donut {
  width: 130px; height: 130px;
  border-radius: 50%;
  background: var(--gradient);
  display: flex; align-items: center; justify-content: center;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.donut::after {
  content: '';
  position: absolute;
  width: 80px; height: 80px;
  background: var(--surface);
  border-radius: 50%;
}
.donut__center { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
.donut__num { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text); line-height: 1; }
.donut__label { font-size: 10px; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }

.sport-legend { display: flex; flex-direction: column; gap: 8px; }
.sport-legend__row {
  display: grid;
  grid-template-columns: 8px 22px 1fr auto auto;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
}
.sport-legend__dot { width: 8px; height: 8px; border-radius: 50%; }
.sport-legend__icon {
  width: 22px; height: 22px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  display: flex; align-items: center; justify-content: center;
}
.sport-legend__icon .material-symbols-rounded { font-size: 14px; color: var(--text-2); }
.sport-legend__label { font-weight: 600; color: var(--text); }
.sport-legend__pct { font-weight: 800; color: var(--text); font-family: var(--font-display); }
.sport-legend__min { font-size: 11px; color: var(--text-3); }

/* ═══ Milestones ══════════════════════════════════════════════════ */
.milestones-list { display: flex; flex-direction: column; gap: 8px; }
.milestone {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  animation: fadeInUp 0.4s var(--ease) both;
  transition: border-color var(--dur-fast);
}
.milestone:hover { border-color: var(--border-2); }
.milestone__icon {
  width: 34px; height: 34px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.milestone__icon .material-symbols-rounded { font-size: 18px; }
.milestone__icon--good   { background: var(--accent-light); color: var(--accent-dark); }
.milestone__icon--accent { background: rgba(99, 102, 241, 0.12); color: #4F46E5; }
.milestone__icon--warm   { background: rgba(239, 68, 68, 0.12); color: #DC2626; }
.milestone__icon--cool   { background: rgba(6, 182, 212, 0.12); color: #0891B2; }
.milestone__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.milestone__title { font-size: 13px; font-weight: 600; color: var(--text); }
.milestone__date { font-size: 11px; color: var(--text-3); }
.milestone__value {
  font-family: var(--font-display); font-size: 15px; font-weight: 800;
  color: var(--text); white-space: nowrap;
}

/* ═══ PMC verdict pill ════════════════════════════════════════════ */
.pmc-verdict { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pmc-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 99px;
  font-size: 12px; font-weight: 700;
}
.pmc-pill .material-symbols-rounded { font-size: 14px; }
.pmc-pill--good { background: var(--accent-light); color: var(--accent-dark); }
.pmc-pill--warn { background: var(--warning-light); color: var(--warning); }
.pmc-pill--risk { background: var(--danger-soft-bg); color: var(--danger-soft-text); }
.pmc-pill--low  { background: var(--surface-3); color: var(--text-2); }
.pmc-help { font-size: 11px; color: var(--text-3); }

/* ═══ Zone bars (advanced) ════════════════════════════════════════ */
.zone-bars { display: flex; align-items: flex-end; gap: 6px; height: 220px; padding-top: 8px; }
.zone-bar {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  height: 100%;
}
.zone-bar__col {
  flex: 1; width: 100%;
  display: flex; flex-direction: column;
  border-radius: var(--radius-xs);
  overflow: hidden;
  background: var(--surface-3);
  min-height: 0;
}
.zone-bar__seg { transition: flex-grow 0.6s var(--ease); }
.zone-bar__seg--z1 { background: #94A3B8; }
.zone-bar__seg--z2 { background: #10B981; }
.zone-bar__seg--z3 { background: #F59E0B; }
.zone-bar__seg--z4 { background: #F97316; }
.zone-bar__seg--z5 { background: #EF4444; }
.zone-bar__label { font-size: 10px; color: var(--text-3); font-weight: 600; }
.zone-bar__label--current { color: var(--accent-dark); font-weight: 800; }
.zone-bar__total { font-size: 9px; color: var(--text-3); }

/* ═══ Macro adherence grid ════════════════════════════════════════ */
.macro-grid { display: flex; align-items: flex-end; gap: 10px; padding-top: 8px; min-height: 180px; }
.macro-week {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.macro-week__bars {
  display: flex; align-items: flex-end; gap: 2px;
  width: 100%; height: 150px;
}
.macro-week__bar {
  flex: 1; height: 100%;
  background: var(--surface-3);
  border-radius: var(--radius-xs) var(--radius-xs) 0 0;
  display: flex; align-items: flex-end;
  overflow: hidden;
}
.macro-week__fill {
  width: 100%;
  border-radius: var(--radius-xs) var(--radius-xs) 0 0;
  transition: height 0.6s var(--ease);
  min-height: 2px;
}
.macro-week__fill--carbs   { background: linear-gradient(180deg, #6366F1, #4F46E5); }
.macro-week__fill--protein { background: linear-gradient(180deg, #10B981, #059669); }
.macro-week__fill--fat     { background: linear-gradient(180deg, #F59E0B, #D97706); }
.macro-week__label { font-size: 10px; color: var(--text-3); font-weight: 600; }
.macro-week__label--current { color: var(--accent-dark); font-weight: 800; }

/* ═══ Animations ══════════════════════════════════════════════════ */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

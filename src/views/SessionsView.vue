<template>
  <div class="sessions-view">
    <AppTopBar
      title="Sessions"
      subtitle="Gestiona, planifica i analitza els teus entrenaments"
      :show-week-nav="true"
      :week-label="weekStore.currentWeekLabel"
      :is-current-week="weekStore.weekOffset === 0"
      @prev-week="weekStore.prevWeek()"
      @next-week="weekStore.nextWeek()"
      @today="weekStore.goToCurrentWeek()"
    />

    <!-- View switcher (only when advanced metrics are enabled in Profile) -->
    <div v-if="uiStore.advancedMetrics" class="view-switch" role="tablist">
      <button
        class="view-switch__btn"
        :class="{ 'view-switch__btn--active': viewMode === 'calendar' }"
        @click="viewMode = 'calendar'"
        role="tab"
        :aria-selected="viewMode === 'calendar'"
      >
        <span class="material-symbols-rounded">calendar_view_week</span>
        Calendari de sessions
      </button>
      <button
        class="view-switch__btn"
        :class="{ 'view-switch__btn--active': viewMode === 'advanced' }"
        @click="viewMode = 'advanced'"
        role="tab"
        :aria-selected="viewMode === 'advanced'"
      >
        <span class="material-symbols-rounded">science</span>
        Mètriques avançades
        <span class="view-switch__badge">PRO</span>
      </button>
      <span class="view-switch__indicator" :class="`view-switch__indicator--${viewMode}`"></span>
    </div>

    <div v-show="viewMode === 'calendar'" class="sessions-content">
      <!-- ─── LEFT: Day list ─────────────────────────────── -->
      <div id="sessions-list" class="sessions-left" tabindex="-1">
        <!-- Add session form -->
        <div class="add-card" :class="{ 'add-card--open': addOpen }">
          <button v-if="!addOpen" class="add-card__cta" @click="openAdd()">
            <span class="material-symbols-rounded">add_circle</span>
            <span>Nova sessió</span>
            <span class="add-card__hint">Crea una sessió per a qualsevol dia</span>
          </button>

          <form v-else class="add-form" @submit.prevent="submitAdd">
            <div class="add-form__head">
              <span class="material-symbols-rounded add-form__icon">add_circle</span>
              <strong>Afegir sessió</strong>
              <button type="button" class="add-form__close" @click="addOpen = false" aria-label="Tancar">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>
            <div class="add-form__grid">
              <label class="field">
                <span class="field__label">Dia</span>
                <select v-model.number="form.day" class="field__input">
                  <option v-for="(d, i) in weekStore.daysFull" :key="i" :value="i">{{ d }}</option>
                </select>
              </label>
              <label class="field">
                <span class="field__label">Tipus</span>
                <select v-model="form.type" class="field__input">
                  <option v-for="(t, key) in weekStore.sessionTypes" :key="key" :value="key">{{ t.label }}</option>
                </select>
              </label>
              <label class="field">
                <span class="field__label">Intensitat</span>
                <select v-model="form.intensity" class="field__input">
                  <option value="Baixa">Baixa</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Alta">Alta</option>
                </select>
              </label>
              <label class="field">
                <span class="field__label">Durada (min)</span>
                <input v-model.number="form.duration" type="number" min="15" max="240" step="15" class="field__input" />
              </label>
              <label class="field">
                <span class="field__label">Hora d'inici</span>
                <input v-model.number="form.startTime" type="number" min="0" max="23" step="1" class="field__input" />
              </label>
              <div class="add-form__preview">
                <span class="material-symbols-rounded">local_fire_department</span>
                <strong>~{{ previewKcal }}</strong> kcal estimades
              </div>
            </div>
            <div class="add-form__actions">
              <button type="button" class="btn btn--ghost" @click="addOpen = false">Cancel·la</button>
              <button type="submit" class="btn btn--primary">
                <span class="material-symbols-rounded">add</span>
                Afegir
              </button>
            </div>
          </form>
        </div>

        <div class="section-header">
          <h2 class="section-title">{{ weekStore.currentWeekLabel }}</h2>
          <span class="section-count">{{ weekStore.currentWeekSessions.length }} sessions · {{ totalHours }}h</span>
        </div>

        <div class="day-list">
          <div
            v-for="(day, i) in weekStore.daysFull"
            :key="i"
            class="day-group"
            :class="{
              'day-group--today': i === todayIndex && weekStore.weekOffset === 0,
              'day-group--past': weekStore.isDayPast(i)
            }"
          >
            <div class="day-group__header">
              <div class="day-badge" :class="{ 'day-badge--today': i === todayIndex && weekStore.weekOffset === 0 }">
                <span class="day-badge__abbr">{{ weekStore.days[i] }}</span>
                <span class="day-badge__num">{{ getDayNum(i) }}</span>
              </div>
              <div class="day-group__meta">
                <span class="day-group__name">{{ day }}</span>
                <span class="day-group__total" v-if="weekStore.sessionsByDay[i]?.length > 0">
                  {{ daySummary(i) }}
                </span>
                <span class="day-group__total day-group__total--rest" v-else>Descans</span>
              </div>
              <button
                class="day-group__add"
                @click="openAdd(i)"
                :aria-label="`Afegir sessió a ${day}`"
                title="Afegir sessió a aquest dia"
              >
                <span class="material-symbols-rounded">add</span>
              </button>
            </div>

            <!-- Sessions list for this day -->
            <div class="day-sessions" v-if="weekStore.sessionsByDay[i]?.length > 0">
              <div
                v-for="session in weekStore.sessionsByDay[i]"
                :key="session.id"
                class="session-row"
                :style="{ '--row-color': getColor(session.type) }"
                @click="uiStore.openEditPanel(session.id)"
                tabindex="0"
                @keydown.enter="uiStore.openEditPanel(session.id)"
                :aria-label="`Editar sessió: ${session.label}`"
              >
                <div class="session-row__color-bar" aria-hidden="true"></div>
                <div class="session-row__icon">
                  <span class="material-symbols-rounded">{{ getIcon(session.type) }}</span>
                </div>
                <div class="session-row__body">
                  <div class="session-row__title-line">
                    <span class="session-row__label">{{ session.label }}</span>
                    <LoadBadge
                      v-if="session.load === 'high' && !weekStore.meals[i]?.aiAdjusted && !weekStore.isDayPast(i)"
                      :level="session.load"
                    />
                  </div>
                  <span class="session-row__meta">
                    {{ formatTimeRange(session.startTime, session.duration) }} ·
                    {{ formatDuration(session.duration) }} ·
                    {{ session.intensity }}
                  </span>
                  <!-- Detail chips: only visible on this view -->
                  <div class="session-row__chips">
                    <span class="chip" :title="`Hora del dia · ${timeOfDayLabel(session.startTime)}`">
                      <span class="material-symbols-rounded">{{ timeOfDayIcon(session.startTime) }}</span>
                      {{ timeOfDayLabel(session.startTime) }}
                    </span>
                    <span class="chip" :title="`Zona FC estimada per intensitat ${session.intensity}`">
                      <span class="material-symbols-rounded">favorite</span>
                      {{ hrZone(session.intensity) }}
                    </span>
                    <span class="chip" :title="`Recuperació recomanada`">
                      <span class="material-symbols-rounded">bedtime</span>
                      {{ recoveryHours(session) }}h
                    </span>
                    <span class="chip" :title="`Hidratació estimada durant la sessió`">
                      <span class="material-symbols-rounded">water_drop</span>
                      {{ hydrationL(session) }} L
                    </span>
                    <span class="chip chip--accent" :title="`Equivalència aproximada`">
                      <span class="material-symbols-rounded">straighten</span>
                      {{ distanceEquivalent(session) }}
                    </span>
                  </div>
                </div>
                <div class="session-row__right">
                  <div class="session-row__kcal">{{ session.kcal }} kcal</div>
                  <div class="session-row__pct">{{ percentOfWeek(session) }}% setm.</div>
                </div>
                <button
                  class="session-row__del"
                  @click.stop="removeSession(session.id)"
                  :aria-label="`Eliminar sessió ${session.label}`"
                >
                  <span class="material-symbols-rounded">delete_outline</span>
                </button>
              </div>
            </div>

            <button v-else class="day-empty" @click="openAdd(i)">
              <span class="material-symbols-rounded">bedtime</span>
              <span>Dia de descans · clica per afegir-hi una sessió</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ─── RIGHT: Analytics + Library (no scroll) ─────── -->
      <aside id="sessions-summary" class="sessions-right" tabindex="-1">
        <!-- Weekly summary -->
        <div class="card stats-card">
          <div class="card__head">
            <h3 class="card__title">Resum setmanal</h3>
            <span class="streak-pill" v-if="trainingDays > 0" :title="`Dies amb almenys una sessió`">
              <span class="material-symbols-rounded icon-fill">local_fire_department</span>
              {{ trainingDays }}/7
            </span>
          </div>
          <div class="stats-row">
            <div class="stat-mini">
              <span class="stat-mini__num">{{ totals.totalSessions }}</span>
              <span class="stat-mini__label">Sessions</span>
              <span class="stat-mini__delta" :class="deltaClass(deltas.sessions)">{{ deltaText(deltas.sessions) }}</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini__num">{{ totalHours }}<span class="stat-mini__unit">h</span></span>
              <span class="stat-mini__label">Volum</span>
              <span class="stat-mini__delta" :class="deltaClass(deltas.hours)">{{ deltaText(deltas.hours, 'h') }}</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini__num">{{ formatK(totals.totalKcalBurned) }}</span>
              <span class="stat-mini__label">Kcal</span>
              <span class="stat-mini__delta" :class="deltaClass(deltas.kcal)">{{ deltaText(deltas.kcal) }}</span>
            </div>
            <div class="stat-mini">
              <span class="stat-mini__num" :class="{ 'stat-mini__num--warn': totals.highLoadDays > 2 }">
                {{ totals.highLoadDays }}
              </span>
              <span class="stat-mini__label">Càrrega alta</span>
              <span class="stat-mini__delta" :class="deltaClass(-deltas.highLoad)">{{ deltaText(deltas.highLoad) }}</span>
            </div>
          </div>
          <div class="meta-row">
            <span><strong>{{ avgDuration }}</strong> min mitjana</span>
            <span class="meta-sep">·</span>
            <span><strong>{{ avgKcal }}</strong> kcal/sessió</span>
            <span class="meta-sep">·</span>
            <span :title="weekStore.daysFull[busiestDay.day] + ': ' + busiestDay.kcal + ' kcal'">
              Pic <strong>{{ weekStore.days[busiestDay.day] }}</strong>
            </span>
          </div>
        </div>

        <!-- Type distribution: enriched with time + kcal per type -->
        <div class="card type-dist">
          <div class="card__head">
            <h3 class="card__title">Distribució per tipus</h3>
            <span class="card__hint">{{ Object.keys(typeBreakdown).length }} tipus</span>
          </div>
          <div v-if="!Object.keys(typeBreakdown).length" class="empty-hint">
            Encara no hi ha sessions aquesta setmana.
          </div>
          <div v-else class="type-dist__list">
            <div
              v-for="(d, type) in typeBreakdown"
              :key="type"
              class="type-row"
              :style="{ '--td-color': weekStore.sessionTypes[type]?.color }"
            >
              <div class="type-row__head">
                <div class="type-row__icon">
                  <span class="material-symbols-rounded">{{ weekStore.sessionTypes[type]?.icon }}</span>
                </div>
                <span class="type-row__label">{{ weekStore.sessionTypes[type]?.label }}</span>
                <span class="type-row__count">×{{ d.count }}</span>
              </div>
              <div class="type-row__bar">
                <div class="type-row__fill" :style="{ width: d.pctTime + '%' }"></div>
              </div>
              <div class="type-row__meta">
                <span>{{ formatMins(d.minutes) }}</span>
                <span class="meta-sep">·</span>
                <span>{{ d.kcal }} kcal</span>
                <span class="meta-sep">·</span>
                <span>{{ d.pctTime }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly rhythm: intensity + time of day (only here) -->
        <div class="card rhythm-card">
          <div class="card__head">
            <h3 class="card__title">Patró setmanal</h3>
          </div>

          <div class="rhythm-block">
            <div class="rhythm-block__title">Intensitat</div>
            <div class="bar-stack" :title="`Baixa ${intensityDist.Baixa}% · Moderada ${intensityDist.Moderada}% · Alta ${intensityDist.Alta}%`">
              <div class="bar-stack__seg bar-stack__seg--low" :style="{ width: intensityDist.Baixa + '%' }">
                <span v-if="intensityDist.Baixa >= 12">{{ intensityDist.Baixa }}%</span>
              </div>
              <div class="bar-stack__seg bar-stack__seg--mid" :style="{ width: intensityDist.Moderada + '%' }">
                <span v-if="intensityDist.Moderada >= 12">{{ intensityDist.Moderada }}%</span>
              </div>
              <div class="bar-stack__seg bar-stack__seg--high" :style="{ width: intensityDist.Alta + '%' }">
                <span v-if="intensityDist.Alta >= 12">{{ intensityDist.Alta }}%</span>
              </div>
            </div>
            <div class="legend">
              <span class="legend__item"><span class="legend__dot legend__dot--low"></span>Baixa</span>
              <span class="legend__item"><span class="legend__dot legend__dot--mid"></span>Moderada</span>
              <span class="legend__item"><span class="legend__dot legend__dot--high"></span>Alta</span>
            </div>
          </div>

          <div class="rhythm-block">
            <div class="rhythm-block__title">Franja horària</div>
            <div class="tod-grid">
              <div
                v-for="bucket in todBuckets"
                :key="bucket.key"
                class="tod-cell"
                :class="{ 'tod-cell--top': bucket.key === topTod }"
                :title="`${bucket.label}: ${bucket.count} sessió${bucket.count !== 1 ? 's' : ''}`"
              >
                <span class="material-symbols-rounded">{{ bucket.icon }}</span>
                <span class="tod-cell__count">{{ bucket.count }}</span>
                <span class="tod-cell__label">{{ bucket.short }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Session library at the bottom -->
        <div id="sessions-library" class="library-wrap">
          <SessionLibrary />
        </div>
      </aside>
    </div>

    <!-- ═══ Advanced metrics view ═══════════════════════ -->
    <div v-show="uiStore.advancedMetrics && viewMode === 'advanced'" class="adv-view">
      <!-- Top KPI row -->
      <div class="adv-kpi-row">
        <!-- TSS -->
        <div class="adv-kpi adv-kpi--wide">
          <div class="adv-kpi__title">
            <span class="adv-kpi__title-text">TSS setmanal<button class="info-btn info-btn--dark" @click.stop="openInfo('tss')" data-tip="Clica per veure més info" aria-label="Informació sobre TSS"><span class="material-symbols-rounded">info</span></button></span>
            <span class="adv-kpi__hint">Training Stress Score</span>
          </div>
          <div class="adv-tss">
            <div class="adv-tss__num">
              <span class="adv-tss__val">{{ tss }}</span>
              <span class="adv-tss__zone" :class="`adv-zone--${tssZone.tone}`">{{ tssZone.label }}</span>
            </div>
            <div class="adv-tss__scale" aria-hidden="true">
              <span class="adv-tss__seg adv-tss__seg--low"></span>
              <span class="adv-tss__seg adv-tss__seg--good"></span>
              <span class="adv-tss__seg adv-tss__seg--warn"></span>
              <span class="adv-tss__seg adv-tss__seg--risk"></span>
              <span class="adv-tss__marker" :style="{ left: Math.min(100, tss / 800 * 100) + '%' }"></span>
            </div>
            <div class="adv-tss__labels">
              <span>0</span><span>200</span><span>500</span><span>700</span><span>800+</span>
            </div>
          </div>
        </div>

        <!-- Polarization -->
        <div class="adv-kpi">
          <div class="adv-kpi__title">
            <span class="adv-kpi__title-text">Polarització<button class="info-btn info-btn--dark" @click.stop="openInfo('polar')" data-tip="Clica per veure més info" aria-label="Informació sobre polarització"><span class="material-symbols-rounded">info</span></button></span>
            <span class="adv-kpi__hint">Regla 80/20</span>
          </div>
          <div class="polar">
            <div class="polar__ring" :style="{ '--easy': polarization.easy + '%' }">
              <span class="polar__num">{{ polarization.easy }}<small>%</small></span>
              <span class="polar__sub">fàcil</span>
            </div>
            <div class="polar__legends">
              <div class="polar__legend"><span class="polar__dot polar__dot--easy"></span>Baixa+Mod · {{ polarization.easy }}%</div>
              <div class="polar__legend"><span class="polar__dot polar__dot--hard"></span>Alta · {{ polarization.hard }}%</div>
              <div class="polar__verdict" :class="polarization.ok ? 'polar__verdict--ok' : 'polar__verdict--off'">
                {{ polarization.ok ? '✓ Rang ideal' : 'Fora 75–85%' }}
              </div>
            </div>
          </div>
        </div>

        <!-- AC:W ratio -->
        <div class="adv-kpi">
          <div class="adv-kpi__title">
            <span class="adv-kpi__title-text">Càrrega AC:W<button class="info-btn info-btn--dark" @click.stop="openInfo('acw')" data-tip="Clica per veure més info" aria-label="Informació sobre AC:W"><span class="material-symbols-rounded">info</span></button></span>
            <span class="adv-kpi__hint">Aguda / crònica</span>
          </div>
          <div class="acw">
            <div class="acw__num" :class="`acw__num--${acwRatio.tone}`">{{ acwRatio.ratio }}</div>
            <div class="acw__verdict" :class="`acw__verdict--${acwRatio.tone}`">{{ acwRatio.label }}</div>
            <div class="acw__bar">
              <span class="acw__seg acw__seg--low"></span>
              <span class="acw__seg acw__seg--good"></span>
              <span class="acw__seg acw__seg--warn"></span>
              <span class="acw__seg acw__seg--risk"></span>
              <span class="acw__marker" :style="{ left: Math.min(100, acwRatio.ratio / 2 * 100) + '%' }"></span>
            </div>
            <div class="acw__labels">
              <span>0.8</span><span>1.0</span><span>1.3</span><span>1.5+</span>
            </div>
          </div>
        </div>

        <!-- Risk semaphore -->
        <div class="adv-kpi adv-kpi--risk" :class="`adv-kpi--${overtrainingRisk.tone}`">
          <div class="adv-kpi__title">
            <span class="adv-kpi__title-text">Risc d'overtraining<button class="info-btn info-btn--dark" @click.stop="openInfo('risk')" data-tip="Clica per veure més info" aria-label="Informació sobre risc d'overtraining"><span class="material-symbols-rounded">info</span></button></span>
          </div>
          <div class="risk-body">
            <span class="material-symbols-rounded icon-fill risk-icon">{{ overtrainingRisk.icon }}</span>
            <div class="risk-text">{{ overtrainingRisk.label }}</div>
            <div class="risk-sub">
              {{ totals.highLoadDays }} dia{{ totals.highLoadDays !== 1 ? 's' : '' }} alt · TSS {{ tss }}
            </div>
          </div>
        </div>
      </div>

      <!-- Mid charts row -->
      <div class="adv-charts">
        <!-- TSS per day -->
        <div class="adv-chart">
          <div class="adv-chart__head">
            <h3 class="adv-chart__title">
              Càrrega per dia
              <button class="info-btn" @click.stop="openInfo('tssPerDay')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
            </h3>
            <span class="adv-chart__hint">TSS estimat</span>
          </div>
          <div class="tss-bars">
            <div
              v-for="(v, i) in tssPerDay"
              :key="i"
              class="tss-bar"
              :class="{ 'tss-bar--today': i === todayIndex && weekStore.weekOffset === 0 }"
              :title="`${weekStore.daysFull[i]}: ${v} TSS`"
            >
              <div class="tss-bar__col">
                <div
                  class="tss-bar__fill"
                  :class="`tss-bar__fill--${tssBarTone(v)}`"
                  :style="{ height: maxTssPerDay ? Math.max(2, v / maxTssPerDay * 100) + '%' : '2%' }"
                >
                  <span v-if="v > 0" class="tss-bar__val">{{ v }}</span>
                </div>
              </div>
              <div class="tss-bar__label">{{ weekStore.days[i] }}</div>
            </div>
          </div>
        </div>

        <!-- HR Zones -->
        <div class="adv-chart">
          <div class="adv-chart__head">
            <h3 class="adv-chart__title">
              Volum per zones FC
              <button class="info-btn" @click.stop="openInfo('zones')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
            </h3>
            <span class="adv-chart__hint">Estimació segons intensitat</span>
          </div>
          <div class="zones-bar" role="img" aria-label="Distribució per zones FC">
            <div
              v-for="z in hrZones"
              :key="z.key"
              class="zones-bar__seg"
              :class="`zones-bar__seg--${z.key.toLowerCase()}`"
              :style="{ flexGrow: z.pct }"
              :title="`${z.key} ${z.label}: ${z.min} min (${z.pct}%)`"
            >
              <span v-if="z.pct >= 8">{{ z.key }}</span>
            </div>
          </div>
          <div class="zones-table">
            <div v-for="z in hrZones" :key="z.key" class="zones-row">
              <span class="zones-row__dot" :class="`zones-legend__dot--${z.key.toLowerCase()}`"></span>
              <strong>{{ z.key }}</strong>
              <span class="zones-row__name">{{ z.label }}</span>
              <span class="zones-row__min">{{ z.min }} min</span>
              <span class="zones-row__pct">{{ z.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap + Top sessions -->
      <div class="adv-charts">
        <div class="adv-chart">
          <div class="adv-chart__head">
            <h3 class="adv-chart__title">
              Heatmap horari
              <button class="info-btn" @click.stop="openInfo('heatmap')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
            </h3>
            <span class="adv-chart__hint">Minuts entrenats per dia × franja</span>
          </div>
          <div class="heatmap" role="grid">
            <div class="heatmap__corner"></div>
            <div
              v-for="(d, i) in weekStore.days"
              :key="'h-d-' + i"
              class="heatmap__col-label"
              :class="{ 'heatmap__col-label--today': i === todayIndex && weekStore.weekOffset === 0 }"
            >{{ d }}</div>

            <template v-for="bucket in heatmapBuckets" :key="bucket.key">
              <div class="heatmap__row-label">
                <span class="material-symbols-rounded">{{ bucket.icon }}</span>
                {{ bucket.short }}
              </div>
              <div
                v-for="(min, i) in heatmapData[bucket.key]"
                :key="bucket.key + '-' + i"
                class="heatmap__cell"
                :style="{ '--heat': maxHeatmapMin ? min / maxHeatmapMin : 0 }"
                :title="`${bucket.label} · ${weekStore.daysFull[i]}: ${min} min`"
              >
                <span v-if="min > 0" class="heatmap__cell-val">{{ min }}</span>
              </div>
            </template>
          </div>
        </div>

        <div class="adv-chart">
          <div class="adv-chart__head">
            <h3 class="adv-chart__title">
              Top sessions
              <button class="info-btn" @click.stop="openInfo('topSessions')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
            </h3>
            <span class="adv-chart__hint">Per TSS estimat</span>
          </div>
          <div v-if="!topSessions.length" class="adv-chart__empty">No hi ha sessions aquesta setmana.</div>
          <ol v-else class="top-list">
            <li v-for="(s, i) in topSessions" :key="s.id" class="top-row" :style="{ '--tcolor': getColor(s.type) }">
              <span class="top-row__rank">{{ i + 1 }}</span>
              <span class="top-row__icon">
                <span class="material-symbols-rounded">{{ getIcon(s.type) }}</span>
              </span>
              <div class="top-row__body">
                <span class="top-row__label">{{ s.label }}</span>
                <span class="top-row__meta">
                  {{ weekStore.daysFull[s.day] }} · {{ formatDuration(s.duration) }} · {{ s.intensity }}
                </span>
              </div>
              <div class="top-row__tss">
                <strong>{{ s.tss }}</strong>
                <span>TSS</span>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <!-- Bottom small stats -->
      <div class="adv-mini-row">
        <div class="adv-mini">
          <div class="adv-mini__icon"><span class="material-symbols-rounded">stadia_controller</span></div>
          <div class="adv-mini__num">{{ density }}<small>%</small></div>
          <div class="adv-mini__label">
            Densitat d'entrenament
            <button class="info-btn" @click.stop="openInfo('density')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
          </div>
          <div class="adv-mini__hint">Sobre 16h despertes × 7 dies</div>
        </div>
        <div class="adv-mini">
          <div class="adv-mini__icon"><span class="material-symbols-rounded">bedtime</span></div>
          <div class="adv-mini__num" v-if="avgRecoveryGap !== null">{{ avgRecoveryGap }}<small>h</small></div>
          <div class="adv-mini__num adv-mini__num--na" v-else>—</div>
          <div class="adv-mini__label">
            Pausa mitjana
            <button class="info-btn" @click.stop="openInfo('recovery')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
          </div>
          <div class="adv-mini__hint">
            {{ avgRecoveryGap !== null
              ? (avgRecoveryGap >= 24 ? 'Recuperació còmoda' : avgRecoveryGap >= 12 ? 'Marge raonable' : 'Pausa curta')
              : 'Calen ≥2 sessions' }}
          </div>
        </div>
        <div class="adv-mini">
          <div class="adv-mini__icon"><span class="material-symbols-rounded">hotel</span></div>
          <div class="adv-mini__num">{{ longestRestStreak }}<small>{{ longestRestStreak === 1 ? 'dia' : 'dies' }}</small></div>
          <div class="adv-mini__label">
            Descans més llarg
            <button class="info-btn" @click.stop="openInfo('rest')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
          </div>
          <div class="adv-mini__hint">Dies seguits sense entrenar</div>
        </div>
        <div class="adv-mini">
          <div class="adv-mini__icon"><span class="material-symbols-rounded">whatshot</span></div>
          <div class="adv-mini__num" v-if="peakSession">{{ peakSession.tss }}</div>
          <div class="adv-mini__num adv-mini__num--na" v-else>—</div>
          <div class="adv-mini__label">
            Pic d'intensitat
            <button class="info-btn" @click.stop="openInfo('peak')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
          </div>
          <div class="adv-mini__hint">
            {{ peakSession
              ? `${peakSession.label} · ${weekStore.days[peakSession.day]}`
              : 'Sense sessions' }}
          </div>
        </div>
      </div>

      <!-- Duration distribution -->
      <div class="adv-chart adv-chart--full">
        <div class="adv-chart__head">
          <h3 class="adv-chart__title">
            Distribució per durada
            <button class="info-btn" @click.stop="openInfo('duration')" data-tip="Clica per veure més info" aria-label="Informació"><span class="material-symbols-rounded">info</span></button>
          </h3>
          <span class="adv-chart__hint">Quantes sessions a cada rang</span>
        </div>
        <div class="duration-bars">
          <div v-for="b in durationBuckets" :key="b.key" class="dur-bar">
            <div class="dur-bar__col">
              <div
                class="dur-bar__fill"
                :style="{ height: maxDurationCount ? Math.max(4, b.count / maxDurationCount * 100) + '%' : '4%' }"
              >
                <span v-if="b.count > 0">{{ b.count }}</span>
              </div>
            </div>
            <div class="dur-bar__label">{{ b.label }}</div>
            <div class="dur-bar__sub">{{ b.range }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info modal — opens when clicking any info icon on advanced metrics -->
    <transition name="info-fade">
      <div v-if="infoTopic" class="info-modal" role="dialog" aria-modal="true" @click.self="closeInfo" @keydown.esc="closeInfo">
        <div class="info-modal__card">
          <button class="info-modal__close" @click="closeInfo" aria-label="Tancar">
            <span class="material-symbols-rounded">close</span>
          </button>
          <div class="info-modal__head">
            <span class="info-modal__icon">
              <span class="material-symbols-rounded icon-fill">{{ infoData.icon }}</span>
            </span>
            <h3 class="info-modal__title">{{ infoData.title }}</h3>
          </div>
          <p class="info-modal__body">{{ infoData.body }}</p>

          <!-- Formula equation + variable legend -->
          <div v-if="infoData.formula" class="info-modal__section">
            <h4 class="info-modal__section-title">
              <span class="material-symbols-rounded">function</span>
              Com es calcula
            </h4>
            <div class="formula-eq">{{ infoData.formula.equation }}</div>
            <div v-if="infoData.formula.legend" class="formula-legend">
              <div v-for="l in infoData.formula.legend" :key="l.label" class="formula-legend__item">
                <span class="formula-legend__label">{{ l.label }}</span>
                <span class="formula-legend__value">{{ l.value }}</span>
              </div>
            </div>
          </div>

          <!-- Standalone legend (no formula) -->
          <div v-if="!infoData.formula && infoData.legend" class="info-modal__section">
            <h4 class="info-modal__section-title">
              <span class="material-symbols-rounded">menu_book</span>
              Llegenda
            </h4>
            <div class="formula-legend">
              <div v-for="l in infoData.legend" :key="l.label" class="formula-legend__item">
                <span class="formula-legend__label">{{ l.label }}</span>
                <span class="formula-legend__value">{{ l.value }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="infoData.legend && infoData.formula" class="info-modal__section info-modal__section--legend-only">
            <h4 class="info-modal__section-title">
              <span class="material-symbols-rounded">menu_book</span>
              Franges
            </h4>
            <div class="formula-legend">
              <div v-for="l in infoData.legend" :key="l.label" class="formula-legend__item">
                <span class="formula-legend__label">{{ l.label }}</span>
                <span class="formula-legend__value">{{ l.value }}</span>
              </div>
            </div>
          </div>

          <!-- Thresholds (colored pills) -->
          <div v-if="infoData.thresholds" class="info-modal__section">
            <h4 class="info-modal__section-title">
              <span class="material-symbols-rounded">straighten</span>
              Llindars de referència
            </h4>
            <div class="threshold-grid">
              <div
                v-for="t in infoData.thresholds"
                :key="t.range"
                class="threshold-pill"
                :class="`threshold-pill--${t.tone}`"
              >
                <span class="threshold-pill__range">{{ t.range }}</span>
                <span class="threshold-pill__label">{{ t.label }}</span>
              </div>
            </div>
          </div>

          <!-- Decision rules -->
          <div v-if="infoData.rules" class="info-modal__section">
            <h4 class="info-modal__section-title">
              <span class="material-symbols-rounded">account_tree</span>
              Regles de decisió
            </h4>
            <div class="rule-list">
              <div v-for="r in infoData.rules" :key="r.condition" class="rule-row">
                <code class="rule-cond">{{ r.condition }}</code>
                <span class="material-symbols-rounded rule-arrow">arrow_forward</span>
                <span class="rule-verdict" :class="`rule-verdict--${r.tone}`">{{ r.verdict }}</span>
              </div>
            </div>
          </div>

          <!-- Mapping -->
          <div v-if="infoData.mapping" class="info-modal__section">
            <h4 class="info-modal__section-title">
              <span class="material-symbols-rounded">swap_horiz</span>
              Correspondència
            </h4>
            <div class="mapping-list">
              <div v-for="m in infoData.mapping" :key="m.from" class="mapping-row">
                <span class="mapping-from">{{ m.from }}</span>
                <span class="material-symbols-rounded mapping-arrow">arrow_forward</span>
                <span class="mapping-to">{{ m.to }}</span>
              </div>
            </div>
          </div>

          <!-- Example with current data -->
          <div v-if="infoData.example" class="info-modal__section info-modal__section--example">
            <h4 class="info-modal__section-title">
              <span class="material-symbols-rounded icon-fill">person</span>
              Exemple amb les teves dades
            </h4>
            <div class="info-modal__example">{{ infoData.example }}</div>
          </div>
        </div>
      </div>
    </transition>

    <SessionEditPanel />
    <AIPopover />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import SessionEditPanel from '@/components/session/SessionEditPanel.vue'
import SessionLibrary from '@/components/session/SessionLibrary.vue'
import LoadBadge from '@/components/ui/LoadBadge.vue'
import AIPopover from '@/components/ai/AIPopover.vue'
import { useWeekStore } from '@/stores/weekStore'
import { useUIStore } from '@/stores/uiStore'

const weekStore = useWeekStore()
const uiStore = useUIStore()

const todayIndex = computed(() => {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
})

function getDayNum(dayIdx) {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - todayIndex.value + dayIdx + weekStore.weekOffset * 7)
  return start.getDate()
}

function getColor(type) { return weekStore.sessionTypes[type]?.color ?? 'var(--purple)' }
function getIcon(type) { return weekStore.sessionTypes[type]?.icon ?? 'fitness_center' }

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function formatMins(mins) {
  if (mins < 60) return `${mins}min`
  const h = (mins / 60).toFixed(mins % 60 === 0 ? 0 : 1)
  return `${h}h`
}

function formatTimeRange(start, durationMin) {
  const s = start ?? 8
  const sh = Math.floor(s), sm = Math.round((s - sh) * 60)
  const endHour = s + durationMin / 60
  const eh = Math.floor(endHour) % 24, em = Math.round((endHour - Math.floor(endHour)) * 60)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(sh)}:${pad(sm)}–${pad(eh)}:${pad(em)}`
}

function formatK(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function removeSession(id) {
  weekStore.removeSession(id)
  uiStore.showToast('Sessió eliminada.', 'info')
}

const totals = computed(() => weekStore.getWeekTotals())

const totalHours = computed(() => {
  const mins = weekStore.currentWeekSessions.reduce((s, sess) => s + sess.duration, 0)
  return (mins / 60).toFixed(1)
})

const avgDuration = computed(() => {
  const ws = weekStore.currentWeekSessions
  if (!ws.length) return 0
  return Math.round(ws.reduce((s, sess) => s + sess.duration, 0) / ws.length)
})
const avgKcal = computed(() => {
  const ws = weekStore.currentWeekSessions
  if (!ws.length) return 0
  return Math.round(ws.reduce((s, sess) => s + sess.kcal, 0) / ws.length)
})

const trainingDays = computed(() => {
  let days = 0
  for (let i = 0; i < 7; i++) if ((weekStore.sessionsByDay[i] || []).length) days++
  return days
})

const busiestDay = computed(() => {
  let best = { day: 0, kcal: 0 }
  for (let i = 0; i < 7; i++) {
    const k = (weekStore.sessionsByDay[i] || []).reduce((s, sess) => s + sess.kcal, 0)
    if (k > best.kcal) best = { day: i, kcal: k }
  }
  return best
})

function daySummary(dayIdx) {
  const ds = weekStore.sessionsByDay[dayIdx] || []
  const k = ds.reduce((s, sess) => s + sess.kcal, 0)
  const m = ds.reduce((s, sess) => s + sess.duration, 0)
  return `${ds.length} sessió${ds.length !== 1 ? 's' : ''} · ${formatMins(m)} · ${k} kcal`
}

const typeBreakdown = computed(() => {
  const ws = weekStore.currentWeekSessions
  const totalMin = ws.reduce((s, sess) => s + sess.duration, 0) || 1
  const out = {}
  ws.forEach(s => {
    if (!out[s.type]) out[s.type] = { count: 0, minutes: 0, kcal: 0, pctTime: 0 }
    out[s.type].count++
    out[s.type].minutes += s.duration
    out[s.type].kcal += s.kcal
  })
  Object.keys(out).forEach(t => {
    out[t].pctTime = Math.round(out[t].minutes / totalMin * 100)
  })
  return out
})

const intensityDist = computed(() => {
  const ws = weekStore.currentWeekSessions
  const totalMin = ws.reduce((s, sess) => s + sess.duration, 0)
  const acc = { Baixa: 0, Moderada: 0, Alta: 0 }
  ws.forEach(s => { acc[s.intensity] = (acc[s.intensity] || 0) + s.duration })
  if (!totalMin) return { Baixa: 0, Moderada: 0, Alta: 0 }
  return {
    Baixa: Math.round(acc.Baixa / totalMin * 100),
    Moderada: Math.round(acc.Moderada / totalMin * 100),
    Alta: Math.round(acc.Alta / totalMin * 100),
  }
})

// Time of day buckets — by start hour
function todBucket(hour) {
  if (hour < 6)  return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

const todBuckets = computed(() => {
  const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  weekStore.currentWeekSessions.forEach(s => {
    counts[todBucket(s.startTime ?? 8)]++
  })
  return [
    { key: 'morning',   label: 'Matí (6–12h)',     short: 'Matí',     icon: 'wb_sunny',     count: counts.morning },
    { key: 'afternoon', label: 'Tarda (12–18h)',   short: 'Tarda',    icon: 'partly_cloudy_day', count: counts.afternoon },
    { key: 'evening',   label: 'Vespre (18–24h)',  short: 'Vespre',   icon: 'nightlight',   count: counts.evening },
    { key: 'night',     label: 'Matinada (0–6h)',  short: 'Nit',      icon: 'bedtime',      count: counts.night },
  ]
})
const topTod = computed(() => {
  const b = todBuckets.value
  let top = b[0]
  for (const x of b) if (x.count > top.count) top = x
  return top.count > 0 ? top.key : null
})

// ── Session row enrichment (computed details) ─────────────
function timeOfDayLabel(h) {
  const b = todBucket(h ?? 8)
  return ({ morning: 'Matí', afternoon: 'Tarda', evening: 'Vespre', night: 'Matinada' })[b]
}
function timeOfDayIcon(h) {
  const b = todBucket(h ?? 8)
  return ({ morning: 'wb_sunny', afternoon: 'partly_cloudy_day', evening: 'nightlight', night: 'bedtime' })[b]
}
function hrZone(intensity) {
  return ({ Baixa: 'Z1–Z2', Moderada: 'Z2–Z3', Alta: 'Z3–Z4' })[intensity] ?? 'Z2'
}
function recoveryHours(s) {
  // Rough estimate: high → 24h, moderate → 12h, low → 6h, scaled by duration
  const base = s.intensity === 'Alta' ? 24 : s.intensity === 'Baixa' ? 6 : 12
  return Math.round(base * (s.duration / 60) / 2 + base / 2)
}
function hydrationL(s) {
  // 0.5–0.8 L/h depending on intensity
  const rate = s.intensity === 'Alta' ? 0.8 : s.intensity === 'Baixa' ? 0.4 : 0.6
  return (rate * s.duration / 60).toFixed(1)
}
function distanceEquivalent(s) {
  // Approximate distance based on type
  const hours = s.duration / 60
  switch (s.type) {
    case 'cycling': return `${(hours * (s.intensity === 'Alta' ? 30 : 22)).toFixed(0)} km`
    case 'running': return `${(hours * (s.intensity === 'Alta' ? 12 : 9)).toFixed(1)} km`
    case 'swimming': return `${(hours * 2.8).toFixed(1)} km`
    default: {
      const sets = Math.round(hours * 12)
      return `~${sets} sèries`
    }
  }
}
function percentOfWeek(s) {
  const totalKcal = weekStore.currentWeekSessions.reduce((sum, x) => sum + x.kcal, 0)
  if (!totalKcal) return 0
  return Math.round(s.kcal / totalKcal * 100)
}

// ── Comparison with previous week ────────────────────────
function statsForOffset(offset) {
  const filtered = (weekStore.sessions ?? []).filter(s => {
    if (s.scope === 'week')  return s.originWeekOffset === offset
    if (s.scope === 'month') return false  // skip month-scoped for cleaner compare
    return true
  })
  const totalSessions = filtered.length
  const totalKcal = filtered.reduce((s, sess) => s + sess.kcal, 0)
  const totalMin = filtered.reduce((s, sess) => s + sess.duration, 0)
  const highLoadDays = new Set(filtered.filter(s => s.load === 'high').map(s => s.day)).size
  return { totalSessions, totalKcal, totalMin, highLoadDays }
}
const deltas = computed(() => {
  const cur = statsForOffset(weekStore.weekOffset)
  const prev = statsForOffset(weekStore.weekOffset - 1)
  return {
    sessions: cur.totalSessions - prev.totalSessions,
    kcal:     cur.totalKcal - prev.totalKcal,
    hours:    +(((cur.totalMin - prev.totalMin) / 60).toFixed(1)),
    highLoad: cur.highLoadDays - prev.highLoadDays,
  }
})
function deltaClass(v) {
  if (v > 0) return 'delta--up'
  if (v < 0) return 'delta--down'
  return 'delta--flat'
}
function deltaText(v, unit = '') {
  if (v === 0) return '–'
  const sign = v > 0 ? '+' : '−'
  return `${sign}${Math.abs(v)}${unit}`
}

// ── Add session form ─────────────────────────────────────
const addOpen = ref(false)
const form = reactive({
  day: todayIndex.value,
  type: 'cycling',
  intensity: 'Moderada',
  duration: 60,
  startTime: 8,
})

function openAdd(prefilledDay = null) {
  if (prefilledDay !== null) form.day = prefilledDay
  addOpen.value = true
}

const previewKcal = computed(() => {
  const t = weekStore.sessionTypes[form.type]
  const baseRate = t?.kcalPerHour ?? (form.intensity === 'Alta' ? 560 : form.intensity === 'Baixa' ? 280 : 400)
  const mod = form.intensity === 'Alta' ? 1.25 : form.intensity === 'Baixa' ? 0.75 : 1
  return Math.round((form.duration / 60) * baseRate * mod)
})

function submitAdd() {
  const newSession = weekStore.addSession(form.day, form.type, form.duration, form.intensity, form.startTime)
  uiStore.showToast(`Sessió "${newSession.label}" afegida a ${weekStore.daysFull[form.day]}.`, 'success')
  addOpen.value = false
}

// ── Advanced metrics (Profile-controlled) ─────────────────
const INTENSITY_FACTOR = { Baixa: 0.65, Moderada: 0.80, Alta: 0.95 }

// TSS: Σ (h × IF²) × 100 — typical week 200–700
const tss = computed(() => {
  return Math.round(weekStore.currentWeekSessions.reduce((s, sess) => {
    const if_ = INTENSITY_FACTOR[sess.intensity] ?? 0.75
    return s + (sess.duration / 60) * if_ * if_ * 100
  }, 0))
})

const tssZone = computed(() => {
  const v = tss.value
  if (v < 200) return { label: 'Volum baix', tone: 'low',  pct: Math.min(100, v / 200 * 100) }
  if (v < 500) return { label: 'Òptim',       tone: 'good', pct: (v - 200) / 300 * 100 }
  if (v < 700) return { label: 'Alt',         tone: 'warn', pct: (v - 500) / 200 * 100 }
  return                  { label: 'Excessiu',  tone: 'risk', pct: 100 }
})

// Polarization 80/20 — % low+moderate vs high
const polarization = computed(() => {
  const ws = weekStore.currentWeekSessions
  const totalMin = ws.reduce((s, sess) => s + sess.duration, 0)
  if (!totalMin) return { easy: 0, hard: 0, ok: false }
  const easyMin = ws.filter(s => s.intensity !== 'Alta').reduce((s, sess) => s + sess.duration, 0)
  const easy = Math.round(easyMin / totalMin * 100)
  return { easy, hard: 100 - easy, ok: easy >= 75 && easy <= 85 }
})

// Heart rate zones — mapped from 3-level intensity
const hrZones = computed(() => {
  const ws = weekStore.currentWeekSessions
  let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0
  ws.forEach(s => {
    const m = s.duration
    if (s.intensity === 'Baixa')         { z1 += m * 0.35; z2 += m * 0.65 }
    else if (s.intensity === 'Moderada') { z2 += m * 0.30; z3 += m * 0.70 }
    else if (s.intensity === 'Alta')     { z3 += m * 0.15; z4 += m * 0.55; z5 += m * 0.30 }
  })
  const total = z1 + z2 + z3 + z4 + z5 || 1
  return [
    { key: 'Z1', label: 'Recuperació', min: Math.round(z1), pct: Math.round(z1 / total * 100) },
    { key: 'Z2', label: 'Aeròbic base', min: Math.round(z2), pct: Math.round(z2 / total * 100) },
    { key: 'Z3', label: 'Tempo',        min: Math.round(z3), pct: Math.round(z3 / total * 100) },
    { key: 'Z4', label: 'Llindar',      min: Math.round(z4), pct: Math.round(z4 / total * 100) },
    { key: 'Z5', label: 'VO₂max',       min: Math.round(z5), pct: Math.round(z5 / total * 100) },
  ]
})

// Training density — % of waking week (16h × 7 = 6720 min)
const density = computed(() => {
  const totalMin = weekStore.currentWeekSessions.reduce((s, sess) => s + sess.duration, 0)
  return +(totalMin / 6720 * 100).toFixed(1)
})

// Average gap between consecutive sessions (rest hours)
const avgRecoveryGap = computed(() => {
  const ws = [...weekStore.currentWeekSessions]
    .filter(s => typeof s.startTime === 'number')
    .map(s => ({ start: s.day * 24 + s.startTime, end: s.day * 24 + s.startTime + s.duration / 60 }))
    .sort((a, b) => a.start - b.start)
  if (ws.length < 2) return null
  const gaps = []
  for (let i = 1; i < ws.length; i++) gaps.push(ws[i].start - ws[i - 1].end)
  return Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length)
})

// Overtraining risk semaphore
const overtrainingRisk = computed(() => {
  const high = totals.value.highLoadDays
  const v = tss.value
  if (high >= 3 || v > 700) return { tone: 'risk', label: 'Risc — afegir descans', icon: 'warning' }
  if (high >= 2 || v > 500) return { tone: 'warn', label: 'Càrrega elevada — vigila', icon: 'priority_high' }
  if (v < 100) return { tone: 'low',  label: 'Volum molt baix', icon: 'sentiment_dissatisfied' }
  return                       { tone: 'good', label: 'Equilibri saludable', icon: 'check_circle' }
})

// View switcher — calendar vs advanced
const viewMode = ref('calendar')
watch(() => uiStore.advancedMetrics, (v) => { if (!v) viewMode.value = 'calendar' })

// Per-session TSS
function sessionTss(s) {
  const if_ = INTENSITY_FACTOR[s.intensity] ?? 0.75
  return Math.round((s.duration / 60) * if_ * if_ * 100)
}
function tssBarTone(v) {
  if (v >= 200) return 'risk'
  if (v >= 120) return 'warn'
  if (v >= 50)  return 'good'
  return 'low'
}

// TSS per day
const tssPerDay = computed(() => {
  const arr = Array(7).fill(0)
  weekStore.currentWeekSessions.forEach(s => { arr[s.day] += sessionTss(s) })
  return arr.map(v => Math.round(v))
})
const maxTssPerDay = computed(() => Math.max(...tssPerDay.value, 0))

// AC:W (acute:chronic). Chronic baseline simulated for the demo.
const CHRONIC_BASELINE = 350
const acwRatio = computed(() => {
  const acute = tss.value
  const chronic = CHRONIC_BASELINE
  const ratio = +(acute / chronic).toFixed(2)
  let tone = 'good', label = 'Òptim (sweet-spot)'
  if (ratio < 0.8)        { tone = 'low';  label = 'Subentrenament' }
  else if (ratio > 1.5)   { tone = 'risk'; label = 'Alt risc lesió' }
  else if (ratio > 1.3)   { tone = 'warn'; label = 'Càrrega creixent' }
  return { ratio, tone, label }
})

// Heatmap (4 buckets × 7 days)
const heatmapBuckets = [
  { key: 'morning',   label: 'Matí',     short: 'Matí',    icon: 'wb_sunny' },
  { key: 'afternoon', label: 'Tarda',    short: 'Tarda',   icon: 'partly_cloudy_day' },
  { key: 'evening',   label: 'Vespre',   short: 'Vespre',  icon: 'nightlight' },
  { key: 'night',     label: 'Matinada', short: 'Nit',     icon: 'bedtime' },
]
const heatmapData = computed(() => {
  const grid = { morning: Array(7).fill(0), afternoon: Array(7).fill(0), evening: Array(7).fill(0), night: Array(7).fill(0) }
  weekStore.currentWeekSessions.forEach(s => {
    const b = todBucket(s.startTime ?? 8)
    grid[b][s.day] += s.duration
  })
  return grid
})
const maxHeatmapMin = computed(() => {
  let m = 0
  for (const k of Object.keys(heatmapData.value)) for (const v of heatmapData.value[k]) if (v > m) m = v
  return m
})

// Top sessions
const topSessions = computed(() => {
  return [...weekStore.currentWeekSessions]
    .map(s => ({ ...s, tss: sessionTss(s) }))
    .sort((a, b) => b.tss - a.tss)
    .slice(0, 5)
})
const peakSession = computed(() => topSessions.value[0] ?? null)

// Longest rest streak (consecutive days without sessions, only within the week)
const longestRestStreak = computed(() => {
  let max = 0, cur = 0
  for (let i = 0; i < 7; i++) {
    if ((weekStore.sessionsByDay[i] || []).length === 0) {
      cur++; if (cur > max) max = cur
    } else cur = 0
  }
  return max
})

// Duration distribution
const durationBuckets = computed(() => {
  const buckets = [
    { key: 'short',    label: 'Curtes',   range: '<60 min',   count: 0 },
    { key: 'medium',   label: 'Mitjanes', range: '60–90 min', count: 0 },
    { key: 'long',     label: 'Llargues', range: '90–120 min',count: 0 },
    { key: 'marathon', label: 'Maratón',  range: '120+ min',  count: 0 },
  ]
  weekStore.currentWeekSessions.forEach(s => {
    if (s.duration < 60)        buckets[0].count++
    else if (s.duration < 90)   buckets[1].count++
    else if (s.duration < 120)  buckets[2].count++
    else                        buckets[3].count++
  })
  return buckets
})
const maxDurationCount = computed(() => Math.max(...durationBuckets.value.map(b => b.count), 0))

// ── Info modal — per-metric explanations + dynamic examples ──
const infoTopic = ref(null)
function openInfo(key) { infoTopic.value = key }
function closeInfo() { infoTopic.value = null }

function handleEsc(e) { if (e.key === 'Escape' && infoTopic.value) closeInfo() }
onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))

const infoData = computed(() => {
  if (!infoTopic.value) return null
  const d = weekStore.daysFull
  const topBucket = todBuckets.value.reduce((a, b) => b.count > a.count ? b : a, todBuckets.value[0])
  switch (infoTopic.value) {
    case 'tss': return {
      icon: 'monitoring', title: 'TSS — Training Stress Score',
      body: 'Una mesura sintètica de la càrrega total que combina volum (hores) i intensitat. Permet comparar setmanes i detectar pics o caigudes de càrrega.',
      formula: {
        equation: 'TSS = Σ (hores × IF²) × 100',
        legend: [
          { label: 'IF (Baixa)',    value: '0.65' },
          { label: 'IF (Moderada)', value: '0.80' },
          { label: 'IF (Alta)',     value: '0.95' },
        ],
      },
      thresholds: [
        { range: '< 200',     label: 'Volum baix', tone: 'low' },
        { range: '200 – 500', label: 'Òptim',      tone: 'good' },
        { range: '500 – 700', label: 'Alt',        tone: 'warn' },
        { range: '> 700',     label: 'Excessiu',   tone: 'risk' },
      ],
      example: `Aquesta setmana acumules ${tss.value} TSS — zona "${tssZone.value.label}".`
    }
    case 'polar': return {
      icon: 'donut_small', title: 'Polarització 80/20',
      body: 'La regla 80/20 diu que els atletes d\'elit fan al voltant del 80% del volum a baixa-moderada intensitat i només el 20% a alta. Acumular massa intensitat alta provoca fatiga sense millora extra.',
      formula: { equation: '% fàcil = (temps Baixa + temps Moderada) ÷ temps total' },
      thresholds: [
        { range: '75 – 85%', label: 'Rang ideal',   tone: 'good' },
        { range: 'Fora',     label: 'Desequilibri', tone: 'warn' },
      ],
      example: `Tu fas ${polarization.value.easy}% a Baixa+Moderada i ${polarization.value.hard}% a Alta. ${polarization.value.ok ? '✓ Estàs dins del rang ideal.' : '⚠ Estàs fora del rang ideal.'}`
    }
    case 'acw': return {
      icon: 'compare_arrows', title: 'Càrrega aguda vs crònica (AC:W)',
      body: 'Compara la càrrega d\'aquesta setmana (aguda) amb la mitjana de les últimes 4 setmanes (crònica, simulada en aquesta demo). Salts bruscos de càrrega s\'associen amb risc de lesió.',
      formula: {
        equation: 'AC:W = TSS_aguda ÷ TSS_crònica',
        legend: [
          { label: 'Aguda',   value: 'Setmana actual' },
          { label: 'Crònica', value: `${CHRONIC_BASELINE} TSS (estimat)` },
        ],
      },
      thresholds: [
        { range: '< 0.8',     label: 'Subentrenament', tone: 'low' },
        { range: '0.8 – 1.3', label: 'Òptim',          tone: 'good' },
        { range: '1.3 – 1.5', label: 'Creixent',       tone: 'warn' },
        { range: '> 1.5',     label: 'Risc lesió',     tone: 'risk' },
      ],
      example: `Aguda = ${tss.value} TSS · Crònica = ${CHRONIC_BASELINE} TSS · Ratio = ${acwRatio.value.ratio} → ${acwRatio.value.label}.`
    }
    case 'risk': return {
      icon: 'health_and_safety', title: 'Risc d\'overtraining',
      body: 'Indicador qualitatiu que combina el TSS setmanal i el nombre de dies amb sessions de càrrega alta no compensades. Et pot avisar de fatiga acumulada abans no afecti el rendiment.',
      rules: [
        { condition: '≥ 3 dies alts o TSS > 700', verdict: 'Risc',       tone: 'risk' },
        { condition: '≥ 2 dies o TSS > 500',      verdict: 'Vigilar',    tone: 'warn' },
        { condition: 'TSS < 100',                 verdict: 'Volum baix', tone: 'low' },
        { condition: 'Resta de casos',            verdict: 'Saludable',  tone: 'good' },
      ],
      example: `Tens ${totals.value.highLoadDays} dia${totals.value.highLoadDays !== 1 ? 's' : ''} de càrrega alta i un TSS de ${tss.value} → "${overtrainingRisk.value.label}".`
    }
    case 'tssPerDay': return {
      icon: 'bar_chart', title: 'Càrrega per dia (TSS)',
      body: 'Distribució del TSS entre els 7 dies de la setmana. Útil per detectar pics i evitar acumular massa intensitat seguida sense recuperació.',
      formula: { equation: 'TSS_dia = Σ TSS de cada sessió del dia' },
      thresholds: [
        { range: '< 50',      label: 'Lleuger',  tone: 'low' },
        { range: '50 – 119',  label: 'Òptim',    tone: 'good' },
        { range: '120 – 199', label: 'Alt',      tone: 'warn' },
        { range: '≥ 200',     label: 'Molt alt', tone: 'risk' },
      ],
      example: maxTssPerDay.value > 0
        ? `Pic: ${d[tssPerDay.value.indexOf(maxTssPerDay.value)]} amb ${maxTssPerDay.value} TSS. Mitjana per dia entrenat: ${trainingDays.value ? Math.round(tss.value / trainingDays.value) : 0} TSS.`
        : 'Encara no hi ha sessions aquesta setmana.'
    }
    case 'zones': return {
      icon: 'favorite', title: 'Volum per zones FC',
      body: 'Distribució estimada del temps en cada zona de freqüència cardíaca, mapejada des de la intensitat declarada (no requereix sensor). Z1=recuperació activa, Z2=base aeròbica, Z3=tempo, Z4=llindar anaeròbic, Z5=VO₂max.',
      mapping: [
        { from: 'Baixa',    to: '35% Z1 · 65% Z2' },
        { from: 'Moderada', to: '30% Z2 · 70% Z3' },
        { from: 'Alta',     to: '15% Z3 · 55% Z4 · 30% Z5' },
      ],
      example: hrZones.value.some(z => z.min > 0)
        ? `Els teus minuts: ${hrZones.value.map(z => `${z.key}=${z.min}'`).join(' · ')}.`
        : 'Encara no hi ha sessions aquesta setmana.'
    }
    case 'heatmap': return {
      icon: 'grid_on', title: 'Heatmap horari',
      body: 'Visualització en graella de minuts entrenats per dia × franja horària. Et permet identificar el teu patró d\'entrenament al llarg de la setmana.',
      formula: { equation: 'cel·la = Σ minuts amb hora_inici dins la franja, en aquell dia' },
      legend: [
        { label: 'Matí',     value: '6h – 12h' },
        { label: 'Tarda',    value: '12h – 18h' },
        { label: 'Vespre',   value: '18h – 24h' },
        { label: 'Matinada', value: '0h – 6h' },
      ],
      example: maxHeatmapMin.value > 0 && topBucket
        ? `Franja predominant: ${topBucket.label.toLowerCase()} amb ${topBucket.count} sessió${topBucket.count !== 1 ? 's' : ''}. Cel·la més carregada: ${maxHeatmapMin.value} min.`
        : 'Encara no hi ha sessions aquesta setmana.'
    }
    case 'topSessions': return {
      icon: 'leaderboard', title: 'Top sessions',
      body: 'Les 5 sessions de la setmana ordenades pel seu TSS individual. Identifica les més exigents per planificar la recuperació al voltant.',
      formula: { equation: 'sessions ordenades per TSS individual descendent' },
      example: peakSession.value
        ? `La més intensa: "${peakSession.value.label}" del ${d[peakSession.value.day]} — ${peakSession.value.tss} TSS (${peakSession.value.duration} min, ${peakSession.value.intensity}).`
        : 'Encara no hi ha sessions aquesta setmana.'
    }
    case 'duration': return {
      icon: 'timelapse', title: 'Distribució per durada',
      body: 'Quantes sessions tens a cada rang de durada. Un bon balanç combina sessions curtes (recuperació o intensitat) i llargues (resistència).',
      mapping: [
        { from: 'Curtes',   to: '< 60 min' },
        { from: 'Mitjanes', to: '60 – 90 min' },
        { from: 'Llargues', to: '90 – 120 min' },
        { from: 'Maratón',  to: '> 120 min' },
      ],
      example: durationBuckets.value.some(b => b.count > 0)
        ? `Tu tens: ${durationBuckets.value.map(b => `${b.count} ${b.label.toLowerCase()}`).join(' · ')}.`
        : 'Encara no hi ha sessions aquesta setmana.'
    }
    case 'density': return {
      icon: 'stadia_controller', title: 'Densitat d\'entrenament',
      body: 'Quin percentatge del teu temps despert dediques a entrenar. És un indicador de "compromís" amb el pla.',
      formula: {
        equation: 'Densitat = (minuts entrenats ÷ 6720) × 100%',
        legend: [{ label: '6720 min', value: '7 dies × 16 h despertes' }],
      },
      thresholds: [
        { range: '~ 3%', label: 'Recreatiu',       tone: 'low' },
        { range: '~ 5%', label: 'Mig',             tone: 'good' },
        { range: '7%+',  label: 'Atleta dedicat',  tone: 'warn' },
      ],
      example: `Aquesta setmana: ${density.value}% (≈ ${(density.value * 1.12).toFixed(1)} h/setmana).`
    }
    case 'recovery': return {
      icon: 'bedtime', title: 'Pausa mitjana entre sessions',
      body: 'Hores mitjanes de descans entre cada parell de sessions consecutives, ordenades per dia i hora d\'inici. Pauses curtes recurrents poden indicar acumulació de fatiga.',
      formula: {
        equation: 'gap_i = inici_{i+1} − final_i      ·      pausa = mitjana(gap_i)',
      },
      thresholds: [
        { range: '≥ 24h',     label: 'Còmoda',   tone: 'good' },
        { range: '12 – 24h',  label: 'Raonable', tone: 'low' },
        { range: '< 12h',     label: 'Curta',    tone: 'warn' },
      ],
      example: avgRecoveryGap.value !== null
        ? `Mitjana actual: ${avgRecoveryGap.value}h.`
        : 'Calen almenys 2 sessions a la setmana per calcular-la.'
    }
    case 'rest': return {
      icon: 'hotel', title: 'Descans més llarg',
      body: 'El nombre màxim de dies consecutius dins la setmana sense cap sessió. Útil per assegurar un mínim de descans setmanal i detectar setmanes amb massa volum.',
      formula: { equation: 'max(streak de dies sense sessions)' },
      example: `El teu descans més llarg aquesta setmana és de ${longestRestStreak.value} dia${longestRestStreak.value !== 1 ? 's' : ''} consecutiu${longestRestStreak.value !== 1 ? 's' : ''}.`
    }
    case 'peak': return {
      icon: 'whatshot', title: 'Pic d\'intensitat',
      body: 'La sessió individual amb major TSS de la setmana. Ajuda a identificar la sessió "rei" que defineix el pic de fatiga i requereix més recuperació al voltant.',
      formula: { equation: 'pic = max(TSS_sessió) entre totes les sessions de la setmana' },
      example: peakSession.value
        ? `Pic: ${peakSession.value.tss} TSS — "${peakSession.value.label}" del ${d[peakSession.value.day]} (${peakSession.value.duration} min, ${peakSession.value.intensity}).`
        : 'Encara no hi ha sessions aquesta setmana.'
    }
    default: return null
  }
})
</script>

<style scoped>
.sessions-view { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.sessions-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
  padding: 20px 24px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ─── LEFT COLUMN ─────────────────────────────────────── */
.sessions-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}
.sessions-left::-webkit-scrollbar { width: 4px; }
.sessions-left::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

/* Add card */
.add-card {
  background: var(--surface);
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-xl);
  transition: all var(--dur-fast);
}
.add-card--open {
  border-style: solid;
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-light), var(--surface));
}
.add-card__cta {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.add-card__cta:hover {
  color: var(--accent-dark);
  background: var(--accent-light);
  border-radius: var(--radius-xl);
}
.add-card__cta .material-symbols-rounded { font-size: 22px; color: var(--accent); }
.add-card__hint { font-size: 12px; font-weight: 400; color: var(--text-3); margin-left: auto; }

.add-form { padding: 14px 16px; }
.add-form__head {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: var(--text);
  margin-bottom: 12px;
}
.add-form__icon { font-size: 18px; color: var(--accent); }
.add-form__close {
  margin-left: auto;
  width: 26px; height: 26px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  transition: all var(--dur-fast);
}
.add-form__close:hover { background: var(--surface-2); color: var(--text); }
.add-form__close .material-symbols-rounded { font-size: 16px; }

.add-form__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.field { display: flex; flex-direction: column; gap: 4px; }
.field__label {
  font-size: 10px; font-weight: 700; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.field__input {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: border-color var(--dur-fast);
}
.field__input:focus { border-color: var(--accent); }

.add-form__preview {
  grid-column: 1 / -1;
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--text-2);
  background: var(--surface-2);
  padding: 8px 12px;
  border-radius: var(--radius-md);
}
.add-form__preview .material-symbols-rounded { font-size: 16px; color: #EF4444; }
.add-form__preview strong { color: var(--text); font-weight: 700; }

.add-form__actions { display: flex; gap: 8px; justify-content: flex-end; }

/* Section header */
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; }
.section-count {
  font-size: 12px; font-weight: 600; color: var(--text-3);
  background: var(--surface-3); padding: 4px 10px; border-radius: 99px;
}

.day-list { display: flex; flex-direction: column; gap: 10px; }

.day-group {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow var(--dur-fast);
}
.day-group:hover { box-shadow: var(--shadow-sm); }
.day-group--today { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.day-group--past { opacity: 0.78; }

.day-group__header {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}
.day-badge {
  width: 42px; height: 42px;
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: var(--surface-3);
  flex-shrink: 0;
}
.day-badge--today { background: var(--accent); }
.day-badge__abbr { font-size: 10px; font-weight: 700; color: var(--text-3); text-transform: uppercase; }
.day-badge--today .day-badge__abbr { color: var(--navy); }
.day-badge__num { font-family: var(--font-display); font-size: 15px; font-weight: 800; color: var(--text); }
.day-badge--today .day-badge__num { color: var(--navy); }

.day-group__meta { flex: 1; min-width: 0; }
.day-group__name { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
.day-group__total { font-size: 11px; color: var(--text-3); }
.day-group__total--rest { color: var(--text-3); font-style: italic; }

.day-group__add {
  width: 30px; height: 30px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  transition: all var(--dur-fast);
  flex-shrink: 0;
}
.day-group__add:hover { background: var(--accent-light); color: var(--accent-dark); }
.day-group__add .material-symbols-rounded { font-size: 18px; }

/* Session rows */
.day-sessions { display: flex; flex-direction: column; }
.session-row {
  display: flex; align-items: stretch; gap: 10px;
  padding: 10px 14px 10px 16px;
  cursor: pointer;
  transition: background var(--dur-fast);
  border-bottom: 1px solid var(--border);
  outline: none;
  position: relative;
  overflow: hidden;
}
.session-row:last-child { border-bottom: none; }
.session-row:hover { background: var(--surface-2); }
.session-row:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }

.session-row__color-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--row-color);
}
.session-row__icon {
  width: 34px; height: 34px;
  border-radius: var(--radius-sm-plus);
  background: color-mix(in srgb, var(--row-color) 12%, transparent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; align-self: flex-start;
  margin-top: 2px;
}
.session-row__icon .material-symbols-rounded { font-size: 17px; color: var(--row-color); }

.session-row__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.session-row__title-line { display: flex; align-items: center; gap: 8px; }
.session-row__label { font-size: 14px; font-weight: 600; color: var(--text); }
.session-row__meta { font-size: 11px; color: var(--text-3); }

.session-row__chips {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin-top: 2px;
}
.chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 600;
  color: var(--text-2);
  background: var(--surface-2);
  padding: 3px 7px;
  border-radius: 99px;
  white-space: nowrap;
}
.chip .material-symbols-rounded { font-size: 12px; color: var(--text-3); }
.chip--accent { background: var(--accent-light); color: var(--accent-dark); }
.chip--accent .material-symbols-rounded { color: var(--accent-dark); }

.session-row__right {
  display: flex; flex-direction: column;
  align-items: flex-end; justify-content: center; gap: 2px;
  white-space: nowrap;
}
.session-row__kcal { font-size: 13px; font-weight: 700; color: var(--text); }
.session-row__pct { font-size: 10px; color: var(--text-3); }

.session-row__del {
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  opacity: 0;
  align-self: center;
  transition: all var(--dur-fast);
}
.session-row:hover .session-row__del { opacity: 1; }
.session-row__del:hover { background: var(--danger-soft-bg); color: var(--danger); }
.session-row__del .material-symbols-rounded { font-size: 16px; }

.day-empty {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px;
  font-size: 12px;
  color: var(--text-3);
  font-style: italic;
  background: transparent;
  cursor: pointer;
  transition: all var(--dur-fast);
}
.day-empty:hover { background: var(--surface-2); color: var(--accent-dark); font-style: normal; }
.day-empty .material-symbols-rounded { font-size: 16px; }

/* ─── RIGHT COLUMN (no scroll) ───────────────────────── */
.sessions-right {
  display: flex; flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}
.card__head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.card__title { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--text); }
.card__hint { font-size: 11px; color: var(--text-3); }

/* Stats card */
.streak-pill {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700;
  padding: 3px 8px;
  border-radius: 99px;
  background: linear-gradient(135deg, #FF7A35, #EF4444);
  color: white;
}
.streak-pill .material-symbols-rounded { font-size: 13px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.stat-mini {
  text-align: center;
  padding: 8px 4px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; gap: 1px;
}
.stat-mini__num {
  font-family: var(--font-display); font-size: 18px; font-weight: 800;
  color: var(--text); line-height: 1.1;
}
.stat-mini__num--warn { color: var(--warning); }
.stat-mini__unit { font-size: 11px; font-weight: 600; color: var(--text-3); }
.stat-mini__label {
  font-size: 9px; color: var(--text-3); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.4px;
  white-space: nowrap;
}
.stat-mini__delta { font-size: 10px; font-weight: 700; }
.delta--up { color: var(--accent-dark); }
.delta--down { color: #EF4444; }
.delta--flat { color: var(--text-3); }

.meta-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  font-size: 11px; color: var(--text-3);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}
.meta-row strong { color: var(--text); font-weight: 700; }
.meta-sep { color: var(--text-3); }

/* Type distribution (compact) */
.type-dist__list { display: flex; flex-direction: column; gap: 8px; max-height: 165px; overflow-y: auto; }
.type-dist__list::-webkit-scrollbar { width: 3px; }
.type-dist__list::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

.type-row { display: flex; flex-direction: column; gap: 3px; }
.type-row__head { display: flex; align-items: center; gap: 6px; }
.type-row__icon {
  width: 22px; height: 22px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--td-color) 15%, transparent);
  display: flex; align-items: center; justify-content: center;
}
.type-row__icon .material-symbols-rounded { font-size: 13px; color: var(--td-color); }
.type-row__label { font-size: 12px; font-weight: 600; color: var(--text); flex: 1; }
.type-row__count { font-size: 11px; font-weight: 700; color: var(--td-color); }
.type-row__bar { height: 4px; background: var(--surface-3); border-radius: 99px; overflow: hidden; }
.type-row__fill { height: 100%; background: var(--td-color); border-radius: 99px; transition: width 0.6s var(--ease); }
.type-row__meta { display: flex; flex-wrap: wrap; gap: 4px; font-size: 10px; color: var(--text-3); }

.empty-hint { font-size: 11px; color: var(--text-3); padding: 4px 0; }

/* Rhythm card */
.rhythm-block { display: flex; flex-direction: column; gap: 5px; }
.rhythm-block + .rhythm-block { margin-top: 10px; }
.rhythm-block__title {
  font-size: 10px; font-weight: 700; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.5px;
}

.bar-stack {
  display: flex; height: 16px;
  border-radius: 99px;
  overflow: hidden;
  background: var(--surface-3);
}
.bar-stack__seg {
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 800; color: white;
  transition: width 0.6s var(--ease);
  min-width: 0;
}
.bar-stack__seg--low  { background: #10B981; }
.bar-stack__seg--mid  { background: #F59E0B; }
.bar-stack__seg--high { background: #EF4444; }

.legend { display: flex; gap: 10px; font-size: 10px; color: var(--text-3); }
.legend__item { display: inline-flex; align-items: center; gap: 4px; }
.legend__dot { width: 8px; height: 8px; border-radius: 50%; }
.legend__dot--low  { background: #10B981; }
.legend__dot--mid  { background: #F59E0B; }
.legend__dot--high { background: #EF4444; }

.tod-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.tod-cell {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 8px 4px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  transition: all var(--dur-fast);
}
.tod-cell--top {
  background: var(--accent-light);
  outline: 1.5px solid var(--accent);
}
.tod-cell .material-symbols-rounded { font-size: 16px; color: var(--text-3); }
.tod-cell--top .material-symbols-rounded { color: var(--accent-dark); }
.tod-cell__count {
  font-family: var(--font-display); font-size: 14px; font-weight: 800;
  color: var(--text); line-height: 1;
}
.tod-cell__label {
  font-size: 9px; font-weight: 600; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.3px;
}

/* Library wrapper takes remaining space */
.library-wrap {
  flex: 1;
  min-height: 200px;
  overflow: hidden;
  display: flex;
}
.library-wrap > * { flex: 1; min-height: 0; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-fast);
}
.btn--primary { background: var(--accent); color: var(--navy); }
.btn--primary:hover { background: var(--accent-dark); }
.btn--ghost {
  background: transparent;
  color: var(--text-3);
  border: 1px solid var(--border);
}
.btn--ghost:hover { color: var(--text); background: var(--surface-2); }
.btn .material-symbols-rounded { font-size: 16px; }

/* ─── View switcher ──────────────────────────────────── */
.view-switch {
  position: relative;
  display: inline-flex;
  align-self: center;
  margin: 12px auto 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 4px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.view-switch__btn {
  position: relative;
  z-index: 1;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-3);
  background: transparent;
  cursor: pointer;
  transition: color var(--dur-fast);
}
.view-switch__btn:hover { color: var(--text-2); }
.view-switch__btn--active { color: var(--navy); }
.view-switch__btn .material-symbols-rounded { font-size: 17px; }
.view-switch__indicator {
  position: absolute;
  top: 4px; bottom: 4px; left: 4px;
  width: calc(50% - 4px);
  background: var(--accent);
  border-radius: 99px;
  box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.view-switch__indicator--advanced { transform: translateX(100%); }
.view-switch__badge {
  font-size: 9px; font-weight: 800;
  padding: 2px 6px;
  border-radius: 99px;
  background: var(--navy);
  color: var(--accent);
  letter-spacing: 0.5px;
  margin-left: 2px;
}
.view-switch__btn--active .view-switch__badge { background: var(--navy); color: var(--accent); }

/* TSS */
.adv-tss { display: flex; flex-direction: column; gap: 6px; }
.adv-tss__num { display: flex; align-items: baseline; gap: 10px; }
.adv-tss__val {
  font-family: var(--font-display); font-size: 32px; font-weight: 800;
  color: white; line-height: 1;
}
.adv-tss__zone {
  font-size: 11px; font-weight: 700;
  padding: 3px 8px;
  border-radius: 99px;
}
.adv-zone--low  { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
.adv-zone--good { background: rgba(0, 200, 150, 0.18); color: var(--accent); }
.adv-zone--warn { background: rgba(255, 122, 53, 0.22); color: #FFB070; }
.adv-zone--risk { background: rgba(239, 68, 68, 0.25); color: #FF8B8B; }

.adv-tss__scale {
  position: relative;
  display: flex;
  height: 8px;
  border-radius: 99px;
  overflow: hidden;
  background: rgba(255,255,255,0.08);
}
.adv-tss__seg { flex: 1; }
.adv-tss__seg--low  { background: rgba(255,255,255,0.15); flex: 2; }
.adv-tss__seg--good { background: rgba(0, 200, 150, 0.55);  flex: 3; }
.adv-tss__seg--warn { background: rgba(255, 122, 53, 0.55); flex: 2; }
.adv-tss__seg--risk { background: rgba(239, 68, 68, 0.55);  flex: 1; }
.adv-tss__marker {
  position: absolute;
  top: -3px;
  width: 3px; height: 14px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.25);
  transition: left 0.4s var(--ease);
}
.adv-tss__labels {
  display: flex; justify-content: space-between;
  font-size: 9px; color: rgba(255,255,255,0.4);
  font-variant-numeric: tabular-nums;
}

/* Polarization */
.polar {
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-template-rows: auto auto auto;
  gap: 4px 10px;
  align-items: center;
}
.polar__ring {
  grid-row: 1 / span 3;
  width: 60px; height: 60px;
  border-radius: 50%;
  background: conic-gradient(var(--accent) var(--easy), rgba(239, 68, 68, 0.7) 0);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative;
}
.polar__ring::after {
  content: '';
  position: absolute; inset: 6px;
  border-radius: 50%;
  background: var(--navy);
}
.polar__num {
  position: relative; z-index: 1;
  font-family: var(--font-display); font-size: 16px; font-weight: 800;
  color: white;
  line-height: 1;
}
.polar__num small { font-size: 10px; font-weight: 700; }
.polar__sub {
  position: relative; z-index: 1;
  font-size: 9px; color: rgba(255,255,255,0.6);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.polar__legend { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.85); }
.polar__dot { width: 8px; height: 8px; border-radius: 50%; }
.polar__dot--easy { background: var(--accent); }
.polar__dot--hard { background: #EF4444; }
.polar__verdict {
  grid-column: 1 / -1;
  font-size: 10px; font-weight: 600;
  margin-top: 2px;
}
.polar__verdict--ok  { color: var(--accent); }
.polar__verdict--off { color: #FFB070; }

/* Density */
.dens { display: flex; flex-direction: column; gap: 6px; }
.dens__num {
  font-family: var(--font-display); font-size: 26px; font-weight: 800;
  color: white; line-height: 1;
}
.dens__num small { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); }
.dens__bar {
  height: 6px; border-radius: 99px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}
.dens__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #00A0D4);
  border-radius: 99px;
  transition: width 0.6s var(--ease);
}
.dens__hint { font-size: 10px; color: rgba(255,255,255,0.4); }

/* Recovery gap */
.gap { display: flex; flex-direction: column; gap: 4px; }
.gap__num {
  font-family: var(--font-display); font-size: 26px; font-weight: 800;
  color: white; line-height: 1;
}
.gap__num small { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); }
.gap__num--na { color: rgba(255,255,255,0.3); }
.gap__hint { font-size: 10px; color: rgba(255,255,255,0.5); }

/* HR zones */
.zones-bar {
  display: flex;
  height: 22px;
  border-radius: 99px;
  overflow: hidden;
  background: rgba(255,255,255,0.06);
}
.zones-bar__seg {
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: white;
  min-width: 0;
  transition: flex-grow 0.6s var(--ease);
}
.zones-bar__seg--z1 { background: #64748B; }
.zones-bar__seg--z2 { background: #10B981; }
.zones-bar__seg--z3 { background: #F59E0B; }
.zones-bar__seg--z4 { background: #F97316; }
.zones-bar__seg--z5 { background: #EF4444; }

.zones-legend {
  display: flex; flex-wrap: wrap; gap: 6px 14px;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
}
.zones-legend__item { display: inline-flex; align-items: center; gap: 4px; }
.zones-legend__item strong { color: white; font-weight: 800; }
.zones-legend__dot { width: 7px; height: 7px; border-radius: 50%; }
.zones-legend__dot--z1 { background: #64748B; }
.zones-legend__dot--z2 { background: #10B981; }
.zones-legend__dot--z3 { background: #F59E0B; }
.zones-legend__dot--z4 { background: #F97316; }
.zones-legend__dot--z5 { background: #EF4444; }

/* ─── ADVANCED VIEW ───────────────────────────────────── */
.adv-view {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 24px 24px;
  display: flex; flex-direction: column;
  gap: 14px;
}
.adv-view::-webkit-scrollbar { width: 4px; }
.adv-view::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

/* Top KPI row */
.adv-kpi-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
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
}
.adv-kpi__title {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.85);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.adv-kpi__hint {
  font-size: 10px; font-weight: 500;
  color: rgba(255,255,255,0.4);
  text-transform: none; letter-spacing: 0;
}

/* Risk variant */
.adv-kpi--risk { padding-bottom: 14px; }
.adv-kpi--good { background: linear-gradient(135deg, #064E3B 0%, #065F46 100%); }
.adv-kpi--warn { background: linear-gradient(135deg, #7C2D12 0%, #9A3412 100%); }
.adv-kpi--risk-tone, .adv-kpi[data-risk='risk'] { /* placeholder */ }
.adv-kpi--low  { background: linear-gradient(135deg, #1F2937 0%, #374151 100%); }
.risk-body { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.risk-icon { font-size: 32px; }
.risk-text { font-family: var(--font-display); font-size: 16px; font-weight: 800; line-height: 1.15; }
.risk-sub { font-size: 11px; color: rgba(255,255,255,0.6); }

/* TSS */
.adv-tss { display: flex; flex-direction: column; gap: 6px; }
.adv-tss__num { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.adv-tss__val {
  font-family: var(--font-display); font-size: 36px; font-weight: 800;
  color: white; line-height: 1;
}
.adv-tss__zone {
  font-size: 11px; font-weight: 700;
  padding: 3px 8px;
  border-radius: 99px;
}
.adv-zone--low  { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
.adv-zone--good { background: rgba(0, 200, 150, 0.18); color: var(--accent); }
.adv-zone--warn { background: rgba(255, 122, 53, 0.22); color: #FFB070; }
.adv-zone--risk { background: rgba(239, 68, 68, 0.25); color: #FF8B8B; }

.adv-tss__scale {
  position: relative;
  display: flex;
  height: 8px;
  border-radius: 99px;
  overflow: hidden;
  background: rgba(255,255,255,0.08);
}
.adv-tss__seg { flex: 1; }
.adv-tss__seg--low  { background: rgba(255,255,255,0.15); flex: 2; }
.adv-tss__seg--good { background: rgba(0, 200, 150, 0.55); flex: 3; }
.adv-tss__seg--warn { background: rgba(255, 122, 53, 0.55); flex: 2; }
.adv-tss__seg--risk { background: rgba(239, 68, 68, 0.55); flex: 1; }
.adv-tss__marker {
  position: absolute; top: -3px;
  width: 3px; height: 14px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.25);
  transition: left 0.4s var(--ease);
}
.adv-tss__labels {
  display: flex; justify-content: space-between;
  font-size: 9px; color: rgba(255,255,255,0.4);
  font-variant-numeric: tabular-nums;
}

/* Polarization */
.polar {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 4px 12px;
  align-items: center;
}
.polar__ring {
  grid-row: 1 / span 3;
  width: 64px; height: 64px;
  border-radius: 50%;
  background: conic-gradient(var(--accent) var(--easy), rgba(239, 68, 68, 0.7) 0);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative;
}
.polar__ring::after {
  content: '';
  position: absolute; inset: 7px;
  border-radius: 50%;
  background: var(--navy);
}
.polar__num {
  position: relative; z-index: 1;
  font-family: var(--font-display); font-size: 17px; font-weight: 800;
  color: white;
  line-height: 1;
}
.polar__num small { font-size: 10px; font-weight: 700; }
.polar__sub {
  position: relative; z-index: 1;
  font-size: 9px; color: rgba(255,255,255,0.6);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.polar__legends { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.polar__legend { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.85); white-space: nowrap; }
.polar__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.polar__dot--easy { background: var(--accent); }
.polar__dot--hard { background: #EF4444; }
.polar__verdict { font-size: 10px; font-weight: 700; margin-top: 2px; }
.polar__verdict--ok  { color: var(--accent); }
.polar__verdict--off { color: #FFB070; }

/* AC:W */
.acw { display: flex; flex-direction: column; gap: 6px; }
.acw__num {
  font-family: var(--font-display); font-size: 32px; font-weight: 800;
  color: white; line-height: 1;
}
.acw__num--low  { color: rgba(255,255,255,0.5); }
.acw__num--good { color: var(--accent); }
.acw__num--warn { color: #FFB070; }
.acw__num--risk { color: #FF8B8B; }
.acw__verdict { font-size: 11px; font-weight: 700; }
.acw__verdict--low  { color: rgba(255,255,255,0.5); }
.acw__verdict--good { color: var(--accent); }
.acw__verdict--warn { color: #FFB070; }
.acw__verdict--risk { color: #FF8B8B; }
.acw__bar {
  position: relative;
  display: flex; height: 6px;
  border-radius: 99px;
  overflow: hidden;
  background: rgba(255,255,255,0.08);
}
.acw__seg { flex: 1; }
.acw__seg--low  { background: rgba(255,255,255,0.15); flex: 2; }
.acw__seg--good { background: rgba(0, 200, 150, 0.55); flex: 1; }
.acw__seg--warn { background: rgba(255, 122, 53, 0.55); flex: 1; }
.acw__seg--risk { background: rgba(239, 68, 68, 0.55); flex: 1; }
.acw__marker {
  position: absolute; top: -3px;
  width: 3px; height: 12px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.25);
  transition: left 0.4s var(--ease);
}
.acw__labels {
  display: flex; justify-content: space-between;
  font-size: 9px; color: rgba(255,255,255,0.4);
  font-variant-numeric: tabular-nums;
}

/* Charts row */
.adv-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.adv-chart {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 12px;
}
.adv-chart--full { grid-column: 1 / -1; }
.adv-chart__head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
}
.adv-chart__title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text); }
.adv-chart__hint { font-size: 11px; color: var(--text-3); }
.adv-chart__empty { font-size: 12px; color: var(--text-3); padding: 8px 0; }

/* TSS per day bars */
.tss-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  height: 160px;
}
.tss-bar {
  display: flex; flex-direction: column; gap: 6px;
  align-items: center; justify-content: flex-end;
}
.tss-bar__col {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--surface-2);
  border-radius: var(--radius-sm-plus);
  overflow: hidden;
  min-height: 0;
}
.tss-bar__fill {
  width: 100%;
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 4px;
  font-size: 10px; font-weight: 800; color: white;
  transition: height 0.6s var(--ease);
  border-radius: var(--radius-sm-plus) var(--radius-sm-plus) 0 0;
}
.tss-bar__fill--low  { background: #94A3B8; color: var(--navy); }
.tss-bar__fill--good { background: var(--accent); color: var(--navy); }
.tss-bar__fill--warn { background: #F97316; }
.tss-bar__fill--risk { background: #EF4444; }
.tss-bar__val { font-variant-numeric: tabular-nums; }
.tss-bar__label {
  font-size: 11px; font-weight: 600; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.tss-bar--today .tss-bar__label { color: var(--accent-dark); }

/* HR Zones bar */
.zones-bar {
  display: flex;
  height: 22px;
  border-radius: 99px;
  overflow: hidden;
  background: var(--surface-3);
}
.zones-bar__seg {
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: white;
  min-width: 0;
  transition: flex-grow 0.6s var(--ease);
}
.zones-bar__seg--z1 { background: #64748B; }
.zones-bar__seg--z2 { background: #10B981; }
.zones-bar__seg--z3 { background: #F59E0B; }
.zones-bar__seg--z4 { background: #F97316; }
.zones-bar__seg--z5 { background: #EF4444; }

.zones-table { display: flex; flex-direction: column; gap: 5px; }
.zones-row {
  display: grid;
  grid-template-columns: 12px 24px 1fr auto auto;
  gap: 8px;
  align-items: center;
  font-size: 12px; color: var(--text-2);
}
.zones-row strong { color: var(--text); font-weight: 800; }
.zones-row__dot { width: 9px; height: 9px; border-radius: 50%; }
.zones-legend__dot--z1 { background: #64748B; }
.zones-legend__dot--z2 { background: #10B981; }
.zones-legend__dot--z3 { background: #F59E0B; }
.zones-legend__dot--z4 { background: #F97316; }
.zones-legend__dot--z5 { background: #EF4444; }
.zones-row__name { color: var(--text-2); }
.zones-row__min { color: var(--text); font-weight: 600; font-variant-numeric: tabular-nums; }
.zones-row__pct { color: var(--text-3); font-variant-numeric: tabular-nums; min-width: 36px; text-align: right; }

/* Heatmap */
.heatmap {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  gap: 4px;
}
.heatmap__corner { background: transparent; }
.heatmap__col-label {
  text-align: center;
  font-size: 10px; font-weight: 700; color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.4px;
  padding-bottom: 2px;
}
.heatmap__col-label--today { color: var(--accent-dark); }
.heatmap__row-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; color: var(--text-2);
}
.heatmap__row-label .material-symbols-rounded { font-size: 14px; color: var(--text-3); }
.heatmap__cell {
  position: relative;
  aspect-ratio: 1.4 / 1;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent) calc(var(--heat) * 80%), var(--surface-2));
  display: flex; align-items: center; justify-content: center;
  transition: background var(--dur-fast);
  cursor: default;
}
.heatmap__cell:hover {
  outline: 2px solid var(--accent);
}
.heatmap__cell-val {
  font-size: 10px; font-weight: 700;
  color: color-mix(in srgb, var(--text) calc(var(--heat) * 100% + 30%), var(--text-3));
  font-variant-numeric: tabular-nums;
}

/* Top sessions list */
.top-list { display: flex; flex-direction: column; gap: 8px; }
.top-row {
  display: grid;
  grid-template-columns: 22px 32px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
}
.top-row__rank {
  font-family: var(--font-display); font-size: 16px; font-weight: 800;
  color: var(--tcolor);
}
.top-row__icon {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm-plus);
  background: color-mix(in srgb, var(--tcolor) 15%, transparent);
  display: flex; align-items: center; justify-content: center;
}
.top-row__icon .material-symbols-rounded { font-size: 16px; color: var(--tcolor); }
.top-row__body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.top-row__label { font-size: 13px; font-weight: 600; color: var(--text); }
.top-row__meta { font-size: 11px; color: var(--text-3); }
.top-row__tss {
  display: flex; flex-direction: column; align-items: flex-end; gap: 1px;
  white-space: nowrap;
}
.top-row__tss strong { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text); }
.top-row__tss span { font-size: 9px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }

/* Mini stats row */
.adv-mini-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.adv-mini {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 14px 16px;
  display: flex; flex-direction: column; gap: 4px;
  box-shadow: var(--shadow-sm);
  position: relative;
}
.adv-mini__icon {
  position: absolute; top: 12px; right: 14px;
  width: 28px; height: 28px;
  border-radius: var(--radius-sm-plus);
  background: var(--accent-light);
  display: flex; align-items: center; justify-content: center;
}
.adv-mini__icon .material-symbols-rounded { font-size: 16px; color: var(--accent-dark); }
.adv-mini__num {
  font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text);
  line-height: 1;
}
.adv-mini__num small { font-size: 12px; font-weight: 700; color: var(--text-3); margin-left: 2px; }
.adv-mini__num--na { color: var(--text-3); }
.adv-mini__label { font-size: 12px; font-weight: 600; color: var(--text-2); }
.adv-mini__hint { font-size: 11px; color: var(--text-3); }

/* Duration bars */
.duration-bars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  height: 140px;
}
.dur-bar {
  display: flex; flex-direction: column; gap: 4px;
  align-items: center;
}
.dur-bar__col {
  flex: 1;
  width: 100%;
  display: flex; align-items: flex-end; justify-content: center;
  background: var(--surface-2);
  border-radius: var(--radius-sm-plus);
  overflow: hidden;
}
.dur-bar__fill {
  width: 70%;
  background: linear-gradient(180deg, var(--accent), #00A0D4);
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 4px;
  border-radius: var(--radius-sm-plus) var(--radius-sm-plus) 0 0;
  font-size: 11px; font-weight: 800; color: var(--navy);
  transition: height 0.6s var(--ease);
}
.dur-bar__label { font-size: 12px; font-weight: 600; color: var(--text); }
.dur-bar__sub { font-size: 10px; color: var(--text-3); }

/* ─── Info button + tooltip + modal ───────────────────── */
.adv-kpi__title-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.adv-chart__title,
.adv-mini__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.info-btn {
  position: relative;
  width: 18px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  color: var(--text-3);
  background: transparent;
  cursor: pointer;
  transition: all var(--dur-fast);
  flex-shrink: 0;
  padding: 0;
}
.info-btn .material-symbols-rounded {
  font-size: 15px;
  font-variation-settings: 'FILL' 0, 'wght' 400;
}
.info-btn:hover {
  color: var(--accent-dark);
  background: var(--accent-light);
}
.info-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
/* Dark variant — for KPI cards with navy background */
.info-btn--dark { color: rgba(255,255,255,0.5); }
.info-btn--dark:hover {
  color: var(--accent);
  background: rgba(0, 200, 150, 0.15);
}

/* Custom tooltip (replaces native title) */
.info-btn::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(2px);
  background: var(--navy);
  color: white;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  padding: 5px 9px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 100;
  box-shadow: var(--shadow-md);
}
.info-btn::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%) translateY(2px);
  border: 4px solid transparent;
  border-top-color: var(--navy);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 100;
}
.info-btn:hover::after,
.info-btn:hover::before,
.info-btn:focus-visible::after,
.info-btn:focus-visible::before {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Modal */
.info-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
  padding: 24px;
}
.info-modal__card {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 64px rgba(0,0,0,0.35);
  padding: 28px 28px 24px;
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 14px;
}
.info-modal__close {
  position: absolute;
  top: 14px; right: 14px;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  background: transparent;
  cursor: pointer;
  transition: all var(--dur-fast);
}
.info-modal__close:hover { background: var(--surface-2); color: var(--text); }
.info-modal__close .material-symbols-rounded { font-size: 18px; }

.info-modal__head { display: flex; align-items: center; gap: 12px; }
.info-modal__icon {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.info-modal__icon .material-symbols-rounded { font-size: 22px; color: var(--accent-dark); }
.info-modal__title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
}

.info-modal__body {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.6;
}

.info-modal__section {
  background: var(--surface-2);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.info-modal__section--example {
  background: var(--accent-light);
  border-left-color: var(--accent-dark);
}
.info-modal__section-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 800;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.info-modal__section-title .material-symbols-rounded {
  font-size: 14px;
  color: var(--accent-dark);
}
/* Equation block — math-styled */
.formula-eq {
  font-family: 'Cambria', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
  text-align: center;
  padding: 14px 16px;
  background: white;
  border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
  border-radius: var(--radius-md);
  letter-spacing: 0.4px;
  line-height: 1.45;
  box-shadow: inset 0 0 0 4px var(--surface);
}

/* Legend grid (key-value pairs) */
.formula-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.formula-legend__item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.formula-legend__label {
  font-size: 11px; font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase; letter-spacing: 0.3px;
}
.formula-legend__value {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 800;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

/* Thresholds — colored pills in a grid */
.threshold-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
}
.threshold-pill {
  display: flex; flex-direction: column; gap: 1px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}
.threshold-pill__range {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.threshold-pill__label {
  font-size: 11px; font-weight: 600;
}
.threshold-pill--low {
  background: color-mix(in srgb, #94A3B8 12%, var(--surface));
  border-color: color-mix(in srgb, #94A3B8 30%, transparent);
}
.threshold-pill--low .threshold-pill__range  { color: var(--text-2); }
.threshold-pill--low .threshold-pill__label  { color: var(--text-3); }
.threshold-pill--good {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}
.threshold-pill--good .threshold-pill__range { color: var(--accent-dark); }
.threshold-pill--good .threshold-pill__label { color: var(--accent-dark); }
.threshold-pill--warn {
  background: color-mix(in srgb, #F97316 12%, var(--surface));
  border-color: color-mix(in srgb, #F97316 35%, transparent);
}
.threshold-pill--warn .threshold-pill__range { color: #C2410C; }
.threshold-pill--warn .threshold-pill__label { color: #C2410C; }
.threshold-pill--risk {
  background: color-mix(in srgb, #EF4444 12%, var(--surface));
  border-color: color-mix(in srgb, #EF4444 35%, transparent);
}
.threshold-pill--risk .threshold-pill__range { color: #B91C1C; }
.threshold-pill--risk .threshold-pill__label { color: #B91C1C; }

/* Decision rules — condition → verdict */
.rule-list { display: flex; flex-direction: column; gap: 6px; }
.rule-row {
  display: grid;
  grid-template-columns: 1fr 18px auto;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.rule-cond {
  font-family: 'Cambria', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 13px;
  color: var(--text);
  background: transparent;
  padding: 0;
}
.rule-arrow { font-size: 16px; color: var(--text-3); }
.rule-verdict {
  font-size: 12px; font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}
.rule-verdict--low  { background: rgba(148, 163, 184, 0.15); color: var(--text-2); }
.rule-verdict--good { background: var(--accent-light); color: var(--accent-dark); }
.rule-verdict--warn { background: rgba(249, 115, 22, 0.15); color: #C2410C; }
.rule-verdict--risk { background: rgba(239, 68, 68, 0.15); color: #B91C1C; }

/* Mapping — from → to */
.mapping-list { display: flex; flex-direction: column; gap: 4px; }
.mapping-row {
  display: grid;
  grid-template-columns: 100px 18px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.mapping-from {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 800;
  color: var(--text);
}
.mapping-arrow { font-size: 16px; color: var(--accent); }
.mapping-to {
  font-family: 'Cambria', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 13px;
  color: var(--text-2);
}
.info-modal__example {
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
}

.info-fade-enter-active, .info-fade-leave-active {
  transition: opacity 0.2s ease;
}
.info-fade-enter-active .info-modal__card,
.info-fade-leave-active .info-modal__card {
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.info-fade-enter-from, .info-fade-leave-to { opacity: 0; }
.info-fade-enter-from .info-modal__card, .info-fade-leave-to .info-modal__card {
  transform: translateY(12px) scale(0.96);
  opacity: 0;
}

@media (max-width: 1100px) {
  .sessions-content { grid-template-columns: 1fr; }
  .sessions-right { order: -1; }
  .adv-kpi-row { grid-template-columns: 1fr 1fr; }
  .adv-charts { grid-template-columns: 1fr; }
  .adv-mini-row { grid-template-columns: repeat(2, 1fr); }
}
</style>

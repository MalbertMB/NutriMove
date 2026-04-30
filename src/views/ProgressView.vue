<template>
  <div class="progress-view">
    <AppTopBar title="Progrés" subtitle="Evolució setmanal del rendiment i la nutrició" />
    <SectionNav
      :items="[
        { label: 'Gràfics de rendiment', target: 'progress-charts', icon: 'bar_chart' },
        { label: 'Historial de sessions', target: 'progress-history', icon: 'history' },
        { label: 'Adherència nutricional', target: 'progress-compliance', icon: 'verified' }
      ]"
    />

    <div class="progress-content">
      <!-- Chart placeholders (functional bars) -->
      <div id="progress-charts" class="chart-row" tabindex="-1">
        <div class="chart-card">
          <h3 class="chart-title">Kcal cremades / setmana</h3>
          <div class="bar-chart">
            <div v-for="(week, i) in kcalHistory" :key="i" class="bar-col">
              <div class="bar-col__bar-wrap">
                <div
                  class="bar-col__bar"
                  :style="{ height: (week.kcal / 4000 * 100) + '%' }"
                  :class="{ 'bar-col__bar--current': i === kcalHistory.length - 1 }"
                  :title="`${week.kcal} kcal`"
                ></div>
              </div>
              <span class="bar-col__label">{{ week.label }}</span>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">Sessions / setmana</h3>
          <div class="bar-chart">
            <div v-for="(week, i) in sessionsHistory" :key="i" class="bar-col">
              <div class="bar-col__bar-wrap">
                <div
                  class="bar-col__bar bar-col__bar--purple"
                  :style="{ height: (week.count / 7 * 100) + '%' }"
                  :class="{ 'bar-col__bar--current': i === sessionsHistory.length - 1 }"
                  :title="`${week.count} sessions`"
                ></div>
              </div>
              <span class="bar-col__label">{{ week.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PRs and milestones -->
      <div id="progress-history" class="milestones" tabindex="-1">
        <h3 class="milestones__title">Fites recents</h3>
        <div class="milestones__list">
          <div v-for="m in milestones" :key="m.id" class="milestone-item animate-fadeInUp">
            <div class="milestone-icon">
              <span class="material-symbols-rounded icon-fill">{{ m.icon }}</span>
            </div>
            <div class="milestone-body">
              <span class="milestone-title">{{ m.title }}</span>
              <span class="milestone-date">{{ m.date }}</span>
            </div>
            <span class="milestone-value">{{ m.value }}</span>
          </div>
        </div>
      </div>

      <!-- Nutrition compliance -->
      <div id="progress-compliance" class="compliance-card" tabindex="-1">
        <h3 class="compliance-title">Adherència nutricional</h3>
        <div class="compliance-weeks">
          <div v-for="(w, i) in complianceWeeks" :key="i" class="compliance-week">
            <span class="compliance-week__label">{{ w.label }}</span>
            <div class="compliance-week__bar">
              <div
                class="compliance-week__fill"
                :style="{ width: w.pct + '%', background: w.pct >= 80 ? 'var(--accent)' : w.pct >= 60 ? '#F59E0B' : '#EF4444' }"
              ></div>
            </div>
            <span class="compliance-week__pct">{{ w.pct }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppTopBar from '@/components/layout/AppTopBar.vue'
import SectionNav from '@/components/ui/SectionNav.vue'

const kcalHistory = [
  { label: 'S-5', kcal: 2200 }, { label: 'S-4', kcal: 2800 }, { label: 'S-3', kcal: 2400 },
  { label: 'S-2', kcal: 3100 }, { label: 'S-1', kcal: 2700 }, { label: 'Ara', kcal: 3480 }
]
const sessionsHistory = [
  { label: 'S-5', count: 3 }, { label: 'S-4', count: 5 }, { label: 'S-3', count: 4 },
  { label: 'S-2', count: 6 }, { label: 'S-1', count: 5 }, { label: 'Ara', count: 4 }
]
const milestones = [
  { id: 1, icon: 'emoji_events', title: 'Ruta més llarga', date: '13 abr', value: '87 km' },
  { id: 2, icon: 'timer', title: 'Millor temps 10k', date: '9 abr', value: '48:23' },
  { id: 3, icon: 'fitness_center', title: 'PR Squat', date: '5 abr', value: '100 kg' },
  { id: 4, icon: 'pool', title: 'Natació consecutiva', date: '1 abr', value: '21 dies' }
]
const complianceWeeks = [
  { label: 'Fa 4 setmanes', pct: 65 }, { label: 'Fa 3 setmanes', pct: 72 },
  { label: 'Fa 2 setmanes', pct: 80 }, { label: 'La setmana passada', pct: 88 }, { label: 'Aquesta setmana', pct: 71 }
]
</script>

<style scoped>
.progress-view { display: flex; flex-direction: column; }
.progress-content { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.chart-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 20px; }

.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 160px; }
.bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; height: 100%; }
.bar-col__bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.bar-col__bar {
  width: 100%;
  background: var(--surface-3);
  border-radius: var(--radius-xs) var(--radius-xs) 0 0;
  transition: height 1s var(--ease);
  min-height: 4px;
}
.bar-col__bar--current { background: var(--accent); }
.bar-col__bar--purple { background: var(--purple-light-strong); }
.bar-col__bar--purple.bar-col__bar--current { background: var(--purple); }
.bar-col__label { font-size: 10px; color: var(--text-3); font-weight: 500; }

/* Milestones */
.milestones {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.milestones__title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 16px; }
.milestones__list { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.milestone-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  transition: all var(--dur-fast);
}
.milestone-item:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.milestone-icon {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-light), var(--purple-light));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.milestone-icon .material-symbols-rounded { font-size: 20px; color: var(--accent); }
.milestone-body { flex: 1; }
.milestone-title { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
.milestone-date { font-size: 11px; color: var(--text-3); }
.milestone-value { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text); white-space: nowrap; }

/* Compliance */
.compliance-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.compliance-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 16px; }
.compliance-weeks { display: flex; flex-direction: column; gap: 10px; }
.compliance-week { display: grid; grid-template-columns: 180px 1fr 40px; align-items: center; gap: 12px; }
.compliance-week__label { font-size: 13px; color: var(--text-2); }
.compliance-week__bar { height: 8px; background: var(--surface-3); border-radius: 99px; overflow: hidden; }
.compliance-week__fill { height: 100%; border-radius: 99px; transition: width 1s var(--ease); }
.compliance-week__pct { font-size: 13px; font-weight: 700; color: var(--text); text-align: right; }
</style>

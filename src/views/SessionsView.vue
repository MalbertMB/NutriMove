<template>
  <div class="sessions-view">
    <AppTopBar
      title="Sessions"
      subtitle="Gestiona i planifica els teus entrenaments"
      :show-save="true"
      @save="uiStore.showToast('Sessions desades.', 'success')"
    />

    <div class="sessions-content">
      <!-- Left: week overview by day -->
      <div id="sessions-list" class="sessions-left" tabindex="-1">
        <div class="section-header">
          <h2 class="section-title">Aquesta setmana</h2>
          <span class="section-count">{{ weekStore.sessions.length }} sessions</span>
        </div>

        <div class="day-list">
          <div
            v-for="(day, i) in weekStore.daysFull"
            :key="i"
            class="day-group"
            :class="{ 'day-group--today': i === todayIndex }"
          >
            <div class="day-group__header">
              <div class="day-badge" :class="{ 'day-badge--today': i === todayIndex }">
                <span class="day-badge__abbr">{{ weekStore.days[i] }}</span>
                <span class="day-badge__num">{{ getDayNum(i) }}</span>
              </div>
              <div class="day-group__meta">
                <span class="day-group__name">{{ day }}</span>
                <span class="day-group__total" v-if="weekStore.sessionsByDay[i]?.length > 0">
                  {{ weekStore.sessionsByDay[i].reduce((s, sess) => s + sess.kcal, 0) }} kcal
                </span>
              </div>
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
                  <span class="session-row__label">{{ session.label }}</span>
                  <span class="session-row__meta">{{ formatDuration(session.duration) }} · {{ session.intensity }}</span>
                </div>
                <div class="session-row__kcal">{{ session.kcal }} kcal</div>
                <LoadBadge :level="session.load" />
                <button
                  class="session-row__del"
                  @click.stop="removeSession(session.id)"
                  :aria-label="`Eliminar sessió ${session.label}`"
                >
                  <span class="material-symbols-rounded">delete_outline</span>
                </button>
              </div>
            </div>

            <div v-else class="day-empty">
              <span>Dia de descans</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: stats panel -->
      <aside id="sessions-summary" class="sessions-right" tabindex="-1">
        <div class="stats-card">
          <h3 class="stats-card__title">Resum setmanal</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-item__num">{{ totals.totalSessions }}</span>
              <span class="stat-item__label">Sessions</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__num">{{ totals.totalKcalBurned }}</span>
              <span class="stat-item__label">Kcal cremades</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__num">{{ totalHours }}</span>
              <span class="stat-item__label">Hores totals</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__num" :class="{ 'stat-item__num--warn': totals.highLoadDays > 2 }">
                {{ totals.highLoadDays }}
              </span>
              <span class="stat-item__label">Dies càrrega alta</span>
            </div>
          </div>
        </div>

        <!-- Type distribution -->
        <div class="type-dist">
          <h3 class="type-dist__title">Distribució per tipus</h3>
          <div class="type-dist__list">
            <div
              v-for="(count, type) in typeDistribution"
              :key="type"
              class="type-dist__item"
              :style="{ '--td-color': weekStore.sessionTypes[type]?.color }"
            >
              <div class="type-dist__icon">
                <span class="material-symbols-rounded">{{ weekStore.sessionTypes[type]?.icon }}</span>
              </div>
              <span class="type-dist__label">{{ weekStore.sessionTypes[type]?.label }}</span>
              <span class="type-dist__count">{{ count }}</span>
              <div class="type-dist__bar">
                <div
                  class="type-dist__fill"
                  :style="{ width: (count / weekStore.sessions.length * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div id="sessions-library">
          <SessionLibrary />
        </div>
      </aside>
    </div>

    <SessionEditPanel />
    <AIPopover />
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  start.setDate(today.getDate() - todayIndex.value + dayIdx)
  return start.getDate()
}

function getColor(type) { return weekStore.sessionTypes[type]?.color ?? 'var(--purple)' }
function getIcon(type) { return weekStore.sessionTypes[type]?.icon ?? 'fitness_center' }

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function removeSession(id) {
  weekStore.removeSession(id)
  uiStore.showToast('Sessió eliminada.', 'info')
}

const totals = computed(() => weekStore.getWeekTotals())

const totalHours = computed(() => {
  const mins = weekStore.sessions.reduce((s, sess) => s + sess.duration, 0)
  return (mins / 60).toFixed(1)
})

const typeDistribution = computed(() => {
  const dist = {}
  weekStore.sessions.forEach(s => {
    dist[s.type] = (dist[s.type] || 0) + 1
  })
  return dist
})
</script>

<style scoped>
.sessions-view { display: flex; flex-direction: column; }

.sessions-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  padding: 24px;
  align-items: start;
}

/* Left column */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
.section-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  background: var(--surface-3);
  padding: 4px 10px;
  border-radius: 99px;
}

.day-list { display: flex; flex-direction: column; gap: 12px; }

.day-group {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow var(--dur-fast);
}
.day-group:hover { box-shadow: var(--shadow-sm); }
.day-group--today { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }

.day-group__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}
.day-badge {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: var(--surface-3);
  flex-shrink: 0;
}
.day-badge--today { background: var(--accent); }
.day-badge__abbr { font-size: 10px; font-weight: 700; color: var(--text-3); text-transform: uppercase; }
.day-badge--today .day-badge__abbr { color: var(--navy); }
.day-badge__num { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text); }
.day-badge--today .day-badge__num { color: var(--navy); }

.day-group__meta { flex: 1; }
.day-group__name { display: block; font-size: 14px; font-weight: 600; color: var(--text); }
.day-group__total { font-size: 12px; color: var(--text-3); }

/* Session rows */
.day-sessions { display: flex; flex-direction: column; }
.session-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
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
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--row-color);
}
.session-row__icon {
  width: 34px; height: 34px;
  border-radius: var(--radius-sm-plus);
  background: color-mix(in srgb, var(--row-color) 12%, transparent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.session-row__icon .material-symbols-rounded { font-size: 17px; color: var(--row-color); }

.session-row__body { flex: 1; min-width: 0; }
.session-row__label { display: block; font-size: 14px; font-weight: 500; color: var(--text); }
.session-row__meta { font-size: 12px; color: var(--text-3); }
.session-row__kcal { font-size: 13px; font-weight: 600; color: var(--text-2); white-space: nowrap; }

.session-row__del {
  width: 30px; height: 30px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-3);
  opacity: 0;
  transition: all var(--dur-fast);
}
.session-row:hover .session-row__del { opacity: 1; }
.session-row__del:hover { background: var(--danger-soft-bg); color: var(--danger); }
.session-row__del .material-symbols-rounded { font-size: 16px; }

.day-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
  font-style: italic;
}

/* Right column */
.sessions-right { display: flex; flex-direction: column; gap: 16px; }

.stats-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.stats-card__title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 16px; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-item { text-align: center; padding: 12px; background: var(--surface-2); border-radius: var(--radius-md); }
.stat-item__num { display: block; font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text); }
.stat-item__num--warn { color: var(--warning); }
.stat-item__label { font-size: 11px; color: var(--text-3); font-weight: 500; }

/* Type distribution */
.type-dist {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.type-dist__title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 14px; }
.type-dist__list { display: flex; flex-direction: column; gap: 10px; }
.type-dist__item {
  display: grid;
  grid-template-columns: 28px 1fr auto 100px;
  align-items: center;
  gap: 8px;
}
.type-dist__icon {
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--td-color) 15%, transparent);
  display: flex; align-items: center; justify-content: center;
}
.type-dist__icon .material-symbols-rounded { font-size: 14px; color: var(--td-color); }
.type-dist__label { font-size: 13px; font-weight: 500; color: var(--text); }
.type-dist__count { font-size: 12px; font-weight: 700; color: var(--td-color); }
.type-dist__bar { height: 4px; background: var(--surface-3); border-radius: 99px; overflow: hidden; }
.type-dist__fill { height: 100%; background: var(--td-color); border-radius: 99px; transition: width 0.8s var(--ease); }
</style>

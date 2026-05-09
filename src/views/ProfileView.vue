<template>
  <div class="profile-view">
    <AppTopBar title="Jo" subtitle="Perfil, preferències i configuració" />

    <div class="profile-content">
      <!-- ═══ HERO ═══════════════════════════════════════════════════ -->
      <section id="profile-overview" class="profile-hero" tabindex="-1">
        <div class="profile-hero__bg" aria-hidden="true"></div>

        <div class="profile-hero__main">
          <div class="profile-avatar" aria-hidden="true">{{ initials }}</div>

          <div class="profile-info">
            <div class="profile-info__head">
              <h2 class="profile-name">{{ displayName }}</h2>
              <span class="mode-badge" :class="`mode-badge--${uiStore.userMode}`">
                <span class="material-symbols-rounded icon-fill">
                  {{ uiStore.userMode === 'advanced' ? 'science' : 'auto_awesome' }}
                </span>
                Mode {{ uiStore.userMode === 'advanced' ? 'Avançat' : 'Simple' }}
              </span>
            </div>
            <p class="profile-meta">{{ profileMeta }}</p>
            <div class="profile-tags">
              <span v-for="t in sportTags" :key="t.label" class="profile-tag">
                <span class="material-symbols-rounded">{{ t.icon }}</span>
                {{ t.label }}
              </span>
            </div>
          </div>

          <div class="profile-hero__actions">
            <button class="btn btn--outline">
              <span class="material-symbols-rounded">edit</span>
              Editar perfil
            </button>
          </div>
        </div>

        <div class="profile-hero__stats">
          <div
            v-for="(s, i) in heroStats"
            :key="s.label"
            class="hero-stat"
            :style="{ animationDelay: i * 60 + 'ms' }"
          >
            <span class="hero-stat__icon">
              <span class="material-symbols-rounded icon-fill">{{ s.icon }}</span>
            </span>
            <div class="hero-stat__body">
              <span class="hero-stat__value">
                {{ s.value }}<small v-if="s.unit"> {{ s.unit }}</small>
              </span>
              <span class="hero-stat__label">{{ s.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ Personal data + Goals ══════════════════════════════════ -->
      <div class="profile-grid profile-grid--two">
        <section id="profile-data" class="profile-card" tabindex="-1">
          <header class="profile-card__head">
            <h3 class="profile-card__title">
              <span class="material-symbols-rounded icon-fill">badge</span>
              Dades personals
            </h3>
            <button class="btn btn--ghost btn--sm">
              <span class="material-symbols-rounded">edit</span>
              Editar
            </button>
          </header>

          <div class="data-list">
            <div v-for="d in personalData" :key="d.label" class="data-row">
              <span class="data-row__label">
                <span class="material-symbols-rounded" aria-hidden="true">{{ d.icon }}</span>
                {{ d.label }}
              </span>
              <span class="data-row__value">
                {{ d.value }}
                <small
                  v-if="d.delta"
                  class="data-row__delta"
                  :class="`data-row__delta--${d.delta.dir}`"
                >{{ d.delta.text }}</small>
              </span>
            </div>
          </div>
        </section>

        <section id="profile-goal" class="profile-card" tabindex="-1">
          <header class="profile-card__head">
            <h3 class="profile-card__title">
              <span class="material-symbols-rounded icon-fill">flag</span>
              Objectius
            </h3>
          </header>

          <div class="goals-list">
            <div v-for="g in goals" :key="g.label" class="goal-item">
              <span class="material-symbols-rounded icon-fill goal-item__check">check_circle</span>
              <span>{{ g.label }}</span>
            </div>
          </div>

          <div class="goal-field">
            <label class="goal-field__label" for="personal-goal">Objectiu personal</label>
            <textarea
              id="personal-goal"
              v-model="personalGoal"
              class="goal-field__input"
              placeholder="Vull..."
              rows="3"
            ></textarea>
          </div>
        </section>
      </div>

      <!-- ═══ Sport profile + AI prefs ══════════════════════════════ -->
      <div class="profile-grid profile-grid--two">
        <section id="profile-sport" class="profile-card" tabindex="-1">
          <header class="profile-card__head">
            <h3 class="profile-card__title">
              <span class="material-symbols-rounded icon-fill">exercise</span>
              Perfil esportiu
            </h3>
            <span class="card-subtitle">Estimacions per a la IA</span>
          </header>

          <div class="data-list">
            <div v-for="d in sportData" :key="d.label" class="data-row">
              <span class="data-row__label">
                <span class="material-symbols-rounded" aria-hidden="true">{{ d.icon }}</span>
                {{ d.label }}
              </span>
              <span class="data-row__value">{{ d.value }}</span>
            </div>
          </div>
        </section>

        <section id="profile-ai" class="profile-card" tabindex="-1">
          <header class="profile-card__head">
            <h3 class="profile-card__title">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              Preferències de l'assistent
            </h3>
          </header>

          <div class="toggle-list">
            <div v-for="pref in prefs" :key="pref.key" class="toggle-row">
              <div class="toggle-row__body">
                <span class="toggle-row__label">
                  <span class="material-symbols-rounded toggle-row__icon">{{ pref.icon }}</span>
                  {{ pref.label }}
                </span>
                <span class="toggle-row__desc">{{ pref.desc }}</span>
              </div>
              <button
                class="toggle-btn"
                :class="{ 'toggle-btn--on': pref.value }"
                @click="pref.value = !pref.value"
                :aria-pressed="pref.value"
                :aria-label="`${pref.value ? 'Desactivar' : 'Activar'} ${pref.label}`"
              >
                <span class="toggle-btn__dot"></span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- ═══ Display mode (full-width) ═══════════════════════════════ -->
      <section id="profile-mode" class="profile-card profile-card--accent" tabindex="-1">
        <header class="profile-card__head">
          <h3 class="profile-card__title">
            <span class="material-symbols-rounded icon-fill">tune</span>
            Mode de visualització
          </h3>
          <span class="badge-pro">PRO</span>
        </header>

        <p class="profile-card__lead">
          Tria com vols veure NutriMove. El mode <strong>Simple</strong> mostra l'essencial i guia l'usuari pas a pas.
          El mode <strong>Avançat</strong> activa anàlisi tècnic i mètriques addicionals a totes les pantalles que ho suporten.
        </p>

        <div class="mode-toggle" role="radiogroup" aria-label="Mode de visualització">
          <button
            type="button"
            class="mode-toggle__option"
            :class="{ 'mode-toggle__option--active': uiStore.userMode === 'simple' }"
            @click="uiStore.setUserMode('simple')"
            role="radio"
            :aria-checked="uiStore.userMode === 'simple'"
          >
            <span class="mode-toggle__icon">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
            </span>
            <span class="mode-toggle__copy">
              <span class="mode-toggle__title">Simple</span>
              <span class="mode-toggle__sub">Vista neta i guiada per al dia a dia</span>
            </span>
          </button>
          <button
            type="button"
            class="mode-toggle__option"
            :class="{ 'mode-toggle__option--active': uiStore.userMode === 'advanced' }"
            @click="uiStore.setUserMode('advanced')"
            role="radio"
            :aria-checked="uiStore.userMode === 'advanced'"
          >
            <span class="mode-toggle__icon">
              <span class="material-symbols-rounded icon-fill">science</span>
            </span>
            <span class="mode-toggle__copy">
              <span class="mode-toggle__title">Avançat</span>
              <span class="mode-toggle__sub">Mètriques i anàlisi tècnic per a esportistes</span>
            </span>
          </button>
          <span
            class="mode-toggle__indicator"
            :class="`mode-toggle__indicator--${uiStore.userMode}`"
            aria-hidden="true"
          ></span>
        </div>

        <div class="mode-pages">
          <h4 class="mode-pages__title">
            <span class="material-symbols-rounded">layers</span>
            Pàgines amb vista avançada
          </h4>
          <div class="mode-pages__list">
            <div
              v-for="p in uiStore.advancedViewPages"
              :key="p.key"
              class="mode-page"
              :class="{ 'mode-page--soon': !p.enabled }"
            >
              <span class="mode-page__icon">
                <span class="material-symbols-rounded icon-fill">{{ p.icon }}</span>
              </span>
              <div class="mode-page__body">
                <div class="mode-page__name-row">
                  <span class="mode-page__name">{{ p.label }}</span>
                  <span
                    class="mode-page__status"
                    :class="{ 'mode-page__status--ok': p.enabled }"
                  >
                    {{ p.enabled ? 'Disponible' : 'Properament' }}
                  </span>
                </div>
                <span class="mode-page__desc">{{ p.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ Privacy / data ═════════════════════════════════════════ -->
      <section id="profile-privacy" class="profile-card" tabindex="-1">
        <header class="profile-card__head">
          <h3 class="profile-card__title">
            <span class="material-symbols-rounded icon-fill">shield_lock</span>
            Privacitat i dades
          </h3>
        </header>

        <div class="action-list">
          <button class="action-row" @click="onExport">
            <span class="action-row__icon">
              <span class="material-symbols-rounded">file_download</span>
            </span>
            <div class="action-row__body">
              <span class="action-row__title">Exporta les meves dades</span>
              <span class="action-row__desc">Descarrega un JSON amb sessions, àpats i preferències.</span>
            </div>
            <span class="material-symbols-rounded action-row__chev">chevron_right</span>
          </button>

          <button class="action-row" @click="onClearAi">
            <span class="action-row__icon action-row__icon--soft">
              <span class="material-symbols-rounded">cleaning_services</span>
            </span>
            <div class="action-row__body">
              <span class="action-row__title">Esborra historial IA</span>
              <span class="action-row__desc">Elimina les recomanacions desades de l'assistent NutriMove.</span>
            </div>
            <span class="material-symbols-rounded action-row__chev">chevron_right</span>
          </button>

          <button class="action-row action-row--danger" @click="onLogout">
            <span class="action-row__icon action-row__icon--danger">
              <span class="material-symbols-rounded">logout</span>
            </span>
            <div class="action-row__body">
              <span class="action-row__title">Tanca sessió</span>
              <span class="action-row__desc">Acabes la sessió com a {{ displayName }}.</span>
            </div>
            <span class="material-symbols-rounded action-row__chev">chevron_right</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const uiStore = useUIStore()
const authStore = useAuthStore()
const router = useRouter()

const displayName = computed(() => authStore.user?.name || 'Pau Martínez')
const initials = computed(() => {
  const parts = (displayName.value || '').split(/\s+/).filter(Boolean)
  const i = (parts[0]?.[0] || 'P') + (parts[1]?.[0] || '')
  return i.toUpperCase()
})

const profileMeta = computed(() => '35 anys · 1,81 m · 78 kg · Catalunya')

const sportTags = [
  { label: 'Ciclisme', icon: 'directions_bike' },
  { label: 'Natació', icon: 'pool' },
  { label: 'Força', icon: 'fitness_center' },
]

const heroStats = [
  { label: 'Entrenant des de', value: '4', unit: 'anys', icon: 'event_available' },
  { label: 'Sessions/setmana', value: '5', unit: 'mitjana', icon: 'fitness_center' },
  { label: 'Streak nutrició', value: '23', unit: 'dies', icon: 'local_fire_department' },
  { label: 'Plans creats', value: '38', unit: '', icon: 'view_kanban' },
]

const personalData = [
  { label: 'Edat', value: '35 anys', icon: 'cake' },
  { label: 'Pes', value: '78 kg', icon: 'monitor_weight', delta: { dir: 'up', text: '+0,4 kg' } },
  { label: 'Alçada', value: '181 cm', icon: 'height' },
  { label: 'TMB estimat', value: '1.840 kcal/dia', icon: 'bolt' },
  { label: 'Objectiu calòric', value: '2.200 kcal/dia', icon: 'restaurant_menu' },
  { label: "Nivell d'activitat", value: 'Alt (5–6 dies/setmana)', icon: 'trending_up' },
]

const goals = [
  { label: 'Mantenir el rendiment esportiu' },
  { label: 'Millorar la recuperació entre sessions' },
  { label: 'Nutrició sense càrrega cognitiva' },
  { label: 'Planificació setmanal en < 5 minuts' },
]

const personalGoal = ref('Vull mantenir el rendiment i recuperar millor.')

const sportData = [
  { label: 'Esports preferits', value: 'Ciclisme, Natació, Força', icon: 'sports' },
  { label: 'FTP estimat', value: '220 W', icon: 'electric_bolt' },
  { label: 'FC màxima', value: '186 bpm', icon: 'favorite' },
  { label: 'FC en repòs', value: '58 bpm', icon: 'monitor_heart' },
  { label: 'Llindar (Z4)', value: '170 bpm', icon: 'speed' },
  { label: 'Hores objectiu/sem.', value: '6 h', icon: 'schedule' },
]

const prefs = reactive([
  {
    key: 'proactive',
    icon: 'notifications_active',
    label: 'Notificacions proactives',
    desc: "L'assistent IA t'avisa quan detecta riscos nutricionals o de càrrega.",
    value: true,
  },
  {
    key: 'justify',
    icon: 'rule',
    label: 'Justificació visible',
    desc: 'Mostra sempre el motiu darrere de cada recomanació.',
    value: true,
  },
  {
    key: 'autoAdj',
    icon: 'autorenew',
    label: "Ajust automàtic d'àpats",
    desc: 'Actualitza la nutrició automàticament en canviar una sessió.',
    value: false,
  },
  {
    key: 'weekly',
    icon: 'mail',
    label: 'Resum setmanal',
    desc: 'Rep un resum de rendiment cada dilluns al matí.',
    value: true,
  },
])

function onExport() {
  uiStore.showToast('Exportació iniciada. Rebràs el fitxer per correu.', 'info')
}
function onClearAi() {
  uiStore.adviceHistory.length = 0
  uiStore.showToast("Historial de l'assistent esborrat.", 'success')
}
function onLogout() {
  authStore.logout()
  uiStore.showToast('Sessió tancada.', 'info')
  router.push('/login')
}
</script>

<style scoped>
.profile-view { display: flex; flex-direction: column; }

.profile-content {
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ═══ HERO ════════════════════════════════════════════════════════ */
.profile-hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 60%, var(--navy-3) 100%);
  box-shadow: var(--shadow-md);
  isolation: isolate;
}
.profile-hero__bg {
  position: absolute;
  inset: -45% -15% auto auto;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0, 200, 150, 0.28), rgba(0, 200, 150, 0));
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
}
.profile-hero__main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 30px 30px 24px;
}
.profile-avatar {
  width: 78px; height: 78px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #00A0D4);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  color: var(--navy);
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 22px rgba(0, 200, 150, 0.28);
}
.profile-info { flex: 1; min-width: 0; }
.profile-info__head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.profile-name {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.01em;
}
.profile-meta {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.profile-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 600;
}
.profile-tag .material-symbols-rounded { font-size: 13px; color: var(--accent); }

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.mode-badge .material-symbols-rounded { font-size: 13px; }
.mode-badge--simple {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.mode-badge--advanced {
  background: var(--accent);
  color: var(--navy);
  box-shadow: 0 0 0 1px var(--accent), 0 4px 12px rgba(0, 200, 150, 0.4);
}

.profile-hero__actions { flex-shrink: 0; }

.profile-hero__stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.hero-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 22px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  animation: fadeInUp 0.4s var(--ease) both;
}
.hero-stat:last-child { border-right: none; }
.hero-stat__icon {
  width: 38px; height: 38px;
  border-radius: var(--radius-md);
  background: rgba(0, 200, 150, 0.18);
  color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hero-stat__icon .material-symbols-rounded { font-size: 18px; }
.hero-stat__body { display: flex; flex-direction: column; min-width: 0; }
.hero-stat__value {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  color: white;
  line-height: 1.1;
}
.hero-stat__value small {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  margin-left: 2px;
}
.hero-stat__label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* ═══ GRID ════════════════════════════════════════════════════════ */
.profile-grid { display: grid; gap: 16px; }
.profile-grid--two { grid-template-columns: 1fr 1fr; }

@media (max-width: 1100px) {
  .profile-grid--two { grid-template-columns: 1fr; }
  .profile-hero__stats { grid-template-columns: repeat(2, 1fr); }
  .hero-stat:nth-child(2) { border-right: none; }
  .hero-stat:nth-child(1),
  .hero-stat:nth-child(2) { border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
}
@media (max-width: 720px) {
  .profile-hero__main { flex-wrap: wrap; }
  .profile-hero__actions { width: 100%; }
  .profile-hero__stats { grid-template-columns: 1fr; }
  .hero-stat { border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
  .hero-stat:last-child { border-bottom: none; }
}

/* ═══ CARD ════════════════════════════════════════════════════════ */
.profile-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.profile-card--accent {
  background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--accent) 5%, var(--surface)) 100%);
  border-color: color-mix(in srgb, var(--accent) 28%, var(--border));
}
.profile-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.profile-card__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
.profile-card__title .material-symbols-rounded {
  font-size: 18px;
  color: var(--accent);
}
.card-subtitle {
  font-size: 11px;
  color: var(--text-3);
  font-weight: 500;
}
.profile-card__lead {
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.55;
}
.profile-card__lead strong { color: var(--text); font-weight: 700; }

.btn--sm { padding: 7px 12px; font-size: 12px; }
.btn--sm .material-symbols-rounded { font-size: 14px; }

.badge-pro {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.6px;
  padding: 3px 8px;
  border-radius: 99px;
  background: linear-gradient(135deg, var(--navy), var(--navy-2));
  color: var(--accent);
  text-transform: uppercase;
}

/* ═══ DATA LIST ═══════════════════════════════════════════════════ */
.data-list { display: flex; flex-direction: column; }
.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid var(--border);
}
.data-row:last-child { border-bottom: none; }
.data-row__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-2);
}
.data-row__label .material-symbols-rounded {
  font-size: 15px;
  color: var(--text-3);
}
.data-row__value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.data-row__delta {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  letter-spacing: 0.3px;
}
.data-row__delta--up { background: var(--accent-light); color: var(--accent-dark); }
.data-row__delta--down { background: var(--warning-light); color: var(--warning); }

/* ═══ GOALS ═══════════════════════════════════════════════════════ */
.goals-list { display: flex; flex-direction: column; gap: 8px; }
.goal-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}
.goal-item__check { color: var(--accent); font-size: 16px; flex-shrink: 0; }

.goal-field { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.goal-field__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.goal-field__input {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text);
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  resize: vertical;
  min-height: 84px;
  outline: none;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}
.goal-field__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.14);
}
.goal-field__input::placeholder { color: var(--text-3); }

/* ═══ TOGGLE LIST ═════════════════════════════════════════════════ */
.toggle-list { display: flex; flex-direction: column; }
.toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.toggle-row:last-child { border-bottom: none; }
.toggle-row__body { flex: 1; min-width: 0; }
.toggle-row__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.toggle-row__icon { font-size: 15px; color: var(--text-3); }
.toggle-row__desc {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 3px;
  display: block;
  line-height: 1.4;
}

.toggle-btn {
  width: 42px; height: 24px;
  border-radius: 99px;
  background: var(--surface-3);
  border: 2px solid var(--border);
  position: relative;
  cursor: pointer;
  transition: all var(--dur-med);
  flex-shrink: 0;
}
.toggle-btn--on { background: var(--accent); border-color: var(--accent); }
.toggle-btn__dot {
  position: absolute;
  top: 1px; left: 1px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform var(--dur-med) var(--ease-back);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.toggle-btn--on .toggle-btn__dot { transform: translateX(18px); }

/* ═══ MODE TOGGLE (segmented control) ═════════════════════════════ */
.mode-toggle {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  isolation: isolate;
}
.mode-toggle__indicator {
  position: absolute;
  top: 4px; bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  background: var(--surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform var(--dur-med) var(--ease);
  z-index: 0;
}
.mode-toggle__indicator--simple { transform: translateX(0); }
.mode-toggle__indicator--advanced { transform: translateX(100%); }

.mode-toggle__option {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  color: var(--text-3);
  transition: color var(--dur-fast);
}
.mode-toggle__option--active { color: var(--text); }
.mode-toggle__option--active .mode-toggle__icon {
  background: var(--accent-light);
  color: var(--accent);
}
.mode-toggle__icon {
  width: 38px; height: 38px;
  border-radius: var(--radius-md);
  background: var(--surface-3);
  color: var(--text-3);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all var(--dur-fast);
}
.mode-toggle__icon .material-symbols-rounded { font-size: 20px; }
.mode-toggle__copy { display: flex; flex-direction: column; min-width: 0; }
.mode-toggle__title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
}
.mode-toggle__sub {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}
.mode-toggle__option--active .mode-toggle__sub { color: var(--text-2); }

/* ═══ MODE PAGES (registry list) ══════════════════════════════════ */
.mode-pages { margin-top: 4px; }
.mode-pages__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-2);
  margin-bottom: 12px;
}
.mode-pages__title .material-symbols-rounded { font-size: 14px; color: var(--accent); }
.mode-pages__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}
.mode-page {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  transition: border-color var(--dur-fast), background var(--dur-fast);
}
.mode-page:not(.mode-page--soon):hover {
  border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
}
.mode-page--soon { opacity: 0.78; }
.mode-page__icon {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm-plus);
  background: var(--accent-light);
  color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mode-page--soon .mode-page__icon { background: var(--surface-3); color: var(--text-3); }
.mode-page__icon .material-symbols-rounded { font-size: 16px; }
.mode-page__body { flex: 1; min-width: 0; }
.mode-page__name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.mode-page__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.mode-page__status {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 2px 6px;
  border-radius: 99px;
  background: var(--surface-3);
  color: var(--text-3);
  white-space: nowrap;
}
.mode-page__status--ok { background: var(--accent-light); color: var(--accent-dark); }
.mode-page__desc {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 4px;
  line-height: 1.45;
  display: block;
}

/* ═══ ACTION LIST (privacy / data) ════════════════════════════════ */
.action-list { display: flex; flex-direction: column; gap: 4px; }
.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  text-align: left;
  cursor: pointer;
  transition: all var(--dur-fast);
}
.action-row:hover {
  background: var(--surface-2);
  border-color: var(--border);
}
.action-row__icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.action-row__icon--soft { background: var(--surface-3); color: var(--text-2); }
.action-row__icon--danger { background: var(--danger-soft-bg); color: var(--danger); }
.action-row__icon .material-symbols-rounded { font-size: 18px; }
.action-row__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.action-row__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.action-row__desc {
  font-size: 11px;
  color: var(--text-3);
}
.action-row__chev {
  color: var(--text-3);
  font-size: 18px;
  transition: transform var(--dur-fast);
}
.action-row:hover .action-row__chev { transform: translateX(2px); color: var(--text-2); }
.action-row--danger:hover { border-color: var(--danger-soft-border); background: var(--danger-soft-bg); }
.action-row--danger:hover .action-row__title { color: var(--danger-soft-text); }

/* ═══ Keyframes ═══════════════════════════════════════════════════ */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<template>
  <div class="profile-view">
    <AppTopBar title="Jo" subtitle="Les meves dades i preferències" />
    <div class="profile-content">
      <!-- Profile hero -->
      <div class="profile-hero">
        <div class="profile-avatar">P</div>
        <div class="profile-info">
          <h2 class="profile-name">Pau Martínez</h2>
          <p class="profile-meta">35 anys · Mode Avançat · Ciclisme, Natació, Força</p>
        </div>
        <button class="btn btn--outline">
          <span class="material-symbols-rounded">edit</span>
          Editar perfil
        </button>
      </div>

      <div class="profile-grid">
        <!-- Personal data -->
        <div id="profile-data" class="profile-section" tabindex="-1">
          <h3 class="profile-section__title">Dades personals</h3>
          <div class="data-list">
            <div v-for="d in personalData" :key="d.label" class="data-row">
              <span class="data-row__label">{{ d.label }}</span>
              <span class="data-row__value">{{ d.value }}</span>
            </div>
          </div>
        </div>

        <!-- Goals -->
        <div id="profile-goal" class="profile-section" tabindex="-1">
          <h3 class="profile-section__title">Objectius</h3>
          <div class="goals-list">
            <div v-for="g in goals" :key="g.label" class="goal-item">
              <span class="material-symbols-rounded icon-fill" style="color:var(--accent)">radio_button_checked</span>
              {{ g.label }}
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
        </div>

        <!-- Preferences -->
        <div id="profile-settings" class="profile-section" tabindex="-1">
          <h3 class="profile-section__title">Preferències IA</h3>
          <div class="toggle-list">
            <div v-for="pref in prefs" :key="pref.key" class="toggle-row">
              <div class="toggle-row__body">
                <span class="toggle-row__label">{{ pref.label }}</span>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import AppTopBar from '@/components/layout/AppTopBar.vue'

const personalData = [
  { label: 'Edat', value: '35 anys' },
  { label: 'Pes', value: '78 kg' },
  { label: 'Alçada', value: '181 cm' },
  { label: 'TMB estimat', value: '1.840 kcal/dia' },
  { label: 'Objectiu calòric diari', value: '2.200 kcal' },
  { label: 'Nivell d\'activitat', value: 'Alt (5–6 dies/setmana)' }
]

const goals = [
  { label: 'Mantenir el rendiment esportiu' },
  { label: 'Millorar la recuperació entre sessions' },
  { label: 'Nutrició sense càrrega cognitiva' },
  { label: 'Planificació setmanal en < 5 minuts' }
]

const personalGoal = ref('Vull mantenir el rendiment i recuperar millor.')

const prefs = reactive([
  { key: 'proactive', label: 'Notificacions proactives', desc: 'L\'assistent IA et notifica quan detecta riscos nutricionals.', value: true },
  { key: 'justify', label: 'Justificació visible', desc: 'Mostra sempre el motiu de cada recomanació.', value: true },
  { key: 'autoAdj', label: 'Ajust automàtic d\'àpats', desc: 'Actualitza la nutrició automàticament en canviar una sessió.', value: false },
  { key: 'weekly', label: 'Resum setmanal', desc: 'Rep un resum de rendiment cada dilluns.', value: true },
])
</script>

<style scoped>
.profile-view { display: flex; flex-direction: column; }
.profile-content { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.profile-hero {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 100%);
  border-radius: var(--radius-xl);
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.profile-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #00A0D4);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 28px; font-weight: 800;
  color: var(--navy); flex-shrink: 0;
}
.profile-info { flex: 1; }
.profile-name { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: white; }
.profile-meta { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; cursor: pointer; transition: all var(--dur-fast); }
.btn--outline { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.2); }
.btn--outline:hover { background: rgba(255,255,255,0.16); color: white; }

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.profile-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: var(--shadow-sm);
}
.profile-section__title { font-family: var(--font-display); font-size: 15px; font-weight: 700; margin-bottom: 16px; }

/* Data list */
.data-list { display: flex; flex-direction: column; gap: 0; }
.data-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
.data-row:last-child { border-bottom: none; }
.data-row__label { font-size: 13px; color: var(--text-2); }
.data-row__value { font-size: 13px; font-weight: 600; color: var(--text); }

/* Goals */
.goals-list { display: flex; flex-direction: column; gap: 10px; }
.goal-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text); }
.goal-item .material-symbols-rounded { font-size: 16px; flex-shrink: 0; }

/* Toggle list */
.toggle-list { display: flex; flex-direction: column; gap: 16px; }
.toggle-row { display: flex; align-items: center; gap: 12px; }
.toggle-row__body { flex: 1; }
.toggle-row__label { display: block; font-size: 13px; font-weight: 500; color: var(--text); }
.toggle-row__desc { font-size: 11px; color: var(--text-3); margin-top: 1px; display: block; }

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
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.toggle-btn--on .toggle-btn__dot { transform: translateX(18px); }

.goal-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
}

.goal-field__label {
  font-size: 11px;
  font-weight: 600;
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

.goal-field__input::placeholder {
  color: var(--text-3);
}
</style>

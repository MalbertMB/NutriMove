<template>
  <main class="signup-page">
    <section class="signup-card">
      <div class="signup-head">
        <div class="signup-logo">
          <span class="material-symbols-rounded icon-fill">bolt</span>
        </div>
        <h1>Crea el teu compte</h1>
        <p>Configura NutriMove amb les teves dades personals.</p>
      </div>

      <div class="step-indicator">
        <div class="step" :class="{ active: step === 1, done: step > 1 }">
          <span class="step__num">{{ step > 1 ? '✓' : '1' }}</span>
          <span class="step__label">Compte</span>
        </div>
        <div class="step-line" :class="{ done: step > 1 }"></div>
        <div class="step" :class="{ active: step === 2, done: step > 2 }">
          <span class="step__num">{{ step > 2 ? '✓' : '2' }}</span>
          <span class="step__label">Perfil</span>
        </div>
        <div class="step-line" :class="{ done: step > 2 }"></div>
        <div class="step" :class="{ active: step === 3 }">
          <span class="step__num">3</span>
          <span class="step__label">Objectius</span>
        </div>
      </div>

      <form v-if="step === 1" class="signup-form" @submit.prevent="nextStep">
        <label class="field">
          <span>Nom complet</span>
          <input v-model="form.name" type="text" placeholder="Pau Martínez" required />
        </label>
        <label class="field">
          <span>Correu electrònic</span>
          <input v-model="form.email" type="email" placeholder="tu@exemple.com" required />
        </label>
        <label class="field">
          <span>Contrasenya</span>
          <input v-model="form.password" type="password" placeholder="Mínim 6 caràcters" required />
        </label>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button class="btn-primary" type="submit">Continua</button>
      </form>

      <form v-else-if="step === 2" class="signup-form" @submit.prevent="nextStep2">
        <div class="field-row">
          <label class="field">
            <span>Edat</span>
            <input v-model.number="form.age" type="number" min="10" max="99" placeholder="25" required />
          </label>
          <label class="field">
            <span>Gènere</span>
            <select v-model="form.gender">
              <option value="M">Home</option>
              <option value="F">Dona</option>
            </select>
          </label>
        </div>
        <div class="field-row">
          <label class="field">
            <span>Pes (kg)</span>
            <input v-model.number="form.weight" type="number" min="30" max="250" step="0.5" placeholder="70" required />
          </label>
          <label class="field">
            <span>Alçada (cm)</span>
            <input v-model.number="form.height" type="number" min="100" max="250" placeholder="175" required />
          </label>
        </div>

        <label class="field">
          <span>Nivell d'activitat</span>
          <select v-model="form.activityLevel">
            <option v-for="opt in ACTIVITY_OPTIONS" :key="opt.key" :value="opt.key">
              {{ opt.label }} – {{ opt.desc }}
            </option>
          </select>
        </label>

        <div class="field">
          <span class="field-label">Esports preferits</span>
          <div class="sports-grid">
            <button
              v-for="sport in SPORT_OPTIONS"
              :key="sport.key"
              type="button"
              class="sport-chip"
              :class="{ 'sport-chip--active': form.sports.includes(sport.key) }"
              @click="toggleSport(sport.key)"
            >
              <span class="material-symbols-rounded">{{ sport.icon }}</span>
              {{ sport.label }}
            </button>
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="btn-row">
          <button type="button" class="btn-back" @click="step = 1">Enrere</button>
          <button class="btn-primary" type="submit">Continua</button>
        </div>
      </form>

      <form v-else-if="step === 3" class="signup-form" @submit.prevent="handleSubmit">
        <div class="field">
          <span class="field-label">Objectius principals</span>
          <p class="field-hint">Selecciona els que s'adapten al teu cas (pots triar-ne més d'un).</p>
          <div class="goals-grid">
            <button
              v-for="goal in GOAL_OPTIONS"
              :key="goal.key"
              type="button"
              class="goal-chip"
              :class="{ 'goal-chip--active': form.goals.includes(goal.key) }"
              @click="toggleGoal(goal.key)"
            >
              <span class="material-symbols-rounded">{{ goal.icon }}</span>
              {{ goal.label }}
            </button>
          </div>
        </div>

        <div class="field">
          <span class="field-label">Objectiu personal <span class="field-optional">(opcional)</span></span>
          <textarea
            v-model="form.personalGoal"
            class="goal-textarea"
            placeholder="Vull..."
            rows="3"
          ></textarea>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="btn-row">
          <button type="button" class="btn-back" @click="step = 2">Enrere</button>
          <button class="btn-primary" type="submit">Crea el compte</button>
        </div>
      </form>

      <p class="hint">
        Ja tens compte?
        <router-link to="/login">Inicia sessió</router-link>
      </p>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, ACTIVITY_OPTIONS, SPORT_OPTIONS, GOAL_OPTIONS } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useWeekStore } from '@/stores/weekStore'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const weekStore = useWeekStore()

const step = ref(1)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  age: null,
  gender: 'M',
  weight: null,
  height: null,
  activityLevel: 'moderat',
  sports: [],
  goals: [],
  personalGoal: '',
})

function nextStep() {
  if (!form.name.trim()) { error.value = 'Introdueix el teu nom.'; return }
  if (!form.email.trim()) { error.value = 'Introdueix el teu correu.'; return }
  if (form.password.length < 6) { error.value = 'La contrasenya ha de tenir almenys 6 caràcters.'; return }
  error.value = ''
  step.value = 2
}

function nextStep2() {
  if (!form.age || form.age < 10) { error.value = 'Introdueix una edat vàlida.'; return }
  if (!form.weight || form.weight < 30) { error.value = 'Introdueix un pes vàlid.'; return }
  if (!form.height || form.height < 100) { error.value = 'Introdueix una alçada vàlida.'; return }
  error.value = ''
  step.value = 3
}

function toggleSport(key) {
  const idx = form.sports.indexOf(key)
  if (idx === -1) form.sports.push(key)
  else form.sports.splice(idx, 1)
}

function toggleGoal(key) {
  const idx = form.goals.indexOf(key)
  if (idx === -1) form.goals.push(key)
  else form.goals.splice(idx, 1)
}

function handleSubmit() {
  error.value = ''
  authStore.signup(form)
  weekStore.resetForNewUser(authStore.caloricGoal)
  uiStore.showToast(`Benvingut/da, ${form.name.split(' ')[0]}!`, 'success')
  router.push('/dashboard')
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 15% 20%, rgba(0, 184, 230, 0.18), transparent 35%),
    radial-gradient(circle at 85% 10%, rgba(99, 102, 241, 0.16), transparent 35%),
    var(--surface-2);
}

.signup-card {
  width: min(460px, 100%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: 28px;
  animation: fadeInUp 0.35s var(--ease) both;
}

.signup-head {
  text-align: center;
  margin-bottom: 20px;
}

.signup-logo {
  width: 52px;
  height: 52px;
  margin: 0 auto 10px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--accent);
}

.signup-logo .material-symbols-rounded { color: var(--navy); font-size: 28px; }

h1 { font-family: var(--font-display); font-size: 24px; margin: 0; }
p { margin: 6px 0 0; color: var(--text-3); font-size: 13px; }

/* Step indicator */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.step__num {
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  transition: all var(--dur-fast);
  flex-shrink: 0;
}

.step.active .step__num {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--navy);
}

.step.done .step__num {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent-dark);
}

.step__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
}

.step.active .step__label,
.step.done .step__label { color: var(--text); }

.step-line {
  flex: 1;
  height: 2px;
  background: var(--border);
  border-radius: 1px;
  transition: background var(--dur-fast);
}

.step-line.done { background: var(--accent); }

/* Form */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field > span, .field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
}

.field input, .field select {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text);
  padding: 11px 12px;
  font-size: 14px;
  font-family: var(--font-body);
}

.field input:focus, .field select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.16);
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Sports */
.sports-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.sport-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-fast);
  font-family: var(--font-body);
}

.sport-chip:hover { border-color: var(--accent); color: var(--accent); }

.sport-chip--active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

.sport-chip .material-symbols-rounded { font-size: 15px; }

/* Goals */
.field-hint {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--text-3);
}

.field-optional {
  font-weight: 400;
  color: var(--text-3);
}

.goals-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.goal-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all var(--dur-fast);
  font-family: var(--font-body);
}

.goal-chip:hover { border-color: var(--accent); color: var(--accent); }

.goal-chip--active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
}

.goal-chip .material-symbols-rounded { font-size: 16px; flex-shrink: 0; }

.goal-textarea {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text);
  padding: 11px 12px;
  font-size: 14px;
  font-family: var(--font-body);
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}

.goal-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.16);
}

.goal-textarea::placeholder { color: var(--text-3); }

/* Buttons */
.btn-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  margin-top: 4px;
}

.btn-primary {
  margin-top: 4px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--navy);
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: filter var(--dur-fast);
}

.btn-primary:hover { filter: brightness(0.95); }

.btn-back {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-2);
  padding: 12px;
  font-weight: 600;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--dur-fast);
}

.btn-back:hover { background: var(--surface-2); border-color: var(--text-3); }

.error-msg { margin: 0; font-size: 12px; color: #ef4444; }

.hint {
  text-align: center;
  font-size: 12px;
  margin-top: 16px;
  color: var(--text-3);
}

.hint a { color: var(--accent); font-weight: 600; text-decoration: none; }
.hint a:hover { text-decoration: underline; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

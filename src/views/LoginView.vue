<template>
  <main class="login-page">
    <section class="login-card">
      <div class="login-head">
        <div class="login-logo">
          <span class="material-symbols-rounded icon-fill">bolt</span>
        </div>
        <h1>Inici de sessió</h1>
        <p>Accedeix a NutriMove per gestionar entrenament i nutrició.</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span>Correu</span>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="pau@nutrimove.app"
            required
          />
        </label>

        <label class="field">
          <span>Contrasenya</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="123456"
            required
          />
        </label>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button class="btn-login" type="submit">Entrar</button>
      </form>

      <p class="hint">Demo: pau@nutrimove.app / 123456</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const email = ref('pau@nutrimove.app')
const password = ref('123456')
const error = ref('')

function handleSubmit() {
  const result = authStore.login(email.value, password.value)

  if (!result.ok) {
    error.value = result.message
    return
  }

  error.value = ''
  uiStore.showToast('Sessió iniciada.', 'success')
  router.push('/dashboard')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 15% 20%, rgba(0, 184, 230, 0.18), transparent 35%),
    radial-gradient(circle at 85% 10%, rgba(99, 102, 241, 0.16), transparent 35%),
    var(--surface-2);
}

.login-card {
  width: min(420px, 100%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: 28px;
  animation: fadeInUp 0.35s var(--ease) both;
}

.login-head {
  text-align: center;
  margin-bottom: 20px;
}

.login-logo {
  width: 52px;
  height: 52px;
  margin: 0 auto 10px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--accent);
}

.login-logo .material-symbols-rounded {
  color: var(--navy);
  font-size: 28px;
}

h1 {
  font-family: var(--font-display);
  font-size: 26px;
  margin: 0;
}

p {
  margin: 6px 0 0;
  color: var(--text-3);
  font-size: 13px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
}

.field input {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text);
  padding: 11px 12px;
  font-size: 14px;
}

.field input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 184, 230, 0.16);
}

.btn-login {
  margin-top: 4px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--navy);
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: filter var(--dur-fast);
}

.btn-login:hover {
  filter: brightness(0.95);
}

.error-msg {
  margin: 0;
  font-size: 12px;
  color: #ef4444;
}

.hint {
  text-align: center;
  font-size: 11px;
  margin-top: 14px;
}
</style>

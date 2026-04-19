<template>
  <div class="advice-view">
    <AppTopBar title="Consells" subtitle="Recomanacions personalitzades de l'Assistent NutriMove" />
    <div class="advice-content">
      <div class="advice-list">
        <div
          v-for="tip in tips"
          :key="tip.id"
          class="tip-card"
          :class="`tip-card--${tip.type}`"
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
            <div class="tip-ai-badge">
              <span class="material-symbols-rounded icon-fill">auto_awesome</span>
              IA
            </div>
          </div>
          <h3 class="tip-title">{{ tip.title }}</h3>
          <p class="tip-body">{{ tip.body }}</p>
          <div class="tip-actions">
            <button class="tip-btn tip-btn--primary">Aplica el consell</button>
            <button class="tip-btn tip-btn--ghost">Ara no</button>
          </div>
        </div>
      </div>

      <!-- History sidebar -->
      <aside class="advice-history">
        <h3 class="history-title">Historial de consells</h3>
        <div class="history-list">
          <div v-for="h in history" :key="h.id" class="history-item">
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
import AppTopBar from '@/components/layout/AppTopBar.vue'

const tips = [
  {
    id: 1, type: 'nutrition', icon: 'restaurant', tag: 'Nutrició',
    title: 'Augmenta els hidrats pre-entrenament',
    body: 'La teva sessió de ciclisme de 4h del dissabte requereix una càrrega glucèmica superior. Afegeix 60g de pasta o arròs al sopar del divendres per optimitzar les reserves de glucogen.'
  },
  {
    id: 2, type: 'recovery', icon: 'bedtime', tag: 'Recuperació',
    title: 'Descans actiu recomanat pel dimecres',
    body: 'Després de la sessió doble del dimecres detectem un risc de fatiga acumulada. Un dia de recuperació activa (ioga o natació suau) maximitzaria el rendiment del dijous.'
  },
  {
    id: 3, type: 'performance', icon: 'trending_up', tag: 'Rendiment',
    title: 'Proteïna post-entrenament infrasuficient',
    body: 'Basant-nos en les teves sessions de força, el teu consum proteic actual (~45g/dia) és inferior al recomanat. Considera afegir una font proteica addicional al berenar.'
  }
]

const history = [
  { id: 1, label: 'Hidrats pre-ruta afegits', date: '15 abr', status: 'applied' },
  { id: 2, label: 'Ajust sopar divendres', date: '12 abr', status: 'applied' },
  { id: 3, label: 'Descans dimarts suggerit', date: '8 abr', status: 'ignored' },
  { id: 4, label: '+15% kcal setmana intensa', date: '5 abr', status: 'applied' },
]
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
.tip-card--recovery { border-left: 4px solid #6366F1; }
.tip-card--performance { border-left: 4px solid var(--warning); }

.tip-card__header { display: flex; align-items: center; gap: 10px; }
.tip-icon {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  background: var(--accent-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.tip-card--recovery .tip-icon { background: rgba(99,102,241,0.1); }
.tip-card--performance .tip-icon { background: var(--warning-light); }
.tip-icon .material-symbols-rounded { font-size: 20px; color: var(--accent); }
.tip-card--recovery .tip-icon .material-symbols-rounded { color: #6366F1; }
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

.tip-actions { display: flex; gap: 8px; }
.tip-btn { padding: 9px 16px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; cursor: pointer; transition: all var(--dur-fast); border: none; }
.tip-btn--primary { background: var(--accent); color: var(--navy); }
.tip-btn--primary:hover { background: var(--accent-dark); }
.tip-btn--ghost { background: transparent; color: var(--text-2); border: 1px solid var(--border); }
.tip-btn--ghost:hover { background: var(--surface-2); }

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

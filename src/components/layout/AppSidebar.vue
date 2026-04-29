<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar__logo">
      <div class="logo-mark">
        <span class="material-symbols-rounded icon-fill">bolt</span>
      </div>
      <transition name="fade">
        <span v-if="!collapsed" class="logo-text">NutriMove</span>
      </transition>
    </div>

    <!-- Nav links -->
    <nav class="sidebar__nav" role="navigation" aria-label="Navegació principal">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :aria-label="item.label"
        v-slot="{ isActive }"
      >
        <div class="nav-item__inner" :class="{ active: isActive }">
          <span class="material-symbols-rounded" :class="{ 'icon-fill': isActive }">{{ item.icon }}</span>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-item__label">{{ item.label }}</span>
          </transition>
          <span v-if="isActive && !collapsed" class="nav-item__indicator" aria-hidden="true"></span>
        </div>
      </router-link>
    </nav>

    <!-- User section -->
    <div class="sidebar__user">
      <div class="user-avatar" aria-hidden="true">P</div>
      <transition name="fade">
        <div v-if="!collapsed" class="user-info">
          <span class="user-name">{{ authStore.user?.name || 'Usuari' }}</span>
          <span class="user-meta">{{ authStore.user?.email || 'Sense sessió' }}</span>
        </div>
      </transition>
    </div>

    <button v-if="!collapsed" class="sidebar__logout" @click="handleLogout">
      <span class="material-symbols-rounded">logout</span>
      Tanca sessió
    </button>

    <!-- Collapse toggle -->
    <button
      class="sidebar__toggle"
      @click="collapsed = !collapsed"
      :aria-label="collapsed ? 'Expandir menú' : 'Col·lapsar menú'"
    >
      <span class="material-symbols-rounded">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</span>
    </button>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

const collapsed = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/sessions', label: 'Sessions', icon: 'fitness_center' },
  { to: '/apats', label: 'Àpats', icon: 'restaurant' },
  { to: '/consells', label: 'Consells', icon: 'tips_and_updates' },
  { to: '/progres', label: 'Progrés', icon: 'trending_up' },
  { to: '/jo', label: 'Jo', icon: 'person' },
]

function handleLogout() {
  authStore.logout()
  uiStore.showToast('Sessió tancada.', 'info')
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--navy);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: width var(--dur-med) var(--ease);
  z-index: 100;
  flex-shrink: 0;
}
.sidebar.collapsed { width: 72px; }

/* Logo */
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}
.logo-mark {
  width: 36px;
  height: 36px;
  background: var(--accent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-mark .material-symbols-rounded {
  color: var(--navy);
  font-size: 20px;
}
.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: var(--text-inv);
  white-space: nowrap;
}

/* Nav */
.sidebar__nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.nav-item {
  display: block;
}
.nav-item__inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: rgba(255,255,255,0.5);
  transition: all var(--dur-fast) ease;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}
.nav-item__inner:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.85);
}
.nav-item__inner.active {
  background: var(--accent-light);
  color: var(--accent);
}
.nav-item__inner .material-symbols-rounded { font-size: 20px; flex-shrink: 0; }
.nav-item__label {
  font-size: 14px;
  font-weight: 500;
}
.nav-item__indicator {
  position: absolute;
  right: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

/* User */
.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #00A0D4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  color: var(--navy);
  flex-shrink: 0;
}
.user-info { overflow: hidden; }
.user-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-meta {
  display: block;
  font-size: 11px;
  color: var(--accent);
  white-space: nowrap;
}

/* Toggle */
.sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: rgba(255,255,255,0.3);
  transition: color var(--dur-fast);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.sidebar__toggle:hover { color: rgba(255,255,255,0.7); }
.sidebar__toggle .material-symbols-rounded { font-size: 18px; }

.sidebar__logout {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.06);
  transition: all var(--dur-fast);
  font-size: 13px;
}

.sidebar__logout:hover {
  color: #fff;
  background: rgba(255,255,255,0.12);
}

.sidebar__logout .material-symbols-rounded {
  font-size: 18px;
}
</style>

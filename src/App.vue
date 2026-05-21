<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Saltar al contingut principal</a>
    <AppSidebar v-if="$route.name !== 'login'" />
    <div id="main-content" class="app-main" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </div>
    <BaseToast />
    <div
      id="a11y-live"
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    ></div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import BaseToast from '@/components/ui/BaseToast.vue'
import { useA11yStore } from '@/stores/a11yStore'

// Instantiate so prefs are applied to <html> on mount and listeners are set up.
useA11yStore()
</script>

<style>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--surface-2);
}

.app-main {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
}

/* Page transition */
.page-fade-enter-active {
  animation: fadeInUp 0.3s var(--ease) both;
}
.page-fade-leave-active {
  transition: opacity var(--dur-fast) var(--ease);
}
.page-fade-leave-to {
  opacity: 0;
}
</style>

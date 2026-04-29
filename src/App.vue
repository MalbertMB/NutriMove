<template>
  <div class="app-shell">
    <AppSidebar v-if="$route.name !== 'login'" />
    <div class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </div>
    <BaseToast />
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import BaseToast from '@/components/ui/BaseToast.vue'
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
  transition: opacity 0.15s ease;
}
.page-fade-leave-to {
  opacity: 0;
}
</style>

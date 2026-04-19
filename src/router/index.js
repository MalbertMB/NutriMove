import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import SessionsView from '@/views/SessionsView.vue'
import MealsView from '@/views/MealsView.vue'
import AdviceView from '@/views/AdviceView.vue'
import ProgressView from '@/views/ProgressView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  { path: '/', redirect: '/inici' },
  { path: '/inici', name: 'dashboard', component: DashboardView, meta: { title: 'Inici', icon: 'home' } },
  { path: '/sessions', name: 'sessions', component: SessionsView, meta: { title: 'Sessions', icon: 'fitness_center' } },
  { path: '/apats', name: 'apats', component: MealsView, meta: { title: 'Àpats', icon: 'restaurant' } },
  { path: '/consells', name: 'consells', component: AdviceView, meta: { title: 'Consells', icon: 'tips_and_updates' } },
  { path: '/progres', name: 'progres', component: ProgressView, meta: { title: 'Progrés', icon: 'trending_up' } },
  { path: '/jo', name: 'jo', component: ProfileView, meta: { title: 'Jo', icon: 'person' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

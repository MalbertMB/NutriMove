import { createRouter, createWebHashHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import SessionsView from "@/views/SessionsView.vue";
import MealsView from "@/views/MealsView.vue";
import AdviceView from "@/views/AdviceView.vue";
import ProgressView from "@/views/ProgressView.vue";
import ProfileView from "@/views/ProfileView.vue";
import LoginView from "@/views/LoginView.vue";
import { useAuthStore } from "@/stores/authStore";

const routes = [
	{ path: "/", redirect: "/dashboard" },
	{
		path: "/login",
		name: "login",
		component: LoginView,
		meta: { title: "Login" },
	},
	{
		path: "/dashboard",
		name: "dashboard",
		component: DashboardView,
		meta: { title: "Dashboard", icon: "home", requiresAuth: true },
	},
	{
		path: "/sessions",
		name: "sessions",
		component: SessionsView,
		meta: { title: "Sessions", icon: "fitness_center", requiresAuth: true },
	},
	{
		path: "/apats",
		name: "apats",
		component: MealsView,
		meta: { title: "Àpats", icon: "restaurant", requiresAuth: true },
	},
	{
		path: "/consells",
		name: "consells",
		component: AdviceView,
		meta: {
			title: "Consells",
			icon: "tips_and_updates",
			requiresAuth: true,
		},
	},
	{
		path: "/progres",
		name: "progres",
		component: ProgressView,
		meta: { title: "Progrés", icon: "trending_up", requiresAuth: true },
	},
	{
		path: "/jo",
		name: "jo",
		component: ProfileView,
		meta: { title: "Jo", icon: "person", requiresAuth: true },
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

router.beforeEach((to) => {
	const authStore = useAuthStore();

	if (to.meta.requiresAuth && !authStore.isAuthenticated) {
		return { name: "login" };
	}

	if (to.name === "login" && authStore.isAuthenticated) {
		return { name: "dashboard" };
	}

	return true;
});

export default router;

import { defineStore } from "pinia";
import { computed, ref } from "vue";

const STORAGE_KEY = "nutrimove_auth_user";

export const ACTIVITY_OPTIONS = [
	{ key: "sedentari", label: "Sedentari", desc: "0–1 dies/setmana", multiplier: 1.2 },
	{ key: "lleuger", label: "Lleuger", desc: "1–3 dies/setmana", multiplier: 1.375 },
	{ key: "moderat", label: "Moderat", desc: "3–5 dies/setmana", multiplier: 1.55 },
	{ key: "alt", label: "Alt", desc: "5–6 dies/setmana", multiplier: 1.725 },
	{ key: "molt-alt", label: "Molt alt", desc: "7 dies/setmana", multiplier: 1.9 },
];

export const SPORT_OPTIONS = [
	{ key: "ciclisme", label: "Ciclisme", icon: "directions_bike" },
	{ key: "natacio", label: "Natació", icon: "pool" },
	{ key: "forca", label: "Força", icon: "fitness_center" },
	{ key: "cursa", label: "Cursa", icon: "directions_run" },
	{ key: "ioga", label: "Ioga", icon: "self_improvement" },
	{ key: "escalada", label: "Escalada", icon: "hiking" },
];

export const GOAL_OPTIONS = [
	{ key: "rendiment",     label: "Mantenir el rendiment esportiu",        icon: "trending_up" },
	{ key: "recuperacio",   label: "Millorar la recuperació entre sessions", icon: "self_improvement" },
	{ key: "nutricioSimple",label: "Nutrició sense càrrega cognitiva",       icon: "auto_awesome" },
	{ key: "planificacio",  label: "Planificació setmanal en < 5 minuts",    icon: "calendar_month" },
	{ key: "perdrePes",     label: "Perdre pes",                            icon: "monitor_weight" },
	{ key: "massa",         label: "Guanyar massa muscular",                 icon: "fitness_center" },
	{ key: "competicio",    label: "Rendiment en competició",                icon: "emoji_events" },
];

export const useAuthStore = defineStore("auth", () => {
	const user = ref(loadUser());

	const isAuthenticated = computed(() => Boolean(user.value));

	const tmb = computed(() => {
		if (!user.value) return 0;
		const { weight = 75, height = 175, age = 30, gender = "M" } = user.value;
		const base = 10 * weight + 6.25 * height - 5 * age;
		return Math.round(gender === "F" ? base - 161 : base + 5);
	});

	const caloricGoal = computed(() => {
		if (!user.value) return 0;
		const opt = ACTIVITY_OPTIONS.find((a) => a.key === user.value.activityLevel);
		return Math.round(tmb.value * (opt?.multiplier ?? 1.55));
	});

	const activityLabel = computed(() => {
		if (!user.value) return "";
		const opt = ACTIVITY_OPTIONS.find((a) => a.key === user.value.activityLevel);
		return opt ? `${opt.label} (${opt.desc})` : "";
	});

	const userInitials = computed(() => {
		if (!user.value?.name) return "U";
		const parts = user.value.name.trim().split(/\s+/);
		return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
	});

	function login(email, password) {
		const normalized = String(email || "").trim().toLowerCase();
		const pwd = String(password || "");

		if (normalized === "pau@nutrimove.app" && pwd === "123456") {
			user.value = {
				name: "Pau Martínez",
				email: normalized,
				age: 35,
				weight: 78,
				height: 181,
				gender: "M",
				activityLevel: "alt",
				sports: ["ciclisme", "natacio", "forca"],
				goals: ["rendiment", "recuperacio", "nutricioSimple", "planificacio"],
				personalGoal: "Vull mantenir el rendiment i recuperar millor.",
			};
			persistUser(user.value);
			return { ok: true };
		}

		return {
			ok: false,
			message: "Credencials incorrectes. Prova pau@nutrimove.app / 123456.",
		};
	}

	function signup(data) {
		user.value = {
			name: String(data.name || "").trim(),
			email: String(data.email || "").trim().toLowerCase(),
			age: Number(data.age) || 0,
			weight: Number(data.weight) || 0,
			height: Number(data.height) || 0,
			gender: data.gender || "M",
			activityLevel: data.activityLevel || "moderat",
			sports: Array.isArray(data.sports) ? [...data.sports] : [],
			goals: Array.isArray(data.goals) ? [...data.goals] : [],
			personalGoal: String(data.personalGoal || "").trim(),
		};
		persistUser(user.value);
		return { ok: true };
	}

	function logout() {
		user.value = null;
		localStorage.removeItem(STORAGE_KEY);
	}

	return {
		user,
		isAuthenticated,
		tmb,
		caloricGoal,
		activityLabel,
		userInitials,
		login,
		signup,
		logout,
	};
});

function loadUser() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function persistUser(userData) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
}

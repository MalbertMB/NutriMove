import { defineStore } from "pinia";
import { computed, ref } from "vue";

const STORAGE_KEY = "nutrimove_auth_user";

export const useAuthStore = defineStore("auth", () => {
	const user = ref(loadUser());

	const isAuthenticated = computed(() => Boolean(user.value));

	function login(email, password) {
		const normalized = String(email || "")
			.trim()
			.toLowerCase();
		const pwd = String(password || "");

		if (normalized === "pau@nutrimove.app" && pwd === "123456") {
			user.value = { name: "Pau Martínez", email: normalized };
			persistUser(user.value);
			return { ok: true };
		}

		return {
			ok: false,
			message:
				"Credencials incorrectes. Prova pau@nutrimove.app / 123456.",
		};
	}

	function logout() {
		user.value = null;
		localStorage.removeItem(STORAGE_KEY);
	}

	return {
		user,
		isAuthenticated,
		login,
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

function persistUser(user) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

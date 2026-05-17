import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUIStore = defineStore("ui", () => {
	// Toast notifications
	const toasts = ref([]);
	let toastId = 0;

	function showToast(message, type = "success", duration = 3500) {
		const id = ++toastId;
		toasts.value.push({ id, message, type });
		setTimeout(() => removeToast(id), duration);
		return id;
	}

	function removeToast(id) {
		const idx = toasts.value.findIndex((t) => t.id === id);
		if (idx !== -1) toasts.value.splice(idx, 1);
	}

	// Session edit panel (Task 1)
	const editPanelOpen = ref(false);
	const editingSessionId = ref(null);

	function openEditPanel(sessionId) {
		editingSessionId.value = sessionId;
		editPanelOpen.value = true;
	}

	function closeEditPanel() {
		editPanelOpen.value = false;
		editingSessionId.value = null;
	}

	// Session preview card (read-only, anchored to calendar block)
	const previewSessionId = ref(null);
	const previewAnchorRect = ref(null);
	let _previewCloseTimer = null;

	function openPreviewSession(sessionId, anchorRect = null) {
		if (_previewCloseTimer) {
			clearTimeout(_previewCloseTimer);
			_previewCloseTimer = null;
		}
		setTimeout(() => {
			previewSessionId.value = sessionId;
			previewAnchorRect.value = anchorRect
				? {
						top: anchorRect.top,
						right: anchorRect.right,
						bottom: anchorRect.bottom,
						left: anchorRect.left,
						width: anchorRect.width,
						height: anchorRect.height,
					}
				: null;
		}, 150);
	}

	function scheduleClosePreviewSession() {
		_previewCloseTimer = setTimeout(() => {
			previewSessionId.value = null;
			previewAnchorRect.value = null;
			_previewCloseTimer = null;
		}, 180);
	}

	function cancelClosePreviewSession() {
		if (_previewCloseTimer) {
			clearTimeout(_previewCloseTimer);
			_previewCloseTimer = null;
		}
	}

	function closePreviewSession() {
		if (_previewCloseTimer) {
			clearTimeout(_previewCloseTimer);
			_previewCloseTimer = null;
		}
		previewSessionId.value = null;
		previewAnchorRect.value = null;
	}

	// AI Popover (anchored to block – Task 1)
	const aiPopoverOpen = ref(false);
	const aiPopoverContext = ref(null);

	function showAIPopover(context) {
		aiPopoverContext.value = context;
		aiPopoverOpen.value = true;
	}

	function closeAIPopover() {
		aiPopoverOpen.value = false;
		aiPopoverContext.value = null;
	}

	// AI Drawer (full panel – Task 2)
	const aiDrawerOpen = ref(false);
	const aiDrawerContext = ref(null);

	function showAIDrawer(context) {
		aiDrawerContext.value = context;
		aiDrawerOpen.value = true;
	}

	function closeAIDrawer() {
		aiDrawerOpen.value = false;
		aiDrawerContext.value = null;
	}

	// Meal detail panel (click on a meal cell/card)
	const mealPanelOpen = ref(false);
	const mealPanelDayIndex = ref(null);

	function openMealPanel(dayIndex) {
		mealPanelDayIndex.value = dayIndex;
		mealPanelOpen.value = true;
	}

	function closeMealPanel() {
		mealPanelOpen.value = false;
		mealPanelDayIndex.value = null;
	}

	// Add session panel (click on calendar)
	const addPanelOpen = ref(false);
	const addPanelContext = ref(null); // { dayIndex, startTime }

	function openAddPanel(dayIndex, startTime) {
		addPanelContext.value = { dayIndex, startTime };
		addPanelOpen.value = true;
	}

	function closeAddPanel() {
		addPanelOpen.value = false;
		addPanelContext.value = null;
	}

	// Notifications
	const notifications = ref([
		{
			id: 1, type: 'warning', icon: 'warning',
			title: 'Càrrega alta detectada',
			body: 'Força — upper body (dimecres) té intensitat alta. Revisa la nutrició del dia.',
			read: false, time: new Date(Date.now() - 1000 * 60 * 12),
		},
		{
			id: 2, type: 'ai', icon: 'auto_awesome',
			title: 'Nutrició ajustada per IA',
			body: 'El sopar del dijous s\'ha reforçat amb +300 kcal per compensar la càrrega setmanal.',
			read: true, time: new Date(Date.now() - 1000 * 60 * 60 * 2),
		},
	]);
	let _notifId = 10;
	const notifPanelOpen = ref(false);
	const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

	function addNotification({ type = 'info', icon = 'notifications', title, body }) {
		notifications.value.unshift({ id: ++_notifId, type, icon, title, body, read: false, time: new Date() });
	}

	function markRead(id) {
		const n = notifications.value.find(n => n.id === id);
		if (n) n.read = true;
	}

	function markAllRead() {
		notifications.value.forEach(n => { n.read = true; });
	}

	function toggleNotifPanel() { notifPanelOpen.value = !notifPanelOpen.value; }
	function closeNotifPanel() { notifPanelOpen.value = false; }
	// Library panel (drag source - Task 2)
	const libraryOpen = ref(true);

	// ── User mode ────────────────────────────────────────────────
	// Global "Simple" vs "Advanced" mode. Pages opt in to a richer view by
	// reading `advancedMetrics` (kept as a computed alias for callers that
	// still use the old name). Adding a new advanced view = read `userMode`
	// from the page and append a row to `advancedViewPages` below.
	const userMode = ref("simple"); // 'simple' | 'advanced'
	const advancedMetrics = computed(() => userMode.value === "advanced");

	function setUserMode(mode) {
		userMode.value = mode === "advanced" ? "advanced" : "simple";
	}
	function setAdvancedMetrics(v) {
		setUserMode(v ? "advanced" : "simple");
	}
	function toggleUserMode() {
		setUserMode(userMode.value === "advanced" ? "simple" : "advanced");
	}

	// Registry of pages that expose an advanced view. The Profile renders this
	// list dynamically; new pages just append an entry here.
	const advancedViewPages = ref([
		{
			key: "sessions",
			label: "Sessions",
			icon: "fitness_center",
			enabled: true,
			description:
				"TSS setmanal, càrrega AC:W, zones FC, polarització 80/20, heatmap horari i risc d'overtraining.",
		},
		{
			key: "dashboard",
			label: "Inici",
			icon: "home",
			enabled: false,
			description:
				"Properament: vista executiva amb alertes proactives, tendències i comparativa setmanal.",
		},
		{
			key: "progress",
			label: "Progrés",
			icon: "trending_up",
			enabled: true,
			description:
				"PMC (CTL/ATL/TSB), progressió FTP, distribució per zones FC i adherència de macros setmana a setmana.",
		},
		{
			key: "meals",
			label: "Àpats",
			icon: "restaurant",
			enabled: true,
			description:
				"Adherència calòrica, composició de macros per dia, distribució setmanal i timing nutricional al voltant de les sessions.",
		},
	]);

	// Advice page state — persists across navigations
	const adviceIgnoredTips = ref([]);
	const adviceHistory = ref([]);

	function ignoreAdviceTip(tipId) {
		if (!adviceIgnoredTips.value.includes(tipId)) {
			adviceIgnoredTips.value = [...adviceIgnoredTips.value, tipId];
		}
	}

	function addAdviceHistoryEntry(label, status) {
		adviceHistory.value.unshift({
			id: Date.now() + Math.random(),
			label,
			date: new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'short' }).format(new Date()),
			status,
		});
	}

	return {
		toasts,
		showToast,
		removeToast,
		editPanelOpen,
		editingSessionId,
		openEditPanel,
		closeEditPanel,
		aiPopoverOpen,
		aiPopoverContext,
		showAIPopover,
		closeAIPopover,
		aiDrawerOpen,
		aiDrawerContext,
		showAIDrawer,
		closeAIDrawer,
		previewSessionId,
		previewAnchorRect,
		openPreviewSession,
		scheduleClosePreviewSession,
		cancelClosePreviewSession,
		closePreviewSession,
		notifications,
		notifPanelOpen,
		unreadCount,
		addNotification,
		markRead,
		markAllRead,
		toggleNotifPanel,
		closeNotifPanel,
		libraryOpen,
		addPanelOpen,
		addPanelContext,
		openAddPanel,
		closeAddPanel,
		mealPanelOpen,
		mealPanelDayIndex,
		openMealPanel,
		closeMealPanel,
		adviceIgnoredTips,
		adviceHistory,
		ignoreAdviceTip,
		addAdviceHistoryEntry,
		userMode,
		advancedMetrics,
		advancedViewPages,
		setUserMode,
		setAdvancedMetrics,
		toggleUserMode,
	};
});

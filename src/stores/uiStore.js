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

	// ── User mode ────────────────────────────────────────────────
	// Global "Simple" vs "Advanced" mode. Pages opt in to a richer view by
	// reading `advancedMetrics` (kept as a computed alias for callers that
	// still use the old name).
	const userMode = ref("simple"); // 'simple' | 'advanced'
	const advancedMetrics = computed(() => userMode.value === "advanced");

	function setUserMode(mode) {
		userMode.value = mode === "advanced" ? "advanced" : "simple";
	}

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
		setUserMode,
	};
});

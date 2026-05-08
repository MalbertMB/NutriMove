import { defineStore } from "pinia";
import { ref } from "vue";

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

	// Library panel (drag source - Task 2)
	const libraryOpen = ref(true);

	// Keyboard fallback for session placement
	const keyboardPlacementSessionType = ref(null);

	function startKeyboardSessionPlacement(type) {
		keyboardPlacementSessionType.value = type;
	}

	function cancelKeyboardSessionPlacement() {
		keyboardPlacementSessionType.value = null;
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
		libraryOpen,
		keyboardPlacementSessionType,
		startKeyboardSessionPlacement,
		cancelKeyboardSessionPlacement,
		addPanelOpen,
		addPanelContext,
		openAddPanel,
		closeAddPanel,
	};
});

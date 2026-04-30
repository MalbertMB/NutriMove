import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Toast notifications
  const toasts = ref([])
  let toastId = 0

  function showToast(message, type = 'success', duration = 3500) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
    return id
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  // Session edit panel (Task 1)
  const editPanelOpen = ref(false)
  const editingSessionId = ref(null)

  function openEditPanel(sessionId) {
    editingSessionId.value = sessionId
    editPanelOpen.value = true
  }

  function closeEditPanel() {
    editPanelOpen.value = false
    editingSessionId.value = null
  }

  // AI Popover (anchored to block – Task 1)
  const aiPopoverOpen = ref(false)
  const aiPopoverContext = ref(null)

  function showAIPopover(context) {
    aiPopoverContext.value = context
    aiPopoverOpen.value = true
  }

  function closeAIPopover() {
    aiPopoverOpen.value = false
    aiPopoverContext.value = null
  }

  // AI Drawer (full panel – Task 2)
  const aiDrawerOpen = ref(false)
  const aiDrawerContext = ref(null)

  function showAIDrawer(context) {
    aiDrawerContext.value = context
    aiDrawerOpen.value = true
  }

  function closeAIDrawer() {
    aiDrawerOpen.value = false
    aiDrawerContext.value = null
  }

  // Library panel (drag source - Task 2)
  const libraryOpen = ref(true)

  // Keyboard fallback for session placement
  const keyboardPlacementSessionType = ref(null)

  function startKeyboardSessionPlacement(type) {
    keyboardPlacementSessionType.value = type
  }

  function cancelKeyboardSessionPlacement() {
    keyboardPlacementSessionType.value = null
  }

  return {
    toasts, showToast, removeToast,
    editPanelOpen, editingSessionId, openEditPanel, closeEditPanel,
    aiPopoverOpen, aiPopoverContext, showAIPopover, closeAIPopover,
    aiDrawerOpen, aiDrawerContext, showAIDrawer, closeAIDrawer,
    libraryOpen,
    keyboardPlacementSessionType, startKeyboardSessionPlacement, cancelKeyboardSessionPlacement
  }
})

import { watch, nextTick, onBeforeUnmount } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',')

function getFocusable(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
  )
}

/**
 * Trap keyboard focus inside `containerRef` while `isOpen` is true.
 * On open: stores last-focused element, focuses container or first focusable.
 * On close: restores focus to the stored element.
 */
export function useFocusTrap(isOpen, containerRef, options = {}) {
  let lastFocused = null

  function onKeyDown(e) {
    if (e.key !== 'Tab') return
    const container = containerRef.value
    if (!container) return
    const focusables = getFocusable(container)
    if (focusables.length === 0) {
      e.preventDefault()
      container.focus()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement

    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    } else if (!container.contains(active)) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(
    () => (typeof isOpen === 'function' ? isOpen() : isOpen.value),
    async (open) => {
      if (open) {
        lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
        await nextTick()
        document.addEventListener('keydown', onKeyDown)
        const container = containerRef.value
        if (!container) return
        const focusables = getFocusable(container)
        const target = options.initialFocus?.() ?? focusables[0] ?? container
        target?.focus?.()
      } else {
        document.removeEventListener('keydown', onKeyDown)
        if (lastFocused && typeof lastFocused.focus === 'function') {
          await nextTick()
          lastFocused.focus()
        }
        lastFocused = null
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown)
  })
}

import { watch, onBeforeUnmount } from 'vue'

let lockCount = 0
let savedOverflow = ''
let savedPaddingRight = ''

function applyLock() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow
    savedPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'
  }
  lockCount++
}

function removeLock() {
  if (lockCount === 0) return
  lockCount--
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow
    document.body.style.paddingRight = savedPaddingRight
  }
}

/**
 * Lock body scroll while `isOpen` is true. Multiple overlapping modals
 * stack correctly via a reference counter.
 */
export function useScrollLock(isOpen) {
  let locked = false

  watch(
    () => (typeof isOpen === 'function' ? isOpen() : isOpen.value),
    (open) => {
      if (open && !locked) {
        applyLock()
        locked = true
      } else if (!open && locked) {
        removeLock()
        locked = false
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (locked) {
      removeLock()
      locked = false
    }
  })
}

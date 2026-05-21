import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'nutrimove:a11y'

const DEFAULTS = {
  reducedMotion: 'auto', // 'auto' | 'on' | 'off'
  highContrast: false,
  largeText: false,
  dyslexicFont: false,
  underlineLinks: false,
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore quota / disabled storage */
  }
}

export const useA11yStore = defineStore('a11y', () => {
  const initial = loadPrefs()

  const reducedMotion = ref(initial.reducedMotion)
  const highContrast = ref(initial.highContrast)
  const largeText = ref(initial.largeText)
  const dyslexicFont = ref(initial.dyslexicFont)
  const underlineLinks = ref(initial.underlineLinks)

  // ── System-level reduced-motion preference (read-only) ─────────────
  const systemReducedMotion = ref(false)
  let motionMediaQuery = null

  function setupMotionListener() {
    if (typeof window === 'undefined' || !window.matchMedia) return
    motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    systemReducedMotion.value = motionMediaQuery.matches
    const handler = (e) => { systemReducedMotion.value = e.matches }
    if (motionMediaQuery.addEventListener) {
      motionMediaQuery.addEventListener('change', handler)
    } else {
      motionMediaQuery.addListener(handler)
    }
  }

  // ── Apply preferences to <html> ────────────────────────────────────
  function applyToDocument() {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    const motionActive =
      reducedMotion.value === 'on' ||
      (reducedMotion.value === 'auto' && systemReducedMotion.value)

    root.toggleAttribute('data-reduced-motion', motionActive)
    root.toggleAttribute('data-high-contrast', highContrast.value)
    root.toggleAttribute('data-large-text', largeText.value)
    root.toggleAttribute('data-dyslexic-font', dyslexicFont.value)
    root.toggleAttribute('data-underline-links', underlineLinks.value)
  }

  function snapshot() {
    return {
      reducedMotion: reducedMotion.value,
      highContrast: highContrast.value,
      largeText: largeText.value,
      dyslexicFont: dyslexicFont.value,
      underlineLinks: underlineLinks.value,
    }
  }

  // ── Setters ────────────────────────────────────────────────────────
  function setReducedMotion(value) {
    if (!['auto', 'on', 'off'].includes(value)) return
    reducedMotion.value = value
  }
  function toggleHighContrast() { highContrast.value = !highContrast.value }
  function toggleLargeText() { largeText.value = !largeText.value }
  function toggleDyslexicFont() { dyslexicFont.value = !dyslexicFont.value }
  function toggleUnderlineLinks() { underlineLinks.value = !underlineLinks.value }
  function resetA11y() {
    reducedMotion.value = DEFAULTS.reducedMotion
    highContrast.value = DEFAULTS.highContrast
    largeText.value = DEFAULTS.largeText
    dyslexicFont.value = DEFAULTS.dyslexicFont
    underlineLinks.value = DEFAULTS.underlineLinks
  }

  // Initialize listener + first apply
  setupMotionListener()
  applyToDocument()

  // Persist + reapply on any change
  watch(
    [reducedMotion, highContrast, largeText, dyslexicFont, underlineLinks, systemReducedMotion],
    () => {
      savePrefs(snapshot())
      applyToDocument()
    },
    { flush: 'post' }
  )

  return {
    reducedMotion,
    highContrast,
    largeText,
    dyslexicFont,
    underlineLinks,
    setReducedMotion,
    toggleHighContrast,
    toggleLargeText,
    toggleDyslexicFont,
    toggleUnderlineLinks,
    resetA11y,
  }
})

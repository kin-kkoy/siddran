import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import logger from '../utils/logger'

// ── Theme definitions ──────────────────────────────────────────────
export const THEMES = {
  'default':        { name: 'Default',        hex: null },
  'midnight-slate': { name: 'Midnight Slate', hex: '#1E293B' },
  'forest-focus':   { name: 'Forest Focus',   hex: '#064E3B' },
  'sepia-reader':   { name: 'Sepia Reader',   hex: '#78350F' },
  'oled-pitch':     { name: 'OLED Pitch',     hex: '#000000' },
  'lavender-mist':  { name: 'Lavender Mist',  hex: '#7C3AED' },
  'steel-blue':     { name: 'Steel Blue',     hex: '#0369A1' },
  'terra-cotta':    { name: 'Terra Cotta',    hex: '#9A3412' },
  'graphite':       { name: 'Graphite',       hex: '#374151' },
}

const DEFAULTS = {
  mode: 'dark',
  theme: 'default',
  matchMode: true,
  contrast: 'low',
  autoHideToolbar: true,
}

// ── Color utilities ────────────────────────────────────────────────
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// WCAG relative luminance — determines if text should be light or dark
function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function needsLightText(bgHex) {
  return relativeLuminance(bgHex) < 0.179
}

// ── Theme palette generator ────────────────────────────────────────
function generatePalette(themeKey, mode, matchMode, contrast) {
  const theme = THEMES[themeKey]

  // Default theme — standard light/dark palettes
  if (!theme?.hex) {
    if (mode === 'dark') {
      return darkDefaults(contrast)
    }
    return lightDefaults(contrast)
  }

  const [h, s] = rgbToHsl(...hexToRgb(theme.hex))

  // matchMode OFF — use the literal theme color
  if (!matchMode) {
    return literalPalette(theme.hex, h, s, contrast)
  }

  // matchMode ON — adapt shades to light/dark mode
  if (mode === 'dark') {
    return darkThemedPalette(h, s, contrast)
  }
  return lightThemedPalette(h, s, contrast)
}

function darkDefaults(contrast) {
  const hi = contrast === 'high'
  return {
    '--bg-primary':    '#121212',
    '--bg-surface':    '#1e1e1e',
    '--bg-elevated':   '#2a2a2a',
    '--bg-hover':      '#3a3a3a',
    '--border-default': hi ? '#555' : '#333',
    '--border-strong':  hi ? '#777' : '#444',
    '--text-primary':   '#ffffff',
    '--text-secondary': '#e0e0e0',
    '--text-muted':     hi ? '#aaa' : '#888',
    '--text-dim':       hi ? '#999' : '#666',
    '--text-faint':     hi ? '#888' : '#555',
    '--accent-blue':    '#4a9eff',
    '--accent-danger':  '#ef4444',
    '--accent-warning': '#f97316',
    '--accent-warning-alpha': 'rgba(249, 115, 22, 0.1)',
    '--accent-success': '#4ade80',
    '--shadow-color':   'rgba(0, 0, 0, 0.5)',
  }
}

function lightDefaults(contrast) {
  const hi = contrast === 'high'
  return {
    '--bg-primary':    '#f5f5f5',
    '--bg-surface':    '#ffffff',
    '--bg-elevated':   '#f0f0f0',
    '--bg-hover':      '#e5e5e5',
    '--border-default': hi ? '#999' : '#d4d4d4',
    '--border-strong':  hi ? '#777' : '#bbb',
    '--text-primary':   '#1a1a1a',
    '--text-secondary': '#333333',
    '--text-muted':     hi ? '#444' : '#666',
    '--text-dim':       hi ? '#555' : '#888',
    '--text-faint':     hi ? '#666' : '#aaa',
    '--accent-blue':    '#2563eb',
    '--accent-danger':  '#dc2626',
    '--accent-warning': '#ea580c',
    '--accent-warning-alpha': 'rgba(234, 88, 12, 0.1)',
    '--accent-success': '#16a34a',
    '--shadow-color':   'rgba(0, 0, 0, 0.12)',
  }
}

function darkThemedPalette(h, s, contrast) {
  const hi = contrast === 'high'
  const sat = Math.min(s, 40) // Keep saturation subtle for backgrounds
  const accent = s >= 15 ? hslToHex(h, Math.max(s, 70), 53) : '#f97316'
  const [ar, ag, ab] = hexToRgb(accent)
  return {
    '--bg-primary':    hslToHex(h, sat, 8),
    '--bg-surface':    hslToHex(h, sat, 12),
    '--bg-elevated':   hslToHex(h, sat, 16),
    '--bg-hover':      hslToHex(h, sat, 22),
    '--border-default': hslToHex(h, sat * 0.6, hi ? 35 : 22),
    '--border-strong':  hslToHex(h, sat * 0.6, hi ? 45 : 30),
    '--text-primary':   '#ffffff',
    '--text-secondary': '#e0e0e0',
    '--text-muted':     hi ? '#aaa' : '#888',
    '--text-dim':       hi ? '#999' : '#666',
    '--text-faint':     hi ? '#888' : '#555',
    '--accent-blue':    s >= 20 ? hslToHex(h, Math.max(s, 60), 60) : '#4a9eff',
    '--accent-danger':  '#ef4444',
    '--accent-warning': accent,
    '--accent-warning-alpha': `rgba(${ar}, ${ag}, ${ab}, 0.1)`,
    '--accent-success': '#4ade80',
    '--shadow-color':   'rgba(0, 0, 0, 0.5)',
  }
}

function lightThemedPalette(h, s, contrast) {
  const hi = contrast === 'high'
  const sat = Math.min(s, 45)
  const accent = s >= 15 ? hslToHex(h, Math.max(s, 70), 48) : '#ea580c'
  const [ar, ag, ab] = hexToRgb(accent)
  return {
    '--bg-primary':    hslToHex(h, sat, 95),
    '--bg-surface':    hslToHex(h, sat * 0.6, 97),
    '--bg-elevated':   hslToHex(h, sat, 90),
    '--bg-hover':      hslToHex(h, sat, 85),
    '--border-default': hslToHex(h, sat * 0.7, hi ? 65 : 80),
    '--border-strong':  hslToHex(h, sat * 0.7, hi ? 55 : 72),
    '--text-primary':   '#1a1a1a',
    '--text-secondary': '#333333',
    '--text-muted':     hi ? '#444' : '#666',
    '--text-dim':       hi ? '#555' : '#888',
    '--text-faint':     hi ? '#666' : '#aaa',
    '--accent-blue':    s >= 20 ? hslToHex(h, Math.max(s, 60), 45) : '#2563eb',
    '--accent-danger':  '#dc2626',
    '--accent-warning': accent,
    '--accent-warning-alpha': `rgba(${ar}, ${ag}, ${ab}, 0.1)`,
    '--accent-success': '#16a34a',
    '--shadow-color':   'rgba(0, 0, 0, 0.12)',
  }
}

function literalPalette(hex, h, s, contrast) {
  const hi = contrast === 'high'
  const [, , baseLightness] = rgbToHsl(...hexToRgb(hex))
  const lightText = needsLightText(hex)

  // Derive surface/elevated from the base color
  const surfaceL = Math.min(baseLightness + 5, 95)
  const elevatedL = Math.min(baseLightness + 10, 90)
  const hoverL = Math.min(baseLightness + 16, 85)

  const accent = s >= 15
    ? hslToHex(h, Math.max(s, 70), lightText ? 53 : 48)
    : (lightText ? '#f97316' : '#ea580c')
  const [ar, ag, ab] = hexToRgb(accent)

  return {
    '--bg-primary':    hex,
    '--bg-surface':    hslToHex(h, s, surfaceL),
    '--bg-elevated':   hslToHex(h, s, elevatedL),
    '--bg-hover':      hslToHex(h, s, hoverL),
    '--border-default': hslToHex(h, s * 0.6, lightText ? (hi ? baseLightness + 20 : baseLightness + 12) : (hi ? baseLightness - 20 : baseLightness - 12)),
    '--border-strong':  hslToHex(h, s * 0.6, lightText ? (hi ? baseLightness + 28 : baseLightness + 18) : (hi ? baseLightness - 28 : baseLightness - 18)),
    '--text-primary':   lightText ? '#ffffff' : '#1a1a1a',
    '--text-secondary': lightText ? '#e0e0e0' : '#333333',
    '--text-muted':     lightText ? (hi ? '#bbb' : '#999') : (hi ? '#555' : '#777'),
    '--text-dim':       lightText ? (hi ? '#aaa' : '#777') : (hi ? '#666' : '#888'),
    '--text-faint':     lightText ? (hi ? '#999' : '#666') : (hi ? '#777' : '#999'),
    '--accent-blue':    lightText ? '#4a9eff' : '#2563eb',
    '--accent-danger':  lightText ? '#ef4444' : '#dc2626',
    '--accent-warning': accent,
    '--accent-warning-alpha': `rgba(${ar}, ${ag}, ${ab}, 0.1)`,
    '--accent-success': lightText ? '#4ade80' : '#16a34a',
    '--shadow-color':   lightText ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.12)',
  }
}

// ── Apply palette to document ──────────────────────────────────────
function applyPalette(palette) {
  const root = document.documentElement
  for (const [prop, value] of Object.entries(palette)) {
    root.style.setProperty(prop, value)
  }
}

// ── Context ────────────────────────────────────────────────────────
const SettingsContext = createContext(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export function SettingsProvider({ children, authFetch, API, isAuthed }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('cinder_settings'))
      return { ...DEFAULTS, ...cached }
    } catch { return { ...DEFAULTS } }
  })

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const dirtyRef = useRef(false)
  const settingsRef = useRef(settings)

  // Keep ref in sync with state
  useEffect(() => { settingsRef.current = settings }, [settings])

  // Persist to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem('cinder_settings', JSON.stringify(settings)) } catch {}
  }, [settings])

  // Apply theme whenever settings change
  useEffect(() => {
    const palette = generatePalette(settings.theme, settings.mode, settings.matchMode, settings.contrast)
    applyPalette(palette)
    document.documentElement.dataset.mode = settings.mode
  }, [settings.theme, settings.mode, settings.matchMode, settings.contrast])

  // Fetch from backend on auth (backend is source of truth)
  useEffect(() => {
    if (!isAuthed || !authFetch || !API) return

    const fetchSettings = async () => {
      try {
        const res = await authFetch(`${API}/settings`)
        if (res.ok) {
          const data = await res.json()
          if (data.settings && Object.keys(data.settings).length > 0) {
            setSettings(prev => ({ ...DEFAULTS, ...prev, ...data.settings }))
          }
        }
      } catch (error) {
        logger.error('Error fetching settings:', error)
      }
    }

    fetchSettings()
  }, [isAuthed, authFetch, API])

  // Update a single setting — local only, backend save deferred to modal close
  const updateSetting = useCallback((key, value) => {
    dirtyRef.current = true
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const openSettings = useCallback(() => setIsSettingsOpen(true), [])

  // Save to backend only when closing the popup
  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false)

    if (dirtyRef.current && authFetch && API) {
      dirtyRef.current = false
      authFetch(`${API}/settings`, {
        method: 'PUT',
        body: JSON.stringify({ settings: settingsRef.current }),
      }).catch(err => logger.error('Error saving settings:', err))
    }
  }, [authFetch, API])

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      isSettingsOpen,
      openSettings,
      closeSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

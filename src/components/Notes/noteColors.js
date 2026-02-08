// Note card color definitions with dark/light mode variants.
// The `key` is the value stored in the database.
export const NOTE_COLORS = [
  { key: null,      dark: null,      light: null,      name: 'Default' },
  { key: '#2a2a1a', dark: '#2a2a1a', light: '#f0edd6', name: 'Brown' },
  { key: '#1a2a2a', dark: '#1a2a2a', light: '#d6f0ed', name: 'Teal' },
  { key: '#2a1a2a', dark: '#2a1a2a', light: '#edd6f0', name: 'Purple' },
  { key: '#2a1a1a', dark: '#2a1a1a', light: '#f0d6d6', name: 'Red' },
]

// Look up the display color for a stored note color value.
// Returns null for "use CSS variable default".
export function getNoteBackground(storedColor, mode) {
  if (!storedColor) return null

  const entry = NOTE_COLORS.find(c => c.key === storedColor)
  if (!entry) return storedColor // unknown color — use as-is

  return mode === 'light' ? entry.light : entry.dark
}

// Get the swatch preview color for the color picker.
export function getSwatchColor(entry, mode) {
  if (!entry.key) return null // default uses CSS variable
  return mode === 'light' ? entry.light : entry.dark
}

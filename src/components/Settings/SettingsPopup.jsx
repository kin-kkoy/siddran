import { useState } from 'react'
import { useSettings, THEMES } from '../../contexts/SettingsContext'
import styles from './SettingsPopup.module.css'

function SettingsPopup() {
  const { settings, updateSetting, isSettingsOpen, closeSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('interface')

  if (!isSettingsOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeSettings()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <h2>Settings</h2>
          <button onClick={closeSettings} className={styles.closeBtn}>&times;</button>
        </div>

        {/* Body: sidebar + content */}
        <div className={styles.body}>

          {/* Tab sidebar */}
          <div className={styles.sidebar}>
            <button
              className={`${styles.tab} ${activeTab === 'interface' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('interface')}
            >
              Interface
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'account' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
          </div>

          {/* Tab content */}
          <div className={styles.content}>
            {activeTab === 'interface' ? (
              <InterfaceTab settings={settings} updateSetting={updateSetting} />
            ) : (
              <div className={styles.placeholder}>To be implemented</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Interface Tab ──────────────────────────────────────────────────
function InterfaceTab({ settings, updateSetting }) {
  return (
    <div className={styles.tabContent}>

      {/* Mode toggle */}
      <SettingRow label="Appearance" description="Switch between light and dark mode">
        <SegmentedControl
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={settings.mode}
          onChange={(v) => updateSetting('mode', v)}
        />
      </SettingRow>

      {/* Theme selector */}
      <SettingRow label="Theme" description="Choose a color theme for the app">
        <div className={styles.themeGrid}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              className={`${styles.themeSwatch} ${settings.theme === key ? styles.themeSelected : ''}`}
              onClick={() => updateSetting('theme', key)}
              title={theme.name}
            >
              <span
                className={styles.swatchColor}
                style={{ backgroundColor: theme.hex || '#121212' }}
              />
              <span className={styles.swatchLabel}>{theme.name}</span>
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Match light/dark mode toggle — only shown for non-default themes */}
      {settings.theme !== 'default' && (
        <SettingRow
          label="Match Light/Dark Mode"
          description="When on, theme shades adapt to your selected mode. When off, the literal theme color is used."
        >
          <ToggleSwitch
            checked={settings.matchMode}
            onChange={(v) => updateSetting('matchMode', v)}
          />
        </SettingRow>
      )}

      {/* Contrast */}
      <SettingRow label="Contrast" description="Adjust border and text contrast levels">
        <SegmentedControl
          options={[
            { value: 'low', label: 'Low' },
            { value: 'high', label: 'High' },
          ]}
          value={settings.contrast}
          onChange={(v) => updateSetting('contrast', v)}
        />
      </SettingRow>

      {/* Auto-hide toolbar */}
      <SettingRow
        label="Auto-Hide Toolbar"
        description="When off, the formatting toolbar stays visible in write mode."
      >
        <ToggleSwitch
          checked={settings.autoHideToolbar}
          onChange={(v) => updateSetting('autoHideToolbar', v)}
        />
      </SettingRow>
    </div>
  )
}

// ── Reusable controls ──────────────────────────────────────────────
function SettingRow({ label, description, children }) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingInfo}>
        <span className={styles.settingLabel}>{label}</span>
        {description && <span className={styles.settingDesc}>{description}</span>}
      </div>
      <div className={styles.settingControl}>
        {children}
      </div>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className={styles.segmented}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`${styles.segmentBtn} ${value === opt.value ? styles.segmentActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className={styles.toggleThumb} />
    </button>
  )
}

export default SettingsPopup

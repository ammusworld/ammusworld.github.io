import { memo } from 'react'
import styles from './NightModeToggle.module.css'

interface NightModeToggleProps {
  isNightMode: boolean
  onToggle: () => void
}

export const NightModeToggle = memo(function NightModeToggle({
  isNightMode,
  onToggle,
}: Readonly<NightModeToggleProps>) {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      aria-label={isNightMode ? 'Switch to day mode' : 'Switch to night mode'}
      title={isNightMode ? 'Day mode' : 'Night mode'}
    >
      {isNightMode ? '☀️' : '🌙'}
    </button>
  )
})

import styles from './FilterChip.module.css'

interface FilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  const className = active ? `${styles.chip} ${styles.active}` : styles.chip

  if (!onClick) {
    return <span className={className}>{label}</span>
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  )
}

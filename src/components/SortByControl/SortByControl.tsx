import styles from './SortByControl.module.css'

interface SortByControlProps {
  value: 'desc' | 'asc'
  onChange: (value: 'desc' | 'asc') => void
  showLabel?: boolean
  className?: string
}

export function SortByControl({
  value,
  onChange,
  showLabel = true,
  className,
}: SortByControlProps) {
  const isNewestFirst = value === 'desc'
  const sortText = isNewestFirst ? 'Newest first' : 'Oldest first'
  const containerClassName = className
    ? `${styles.sortBy} ${className}`
    : styles.sortBy

  return (
    <div className={containerClassName}>
      {showLabel && <span className={styles.label}>Sort by:</span>}
      <button
        type="button"
        className={styles.toggle}
        onClick={() => onChange(isNewestFirst ? 'asc' : 'desc')}
      >
        <span className={styles.currentValue}>{sortText}</span>
        <i className={`fa-solid fa-up-down ${styles.icon}`} aria-hidden="true" />
      </button>
    </div>
  )
}

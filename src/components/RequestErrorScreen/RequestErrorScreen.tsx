import { BlogHeader } from '../BlogHeader/BlogHeader'
import { Button } from '../Button/Button'
import styles from './RequestErrorScreen.module.css'

interface RequestErrorScreenProps {
  title: string
  message: string
  details?: string | null
  primaryActionLabel: string
  onPrimaryAction: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function RequestErrorScreen({
  title,
  message,
  details,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: RequestErrorScreenProps) {
  return (
    <section className={styles.page}>
      <BlogHeader onLogoClick={onSecondaryAction} />

      <div className={styles.layout}>
        <article className={styles.card} role="alert">
          <span className={styles.badge}>Request failed</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.message}>{message}</p>
          {details && <p className={styles.details}>{details}</p>}

          <div className={styles.actions}>
            <Button className={styles.actionButton} onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>

            {secondaryActionLabel && onSecondaryAction && (
              <Button
                variant="secondary"
                className={styles.actionButton}
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

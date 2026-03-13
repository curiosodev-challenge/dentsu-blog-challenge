import { formatReadableDate } from '../../utils/date'
import styles from './AuthorBadge.module.css'

interface AuthorBadgeProps {
  name?: string
  profilePicture?: string
  createdAt: string
}

export function AuthorBadge({ name, profilePicture, createdAt }: AuthorBadgeProps) {
  const authorName = name?.trim() || 'Unknown author'

  return (
    <div className={styles.authorMeta}>
      {profilePicture ? (
        <img className={styles.avatar} src={profilePicture} alt={`${authorName} avatar`} />
      ) : (
        <span className={styles.avatarPlaceholder} aria-hidden="true">
          {authorName.slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className={styles.textBlock}>
        <p className={styles.byline}>
          Written by: <span className={styles.authorName}>{authorName}</span>
        </p>
        <time className={styles.date} dateTime={createdAt}>
          {formatReadableDate(createdAt)}
        </time>
      </div>
    </div>
  )
}

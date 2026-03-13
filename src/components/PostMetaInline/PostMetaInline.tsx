import { formatReadableDate } from '../../utils/date'
import { getLastName } from '../../utils/people'
import styles from './PostMetaInline.module.css'

interface PostMetaInlineProps {
  createdAt: string
  authorName?: string
}

export function PostMetaInline({ createdAt, authorName }: PostMetaInlineProps) {
  return (
    <p className={styles.meta}>
      <time className={styles.date} dateTime={createdAt}>
        {formatReadableDate(createdAt)}
      </time>
      <span className={styles.divider} aria-hidden="true" />
      <span className={styles.lastName}>{getLastName(authorName)}</span>
    </p>
  )
}

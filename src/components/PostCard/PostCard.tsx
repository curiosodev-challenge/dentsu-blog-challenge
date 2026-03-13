import { FilterChip } from '../FilterChip/FilterChip'
import { PostMetaInline } from '../PostMetaInline/PostMetaInline'
import type { Author, Category, Post } from '../../types/blog'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: Post
  author?: Author
  categories: Category[]
  onSelectPost: (postId: string) => void
  variant?: 'default' | 'compact'
}

export function PostCard({
  post,
  author,
  categories,
  onSelectPost,
  variant = 'default',
}: PostCardProps) {
  const className =
    variant === 'compact' ? `${styles.card} ${styles.compact}` : styles.card

  return (
    <article className={className}>
      <a
        href={`?post=${encodeURIComponent(post.id)}`}
        className={styles.cardButton}
        onClick={(event) => {
          event.preventDefault()
          onSelectPost(post.id)
        }}
        aria-label={`Open ${post.title}`}
      >
        <img className={styles.thumbnail} src={post.thumbnailUrl} alt={post.title} />

        <div className={styles.content}>
          <div className={styles.metaRow}>
            <PostMetaInline createdAt={post.createdAt} authorName={author?.name} />
          </div>

          <div className={styles.copy}>
            <h2 className={styles.title}>{post.title}</h2>
            <p className={styles.excerpt}>{post.content}</p>
          </div>

          {categories.length > 0 && (
            <div className={styles.categories}>
              {categories.slice(0, 2).map((category) => (
                <FilterChip key={category.id} label={category.name} />
              ))}
            </div>
          )}
        </div>
      </a>
    </article>
  )
}

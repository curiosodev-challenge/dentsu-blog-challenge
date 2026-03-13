import { PostCard } from '../PostCard/PostCard'
import type { Author, Category, Post } from '../../types/blog'
import styles from './PostList.module.css'

interface PostListProps {
  posts: Post[]
  authorsById: Record<string, Author>
  categoriesById: Record<string, Category>
  categoriesByPostId: Record<string, string[]>
  onSelectPost: (postId: string) => void
  variant?: 'default' | 'compact'
  emptyText?: string
  layout?: 'grid' | 'stack' | 'latest'
}

export function PostList({
  posts,
  authorsById,
  categoriesById,
  categoriesByPostId,
  onSelectPost,
  variant = 'default',
  emptyText = 'No posts found.',
  layout = 'grid',
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <section
      className={`${styles.list} ${layout === 'grid' ? styles.grid : layout === 'latest' ? styles.latest : styles.stack}`}
      aria-label="Posts list"
    >
      {posts.map((post) => {
        const categories = (categoriesByPostId[post.id] ?? [])
          .map((categoryId) => categoriesById[categoryId])
          .filter((category): category is Category => Boolean(category))

        return (
          <PostCard
            key={post.id}
            post={post}
            author={authorsById[post.authorId]}
            categories={categories}
            onSelectPost={onSelectPost}
            variant={variant}
          />
        )
      })}
    </section>
  )
}

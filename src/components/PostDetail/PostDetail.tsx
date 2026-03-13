import { AuthorBadge } from '../AuthorBadge/AuthorBadge'
import type { Author, Post } from '../../types/blog'
import styles from './PostDetail.module.css'

interface PostDetailProps {
  post: Post
  author?: Author
}

export function PostDetail({ post, author }: PostDetailProps) {
  const paragraphs = post.content
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>

        <AuthorBadge
          name={author?.name}
          profilePicture={author?.profilePicture}
          createdAt={post.createdAt}
        />
      </header>

      <img className={styles.heroImage} src={post.thumbnailUrl} alt={post.title} />

      <section className={styles.body}>
        {paragraphs.map((paragraph, index) => (
          <p key={`${post.id}-${index}`}>{paragraph}</p>
        ))}
      </section>
    </article>
  )
}

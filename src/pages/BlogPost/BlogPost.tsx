import { useMemo } from 'react'
import { BlogHeader } from '../../components/BlogHeader/BlogHeader'
import { Button } from '../../components/Button/Button'
import { PostDetail } from '../../components/PostDetail/PostDetail'
import { PostList } from '../../components/PostList/PostList'
import { RequestErrorScreen } from '../../components/RequestErrorScreen/RequestErrorScreen'
import { usePost } from '../../hooks/usePost'
import { usePosts } from '../../hooks/usePosts'
import { useBlogStore } from '../../store/blogStore'
import styles from './BlogPost.module.css'

interface BlogPostProps {
  postId: string
  onBack: () => void
  onSelectPost: (postId: string) => void
}

export function BlogPost({ postId, onBack, onSelectPost }: BlogPostProps) {
  const { posts } = usePosts()
  const { post, isLoading, error, reload } = usePost(postId)
  const author = useBlogStore((state) =>
    post ? state.authorsById[post.authorId] : undefined,
  )
  const authorsById = useBlogStore((state) => state.authorsById)
  const categoriesById = useBlogStore((state) => state.categoriesById)
  const categoriesByPostId = useBlogStore((state) => state.categoriesByPostId)
  const lastArticles = useMemo(
    () => posts.filter((entry) => entry.id !== postId).slice(0, 3),
    [postId, posts],
  )

  if (isLoading && !post) {
    return <p className={styles.status}>Loading post details...</p>
  }

  if (error && !post) {
    return (
      <RequestErrorScreen
        title="Could not load this article"
        message="The detail request failed. Retry or return to the post list."
        details={error}
        primaryActionLabel="Retry request"
        onPrimaryAction={() => {
          if (reload) {
            void reload()
          }
        }}
        secondaryActionLabel="Back to posts"
        onSecondaryAction={onBack}
      />
    )
  }

  if (!post) {
    return (
      <RequestErrorScreen
        title="Post not found"
        message="This article could not be found in the current dataset."
        primaryActionLabel="Back to posts"
        onPrimaryAction={onBack}
      />
    )
  }

  return (
    <section className={styles.page}>
      <BlogHeader onLogoClick={onBack} />

      <div className={styles.layout}>
        <div className={styles.postArea}>
          <div className={styles.backColumn}>
            <Button
              variant="secondary"
              className={styles.backButton}
              onClick={onBack}
              iconLeft={<i className="fa-solid fa-arrow-left" aria-hidden="true" />}
            >
              Back
            </Button>
          </div>

          <div className={styles.postSection}>
            <PostDetail post={post} author={author} />
          </div>
        </div>

        <section className={styles.latestSection}>
          <h2 className={styles.latestTitle}>Latest articles</h2>
          <PostList
            posts={lastArticles}
            authorsById={authorsById}
            categoriesById={categoriesById}
            categoriesByPostId={categoriesByPostId}
            onSelectPost={onSelectPost}
            layout="latest"
            emptyText="No additional articles found."
          />
        </section>
      </div>
    </section>
  )
}

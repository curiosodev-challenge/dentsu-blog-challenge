import { useCallback, useEffect, useMemo } from 'react'
import { getPosts, normalizePost } from '../services/postsService'
import { useBlogStore } from '../store/blogStore'
import { toErrorMessage } from '../utils/errors'
import type { ApiPostResponse, Author, Category } from '../types/blog'

function getDistinctAuthors(posts: ApiPostResponse[]): Author[] {
  const authorsById: Record<string, Author> = {}

  for (const post of posts) {
    if (post.author) {
      authorsById[post.author.id] = post.author
    }
  }

  return Object.values(authorsById)
}

function getDistinctCategories(posts: ApiPostResponse[]): Category[] {
  const categoriesById: Record<string, Category> = {}

  for (const post of posts) {
    for (const category of post.categories ?? []) {
      categoriesById[category.id] = {
        ...category,
        postId: category.postId ?? post.id,
      }
    }
  }

  return Object.values(categoriesById)
}

function mapCategoriesForPost(post: ApiPostResponse): Category[] {
  return (post.categories ?? []).map((category) => ({
    ...category,
    postId: category.postId ?? post.id,
  }))
}

export function usePosts() {
  const postIds = useBlogStore((state) => state.postIds)
  const postsById = useBlogStore((state) => state.postsById)
  const hasLoadedPostsList = useBlogStore((state) => state.hasLoadedPostsList)
  const isLoading = useBlogStore((state) => state.isLoadingPosts)
  const error = useBlogStore((state) => state.postsError)
  const setPosts = useBlogStore((state) => state.setPosts)
  const setAuthors = useBlogStore((state) => state.setAuthors)
  const setCategories = useBlogStore((state) => state.setCategories)
  const setCategoriesForPost = useBlogStore((state) => state.setCategoriesForPost)
  const setPostsLoading = useBlogStore((state) => state.setPostsLoading)
  const setPostsError = useBlogStore((state) => state.setPostsError)

  const posts = useMemo(
    () =>
      postIds
        .map((postId) => postsById[postId])
        .filter((post): post is NonNullable<typeof post> => Boolean(post)),
    [postIds, postsById],
  )

  const applyPostsResponse = useCallback(
    (response: ApiPostResponse[]) => {
      setPosts(response.map(normalizePost))
      setAuthors(getDistinctAuthors(response))
      setCategories(getDistinctCategories(response))

      for (const post of response) {
        const categories = mapCategoriesForPost(post)

        if (categories.length > 0) {
          setCategoriesForPost(post.id, categories)
        }
      }
    },
    [setAuthors, setCategories, setCategoriesForPost, setPosts],
  )

  const loadPosts = useCallback(
    async (options?: { isCancelled?: () => boolean }) => {
      setPostsLoading(true)
      setPostsError(null)

      try {
        const response = await getPosts()

        if (options?.isCancelled?.()) {
          return
        }

        applyPostsResponse(response)
      } catch (requestError) {
        if (!options?.isCancelled?.()) {
          setPostsError(toErrorMessage(requestError))
        }
      } finally {
        if (!options?.isCancelled?.()) {
          setPostsLoading(false)
        }
      }
    },
    [applyPostsResponse, setPostsError, setPostsLoading],
  )

  useEffect(() => {
    if (hasLoadedPostsList) {
      return
    }

    let isCancelled = false
    void loadPosts({ isCancelled: () => isCancelled })

    return () => {
      isCancelled = true
    }
  }, [hasLoadedPostsList, loadPosts])

  return {
    posts,
    isLoading,
    error,
    reload: () => loadPosts(),
  }
}

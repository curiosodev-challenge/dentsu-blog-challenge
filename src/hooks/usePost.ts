import { useCallback, useEffect } from 'react'
import { getPost, normalizePost } from '../services/postsService'
import { useBlogStore } from '../store/blogStore'
import { toErrorMessage } from '../utils/errors'
import type { ApiPostResponse, Category } from '../types/blog'

function mapPostCategories(postId: string, response: ApiPostResponse): Category[] {
  return (response.categories ?? []).map((category) => ({
    ...category,
    postId: category.postId ?? postId,
  }))
}

export function usePost(postId: string | null) {
  const post = useBlogStore((state) =>
    postId ? state.postsById[postId] : undefined,
  )
  const isLoading = useBlogStore((state) => state.isLoadingPost)
  const error = useBlogStore((state) => state.postError)
  const upsertPost = useBlogStore((state) => state.upsertPost)
  const setAuthors = useBlogStore((state) => state.setAuthors)
  const setCategories = useBlogStore((state) => state.setCategories)
  const setCategoriesForPost = useBlogStore((state) => state.setCategoriesForPost)
  const setPostLoading = useBlogStore((state) => state.setPostLoading)
  const setPostError = useBlogStore((state) => state.setPostError)

  const applyPostResponse = useCallback(
    (activePostId: string, response: ApiPostResponse) => {
      upsertPost(normalizePost(response))

      if (response.author) {
        setAuthors([response.author])
      }

      const categories = mapPostCategories(activePostId, response)
      if (categories.length > 0) {
        setCategories(categories)
        setCategoriesForPost(activePostId, categories)
      }
    },
    [setAuthors, setCategories, setCategoriesForPost, upsertPost],
  )

  const loadPostById = useCallback(
    async (activePostId: string, options?: { isCancelled?: () => boolean }) => {
      setPostLoading(true)
      setPostError(null)

      try {
        const response = await getPost(activePostId)

        if (options?.isCancelled?.()) {
          return
        }

        applyPostResponse(activePostId, response)
      } catch (requestError) {
        if (!options?.isCancelled?.()) {
          setPostError(toErrorMessage(requestError))
        }
      } finally {
        if (!options?.isCancelled?.()) {
          setPostLoading(false)
        }
      }
    },
    [applyPostResponse, setPostError, setPostLoading],
  )

  useEffect(() => {
    if (!postId) {
      return
    }

    const activePostId = postId
    let isCancelled = false

    void loadPostById(activePostId, { isCancelled: () => isCancelled })

    return () => {
      isCancelled = true
    }
  }, [loadPostById, postId])

  return {
    post,
    isLoading,
    error,
    reload: postId ? () => loadPostById(postId) : undefined,
  }
}

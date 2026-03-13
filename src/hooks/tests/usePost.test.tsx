import { renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '../../services/api'
import { useBlogStore } from '../../store/blogStore'
import { apiPostDetailFixture } from '../../test/fixtures/blog'
import { resetBlogStore } from '../../test/utils/resetBlogStore'
import { usePost } from '../usePost'

const httpMock = new MockAdapter(apiClient)

describe('usePost', () => {
  beforeEach(() => {
    httpMock.reset()
    resetBlogStore()
  })

  it('does not fetch when postId is null', () => {
    const { result } = renderHook(() => usePost(null))

    expect(result.current.post).toBeUndefined()
    expect(result.current.reload).toBeUndefined()
    expect(result.current.error).toBeNull()
    expect(httpMock.history.get).toHaveLength(0)
  })

  it('loads a post by id and stores related author/category data', async () => {
    httpMock.onGet('/posts/post-3').reply(200, apiPostDetailFixture)

    const { result } = renderHook(() => usePost('post-3'))

    await waitFor(() => {
      expect(result.current.post?.id).toBe('post-3')
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)

    const storeState = useBlogStore.getState()
    expect(storeState.authorsById['author-1']?.name).toBe('Ada Lovelace')
    expect(storeState.categoriesByPostId['post-3']).toEqual(['cat-4'])
    expect(storeState.categoriesById['cat-4']?.postId).toBe('post-3')
  })

  it('exposes request errors when the post request fails', async () => {
    httpMock.onGet('/posts/missing-post').reply(404)

    const { result } = renderHook(() => usePost('missing-post'))

    await waitFor(() => {
      expect(result.current.error).toBe('Request failed (404) for /posts/missing-post')
    })

    expect(result.current.post).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })
})

import { act, renderHook, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '../../services/api'
import { useBlogStore } from '../../store/blogStore'
import { apiPostsFixture, postsFixture } from '../../test/fixtures/blog'
import { resetBlogStore } from '../../test/utils/resetBlogStore'
import { usePosts } from '../usePosts'

const httpMock = new MockAdapter(apiClient)

describe('usePosts', () => {
  beforeEach(() => {
    httpMock.reset()
    resetBlogStore()
  })

  it('loads posts on mount and maps related entities into the store', async () => {
    httpMock.onGet('/posts').reply(200, apiPostsFixture)

    const { result } = renderHook(() => usePosts())

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(2)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.posts.map((post) => post.id)).toEqual(['post-1', 'post-2'])

    const storeState = useBlogStore.getState()
    expect(storeState.authorsById['author-1']?.name).toBe('Ada Lovelace')
    expect(storeState.authorsById['author-2']?.name).toBe('Grace Hopper')
    expect(storeState.categoriesByPostId['post-1']).toEqual(['cat-1', 'cat-2'])
    expect(storeState.categoriesByPostId['post-2']).toEqual(['cat-2', 'cat-3'])
  })

  it('surfaces request failures and can recover after a reload', async () => {
    httpMock.onGet('/posts').replyOnce(500)
    httpMock.onGet('/posts').replyOnce(200, apiPostsFixture)

    const { result } = renderHook(() => usePosts())

    await waitFor(() => {
      expect(result.current.error).toBe('Request failed (500) for /posts')
    })

    expect(result.current.posts).toEqual([])

    await act(async () => {
      await result.current.reload()
    })

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(2)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns cached posts without issuing another request when already loaded', () => {
    const storeState = useBlogStore.getState()
    storeState.setPosts(postsFixture)

    const { result } = renderHook(() => usePosts())

    expect(result.current.posts.map((post) => post.id)).toEqual(['post-1', 'post-2'])
    expect(httpMock.history.get).toHaveLength(0)
  })
})

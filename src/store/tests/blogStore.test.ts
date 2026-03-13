import { beforeEach, describe, expect, it } from 'vitest'
import { categoriesFixture, postsFixture } from '../../test/fixtures/blog'
import { resetBlogStore } from '../../test/utils/resetBlogStore'
import { useBlogStore } from '../blogStore'

describe('useBlogStore', () => {
  beforeEach(() => {
    resetBlogStore()
  })

  it('starts with the expected initial state', () => {
    const state = useBlogStore.getState()

    expect(state.postIds).toEqual([])
    expect(state.postsById).toEqual({})
    expect(state.hasLoadedPostsList).toBe(false)
    expect(state.isLoadingPosts).toBe(false)
    expect(state.isLoadingPost).toBe(false)
    expect(state.postsError).toBeNull()
    expect(state.postError).toBeNull()
    expect(state.selectedPostId).toBeNull()
  })

  it('sets posts, dedupes ids, and marks the list as loaded', () => {
    const state = useBlogStore.getState()
    state.setPosts([
      postsFixture[0],
      { ...postsFixture[0], title: 'Updated title for duplicate id' },
      postsFixture[1],
    ])

    const nextState = useBlogStore.getState()
    expect(nextState.postIds).toEqual(['post-1', 'post-2'])
    expect(nextState.hasLoadedPostsList).toBe(true)
    expect(nextState.postsById['post-1'].title).toBe('Updated title for duplicate id')
  })

  it('upserts posts while keeping ids unique and newest inserts first', () => {
    const state = useBlogStore.getState()
    state.setPosts([postsFixture[0]])

    state.upsertPost({ ...postsFixture[0], content: 'Updated body' })
    state.upsertPost(postsFixture[1])

    const nextState = useBlogStore.getState()
    expect(nextState.postsById['post-1'].content).toBe('Updated body')
    expect(nextState.postIds).toEqual(['post-2', 'post-1'])
  })

  it('maps categories by id and by post, keeping post category ids deduped', () => {
    const state = useBlogStore.getState()

    state.setCategories([
      { ...categoriesFixture[0], postId: 'post-1' },
      { ...categoriesFixture[1], postId: 'post-1' },
      { ...categoriesFixture[0], postId: 'post-1' },
    ])

    state.setCategoriesForPost('post-2', [
      { ...categoriesFixture[2], postId: 'post-2' },
      { ...categoriesFixture[2], postId: 'post-2' },
    ])

    const nextState = useBlogStore.getState()
    expect(nextState.categoriesByPostId['post-1']).toEqual(['cat-1', 'cat-2'])
    expect(nextState.categoriesByPostId['post-2']).toEqual(['cat-3'])
    expect(nextState.categoriesById['cat-3'].name).toBe('Culture')
  })
})

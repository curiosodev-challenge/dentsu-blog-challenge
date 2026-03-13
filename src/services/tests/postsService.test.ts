import { beforeEach, describe, expect, it } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { apiPostsFixture } from '../../test/fixtures/blog'
import { apiClient } from '../api'
import { getPost, getPosts, normalizePost } from '../postsService'

const httpMock = new MockAdapter(apiClient)

describe('postsService', () => {
  beforeEach(() => {
    httpMock.reset()
  })

  it('fetches all posts from the posts endpoint', async () => {
    httpMock.onGet('/posts').reply(200, apiPostsFixture)

    await expect(getPosts()).resolves.toEqual(apiPostsFixture)
  })

  it('fetches a single post using the post id in the endpoint path', async () => {
    const post = apiPostsFixture[0]
    httpMock.onGet(`/posts/${post.id}`).reply(200, post)

    await expect(getPost(post.id)).resolves.toEqual(post)
  })

  it('normalizes API response keys into the post shape used by the UI', () => {
    const normalizedPost = normalizePost(apiPostsFixture[0])

    expect(normalizedPost).toEqual({
      id: apiPostsFixture[0].id,
      title: apiPostsFixture[0].title,
      content: apiPostsFixture[0].content,
      thumbnailUrl: apiPostsFixture[0].thumbnail_url,
      authorId: apiPostsFixture[0].authorId,
      createdAt: apiPostsFixture[0].createdAt,
      updatedAt: apiPostsFixture[0].updatedAt,
    })
  })
})

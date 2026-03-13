import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePost } from '../../../hooks/usePost'
import { usePosts } from '../../../hooks/usePosts'
import { useBlogStore } from '../../../store/blogStore'
import {
  authorsFixture,
  categoriesFixture,
  postsFixture,
} from '../../../test/fixtures/blog'
import { resetBlogStore } from '../../../test/utils/resetBlogStore'
import { BlogPost } from '../BlogPost'

vi.mock('../../../hooks/usePost', () => ({
  usePost: vi.fn(),
}))

vi.mock('../../../hooks/usePosts', () => ({
  usePosts: vi.fn(),
}))

const usePostMock = vi.mocked(usePost)
const usePostsMock = vi.mocked(usePosts)

const latestPostsFixture = [
  postsFixture[0],
  postsFixture[1],
  {
    ...postsFixture[1],
    id: 'post-3',
    title: 'Reliable Frontend Architecture',
    thumbnailUrl: 'https://images.example.com/post-3.png',
    createdAt: '2026-03-03T10:00:00.000Z',
    updatedAt: '2026-03-03T12:00:00.000Z',
  },
  {
    ...postsFixture[1],
    id: 'post-4',
    title: 'Accessibility in UI Components',
    thumbnailUrl: 'https://images.example.com/post-4.png',
    createdAt: '2026-03-04T10:00:00.000Z',
    updatedAt: '2026-03-04T12:00:00.000Z',
  },
  {
    ...postsFixture[1],
    id: 'post-5',
    title: 'Refactoring with Confidence',
    thumbnailUrl: 'https://images.example.com/post-5.png',
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-03-05T12:00:00.000Z',
  },
]

function seedMetadataState() {
  useBlogStore.setState({
    authorsById: {
      [authorsFixture[0].id]: authorsFixture[0],
      [authorsFixture[1].id]: authorsFixture[1],
    },
    categoriesById: {
      [categoriesFixture[0].id]: categoriesFixture[0],
    },
    categoriesByPostId: {
      'post-1': ['cat-1'],
      'post-2': ['cat-1'],
      'post-3': ['cat-1'],
      'post-4': ['cat-1'],
      'post-5': ['cat-1'],
    },
  })
}

describe('BlogPost', () => {
  beforeEach(() => {
    resetBlogStore()
    seedMetadataState()
    vi.clearAllMocks()
  })

  it('shows a loading state while the requested post is being fetched', () => {
    usePostsMock.mockReturnValue({
      posts: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })
    usePostMock.mockReturnValue({
      post: undefined,
      isLoading: true,
      error: null,
      reload: undefined,
    })

    render(<BlogPost postId="post-1" onBack={vi.fn()} onSelectPost={vi.fn()} />)

    expect(screen.getByText('Loading post details...')).toBeInTheDocument()
  })

  it('renders the error state and allows retrying or navigating back', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const reload = vi.fn().mockResolvedValue(undefined)

    usePostsMock.mockReturnValue({
      posts: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })
    usePostMock.mockReturnValue({
      post: undefined,
      isLoading: false,
      error: 'Request failed (404) for /posts/post-1',
      reload,
    })

    render(<BlogPost postId="post-1" onBack={onBack} onSelectPost={vi.fn()} />)

    expect(
      screen.getByRole('heading', { name: 'Could not load this article' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Request failed (404) for /posts/post-1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry request' }))
    expect(reload).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Back to posts' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders a not-found state when no post is available and no request is pending', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    usePostsMock.mockReturnValue({
      posts: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })
    usePostMock.mockReturnValue({
      post: undefined,
      isLoading: false,
      error: null,
      reload: undefined,
    })

    render(<BlogPost postId="post-1" onBack={onBack} onSelectPost={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to posts' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders the post with latest articles and forwards navigation actions', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const onSelectPost = vi.fn()

    usePostsMock.mockReturnValue({
      posts: latestPostsFixture,
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })
    usePostMock.mockReturnValue({
      post: postsFixture[0],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<BlogPost postId="post-1" onBack={onBack} onSelectPost={onSelectPost} />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Unit Testing React Components' }),
    ).toBeInTheDocument()

    const latestLinks = screen.getAllByRole('link', { name: /Open / })
    expect(latestLinks).toHaveLength(3)
    expect(
      screen.queryByRole('link', { name: 'Open Unit Testing React Components' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('link', { name: 'Open Store Patterns That Scale' }))
    expect(onSelectPost).toHaveBeenCalledWith('post-2')
  })
})

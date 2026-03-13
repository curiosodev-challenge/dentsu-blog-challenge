import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePosts } from '../../../hooks/usePosts'
import { useBlogStore } from '../../../store/blogStore'
import {
  authorsFixture,
  categoriesFixture,
  postsFixture,
} from '../../../test/fixtures/blog'
import { resetBlogStore } from '../../../test/utils/resetBlogStore'
import { BlogList } from '../BlogList'

vi.mock('../../../hooks/usePosts', () => ({
  usePosts: vi.fn(),
}))

const usePostsMock = vi.mocked(usePosts)

function seedMetadataState() {
  useBlogStore.setState({
    authorsById: {
      [authorsFixture[0].id]: authorsFixture[0],
      [authorsFixture[1].id]: authorsFixture[1],
    },
    categoriesById: {
      [categoriesFixture[0].id]: categoriesFixture[0],
      [categoriesFixture[1].id]: categoriesFixture[1],
    },
    categoriesByPostId: {
      'post-1': ['cat-1'],
      'post-2': ['cat-2'],
    },
  })
}

describe('BlogList', () => {
  beforeEach(() => {
    resetBlogStore()
    seedMetadataState()
    vi.clearAllMocks()
  })

  it('renders a critical error screen when posts cannot be loaded initially', async () => {
    const user = userEvent.setup()
    const reload = vi.fn()

    usePostsMock.mockReturnValue({
      posts: [],
      isLoading: false,
      error: 'Request failed (500) for /posts',
      reload,
    })

    render(<BlogList onSelectPost={vi.fn()} />)

    expect(
      screen.getByRole('heading', { name: 'Could not load the blog feed' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Request failed (500) for /posts')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry request' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('shows an inline error when cached posts exist and retries on demand', async () => {
    const user = userEvent.setup()
    const reload = vi.fn()

    usePostsMock.mockReturnValue({
      posts: postsFixture,
      isLoading: false,
      error: 'Temporary failure while refreshing',
      reload,
    })

    render(<BlogList onSelectPost={vi.fn()} />)

    const alert = screen.getByRole('alert')
    expect(
      within(alert).getByText('Temporary failure while refreshing'),
    ).toBeInTheDocument()

    await user.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('sorts posts by newest first by default and toggles to oldest first', async () => {
    const user = userEvent.setup()

    usePostsMock.mockReturnValue({
      posts: postsFixture,
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<BlogList onSelectPost={vi.fn()} />)

    const newestFirstLinks = screen.getAllByRole('link', { name: /Open / })
    expect(newestFirstLinks[0]).toHaveAccessibleName('Open Store Patterns That Scale')

    const newestFirstButtons = screen.getAllByRole('button', { name: 'Newest first' })
    await user.click(newestFirstButtons[0])

    const oldestFirstLinks = screen.getAllByRole('link', { name: /Open / })
    expect(oldestFirstLinks[0]).toHaveAccessibleName('Open Unit Testing React Components')
  })

  it('applies sidebar category filters and emits selected post id on click', async () => {
    const user = userEvent.setup()
    const onSelectPost = vi.fn()

    usePostsMock.mockReturnValue({
      posts: postsFixture,
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<BlogList onSelectPost={onSelectPost} />)

    await user.click(screen.getByRole('button', { name: 'Frontend' }))
    await user.click(screen.getByRole('button', { name: 'Apply filters' }))

    const filteredLinks = screen.getAllByRole('link', { name: /Open / })
    expect(filteredLinks).toHaveLength(1)
    expect(filteredLinks[0]).toHaveAccessibleName('Open Unit Testing React Components')

    await user.click(filteredLinks[0])
    expect(onSelectPost).toHaveBeenCalledWith('post-1')
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  authorsFixture,
  categoriesFixture,
  postsFixture,
} from '../../../test/fixtures/blog'
import { PostList } from '../PostList'

describe('PostList', () => {
  it('renders a custom empty state when no posts are available', () => {
    render(
      <PostList
        posts={[]}
        authorsById={{}}
        categoriesById={{}}
        categoriesByPostId={{}}
        onSelectPost={vi.fn()}
        emptyText="Nothing to show."
      />,
    )

    expect(screen.getByText('Nothing to show.')).toBeInTheDocument()
  })

  it('renders mapped post cards and forwards post selection events', async () => {
    const user = userEvent.setup()
    const onSelectPost = vi.fn()

    render(
      <PostList
        posts={[postsFixture[0]]}
        authorsById={{ [authorsFixture[0].id]: authorsFixture[0] }}
        categoriesById={{
          [categoriesFixture[0].id]: categoriesFixture[0],
        }}
        categoriesByPostId={{
          'post-1': ['cat-1', 'missing-category'],
        }}
        onSelectPost={onSelectPost}
      />,
    )

    expect(screen.getByRole('region', { name: 'Posts list' })).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()

    const postLink = screen.getByRole('link', {
      name: 'Open Unit Testing React Components',
    })
    await user.click(postLink)

    expect(onSelectPost).toHaveBeenCalledWith('post-1')
  })
})

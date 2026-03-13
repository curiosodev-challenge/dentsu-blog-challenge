import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  authorsFixture,
  categoriesFixture,
  postsFixture,
} from '../../../test/fixtures/blog'
import { PostCard } from '../PostCard'

describe('PostCard', () => {
  it('renders key post content and triggers selection when the card is opened', async () => {
    const user = userEvent.setup()
    const onSelectPost = vi.fn()

    render(
      <PostCard
        post={postsFixture[0]}
        author={authorsFixture[0]}
        categories={categoriesFixture.slice(0, 2)}
        onSelectPost={onSelectPost}
      />,
    )

    const openLink = screen.getByRole('link', {
      name: `Open ${postsFixture[0].title}`,
    })

    expect(openLink).toHaveAttribute('href', '?post=post-1')
    expect(screen.getByRole('img', { name: postsFixture[0].title })).toBeInTheDocument()
    expect(screen.getByText(postsFixture[0].content)).toBeInTheDocument()

    await user.click(openLink)
    expect(onSelectPost).toHaveBeenCalledTimes(1)
    expect(onSelectPost).toHaveBeenCalledWith('post-1')
  })

  it('shows only the first two category chips and falls back to unknown author', () => {
    render(
      <PostCard
        post={postsFixture[0]}
        categories={categoriesFixture}
        onSelectPost={vi.fn()}
      />,
    )

    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
    expect(screen.queryByText('Culture')).not.toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})

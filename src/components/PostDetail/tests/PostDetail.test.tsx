import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { authorsFixture, postsFixture } from '../../../test/fixtures/blog'
import { PostDetail } from '../PostDetail'

describe('PostDetail', () => {
  it('renders post content, hero image, and author metadata', () => {
    const post = {
      ...postsFixture[0],
      content: 'First paragraph.\n\nSecond paragraph.',
    }

    render(<PostDetail post={post} author={authorsFixture[0]} />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Unit Testing React Components' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: post.title })).toHaveAttribute(
      'src',
      post.thumbnailUrl,
    )
    expect(screen.getByText('First paragraph.')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('falls back to unknown author when author data is not available', () => {
    render(<PostDetail post={postsFixture[0]} />)

    expect(screen.getByText('Unknown author')).toBeInTheDocument()
  })
})

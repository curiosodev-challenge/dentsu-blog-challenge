import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatReadableDate } from '../../../utils/date'
import { AuthorBadge } from '../AuthorBadge'

describe('AuthorBadge', () => {
  it('renders author metadata with avatar when a profile picture is provided', () => {
    const createdAt = '2026-03-03T12:00:00.000Z'

    render(
      <AuthorBadge
        name="Ada Lovelace"
        profilePicture="https://images.example.com/ada.png"
        createdAt={createdAt}
      />,
    )

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ada Lovelace avatar' })).toHaveAttribute(
      'src',
      'https://images.example.com/ada.png',
    )
    expect(screen.getByText(formatReadableDate(createdAt))).toHaveAttribute(
      'dateTime',
      createdAt,
    )
  })

  it('falls back to unknown author and placeholder initial when data is missing', () => {
    render(<AuthorBadge createdAt="invalid-date" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Unknown author')).toBeInTheDocument()
    expect(screen.getByText('U', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Unknown date')).toBeInTheDocument()
  })
})

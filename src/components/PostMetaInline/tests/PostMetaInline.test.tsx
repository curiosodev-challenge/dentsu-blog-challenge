import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatReadableDate } from '../../../utils/date'
import { PostMetaInline } from '../PostMetaInline'

describe('PostMetaInline', () => {
  it('shows formatted date and author last name', () => {
    const createdAt = '2026-03-01T10:00:00.000Z'

    render(<PostMetaInline createdAt={createdAt} authorName="Ada Lovelace" />)

    expect(screen.getByText(formatReadableDate(createdAt))).toHaveAttribute(
      'dateTime',
      createdAt,
    )
    expect(screen.getByText('Lovelace')).toBeInTheDocument()
  })

  it('falls back to unknown author last name when author is missing', () => {
    render(<PostMetaInline createdAt="invalid-date" />)

    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('Unknown date')).toBeInTheDocument()
  })
})

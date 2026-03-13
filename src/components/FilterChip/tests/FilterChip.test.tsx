import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterChip } from '../FilterChip'

describe('FilterChip', () => {
  it('renders as static text when no click handler is provided', () => {
    render(<FilterChip label="Frontend" />)

    expect(screen.getByText('Frontend', { selector: 'span' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Frontend' })).not.toBeInTheDocument()
  })

  it('renders as a button and triggers click callbacks when interactive', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<FilterChip label="Testing" active onClick={onClick} />)

    const chipButton = screen.getByRole('button', { name: 'Testing' })
    await user.click(chipButton)

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

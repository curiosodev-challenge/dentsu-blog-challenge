import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SortByControl } from '../SortByControl'

describe('SortByControl', () => {
  it('shows newest-first state and toggles to ascending order', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<SortByControl value="desc" onChange={onChange} />)

    expect(screen.getByText('Sort by:')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Newest first' }))
    expect(onChange).toHaveBeenCalledWith('asc')
  })

  it('supports hidden label mode and toggles ascending back to descending', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<SortByControl value="asc" onChange={onChange} showLabel={false} />)

    expect(screen.queryByText('Sort by:')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Oldest first' }))
    expect(onChange).toHaveBeenCalledWith('desc')
  })
})

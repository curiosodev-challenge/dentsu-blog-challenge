import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RequestErrorScreen } from '../RequestErrorScreen'

describe('RequestErrorScreen', () => {
  it('renders error content and triggers both primary and secondary actions', async () => {
    const user = userEvent.setup()
    const onPrimaryAction = vi.fn()
    const onSecondaryAction = vi.fn()

    render(
      <RequestErrorScreen
        title="Could not load page"
        message="Please try again."
        details="Request failed (500)"
        primaryActionLabel="Retry"
        onPrimaryAction={onPrimaryAction}
        secondaryActionLabel="Back"
        onSecondaryAction={onSecondaryAction}
      />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Could not load page' })).toBeInTheDocument()
    expect(screen.getByText('Please try again.')).toBeInTheDocument()
    expect(screen.getByText('Request failed (500)')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onPrimaryAction).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(onSecondaryAction).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Go to blog list' }))
    expect(onSecondaryAction).toHaveBeenCalledTimes(2)
  })

  it('hides optional details and secondary action when not provided', () => {
    render(
      <RequestErrorScreen
        title="Could not load page"
        message="Please try again."
        primaryActionLabel="Retry"
        onPrimaryAction={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Go to blog list' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })
})

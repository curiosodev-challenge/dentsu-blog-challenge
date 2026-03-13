import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button'

describe('Button', () => {
  it('defaults to button type and forwards click events', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('supports submit type, disabled state, and left icon content', () => {
    render(
      <Button
        type="submit"
        variant="secondary"
        fullWidth
        disabled
        iconLeft={<i data-testid="left-icon" />}
      >
        Publish
      </Button>,
    )

    const button = screen.getByRole('button', { name: /Publish/ })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeDisabled()
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })
})

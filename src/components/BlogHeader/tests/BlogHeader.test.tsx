import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BlogHeader } from '../BlogHeader'

type QueryListener = (event: MediaQueryListEvent) => void

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches
  const listeners = new Set<QueryListener>()

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(min-width: 40rem)',
      onchange: null,
      addEventListener: (_type: 'change', listener: QueryListener) => {
        listeners.add(listener)
      },
      removeEventListener: (_type: 'change', listener: QueryListener) => {
        listeners.delete(listener)
      },
      addListener: (listener: QueryListener) => {
        listeners.add(listener)
      },
      removeListener: (listener: QueryListener) => {
        listeners.delete(listener)
      },
      dispatchEvent: () => true,
    })),
  })

  return {
    setMatches: (next: boolean) => {
      matches = next
    },
    triggerChange: () => {
      const event = {
        matches,
        media: '(min-width: 40rem)',
      } as MediaQueryListEvent
      listeners.forEach((listener) => listener(event))
    },
  }
}

describe('BlogHeader', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('renders branding as a posts anchor and invokes callback when provided', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)

    const { rerender } = render(<BlogHeader />)

    expect(screen.getByRole('link', { name: 'Go to posts page' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByAltText('Dentsu logo')).toBeInTheDocument()

    const onLogoClick = vi.fn()
    rerender(<BlogHeader onLogoClick={onLogoClick} />)

    await user.click(screen.getByRole('link', { name: 'Go to posts page' }))
    expect(onLogoClick).toHaveBeenCalledTimes(1)
  })

  it('opens desktop autocomplete on focus, filters options, and submits a suggestion', async () => {
    const user = userEvent.setup()
    mockMatchMedia(true)
    const onSearchSubmit = vi.fn()

    render(
      <BlogHeader
        onSearchSubmit={onSearchSubmit}
        searchOptions={[
          { id: 'option-1', label: 'Frontend Testing' },
          { id: 'option-2', label: 'React Hooks' },
        ]}
      />,
    )

    const searchInput = screen.getByRole('searchbox', { name: 'Search posts' })
    await user.click(searchInput)
    expect(screen.getByRole('button', { name: 'Frontend Testing' })).toBeInTheDocument()

    await user.type(searchInput, 'hooks')
    expect(screen.queryByRole('button', { name: 'Frontend Testing' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'React Hooks' }))
    expect(onSearchSubmit).toHaveBeenCalledWith('React Hooks')
    expect(searchInput).toHaveValue('React Hooks')
  })

  it('opens mobile search, shows empty state for unmatched query, and closes on escape', async () => {
    const user = userEvent.setup()
    const query = mockMatchMedia(false)

    render(
      <BlogHeader
        searchOptions={[
          { id: 'option-1', label: 'Frontend' },
          { id: 'option-2', label: 'Testing' },
        ]}
      />,
    )

    expect(document.body.style.overflow).toBe('')

    await user.click(screen.getByRole('button', { name: 'Open search' }))
    expect(screen.getAllByRole('button', { name: 'Close search' })).toHaveLength(2)
    expect(document.body.style.overflow).toBe('hidden')

    const searchInput = screen.getByRole('searchbox', { name: 'Search posts' })
    await user.clear(searchInput)
    await user.type(searchInput, 'zzz')
    expect(screen.getByText('No matches found.')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryAllByRole('button', { name: 'Close search' })).toHaveLength(0)
    expect(document.body.style.overflow).toBe('')

    await user.click(screen.getByRole('button', { name: 'Open search' }))
    query.setMatches(true)
    act(() => {
      query.triggerChange()
    })
    await waitFor(() => {
      expect(screen.queryAllByRole('button', { name: 'Close search' })).toHaveLength(0)
    })
  })
})

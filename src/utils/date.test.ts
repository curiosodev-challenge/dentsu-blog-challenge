import { describe, expect, it } from 'vitest'
import { formatReadableDate } from './date'

describe('formatReadableDate', () => {
  it('formats ISO date values into a readable string', () => {
    const formattedDate = formatReadableDate('2026-03-10T06:45:45.525Z')
    expect(formattedDate).toContain('2026')
  })

  it('returns fallback text for invalid dates', () => {
    expect(formatReadableDate('invalid-date')).toBe('Unknown date')
  })
})

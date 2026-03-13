export function getLastName(fullName: string | undefined, fallback = 'Unknown'): string {
  const normalizedName = fullName?.trim()

  if (!normalizedName) {
    return fallback
  }

  const parts = normalizedName.split(/\s+/)
  return parts[parts.length - 1]
}

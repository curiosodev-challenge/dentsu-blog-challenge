export function toErrorMessage(value: unknown): string {
  if (value instanceof Error) {
    return value.message
  }

  return 'Unexpected error'
}

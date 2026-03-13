import moment from 'moment'

export function toUnixTimestamp(value: string): number {
  const strictIsoDate = moment(value, moment.ISO_8601, true)
  if (strictIsoDate.isValid()) {
    return strictIsoDate.valueOf()
  }

  const fallbackDate = moment(new Date(value))
  return fallbackDate.isValid() ? fallbackDate.valueOf() : 0
}

export function formatReadableDate(value: string): string {
  const unixTimestamp = toUnixTimestamp(value)
  if (unixTimestamp === 0) {
    return 'Unknown date'
  }

  return moment(unixTimestamp).format('MMM DD, YYYY')
}

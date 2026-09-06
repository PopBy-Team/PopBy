export const THOUGHT_TIMESTAMP_OPTIONS = Object.freeze({
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatThoughtTimestamp(value, locale = []) {
  return new Date(value).toLocaleString(locale, THOUGHT_TIMESTAMP_OPTIONS)
}

export function getSwipeIndicatorState(direction = 'idle', sequence = 0) {
  return { direction, sequence }
}

export function advanceSwipeIndicator(previous, direction) {
  return getSwipeIndicatorState(direction, previous.sequence + 1)
}

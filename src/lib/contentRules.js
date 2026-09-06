export const THOUGHT_WORD_LIMIT = 150
export const MUSIC_LINK_MAX_LENGTH = 300

export function countWords(value = '') {
  const clean = String(value).trim()
  return clean ? clean.split(/\s+/).length : 0
}

export function hasThoughtText(value = '') {
  return String(value).trim().length >= 1
}

export const BACKGROUND_OPTIONS = Object.freeze([
  { value: 'lined', label: 'Paper lines', type: 'lined', color: 'white' },
  { value: 'grid', label: 'Paper grid', type: 'grid', color: 'white' },
  { value: 'dots', label: 'Paper dots', type: 'dots', color: 'white' },
  { value: 'white', label: 'White', type: 'solid', color: 'white' },
  { value: 'sage', label: 'Sage', type: 'solid', color: 'sage' },
  { value: 'rose', label: 'Dusty rose', type: 'solid', color: 'rose' },
  { value: 'clay', label: 'Clay', type: 'solid', color: 'clay' },
  { value: 'blue', label: 'Muted blue', type: 'solid', color: 'blue' },
  { value: 'lavender', label: 'Lavender', type: 'solid', color: 'lavender' },
  { value: 'photo', label: 'Live photo', type: 'photo', color: 'white' },
])

export const FONT_OPTIONS = Object.freeze([
  { value: 'caveat', label: 'Caveat' },
  { value: 'patrick-hand', label: 'Patrick Hand' },
  { value: 'homemade-apple', label: 'Homemade Apple' },
  { value: 'island-moments', label: 'Island Moments' },
])

export const FONT_SIZE_OPTIONS = Object.freeze([
  { value: 14, label: 'Small · 14 pt' },
  { value: 16, label: 'Medium · 16 pt' },
  { value: 18, label: 'Big · 18 pt' },
])

export const BACKGROUND_TYPES = Object.freeze(['solid', 'lined', 'grid', 'dots', 'photo'])
export const BACKGROUND_COLORS = Object.freeze(['white', 'sage', 'rose', 'clay', 'blue', 'lavender'])

const FONT_VALUES = new Set(FONT_OPTIONS.map(({ value }) => value))
const FONT_SIZE_VALUES = new Set(FONT_SIZE_OPTIONS.map(({ value }) => value))
const BACKGROUND_TYPE_VALUES = new Set(BACKGROUND_TYPES)
const BACKGROUND_COLOR_VALUES = new Set(BACKGROUND_COLORS)

export function normalizeCardAppearance(input = {}) {
  const requestedType = input.backgroundType ?? input.background_type
  const requestedColor = input.backgroundColor ?? input.background_color
  const requestedFont = input.fontFamily ?? input.font_family
  const requestedSize = Number(input.fontSize ?? input.font_size)

  return {
    backgroundType: BACKGROUND_TYPE_VALUES.has(requestedType) ? requestedType : 'solid',
    backgroundColor: BACKGROUND_COLOR_VALUES.has(requestedColor) ? requestedColor : 'white',
    fontFamily: FONT_VALUES.has(requestedFont) ? requestedFont : 'caveat',
    fontSize: FONT_SIZE_VALUES.has(requestedSize) ? requestedSize : 14,
  }
}

export function isValidCardAppearance(input = {}) {
  const normalized = normalizeCardAppearance(input)
  const requestedType = input.backgroundType ?? input.background_type ?? 'solid'
  const requestedColor = input.backgroundColor ?? input.background_color ?? 'white'
  const requestedFont = input.fontFamily ?? input.font_family ?? 'caveat'
  const requestedSize = Number(input.fontSize ?? input.font_size ?? 14)

  return normalized.backgroundType === requestedType &&
    normalized.backgroundColor === requestedColor &&
    normalized.fontFamily === requestedFont &&
    normalized.fontSize === requestedSize
}

export function isComposerTextLocked(activeTool) {
  return activeTool === 'background' || activeTool === 'font' || activeTool === 'size'
}

export function backgroundOptionToAppearance(option) {
  if (!option) return normalizeCardAppearance()
  return {
    backgroundType: option.type,
    backgroundColor: option.color,
  }
}

export function cardAppearanceClassNames(input = {}) {
  const appearance = normalizeCardAppearance(input)
  return [
    `bg-${appearance.backgroundType}`,
    `color-${appearance.backgroundColor}`,
    `font-${appearance.fontFamily}`,
    `size-${appearance.fontSize}`,
  ].join(' ')
}

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BACKGROUND_OPTIONS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  cardAppearanceClassNames,
  normalizeCardAppearance,
} from '../src/lib/cardAppearance.js'

test('card appearance defaults to white Caveat at 12pt', () => {
  assert.deepEqual(normalizeCardAppearance({}), {
    backgroundType: 'solid',
    backgroundColor: 'white',
    fontFamily: 'caveat',
    fontSize: 12,
  })
})

test('card appearance produces shared editor and reader classes', () => {
  assert.equal(
    cardAppearanceClassNames({
      background_type: 'dots',
      background_color: 'sage',
      font_family: 'homemade-apple',
      font_size: 16,
    }),
    'bg-dots color-sage font-homemade-apple size-16',
  )
})

test('appearance menus expose the exact paper, Morandi, font, and size choices', () => {
  assert.deepEqual(
    BACKGROUND_OPTIONS.map(({ value }) => value),
    ['lined', 'grid', 'dots', 'white', 'sage', 'rose', 'clay', 'blue', 'lavender', 'photo'],
  )
  assert.deepEqual(
    FONT_OPTIONS.map(({ value }) => value),
    ['caveat', 'patrick-hand', 'homemade-apple', 'island-moments'],
  )
  assert.deepEqual(FONT_SIZE_OPTIONS.map(({ value }) => value), [16, 14, 12])
})

test('invalid persisted appearance values fall back to safe mobile defaults', () => {
  assert.deepEqual(normalizeCardAppearance({
    background_type: 'neon',
    background_color: 'red',
    font_family: 'comic-sans',
    font_size: 99,
  }), {
    backgroundType: 'solid',
    backgroundColor: 'white',
    fontFamily: 'caveat',
    fontSize: 12,
  })
})

test('persisted 10pt cards normalize to the new readable default', () => {
  assert.equal(normalizeCardAppearance({ font_size: 10 }).fontSize, 12)
  assert.equal(normalizeCardAppearance({ font_size: 16 }).fontSize, 16)
})

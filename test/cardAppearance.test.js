import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BACKGROUND_OPTIONS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  cardAppearanceClassNames,
  normalizeCardAppearance,
} from '../src/lib/cardAppearance.js'
import * as appearance from '../src/lib/cardAppearance.js'

test('card appearance defaults to white Caveat at the small 14pt size', () => {
  assert.deepEqual(normalizeCardAppearance({}), {
    backgroundType: 'solid',
    backgroundColor: 'white',
    fontFamily: 'caveat',
    fontSize: 14,
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
  assert.deepEqual(FONT_SIZE_OPTIONS, [
    { value: 14, label: 'Small · 14 pt' },
    { value: 16, label: 'Medium · 16 pt' },
    { value: 18, label: 'Big · 18 pt' },
  ])
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
    fontSize: 14,
  })
})

test('legacy font sizes normalize to the new readable default', () => {
  assert.equal(normalizeCardAppearance({ font_size: 10 }).fontSize, 14)
  assert.equal(normalizeCardAppearance({ font_size: 12 }).fontSize, 14)
  assert.equal(normalizeCardAppearance({ font_size: 16 }).fontSize, 16)
  assert.equal(normalizeCardAppearance({ font_size: 18 }).fontSize, 18)
})

test('style menus temporarily lock text entry until a choice closes them', () => {
  assert.equal(typeof appearance.isComposerTextLocked, 'function')
  assert.equal(appearance.isComposerTextLocked(null), false)
  assert.equal(appearance.isComposerTextLocked('background'), true)
  assert.equal(appearance.isComposerTextLocked('font'), true)
  assert.equal(appearance.isComposerTextLocked('size'), true)
})

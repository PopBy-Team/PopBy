import test from 'node:test'
import assert from 'node:assert/strict'

import { CATEGORY_ICONS } from '../src/data/categories.js'

test('category visuals match the approved mobile icon set', () => {
  assert.deepEqual(CATEGORY_ICONS, {
    Animals: '🐾',
    Nature: '🌳',
    Eat: '🍴',
    Art: '🎨',
    Place: '📍',
    Sound: '🎵',
    Moment: '✨',
  })
})

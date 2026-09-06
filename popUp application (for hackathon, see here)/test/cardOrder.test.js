import test from 'node:test'
import assert from 'node:assert/strict'

import { buildThoughtDeck } from '../src/lib/cardOrder.js'

function thoughts(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `thought-${index + 1}`,
    created_at: new Date(Date.UTC(2026, 8, 5, 8, index)).toISOString(),
  }))
}

test('the card deck keeps the newest first and oldest last', () => {
  const deck = buildThoughtDeck(thoughts(18))

  assert.equal(deck[0].id, 'thought-18')
  assert.equal(deck.at(-1).id, 'thought-1')
})

test('the card deck contains every Thought exactly once before looping', () => {
  const input = thoughts(24)
  const deck = buildThoughtDeck(input)

  assert.equal(deck.length, input.length)
  assert.equal(new Set(deck.map((thought) => thought.id)).size, input.length)
})

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MUSIC_LINK_MAX_LENGTH,
  THOUGHT_WORD_LIMIT,
  countWords,
} from '../src/lib/contentRules.js'

test('content rules cap a Thought after its 150th word', () => {
  assert.equal(THOUGHT_WORD_LIMIT, 150)
  assert.equal(MUSIC_LINK_MAX_LENGTH, 300)
  assert.equal(countWords('one  two\nthree'), 3)
  assert.equal(countWords('   '), 0)
})

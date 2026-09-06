import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MUSIC_LINK_MAX_LENGTH,
  THOUGHT_WORD_LIMIT,
  countWords,
} from '../src/lib/contentRules.js'
import * as contentRules from '../src/lib/contentRules.js'

test('content rules cap a Thought after its 150th word', () => {
  assert.equal(THOUGHT_WORD_LIMIT, 150)
  assert.equal(MUSIC_LINK_MAX_LENGTH, 300)
  assert.equal(countWords('one  two\nthree'), 3)
  assert.equal(countWords('   '), 0)
})

test('a Thought needs at least one visible character while BGM remains optional', () => {
  assert.equal(typeof contentRules.hasThoughtText, 'function')
  assert.equal(contentRules.hasThoughtText(''), false)
  assert.equal(contentRules.hasThoughtText('  \n '), false)
  assert.equal(contentRules.hasThoughtText('✨'), true)
  assert.equal(contentRules.hasThoughtText('a'), true)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('Supabase seed mirrors the three nearby demo categories and new font sizes', async () => {
  const sql = await readFile(new URL('../supabase/seed_demo.sql', import.meta.url), 'utf8')
  const nearbyRows = sql
    .split('\n')
    .filter((line) => /00000000010[1-3]'/.test(line) && /0000000010/.test(line))
    .join('\n')

  assert.match(nearbyRows, /'Sound'/)
  assert.match(nearbyRows, /'Nature'/)
  assert.match(nearbyRows, /'Animals'/)
  assert.doesNotMatch(sql, /'homemade-apple', 12/)
  assert.match(sql, /'homemade-apple', 18/)
  assert.doesNotMatch(sql, /'[^']+', null, '(?:solid|lined|grid|dots|photo)'/)
})

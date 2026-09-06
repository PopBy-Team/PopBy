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
  assert.match(sql, /Gough_Whitlam_-_Its_Time_-_Whitlam_Park_or_Place\.jpg/)
  assert.match(sql, /Photo: Star A Star · CC BY-SA 4\.0/)
  assert.match(sql, /144\.97985219726195, -37\.80160727412293/)
})

test('the legacy map refinement cannot move Whitlam Place demo nodes back to their old anchors', async () => {
  const sql = await readFile(
    new URL('../supabase/upgrade_mobile_map_card_refinement.sql', import.meta.url),
    'utf8',
  )

  assert.match(sql, /144\.97985219726195, -37\.80160727412293/)
  assert.match(sql, /144\.98010583519937, -37\.8016060123155/)
  assert.match(sql, /144\.97986508448895, -37\.80179492422676/)
  assert.doesNotMatch(sql, /144\.97833614338754, -37\.80058074253888/)
})

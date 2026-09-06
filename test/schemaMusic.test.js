import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

for (const relativePath of [
  '../supabase/schema.sql',
  '../supabase/upgrade_bgm_allowlist.sql',
]) {
  test(`${relativePath} enforces the same official track provider allowlist`, async () => {
    const sql = await readFile(new URL(relativePath, import.meta.url), 'utf8')

    assert.match(sql, /is_supported_music_url/i)
    assert.match(sql, /open.*spotify.*com/i)
    assert.match(sql, /music.*apple.*com/i)
    assert.match(sql, /music.*youtube.*com/i)
    assert.match(sql, /Invalid music link/)
    if (relativePath.includes('upgrade_bgm_allowlist')) {
      assert.doesNotMatch(sql, /delete\s+from\s+public\.thoughts/i)
    }
  })
}

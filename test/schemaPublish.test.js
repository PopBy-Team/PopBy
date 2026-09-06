import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

for (const relativePath of [
  '../supabase/schema.sql',
  '../supabase/upgrade_thought_creation_refinement.sql',
]) {
  test(`${relativePath} requires text, accepts 14/16/18pt, and avoids automatic node merging`, async () => {
    const sql = await readFile(new URL(relativePath, import.meta.url), 'utf8')
    const start = sql.search(/create(?: or replace)? function public\.publish_thought\(/)
    const end = sql.indexOf('revoke all on function public.publish_thought(', start)
    const publish = sql.slice(start, end)

    assert.match(publish, /p_font_size smallint default 14/)
    assert.match(publish, /p_font_size not in \(14, 16, 18\)/)
    assert.match(publish, /Thought text is required/)
    assert.match(publish, /coalesce\(p_body, ''\) !~ '\[\^\[:space:\]\]'/)
    assert.doesNotMatch(
      publish,
      /where extensions\.st_dwithin\(l\.geom, v_safe, 20\)\s+order by extensions\.st_distance/,
    )
  })
}

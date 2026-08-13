import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('sai UI skin targets the official DSH DOM contracts', async () => {
  const source = await readFile(new URL('../packages/ui/client.js', import.meta.url), 'utf8')
  assert.match(source, /data-slot='conversation\.session'/)
  assert.match(source, /data-sidebar-collapsed/)
  assert.match(source, /\[data-tool\]\[data-state/)
  assert.doesNotMatch(source, /data-tool-call/)
  assert.doesNotMatch(source, /\[data-sidebar\]/)
})

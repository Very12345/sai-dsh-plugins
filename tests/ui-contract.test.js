import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('sai UI skin targets the official DSH DOM contracts', async () => {
  const source = await readFile(new URL('../packages/ui/client.js', import.meta.url), 'utf8')
  assert.match(source, /data-slot='conversation\.session'/)
  assert.match(source, /data-sidebar-collapsed/)
  assert.match(source, /\[data-tool\]\[data-state/)
  assert.doesNotMatch(source, /data-tool-call/)
  assert.doesNotMatch(source, /button\[aria-label='打开侧边栏'\]/)
  assert.match(source, /sai:navigation-toggle/)
  assert.doesNotMatch(source, /从 sai 开始/)
  assert.doesNotMatch(source, /sai-dsh-wordmark/)
  assert.doesNotMatch(source, /\.innerHTML\s*=/)
  assert.doesNotMatch(source, /\.outerHTML\s*=/)
  assert.match(source, /heading !== '内测声明'/)
  assert.match(source, /window\.__ModuleLoader__\.load/)
  assert.doesNotMatch(source, /export function apply/)

  const standalone = await readFile(new URL('../packages/ui/standalone.js', import.meta.url), 'utf8')
  assert.match(standalone, /__SAI_UI_PLUGIN__/)
  assert.doesNotMatch(standalone, /从 sai 开始/)
  assert.doesNotMatch(standalone, /sai-dsh-wordmark/)
  assert.doesNotMatch(standalone, /sai:navigation-toggle/)
})

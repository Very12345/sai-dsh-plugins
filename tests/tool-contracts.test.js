import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('voice plugin registers speak and enforces active-call tool use', async () => {
  const source = await readFile(new URL('../packages/voice/index.js', import.meta.url), 'utf8')
  assert.match(source, /name:\s*'speak'/)
  assert.match(source, /MUST call speak exactly once/)
  assert.match(source, /ctx\.saiAndroid\.call\('speak'/)
  assert.match(source, /promptOnly === true/)
  assert.match(source, /header\?\.agentPreset === 'sai-voice'/)
})

test('artifacts plugin registers in-app open, save, share and URL tools', async () => {
  const source = await readFile(new URL('../packages/artifacts/index.js', import.meta.url), 'utf8')
  assert.match(source, /name:\s*'export_artifact'/)
  assert.match(source, /enum:\s*\['open', 'save', 'share'\]/)
  assert.match(source, /ctx\.saiAndroid\.call\('export'/)
  assert.match(source, /name:\s*'open_url'/)
  assert.match(source, /ctx\.saiAndroid\.call\('open_url'/)
})

test('vision plugin routes image evidence without changing the main model', async () => {
  const source = await readFile(new URL('../packages/vision/index.js', import.meta.url), 'utf8')
  assert.match(source, /agent\/pre-step/)
  assert.match(source, /inputModalities.*includes\('image'\)/s)
  assert.match(source, /const provider = agent\.options\.provider/)
  assert.match(source, /sai visual observation/)
})

test('mobile UI bounds popup height and safely normalizes legacy custom permissions', async () => {
  const client = await readFile(new URL('../packages/ui/client.js', import.meta.url), 'utf8')
  const host = await readFile(new URL('../packages/ui/index.js', import.meta.url), 'utf8')
  assert.match(client, /max-height: min\(78dvh, 640px\)/)
  assert.doesNotMatch(client, /\[role='dialog'\][\s\S]*?max-height: none/)
  assert.match(host, /current\(session\.events\) !== 'custom'/)
  assert.match(host, /sandbox === 'read-only' \? 'read-only' : 'workspace-write'/)
  assert.doesNotMatch(host, /'danger-full-access'/)
})

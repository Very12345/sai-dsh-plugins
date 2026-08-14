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

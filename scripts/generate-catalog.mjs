import { createHash, createPrivateKey, sign } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('../', import.meta.url)
const packagesRoot = new URL('../packages/', import.meta.url)
const out = new URL('../dist/catalog/', import.meta.url)
const entries = []

for (const directory of (await readdir(packagesRoot, { withFileTypes: true })).filter(item => item.isDirectory())) {
  const packageUrl = new URL(`../packages/${directory.name}/`, import.meta.url)
  const manifestBytes = await readFile(new URL('package.json', packageUrl))
  const manifest = JSON.parse(manifestBytes)
  const files = []
  for (const name of manifest.files ?? []) {
    const bytes = await readFile(new URL(name, packageUrl))
    files.push({ path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
  }
  entries.push({
    id: manifest.name,
    version: manifest.version,
    license: manifest.license,
    dshVersion: manifest.sai.dshVersion,
    androidBridge: manifest.sai.androidBridge ?? manifest.sai.bridge ?? null,
    permissions: manifest.sai.permissions,
    bundle: manifest.dsh.bundle,
    client: manifest.dsh.client ?? null,
    files,
  })
}

const payload = JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  repository: process.env.GITHUB_REPOSITORY ?? 'Very12345/sai-dsh-plugins',
  topic: 'dsh-plugin',
  packages: entries.sort((a, b) => a.id.localeCompare(b.id)),
})
const privateKey = process.env.SAI_CATALOG_ED25519_PRIVATE_KEY
if (!privateKey) throw new Error('SAI_CATALOG_ED25519_PRIVATE_KEY is required; unsigned catalogs are forbidden')
const signature = sign(null, Buffer.from(payload), createPrivateKey(privateKey)).toString('base64')
await mkdir(out, { recursive: true })
await writeFile(new URL('index.json', out), payload)
await writeFile(new URL('index.json.sig', out), signature + '\n')
await writeFile(new URL('index.sha256', out), createHash('sha256').update(payload).digest('hex') + '\n')

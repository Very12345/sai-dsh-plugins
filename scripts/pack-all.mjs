import { mkdir, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const rootUrl = new URL('../packages/', import.meta.url)
const root = fileURLToPath(rootUrl)
const dist = fileURLToPath(new URL('../dist/', import.meta.url))
await mkdir(dist, { recursive: true })
for (const name of await readdir(rootUrl)) {
  const cwd = join(root, name)
  if (!(await stat(cwd)).isDirectory()) continue
  const result = spawnSync('npm', ['pack', '--ignore-scripts', '--pack-destination', dist], { cwd, stdio: 'inherit', shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

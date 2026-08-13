import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
test('every first-party package is a prebuilt DSH bundle without lifecycle scripts',async()=>{const rootUrl=new URL('../packages/',import.meta.url);const root=fileURLToPath(rootUrl);for(const name of await readdir(rootUrl)){const pkg=JSON.parse(await readFile(join(root,name,'package.json'),'utf8'));assert.ok(pkg.dsh?.bundle?.patch,`${name}: missing dsh.bundle`);assert.equal(pkg.sai?.dshVersion,'>=0.1.0-rc.6 <0.2.0',`${name}: missing pinned compatibility range`);assert.ok(Array.isArray(pkg.sai?.permissions),`${name}: missing permission declaration`);for(const script of ['preinstall','install','postinstall','prepare'])assert.equal(pkg.scripts?.[script],undefined,`${name}: forbidden ${script}`)}})

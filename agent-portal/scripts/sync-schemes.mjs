// Copies the scheme catalogue (name, icon, docs, scope) from the employee app into the portal, so the
// "Add application" picker always matches employee/js/schemes.js. Runs automatically before every build.
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'
const src = readFileSync(new URL('../../employee/js/schemes.js', import.meta.url), 'utf8')
const ctx = { S: {}, document: { getElementById: () => ({}) }, console }
vm.createContext(ctx)
vm.runInContext(src + '\n;globalThis.__out={CENTRAL_SCHEMES,STATE_SCHEMES};', ctx)
const pick = (s, scope) => ({ name: s.name, icon: s.icon, docs: s.docs, scope })
const out = [
  ...ctx.__out.CENTRAL_SCHEMES.map(s => pick(s, 'Central')),
  ...Object.entries(ctx.__out.STATE_SCHEMES).flatMap(([st, list]) => list.map(s => pick(s, st))),
]
writeFileSync(new URL('../src/lib/schemeCatalog.json', import.meta.url), JSON.stringify(out, null, 1) + '\n')
console.log(`synced ${out.length} schemes`)

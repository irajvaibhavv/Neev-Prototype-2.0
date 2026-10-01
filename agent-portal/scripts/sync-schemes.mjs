// Copies the scheme catalogue (name, icon, desc, apply link, docs, scope) from the employee app into the portal, so the
// "Add application" picker always matches employee/js/schemes.js. Runs automatically before every build.
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'
const src = readFileSync(new URL('../../employee/js/schemes.js', import.meta.url), 'utf8')
const ctx = { S: {}, document: { getElementById: () => ({}) }, console }
vm.createContext(ctx)
vm.runInContext(src + '\n;globalThis.__out={CENTRAL_SCHEMES,STATE_SCHEMES,SCHEME_FORM};', ctx)
// Information fields from the scheme's confirmed application form (SCHEME_FORM), as portal field types.
const TYPES = { text: 'text', tel: 'number', date: 'date', yn: 'yesno', sel: 'dropdown' }
const fields = name => (ctx.__out.SCHEME_FORM[name]?.fields || [])
  .map(f => ({ label: f.l, type: TYPES[f.t] || 'text', options: f.o || [], optional: !!f.opt }))
const pick = (s, scope) => ({ name: s.name, icon: s.icon, desc: s.desc, url: s.url, check: s.check || '', docs: s.docs, fields: fields(s.name), scope })
const out = [
  ...ctx.__out.CENTRAL_SCHEMES.map(s => pick(s, 'Central')),
  ...Object.entries(ctx.__out.STATE_SCHEMES).flatMap(([st, list]) => list.map(s => pick(s, st))),
]
writeFileSync(new URL('../src/lib/schemeCatalog.json', import.meta.url), JSON.stringify(out, null, 1) + '\n')
console.log(`synced ${out.length} schemes`)

// Run: node tests/admin.check.mjs (from agent-portal/) — super admin: user CRUD, role logins, scheme CRUD.
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
const store = {}
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => (store[k] = v), removeItem: k => delete store[k] }
const auth = await import('../src/lib/auth.js')
// three demo logins, one per role
assert.deepEqual(auth.getUsers().map(u => u.role), ['super', 'agent', 'sales'])
auth.login(auth.findUser('9876500002')); assert.equal(auth.getSession().role, 'sales')
// create / validate / edit / deactivate / delete
assert.match(auth.validateUser({ name: 'X', mobile: '9876500001', role: 'agent' }), /already registered/)
assert.match(auth.validateUser({ name: 'X', mobile: '123', role: 'agent' }), /10-digit/)
let users = auth.saveUser({ name: 'Priya', mobile: '9000000009', role: 'agent', area: 'Pune', active: true })
const priya = users.find(u => u.mobile === '9000000009'); assert(priya.id && priya.createdAt)
auth.saveUser({ ...priya, role: 'sales' }); assert.equal(auth.findUser('9000000009').role, 'sales')
auth.login(priya); assert.equal(auth.getSession().name, 'Priya')
auth.saveUser({ ...auth.findUser('9000000009'), active: false }); assert.equal(auth.getSession(), null, 'deactivated user is logged out')
auth.deleteUser(priya.id); assert.equal(auth.findUser('9000000009'), null)
auth.deleteUser('u-super'); assert(auth.findUser('9876500000'), 'super admin cannot be deleted')
// schemes: add, edit synced + custom, delete, undo edits
const S = await import('../src/lib/schemes.js')
const catalog = JSON.parse(readFileSync(new URL('../src/lib/schemeCatalog.json', import.meta.url)))
assert.equal(S.getSchemes().length, catalog.length)
assert.match(S.validateScheme({ name: catalog[0].name.toUpperCase(), scope: 'Central', docs: ['a'] }), /already exists/)
let list = S.saveScheme({ name: 'PM Vishwakarma', icon: '🔨', scope: 'Central', docs: ['Aadhaar card', ' '] })
const pmv = list.find(s => s.name === 'PM Vishwakarma'); assert.equal(pmv.source, 'custom'); assert.deepEqual(pmv.docs, ['Aadhaar card'])
list = S.saveScheme({ ...pmv, scope: 'Kerala' }); assert.equal(list.find(s => s.id === pmv.id).scope, 'Kerala')
const first = list[0]
list = S.saveScheme({ ...first, name: 'Renamed' }); assert(list.find(s => s.id === first.id).edited)
list = S.resetScheme(first.id); assert.equal(list.find(s => s.id === first.id).name, first.name)
list = S.deleteScheme(first.id); assert(!list.some(s => s.id === first.id))
list = S.deleteScheme(pmv.id); assert.equal(list.length, catalog.length - 1)
console.log('ok')

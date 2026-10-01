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
let users = auth.saveUser({ name: 'Priya', mobile: '9000000009', role: 'agent', active: true })
const priya = users.find(u => u.mobile === '9000000009'); assert(priya.id && priya.createdAt)
auth.saveUser({ ...priya, role: 'sales' }); assert.equal(auth.findUser('9000000009').role, 'sales')
auth.login(priya); assert.equal(auth.getSession().name, 'Priya')
auth.saveUser({ ...auth.findUser('9000000009'), active: false }); assert.equal(auth.getSession(), null, 'deactivated user is logged out')
auth.deleteUser(priya.id); assert.equal(auth.findUser('9000000009'), null)
auth.deleteUser('u-super'); assert(auth.findUser('9876500000'), 'last super admin cannot be deleted')
const sup = auth.findUser('9876500000')
assert.match(auth.validateUser({ ...sup, role: 'agent' }), /at least one active super admin/)
auth.saveUser({ name: 'Second Admin', mobile: '9000000010', role: 'super', active: true })
assert.equal(auth.validateUser({ ...sup, role: 'agent' }), '', 'can demote once another super admin exists')
auth.deleteUser(auth.findUser('9000000010').id); assert.equal(auth.findUser('9000000010'), null, 'extra super admin can be deleted')
// schemes: add, edit synced + custom, delete, undo edits
const S = await import('../src/lib/schemes.js')
const catalog = JSON.parse(readFileSync(new URL('../src/lib/schemeCatalog.json', import.meta.url)))
assert.equal(S.getSchemes().length, catalog.length)
const blank = { icon: '', desc: '', url: '', fee: 49, fields: [], elig: S.BLANK_ELIG }
assert.match(S.validateScheme({ ...blank, name: catalog[0].name.toUpperCase(), scope: 'Central', docs: ['a'] }), /already exists/)
const pmvId = S.saveScheme({ ...blank, name: 'PM Vishwakarma', icon: '🔨', scope: 'Central', docs: ['Aadhaar card', ' '] })
let pmv = S.getScheme(pmvId); assert.equal(pmv.source, 'custom'); assert.deepEqual(pmv.docs, ['Aadhaar card'])
S.saveScheme({ ...pmv, scope: 'Kerala' }); assert.equal(S.getScheme(pmvId).scope, 'Kerala')
// mandatory flags + rules on fields / documents
pmv = S.getScheme(pmvId)
const withRules = { ...pmv, docs: ['Aadhaar card', 'Income certificate'], fields: ['Monthly income'], optionalDocs: ['Income certificate'],
  elig: { ...pmv.elig, custom: [{ kind: 'field', name: 'Monthly income', type: 'number', op: 'lte', value: '', values: [] }] } }
assert.match(S.validateScheme(withRules), /needs a value/)
withRules.elig.custom[0].value = '18000'; assert.equal(S.validateScheme(withRules), '')
assert.match(S.validateScheme({ ...withRules, fields: [] }), /no longer on this scheme/)
S.saveScheme(withRules); pmv = S.getScheme(pmvId)
assert.deepEqual(pmv.optionalDocs, ['Income certificate']); assert.equal(pmv.elig.custom[0].value, '18000')
S.renameDocInSchemes('Income certificate', 'Income proof'); assert.deepEqual(S.getScheme(pmvId).optionalDocs, ['Income proof'])
S.renameFieldInSchemes('Monthly income', 'Income per month'); assert.equal(S.getScheme(pmvId).elig.custom[0].name, 'Income per month')
// app fields keep the app's optional flag
const appOpt = catalog.find(s => (s.fields || []).some(f => f.optional))
if (appOpt) assert(S.getScheme(`app:${appOpt.name}`).optionalFields.length > 0)
let list = S.getSchemes(); const first = list[0]
S.saveScheme({ ...first, name: 'Renamed' }); assert(S.getScheme(first.id).edited)
list = S.resetScheme(first.id); assert.equal(list.find(s => s.id === first.id).name, first.name)
list = S.deleteScheme(first.id); assert(!list.some(s => s.id === first.id))
list = S.deleteScheme(pmvId); assert.equal(list.length, catalog.length - 1)
console.log('ok')

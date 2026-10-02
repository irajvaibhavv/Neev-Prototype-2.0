// Run: node employee-app/tests/schemes-parity.check.mjs — the React app's scheme engine must give the same
// result as the old employee/js/schemes.js for random profiles (guards the port).
import assert from 'assert'
import fs from 'fs'
import vm from 'vm'
import { S } from '../src/store.js'
import { eligibleSchemes, ruleKeys, SP_QUESTIONS } from '../src/lib/schemes.js'
import { QUIZ_HI } from '../src/lib/schemes-hi.js'

const old = { S: {}, saveCurrentProfile() {}, applyProfileFields() {}, document: { getElementById: () => ({}) } }
vm.createContext(old)
vm.runInContext(fs.readFileSync(new URL('../../employee/js/schemes.js', import.meta.url), 'utf8') + ';this.E=eligibleSchemes;', old)

let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const states = ['Delhi', 'Bihar', 'Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Jharkhand', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Odisha', 'Punjab', 'Haryana']
for (let i = 0; i < 400; i++) {
  const person = { gender: rnd() < 0.5 ? 'Female' : 'Male', dob: `1-1-${1950 + Math.floor(rnd() * 55)}`, company: rnd() < 0.3 ? 'Zomato' : null, department: 'Delivery', salary: rnd() < 0.3 ? 12000 : 0 }
  Object.assign(S, person); Object.assign(old.S, person)
  const sp = { LiveState: states[Math.floor(rnd() * states.length)] }
  SP_QUESTIONS.forEach(q => { if (rnd() < 0.6) { const o = q.opts[Math.floor(rnd() * q.opts.length)][0]; sp[q.f] = q.num ? +o : o } })
  const strip = list => list.map(s => `${s.name}:${s.status}:${s.needs.join('|')}`)
  assert.deepEqual(strip(eligibleSchemes(sp)), strip(old.E(sp)), JSON.stringify({ person, sp }))
}
// The production build renames the rule parameter — rule inputs must still be found.
assert.deepEqual(ruleKeys({ rule: e => e.female && e.pf && !e.tax && 'yes' }), ['Pf', 'SelfTax', 'Tax'])
// Every quiz question (and every word answer) has Hindi — the EN | हिं switch and Hindi voice rely on it.
for (const q of SP_QUESTIONS) {
  assert(QUIZ_HI[q.f]?.q, 'no Hindi question for ' + q.f)
  if (q.f !== 'Children') q.opts.forEach(([v]) => assert(QUIZ_HI[q.f].opts[v], `no Hindi label for ${q.f}=${v}`))
}
console.log('schemes parity ok (400 profiles) · Hindi complete')

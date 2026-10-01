// Run: node tests/sales.check.mjs (from agent-portal/) — six-stage sales journey from employee-app data.
import assert from 'node:assert'
const store = {}
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => (store[k] = v) }
const t = d => `2026-09-${String(d).padStart(2, "0")}T10:00:00Z`
store.neev_employee_db = JSON.stringify({
  '9000000001': { name: 'Only Downloaded', signupAt: t(1), aadhaar: '1234 5678 9012' }, // Aadhaar from loan KYC, never opened schemes
  '9000000002': { name: 'Dropper', signupAt: t(1), funnel: { schemesOpened: t(2) } },
  '9000000003': { name: 'Old Profile', signupAt: t(1), aadhaar: '1234 5678 9013', funnel: { schemesOpened: t(2) } }, // before aadhaarGiven tracking
  '9000000004': { name: 'Picker', signupAt: t(1), schemeClickedName: 'e-Shram Card', funnel: { schemesOpened: t(2), aadhaarGiven: t(2), schemeClicked: t(3) } },
  '9000000005': { name: 'Carter', signupAt: t(1), funnel: { schemesOpened: t(2), aadhaarGiven: t(2), schemeClicked: t(3), formStarted: t(3), cartAdded: t(4) },
    schemeApplications: [{ id: 'C1', scheme: 'Atal Pension Yojana', status: 'cart' }, { id: 'C2', scheme: 'PM-KISAN', status: 'cart' }] },
  '9000000006': { name: 'Payer', signupAt: t(1), funnel: { schemesOpened: t(2), aadhaarGiven: t(2), schemeClicked: t(3), formStarted: t(3), cartAdded: t(4), paid: t(5) },
    schemeApplications: [{ id: 'P1', scheme: 'e-Shram Card', status: 'paid', paidAt: t(5), amount: 49, docsMissing: ['Bank account details'] }] },
})
const { loadAll } = await import('../src/lib/applications.js')
const { makeSample } = await import('../src/lib/sample.js')
const { salesRows, nudgeText, toCsv, SALES_STAGES, journey, periodCounts, cohorts, byState, byScheme, byCompany, revenue } = await import('../src/lib/sales.js')
const { people, apps } = loadAll(false, makeSample())
const rows = salesRows(people, apps, Date.parse(t(10)))
const by = Object.fromEntries(rows.map(r => [r.name, r]))
assert.deepEqual(Object.fromEntries(rows.map(r => [r.name, r.stage])), {
  'Only Downloaded': 'downloaded', Dropper: 'dropped', 'Old Profile': 'profile', Picker: 'application', Carter: 'cart', Payer: 'paid' })
assert.deepEqual(by.Picker.schemes, ['e-Shram Card'], 'tapped scheme shown even before filling')
assert.equal(by.Carter.amount, 98); assert.deepEqual(by.Carter.schemes, ['Atal Pension Yojana', 'PM-KISAN'])
assert.equal(by.Payer.amount, 49); assert.equal(by.Payer.docsMissing, 1)
assert.equal(by.Dropper.days, 8, 'days since reaching the stage')
assert(nudgeText(by.Carter, 'en').includes('₹98') && nudgeText(by.Carter, 'hi').includes('₹98'))
assert(toCsv([by.Carter]).split('\n')[1].includes('Unpaid cart'))
// journey: steps done / stuck, pending items
const jc = journey(by.Carter, apps)
assert.deepEqual(jc.steps.map(s => s.state), ['done', 'done', 'done', 'done', 'done', 'done', 'stuck'])
assert(jc.pending.some(t => t.includes('Atal Pension Yojana: in cart')))
const jd = journey(by.Dropper, apps)
assert.equal(jd.steps.find(s => s.state === 'stuck').label, 'Gave Aadhaar')
assert(jd.pending.includes('Aadhaar not given'))
assert(journey(by.Payer, apps).pending.some(t => t.includes('Bank account details')), 'paid with missing doc still listed')
// reports
const NOW = Date.parse(t(10))
const pc = Object.fromEntries(periodCounts(rows, 7, NOW).map(s => [s.key, s]))
assert.equal(pc.paid.now, 1); assert.equal(pc.cart.now, 2, 'Carter + Payer added to cart in the last 7 days')
assert.equal(pc.cart.stuck, 1, 'only Carter is still stuck at cart')
const ch = cohorts(rows, 2, NOW); assert.equal(ch[0].n, 0); assert.equal(ch[1].n, 6); assert.equal(ch[1].steps.find(x => x.key === 'paid').pct, 17)
const sc = Object.fromEntries(byScheme(apps).map(r => [r.name, r]))
assert.equal(sc['Atal Pension Yojana'].abandon, 100); assert.equal(sc['e-Shram Card'].abandon, 0)
const rv = revenue(apps, 7, NOW); assert.equal(rv.collected, 49); assert.equal(rv.inCarts, 98); assert.equal(rv.payers, 1)
assert.equal(byCompany(rows)[0].name, 'No employer linked')
assert.equal(byState(rows).length, 0, 'live test users have no state')
// sample: every person in exactly one stage, all six stages populated
const s = makeSample()
const srows = salesRows(s.people, loadAll(true, s).apps.filter(a => a.sample))
const counts = Object.fromEntries(SALES_STAGES.map(st => [st.key, srows.filter(r => r.stage === st.key).length]))
console.log('sample stages:', counts)
assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), s.people.length)
assert(Object.values(counts).every(n => n > 0))
console.log('ok')

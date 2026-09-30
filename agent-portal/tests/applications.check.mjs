// Run: node tests/applications.check.mjs (from agent-portal/) — employee-app data → funnel, leads, sections.
import assert from 'node:assert'
const store = {}
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => (store[k] = v) }
const t = d => `2026-09-${d}T10:00:00Z`
store.neev_employee_db = JSON.stringify({
  '9000000001': { name: 'Only Downloaded', signupAt: t(1) },
  '9000000002': { name: 'Viewer', funnel: { schemesOpened: t(2) } },
  '9000000003': { name: 'Clicker', funnel: { schemesOpened: t(2), schemeClicked: t(3) } },
  '9000000004': { name: 'Payer', schemeProfile: { LiveState: 'Bihar' }, funnel: { schemesOpened: t(2), schemeClicked: t(3), formStarted: t(3), cartAdded: t(4), paid: t(5) },
    schemeApplications: [
      { id: 'A1', scheme: 'e-Shram Card', status: 'paid', docsMissing: [], paidAt: t(5), amount: 49 },
      { id: 'A2', scheme: 'PM Awas Yojana (Urban 2.0)', status: 'paid', docsMissing: ['Income certificate'], paidAt: t(5), amount: 49 },
      { id: 'A3', scheme: 'Atal Pension Yojana', status: 'cart', docsMissing: [] },
      { id: 'A4', scheme: 'PM Suraksha Bima Yojana', status: 'draft' },
      { scheme: 'Old agent request', agent: 'Rajesh Kumar' }, // pre-cart format → ignored
    ] },
})
store.neev_agent_stages = JSON.stringify({ A1: { stage: 'filled', outcome: 'approved' } })
const { loadAll, funnelCounts, leadsAt } = await import('../src/lib/applications.js')
const { makeSample } = await import('../src/lib/sample.js')
const { people, apps } = loadAll(false, makeSample())
const f = Object.fromEntries(funnelCounts(people).map(s => [s.key, s.n]))
assert.deepEqual(f, { downloaded: 4, schemesOpened: 3, schemeClicked: 2, formStarted: 1, cartAdded: 1, paid: 1 })
assert.deepEqual(leadsAt(people, 'schemesOpened').map(p => p.name), ['Viewer'])
assert.deepEqual(leadsAt(people, 'schemeClicked').map(p => p.name), ['Clicker'])
const sec = Object.fromEntries(apps.map(a => [a.id, a.stage]))
assert.deepEqual(sec, { A1: 'filled', A2: 'pending', A3: 'incomplete', A4: 'incomplete' })
assert.equal(apps.find(a => a.id === 'A1').outcome, 'approved')
assert.equal(apps.find(a => a.id === 'A2').state, 'Bihar')
// sample funnel shape ≈ 500 → 300 → 100 → 50 → 20 → 12
const s = loadAll(true, makeSample())
const sf = funnelCounts(s.people).map(x => x.n); console.log('funnel with sample:', sf.join(' → '))
assert(sf[0] >= 500 && sf.every((n, i) => !i || n <= sf[i - 1]), 'funnel must narrow')
console.log('ok')

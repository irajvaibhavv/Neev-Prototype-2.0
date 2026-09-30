import { useCallback, useEffect, useMemo, useState } from 'react'
import { makeSample } from './sample.js'

// Live data comes from the employee app (same origin): localStorage 'neev_employee_db' = { [mobile]: profile }.
//   profile.signupAt / profile.funnel = the user's journey (schemesOpened → schemeClicked → formStarted → cartAdded → paid)
//   profile.schemeApplications[] = one per scheme: status 'draft' | 'cart' | 'paid', docsMissing[]
// The manager's decisions (move to Filled, outcome, removals, document changes) live in 'neev_agent_stages';
// applications the agent adds for a user live in 'neev_agent_added'. Neither syncs back to the app.
const EMPLOYEE_DB = 'neev_employee_db'
const STAGES_KEY = 'neev_agent_stages'
const SAMPLE_KEY = 'neev_portal_sample'
const ADDED_KEY = 'neev_agent_added'
export const SCHEME_FEE = 49

export const FUNNEL = [
  { key: 'downloaded', label: 'Downloaded the app' },
  { key: 'schemesOpened', label: 'Opened Govt schemes' },
  { key: 'schemeClicked', label: 'Clicked a scheme' },
  { key: 'formStarted', label: 'Started filling' },
  { key: 'cartAdded', label: 'Added to cart' },
  { key: 'paid', label: 'Paid' },
]
export const STAGES = [
  { key: 'new', label: 'New applications', short: 'New', desc: 'Paid with all documents — ready to file on the government portal.' },
  { key: 'incomplete', label: 'Incomplete', short: 'Incomplete', desc: 'Started filling or sitting in the cart, not paid yet — nudge these users.' },
  { key: 'pending', label: 'Pending', short: 'Pending', desc: 'Paid, but documents are missing — collect them.' },
  { key: 'filled', label: 'Filled applications', short: 'Filled', desc: 'Filed on the government portal — record the outcome.' },
]
// Removed applications are kept (audit trail + restore), just out of the working sections.
export const REMOVED = { key: 'removed', label: 'Removed', short: 'Removed', desc: 'Removed by an agent — e.g. user not eligible. Paid ones are flagged for a ₹49 refund.' }
export const REMOVE_REASONS = ['Not eligible for this scheme', 'Duplicate application', 'User asked to cancel', 'Wrong scheme selected', 'Other']
export const OUTCOMES = [
  { key: 'in_process', label: 'In process' },
  { key: 'approved', label: 'Approved' },
  { key: 'disapproved', label: 'Disapproved' },
]
export const LEAD_TABS = [
  { key: 'schemesOpened', label: 'Viewed schemes', desc: 'Opened Government schemes but did not tap any scheme.' },
  { key: 'schemeClicked', label: 'Clicked a scheme', desc: 'Tapped "Apply via Neev" but did not start filling.' },
]

const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage blocked: lasts until reload */ } }

// Section an application sits in. Removed wins; Filled is a manager decision; otherwise it follows payment + documents
// (so an agent uploading the last missing document moves it Pending → New, and removing one moves it back).
function sectionOf(a, o) {
  if (o.removed) return 'removed'
  if (a.status !== 'paid') return 'incomplete'
  if (o.stage === 'filled') return 'filled'
  return a.docsMissing.length ? 'pending' : 'new'
}

function loadLive() {
  const db = read(EMPLOYEE_DB, {})
  const people = [], apps = []
  for (const [mobile, p] of Object.entries(db)) {
    const state = p.schemeProfile?.LiveState || '—'
    const name = p.name && p.name !== 'User' ? p.name : 'New user'
    people.push({ mobile, name, state, signupAt: p.signupAt || null, funnel: p.funnel || {},
      gender: p.gender, dob: p.dob, aadhaarLast4: (p.aadhaar || '').replace(/\s/g, '').slice(-4), address: p.address,
      currentAddress: p.currentAddress, answers: p.schemeProfile || {} })
    ;(p.schemeApplications || []).forEach((a, i) => {
      if (!a.status) return // pre-cart format (old "Apply with Agent" requests) — not part of this flow
      apps.push({ id: a.id || `${mobile}-${i}`, owner: mobile, applicant: name, mobile: a.mobile || mobile, state: a.state || state,
        scheme: a.scheme, status: a.status, docs: a.docs || {}, docsMissing: a.docsMissing || [], formData: a.formData || {},
        address: a.address, createdAt: a.createdAt, cartAt: a.cartAt, paidAt: a.paidAt, paymentRef: a.paymentRef, amount: a.amount || 0 })
    })
  }
  return { people, apps }
}

export function loadAll(includeSample, sample) {
  const live = loadLive()
  const overrides = { ...(includeSample ? sample.stageOverrides : {}), ...read(STAGES_KEY, {}) }
  const people = [...live.people, ...(includeSample ? sample.people : [])]
  const byMobile = Object.fromEntries(people.map(p => [p.mobile, p]))
  const added = read(ADDED_KEY, []).filter(a => byMobile[a.owner])
  const apps = [...live.apps, ...added, ...(includeSample ? sample.apps : [])].map(a => {
    const o = overrides[a.id] || {}
    const docs = { ...Object.fromEntries((a.docsMissing || []).map(d => [d, false])), ...(a.docs || {}), ...(o.docOverrides || {}) }
    const withDocs = { ...a, docs, docsMissing: Object.keys(docs).filter(d => !docs[d]) }
    return { ...withDocs, person: byMobile[a.owner || a.mobile], stage: sectionOf(withDocs, o), outcome: o.outcome || 'in_process',
      history: o.history || [], reminders: o.reminders || [], removed: o.removed || null }
  })
  apps.sort((x, y) => (y.paidAt || y.createdAt || '').localeCompare(x.paidAt || x.createdAt || ''))
  return { people, apps }
}

// Funnel counts: each step counts people who reached it (downloaded = every account).
export function funnelCounts(people) {
  return FUNNEL.map(s => ({ ...s, n: s.key === 'downloaded' ? people.length : people.filter(p => p.funnel[s.key]).length }))
}
// Leads = people stuck at a step before starting an application.
export function leadsAt(people, key) {
  const next = key === 'schemesOpened' ? 'schemeClicked' : 'formStarted'
  return people.filter(p => p.funnel[key] && !p.funnel[next])
    .sort((a, b) => (b.funnel[key] || '').localeCompare(a.funnel[key] || ''))
}

export function useData() {
  const sample = useMemo(() => makeSample(), [])
  const [includeSample, setIncludeSampleState] = useState(() => read(SAMPLE_KEY, true))
  const [data, setData] = useState(() => loadAll(includeSample, sample))
  const reload = useCallback(() => setData(loadAll(includeSample, sample)), [includeSample, sample])

  useEffect(() => {
    const onStorage = e => { if ([EMPLOYEE_DB, STAGES_KEY, ADDED_KEY].includes(e.key)) reload() }
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', reload)
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', reload) }
  }, [reload])

  // Manager actions. Every stage/outcome change is appended to history (shown on the application timeline).
  const update = useCallback((id, patch) => {
    const stages = read(STAGES_KEY, {})
    const prev = { ...(sample.stageOverrides[id] || {}), ...stages[id] }
    const at = new Date().toISOString()
    stages[id] = { ...prev, ...patch, updatedAt: at, history: [...(prev.history || []), { at, ...patch }] }
    write(STAGES_KEY, stages)
    reload()
  }, [reload, sample])
  const logReminder = useCallback((id, channel, lang) => {
    const stages = read(STAGES_KEY, {})
    const prev = { ...(sample.stageOverrides[id] || {}), ...stages[id] }
    stages[id] = { ...prev, reminders: [...(prev.reminders || []), { at: new Date().toISOString(), channel, lang }] }
    write(STAGES_KEY, stages)
    reload()
  }, [reload, sample])

  // Agent powers. Each is logged in the application's history (timeline) with a readable label.
  const setDoc = useCallback((app, doc, uploaded) => {
    const docOverrides = { ...(read(STAGES_KEY, {})[app.id]?.docOverrides || {}), [doc]: uploaded }
    update(app.id, { docOverrides, note: `${uploaded ? 'Uploaded' : 'Removed'} document: ${doc}` })
  }, [update])
  const markAllDocs = useCallback(app => {
    const docOverrides = { ...(read(STAGES_KEY, {})[app.id]?.docOverrides || {}), ...Object.fromEntries(app.docsMissing.map(d => [d, true])) }
    update(app.id, { docOverrides, note: `Documents received: ${app.docsMissing.join(', ')}` })
  }, [update])
  const removeApp = useCallback((app, reason, detail) => {
    const refund = app.status === 'paid' && (app.amount || 0) > 0
    update(app.id, { removed: { at: new Date().toISOString(), reason, detail, refund }, note: `Removed — ${reason}${detail ? `: ${detail}` : ''}${refund ? ` · ₹${app.amount} refund due` : ''}` })
  }, [update])
  const restoreApp = useCallback(app => update(app.id, { removed: null, note: 'Restored' }), [update])
  const addApp = useCallback((person, scheme, payment, collected) => {
    const at = new Date().toISOString()
    const app = { id: `AG${Date.now()}`, owner: person.mobile, applicant: person.name, mobile: person.mobile, state: person.state,
      scheme: scheme.name, status: 'paid', addedByAgent: true, payment, amount: payment === 'collected' ? SCHEME_FEE : 0,
      docs: Object.fromEntries(scheme.docs.map(d => [d, collected.includes(d)])), formData: {}, createdAt: at, paidAt: at }
    write(ADDED_KEY, [...read(ADDED_KEY, []), app])
    update(app.id, { note: `Added by agent · fee ${payment === 'collected' ? `₹${SCHEME_FEE} collected` : 'waived'}` })
    return app.id
  }, [update])

  const setIncludeSample = v => { write(SAMPLE_KEY, v); setIncludeSampleState(v); setData(loadAll(v, sample)) }
  return { ...data, update, logReminder, setDoc, markAllDocs, removeApp, restoreApp, addApp, includeSample, setIncludeSample }
}

export const fmtDate = iso => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—'
export const fmtDateTime = iso => iso
  ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  : '—'
export const daysSince = iso => (iso ? Math.floor((Date.now() - new Date(iso)) / 86400000) : null)
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

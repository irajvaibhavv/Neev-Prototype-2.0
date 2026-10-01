// Sales dashboard: every app user sits in exactly one of six stages — the furthest step they reached.
import { SCHEME_FEE } from './applications.js'

export const SALES_STAGES = [
  { key: 'downloaded', icon: '📱', label: 'Downloaded app', step: 'signupAt', since: 'Joined',
    desc: 'Installed the app, never opened Govt schemes.' },
  { key: 'dropped', icon: '🚪', label: 'Dropped off', step: 'schemesOpened', since: 'Opened schemes',
    desc: 'Opened Govt schemes but did not give Aadhaar.' },
  { key: 'profile', icon: '🪪', label: 'Incomplete profile', step: 'aadhaarGiven', since: 'Gave Aadhaar',
    desc: 'Gave Aadhaar (PAN optional) but did not pick a scheme.' },
  { key: 'application', icon: '📝', label: 'Incomplete application', step: 'schemeClicked', since: 'Picked a scheme',
    desc: 'Picked a scheme but did not finish the application.' },
  { key: 'cart', icon: '🛒', label: 'Unpaid cart', step: 'cartAdded', since: 'Added to cart',
    desc: 'Finished the application and added it to the cart, did not pay.' },
  { key: 'paid', icon: '✅', label: 'Paid', step: 'paid', since: 'Paid',
    desc: 'Paid and completed their part.' },
]
const DAY = 86400000

export function salesStage(p) {
  const f = p.funnel
  if (f.paid) return 'paid'
  if (f.cartAdded) return 'cart'
  if (f.schemeClicked) return 'application'
  if (f.aadhaarGiven) return 'profile'
  if (f.schemesOpened) return 'dropped'
  return 'downloaded'
}

// One row per person: stage, when they reached it, days since, and the schemes that matter for that stage.
export function salesRows(people, apps, now = Date.now()) {
  const byOwner = {}
  apps.filter(a => a.stage !== 'removed').forEach(a => (byOwner[a.owner || a.mobile] ||= []).push(a))
  return people.map(p => {
    const stage = salesStage(p)
    const st = SALES_STAGES.find(s => s.key === stage)
    const at = st.step === 'signupAt' ? p.signupAt : p.funnel[st.step]
    const mine = byOwner[p.mobile] || []
    const of = status => mine.filter(a => a.status === status)
    const schemes = stage === 'cart' ? of('cart').map(a => a.scheme)
      : stage === 'paid' ? of('paid').map(a => a.scheme)
      : stage === 'application' ? (of('draft').length ? of('draft').map(a => a.scheme) : [p.clickedScheme].filter(Boolean))
      : []
    const amount = stage === 'cart' ? of('cart').length * SCHEME_FEE : stage === 'paid' ? of('paid').reduce((n, a) => n + (a.amount || 0), 0) : 0
    return { ...p, stage, at, days: at ? Math.max(0, Math.floor((now - Date.parse(at)) / DAY)) : null, schemes, amount,
      started: stage === 'application' && of('draft').length > 0,
      docsMissing: stage === 'paid' ? of('paid').reduce((n, a) => n + a.docsMissing.length, 0) : 0 }
  })
}

// Follow-up message per stage (WhatsApp). Hindi default — most users are Hindi-first.
export function nudgeText(row, lang) {
  const first = row.name.split(' ')[0]
  const list = row.schemes.join(', ')
  const hi = {
    downloaded: `नमस्ते ${first} जी, Neev ऐप में "Government Schemes" खोलिए — 2 मिनट में जानिए आपको कौन-सी सरकारी योजनाओं का फ़ायदा मिल सकता है।`,
    dropped: `नमस्ते ${first} जी, बस अपना आधार वेरिफ़ाई कीजिए और देखिए आप किन सरकारी योजनाओं के लिए योग्य हैं। Neev ऐप → Government Schemes।`,
    profile: `नमस्ते ${first} जी, आपकी प्रोफ़ाइल तैयार है! Neev ऐप में अपनी योजना चुनिए और "Apply via Neev" दबाइए।`,
    application: `नमस्ते ${first} जी, आपका ${list ? `"${list}" ` : ''}आवेदन अधूरा है। Neev ऐप में 2 मिनट में पूरा कीजिए।`,
    cart: `नमस्ते ${first} जी, आपके कार्ट में ${list} है। ₹${row.amount} देकर आवेदन जमा कीजिए — बाकी काम हमारी टीम करेगी।`,
    paid: `नमस्ते ${first} जी, धन्यवाद! आपका ${list} आवेदन हमारी टीम के पास है।${row.docsMissing ? ' कृपया बाकी दस्तावेज़ ऐप में अपलोड करें।' : ''}`,
  }
  const en = {
    downloaded: `Hi ${first}, open "Government Schemes" in the Neev app — find out in 2 minutes which government schemes you can get.`,
    dropped: `Hi ${first}, just verify your Aadhaar to see which government schemes you qualify for. Neev app → Government Schemes.`,
    profile: `Hi ${first}, your profile is ready! Pick your scheme in the Neev app and tap "Apply via Neev".`,
    application: `Hi ${first}, your ${list ? `"${list}" ` : ''}application is incomplete. Finish it in 2 minutes in the Neev app.`,
    cart: `Hi ${first}, ${list} is in your cart. Pay ₹${row.amount} to submit — our team does the rest.`,
    paid: `Hi ${first}, thank you! Your ${list} application is with our team.${row.docsMissing ? ' Please upload the remaining documents in the app.' : ''}`,
  }
  return `${(lang === 'hi' ? hi : en)[row.stage]}\n– Team Neev`
}

export function toCsv(rows) {
  const stageLabel = Object.fromEntries(SALES_STAGES.map(s => [s.key, s.label]))
  const head = ['Name', 'Mobile', 'State', 'Stage', 'Joined', 'Reached stage', 'Days', 'Schemes', 'Amount (₹)']
  const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [head, ...rows.map(r => [r.name, r.mobile, r.state, stageLabel[r.stage], (r.signupAt || '').slice(0, 10), (r.at || '').slice(0, 10),
    r.days ?? '', r.schemes.join('; '), r.amount || ''])].map(l => l.map(cell).join(',')).join('\n')
}

// One person's track: each step done or not, what they've submitted, and what's still incomplete.
export const PROFILE_LIMIT = 15 // profiles open for the first 15 people in each stage list (user ask)
export function journey(row, apps) {
  const f = row.funnel
  const mine = apps.filter(a => (a.owner || a.mobile) === row.mobile && a.stage !== 'removed')
  const nAnswers = Object.keys(row.answers || {}).filter(k => k !== 'LiveState').length
  const steps = [
    { label: 'Downloaded the app', at: row.signupAt },
    { label: 'Opened Govt schemes', at: f.schemesOpened },
    { label: 'Gave Aadhaar', at: f.aadhaarGiven,
      detail: f.aadhaarGiven && `Aadhaar XXXX ${row.aadhaarLast4 || '····'} · PAN ${row.hasPan ? 'given' : 'not given (optional)'} · ${nAnswers} eligibility answers` },
    { label: 'Picked a scheme', at: f.schemeClicked, detail: row.clickedScheme },
    { label: 'Started the application', at: f.formStarted },
    { label: 'Finished & added to cart', at: f.cartAdded },
    { label: 'Paid', at: f.paid },
  ]
  const cur = steps.findIndex(s => !s.at)
  steps.forEach((s, i) => { s.state = s.at ? 'done' : i === cur ? 'stuck' : 'todo' })

  const submitted = [], pending = []
  if (f.aadhaarGiven) submitted.push('Aadhaar verified')
  if (row.hasPan) submitted.push('PAN card')
  if (nAnswers) submitted.push(`${nAnswers} eligibility answers`)
  if (!f.schemesOpened) pending.push('Has not opened Govt schemes')
  else if (!f.aadhaarGiven) pending.push('Aadhaar not given')
  if (f.aadhaarGiven && !row.hasPan) pending.push('PAN not given (optional)')
  if (f.aadhaarGiven && !f.schemeClicked) pending.push('No scheme picked yet')
  if (f.schemeClicked && !mine.length) pending.push(`${row.clickedScheme || 'Scheme'}: application not started`)
  mine.forEach(a => {
    const up = Object.entries(a.docs).filter(([, v]) => v === true).map(([d]) => d)
    const fields = Object.keys(a.formData || {}).length
    if (up.length || fields) submitted.push(`${a.scheme}: ${[fields && `${fields} form details`, up.length && `${up.length} document${up.length > 1 ? 's' : ''}`].filter(Boolean).join(' + ')}`)
    if (a.status === 'draft') pending.push(`${a.scheme}: application not finished`)
    if (a.status === 'cart') pending.push(`${a.scheme}: in cart, ₹${SCHEME_FEE} not paid`)
    if (a.docsMissing.length) pending.push(`${a.scheme}: ${a.docsMissing.length} document${a.docsMissing.length > 1 ? 's' : ''} missing — ${a.docsMissing.join(', ')}`)
  })
  return { steps, submitted, pending, apps: mine }
}

// ---- Reports: drop-off trend, breakdowns, revenue ----
export const STEP_LABEL = { downloaded: 'Downloaded', dropped: 'Opened schemes', profile: 'Gave Aadhaar',
  application: 'Picked a scheme', cart: 'Added to cart', paid: 'Paid' }
const stepAt = (r, s) => (s.step === 'signupAt' ? r.signupAt : r.funnel[s.step])
const t = iso => (iso ? Date.parse(iso) : NaN)

// People who reached each step in the last `days` vs the `days` before, and how many of them are still stuck there.
export function periodCounts(rows, days, now = Date.now()) {
  const cut = now - days * DAY, prev = cut - days * DAY
  return SALES_STAGES.map(s => {
    const ts = rows.map(r => t(stepAt(r, s)))
    return { ...s, reached: STEP_LABEL[s.key], now: ts.filter(x => x >= cut && x <= now).length,
      before: ts.filter(x => x >= prev && x < cut).length,
      stuck: rows.filter(r => r.stage === s.key && t(r.at) >= cut).length }
  })
}

// Weekly sign-up cohorts: % of each week's new users who reached every later step.
export function cohorts(rows, weeks, now = Date.now()) {
  return Array.from({ length: weeks }, (_, w) => {
    const end = now - w * 7 * DAY, start = end - 7 * DAY
    const m = rows.filter(r => t(r.signupAt) >= start && t(r.signupAt) < end)
    return { start, n: m.length,
      steps: SALES_STAGES.slice(1).map(s => ({ key: s.key, pct: m.length ? Math.round((100 * m.filter(r => r.funnel[s.step]).length) / m.length) : null })) }
  })
}

const groupBy = (list, key) => list.reduce((g, x) => ((g[key(x)] ||= []).push(x), g), {})
const share = (a, b) => (b ? Math.round((100 * a) / b) : 0)

// Per state: how many open schemes, how many of those give Aadhaar (the drop the sales team asked about), paid.
export function byState(rows) {
  return Object.entries(groupBy(rows.filter(r => r.state && r.state !== '—'), r => r.state)).map(([name, g]) => {
    const opened = g.filter(r => r.funnel.schemesOpened).length, aadhaar = g.filter(r => r.funnel.aadhaarGiven).length
    return { name, users: g.length, opened, aadhaarDrop: share(opened - aadhaar, opened), paid: g.filter(r => r.funnel.paid).length,
      paidPct: share(g.filter(r => r.funnel.paid).length, g.length) }
  }).sort((a, b) => b.users - a.users)
}

// Per scheme: applications started, added to cart (cart + paid), and how many carts were left unpaid.
export function byScheme(apps) {
  return Object.entries(groupBy(apps.filter(a => a.stage !== 'removed'), a => a.scheme)).map(([name, g]) => {
    const carted = g.filter(a => a.status !== 'draft').length, unpaid = g.filter(a => a.status === 'cart').length
    return { name, started: g.length, carted, unpaid, abandon: share(unpaid, carted), paid: carted - unpaid }
  }).sort((a, b) => b.started - a.started)
}

// Per employer (from the loan flow's employer verification): how users convert.
export function byCompany(rows) {
  return Object.entries(groupBy(rows, r => r.company || 'No employer linked')).map(([name, g]) => {
    const paid = g.filter(r => r.funnel.paid).length
    return { name, users: g.length, aadhaar: share(g.filter(r => r.funnel.aadhaarGiven).length, g.length), paid, paidPct: share(paid, g.length) }
  }).sort((a, b) => (a.name === 'No employer linked') - (b.name === 'No employer linked') || b.users - a.users)
}

export function revenue(apps, days, now = Date.now()) {
  const live = apps.filter(a => a.stage !== 'removed')
  const paid = live.filter(a => a.status === 'paid')
  const cut = now - days * DAY, prev = cut - days * DAY
  const inP = paid.filter(a => t(a.paidAt) >= cut), before = paid.filter(a => t(a.paidAt) >= prev && t(a.paidAt) < cut)
  const sum = l => l.reduce((n, a) => n + (a.amount || SCHEME_FEE), 0)
  const payers = new Set(inP.map(a => a.owner || a.mobile)).size
  return { collected: sum(inP), before: sum(before), inCarts: live.filter(a => a.status === 'cart').length * SCHEME_FEE,
    payers, perPayer: payers ? +(inP.length / payers).toFixed(1) : 0, paidApps: inP }
}

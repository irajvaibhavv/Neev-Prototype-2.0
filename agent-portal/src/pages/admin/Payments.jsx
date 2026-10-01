import { useMemo, useState } from 'react'
import { SCHEME_FEE, fmtDate, fmtDateTime, useData } from '../../lib/applications'
import { btnGhost, seg, segBtn } from '../../lib/ui'
import { DailyChart } from '../Trends'
import WipBanner from '../../components/WipBanner'

// Payment history (super admin): every scheme fee paid by app users, plus fees agents collected or waived.
// One row per paid application — a cart checkout of 3 schemes shows as 3 rows sharing one reference.
// Status: paid · waived (agent added it free) · refund due (paid, then removed by an agent).
const DAY = 86400000
const rupee = n => `₹${Math.round(n).toLocaleString('en-IN')}`
const monthKey = iso => iso.slice(0, 7)
const monthLabel = k => new Date(k + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
const dayKey = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }
const dayLabel = k => new Date(k + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const PAGE = 25

const STATUS = {
  paid: { label: 'Paid', cls: 'bg-ok-tint text-ok' },
  waived: { label: 'Fee waived', cls: 'bg-page text-ink-2 border border-line' },
  refund: { label: 'Refund due', cls: 'bg-bad-tint text-bad' },
}

function toPayments(apps) {
  return apps.filter(a => a.status === 'paid').map(a => {
    const waived = a.addedByAgent && a.payment === 'waived'
    const at = a.paidAt || a.createdAt
    return {
      id: a.id, at, month: monthKey(at), name: a.applicant, mobile: a.mobile, state: a.state, scheme: a.scheme, sample: a.sample,
      ref: a.paymentRef || `AGENT-${String(a.id).slice(-6)}`,
      method: a.addedByAgent ? (waived ? 'Waived by agent' : 'Collected by agent') : 'UPI (app)',
      amount: waived ? 0 : a.amount || SCHEME_FEE,
      status: a.removed?.refund ? 'refund' : waived ? 'waived' : 'paid',
    }
  }).sort((x, y) => y.at.localeCompare(x.at))
}

// Totals for a list of payments: collected = money received, net = collected minus refunds owed.
function totals(list) {
  const collected = list.reduce((s, p) => s + p.amount, 0)
  const refunds = list.filter(p => p.status === 'refund').reduce((s, p) => s + p.amount, 0)
  return { count: list.length, collected, refunds, net: collected - refunds, customers: new Set(list.map(p => p.mobile)).size,
    waived: list.filter(p => p.status === 'waived').length, refundCount: list.filter(p => p.status === 'refund').length }
}

const Panel = ({ title, sub, action, children }) => (
  <section className="bg-card border border-line rounded-card shadow-card p-5">
    <div className="flex items-start justify-between gap-3">
      <div><h2 className="font-bold">{title}</h2>{sub && <p className="text-xs text-ink-3 mt-0.5">{sub}</p>}</div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </section>
)
const Live = ({ p }) => (!p.sample ? <span className="ml-2 rounded bg-ok-tint text-ok text-[10px] px-1.5 py-0.5 font-bold align-middle">LIVE</span> : null)
const Badge = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS[s].cls}`}>{STATUS[s].label}</span>
const Change = ({ now, before }) => {
  if (!before) return <span className="text-ink-3">no payments last month</span>
  const d = Math.round(((now - before) / before) * 100)
  return <span className={d >= 0 ? 'text-ok font-semibold' : 'text-bad font-semibold'}>{d >= 0 ? '▲' : '▼'} {Math.abs(d)}%</span>
}

function Overview({ pays, months, showAll }) {
  const [now] = useState(() => Date.now())
  const all = totals(pays)
  const [thisM, lastM] = [months.at(-1), months.at(-2)]
  const daily = Array.from({ length: 30 }, (_, i) => dayKey(now - (29 - i) * DAY))
  const byDay = pays.reduce((m, p) => { const k = dayKey(p.at); m[k] = (m[k] || 0) + p.amount; return m }, {})
  const last30 = pays.filter(p => new Date(p.at).getTime() >= now - 30 * DAY)
  const schemes = Object.values(pays.reduce((m, p) => {
    const r = (m[p.scheme] ||= { name: p.scheme, n: 0, amount: 0 }); r.n++; r.amount += p.amount; return m
  }, {})).sort((a, b) => b.amount - a.amount).slice(0, 8)
  const maxScheme = schemes[0]?.amount || 1

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Net revenue', rupee(all.net), <>{rupee(all.collected)} collected · {rupee(all.refunds)} refund due</>, 'border-t-ok'],
          [`This month · ${monthLabel(thisM.k)}`, rupee(thisM.net), <><Change now={thisM.net} before={lastM?.net} /> vs {lastM ? monthLabel(lastM.k) : 'last month'} ({rupee(lastM?.net || 0)})</>, 'border-t-ok'],
          ['Paying customers', all.customers.toLocaleString('en-IN'), <>avg {rupee(all.customers ? all.net / all.customers : 0)} per customer</>, 'border-t-info'],
          ['Payments', all.count.toLocaleString('en-IN'), <>{all.waived} fee waived · {all.refundCount} refund due</>, 'border-t-warn'],
        ].map(([label, value, sub, accent]) => (
          <div key={label} className={`bg-card border border-line border-t-4 ${accent} rounded-card shadow-card p-4`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-3">{label}</div>
            <div className="mt-1 text-2xl font-bold font-heading">{value}</div>
            <div className="mt-1 text-xs text-ink-2">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <DailyChart title="Daily revenue" sub={`Last 30 days · ${last30.length} payments`} series={daily.map(k => ({ k, n: byDay[k] || 0 }))}
          unit="" color="#199e70" fmt={rupee} label={dayLabel} />
        <Panel title="Revenue by scheme" sub="All time, highest first">
          {schemes.length === 0 ? <p className="text-sm text-ink-3">No payments yet.</p> : (
            <ul className="space-y-3">
              {schemes.map(r => (
                <li key={r.name} title={`${r.name}: ${rupee(r.amount)} from ${r.n} payments`}>
                  <div className="flex justify-between gap-3 text-sm"><span className="truncate">{r.name}</span>
                    <span className="whitespace-nowrap"><b>{rupee(r.amount)}</b> <span className="text-ink-3">· {r.n} payments</span></span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-page overflow-hidden">
                    <div className="h-full rounded-full bg-c-paid" style={{ width: `${(r.amount / maxScheme) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent payments" action={<button onClick={showAll} className="text-sm text-side-active font-semibold hover:underline">View all payments →</button>}>
        <PayTable rows={pays.slice(0, 6)} compact />
      </Panel>
    </div>
  )
}

function Monthly({ months }) {
  const rows = [...months].reverse()
  return (
    <div className="space-y-5">
      <DailyChart title="Monthly net revenue" sub="Fees collected minus refunds due, last 6 months" series={months.map(m => ({ k: m.k, n: m.net }))}
        unit="" color="#199e70" fmt={rupee} label={monthLabel} keyHead="Month" />
      <section className="bg-card border border-line rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
            <tr>{['Month', 'Payments', 'Paying customers', 'Collected', 'Refunds due', 'Net revenue', 'vs previous month'].map((h, i) =>
              <th key={h} className={`px-4 py-3 ${i ? 'text-right' : ''}`}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((m, i) => (
              <tr key={m.k}>
                <td className="px-4 py-3 font-semibold">{monthLabel(m.k)}{i === 0 && <span className="ml-2 text-xs text-ink-3 font-medium">so far</span>}</td>
                <td className="px-4 py-3 text-right">{m.count}</td>
                <td className="px-4 py-3 text-right">{m.customers}</td>
                <td className="px-4 py-3 text-right">{rupee(m.collected)}</td>
                <td className={`px-4 py-3 text-right ${m.refunds ? 'text-bad' : 'text-ink-3'}`}>{m.refunds ? `− ${rupee(m.refunds)}` : '—'}</td>
                <td className="px-4 py-3 text-right font-bold">{rupee(m.net)}</td>
                <td className="px-4 py-3 text-right text-xs">{rows[i + 1] ? <Change now={m.net} before={rows[i + 1].net} /> : <span className="text-ink-3">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function PayTable({ rows, compact }) {
  if (!rows.length) return <p className="text-sm text-ink-3 p-5">No payments match.</p>
  const cols = compact ? ['Date', 'Customer', 'Scheme', 'Amount', 'Status'] : ['Date & time', 'Customer', 'Scheme', 'State', 'Method', 'Reference', 'Amount', 'Status']
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
          <tr>{cols.map(h => <th key={h} className={`px-4 py-3 whitespace-nowrap ${h === 'Amount' ? 'text-right' : ''}`}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(p => (
            <tr key={p.id} className="hover:bg-card-hover">
              <td className="px-4 py-3 whitespace-nowrap text-ink-2">{compact ? fmtDate(p.at) : fmtDateTime(p.at)}</td>
              <td className="px-4 py-3"><div className="font-semibold whitespace-nowrap">{p.name}<Live p={p} /></div><div className="text-xs text-ink-3">{p.mobile}</div></td>
              <td className="px-4 py-3">{p.scheme}</td>
              {!compact && <>
                <td className="px-4 py-3 text-ink-2">{p.state}</td>
                <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{p.method}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-2">{p.ref}</td>
              </>}
              <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{rupee(p.amount)}</td>
              <td className="px-4 py-3"><Badge s={p.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AllPayments({ pays }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [month, setMonth] = useState('')
  const [scheme, setScheme] = useState('')
  const [page, setPage] = useState(0)
  const monthsPresent = [...new Set(pays.map(p => p.month))].sort().reverse()
  const schemesPresent = [...new Set(pays.map(p => p.scheme))].sort()
  const needle = q.trim().toLowerCase()
  const rows = pays.filter(p => (status === 'all' || p.status === status) && (!month || p.month === month) && (!scheme || p.scheme === scheme)
    && (!needle || [p.name, p.mobile, p.ref, p.scheme].some(v => String(v).toLowerCase().includes(needle))))
  const t = totals(rows)
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const cur = Math.min(page, pages - 1)
  const reset = fn => v => { fn(v); setPage(0) }

  function exportCsv() {
    const head = ['Date', 'Customer', 'Mobile', 'Scheme', 'State', 'Method', 'Reference', 'Amount', 'Status']
    const lines = rows.map(p => [new Date(p.at).toISOString(), p.name, p.mobile, p.scheme, p.state, p.method, p.ref, p.amount, STATUS[p.status].label])
    const csv = [head, ...lines].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `neev-payments-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const select = 'rounded-lg bg-input border border-line px-3 py-2 text-sm outline-none focus:border-brand'

  return (
    <section className="bg-card border border-line rounded-card shadow-card">
      <div className="p-4 flex flex-wrap items-center gap-3 border-b border-line">
        <input value={q} onChange={e => reset(setQ)(e.target.value)} placeholder="Search name, mobile, reference, scheme" aria-label="Search payments"
          className={`${select} flex-1 min-w-56`} />
        <div className={seg} role="group" aria-label="Status">
          {[['all', 'All'], ['paid', 'Paid'], ['waived', 'Waived'], ['refund', 'Refund due']].map(([k, l]) =>
            <button key={k} onClick={() => reset(setStatus)(k)} aria-pressed={status === k} className={segBtn(status === k)}>{l}</button>)}
        </div>
        <select value={month} onChange={e => reset(setMonth)(e.target.value)} aria-label="Month" className={select}>
          <option value="">All months</option>
          {monthsPresent.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <select value={scheme} onChange={e => reset(setScheme)(e.target.value)} aria-label="Scheme" className={`${select} max-w-56`}>
          <option value="">All schemes</option>
          {schemesPresent.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={exportCsv} disabled={!rows.length} className={btnGhost}>⬇ Export CSV</button>
      </div>
      <div className="px-4 py-3 text-sm text-ink-2 border-b border-line">
        <b className="text-ink">{t.count.toLocaleString('en-IN')}</b> payments · <b className="text-ink">{rupee(t.collected)}</b> collected
        {t.refunds > 0 && <> · <span className="text-bad font-semibold">{rupee(t.refunds)} refund due</span></>} · net <b className="text-ink">{rupee(t.net)}</b>
      </div>
      <PayTable rows={rows.slice(cur * PAGE, cur * PAGE + PAGE)} />
      {pages > 1 && (
        <div className="p-4 flex items-center justify-between text-sm border-t border-line">
          <span className="text-ink-3">Showing {cur * PAGE + 1}–{Math.min(rows.length, cur * PAGE + PAGE)} of {rows.length}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(cur - 1)} disabled={cur === 0} className={`${btnGhost} disabled:opacity-40`}>← Previous</button>
            <button onClick={() => setPage(cur + 1)} disabled={cur >= pages - 1} className={`${btnGhost} disabled:opacity-40`}>Next →</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default function Payments() {
  const { apps } = useData()
  const [tab, setTab] = useState('overview')
  const pays = useMemo(() => toPayments(apps), [apps])
  // Last 6 calendar months, oldest first, including empty ones.
  const months = useMemo(() => {
    const d = new Date()
    const keys = Array.from({ length: 6 }, (_, i) => { const x = new Date(d.getFullYear(), d.getMonth() - 5 + i, 1); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}` })
    return keys.map(k => ({ k, ...totals(pays.filter(p => p.month === k)) }))
  }, [pays])

  return (
    <div className="space-y-5">
      <WipBanner />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payment history</h1>
          <p className="mt-1 text-sm text-ink-2">Every scheme fee paid by customers — in the app or collected by an agent.</p>
        </div>
      </div>

      <div className={`${seg} w-full sm:w-fit`} role="tablist" aria-label="Payment views">
        {[['overview', 'Overview'], ['monthly', 'Monthly revenue'], ['all', `All payments (${pays.length})`]].map(([k, l]) =>
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={segBtn(tab === k)}>{l}</button>)}
      </div>

      {tab === 'overview' && <Overview pays={pays} months={months} showAll={() => setTab('all')} />}
      {tab === 'monthly' && <Monthly months={months} />}
      {tab === 'all' && <AllPayments pays={pays} />}
    </div>
  )
}

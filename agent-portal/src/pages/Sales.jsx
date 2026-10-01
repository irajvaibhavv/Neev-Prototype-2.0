import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fmtDate } from '../lib/applications'
import { PROFILE_LIMIT, SALES_STAGES, nudgeText, salesRows, toCsv } from '../lib/sales'
import { whatsappLink } from '../lib/reminder'

const RANGES = [['7', '7 days'], ['30', '30 days'], ['60', '60 days'], ['all', 'All time']]
const PAGE = 100

// Six-stage journey report for the sales team: where each app user stopped, and who to follow up.
export default function Sales({ user, people, apps }) {
  const { stage = 'cart' } = useParams()
  const nav = useNavigate()
  const [range, setRange] = useState('all')
  const [state, setState] = useState('')
  const [q, setQ] = useState('')
  const [lang, setLang] = useState('hi')
  const [limit, setLimit] = useState(PAGE)

  const all = useMemo(() => salesRows(people, apps), [people, apps])
  const states = useMemo(() => [...new Set(all.map(r => r.state).filter(s => s && s !== '—'))].sort(), [all])
  const filtered = useMemo(() => {
    const from = range === 'all' ? 0 : Date.now() - Number(range) * 86400000
    const term = q.trim().toLowerCase()
    return all.filter(r => (!from || Date.parse(r.signupAt) >= from) && (!state || r.state === state)
      && (!term || r.name.toLowerCase().includes(term) || r.mobile.includes(term)))
  }, [all, range, state, q])

  const counts = Object.fromEntries(SALES_STAGES.map(s => [s.key, filtered.filter(r => r.stage === s.key)]))
  const total = filtered.length
  const worst = SALES_STAGES.slice(0, 5).reduce((a, s) => (counts[s.key].length > counts[a.key].length ? s : a))
  const cur = SALES_STAGES.find(s => s.key === stage) || SALES_STAGES[4]
  const rows = [...counts[cur.key]].sort((a, b) => cur.key === 'paid' ? (b.at || '').localeCompare(a.at || '') : (b.days ?? 0) - (a.days ?? 0))
  const detailCol = ['application', 'cart', 'paid'].includes(cur.key)

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `neev-sales-${cur.key}-${new Date().toISOString().slice(0, 10)}.csv` })
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Sales dashboard</h1>
      <p className="mt-1 text-sm text-ink-2">Welcome, {user.name}. Where app users stop — pick a stage to see who to follow up.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-page border border-line p-0.5 gap-0.5" role="group" aria-label="Joined in">
          {RANGES.map(([k, l]) => (
            <button key={k} onClick={() => setRange(k)} aria-pressed={range === k}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${range === k ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>{l}</button>
          ))}
        </div>
        <select value={state} onChange={e => setState(e.target.value)} aria-label="State"
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold text-ink-2">
          <option value="">All states</option>
          {states.map(s => <option key={s}>{s}</option>)}
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or mobile" aria-label="Search"
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm w-56" />
        <span className="text-xs text-ink-3 ml-auto">{total} users</span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {SALES_STAGES.map((s, i) => {
          const n = counts[s.key].length, on = s.key === cur.key
          const money = s.key === 'cart' ? `₹${counts.cart.reduce((m, r) => m + r.amount, 0).toLocaleString('en-IN')} due`
            : s.key === 'paid' ? `₹${counts.paid.reduce((m, r) => m + r.amount, 0).toLocaleString('en-IN')} collected` : null
          return (
            <button key={s.key} onClick={() => { nav(`/sales/${s.key}`); setLimit(PAGE) }} aria-pressed={on}
              className={`text-left bg-card border rounded-card p-4 shadow-card transition-shadow hover:shadow-card-hover ${on ? 'border-brand ring-2 ring-brand/30' : 'border-line'}`}>
              <div className="flex items-center justify-between text-xs font-semibold text-ink-3">
                <span>{i + 1} · {s.icon}</span>
                {s.key === worst.key && n > 0 && <span className="rounded bg-bad-tint text-bad px-1.5 py-0.5 text-[10px] font-bold">Biggest drop</span>}
              </div>
              <div className={`mt-2 text-3xl font-bold ${s.key === 'paid' ? 'text-ok' : 'text-ink'}`}>{n}</div>
              <div className="mt-0.5 text-sm font-semibold leading-tight">{s.label}</div>
              <div className="mt-1 text-xs text-ink-3">{total ? Math.round((100 * n) / total) : 0}% of users{money && <> · {money}</>}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-5 bg-card border border-line rounded-card shadow-card overflow-hidden">
        <div className="p-4 border-b border-line flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h2 className="font-bold text-lg">{cur.icon} {cur.label} <span className="text-ink-3 font-semibold">({rows.length})</span></h2>
            <p className="text-xs text-ink-3">{cur.desc} Tap a name (first {PROFILE_LIMIT}) to see their full track.</p>
          </div>
          <div className="inline-flex rounded-lg bg-page border border-line p-0.5 gap-0.5 text-xs font-semibold" role="group" aria-label="Message language">
            {[['hi', 'हिंदी'], ['en', 'English']].map(([k, l]) => (
              <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k}
                className={`rounded-md px-3 py-1 ${lang === k ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>{l}</button>
            ))}
          </div>
          <button onClick={exportCsv} disabled={!rows.length}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink-2 hover:border-brand hover:text-side-active disabled:opacity-50">⬇ Export CSV</button>
        </div>
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink-3">Nobody at this stage.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">{cur.since}</th>
                  {detailCol && <th className="px-4 py-3 font-semibold">Schemes</th>}
                  <th className="px-4 py-3 font-semibold">Follow up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.slice(0, limit).map((r, i) => (
                  <tr key={r.mobile} className="hover:bg-brand/5">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{i < PROFILE_LIMIT
                      ? <Link to={`/sales/person/${r.mobile}`} className="text-side-active hover:underline">{r.name}</Link> : r.name}{!r.sample && <span className="ml-2 rounded bg-ok-tint text-ok text-[10px] px-1.5 py-0.5 font-bold">LIVE</span>}</td>
                    <td className="px-4 py-3"><a href={`tel:+91${r.mobile}`} className="text-side-active font-semibold hover:underline whitespace-nowrap">📞 +91 {r.mobile}</a></td>
                    <td className="px-4 py-3 text-ink-2">{r.state}</td>
                    <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{fmtDate(r.signupAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-ink-2">{fmtDate(r.at)}</span>
                      {cur.key !== 'paid' && r.days != null && (
                        <span className={`ml-2 rounded px-1.5 py-0.5 text-[11px] font-bold ${r.days > 7 ? 'bg-warn-tint text-warn' : 'bg-page text-ink-3'}`}>
                          {r.days === 0 ? 'today' : `${r.days}d`}
                        </span>)}
                    </td>
                    {detailCol && (
                      <td className="px-4 py-3 text-ink-2">
                        {r.schemes.join(', ') || '—'}
                        {cur.key === 'application' && <span className="block text-xs text-ink-3">{r.started ? 'Started filling' : 'Not started'}</span>}
                        {r.amount > 0 && <span className="block text-xs font-semibold text-ink">₹{r.amount}{r.docsMissing ? ` · ${r.docsMissing} doc${r.docsMissing > 1 ? 's' : ''} pending` : ''}</span>}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <a href={whatsappLink(r.mobile, nudgeText(r, lang))} target="_blank" rel="noreferrer"
                        className="inline-block rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap">💬 WhatsApp</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > limit && (
              <button onClick={() => setLimit(l => l + PAGE)} className="w-full py-3 text-sm font-semibold text-side-active hover:bg-brand/5 border-t border-line">
                Show {Math.min(PAGE, rows.length - limit)} more of {rows.length - limit}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

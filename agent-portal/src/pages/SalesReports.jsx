import { useMemo, useState } from 'react'
import { SALES_STAGES, STEP_LABEL, byCompany, byScheme, byState, cohorts, periodCounts, revenue, salesRows } from '../lib/sales'
import { DailyChart, buckets } from './Trends'

const RANGES = [7, 30, 60]
const rupees = n => `₹${n.toLocaleString('en-IN')}`
const weekLabel = ms => new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

function Delta({ now, before, goodUp = true }) {
  if (!before && !now) return <span className="text-ink-3">—</span>
  const d = now - before, up = d > 0
  if (!d) return <span className="text-ink-3">same</span>
  const good = up === goodUp
  return <span className={`font-semibold ${good ? 'text-ok' : 'text-bad'}`}>{up ? '▲' : '▼'} {Math.abs(d)}</span>
}

function Section({ title, sub, children, right }) {
  return (
    <section className="bg-card border border-line rounded-card shadow-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-bold">{title}</h2>{sub && <p className="text-xs text-ink-3 mt-0.5">{sub}</p>}</div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

// Table with one inline bar (single hue, the bar's measure named in its header); `flag` marks the worst row.
function BarTable({ cols, rows, bar, flag }) {
  const max = Math.max(1, ...rows.map(r => r[bar.key]))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-ink-3">
          <tr>{cols.map(c => <th key={c.label} className={`py-2 pr-3 font-semibold ${c.right ? 'text-right' : ''}`}>{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(r => (
            <tr key={r.name}>
              {cols.map(c => (
                <td key={c.label} className={`py-2 pr-3 ${c.right ? 'text-right whitespace-nowrap' : ''}`}>
                  {c.key === bar.key ? (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="hidden sm:block h-2 w-24 rounded-full bg-page overflow-hidden">
                        <span className="block h-full rounded-full" style={{ width: `${(r[bar.key] / max) * 100}%`, background: bar.color }} />
                      </span>
                      <b className="w-10 text-right">{c.fmt ? c.fmt(r) : r[c.key]}</b>
                    </div>
                  ) : c.fmt ? c.fmt(r) : r[c.key]}
                  {c.key === 'name' && flag && flag(r) && <span className="ml-2 rounded bg-bad-tint text-bad text-[10px] px-1.5 py-0.5 font-bold">Worst</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Sales reports: is drop-off getting better, where is it worst (state / scheme / employer), and the money.
export default function SalesReports({ people, apps }) {
  const [days, setDays] = useState(30)
  const [now] = useState(() => Date.now())
  const rows = useMemo(() => salesRows(people, apps, now), [people, apps, now])
  const joined = rows.filter(r => r.signupAt && Date.parse(r.signupAt) >= now - days * 86400000)

  const period = periodCounts(rows, days, now)
  const weeks = cohorts(rows, 8, now)
  const money = revenue(apps, days, now)
  const states = byState(joined).slice(0, 10)
  const schemes = byScheme(apps.filter(a => a.createdAt && Date.parse(a.createdAt) >= now - days * 86400000))
  const companies = byCompany(joined)
  const worst = (list, key, minKey, min) => {
    const ok = list.filter(r => r[minKey] >= min)
    return ok.length ? ok.reduce((a, b) => (b[key] > a[key] ? b : a)).name : null
  }
  const worstState = worst(states, 'aadhaarDrop', 'opened', 5)
  const worstScheme = worst(schemes, 'abandon', 'carted', 3)
  const revSeries = buckets(money.paidApps.map(a => a.paidAt), days, now, money.paidApps.map(a => a.amount || 49))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-ink-2">Is drop-off improving, where it's worst, and the money.</p>
        </div>
        <div className="flex rounded-lg bg-page border border-line p-0.5 gap-0.5 text-sm font-semibold" role="group" aria-label="Date range">
          {RANGES.map(r => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`rounded-md px-3 py-1.5 ${days === r ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>Last {r} days</button>
          ))}
        </div>
      </div>

      <Section title="Drop-off trend" sub={`People who reached each step in the last ${days} days, compared with the ${days} days before. "Still stuck" = reached it in this period and went no further.`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {period.map(s => (
            <div key={s.key} className="rounded-lg border border-line p-3">
              <div className="text-xs font-semibold text-ink-3">{s.icon} {s.reached}</div>
              <div className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-bold">{s.now}</span>
                <span className="text-xs"><Delta now={s.now} before={s.before} /> <span className="text-ink-3">vs {s.before}</span></span></div>
              {s.key !== 'paid' && <div className="mt-1 text-xs text-ink-3">{s.stuck} still stuck</div>}
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-bold">Weekly sign-up groups</h3>
        <p className="text-xs text-ink-3">Of the people who joined each week, % who reached each step. Recent weeks have had less time to move ahead.</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-ink-3">
              <tr><th className="py-2 pr-3 font-semibold">Joined week of</th><th className="py-2 pr-3 font-semibold text-right">Users</th>
                {SALES_STAGES.slice(1).map(s => <th key={s.key} className="py-2 px-1 font-semibold text-center">{STEP_LABEL[s.key]}</th>)}</tr>
            </thead>
            <tbody>
              {weeks.map(w => (
                <tr key={w.start} className="border-t border-line">
                  <td className="py-1.5 pr-3 whitespace-nowrap">{weekLabel(w.start)}</td>
                  <td className="py-1.5 pr-3 text-right font-semibold">{w.n}</td>
                  {w.steps.map(c => (
                    <td key={c.key} className="p-0.5">
                      <div className="rounded text-center py-1.5 text-xs font-semibold"
                        style={{ background: c.pct == null ? 'transparent' : `rgba(42,120,214,${0.08 + (c.pct / 100) * 0.62})`, color: c.pct > 55 ? '#fff' : 'var(--color-ink)' }}>
                        {c.pct == null ? '—' : `${c.pct}%`}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
        <Section title="Revenue" sub={`Last ${days} days`}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-line p-3"><div className="text-xs font-semibold text-ink-3">Collected</div>
              <div className="text-2xl font-bold text-ok">{rupees(money.collected)}</div>
              <div className="text-xs"><Delta now={money.collected} before={money.before} /> <span className="text-ink-3">vs {rupees(money.before)}</span></div></div>
            <div className="rounded-lg border border-line p-3"><div className="text-xs font-semibold text-ink-3">Stuck in carts now</div>
              <div className="text-2xl font-bold">{rupees(money.inCarts)}</div><div className="text-xs text-ink-3">unpaid, can still convert</div></div>
            <div className="rounded-lg border border-line p-3"><div className="text-xs font-semibold text-ink-3">Paying users</div>
              <div className="text-2xl font-bold">{money.payers}</div></div>
            <div className="rounded-lg border border-line p-3"><div className="text-xs font-semibold text-ink-3">Schemes per paying user</div>
              <div className="text-2xl font-bold">{money.perPayer}</div></div>
          </div>
        </Section>
        <DailyChart title="Daily revenue" sub="₹ collected from scheme applications" series={revSeries} unit="" color="#199e70" fmt={rupees} />
      </div>

      <Section title="By state" sub={`Users who joined in the last ${days} days. Aadhaar drop = opened schemes but did not give Aadhaar.`}>
        <BarTable rows={states} bar={{ key: 'aadhaarDrop', color: '#b91c1c' }} flag={r => r.name === worstState}
          cols={[{ key: 'name', label: 'State' }, { key: 'users', label: 'Users', right: true }, { key: 'opened', label: 'Opened schemes', right: true },
            { key: 'aadhaarDrop', label: 'Aadhaar drop', right: true, fmt: r => `${r.aadhaarDrop}%` },
            { key: 'paid', label: 'Paid', right: true, fmt: r => `${r.paid} (${r.paidPct}%)` }]} />
      </Section>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="By scheme" sub="Applications started in this period. Cart abandoned = added to cart, never paid.">
          {schemes.length ? (
            <BarTable rows={schemes} bar={{ key: 'abandon', color: '#b91c1c' }} flag={r => r.name === worstScheme}
              cols={[{ key: 'name', label: 'Scheme' }, { key: 'started', label: 'Started', right: true }, { key: 'carted', label: 'In cart', right: true },
                { key: 'abandon', label: 'Abandoned', right: true, fmt: r => `${r.abandon}%` }]} />
          ) : <p className="text-sm text-ink-3">No applications in this period.</p>}
        </Section>
        <Section title="By employer" sub="Employer verified in the loan flow. Useful when pitching to companies.">
          <BarTable rows={companies} bar={{ key: 'paidPct', color: '#199e70' }}
            cols={[{ key: 'name', label: 'Employer' }, { key: 'users', label: 'Users', right: true }, { key: 'aadhaar', label: 'Gave Aadhaar', right: true, fmt: r => `${r.aadhaar}%` },
              { key: 'paidPct', label: 'Paid', right: true, fmt: r => `${r.paidPct}%` }]} />
        </Section>
      </div>
    </div>
  )
}

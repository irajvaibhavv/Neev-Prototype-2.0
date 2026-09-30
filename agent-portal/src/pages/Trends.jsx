import { useState } from 'react'
import { pct } from '../lib/applications'

// Trends over time + state / scheme breakdown.
// Each measure gets its own chart (different scales → never share one axis); single series → no legend,
// the title names it. Brand violet validated vs the white card surface (dataviz validator, light mode).
const RANGES = [7, 30, 60]
const dayKey = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }
const dayLabel = k => new Date(k + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

function buckets(dates, days, now) {
  const keys = Array.from({ length: days }, (_, i) => dayKey(now - (days - 1 - i) * 86400000))
  const counts = Object.fromEntries(keys.map(k => [k, 0]))
  dates.forEach(d => { if (d) { const k = dayKey(d); if (k in counts) counts[k]++ } })
  return keys.map(k => ({ k, n: counts[k] }))
}

function ViewToggle({ view, setView }) {
  return (
    <div className="flex rounded-lg bg-page border border-line p-0.5 gap-0.5 text-xs font-semibold" role="group" aria-label="View">
      {['Chart', 'Table'].map(v => (
        <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
          className={`rounded-md px-2.5 py-1 ${view === v ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>{v}</button>
      ))}
    </div>
  )
}

function Card({ title, sub, total, children, view, setView }) {
  return (
    <section className="bg-card border border-line rounded-card shadow-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">{title}</h2>
          {sub && <p className="text-xs text-ink-3 mt-0.5">{sub}</p>}
        </div>
        {setView && <ViewToggle view={view} setView={setView} />}
      </div>
      {total !== undefined && <div className="mt-2 text-2xl font-bold font-heading">{total}</div>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

// Daily column chart: 4px rounded tops anchored to the baseline, 2px gaps, recessive grid, hover tooltip.
function DailyChart({ title, sub, series, unit, color }) {
  const [view, setView] = useState('Chart')
  const [hover, setHover] = useState(null)
  const total = series.reduce((s, d) => s + d.n, 0)
  const max = Math.max(1, ...series.map(d => d.n))
  const niceMax = Math.ceil(max / 4) * 4 || 4
  const W = 600, H = 170, L = 30, R = 8, B = 26, T = 8
  const cw = (W - L - R) / series.length, bw = Math.max(2, cw - 2)
  const y = v => T + (H - T - B) * (1 - v / niceMax)
  const ticks = [0, niceMax / 2, niceMax]
  const labelIdx = new Set([0, Math.floor(series.length / 2), series.length - 1])

  return (
    <Card title={title} sub={sub} total={`${total} ${unit}`} view={view} setView={setView}>
      {view === 'Table' ? (
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-ink-3"><tr><th className="py-1">Date</th><th className="py-1 text-right">{unit}</th></tr></thead>
            <tbody className="divide-y divide-line">
              {[...series].reverse().map(d => <tr key={d.k}><td className="py-1.5 text-ink-2">{dayLabel(d.k)}</td><td className="py-1.5 text-right font-semibold">{d.n}</td></tr>)}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${title}: ${total} ${unit} over ${series.length} days`}>
            {ticks.map(t => (
              <g key={t}>
                <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#eceaf3" strokeWidth="1" />
                <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="13" fill="#5f5680">{t}</text>
              </g>
            ))}
            {series.map((d, i) => {
              const x = L + i * cw + 1, top = y(d.n), h = H - B - top, r = Math.min(4, h, bw / 2)
              return (
                <g key={d.k}>
                  {d.n > 0 && (
                    <path fill={color} opacity={hover === null || hover === i ? 1 : 0.45}
                      d={`M${x},${H - B} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${H - B} Z`} />
                  )}
                  <rect x={L + i * cw} y={T} width={cw} height={H - T - B} fill="transparent"
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
                  {labelIdx.has(i) && <text x={i === 0 ? x : i === series.length - 1 ? x + bw : x + bw / 2} y={H - 6} fontSize="13" fill="#5f5680"
                    textAnchor={i === 0 ? 'start' : i === series.length - 1 ? 'end' : 'middle'}>{dayLabel(d.k)}</text>}
                </g>
              )
            })}
            <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="#cdd5e2" strokeWidth="1" />
          </svg>
          {hover !== null && (
            <div className="pointer-events-none absolute -top-2 rounded-md bg-ink text-white text-xs px-2 py-1 shadow-card-hover whitespace-nowrap"
              style={{ left: `${((L + hover * cw + cw / 2) / W) * 100}%`, transform: 'translate(-50%, -100%)' }}>
              {dayLabel(series[hover].k)} · <b>{series[hover].n}</b> {unit}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// Horizontal ranked bars with the second measure as text (keeps one axis).
function BreakdownBars({ title, sub, rows, barLabel, extra }) {
  const [view, setView] = useState('Chart')
  const max = Math.max(1, ...rows.map(r => r.n))
  return (
    <Card title={title} sub={sub} view={view} setView={setView}>
      {rows.length === 0 ? <p className="text-sm text-ink-3">No data yet.</p> : view === 'Table' ? (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-ink-3"><tr><th className="py-1">Name</th><th className="py-1 text-right">{barLabel}</th><th className="py-1 text-right">{extra.label}</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map(r => <tr key={r.name}><td className="py-1.5">{r.name}</td><td className="py-1.5 text-right font-semibold">{r.n}</td><td className="py-1.5 text-right text-ink-2">{extra.value(r)}</td></tr>)}
          </tbody>
        </table>
      ) : (
        <ul className="space-y-3">
          <li className="flex gap-4 text-xs text-ink-3" aria-hidden>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-slate-300" />{barLabel}</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-c-paid" />Paid</span>
          </li>
          {rows.map(r => (
            <li key={r.name} title={`${r.name}: ${r.n} ${barLabel.toLowerCase()} · ${extra.value(r)} ${extra.label.toLowerCase()}`}>
              <div className="flex justify-between gap-3 text-sm"><span className="truncate">{r.name}</span>
                <span className="whitespace-nowrap"><b>{r.n}</b> <span className="text-ink-3">· {extra.value(r)} {extra.label.toLowerCase()}</span></span></div>
              <div className="mt-1.5 h-2 rounded-full bg-page overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 rounded-full bg-slate-300" style={{ width: `${(r.n / max) * 100}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-c-paid" style={{ width: `${(r.paid / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function Trends({ people, apps }) {
  const [days, setDays] = useState(30)
  const [now] = useState(() => Date.now())
  const since = now - days * 86400000
  const inRange = d => d && new Date(d).getTime() >= since

  const paid = apps.filter(a => a.status === 'paid')
  const signups = buckets(people.map(p => p.signupAt), days, now)
  const started = buckets(apps.map(a => a.createdAt), days, now)
  const payments = buckets(paid.map(a => a.paidAt), days, now)
  const revenue = paid.filter(a => inRange(a.paidAt)).reduce((s, a) => s + (a.amount || 49), 0)

  const group = (list, key) => Object.values(list.reduce((m, x) => {
    const k = key(x) || '—'; (m[k] = m[k] || { name: k, items: [] }).items.push(x); return m
  }, {}))
  const stateRows = group(people.filter(p => inRange(p.signupAt)), p => p.state)
    .map(g => ({ name: g.name, n: g.items.length, paid: g.items.filter(p => p.funnel.paid).length }))
    .sort((a, b) => b.n - a.n).slice(0, 10)
  const schemeRows = group(apps.filter(a => inRange(a.createdAt)), a => a.scheme)
    .map(g => ({ name: g.name, n: g.items.length, paid: g.items.filter(a => a.status === 'paid').length }))
    .sort((a, b) => b.n - a.n)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Trends</h1>
          <p className="mt-1 text-sm text-ink-2">How sign-ups, applications and payments are moving over time.</p>
        </div>
        <div className="flex rounded-lg bg-page border border-line p-0.5 gap-0.5 text-sm font-semibold" role="group" aria-label="Date range">
          {RANGES.map(r => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`rounded-md px-3 py-1.5 ${days === r ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>Last {r} days</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <DailyChart title="Daily sign-ups" sub="People who downloaded the Neev app" series={signups} unit="sign-ups" color="#2a78d6" />
        <DailyChart title="Applications started" sub="Scheme forms users began filling" series={started} unit="applications" color="#eb6834" />
        <DailyChart title="Paid applications" sub={`₹${revenue.toLocaleString('en-IN')} collected in this period`} series={payments} unit="paid" color="#199e70" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <BreakdownBars title="Users by state" sub="Sign-ups in this period, with how many paid for a scheme" rows={stateRows}
          barLabel="Users" extra={{ label: 'Paid', value: r => `${r.paid} (${pct(r.paid, r.n)}%)` }} />
        <BreakdownBars title="Applications by scheme" sub="Applications started in this period, with how many were paid" rows={schemeRows}
          barLabel="Applications" extra={{ label: 'Paid', value: r => `${r.paid} (${pct(r.paid, r.n)}%)` }} />
      </div>
    </div>
  )
}

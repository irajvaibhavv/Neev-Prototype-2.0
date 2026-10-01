import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OUTCOMES, STAGES, fmtDate, funnelCounts, pct } from '../lib/applications'

// Saralya "Application summary" style: pastel tinted cards with a coloured number.
const STAGE_STYLE = {
  new: { card: 'bg-info-tint/60 border-info/25', num: 'text-info', badge: 'bg-info-tint text-info' },
  in_progress: { card: 'bg-cyan-50 border-cyan-200', num: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
  incomplete: { card: 'bg-orange-50 border-orange-200', num: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  pending: { card: 'bg-warn-tint/70 border-warn/25', num: 'text-warn', badge: 'bg-warn-tint text-warn' },
  filled: { card: 'bg-brand-tint/70 border-brand/25', num: 'text-brand-dark', badge: 'bg-brand-tint text-side-active' },
}
const OUTCOME_BAR = { approved: 'bg-ok', in_process: 'bg-info', disapproved: 'bg-bad' }
const OUTCOME_TEXT = { approved: 'text-ok', in_process: 'text-info', disapproved: 'text-bad' }
const FUNNEL_LINK = { schemesOpened: '/leads/schemesOpened', schemeClicked: '/leads/schemeClicked', }

function Panel({ title, sub, children, className = '' }) {
  return (
    <section className={`bg-card border border-line rounded-card shadow-card p-5 ${className}`}>
      <h2 className="font-bold">{title}</h2>
      {sub && <p className="text-xs text-ink-3 mt-0.5">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function Dashboard({ agent, people, apps }) {
  const [hour] = useState(() => new Date().getHours())
  const funnel = funnelCounts(people)
  const top = funnel[0].n || 1
  const byStage = k => apps.filter(a => a.stage === k)
  const filled = byStage('filled')
  const decided = filled.filter(a => a.outcome !== 'in_process').length
  const approved = filled.filter(a => a.outcome === 'approved').length
  const paidApps = apps.filter(a => a.status === 'paid')
  const revenue = paidApps.reduce((s, a) => s + (a.amount || 0), 0)
  const inCart = apps.filter(a => a.status === 'cart')
  const schemeCounts = Object.entries(apps.reduce((m, a) => ({ ...m, [a.scheme]: (m[a.scheme] || 0) + 1 }), {}))
    .sort((x, y) => y[1] - x[1]).slice(0, 6)
  const maxScheme = schemeCounts[0]?.[1] || 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-2">
          Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {agent.name.split(' ')[0]} — here's how app users are moving through Government schemes.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['App users', funnel[0].n, 'Downloaded the Neev app', 'border-t-brand'],
          ['Scheme applications', apps.length, `${paidApps.length} paid · ${apps.length - paidApps.length} not paid`, 'border-t-info'],
          ['Revenue', `₹${revenue.toLocaleString('en-IN')}`, `₹49 × ${paidApps.length} paid applications`, 'border-t-ok'],
          ['Waiting in cart', inCart.length, `₹${(inCart.length * 49).toLocaleString('en-IN')} not yet paid`, 'border-t-warn'],
        ].map(([label, value, sub, accent]) => (
          <div key={label} className={`bg-card border border-line border-t-4 ${accent} rounded-card shadow-card p-4`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-3">{label}</div>
            <div className="mt-1 text-2xl font-bold font-heading">{value}</div>
            <div className="text-xs text-ink-3 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <Panel title="User funnel" sub="From app download to payment. Each bar = people who reached that step; the % shows how many continued from the step before. Click a step to see those people.">
        <ol className="space-y-3">
          {funnel.map((s, i) => {
            const prev = i ? funnel[i - 1].n : s.n
            const drop = prev - s.n
            const row = (
              <div className="grid grid-cols-[150px_1fr_auto] sm:grid-cols-[190px_1fr_150px] items-center gap-3">
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="h-8 rounded-md bg-page overflow-hidden">
                  <div className="h-full rounded-md bg-c-users flex items-center justify-end pr-2 text-xs font-bold text-white min-w-10"
                    style={{ width: `${Math.max(pct(s.n, top), 4)}%` }}>{s.n}</div>
                </div>
                <div className="text-xs text-right">
                  {i === 0 ? <span className="text-ink-3">100%</span> : <>
                    <b className="text-ink">{pct(s.n, prev)}%</b> <span className="text-ink-3">continued</span>
                    <div className="text-bad/80">−{drop} dropped</div>
                  </>}
                </div>
              </div>
            )
            return <li key={s.key}>{FUNNEL_LINK[s.key] ? <Link to={FUNNEL_LINK[s.key]} className="block rounded-md hover:bg-brand/5 -mx-2 px-2 py-0.5">{row}</Link> : row}</li>
          })}
        </ol>
        <p className="mt-4 text-xs text-ink-3">Overall: <b className="text-ink">{pct(funnel[funnel.length - 1].n, top)}%</b> of app users have paid for at least one scheme.</p>
      </Panel>

      {/* Application summary */}
      <section>
        <h2 className="font-bold">Application summary</h2>
        <p className="text-xs text-ink-3 mt-0.5">One application per scheme — a user can apply for several.</p>
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-3">
          {STAGES.map(s => (
            <div key={s.key} className={`rounded-card border p-4 ${STAGE_STYLE[s.key].card}`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-2">{s.label}</div>
              <div className={`mt-1 text-3xl font-bold font-heading ${STAGE_STYLE[s.key].num}`}>{byStage(s.key).length}</div>
              <div className="mt-1 text-xs text-ink-3">{s.desc.split(' — ')[0]}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Filled application outcomes" sub="Result from the government portal">
          {filled.length === 0 ? <p className="text-sm text-ink-3">No filled applications yet.</p> : (
            <>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-page">
                {OUTCOMES.map(o => {
                  const n = filled.filter(a => a.outcome === o.key).length
                  return n ? <div key={o.key} className={OUTCOME_BAR[o.key]} style={{ width: `${(n / filled.length) * 100}%` }} title={`${o.label}: ${n}`} /> : null
                })}
              </div>
              <ul className="mt-4 space-y-2.5">
                {OUTCOMES.map(o => (
                  <li key={o.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${OUTCOME_BAR[o.key]}`} />{o.label}</span>
                    <b className={OUTCOME_TEXT[o.key]}>{filled.filter(a => a.outcome === o.key).length}</b>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-line">
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Approval rate</div>
                <div className="text-2xl font-bold font-heading text-ok">{decided ? `${pct(approved, decided)}%` : '—'}</div>
                <div className="text-xs text-ink-3">of decided applications</div>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Applications by scheme" sub="Which schemes users apply for most" className="lg:col-span-2">
          {schemeCounts.length === 0 ? <p className="text-sm text-ink-3">No applications yet.</p> : (
            <ul className="space-y-3">
              {schemeCounts.map(([name, n]) => (
                <li key={name}>
                  <div className="flex justify-between text-sm"><span>{name}</span><b>{n}</b></div>
                  <div className="mt-1 h-2 rounded-full bg-page overflow-hidden">
                    <div className="h-full rounded-full bg-c-apps" style={{ width: `${(n / maxScheme) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent applications" sub="Latest activity from the Neev app">
        {apps.length === 0 ? <p className="text-sm text-ink-3">Applications appear when users start filling a scheme in the Neev app.</p> : (
          <ul className="divide-y divide-line -my-2">
            {apps.slice(0, 6).map(a => (
              <li key={a.id} className="py-2.5 flex items-center gap-3 text-sm">
                <span className="size-2 rounded-full bg-line-strong shrink-0" />
                <div className="flex-1 min-w-0"><span className="font-bold">{a.applicant}</span> <span className="text-ink-2">· {a.scheme}</span></div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STAGE_STYLE[a.stage].badge}`}>{STAGES.find(s => s.key === a.stage).short}</span>
                <span className="hidden sm:block text-xs text-ink-3 w-24 text-right">{fmtDate(a.paidAt || a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SLA_DAYS, agentStats, assign, fmtDays, getAgents } from '../../lib/agents'
import { OUTCOMES, REMOVED, STAGES, daysSince, fmtDate } from '../../lib/applications'
import { seg, segBtn } from '../../lib/ui'
import WipBanner from '../../components/WipBanner'

// Same palette as the agent dashboard: stage cards tinted, outcomes in status colours.
const STAGE_CARD = {
  new: ['bg-info-tint/60 border-info/25', 'text-info', 'To file', 'Paid with all documents — file on the govt portal'],
  pending: ['bg-warn-tint/70 border-warn/25', 'text-warn', 'Waiting on documents', 'Paid, but the user still owes documents'],
  filled: ['bg-brand-tint/70 border-brand/25', 'text-brand-dark', 'Filed', 'Submitted on the government portal'],
  removed: ['bg-page border-line', 'text-ink-2', 'Removed', 'Taken out, e.g. user not eligible'],
}
const OUTCOME_BAR = { approved: 'bg-ok', in_process: 'bg-info', disapproved: 'bg-bad' }
const OUTCOME_TEXT = { approved: 'text-ok', in_process: 'text-info', disapproved: 'text-bad' }
const STAGE_BADGE = { new: 'bg-info-tint text-info', in_progress: 'bg-cyan-100 text-cyan-800', pending: 'bg-warn-tint text-warn', filled: 'bg-brand-tint text-side-active', removed: 'bg-page text-ink-2 border border-line' }
const STAGE_NAME = Object.fromEntries([...STAGES, REMOVED].map(s => [s.key, s.short]))

function Panel({ title, sub, children, className = '' }) {
  return (
    <section className={`bg-card border border-line rounded-card shadow-card p-5 ${className}`}>
      <h2 className="font-bold">{title}</h2>
      {sub && <p className="text-xs text-ink-3 mt-0.5">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function AgentDetail({ apps, includeSample }) {
  const { id } = useParams()
  const [tab, setTab] = useState('all')
  const agents = getAgents(includeSample)
  const agent = agents.find(a => a.id === id)
  if (!agent) return (
    <div>
      <Link to="/admin/agents" className="text-sm text-side-active font-semibold hover:underline">← Agents overview</Link>
      <p className="mt-6 text-ink-2">This agent doesn't exist (demo agents are hidden when sample data is off).</p>
    </div>
  )
  const s = agentStats(agent, assign(apps, agents))
  const list = s.apps.filter(a => tab === 'all' || a.stage === tab)
  const initials = agent.name.split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div className="space-y-6">
      <WipBanner />
      <Link to="/admin/agents" className="text-sm text-side-active font-semibold hover:underline">← Agents overview</Link>

      {/* Profile */}
      <div className="bg-card border border-line rounded-card shadow-card p-5 flex flex-wrap items-center gap-4">
        <div className="size-14 rounded-full bg-brand text-white grid place-items-center font-heading font-bold text-lg">{initials}</div>
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">{agent.name}
            {agent.demo && <span className="ml-2 align-middle rounded bg-page border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-3">Demo</span>}
          </h1>
          <p className="text-sm text-ink-2">Agent · +91 {agent.mobile}{agent.joinedAt && ` · joined ${fmtDate(agent.joinedAt)}`}</p>
        </div>
        <div className="text-right text-sm">
          {agent.active === false ? <span className="font-semibold text-bad">Deactivated</span> : <span className="font-semibold text-ok">Active</span>}
          <div className="text-xs text-ink-3">Last active {s.lastActive ? fmtDate(s.lastActive) : '—'}</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ['Assigned', s.total, 'Paid applications given to this agent', 'border-t-brand'],
          ['Open now', s.open, 'To file, waiting on docs or awaiting govt result', 'border-t-info'],
          ['Filed', s.filed, `${s.filedThisWeek} in the last 7 days`, 'border-t-c-apps'],
          ['Approval rate', s.approvalRate == null ? '—' : `${s.approvalRate}%`, `${s.approved} approved · ${s.disapproved} disapproved`, 'border-t-ok'],
          ['Avg time to file', fmtDays(s.avgTurnaround), `From payment to filing · target ${SLA_DAYS} days`, 'border-t-warn'],
        ].map(([label, value, sub, accent]) => (
          <div key={label} className={`bg-card border border-line border-t-4 ${accent} rounded-card shadow-card p-4`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-3">{label}</div>
            <div className="mt-1 text-2xl font-bold font-heading">{value}</div>
            <div className="text-xs text-ink-3 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Work breakdown */}
      <section>
        <h2 className="font-bold">Application breakdown</h2>
        <p className="text-xs text-ink-3 mt-0.5">Where this agent's applications are right now. Click a card to list them below.</p>
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(STAGE_CARD).map(([k, [card, num, label, desc]]) => (
            <button key={k} onClick={() => setTab(k)} className={`text-left rounded-card border p-4 transition-shadow hover:shadow-card-hover ${card} ${tab === k ? 'ring-2 ring-brand/40' : ''}`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-2">{label}</div>
              <div className={`mt-1 text-3xl font-bold font-heading ${num}`}>{k === 'removed' ? s.removed : k === 'new' ? s.toFile : k === 'pending' ? s.pending : s.filed}</div>
              <div className="mt-1 text-xs text-ink-3">{desc}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Government outcomes" sub="Results of applications this agent filed">
          {s.filed === 0 ? <p className="text-sm text-ink-3">Nothing filed yet.</p> : (
            <>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-page">
                {OUTCOMES.map(o => {
                  const n = s[o.key === 'in_process' ? 'inProcess' : o.key]
                  return n ? <div key={o.key} className={OUTCOME_BAR[o.key]} style={{ width: `${(n / s.filed) * 100}%` }} title={`${o.label}: ${n}`} /> : null
                })}
              </div>
              <ul className="mt-4 space-y-2.5">
                {OUTCOMES.map(o => (
                  <li key={o.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${OUTCOME_BAR[o.key]}`} />{o.label}</span>
                    <b className={OUTCOME_TEXT[o.key]}>{s[o.key === 'in_process' ? 'inProcess' : o.key]}</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel title="Service & money" sub="How the agent is keeping users moving">
          <dl className="space-y-2.5 text-sm">
            {[
              ['Overdue to file', s.overdue.length, s.overdue.length ? 'text-warn' : ''],
              ['Oldest waiting to file', s.oldestWaiting == null ? '—' : `${s.oldestWaiting} days`, s.oldestWaiting > SLA_DAYS ? 'text-warn' : ''],
              ['Document reminders sent', s.reminders, ''],
              ['Fees on assigned applications', `₹${s.fees.toLocaleString('en-IN')}`, ''],
              ['Removed applications', s.removed, ''],
              ['Refunds due (removed after payment)', s.refundsDue, s.refundsDue ? 'text-bad' : ''],
            ].map(([k, v, c]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-ink-2">{k}</dt><dd className={`font-bold ${c}`}>{v}</dd></div>
            ))}
          </dl>
        </Panel>

        <Panel title="Needs attention" sub={`Paid with all documents, waiting more than ${SLA_DAYS} days to be filed`}>
          {s.overdue.length === 0 ? <p className="text-sm text-ok font-semibold">All caught up ✓</p> : (
            <ul className="divide-y divide-line -my-2">
              {[...s.overdue].sort((a, b) => a.paidAt.localeCompare(b.paidAt)).slice(0, 6).map(a => (
                <li key={a.id} className="py-2 flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0 truncate"><b>{a.applicant}</b> <span className="text-ink-2">· {a.scheme}</span></div>
                  <span className="text-xs font-semibold text-warn whitespace-nowrap">{daysSince(a.paidAt)} days</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="By scheme" sub="Which schemes this agent handles and how they turn out">
        {s.byScheme.length === 0 ? <p className="text-sm text-ink-3">No applications yet.</p> : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-3">
                <tr><th className="px-5 py-2 font-semibold">Scheme</th><th className="px-5 py-2 font-semibold text-right">Assigned</th><th className="px-5 py-2 font-semibold text-right">Filed</th><th className="px-5 py-2 font-semibold text-right">Approved</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {s.byScheme.map(r => (
                  <tr key={r.scheme}><td className="px-5 py-2">{r.scheme}</td><td className="px-5 py-2 text-right font-semibold">{r.total}</td><td className="px-5 py-2 text-right">{r.filed}</td><td className="px-5 py-2 text-right text-ok font-semibold">{r.approved}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Applications */}
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-bold mr-auto">Applications <span className="text-ink-3 font-semibold">{list.length}</span></h2>
          <div className={seg} role="group" aria-label="Filter applications">
            {[['all', 'All'], ['new', 'To file'], ['in_progress', 'Filing'], ['pending', 'Waiting on docs'], ['filled', 'Filed'], ['removed', 'Removed']].map(([k, l]) => (
              <button key={k} aria-pressed={tab === k} onClick={() => setTab(k)} className={segBtn(tab === k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="mt-3 bg-card border border-line rounded-card shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Scheme</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Filed</th>
                <th className="px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.slice(0, 50).map(a => (
                <tr key={a.id}>
                  <td className="px-4 py-3"><b>{a.applicant}</b><div className="text-xs text-ink-3">{a.state}</div></td>
                  <td className="px-4 py-3">{a.scheme}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STAGE_BADGE[a.stage]}`}>{STAGE_NAME[a.stage]}</span>
                    {a.stage === 'filled' && <span className={`ml-2 text-xs font-semibold ${OUTCOME_TEXT[a.outcome]}`}>{OUTCOMES.find(o => o.key === a.outcome).label}</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{fmtDate(a.paidAt)}</td>
                  <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{a.filedAt ? fmtDate(a.filedAt) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-ink-2">
                    {a.stage === 'pending' && `Missing: ${a.docsMissing.join(', ')}${a.reminders.length ? ` · reminded ${a.reminders.length}×` : ''}`}
                    {a.stage === 'new' && (daysSince(a.paidAt) > SLA_DAYS ? <span className="text-warn font-semibold">Overdue · {daysSince(a.paidAt)} days</span> : `Waiting ${daysSince(a.paidAt)} days`)}
                    {a.stage === 'removed' && `${a.removed.reason}${a.removed.refund ? ' · refund due' : ''}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-10 text-center text-ink-2">No applications here.</p>}
          {list.length > 50 && <p className="p-3 text-center text-xs text-ink-3">Showing the latest 50 of {list.length}.</p>}
        </div>
      </section>
    </div>
  )
}

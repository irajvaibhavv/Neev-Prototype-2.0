import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OUTCOMES, REMOVED, STAGES, fmtDate } from '../lib/applications'
import ReminderModal from '../components/ReminderModal'
import RemoveModal from '../components/RemoveModal'

// What the manager can do in each section. Incomplete is waiting on the user (fill / pay), so no move.
const MOVES = {
  new: [{ label: 'Filed on portal → Filled', run: (a, h) => h.update(a.id, { stage: 'filled' }) }],
  pending: [{ label: 'Documents received → New', run: (a, h) => h.markAllDocs(a) }, { label: 'Filed on portal → Filled', run: (a, h) => h.update(a.id, { stage: 'filled' }) }],
  removed: [{ label: 'Restore', run: (a, h) => h.restoreApp(a) }],
  incomplete: [],
  filled: [],
}
const OUTCOME_STYLE = {
  in_process: 'bg-info-tint text-info border-info/30',
  approved: 'bg-ok-tint text-ok border-ok/30',
  disapproved: 'bg-bad-tint text-bad border-bad/30',
}
const Live = ({ a }) => (!a.sample ? <span className="ml-2 rounded bg-ok-tint text-ok text-[10px] px-1.5 py-0.5 font-bold align-middle">LIVE</span> : null)

export default function StagePage({ stage, apps, update, logReminder, markAllDocs, removeApp, restoreApp }) {
  const meta = [...STAGES, REMOVED].find(s => s.key === stage)
  const handlers = { update, markAllDocs, restoreApp }
  const [removing, setRemoving] = useState(null)
  const [filter, setFilter] = useState('all')
  const [reminding, setReminding] = useState(null)
  const inStage = apps.filter(a => a.stage === stage)
  const rows = stage === 'filled' && filter !== 'all' ? inStage.filter(a => a.outcome === filter) : inStage
  const dateLabel = stage === 'incomplete' ? 'Started' : stage === 'removed' ? 'Removed' : 'Paid'

  return (
    <div>
      <h1 className="text-2xl font-bold">{meta.label}</h1>
      <p className="mt-1 text-sm text-ink-2">{meta.desc}</p>

      {stage === 'filled' && (
        <div className="mt-5 inline-flex flex-wrap rounded-lg bg-page border border-line p-0.5 gap-0.5" role="tablist" aria-label="Filter by outcome">
          {[{ key: 'all', label: 'All' }, ...OUTCOMES].map(o => (
            <button key={o.key} role="tab" aria-selected={filter === o.key} onClick={() => setFilter(o.key)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                filter === o.key ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>
              {o.label}
              <span className="ml-2 text-xs text-ink-3">
                {o.key === 'all' ? inStage.length : inStage.filter(a => a.outcome === o.key).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 bg-card border border-line rounded-card shadow-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-3xl">🗂️</div>
            <p className="mt-2 font-semibold">No applications here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
                <tr>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Scheme</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold">{dateLabel}</th>
                  <th className="px-4 py-3 font-semibold">{stage === 'incomplete' ? 'Where they stopped' : stage === 'removed' ? 'Reason' : 'Documents'}</th>
                  <th className="px-4 py-3 font-semibold">{stage === 'filled' ? 'Outcome' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(a => (
                  <tr key={a.id} className="hover:bg-brand/5 align-top">
                    <td className="px-4 py-3">
                      <div><Link to={`/application/${a.id}`} className="font-semibold hover:text-side-active hover:underline">{a.applicant}</Link><Live a={a} /></div>
                      <a href={`tel:+91${a.mobile}`} className="text-xs text-side-active hover:underline">+91 {a.mobile}</a>
                    </td>
                    <td className="px-4 py-3">{a.scheme}</td>
                    <td className="px-4 py-3 text-ink-2">{a.state}</td>
                    <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{fmtDate(stage === 'incomplete' ? a.createdAt : stage === 'removed' ? a.removed.at : a.paidAt)}</td>
                    <td className="px-4 py-3 text-xs">
                      {stage === 'removed'
                        ? <span className="text-ink-2">{a.removed.reason}{a.removed.detail && <span className="block text-ink-3">{a.removed.detail}</span>}
                            {a.removed.refund && <span className="mt-1 inline-block rounded bg-warn-tint text-warn font-semibold px-1.5 py-0.5">₹{a.amount} refund due</span>}</span>
                        : stage === 'incomplete'
                        ? <span className={`rounded-full px-2.5 py-1 font-semibold ${a.status === 'cart' ? 'bg-warn-tint text-warn' : 'bg-orange-100 text-orange-700'}`}>
                            {a.status === 'cart' ? '🛒 In cart, not paid' : '✏️ Filling the form'}</span>
                        : a.docsMissing.length && stage === 'pending'
                          ? <span className="text-warn">Missing: {a.docsMissing.join(', ')}
                              {a.reminders.length > 0 && <span className="block text-ink-3">Reminded {a.reminders.length}×</span>}</span>
                          : <span className="text-ok">✓ All documents</span>}
                    </td>
                    <td className="px-4 py-3">
                        {stage === 'filled' ? (
                          <select value={a.outcome} aria-label={`Outcome for ${a.applicant}`} onChange={e => update(a.id, { outcome: e.target.value })}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none ${OUTCOME_STYLE[a.outcome]}`}>
                            {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                          </select>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {stage === 'pending' && (
                              <button onClick={() => setReminding(a)} className="rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap">📩 Remind</button>
                            )}
                            {MOVES[stage].map(m => (
                              <button key={m.label} onClick={() => m.run(a, handlers)}
                                className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active whitespace-nowrap">
                                {m.label}
                              </button>
                            ))}
                            {stage !== 'removed' && (
                              <button onClick={() => setRemoving(a)} aria-label={`Remove ${a.scheme} application of ${a.applicant}`} title="Remove application"
                                className="rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-bad hover:border-bad hover:bg-bad-tint">Remove</button>
                            )}
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {reminding && <ReminderModal app={reminding} onClose={() => setReminding(null)} onSent={logReminder} />}
      {removing && <RemoveModal app={removing} onClose={() => setRemoving(null)} onRemove={removeApp} />}
    </div>
  )
}

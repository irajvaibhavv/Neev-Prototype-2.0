import { useState } from 'react'
import { Link } from 'react-router-dom'
import { REMOVED, STAGES, appRef, fmtDate } from '../lib/applications'
import ReminderModal from '../components/ReminderModal'
import { filedAt } from '../lib/agents'
import StatusModal, { FILED } from '../components/StatusModal'
import { DEFAULT_STEPS, getSchemes } from '../lib/schemes'
import RemoveModal from '../components/RemoveModal'

// What the manager can do in each section. Incomplete is waiting on the user (fill / pay), so no move.
const MOVES = {
  new: [{ label: 'Filed on portal → Filled', run: (a, h) => h.update(a.id, { stage: 'filled' }) }],
  in_progress: [{ label: 'Filed on portal → Filled', run: (a, h) => h.update(a.id, { stage: 'filled' }) }],
  pending: [{ label: 'Documents received → New', run: (a, h) => h.markAllDocs(a) }], // sales hands it to the agents
  removed: [{ label: 'Restore', run: (a, h) => h.restoreApp(a) }],
  incomplete: [],
  filled: [],
}
// Filed date: the "Filed on" date the agent entered in Filing details, else when it was moved to Filled.
const filedOn = a => Object.entries(a.filing?.values || {}).find(([k, v]) => /filed/i.test(k) && /^\d{4}-\d{2}-\d{2}$/.test(v))?.[1] || filedAt(a)
const Live = ({ a }) => (!a.sample ? <span className="ml-2 rounded bg-ok-tint text-ok text-[10px] px-1.5 py-0.5 font-bold align-middle">LIVE</span> : null)

// linkDetail: agents open /application/:id; the sales area has no detail page yet.
export default function StagePage({ stage, apps, update, logReminder, markAllDocs, removeApp, restoreApp, linkDetail = true }) {
  const meta = [...STAGES, REMOVED].find(s => s.key === stage)
  const handlers = { update, markAllDocs, restoreApp }
  const [removing, setRemoving] = useState(null)
  const [reminding, setReminding] = useState(null)
  const [statusFor, setStatusFor] = useState(null) // application whose status pop-up is open
  const [stepsOf] = useState(() => { const m = Object.fromEntries(getSchemes().map(s => [s.name, s.steps])); return name => m[name] || DEFAULT_STEPS })
  const [query, setQuery] = useState('')
  const [scheme, setScheme] = useState('')
  const inStage = apps.filter(a => a.stage === stage)
  const searchable = true // search + scheme filter on every section
  const schemes = [...new Set(inStage.map(a => a.scheme))].sort()
  const q = query.trim().toLowerCase()
  const rows = inStage.filter(a => (!scheme || a.scheme === scheme)
    && (!q || [a.applicant, a.scheme, a.state, appRef(a.id)].some(v => String(v || '').toLowerCase().includes(q))))
  const lean = stage === 'new' || stage === 'in_progress' // all documents in: no documents column, phone, LIVE tag or Remove
  const dateLabel = stage === 'incomplete' ? 'Started' : stage === 'removed' ? 'Removed' : lean ? 'Created on' : stage === 'filled' ? 'Filed on' : 'Paid'

  return (
    <div>
      <h1 className="sr-only">{meta.label}</h1>

      {searchable && inStage.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search applications"
            placeholder="🔍 Search name, scheme, state or application ID"
            className="flex-1 min-w-60 rounded-lg bg-card border border-line px-3 py-2.5 text-sm outline-none focus:border-brand" />
          <select value={scheme} onChange={e => setScheme(e.target.value)} aria-label="Filter by scheme"
            className="w-full sm:w-72 rounded-lg bg-card border border-line px-3 py-2.5 text-sm outline-none focus:border-brand">
            <option value="">All schemes ({inStage.length})</option>
            {schemes.map(sc => <option key={sc} value={sc}>{sc} ({inStage.filter(a => a.scheme === sc).length})</option>)}
          </select>
          {(q || scheme) && <span className="text-sm text-ink-3">{rows.length} of {inStage.length}</span>}
        </div>
      )}

      <div className="bg-card border border-line rounded-card shadow-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-3xl">🗂️</div>
            <p className="mt-2 font-semibold">{inStage.length ? 'No applications match your search' : 'No applications here'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Application ID</th>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Scheme</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold">{dateLabel}</th>
                  {!lean && stage !== 'filled' && <th className="px-4 py-3 font-semibold">{stage === 'incomplete' ? 'Where they stopped' : stage === 'removed' ? 'Reason' : 'Documents'}</th>}
                  {(stage !== 'filled' || linkDetail) && <th className="px-4 py-3 font-semibold">{stage === 'in_progress' ? 'Status' : 'Action'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(a => (
                  <tr key={a.id} className="hover:bg-brand/5 align-top">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-2 whitespace-nowrap">{appRef(a.id)}</td>
                    <td className="px-4 py-3">
                      <div>{linkDetail ? <Link to={`/application/${a.id}`} className="font-semibold hover:text-side-active hover:underline">{a.applicant}</Link> : <span className="font-semibold">{a.applicant}</span>}{!lean && stage !== 'filled' && <Live a={a} />}</div>
                      {!lean && <a href={`tel:+91${a.mobile}`} className="text-xs text-side-active hover:underline">+91 {a.mobile}</a>}
                    </td>
                    <td className="px-4 py-3">{a.scheme}</td>
                    <td className="px-4 py-3 text-ink-2">{a.state}</td>
                    <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{fmtDate(stage === 'incomplete' || lean ? a.createdAt || a.paidAt : stage === 'removed' ? a.removed.at : stage === 'filled' ? filedOn(a) : a.paidAt)}</td>
                    {!lean && stage !== 'filled' && <td className="px-4 py-3 text-xs">
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
                    </td>}
                    {(stage !== 'filled' || linkDetail) && <td className="px-4 py-3">
                        {stage === 'filled' ? (
                          <Link to={`/application/${a.id}`} className="inline-block rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active whitespace-nowrap">View application</Link>
                        ) : stage === 'in_progress' ? (
                          // Status = current Application step (scheme's steps, super admin → Schemes); click → same pop-up as the detail page
                          <button onClick={() => setStatusFor(a)} title="Click to update the status"
                            className="rounded-full bg-cyan-100 hover:bg-cyan-200 text-cyan-800 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">{a.step || stepsOf(a.scheme)[0].name} ✎</button>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {stage === 'pending' && (
                              <button onClick={() => setReminding(a)} className="rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap">📩 Remind</button>
                            )}
                            {stage === 'new' && linkDetail ? (
                              // Moves it to In progress and opens the application (all details to file with); "Filed on portal → Filled" is there.
                              <Link to={`/application/${a.id}`} onClick={() => update(a.id, { stage: 'in_progress', note: 'Started filing' })} className="rounded-lg bg-brand hover:bg-side-active text-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap">Start filing</Link>
                            ) : MOVES[stage].map(m => (
                              <button key={m.label} onClick={() => m.run(a, handlers)}
                                className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active whitespace-nowrap">
                                {m.label}
                              </button>
                            ))}
                            {stage !== 'removed' && !lean && (
                              <button onClick={() => setRemoving(a)} aria-label={`Remove ${a.scheme} application of ${a.applicant}`} title="Remove application"
                                className="rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-bad hover:border-bad hover:bg-bad-tint">Remove</button>
                            )}
                          </div>
                        )}
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {statusFor && <StatusModal app={statusFor} steps={stepsOf(statusFor.scheme)} current={statusFor.step || stepsOf(statusFor.scheme)[0].name} onClose={() => setStatusFor(null)}
        onSave={v => { update(statusFor.id, v === FILED ? { stage: 'filled', note: 'Filed on the government portal' } : { step: v, note: `Status: ${v}` }); setStatusFor(null) }} />}
      {reminding && <ReminderModal app={reminding} onClose={() => setReminding(null)} onSent={logReminder} />}
      {removing && <RemoveModal app={removing} onClose={() => setRemoving(null)} onRemove={removeApp} />}
    </div>
  )
}

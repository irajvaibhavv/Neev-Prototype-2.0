import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FUNNEL, OUTCOMES, REMOVED, STAGES, appRef, fmtDate, fmtDateTime } from '../lib/applications'
import { answerRows } from '../lib/labels'
import ReminderModal from '../components/ReminderModal'
import Modal from '../components/Modal'
import ChatPanel from '../components/ChatPanel'
import FilingPanel from '../components/FilingPanel'
import StatusModal, { FILED } from '../components/StatusModal'
import { DEFAULT_FILING, DEFAULT_STEPS, getSchemes } from '../lib/schemes'
import { docUrl, downloadDoc } from '../lib/docPreview'
const ALL_STAGES = [...STAGES, REMOVED]
const STAGE_NAME = Object.fromEntries(ALL_STAGES.map(s => [s.key, s.short]))
const OUTCOME_NAME = Object.fromEntries(OUTCOMES.map(o => [o.key, o.label]))

function Card({ title, children, action }) {
  return (
    <section className="bg-card border border-line rounded-card shadow-card">
      <div className="px-5 py-3.5 border-b border-line flex items-center justify-between gap-3">
        <h2 className="font-bold">{title}</h2>{action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
// Everything about one application: who, eligibility answers, scheme form, documents, timeline, actions.
export default function ApplicationDetail({ apps, update, logReminder, markAllDocs, restoreApp }) {
  const { id } = useParams()
  const a = apps.find(x => x.id === id)
  const [reminding, setReminding] = useState(false)
  const [viewing, setViewing] = useState(null) // document name open in the viewer
  const [infoQuery, setInfoQuery] = useState('')
  const [statusOpen, setStatusOpen] = useState(false)
  const scheme = useMemo(() => getSchemes().find(s => s.name === a?.scheme), [a?.scheme])
  const steps = scheme?.steps || DEFAULT_STEPS
  const [tab, setTab] = useState('general') // General information · Documents · Timeline
  if (!a) return (
    <div className="bg-card border border-line rounded-card p-10 text-center">
      <p className="font-semibold">Application not found</p>
      <Link to="/new" className="text-sm text-side-active hover:underline">Back to applications</Link>
    </div>
  )
  const p = a.person || { funnel: {}, answers: {} }
  const docs = Object.entries(a.docs || {})
  const events = [
    ...FUNNEL.filter(s => (s.key === 'schemesOpened' || s.key === 'schemeClicked') && p.funnel?.[s.key]).map(s => ({ at: p.funnel[s.key], label: s.label, who: 'User' })),
    p.signupAt && { at: p.signupAt, label: 'Downloaded the app', who: 'User' },
    !a.addedByAgent && a.createdAt && { at: a.createdAt, label: `Started ${a.scheme} application`, who: 'User' },
    a.cartAt && { at: a.cartAt, label: 'Added to cart', who: 'User' },
    !a.addedByAgent && a.paidAt && { at: a.paidAt, label: `Paid ₹${a.amount || 49}${a.paymentRef ? ` · ${a.paymentRef}` : ''}`, who: 'User' },
    ...a.history.map(h => ({ at: h.at, who: 'Agent',
      label: h.note || (h.stage ? `Moved to ${STAGE_NAME[h.stage]}` : h.outcome ? `Outcome set: ${OUTCOME_NAME[h.outcome]}` : 'Updated') })),
    ...a.reminders.map(r => ({ at: r.at, who: 'Agent', label: `Document reminder sent (${r.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}, ${r.lang === 'hi' ? 'Hindi' : 'English'})` })),
  ].filter(Boolean).sort((x, y) => x.at.localeCompare(y.at))
  const removed = a.stage === 'removed'
  const canRemind = a.status === 'paid' && a.docsMissing.length > 0 && a.stage !== 'filled' && !removed

  return (
    <div className="space-y-5">
      <Link to={`/${a.stage}`} className="text-sm text-side-active font-semibold hover:underline">← {ALL_STAGES.find(s => s.key === a.stage).label}</Link>

      {/* Header */}
      <div className="bg-card border border-line rounded-card shadow-card p-5 flex flex-wrap items-start gap-4">
        <div className="size-12 rounded-full bg-brand text-white grid place-items-center font-bold text-lg shrink-0">
          {a.applicant.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{a.applicant}</h1>
            {!a.sample && <span className="rounded bg-ok-tint text-ok text-[10px] px-1.5 py-0.5 font-bold">LIVE</span>}
          </div>
          <p className="text-sm text-ink-2 mt-0.5">Application ID <span className="font-mono font-semibold text-ink">{appRef(a.id)}</span></p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full px-2.5 py-1 bg-brand-tint text-side-active">📄 {a.scheme}</span>
            {a.status === 'paid' && !a.addedByAgent && <span className="rounded-full px-2.5 py-1 bg-ok-tint text-ok">Paid {fmtDate(a.paidAt)}</span>}
            {a.addedByAgent && <span className="rounded-full px-2.5 py-1 bg-page border border-line text-ink-2">Added by agent · {a.payment === 'collected' ? `₹${a.amount} collected` : 'fee waived'}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canRemind && <button onClick={() => setReminding(true)} className="rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white px-3.5 py-2 text-sm font-semibold">📩 Remind about documents</button>}
          {a.stage === 'pending' && <button onClick={() => markAllDocs(a)} className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink-2 hover:border-brand hover:text-side-active">Documents received → New</button>}
          {a.stage === 'new' && <button onClick={() => update(a.id, { stage: 'in_progress', note: 'Started filing' })} className="rounded-lg bg-brand hover:bg-side-active text-white px-3.5 py-2 text-sm font-semibold">Start filing</button>}
          {a.stage === 'in_progress' && (
            <button onClick={() => setStatusOpen(true)} title="Click to update the status"
              className="rounded-lg border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-left px-3.5 py-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-800">Status · click to update</span>
              <span className="block text-sm font-semibold text-ink">{a.step || steps[0].name} ✎</span>
            </button>
          )}
          {a.stage === 'pending' && <button onClick={() => update(a.id, { stage: 'filled' })} className="rounded-lg bg-brand hover:bg-side-active text-white px-3.5 py-2 text-sm font-semibold">Filed on portal → Filled</button>}
          {a.stage === 'filled' && (
            <select value={a.outcome} aria-label="Outcome" onChange={e => update(a.id, { outcome: e.target.value })}
              className="rounded-lg border border-line px-3 py-2 text-sm font-semibold outline-none focus:border-brand">
              {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          )}
        </div>
      </div>

      {removed && (
        <div className="rounded-card border border-bad/30 bg-bad-tint px-5 py-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0 text-sm text-bad">
            <b>Removed {fmtDate(a.removed.at)} — {a.removed.reason}</b>{a.removed.detail && <span>: {a.removed.detail}</span>}
            {a.removed.refund && <div className="mt-0.5 font-semibold">₹{a.amount} refund due to the user.</div>}
          </div>
          <button onClick={() => restoreApp(a)} className="rounded-lg bg-card border border-line px-3.5 py-2 text-sm font-semibold text-ink-2 hover:border-brand">Restore application</button>
        </div>
      )}

      <div className="inline-flex flex-wrap rounded-lg bg-page border border-line p-0.5 gap-0.5" role="tablist" aria-label="Application sections">
        {[['general', 'General information'], ['docs', `Documents (${docs.length - a.docsMissing.length}/${docs.length})`], ['filing', a.filing ? 'Filing details ✓' : 'Filing details'], ['timeline', `Timeline (${events.length})`], ['chat', '💬 Chat']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === k ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>{l}</button>
        ))}
      </div>

      {tab === 'general' && (() => {
        // Everything we know about the applicant in one list, row by row; the search box filters by label or value.
        const all = [['Name', a.applicant], ['Gender', p.gender], ['Date of birth', p.dob],
          ['Aadhaar', p.aadhaarLast4 ? `XXXX XXXX ${p.aadhaarLast4}` : ''], ['Address (Aadhaar)', p.address],
          ['Current address', a.address || p.currentAddress], ['Mobile', `+91 ${a.mobile}`],
          ...answerRows(p.answers), ...Object.entries(a.formData || {})]
        const q = infoQuery.trim().toLowerCase()
        const rows = q ? all.filter(([k, v]) => `${k} ${v ?? ''}`.toLowerCase().includes(q)) : all
        return (
          <section className="max-w-3xl bg-card border border-line rounded-card shadow-card">
            <div className="px-5 py-3.5 border-b border-line">
              <input type="search" value={infoQuery} onChange={e => setInfoQuery(e.target.value)} aria-label="Search information"
                placeholder="🔍 Search information, e.g. income, address, ration"
                className="w-full rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand" />
            </div>
            <dl className="divide-y divide-line">
              {rows.map(([k, v], i) => (
                <div key={i} className="px-5 py-2.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 text-sm">
                  <dt className="text-ink-3">{k}</dt><dd className="font-medium break-words">{v || '—'}</dd>
                </div>
              ))}
            </dl>
            {rows.length === 0 && <p className="px-5 py-6 text-sm text-ink-3">Nothing matches “{infoQuery}”.</p>}
          </section>
        )
      })()}

      {tab === 'docs' && (
        <div className="max-w-3xl">
          <Card title={`Documents (${docs.length - a.docsMissing.length}/${docs.length} uploaded)`}
            action={canRemind && <button onClick={() => setReminding(true)} className="text-xs font-semibold text-side-active hover:underline">Send reminder</button>}>
            {docs.length === 0 ? <p className="text-sm text-ink-3">No documents yet.</p> : (
              <ul className="space-y-2">
                {docs.map(([d, ok]) => (
                  <li key={d} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${ok ? 'border-line bg-card' : 'border-warn/30 bg-warn-tint/50'}`}>
                    <span className="font-medium">{!ok && '⚠️ '}{d}</span>
                    <span className="flex items-center gap-3">
                      {ok === 'on-file' && <span className="text-xs text-ink-3">Verified in app</span>}
                      {!ok && <span className="text-xs font-semibold text-warn">Missing</span>}
                      {ok && <>
                        <button onClick={() => setViewing(d)} className="rounded-md bg-card border border-line px-2 py-1 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active">👁 View</button>
                        <button onClick={() => downloadDoc(a, d)} className="rounded-md bg-card border border-line px-2 py-1 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active">⬇ Download</button>
                      </>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {a.reminders.length > 0 && <p className="mt-3 text-xs text-ink-3">Last reminded {fmtDateTime(a.reminders[a.reminders.length - 1].at)}</p>}
          </Card>
        </div>
      )}

      {tab === 'filing' && <FilingPanel key={a.id} app={a} fields={scheme?.filingFields || DEFAULT_FILING} onSave={(filing, note) => update(a.id, { filing, note })} openChat={() => setTab('chat')} />}

      {tab === 'chat' && <ChatPanel app={a} />}

      {tab === 'timeline' && (
        <div className="max-w-3xl">
          <Card title="Timeline">
            <ol className="relative border-l-2 border-line ml-1.5 space-y-4">
              {events.map((e, i) => (
                <li key={i} className="pl-4 relative">
                  <span className={`absolute -left-[7px] top-1 size-3 rounded-full ring-2 ring-card ${e.who === 'Agent' ? 'bg-brand' : 'bg-ok'}`} />
                  <div className="text-sm font-medium">{e.label}</div>
                  <div className="text-xs text-ink-3">{fmtDateTime(e.at)} · {e.who}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {viewing && (
        <Modal title={viewing} sub={a.applicant} onClose={() => setViewing(null)} labelId="doc-view-title"
          footer={<><button onClick={() => setViewing(null)} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-2 hover:border-brand">Close</button>
            <button onClick={() => downloadDoc(a, viewing)} className="rounded-lg bg-brand hover:bg-side-active text-white px-4 py-2 text-sm font-semibold">⬇ Download</button></>}>
          <img src={docUrl(a, viewing)} alt={`${viewing} of ${a.applicant}`} className="w-full rounded-lg border border-line" />
        </Modal>
      )}
      {statusOpen && <StatusModal app={a} steps={steps} current={a.step || steps[0].name} onClose={() => setStatusOpen(false)}
        onSave={v => { update(a.id, v === FILED ? { stage: 'filled', note: 'Filed on the government portal' } : { step: v, note: `Status: ${v}` }); setStatusOpen(false) }} />}
      {reminding && <ReminderModal app={a} onClose={() => setReminding(false)} onSent={logReminder} />}
    </div>
  )
}

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FUNNEL, OUTCOMES, STAGES, fmtDate, fmtDateTime } from '../lib/applications'
import { answerRows } from '../lib/labels'
import ReminderModal from '../components/ReminderModal'

const STAGE_BADGE = {
  new: 'bg-info-tint text-info', incomplete: 'bg-orange-100 text-orange-700',
  pending: 'bg-warn-tint text-warn', filled: 'bg-brand-tint text-side-active',
}
const OUTCOME_BADGE = { in_process: 'bg-info-tint text-info', approved: 'bg-ok-tint text-ok', disapproved: 'bg-bad-tint text-bad' }
const STAGE_NAME = Object.fromEntries(STAGES.map(s => [s.key, s.short]))
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
function Rows({ rows }) {
  if (!rows.length) return <p className="text-sm text-ink-3">Nothing recorded.</p>
  return (
    <dl className="divide-y divide-line -my-2">
      {rows.map(([k, v]) => (
        <div key={k} className="py-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 text-sm">
          <dt className="text-ink-3">{k}</dt><dd className="font-medium text-right break-words">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

// Everything about one application: who, eligibility answers, scheme form, documents, timeline, actions.
export default function ApplicationDetail({ apps, update, logReminder }) {
  const { id } = useParams()
  const a = apps.find(x => x.id === id)
  const [reminding, setReminding] = useState(false)
  if (!a) return (
    <div className="bg-card border border-line rounded-card p-10 text-center">
      <p className="font-semibold">Application not found</p>
      <Link to="/dashboard" className="text-sm text-side-active hover:underline">Back to dashboard</Link>
    </div>
  )
  const p = a.person || { funnel: {}, answers: {} }
  const docs = Object.entries(a.docs || {})
  const events = [
    ...FUNNEL.filter(s => (s.key === 'schemesOpened' || s.key === 'schemeClicked') && p.funnel?.[s.key]).map(s => ({ at: p.funnel[s.key], label: s.label, who: 'User' })),
    p.signupAt && { at: p.signupAt, label: 'Downloaded the app', who: 'User' },
    a.createdAt && { at: a.createdAt, label: `Started ${a.scheme} application`, who: 'User' },
    a.cartAt && { at: a.cartAt, label: 'Added to cart', who: 'User' },
    a.paidAt && { at: a.paidAt, label: `Paid ₹${a.amount || 49}${a.paymentRef ? ` · ${a.paymentRef}` : ''}`, who: 'User' },
    ...a.history.map(h => ({ at: h.at, who: 'Manager',
      label: h.stage ? `Moved to ${STAGE_NAME[h.stage]}` : h.outcome ? `Outcome set: ${OUTCOME_NAME[h.outcome]}` : 'Updated' })),
    ...a.reminders.map(r => ({ at: r.at, who: 'Manager', label: `Document reminder sent (${r.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}, ${r.lang === 'hi' ? 'Hindi' : 'English'})` })),
  ].filter(Boolean).sort((x, y) => x.at.localeCompare(y.at))
  const canRemind = a.status === 'paid' && a.docsMissing.length > 0 && a.stage !== 'filled'

  return (
    <div className="space-y-5">
      <Link to={`/${a.stage}`} className="text-sm text-side-active font-semibold hover:underline">← {STAGES.find(s => s.key === a.stage).label}</Link>

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
          <p className="text-sm text-ink-2 mt-0.5">{a.scheme} · {a.state} · <a href={`tel:+91${a.mobile}`} className="text-side-active hover:underline">+91 {a.mobile}</a></p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`rounded-full px-2.5 py-1 ${STAGE_BADGE[a.stage]}`}>{STAGE_NAME[a.stage]}</span>
            {a.stage === 'filled' && <span className={`rounded-full px-2.5 py-1 ${OUTCOME_BADGE[a.outcome]}`}>{OUTCOME_NAME[a.outcome]}</span>}
            {a.status === 'paid' && <span className="rounded-full px-2.5 py-1 bg-ok-tint text-ok">Paid {fmtDate(a.paidAt)}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canRemind && <button onClick={() => setReminding(true)} className="rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white px-3.5 py-2 text-sm font-semibold">📩 Remind about documents</button>}
          {a.stage === 'pending' && <button onClick={() => update(a.id, { stage: 'new' })} className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink-2 hover:border-brand hover:text-side-active">Documents received → New</button>}
          {(a.stage === 'new' || a.stage === 'pending') && <button onClick={() => update(a.id, { stage: 'filled' })} className="rounded-lg bg-brand hover:bg-side-active text-white px-3.5 py-2 text-sm font-semibold">Filed on portal → Filled</button>}
          {a.stage === 'filled' && (
            <select value={a.outcome} aria-label="Outcome" onChange={e => update(a.id, { outcome: e.target.value })}
              className="rounded-lg border border-line px-3 py-2 text-sm font-semibold outline-none focus:border-brand">
              {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Card title="Applicant (from Aadhaar)">
            <Rows rows={[['Name', a.applicant], ['Gender', p.gender], ['Date of birth', p.dob],
              ['Aadhaar', p.aadhaarLast4 ? `XXXX XXXX ${p.aadhaarLast4}` : ''], ['Address (Aadhaar)', p.address],
              ['Current address', a.address || p.currentAddress], ['Mobile', `+91 ${a.mobile}`]]} />
          </Card>
          <Card title="Eligibility answers"><Rows rows={answerRows(p.answers)} /></Card>
          <Card title="Scheme form details"><Rows rows={Object.entries(a.formData || {})} /></Card>
        </div>

        <div className="space-y-5">
          <Card title={`Documents (${docs.length - a.docsMissing.length}/${docs.length} uploaded)`}
            action={canRemind && <button onClick={() => setReminding(true)} className="text-xs font-semibold text-side-active hover:underline">Send reminder</button>}>
            {docs.length === 0 ? <p className="text-sm text-ink-3">No documents yet.</p> : (
              <ul className="space-y-2">
                {docs.map(([d, ok]) => (
                  <li key={d} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${ok ? 'border-ok/30 bg-ok-tint/40' : 'border-warn/30 bg-warn-tint/50'}`}>
                    <span>{ok ? '✅' : '⚠️'} {d}</span>
                    <span className={`text-xs font-semibold ${ok ? 'text-ok' : 'text-warn'}`}>{ok ? 'Uploaded' : 'Missing'}</span>
                  </li>
                ))}
              </ul>
            )}
            {a.reminders.length > 0 && <p className="mt-3 text-xs text-ink-3">Last reminded {fmtDateTime(a.reminders[a.reminders.length - 1].at)}</p>}
          </Card>

          <Card title="Timeline">
            <ol className="relative border-l-2 border-line ml-1.5 space-y-4">
              {events.map((e, i) => (
                <li key={i} className="pl-4 relative">
                  <span className={`absolute -left-[7px] top-1 size-3 rounded-full ring-2 ring-card ${e.who === 'Manager' ? 'bg-brand' : 'bg-ok'}`} />
                  <div className="text-sm font-medium">{e.label}</div>
                  <div className="text-xs text-ink-3">{fmtDateTime(e.at)} · {e.who}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      {reminding && <ReminderModal app={a} onClose={() => setReminding(false)} onSent={logReminder} />}
    </div>
  )
}

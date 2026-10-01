import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { daysSince, fmtDate, fmtDateTime } from '../lib/applications'
import { answerRows } from '../lib/labels'
import { SALES_STAGES, journey, nudgeText, salesRows } from '../lib/sales'
import { whatsappLink } from '../lib/reminder'

const STATUS = { draft: ['Not finished', 'bg-warn-tint text-warn'], cart: ['In cart · unpaid', 'bg-info-tint text-info'], paid: ['Paid', 'bg-ok-tint text-ok'] }

// One user's track through the journey: steps done / stuck, what they submitted, what's still incomplete.
export default function SalesPerson({ people, apps }) {
  const { mobile } = useParams()
  const [showAnswers, setShowAnswers] = useState(false)
  const row = salesRows(people.filter(p => p.mobile === mobile), apps)[0]
  if (!row) return <p className="text-sm text-ink-3">User not found. <Link to="/sales" className="text-side-active font-semibold">Back</Link></p>
  const stage = SALES_STAGES.find(s => s.key === row.stage)
  const { steps, submitted, pending, apps: mine } = journey(row, apps)
  const stuck = steps.find(s => s.state === 'stuck')
  const lastDone = [...steps].reverse().find(s => s.at)
  const answers = answerRows(row.answers)

  return (
    <div className="max-w-5xl">
      <Link to={`/sales/${row.stage}`} className="text-sm font-semibold text-side-active hover:underline">← {stage.label}</Link>

      <div className="mt-3 bg-card border border-line rounded-card shadow-card p-5 flex flex-wrap items-start gap-4">
        <div className="size-12 rounded-full bg-brand text-white grid place-items-center text-lg font-bold">{row.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div className="mr-auto">
          <h1 className="text-xl font-bold">{row.name}{!row.sample && <span className="ml-2 align-middle rounded bg-ok-tint text-ok text-[10px] px-1.5 py-0.5 font-bold">LIVE</span>}</h1>
          <p className="text-sm text-ink-2 mt-0.5">
            <a href={`tel:+91${row.mobile}`} className="text-side-active font-semibold hover:underline">📞 +91 {row.mobile}</a>
            {' · '}{row.state}{row.gender && ` · ${row.gender}`} · Joined {fmtDate(row.signupAt)}
          </p>
          <p className="mt-2 text-sm"><span className="rounded-md bg-page border border-line px-2 py-1 font-semibold">{stage.icon} {stage.label}</span>
            {stuck && <span className="ml-2 text-ink-2">Stuck at <b>{stuck.label.toLowerCase()}</b> for {daysSince(lastDone.at)} days</span>}</p>
        </div>
        <a href={whatsappLink(row.mobile, nudgeText(row, 'hi'))} target="_blank" rel="noreferrer"
          className="rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white px-4 py-2 text-sm font-semibold">💬 WhatsApp nudge</a>
      </div>

      <div className="mt-4 grid lg:grid-cols-[1fr_1.2fr] gap-4">
        <section className="bg-card border border-line rounded-card shadow-card p-5">
          <h2 className="font-bold">Journey</h2>
          <ol className="mt-3">
            {steps.map((s, i) => (
              <li key={s.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`size-7 rounded-full grid place-items-center text-xs font-bold border-2 ${
                    s.state === 'done' ? 'bg-ok border-ok text-white' : s.state === 'stuck' ? 'bg-warn-tint border-warn text-warn' : 'bg-card border-line text-ink-3'}`}>
                    {s.state === 'done' ? '✓' : i + 1}</span>
                  {i < steps.length - 1 && <span className={`w-0.5 flex-1 min-h-5 ${s.state === 'done' ? 'bg-ok' : 'bg-line'}`} />}
                </div>
                <div className="pb-4 -mt-0.5">
                  <p className={`text-sm font-semibold ${s.state === 'todo' ? 'text-ink-3' : ''}`}>
                    {s.label}{s.state === 'stuck' && <span className="ml-2 rounded bg-warn-tint text-warn text-[10px] px-1.5 py-0.5 font-bold">STUCK HERE</span>}</p>
                  {s.at && <p className="text-xs text-ink-3">{fmtDateTime(s.at)}</p>}
                  {s.detail && <p className="text-xs text-ink-2 mt-0.5">{s.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-4">
          <section className="bg-card border border-line rounded-card shadow-card p-5">
            <h2 className="font-bold">Still incomplete <span className="text-ink-3 font-semibold">({pending.length})</span></h2>
            {pending.length ? (
              <ul className="mt-2 space-y-1.5 text-sm">{pending.map(t => <li key={t} className="flex gap-2"><span className="text-warn">✗</span><span>{t}</span></li>)}</ul>
            ) : <p className="mt-2 text-sm text-ok font-semibold">Nothing pending — all done.</p>}
          </section>

          <section className="bg-card border border-line rounded-card shadow-card p-5">
            <h2 className="font-bold">Submitted so far <span className="text-ink-3 font-semibold">({submitted.length})</span></h2>
            {submitted.length ? (
              <ul className="mt-2 space-y-1.5 text-sm">{submitted.map(t => <li key={t} className="flex gap-2"><span className="text-ok">✓</span><span>{t}</span></li>)}</ul>
            ) : <p className="mt-2 text-sm text-ink-3">Nothing yet.</p>}
            {answers.length > 0 && (
              <>
                <button onClick={() => setShowAnswers(v => !v)} className="mt-3 text-xs font-semibold text-side-active hover:underline">
                  {showAnswers ? 'Hide' : 'Show'} eligibility answers</button>
                {showAnswers && (
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {answers.map(([k, v]) => <div key={k} className="contents"><dt className="text-ink-3">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                  </dl>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {mine.length > 0 && (
        <section className="mt-4 bg-card border border-line rounded-card shadow-card p-5">
          <h2 className="font-bold">Applications <span className="text-ink-3 font-semibold">({mine.length})</span></h2>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            {mine.map(a => {
              const [label, cls] = STATUS[a.status] || [a.status, 'bg-page text-ink-3']
              const docs = Object.entries(a.docs)
              const form = Object.entries(a.formData || {})
              return (
                <div key={a.id} className="border border-line rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <b className="text-sm">{a.scheme}</b>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${cls}`}>{label}</span>
                  </div>
                  <p className="text-xs text-ink-3 mt-0.5">Started {fmtDate(a.createdAt)}{a.paidAt && ` · paid ${fmtDate(a.paidAt)} · ₹${a.amount}`}</p>
                  {form.length > 0 && <p className="mt-2 text-xs text-ink-2">Form: {form.length} details filled</p>}
                  <ul className="mt-2 space-y-1 text-xs">
                    {docs.map(([d, v]) => (
                      <li key={d} className="flex gap-2">
                        <span className={v ? 'text-ok' : 'text-warn'}>{v ? '✓' : '✗'}</span>
                        <span className={v ? '' : 'font-semibold'}>{d}</span>
                        <span className="text-ink-3">{v === 'on-file' ? 'on file' : v ? 'uploaded' : 'missing'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

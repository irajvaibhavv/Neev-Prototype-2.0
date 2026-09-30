import { useEffect, useState } from 'react'
import { reminderText, smsLink, whatsappLink } from '../lib/reminder'
import { fmtDateTime } from '../lib/applications'

// Missing-document reminder: preview the message (English / Hindi), send via WhatsApp or SMS deep link, log it.
export default function ReminderModal({ app, onClose, onSent }) {
  const [lang, setLang] = useState('hi')
  const text = reminderText(app, lang)
  const last = app.reminders[app.reminders.length - 1]

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const send = channel => { onSent(app.id, channel, lang); onClose() }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 grid place-items-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="rem-title" onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-card rounded-card shadow-card-hover border border-line">
        <div className="p-5 border-b border-line">
          <h2 id="rem-title" className="font-bold text-lg">Remind about missing documents</h2>
          <p className="text-sm text-ink-2 mt-0.5">{app.applicant} · +91 {app.mobile} · {app.scheme}</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">Missing ({app.docsMissing.length})</div>
            <div className="flex flex-wrap gap-1.5">
              {app.docsMissing.map(d => <span key={d} className="rounded-md bg-warn-tint text-warn text-xs font-semibold px-2 py-1">{d}</span>)}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Message</span>
              <div className="flex rounded-lg bg-page border border-line p-0.5 gap-0.5 text-xs font-semibold" role="group" aria-label="Language">
                {[['hi', 'हिंदी'], ['en', 'English']].map(([k, l]) => (
                  <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k}
                    className={`rounded-md px-3 py-1 ${lang === k ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>{l}</button>
                ))}
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm bg-input border border-line rounded-lg p-3 leading-relaxed">{text}</pre>
          </div>
          <p className="text-xs text-ink-3">
            {app.reminders.length ? <>Reminded {app.reminders.length} time{app.reminders.length > 1 ? 's' : ''} · last {fmtDateTime(last.at)} via {last.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</> : 'Not reminded yet.'}
          </p>
        </div>
        <div className="p-5 border-t border-line flex flex-wrap gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-2 hover:border-brand">Cancel</button>
          <a href={smsLink(app.mobile, text)} onClick={() => send('sms')}
            className="rounded-lg border border-brand text-side-active px-4 py-2 text-sm font-semibold hover:bg-brand/5">Send SMS</a>
          <a href={whatsappLink(app.mobile, text)} target="_blank" rel="noreferrer" onClick={() => send('whatsapp')}
            className="rounded-lg bg-[#25D366] hover:bg-[#1ebe5b] text-white px-4 py-2 text-sm font-semibold">Send on WhatsApp</a>
        </div>
      </div>
    </div>
  )
}

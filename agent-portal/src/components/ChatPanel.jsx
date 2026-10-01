import { useEffect, useRef, useState } from 'react'
import { MAX_FILE, fmtSize, useChat } from '../lib/chat'
import { getSession } from '../lib/auth'

const time = iso => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

// Personal chat with the applicant: text and documents (image / PDF ≤ 1 MB).
export default function ChatPanel({ app }) {
  const { msgs, send } = useChat(app.id)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const endRef = useRef(null)
  const me = getSession()
  const first = app.applicant.split(' ')[0]
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [msgs.length])

  const post = msg => {
    if (!send({ from: 'agent', name: me?.name || 'Agent', ...msg })) return setError('Couldn’t send — browser storage is full. Try a smaller file.')
    setError('')
  }
  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    post({ text: text.trim() })
    setText('')
  }
  function attach(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!/^image\/|application\/pdf/.test(f.type)) return setError('Send an image or a PDF.')
    if (f.size > MAX_FILE) return setError(`That file is ${fmtSize(f.size)} — the limit is 1 MB in this prototype.`)
    const r = new FileReader()
    r.onload = () => post({ text: text.trim(), file: { name: f.name, type: f.type, size: f.size, url: r.result } })
    r.readAsDataURL(f)
    setText('')
  }

  return (
    <section className="max-w-3xl bg-card border border-line rounded-card shadow-card flex flex-col h-[70vh] min-h-[420px]">
      <header className="px-5 py-3.5 border-b border-line flex items-center gap-3">
        <div className="size-9 rounded-full bg-brand text-white grid place-items-center font-bold text-sm shrink-0">
          {app.applicant.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="font-bold truncate">{app.applicant}</div>
          <div className="text-xs text-ink-3">Chat in the Neev app · {app.scheme}</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-page/60" aria-live="polite">
        {msgs.length === 0 && (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="text-3xl" aria-hidden>💬</div>
              <p className="mt-2 font-semibold">No messages yet</p>
              <p className="text-sm text-ink-3">Send {first} an update or a document — it appears in their Neev app.</p>
            </div>
          </div>
        )}
        {msgs.map(m => {
          const mine = m.from === 'agent'
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-card ${mine ? 'bg-brand text-white rounded-br-md' : 'bg-card border border-line rounded-bl-md'}`}>
                {m.file && (
                  <a href={m.file.url} download={m.file.name} target="_blank" rel="noreferrer"
                    className={`mb-1.5 block rounded-lg overflow-hidden ${mine ? 'bg-white/15' : 'bg-page border border-line'}`}>
                    {m.file.type.startsWith('image/')
                      ? <img src={m.file.url} alt={m.file.name} className="max-h-56 w-full object-cover" />
                      : <span className="flex items-center gap-2 px-3 py-2.5"><span aria-hidden>📄</span><span className="truncate font-semibold">{m.file.name}</span></span>}
                    <span className={`block px-3 py-1 text-[11px] ${mine ? 'text-white/80' : 'text-ink-3'}`}>{m.file.name} · {fmtSize(m.file.size)} · ⬇ Download</span>
                  </a>
                )}
                {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                <div className={`mt-1 text-[11px] ${mine ? 'text-white/75 text-right' : 'text-ink-3'}`}>{mine ? `${m.name} · ` : ''}{time(m.at)}</div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line p-3 space-y-2">
        {error && <p role="alert" className="text-xs text-bad font-semibold">{error}</p>}
        <form onSubmit={submit} className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={attach} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach a document" title="Attach a document (image or PDF, max 1 MB)"
            className="rounded-lg border border-line px-3 py-2.5 text-ink-2 hover:border-brand hover:text-side-active">📎</button>
          <textarea rows={1} value={text} onChange={e => setText(e.target.value)} aria-label="Message"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) submit(e) }}
            placeholder={`Message ${first}…`} className="flex-1 resize-none rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand max-h-32" />
          <button disabled={!text.trim()} className="rounded-lg bg-brand hover:bg-side-active disabled:opacity-50 text-white px-4 py-2.5 text-sm font-semibold">Send</button>
        </form>
      </div>
    </section>
  )
}

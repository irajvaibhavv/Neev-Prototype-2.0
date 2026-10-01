import { useState } from 'react'
import { MAX_FILE, fmtSize, postChat } from '../lib/chat'
import { getSession } from '../lib/auth'
import { btnGhost, btnPrimary } from '../lib/ui'

// What the agent got back from the government portal after filing. The fields come from the scheme
// (super admin → Schemes → Filing details): text / number / date / document (file upload).
// Saved on the application as neev_agent_stages[id].filing = { values: { [field name]: string | file[] } }.
const field = 'mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand'
const Label = ({ children }) => <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>
const fmtDay = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// Details saved before filing fields were configurable: map the old fixed keys onto the scheme's fields.
function initial(app, fields) {
  const old = app.filing || {}
  if (old.values) return old.values
  const v = {}
  const byType = t => fields.find(f => f.type === t)?.name
  if (old.portalId && fields[0]) v[fields[0].name] = old.portalId
  if (old.filedOn && byType('date')) v[byType('date')] = old.filedOn
  if (old.files?.length && byType('document')) v[byType('document')] = old.files
  return v
}

export default function FilingPanel({ app, fields, onSave, openChat }) {
  const saved = initial(app, fields)
  const [v, setV] = useState(saved)
  const [msg, setMsg] = useState(null) // { ok, text }
  const set = (name, value) => { setV(x => ({ ...x, [name]: value })); setMsg(null) }
  const dirty = JSON.stringify(v) !== JSON.stringify(saved)
  const filled = f => (f.type === 'document' ? (v[f.name] || []).length > 0 : String(v[f.name] ?? '').trim() !== '')

  function addFiles(name, e) {
    const list = [...(e.target.files || [])]
    e.target.value = ''
    for (const file of list) {
      if (!/^image\/|application\/pdf/.test(file.type)) { setMsg({ ok: false, text: `${file.name}: upload an image or a PDF.` }); continue }
      if (file.size > MAX_FILE) { setMsg({ ok: false, text: `${file.name} is ${fmtSize(file.size)} — the limit is 1 MB in this prototype.` }); continue }
      const r = new FileReader()
      r.onload = () => setV(x => ({ ...x, [name]: [...(x[name] || []), { name: file.name, type: file.type, size: file.size, url: r.result }] }))
      r.readAsDataURL(file)
    }
  }
  function save(e) {
    e.preventDefault()
    const missing = fields.filter(f => f.required && !filled(f))
    if (missing.length) return setMsg({ ok: false, text: `Fill in: ${missing.map(f => f.name).join(', ')}` })
    const values = Object.fromEntries(fields.filter(filled).map(f => [f.name, f.type === 'document' ? v[f.name] : String(v[f.name]).trim()]))
    onSave({ values }, app.filing ? 'Filing details updated' : 'Filing details added')
    setMsg({ ok: true, text: 'Saved.' })
  }
  function share() {
    const text = fields.filter(f => f.type !== 'document' && saved[f.name])
      .map(f => `${f.name}: ${f.type === 'date' ? fmtDay(saved[f.name]) : saved[f.name]}`)
    const files = fields.filter(f => f.type === 'document').flatMap(f => saved[f.name] || [])
    const name = getSession()?.name || 'Agent'
    let ok = postChat(app.id, { from: 'agent', name, text: [`Your ${app.scheme} application has been filed.`, ...text].join('\n') })
    for (const file of files) ok = ok && postChat(app.id, { from: 'agent', name, text: '', file })
    if (!ok) return setMsg({ ok: false, text: 'Couldn’t share — browser storage is full.' })
    openChat()
  }

  if (!fields.length) return (
    <div className="max-w-3xl bg-card border border-line rounded-card shadow-card p-10 text-center">
      <p className="font-semibold">No filing details set for this scheme</p>
      <p className="mt-1 text-sm text-ink-2">A super admin can add them under Schemes → {app.scheme} → Filing details.</p>
    </div>
  )

  return (
    <form onSubmit={save} className="max-w-3xl bg-card border border-line rounded-card shadow-card">
      <div className="px-5 py-3.5 border-b border-line">
        <h2 className="font-bold">Filing details</h2>
        <p className="text-sm text-ink-2 mt-0.5">What you got from the government portal after filing. The applicant can see these once you share them.</p>
      </div>
      <div className="p-5 grid sm:grid-cols-2 gap-4">
        {fields.map(f => f.type === 'document' ? (
          <div key={f.name} className="sm:col-span-2">
            <Label>{f.name}{f.required && ' *'}</Label>
            {(v[f.name] || []).length > 0 && (
              <ul className="mt-2 space-y-2">
                {v[f.name].map((file, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
                    <span aria-hidden>{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                    <span className="flex-1 min-w-0 truncate font-medium">{file.name}</span>
                    <span className="text-xs text-ink-3">{fmtSize(file.size)}</span>
                    <a href={file.url} target="_blank" rel="noreferrer" className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active">👁 View</a>
                    <a href={file.url} download={file.name} className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active">⬇ Download</a>
                    <button type="button" onClick={() => set(f.name, v[f.name].filter((_, j) => j !== i))} aria-label={`Remove ${file.name}`} className="text-xs font-semibold text-bad hover:underline">Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <label className="mt-2 inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-line-strong px-3.5 py-2.5 text-sm font-semibold text-ink-2 hover:border-brand hover:text-side-active">
              📎 Upload {f.name.toLowerCase()}
              <input type="file" accept="image/*,application/pdf" multiple onChange={e => addFiles(f.name, e)} className="hidden" />
            </label>
            <span className="ml-2 text-xs text-ink-3">Image or PDF, max 1 MB each</span>
          </div>
        ) : (
          <label key={f.name} className="block"><Label>{f.name}{f.required && ' *'}</Label>
            <input type={f.type === 'date' ? 'date' : 'text'} inputMode={f.type === 'number' ? 'decimal' : undefined} value={v[f.name] || ''}
              onChange={e => set(f.name, f.type === 'number' ? e.target.value.replace(/[^\d.]/g, '') : e.target.value)}
              className={`${field} ${f.type === 'text' ? 'font-mono' : ''}`} />
          </label>
        ))}
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={`sm:col-span-2 text-sm font-semibold ${msg.ok ? 'text-ok' : 'text-bad'}`}>{msg.text}</p>}
      </div>
      <div className="px-5 py-4 border-t border-line flex flex-wrap items-center gap-2">
        <button type="button" onClick={share} disabled={!app.filing || dirty} title={dirty || !app.filing ? 'Save first' : ''}
          className={`${btnGhost} disabled:opacity-40`}>💬 Share with applicant</button>
        <div className="ml-auto flex gap-2">
          {dirty && <button type="button" onClick={() => { setV(saved); setMsg(null) }} className={btnGhost}>Discard</button>}
          <button disabled={!dirty} className={btnPrimary}>Save filing details</button>
        </div>
      </div>
    </form>
  )
}

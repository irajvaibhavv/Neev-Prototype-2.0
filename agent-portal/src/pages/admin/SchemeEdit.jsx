import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BLANK_ELIG, STATES, deleteScheme, getScheme, resetScheme, saveScheme, validateScheme } from '../../lib/schemes'
import Modal from '../../components/Modal'
import Toggle from '../../components/Toggle'
import EligibilityEditor from '../../components/EligibilityEditor'
import { getDocuments } from '../../lib/documents'
import { FIELD_TYPES, getFields } from '../../lib/fields'
import { btnDanger, btnGhost, btnPrimary } from '../../lib/ui'

const field = 'mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand'
const Label = ({ children }) => <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>
const Hint = ({ children }) => <span className="mt-1.5 block text-xs text-ink-3">{children}</span>
// One section of the single form box; sections are separated by a line.
const Card = ({ title, sub, children }) => (
  <section className="p-5 space-y-4">
    <div>
      <h2 className="font-bold">{title}</h2>
      {sub && <p className="text-sm text-ink-2 mt-0.5">{sub}</p>}
    </div>
    {children}
  </section>
)
const NEW_STATE = '__new'
const BLANK = { name: '', icon: '', scope: '', desc: '', url: '', fee: 49, docs: [], fields: [], elig: BLANK_ELIG, enabled: true }

// Full-page add / edit for one scheme: /admin/schemes/new and /admin/schemes/:id
export default function SchemeEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const original = id ? getScheme(id) : BLANK
  const [s, setS] = useState(() => ({ ...original }))
  const [allDocs] = useState(getDocuments)
  const [allFields] = useState(getFields)
  const [newState, setNewState] = useState(original?.scope && original.scope !== 'Central' && !STATES.includes(original.scope) ? original.scope : '')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [tab, setTab] = useState('general')
  if (!original) return <Navigate to="/admin/schemes" replace />

  const scopeSel = !s.scope ? '' : s.scope === 'Central' || STATES.includes(s.scope) ? s.scope : NEW_STATE
  const set = patch => { setS(x => ({ ...x, ...patch })); setError('') }
  const moveField = (i, by) => { const f = [...s.fields]; [f[i], f[i + by]] = [f[i + by], f[i]]; set({ fields: f }) }
  const moveDoc = (i, by) => { const d = [...s.docs]; [d[i], d[i + by]] = [d[i + by], d[i]]; set({ docs: d }) }
  const back = () => nav('/admin/schemes')
  function submit(e) {
    e.preventDefault()
    const out = { ...s, scope: scopeSel === NEW_STATE ? newState.trim() : s.scope }
    const err = validateScheme(out)
    if (err) { setTab(/document/i.test(err) ? 'docs' : /age|rule/i.test(err) ? 'elig' : 'general'); setError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    saveScheme(out)
    back()
  }

  return (
    <form onSubmit={submit} className="max-w-3xl">
      <Link to="/admin/schemes" className="text-sm text-side-active font-semibold hover:underline">← All schemes</Link>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">{id ? `Edit ${original.name}` : 'Add a scheme'}</h1>
          <p className="mt-1 text-sm text-ink-2">
            {original.source === 'app' ? 'This scheme comes from the employee app. Your changes apply in the portal.' : 'Agents can add applications for this scheme once it is enabled.'}
          </p>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-bad-tint border border-bad/30 px-4 py-3 text-sm text-bad font-semibold">{error}</p>}

      <div className="mt-5 inline-flex flex-wrap rounded-lg bg-page border border-line p-0.5 gap-0.5" role="tablist" aria-label="Scheme sections">
        {[['general', 'General'], ['docs', `Documents (${s.docs.length})`], ['fields', `Information (${s.fields.length})`], ['elig', `Eligibility (${s.elig.rules.length + s.elig.checks.length + (s.elig.minAge || s.elig.maxAge ? 1 : 0) + (s.elig.gender !== 'any' ? 1 : 0)})`]].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === k ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>{l}</button>
        ))}
      </div>

      <div className="mt-4 bg-card border border-line rounded-card shadow-card divide-y divide-line">
        {tab === 'general' && <>
        <Card title="Status">
          <div className="flex items-center gap-4">
            <Toggle on={s.enabled} onChange={on => set({ enabled: on })} label="Scheme enabled" />
            <div>
              <div className="font-semibold">{s.enabled ? 'Enabled' : 'Disabled'}</div>
              <p className="text-sm text-ink-2">{s.enabled ? 'Agents can pick this scheme when adding an application.' : 'Hidden from agents. Existing applications stay as they are.'}</p>
            </div>
          </div>
        </Card>

        <Card title="Scheme details">
          <div className="flex gap-3">
            <label className="block w-20"><Label>Icon</Label>
              <input value={s.icon} maxLength={4} onChange={e => set({ icon: e.target.value })} className={`${field} text-center text-lg`} placeholder="📄" />
            </label>
            <label className="block flex-1"><Label>Scheme name *</Label>
              <input autoFocus={!id} value={s.name} onChange={e => set({ name: e.target.value })} className={field} placeholder="e.g. PM Vishwakarma" />
            </label>
          </div>
          <label className="block"><Label>Short description</Label>
            <textarea rows={2} value={s.desc} onChange={e => set({ desc: e.target.value })} className={field} placeholder="e.g. Toolkit grant and low-interest loans for traditional artisans." />
            <Hint>One line on what the person gets.</Hint>
          </label>
          <label className="block"><Label>Available in *</Label>
            <select value={scopeSel} onChange={e => set({ scope: e.target.value })} className={field}>
              <option value="">Choose…</option>
              <option value="Central">Central — all states</option>
              <optgroup label="State scheme">{STATES.map(st => <option key={st} value={st}>{st}</option>)}</optgroup>
              <option value={NEW_STATE}>Another state…</option>
            </select>
          </label>
          {scopeSel === NEW_STATE && (
            <label className="block"><Label>State name *</Label>
              <input value={newState} onChange={e => { setNewState(e.target.value); setError('') }} className={field} placeholder="e.g. Kerala" />
            </label>
          )}
        </Card>

        <Card title="Price" sub="Fee the person pays Neev to apply for this scheme through an agent.">
          <label className="block max-w-48"><Label>Price (₹) *</Label>
            <div className="mt-1.5 flex items-center rounded-lg bg-input border border-line focus-within:border-brand">
              <span className="pl-3 text-sm text-ink-3">₹</span>
              <input inputMode="numeric" maxLength={5} value={s.fee} onChange={e => set({ fee: e.target.value.replace(/\D/g, '') })}
                className="flex-1 min-w-0 bg-transparent px-2 py-2.5 text-sm outline-none" placeholder="49" />
            </div>
            <Hint>Enter 0 if it's free.</Hint>
          </label>
        </Card>

        <Card title="Apply yourself" sub="Official website where a person can apply on their own.">
          <label className="block"><Label>Apply link</Label>
            <div className="flex gap-2">
              <input type="url" inputMode="url" value={s.url} onChange={e => set({ url: e.target.value })} className={field} placeholder="https://pmvishwakarma.gov.in" />
              {/^https?:\/\//i.test(s.url) && (
                <a href={s.url} target="_blank" rel="noreferrer" className={`${btnGhost} mt-1.5 whitespace-nowrap self-stretch grid place-items-center`}>Open ↗</a>
              )}
            </div>
            <Hint>Leave empty if the scheme has no online application.</Hint>
          </label>
        </Card>

        </>}

        {tab === 'docs' && <Card title={`Documents needed (${s.docs.length})`} sub="Pick from the documents in Documents.">
          {s.docs.length === 0 && <p className="text-sm text-ink-3">No documents yet — add one below.</p>}
          <ol className="space-y-2">
            {s.docs.map((d, i) => {
              const doc = allDocs.find(x => x.name === d)
              return (
                <li key={d} className="flex items-center gap-2">
                  <span className="w-6 text-right text-sm text-ink-3">{i + 1}.</span>
                  <div className="flex-1 min-w-0 rounded-lg bg-input border border-line px-3 py-2">
                    <div className="text-sm font-semibold truncate">{d}</div>
                    {!doc && <div className="text-xs text-ink-3">Not in Documents</div>}
                  </div>
                  <button type="button" onClick={() => moveDoc(i, -1)} disabled={i === 0} aria-label={`Move ${d} up`}
                    className="rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-ink disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveDoc(i, 1)} disabled={i === s.docs.length - 1} aria-label={`Move ${d} down`}
                    className="rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-ink disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => set({ docs: s.docs.filter((_, j) => j !== i) })}
                    aria-label={`Remove ${d}`} className="rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-bad hover:border-bad">✕</button>
                </li>
              )
            })}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <select value="" onChange={e => e.target.value && set({ docs: [...s.docs, e.target.value] })} aria-label="Add a document"
              className="flex-1 min-w-56 rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand">
              <option value="">+ Add a document…</option>
              {allDocs.filter(d => !s.docs.includes(d.name)).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <Link to="/admin/documents/new" target="_blank" className="text-sm text-side-active font-semibold hover:underline">Missing one? Create a document ↗</Link>
          </div>
        </Card>}

        {tab === 'fields' && <Card title={`Information fields (${s.fields.length})`} sub="Details asked on this scheme's application form. Pick from the fields in Fields.">
          {s.fields.length === 0 && <p className="text-sm text-ink-3">No fields yet — add one below.</p>}
          <ol className="space-y-2">
            {s.fields.map((name, i) => {
              const fd = allFields.find(x => x.name === name)
              return (
                <li key={name} className="flex items-center gap-2">
                  <span className="w-6 text-right text-sm text-ink-3">{i + 1}.</span>
                  <div className="flex-1 min-w-0 rounded-lg bg-input border border-line px-3 py-2">
                    <div className="text-sm font-semibold truncate">{name}</div>
                    <div className="text-xs text-ink-3">{fd ? `${FIELD_TYPES[fd.type]}${fd.required ? '' : ' · optional'}` : 'Not in Fields'}</div>
                  </div>
                  <button type="button" onClick={() => moveField(i, -1)} disabled={i === 0} aria-label={`Move ${name} up`}
                    className="rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-ink disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveField(i, 1)} disabled={i === s.fields.length - 1} aria-label={`Move ${name} down`}
                    className="rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-ink disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => set({ fields: s.fields.filter((_, j) => j !== i) })}
                    aria-label={`Remove ${name}`} className="rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-bad hover:border-bad">✕</button>
                </li>
              )
            })}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <select value="" onChange={e => e.target.value && set({ fields: [...s.fields, e.target.value] })} aria-label="Add a field"
              className="flex-1 min-w-56 rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand">
              <option value="">+ Add a field…</option>
              {allFields.filter(f => !s.fields.includes(f.name)).map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
            <Link to="/admin/fields/new" target="_blank" className="text-sm text-side-active font-semibold hover:underline">Missing one? Create a field ↗</Link>
          </div>
        </Card>}

        {tab === 'elig' && <EligibilityEditor value={s.elig} onChange={elig => set({ elig })} />}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
        {id && <button type="button" onClick={() => setDeleting(true)} className="text-sm text-bad font-semibold hover:underline">Delete scheme</button>}
        {original.edited && <button type="button" onClick={() => { resetScheme(id); back() }} className="ml-4 text-sm text-ink-2 font-semibold hover:underline">Undo all edits</button>}
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={back} className={btnGhost}>Cancel</button>
          <button className={btnPrimary}>{id ? 'Save changes' : 'Add scheme'}</button>
        </div>
      </div>

      {deleting && (
        <Modal title={`Delete ${original.name}?`} sub={original.scope} onClose={() => setDeleting(false)} labelId="del-scheme-title"
          footer={<><button type="button" onClick={() => setDeleting(false)} className={btnGhost}>Cancel</button>
            <button type="button" onClick={() => { deleteScheme(id); back() }} className={btnDanger}>Delete scheme</button></>}>
          <p className="text-sm text-ink-2">Agents won't be able to add new applications for it. Existing applications stay as they are. To hide it for a while instead, <b>disable</b> it.</p>
        </Modal>
      )}
    </form>
  )
}

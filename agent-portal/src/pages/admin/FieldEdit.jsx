import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BLANK_FIELD, FIELD_TYPES, deleteField, fieldUsage, getField, saveField, validateField } from '../../lib/fields'
import Modal from '../../components/Modal'
import Toggle from '../../components/Toggle'
import { btnDanger, btnGhost, btnPrimary } from '../../lib/ui'

const field = 'mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand'
const Label = ({ children }) => <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>
const Section = ({ title, children }) => (
  <section className="p-5 space-y-4">{title && <h2 className="font-bold">{title}</h2>}{children}</section>
)

// Full-page add / edit for one information field: /admin/fields/new and /admin/fields/:id
export default function FieldEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const original = id ? getField(id) : BLANK_FIELD
  const [f, setF] = useState(() => ({ ...original, options: original?.options.length ? original.options : ['', ''] }))
  const [usedBy] = useState(() => (original ? fieldUsage()[original.name] || [] : []))
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  if (!original) return <Navigate to="/admin/fields" replace />

  const set = patch => { setF(x => ({ ...x, ...patch })); setError('') }
  const setOpt = (i, v) => set({ options: f.options.map((o, j) => (j === i ? v : o)) })
  const back = () => nav('/admin/fields')
  function submit(e) {
    e.preventDefault()
    const err = validateField(f)
    if (err) { setError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    saveField(f)
    back()
  }

  return (
    <form onSubmit={submit} className="max-w-3xl">
      <Link to="/admin/fields" className="text-sm text-side-active font-semibold hover:underline">← All fields</Link>
      <h1 className="mt-2 text-2xl font-bold">{id ? `Edit ${original.name}` : 'Add a field'}</h1>
      <p className="mt-1 text-sm text-ink-2">Schemes can ask for any field in this list on their application form.</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-bad-tint border border-bad/30 px-4 py-3 text-sm text-bad font-semibold">{error}</p>}

      <div className="mt-5 bg-card border border-line rounded-card shadow-card divide-y divide-line">
        <Section>
          <label className="block"><Label>Field name *</Label>
            <input autoFocus={!id} value={f.name} onChange={e => set({ name: e.target.value })} className={field} placeholder="e.g. Father's name" />
            {id && usedBy.length > 0 && f.name.trim() !== original.name && (
              <span className="mt-1.5 block text-xs text-warn font-semibold">Renaming updates it in all {usedBy.length} schemes that use it.</span>
            )}
          </label>
          <label className="block"><Label>Field description</Label>
            <textarea rows={2} value={f.desc} onChange={e => set({ desc: e.target.value })} className={field} placeholder="e.g. As written on the Aadhaar card." />
          </label>
          <label className="block"><Label>Type *</Label>
            <select value={f.type} onChange={e => set({ type: e.target.value })} className={`${field} sm:w-64`}>
              {Object.entries(FIELD_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          {f.type === 'dropdown' && (
            <fieldset>
              <legend><Label>Options *</Label></legend>
              <ol className="mt-1.5 space-y-2">
                {f.options.map((o, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-6 text-right text-sm text-ink-3">{i + 1}.</span>
                    <input value={o} onChange={e => setOpt(i, e.target.value)} aria-label={`Option ${i + 1}`}
                      className="flex-1 rounded-lg bg-input border border-line px-3 py-2 text-sm outline-none focus:border-brand" placeholder={`Option ${i + 1}`} />
                    <button type="button" onClick={() => set({ options: f.options.filter((_, j) => j !== i) })} disabled={f.options.length <= 2}
                      aria-label={`Remove option ${i + 1}`} className="rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-bad hover:border-bad disabled:opacity-30">✕</button>
                  </li>
                ))}
              </ol>
              <button type="button" onClick={() => set({ options: [...f.options, ''] })} className="mt-2 text-sm text-side-active font-semibold hover:underline">+ Add option</button>
            </fieldset>
          )}
          <div className="flex items-center gap-4">
            <Toggle on={f.required} onChange={on => set({ required: on })} label="Required" />
            <div>
              <div className="font-semibold">{f.required ? 'Required' : 'Optional'}</div>
              <p className="text-sm text-ink-2">{f.required ? 'The person must fill this in.' : 'The person can leave this empty.'}</p>
            </div>
          </div>
        </Section>

        {id && (
          <Section title={`Used in ${usedBy.length} scheme${usedBy.length === 1 ? '' : 's'}`}>
            {usedBy.length ? (
              <ul className="flex flex-wrap gap-2">
                {usedBy.map(s => (
                  <li key={s.id}><Link to={`/admin/schemes/${encodeURIComponent(s.id)}`} className="inline-block rounded-lg border border-line px-3 py-1.5 text-sm hover:border-brand">{s.icon} {s.name}</Link></li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-3">No scheme asks for this field yet.</p>}
          </Section>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
        {id && (usedBy.length
          ? <span className="text-xs text-ink-3">To delete it, first remove it from the schemes above.</span>
          : <button type="button" onClick={() => setDeleting(true)} className="text-sm text-bad font-semibold hover:underline">Delete field</button>)}
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={back} className={btnGhost}>Cancel</button>
          <button className={btnPrimary}>{id ? 'Save changes' : 'Add field'}</button>
        </div>
      </div>

      {deleting && (
        <Modal title={`Delete ${original.name}?`} onClose={() => setDeleting(false)} labelId="del-field-title"
          footer={<><button type="button" onClick={() => setDeleting(false)} className={btnGhost}>Cancel</button>
            <button type="button" onClick={() => { deleteField(id); back() }} className={btnDanger}>Delete field</button></>}>
          <p className="text-sm text-ink-2">It will no longer be available when setting up schemes.</p>
        </Modal>
      )}
    </form>
  )
}

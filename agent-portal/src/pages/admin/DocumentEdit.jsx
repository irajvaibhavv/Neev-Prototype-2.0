import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BLANK_DOC, deleteDocument, getDocument, saveDocument, usage, validateDocument } from '../../lib/documents'
import Modal from '../../components/Modal'
import { btnDanger, btnGhost, btnPrimary } from '../../lib/ui'

const field = 'mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand'
const Label = ({ children }) => <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>
const Card = ({ title, sub, children }) => (
  <section className="bg-card border border-line rounded-card shadow-card">
    <div className="px-5 py-4 border-b border-line">
      <h2 className="font-bold">{title}</h2>
      {sub && <p className="text-sm text-ink-2 mt-0.5">{sub}</p>}
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </section>
)
// Full-page add / edit for one document type: /admin/documents/new and /admin/documents/:id
export default function DocumentEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const original = id ? getDocument(id) : BLANK_DOC
  const [d, setD] = useState(() => ({ ...original }))
  const [usedBy] = useState(() => (original ? usage()[original.name] || [] : []))
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  if (!original) return <Navigate to="/admin/documents" replace />

  const set = patch => { setD(x => ({ ...x, ...patch })); setError('') }
  const back = () => nav('/admin/documents')
  function submit(e) {
    e.preventDefault()
    const err = validateDocument(d)
    if (err) { setError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    saveDocument(d)
    back()
  }

  return (
    <form onSubmit={submit} className="max-w-3xl">
      <Link to="/admin/documents" className="text-sm text-side-active font-semibold hover:underline">← All documents</Link>
      <h1 className="mt-2 text-2xl font-bold">{id ? `Edit ${original.name}` : 'Add a document'}</h1>
      <p className="mt-1 text-sm text-ink-2">Schemes can ask for any document in this list.</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-bad-tint border border-bad/30 px-4 py-3 text-sm text-bad font-semibold">{error}</p>}

      <div className="mt-5 space-y-5">
        <Card title="Document details">
          <label className="block"><Label>Document name *</Label>
            <input autoFocus={!id} value={d.name} onChange={e => set({ name: e.target.value })} className={field} placeholder="e.g. Aadhaar card" />
            {id && usedBy.length > 0 && d.name.trim() !== original.name && (
              <span className="mt-1.5 block text-xs text-warn font-semibold">Renaming updates it in all {usedBy.length} schemes that use it.</span>
            )}
          </label>
          <label className="block"><Label>Document description</Label>
            <textarea rows={2} value={d.help} onChange={e => set({ help: e.target.value })} className={field} placeholder="e.g. 12-digit identity card issued by UIDAI." />
          </label>
        </Card>

        {id && (
          <Card title={`Used in ${usedBy.length} scheme${usedBy.length === 1 ? '' : 's'}`}>
            {usedBy.length ? (
              <ul className="flex flex-wrap gap-2">
                {usedBy.map(s => (
                  <li key={s.id}><Link to={`/admin/schemes/${encodeURIComponent(s.id)}`} className="inline-block rounded-lg border border-line px-3 py-1.5 text-sm hover:border-brand">{s.icon} {s.name}</Link></li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-3">No scheme asks for this document yet.</p>}
          </Card>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
        {id && (usedBy.length
          ? <span className="text-xs text-ink-3">To delete it, first remove it from the schemes above.</span>
          : <button type="button" onClick={() => setDeleting(true)} className="text-sm text-bad font-semibold hover:underline">Delete document</button>)}
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={back} className={btnGhost}>Cancel</button>
          <button className={btnPrimary}>{id ? 'Save changes' : 'Add document'}</button>
        </div>
      </div>

      {deleting && (
        <Modal title={`Delete ${original.name}?`} onClose={() => setDeleting(false)} labelId="del-doc-title"
          footer={<><button type="button" onClick={() => setDeleting(false)} className={btnGhost}>Cancel</button>
            <button type="button" onClick={() => { deleteDocument(id); back() }} className={btnDanger}>Delete document</button></>}>
          <p className="text-sm text-ink-2">It will no longer be available when setting up schemes.</p>
        </Modal>
      )}
    </form>
  )
}

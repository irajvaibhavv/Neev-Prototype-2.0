import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getDocuments, usage } from '../../lib/documents'
import { btnPrimary } from '../../lib/ui'

export default function Documents() {
  const [list] = useState(getDocuments)
  const [used] = useState(usage)
  const [q, setQ] = useState('')
  const rows = list.filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="mt-1 text-sm text-ink-2">Documents the system supports and how each is collected. Schemes pick their documents from this list.</p>
        </div>
        <Link to="/admin/documents/new" className={btnPrimary}>+ Add document</Link>
      </div>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search documents…" aria-label="Search documents"
        className="mt-5 w-full sm:w-64 rounded-lg bg-card border border-line px-3 py-2 text-sm outline-none focus:border-brand" />

      <div className="mt-5 bg-card border border-line rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Document</th>
              <th className="px-4 py-3 font-semibold">Used in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(d => (
              <tr key={d.id} className="hover:bg-brand/5 align-top">
                <td className="px-4 py-3">
                  <Link to={`/admin/documents/${encodeURIComponent(d.id)}`} className="font-semibold hover:text-side-active hover:underline">{d.name}</Link>
                  {d.help && <div className="mt-0.5 text-xs text-ink-2 max-w-sm">{d.help}</div>}
                </td>
                <td className="px-4 py-3 text-ink-2 whitespace-nowrap" title={(used[d.name] || []).map(s => s.name).join('\n')}>
                  {used[d.name] ? `${used[d.name].length} scheme${used[d.name].length > 1 ? 's' : ''}` : <span className="text-ink-3">Not used</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-10 text-center text-ink-2">No documents match.</p>}
      </div>
      <p className="mt-3 text-xs text-ink-3">{list.length} documents · click one to configure it.</p>
    </div>
  )
}

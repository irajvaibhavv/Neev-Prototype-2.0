import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FIELD_TYPES, fieldUsage, getFields } from '../../lib/fields'
import { btnPrimary } from '../../lib/ui'

export default function Fields() {
  const [list] = useState(getFields)
  const [used] = useState(fieldUsage)
  const [q, setQ] = useState('')
  const rows = list.filter(f => !q || f.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Fields</h1>
          <p className="mt-1 text-sm text-ink-2">Information collected from the person on a scheme's application form. Schemes pick their fields from this list.</p>
        </div>
        <Link to="/admin/fields/new" className={btnPrimary}>+ Add field</Link>
      </div>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search fields…" aria-label="Search fields"
        className="mt-5 w-full sm:w-64 rounded-lg bg-card border border-line px-3 py-2 text-sm outline-none focus:border-brand" />

      <div className="mt-5 bg-card border border-line rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Field</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Used in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(f => (
              <tr key={f.id} className="hover:bg-brand/5 align-top">
                <td className="px-4 py-3">
                  <Link to={`/admin/fields/${encodeURIComponent(f.id)}`} className="font-semibold hover:text-side-active hover:underline">{f.name}</Link>
                  {!f.required && <span className="ml-2 text-xs text-ink-3">optional</span>}
                  {f.desc && <div className="mt-0.5 text-xs text-ink-2 max-w-sm">{f.desc}</div>}
                </td>
                <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{FIELD_TYPES[f.type]}{f.type === 'dropdown' && ` · ${f.options.length} options`}</td>
                <td className="px-4 py-3 text-ink-2 whitespace-nowrap" title={(used[f.name] || []).map(s => s.name).join('\n')}>
                  {used[f.name] ? `${used[f.name].length} scheme${used[f.name].length > 1 ? 's' : ''}` : <span className="text-ink-3">Not used</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-10 text-center text-ink-2">No fields match.</p>}
      </div>
      <p className="mt-3 text-xs text-ink-3">{list.length} fields · click one to edit it.</p>
    </div>
  )
}

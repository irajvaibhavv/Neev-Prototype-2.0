import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSchemes, setEnabled } from '../../lib/schemes'
import Toggle from '../../components/Toggle'
import { btnPrimary } from '../../lib/ui'

export const schemePath = s => `/admin/schemes/${encodeURIComponent(s.id)}`
const host = url => { try { return new URL(url).host.replace(/^www\./, '') } catch { return url } }

export default function Schemes() {
  const [list, setList] = useState(getSchemes)
  const [q, setQ] = useState('')
  const [scope, setScope] = useState('')
  const [status, setStatus] = useState('all')
  const scopes = [...new Set(list.map(s => s.scope))].sort((a, b) => (a === 'Central' ? -1 : b === 'Central' ? 1 : a.localeCompare(b)))
  const rows = list.filter(s => (!scope || s.scope === scope)
    && (status === 'all' || s.enabled === (status === 'on'))
    && (!q || s.name.toLowerCase().includes(q.toLowerCase())))
  const n = { all: list.length, on: list.filter(s => s.enabled).length, off: list.filter(s => !s.enabled).length }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Schemes</h1>
          <p className="mt-1 text-sm text-ink-2">Schemes agents can add applications for, the documents each one needs and where to apply.</p>
        </div>
        <Link to="/admin/schemes/new" className={btnPrimary}>+ Add scheme</Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="inline-flex rounded-lg bg-page border border-line p-0.5 gap-0.5" role="tablist" aria-label="Filter by status">
          {[['all', 'All'], ['on', 'Enabled'], ['off', 'Disabled']].map(([k, label]) => (
            <button key={k} role="tab" aria-selected={status === k} onClick={() => setStatus(k)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-semibold ${status === k ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>
              {label}<span className="ml-2 text-xs text-ink-3">{n[k]}</span>
            </button>
          ))}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search schemes…" aria-label="Search schemes"
          className="w-full sm:w-64 rounded-lg bg-card border border-line px-3 py-2 text-sm outline-none focus:border-brand" />
        <select value={scope} onChange={e => setScope(e.target.value)} aria-label="Filter by state"
          className="rounded-lg bg-card border border-line px-3 py-2 text-sm outline-none focus:border-brand">
          <option value="">All states ({list.length})</option>
          {scopes.map(sc => <option key={sc} value={sc}>{sc} ({list.filter(s => s.scope === sc).length})</option>)}
        </select>
      </div>

      <div className="mt-5 bg-card border border-line rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Enabled</th>
              <th className="px-4 py-3 font-semibold">Scheme</th>
              <th className="px-4 py-3 font-semibold">Available in</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Documents</th>
              <th className="px-4 py-3 font-semibold">Apply link</th>
              <th className="px-4 py-3 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(s => (
              <tr key={s.id} className="hover:bg-brand/5 align-top">
                <td className="px-4 py-3"><Toggle on={s.enabled} onChange={on => setList(setEnabled(s.id, on))} label={`${s.name} enabled`} /></td>
                <td className={`px-4 py-3 ${s.enabled ? '' : 'opacity-60'}`}>
                  <Link to={schemePath(s)} className="font-semibold hover:text-side-active hover:underline"><span className="mr-2" aria-hidden>{s.icon}</span>{s.name}</Link>
                  {!s.enabled && <span className="ml-2 rounded bg-page border border-line text-ink-2 text-[10px] px-1.5 py-0.5 font-bold align-middle">DISABLED</span>}
                  {s.desc && <div className="mt-0.5 text-xs text-ink-2 max-w-sm">{s.desc}</div>}
                </td>
                <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{s.scope}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold">{s.fee ? `₹${s.fee}` : <span className="text-ok">Free</span>}</td>
                <td className="px-4 py-3 text-ink-2" title={s.docs.join('\n')}>{s.docs.length} · <span className="text-xs">{s.docs.slice(0, 2).join(', ')}{s.docs.length > 2 ? '…' : ''}</span></td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="text-side-active hover:underline">{host(s.url)} ↗</a> : <span className="text-ink-3">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {s.source === 'custom' ? <span className="text-ok font-semibold">Added here</span>
                    : <span className="text-ink-2">Employee app{s.edited && <span className="text-warn font-semibold"> · edited</span>}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-10 text-center text-ink-2">No schemes match.</p>}
      </div>
      <p className="mt-3 text-xs text-ink-3">Click a scheme to edit or delete it.</p>
    </div>
  )
}

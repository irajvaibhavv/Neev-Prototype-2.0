import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSchemes, setEnabled } from '../../lib/schemes'
import Toggle from '../../components/Toggle'
import { btnPrimary } from '../../lib/ui'

export const schemePath = s => `/admin/schemes/${encodeURIComponent(s.id)}`
const host = url => { try { return new URL(url).host.replace(/^www\./, '') } catch { return url } }

const NO_FILTER = { scope: '', price: '', status: '' }
const active = f => Object.values(f).filter(v => v !== '').length
const sel = 'mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2 text-sm outline-none focus:border-brand'

// "Filter" button with a small panel: state, price, status.
function FilterMenu({ value, onChange, scopes, prices }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const out = e => !ref.current?.contains(e.target) && setOpen(false)
    const esc = e => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc) }
  }, [open])
  const n = active(value)
  const set = patch => onChange({ ...value, ...patch })
  const L = ({ children }) => <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className={`rounded-lg border px-3.5 py-2 text-sm font-semibold ${n ? 'border-ink-3 bg-card text-ink' : 'border-line bg-card text-ink-2 hover:border-ink-3'}`}>
        ⚙︎ Filter{n > 0 && <span className="ml-1.5 rounded-full bg-ink text-white text-xs px-1.5 py-0.5">{n}</span>}
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-72 rounded-card border border-line bg-card shadow-card-hover p-4 space-y-3">
          <label className="block"><L>State</L>
            <select value={value.scope} onChange={e => set({ scope: e.target.value })} className={sel}>
              <option value="">All states</option>
              {scopes.map(sc => <option key={sc} value={sc}>{sc === 'Central' ? 'Central (all states)' : sc}</option>)}
            </select>
          </label>
          <label className="block"><L>Price</L>
            <select value={value.price} onChange={e => set({ price: e.target.value })} className={sel}>
              <option value="">Any price</option>
              {prices.map(p => <option key={p} value={p}>{p ? `₹${p}` : 'Free'}</option>)}
            </select>
          </label>
          <label className="block"><L>Status</L>
            <select value={value.status} onChange={e => set({ status: e.target.value })} className={sel}>
              <option value="">Enabled and disabled</option>
              <option value="on">Enabled only</option>
              <option value="off">Disabled only</option>
            </select>
          </label>
          <div className="flex justify-between pt-1">
            <button type="button" onClick={() => onChange(NO_FILTER)} disabled={!n} className="text-sm font-semibold text-ink-2 hover:underline disabled:opacity-40">Clear filters</button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-side-active hover:underline">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Schemes() {
  const [list, setList] = useState(getSchemes)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState(NO_FILTER)
  const scopes = [...new Set(list.map(s => s.scope))].sort((a, b) => (a === 'Central' ? -1 : b === 'Central' ? 1 : a.localeCompare(b)))
  const prices = [...new Set(list.map(s => Number(s.fee) || 0))].sort((a, b) => a - b)
  const rows = list.filter(s => (!filter.scope || s.scope === filter.scope)
    && (filter.price === '' || (Number(s.fee) || 0) === Number(filter.price))
    && (!filter.status || s.enabled === (filter.status === 'on'))
    && (!q || s.name.toLowerCase().includes(q.toLowerCase())))

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Schemes</h1>
          <p className="mt-1 text-sm text-ink-2">Schemes agents can add applications for, the documents each one needs and where to apply.</p>
        </div>
        <Link to="/admin/schemes/new" className={btnPrimary}>+ Add scheme</Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search schemes…" aria-label="Search schemes"
          className="w-full sm:w-72 rounded-lg bg-card border border-line px-3 py-2 text-sm outline-none focus:border-brand" />
        <FilterMenu value={filter} onChange={setFilter} scopes={scopes} prices={prices} />
        {(q || active(filter) > 0) && <span className="text-sm text-ink-3">{rows.length} of {list.length}</span>}
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

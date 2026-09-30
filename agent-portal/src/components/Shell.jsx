import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../lib/auth'
import { STAGES } from '../lib/applications'

const ICONS = { new: '🆕', incomplete: '⚠️', pending: '⏳', filled: '✅' }
const Count = ({ n }) => <span className="rounded-full bg-white border border-line px-2 py-0.5 text-[11px] text-ink-2">{n}</span>
const Group = ({ children }) => <div className="hidden md:block px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-side-group">{children}</div>

// Saralya-style layout: lavender sidebar with uppercase sections + counts, white top bar.
export default function Shell({ agent, counts, includeSample, setIncludeSample, children }) {
  const nav = useNavigate()
  const initials = agent.name.split(' ').map(w => w[0]).join('')
  const link = ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
    isActive ? 'bg-brand/10 text-side-active' : 'text-side-text hover:bg-brand/5'}`

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 shrink-0 flex flex-col bg-side border-b md:border-b-0 md:border-r border-line">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-line">
          <div className="size-8 rounded-lg bg-brand text-white grid place-items-center font-heading font-bold">N</div>
          <div className="leading-tight">
            <div className="font-heading font-bold text-ink">Neev Schemes</div>
            <div className="text-[11px] text-side-group">Manager portal</div>
          </div>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto" aria-label="Portal sections">
          <NavLink to="/dashboard" className={link}>
            <span className="text-base" aria-hidden>📊</span><span className="flex-1 whitespace-nowrap">Dashboard</span>
          </NavLink>
          <NavLink to="/trends" className={link}>
            <span className="text-base" aria-hidden>📈</span><span className="flex-1 whitespace-nowrap">Trends</span>
          </NavLink>
          <Group>Users</Group>
          <NavLink to="/leads" className={link}>
            <span className="text-base" aria-hidden>🎯</span><span className="flex-1 whitespace-nowrap">Leads</span><Count n={counts.leads} />
          </NavLink>
          <Group>Applications</Group>
          {STAGES.map(s => (
            <NavLink key={s.key} to={`/${s.key}`} className={link}>
              <span className="text-base" aria-hidden>{ICONS[s.key]}</span>
              <span className="flex-1 whitespace-nowrap">{s.label}</span><Count n={counts[s.key]} />
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:flex mt-auto p-3 border-t border-line items-center gap-3">
          <div className="size-9 rounded-full bg-brand text-white grid place-items-center text-sm font-semibold">{initials}</div>
          <div className="text-xs leading-tight min-w-0">
            <div className="font-semibold text-ink truncate">{agent.name}</div>
            <div className="text-side-group truncate">{agent.area}</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-card border-b border-line flex items-center justify-end gap-4 px-4 md:px-6">
          <label className="mr-auto flex items-center gap-2 text-xs font-semibold text-ink-2 cursor-pointer select-none">
            <input type="checkbox" checked={includeSample} onChange={e => setIncludeSample(e.target.checked)} className="accent-brand size-4" />
            Include sample data
            <span className="hidden sm:inline text-ink-3 font-normal">(~500 demo users; live users are tagged LIVE)</span>
          </label>
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold">{agent.name}</div>
            <div className="text-[11px] text-ink-3">{agent.role || 'Manager'}</div>
          </div>
          <button onClick={() => { logout(); nav('/login', { replace: true }) }}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active">Log out</button>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

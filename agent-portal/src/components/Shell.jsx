import { NavLink, useNavigate } from 'react-router-dom'
import { ROLES, logout } from '../lib/auth'

const Count = ({ n }) => <span className="rounded-full bg-white border border-line px-2 py-0.5 text-[11px] text-ink-2">{n}</span>
const Group = ({ children }) => <div className="hidden md:block px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-side-group">{children}</div>

// Saralya-style layout: lavender sidebar with uppercase sections + counts, white top bar.
// items: [{ group } | { to, icon, label, count? }] — each role passes its own sidebar; toolbar sits left in the top bar.
export default function Shell({ agent, items, toolbar, children }) {
  const nav = useNavigate()
  const link = ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
    isActive ? 'bg-brand/10 text-side-active' : 'text-side-text hover:bg-brand/5'}`

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 shrink-0 flex flex-col bg-side border-b md:border-b-0 md:border-r border-line">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-line">
          <div className="size-8 rounded-lg bg-brand text-white grid place-items-center font-heading font-bold">N</div>
          <div className="leading-tight">
            <div className="font-heading font-bold text-ink">Neev Schemes</div>
            <div className="text-[11px] text-side-group">{ROLES[agent.role].label} portal</div>
          </div>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto" aria-label="Portal sections">
          {items.map(it => (it.group ? <Group key={it.group}>{it.group}</Group> : (
            <NavLink key={it.to} to={it.to} className={link}>
              <span className="text-base" aria-hidden>{it.icon}</span>
              <span className="flex-1 whitespace-nowrap">{it.label}</span>{it.count != null && <Count n={it.count} />}
            </NavLink>
          )))}
        </nav>
        <div className="mt-auto p-3 border-t border-line">
          <button onClick={() => { logout(); nav('/login', { replace: true }) }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-side-text hover:bg-brand/5">
            <span className="text-base" aria-hidden>↩</span>Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {toolbar && <header className="h-16 bg-card border-b border-line flex items-center gap-4 px-4 md:px-6">{toolbar}</header>}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

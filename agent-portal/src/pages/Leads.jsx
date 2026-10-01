import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import AddAppModal from '../components/AddAppModal'
import { LEAD_TABS, fmtDate, leadsAt } from '../lib/applications'

// People who showed interest but haven't started an application — the manager's follow-up list.
export default function Leads({ people, apps, addApp }) {
  const { step = 'schemesOpened' } = useParams()
  const [adding, setAdding] = useState(null)
  const nav = useNavigate()
  const tab = LEAD_TABS.find(t => t.key === step) || LEAD_TABS[0]
  const rows = leadsAt(people, tab.key)

  return (
    <div>
      <h1 className="text-2xl font-bold">Leads</h1>
      <p className="mt-1 text-sm text-ink-2">App users who showed interest in schemes but haven't started an application yet.</p>

      <div className="mt-5 inline-flex flex-wrap rounded-lg bg-page border border-line p-0.5 gap-0.5" role="tablist" aria-label="Lead stage">
        {LEAD_TABS.map(t => (
          <NavLink key={t.key} to={`/leads/${t.key}`} role="tab"
            className={({ isActive }) => `rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              isActive ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>
            {t.label} <span className="ml-1 text-xs opacity-80">{leadsAt(people, t.key).length}</span>
          </NavLink>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-3">{tab.desc}</p>

      <div className="mt-3 bg-card border border-line rounded-card shadow-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink-3">No leads at this step.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold">Joined app</th>
                  <th className="px-4 py-3 font-semibold">{tab.key === 'schemesOpened' ? 'Viewed schemes' : 'Clicked a scheme'}</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(p => (
                  <tr key={p.mobile} className="hover:bg-brand/5">
                    <td className="px-4 py-3 font-semibold">{p.name}{!p.sample && <span className="ml-2 rounded bg-ok-tint text-ok text-[10px] px-1.5 py-0.5 font-bold">LIVE</span>}</td>
                    <td className="px-4 py-3 text-ink-2">{p.state}</td>
                    <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{fmtDate(p.signupAt)}</td>
                    <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{fmtDate(p.funnel[tab.key])}</td>
                    <td className="px-4 py-3"><a href={`tel:+91${p.mobile}`} className="text-side-active font-semibold hover:underline whitespace-nowrap">+91 {p.mobile}</a></td>
                    <td className="px-4 py-3">
                      {addApp && <button onClick={() => setAdding(p)} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-2 hover:border-brand hover:text-side-active whitespace-nowrap">+ Add application</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {adding && <AddAppModal person={adding} existing={apps.filter(a => (a.owner || a.mobile) === adding.mobile)} onClose={() => setAdding(null)}
        onAdd={(...args) => nav(`/application/${addApp(...args)}`)} />}
    </div>
  )
}

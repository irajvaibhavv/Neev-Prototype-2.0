import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { agentStats, assign, getAgents } from '../../lib/agents'
import { fmtDate } from '../../lib/applications'
import WipBanner from '../../components/WipBanner'

const field = 'w-full sm:w-64 rounded-lg bg-input border border-line px-3 py-2 text-sm outline-none focus:border-brand'

// Agents overview: everyone who files applications on the government portals, with their workload.
export default function AgentAnalytics({ apps, includeSample }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const agents = getAgents(includeSample)
  const assigned = assign(apps, agents)
  const rows = agents.map(a => ({ agent: a, s: agentStats(a, assigned) }))
  const shown = rows.filter(r => `${r.agent.name} ${r.agent.mobile}`.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <div className="space-y-5">
      <WipBanner />
      <div>
        <h1 className="text-2xl font-bold">Agents overview</h1>
        <p className="mt-1 text-sm text-ink-2">Agents file paid applications on government portals for app users. Click an agent to see their work.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-bold mr-auto">Agents <span className="text-ink-3 font-semibold">{shown.length}</span></h2>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or mobile" aria-label="Search agents" className={field} />
      </div>

      <div className="bg-card border border-line rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Agent</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Assigned</th>
              <th className="px-4 py-3 font-semibold text-right">To file</th>
              <th className="px-4 py-3 font-semibold text-right">Waiting on docs</th>
              <th className="px-4 py-3 font-semibold">Last active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map(({ agent: a, s }) => (
              <tr key={a.id} onClick={() => navigate(`/admin/agents/${a.id}`)} className="hover:bg-brand/5 cursor-pointer">
                <td className="px-4 py-3">
                  <Link to={`/admin/agents/${a.id}`} onClick={e => e.stopPropagation()} className="font-semibold hover:text-side-active hover:underline">{a.name}</Link>
                  {a.demo && <span className="ml-2 rounded bg-page border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-3">Demo</span>}
                  <div className="text-xs text-ink-3">+91 {a.mobile}</div>
                </td>
                <td className="px-4 py-3">{a.active === false ? <span className="text-bad font-semibold">Deactivated</span> : <span className="text-ok font-semibold">Active</span>}</td>
                <td className="px-4 py-3 text-right font-semibold">{s.total}</td>
                <td className="px-4 py-3 text-right">{s.toFile}</td>
                <td className="px-4 py-3 text-right">{s.pending}</td>
                <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{s.lastActive ? fmtDate(s.lastActive) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-10 text-center text-ink-2">{agents.length ? 'No agent matches your search.' : 'No agents yet — create one in Users.'}</p>}
      </div>
      <p className="text-xs text-ink-3">Prototype: applications aren't assigned to agents yet, so each paid application is shared out to an agent automatically. Demo agents appear while sample data is on.</p>
    </div>
  )
}

// Agent analytics (super admin → Analytics → Agents overview). An agent sits on Neev's side and files a
// paid application on the government portal for the app user. Applications have no assignee yet, so for
// the prototype each paid application is given to an agent by a stable hash of its id. Demo agents
// are added when sample data is on, so the list has something to compare.
import { getUsers } from './auth'
import { daysSince, pct } from './applications'

export const SLA_DAYS = 3 // a paid application with all documents should be filed within this many days
const DAY = 86400000

export const DEMO_AGENTS = [
  { id: 'demo-priya', name: 'Priya Sharma', mobile: '9876510001', role: 'agent', active: true, demo: true, joinedAt: '2026-06-02' },
  { id: 'demo-rahul', name: 'Rahul Verma', mobile: '9876510002', role: 'agent', active: true, demo: true, joinedAt: '2026-06-20' },
  { id: 'demo-neha', name: 'Neha Gupta', mobile: '9876510003', role: 'agent', active: true, demo: true, joinedAt: '2026-07-15' },
  { id: 'demo-amit', name: 'Amit Singh', mobile: '9876510004', role: 'agent', active: false, demo: true, joinedAt: '2026-08-01' },
]

const hash = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0

export function getAgents(includeSample) {
  return [...getUsers().filter(u => u.role === 'agent'), ...(includeSample ? DEMO_AGENTS : [])]
}

// When the application was filed: from the timeline if an agent moved it, else (sample data) 1–5 days after payment.
export function filedAt(a) {
  const h = [...a.history].reverse().find(x => x.stage === 'filled')
  if (h) return h.at
  if (a.stage !== 'filled' || !a.paidAt) return null
  return new Date(Math.min(Date.now(), new Date(a.paidAt).getTime() + (1 + (hash(a.id) % 5)) * DAY)).toISOString()
}

// Paid applications, each with its agent. The hash spreads work over all agents, deactivated ones
// included, so every profile has history.
export function assign(apps, agents) {
  if (!agents.length) return []
  return apps.filter(a => a.status === 'paid').map(a => ({ ...a, agentId: agents[hash(a.id) % agents.length].id, filedAt: filedAt(a) }))
}

export function agentStats(agent, assigned) {
  const mine = assigned.filter(a => a.agentId === agent.id)
  const live = mine.filter(a => a.stage !== 'removed')
  const by = k => live.filter(a => a.stage === k)
  const filled = by('filled')
  const outcome = k => filled.filter(a => a.outcome === k).length
  const approved = outcome('approved'), disapproved = outcome('disapproved')
  const toFile = [...by('new'), ...by('in_progress')]
  const overdue = toFile.filter(a => daysSince(a.paidAt) > SLA_DAYS)
  const turnaround = filled.filter(a => a.filedAt && a.paidAt).map(a => (new Date(a.filedAt) - new Date(a.paidAt)) / DAY)
  const removed = mine.filter(a => a.stage === 'removed')
  const activity = [...mine.flatMap(a => a.history.map(h => h.at)), ...filled.map(a => a.filedAt)].filter(Boolean).sort()
  const byScheme = Object.values(live.reduce((m, a) => {
    const s = (m[a.scheme] ||= { scheme: a.scheme, total: 0, filed: 0, approved: 0 })
    s.total++; if (a.stage === 'filled') s.filed++; if (a.stage === 'filled' && a.outcome === 'approved') s.approved++
    return m
  }, {})).sort((x, y) => y.total - x.total)
  return {
    apps: mine, total: live.length,
    toFile: toFile.length, pending: by('pending').length, filed: filled.length,
    inProcess: outcome('in_process'), approved, disapproved,
    open: toFile.length + by('pending').length + outcome('in_process'), // still needs work or a govt result
    approvalRate: approved + disapproved ? pct(approved, approved + disapproved) : null,
    avgTurnaround: turnaround.length ? turnaround.reduce((s, d) => s + d, 0) / turnaround.length : null,
    overdue, oldestWaiting: toFile.length ? Math.max(...toFile.map(a => daysSince(a.paidAt) || 0)) : null,
    filedThisWeek: filled.filter(a => daysSince(a.filedAt) < 7).length,
    reminders: live.reduce((n, a) => n + a.reminders.length, 0),
    fees: live.reduce((n, a) => n + (a.amount || 0), 0),
    removed: removed.length, refundsDue: removed.filter(a => a.removed?.refund).length,
    byScheme, lastActive: activity[activity.length - 1] || null,
  }
}

export const fmtDays = d => (d == null ? '—' : d < 1 ? '< 1 day' : `${d.toFixed(1)} days`)

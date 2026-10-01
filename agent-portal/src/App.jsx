import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES, getSession } from './lib/auth'
import { AGENT_STAGES, LEAD_TABS, REMOVED, SALES_STAGES, STAGES, USER_MODES, leadsAt, useData } from './lib/applications'
import Login from './pages/Login'
import Shell from './components/Shell'
import StagePage from './pages/StagePage'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import ApplicationDetail from './pages/ApplicationDetail'
import Trends from './pages/Trends'
import Users from './pages/admin/Users'
import Schemes from './pages/admin/Schemes'
import SchemeEdit from './pages/admin/SchemeEdit'
import Documents from './pages/admin/Documents'
import DocumentEdit from './pages/admin/DocumentEdit'
import Fields from './pages/admin/Fields'
import AgentAnalytics from './pages/admin/AgentAnalytics'
import AgentDetail from './pages/admin/AgentDetail'
import Payments from './pages/admin/Payments'
import Sales from './pages/Sales'
import SalesPerson from './pages/SalesPerson'
import SalesReports from './pages/SalesReports'

const STAGE_ICONS = { new: '🆕', in_progress: '📝', incomplete: '⚠️', pending: '⏳', filled: '✅', removed: '🗑️' }

// Agent area: New / Filled / Removed — paid applications with all documents, to file on the govt portal.
// Incomplete and Pending (user still has to pay / send documents) are worked by sales.
function AgentArea({ user }) {
  const { apps: all, update, logReminder, setDoc, markAllDocs, removeApp, restoreApp, addApp } = useData()
  const apps = all.filter(a => AGENT_STAGES.includes(a.stage))
  const actions = { update, logReminder, setDoc, markAllDocs, removeApp, restoreApp, addApp }
  const sections = [...STAGES, REMOVED].filter(s => AGENT_STAGES.includes(s.key))
  const items = [
    { group: 'Applications' },
    ...sections.filter(s => s.key !== 'removed') // Removed isn't in the agent sidebar (page still reachable from a removed application)
      .map(s => ({ to: `/${s.key}`, icon: STAGE_ICONS[s.key], label: s.label, count: apps.filter(a => a.stage === s.key).length })),
  ]
  return (
    <Shell agent={user} items={items}>
      <Routes>
        {sections.map(s => (
          <Route key={s.key} path={s.key} element={<StagePage stage={s.key} apps={apps} {...actions} />} />
        ))}
        <Route path="application/:id" element={<ApplicationDetail apps={apps} {...actions} />} />
        <Route path="*" element={<Navigate to="/new" replace />} />
      </Routes>
    </Shell>
  )
}

// Super admin (backend): manage portal users and the scheme catalogue.
function AdminArea({ user }) {
  const { apps, includeSample } = useData() // for agent analytics
  const items = [
    { group: 'Manage' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/schemes', icon: '📋', label: 'Schemes' },
    { group: 'Analytics' },
    { to: '/admin/agents', icon: '🧑‍💼', label: 'Agents overview' },
    { to: '/admin/payments', icon: '💳', label: 'Payment history' },
    { group: 'Master data' },
    { to: '/admin/documents', icon: '📄', label: 'Documents' },
    { to: '/admin/fields', icon: '📝', label: 'Fields' },
  ]
  return (
    <Shell agent={user} items={items}>
      <Routes>
        <Route path="admin/users" element={<Users me={user} />} />
        <Route path="admin/schemes" element={<Schemes />} />
        <Route path="admin/schemes/new" element={<SchemeEdit key="new" />} />
        <Route path="admin/schemes/:id" element={<SchemeEdit />} />
        <Route path="admin/documents" element={<Documents />} />
        <Route path="admin/documents/new" element={<DocumentEdit key="new" />} />
        <Route path="admin/documents/:id" element={<DocumentEdit />} />
        <Route path="admin/fields/:id?" element={<Fields />} />
        <Route path="admin/agents" element={<AgentAnalytics apps={apps} includeSample={includeSample} />} />
        <Route path="admin/agents/:id" element={<AgentDetail apps={apps} includeSample={includeSample} />} />
        <Route path="admin/payments" element={<Payments />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    </Shell>
  )
}

// Which users the portal shows: real app users, the ~500 demo users, or both.
function UserModeSelect({ userMode, setUserMode }) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-ink-2">
      Showing
      <select value={userMode} onChange={e => setUserMode(e.target.value)}
        className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-semibold text-ink">
        {USER_MODES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <span className="hidden sm:inline text-ink-3 font-normal">(live = real app users, tagged LIVE)</span>
    </label>
  )
}

// Sales area: the six-stage Sales dashboard (+ person track, reports), the schemes funnel — Dashboard, Trends, Leads —
// and the applications still waiting on the user: Incomplete (not paid) and Pending (paid, documents missing →
// "Documents received → New" hands it to the agents).
function SalesArea({ user }) {
  const { people, apps, update, logReminder, markAllDocs, removeApp, restoreApp, userMode, setUserMode } = useData()
  const actions = { update, logReminder, markAllDocs, removeApp, restoreApp }
  const sections = STAGES.filter(s => SALES_STAGES.includes(s.key))
  const active = apps.filter(a => a.stage !== 'removed') // dashboard / trends ignore removed applications
  const items = [
    { to: '/sales', icon: '💼', label: 'Sales dashboard', notOn: '/sales/reports' },
    { to: '/sales/reports', icon: '🧾', label: 'Reports' },
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/trends', icon: '📈', label: 'Trends' },
    { group: 'Users' },
    { to: '/leads', icon: '🎯', label: 'Leads', count: LEAD_TABS.reduce((n, t) => n + leadsAt(people, t.key).length, 0) },
    { group: 'Applications' },
    ...sections.map(s => ({ to: `/${s.key}`, icon: STAGE_ICONS[s.key], label: s.label, count: apps.filter(a => a.stage === s.key).length })),
  ]
  return (
    <Shell agent={user} items={items} toolbar={<UserModeSelect userMode={userMode} setUserMode={setUserMode} />}>
      <Routes>
        <Route path="sales/reports" element={<SalesReports people={people} apps={apps} />} />
        <Route path="sales/person/:mobile" element={<SalesPerson people={people} apps={apps} />} />
        <Route path="sales/:stage?" element={<Sales user={user} people={people} apps={apps} />} />
        {sections.map(s => (
          <Route key={s.key} path={s.key} element={<StagePage stage={s.key} apps={apps} linkDetail={false} {...actions} />} />
        ))}
        <Route path="dashboard" element={<Dashboard agent={user} people={people} apps={active} />} />
        <Route path="trends" element={<Trends people={people} apps={active} />} />
        <Route path="leads/:step?" element={<Leads people={people} apps={apps} />} />
        <Route path="*" element={<Navigate to="/sales" replace />} />
      </Routes>
    </Shell>
  )
}

const AREAS = { super: AdminArea, agent: AgentArea, sales: SalesArea }

// Session is checked when each route renders (not once in App), so login/logout take effect immediately.
function PortalRoute() {
  const user = getSession()
  if (!user) return <Navigate to="/login" replace />
  const Area = AREAS[user.role]
  return <Area user={user} />
}
const LoginRoute = () => {
  const user = getSession()
  return user ? <Navigate to={ROLES[user.role].home} replace /> : <Login />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/*" element={<PortalRoute />} />
    </Routes>
  )
}

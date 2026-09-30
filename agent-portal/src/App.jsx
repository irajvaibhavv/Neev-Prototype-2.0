import { Navigate, Route, Routes } from 'react-router-dom'
import { getSession } from './lib/auth'
import { LEAD_TABS, STAGES, leadsAt, useData } from './lib/applications'
import Login from './pages/Login'
import Shell from './components/Shell'
import StagePage from './pages/StagePage'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import ApplicationDetail from './pages/ApplicationDetail'
import Trends from './pages/Trends'

// Logged-in area: Dashboard (funnel) + Leads + one section per application stage.
function PortalArea() {
  const agent = getSession()
  const { people, apps, update, logReminder, includeSample, setIncludeSample } = useData()
  const counts = {
    leads: LEAD_TABS.reduce((n, t) => n + leadsAt(people, t.key).length, 0),
    ...Object.fromEntries(STAGES.map(s => [s.key, apps.filter(a => a.stage === s.key).length])),
  }
  return (
    <Shell agent={agent} counts={counts} includeSample={includeSample} setIncludeSample={setIncludeSample}>
      <Routes>
        <Route path="dashboard" element={<Dashboard agent={agent} people={people} apps={apps} />} />
        <Route path="trends" element={<Trends people={people} apps={apps} />} />
        <Route path="leads/:step?" element={<Leads people={people} />} />
        {STAGES.map(s => (
          <Route key={s.key} path={s.key} element={<StagePage stage={s.key} apps={apps} update={update} logReminder={logReminder} />} />
        ))}
        <Route path="application/:id" element={<ApplicationDetail apps={apps} update={update} logReminder={logReminder} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Shell>
  )
}

// Session is checked when each route renders (not once in App), so login/logout take effect immediately.
const LoginRoute = () => (getSession() ? <Navigate to="/dashboard" replace /> : <Login />)
const PortalRoute = () => (getSession() ? <PortalArea /> : <Navigate to="/login" replace />)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/*" element={<PortalRoute />} />
    </Routes>
  )
}

// Mock login for the Neev schemes team. Demo account only — replace with real auth in production.
export const AGENTS = [
  { name: 'Neev Manager', mobile: '9876500001', area: 'Govt schemes · All states', role: 'Manager' },
]
export const DEMO_OTP = '1234'
const KEY = 'neev_agent_session'

export function findAgent(mobile) {
  return AGENTS.find(a => a.mobile === mobile) || null
}
export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    return s && findAgent(s.mobile) // sessions from accounts that no longer exist are dropped
  } catch { return null }
}
export function login(agent) {
  try { localStorage.setItem(KEY, JSON.stringify(agent)) } catch { /* private mode: session lasts this tab only */ }
}
export function logout() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

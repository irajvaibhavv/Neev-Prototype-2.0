// Mock login for the Neev portal. Three roles: super admin (manages users + schemes), agent (works
// applications), sales. Users live in localStorage so the super admin can create/edit/delete them.
// Demo only — replace with real auth in production.
export const ROLES = {
  super: { label: 'Super admin', home: '/admin/users', area: 'Neev backend' },
  agent: { label: 'Agent', home: '/new', area: 'Govt schemes' },
  sales: { label: 'Sales', home: '/dashboard', area: 'Sales' },
}
export const MANAGED_ROLES = ['agent', 'sales', 'super'] // roles the super admin can create
const SEED_USERS = [
  { id: 'u-super', name: 'Neev Admin', mobile: '9876500000', role: 'super', active: true },
  { id: 'u-agent', name: 'Neev Manager', mobile: '9876500001', role: 'agent', active: true },
  { id: 'u-sales', name: 'Neev Sales', mobile: '9876500002', role: 'sales', active: true },
]
export const DEMO_OTP = '1234'
const KEY = 'neev_agent_session'
const USERS_KEY = 'neev_portal_users'

const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage blocked: lasts until reload */ } }

export function getUsers() {
  return read(USERS_KEY, null) || SEED_USERS
}
export const DEMO_USERS = SEED_USERS

// Returns an error message, or '' when the user can be saved.
export function validateUser(u, users = getUsers()) {
  if (!u.name.trim()) return 'Enter a name'
  if (!/^\d{10}$/.test(u.mobile)) return 'Enter a 10-digit mobile number'
  if (users.some(x => x.mobile === u.mobile && x.id !== u.id)) return 'This mobile number is already registered'
  if (!MANAGED_ROLES.includes(u.role)) return 'Choose a role'
  const old = users.find(x => x.id === u.id)
  if (old && isLastSuper(old, users) && (u.role !== 'super' || u.active === false)) return 'There must always be at least one active super admin'
  return ''
}
export function saveUser(u) {
  const users = getUsers()
  const next = u.id && users.some(x => x.id === u.id)
    ? users.map(x => (x.id === u.id ? { ...x, ...u } : x))
    : [...users, { ...u, id: `u-${Date.now().toString(36)}`, createdAt: new Date().toISOString() }]
  write(USERS_KEY, next)
  return next
}
// The last active super admin can't be deleted, deactivated or given another role.
export const isLastSuper = (u, users = getUsers()) =>
  u.role === 'super' && u.active !== false && users.filter(x => x.role === 'super' && x.active !== false).length === 1
export function deleteUser(id) {
  const users = getUsers()
  const next = users.filter(x => x.id !== id || isLastSuper(x, users))
  write(USERS_KEY, next)
  return next
}

export function findUser(mobile) {
  return getUsers().find(a => a.mobile === mobile) || null
}
export function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    const u = s && findUser(s.mobile)
    return u && u.active !== false ? u : null // deleted or deactivated users are logged out
  } catch { return null }
}
export function login(user) {
  try { localStorage.setItem(KEY, JSON.stringify({ mobile: user.mobile })) } catch { /* private mode: session lasts this tab only */ }
}
export function logout() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

import { useSyncExternalStore } from 'react'

// One global state object S, same shape as the old employee.html app — the agent portal reads it from
// localStorage 'neev_employee_db' = { [mobile]: S }, so keep field names unchanged.
// sessionStorage keeps the current session across a refresh (a new tab starts logged out).
const DB_KEY = 'neev_employee_db'
const SESSION_KEY = 'neev_app_session'

const blank = () => ({
  voiceLang: 'en', custId: 0, name: '', mobile: '', company: null, ecn: '',
  salary: 0, daysInMonth: 30, currentDay: 15, payDay: 30,
  bankName: null, bankLast4: null, panNumber: null, panName: null,
  t2eSigned: false, selectedTenure: 2,
  loans: [], notifications: [], policies: [], investments: [], bbpsHistory: [], grievances: [],
  loyaltyPoints: 0, pointsHistory: [], permissions: {},
})

export const S = blank()
try { Object.assign(S, JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}) } catch { /* fresh session */ }

let version = 0
const listeners = new Set()
const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn) }

export const loadDb = () => { try { return JSON.parse(localStorage.getItem(DB_KEY)) || {} } catch { return {} } }
export const findAccount = mobile => loadDb()[mobile] || null

function persist() {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(S)) } catch { /* storage blocked */ }
  if (!S.mobile) return
  try { const db = loadDb(); db[S.mobile] = S; localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch { /* storage blocked */ }
}

// update(patch) or update(s => { s.loans.unshift(...) }) — mutate, save, re-render.
export function update(fn) {
  if (typeof fn === 'function') fn(S); else Object.assign(S, fn)
  version++
  persist()
  listeners.forEach(l => l())
}
export function replaceState(next) {
  Object.keys(S).forEach(k => delete S[k])
  Object.assign(S, blank(), next)
  update({})
}
export const logout = () => { try { sessionStorage.removeItem(SESSION_KEY) } catch { /* ignore */ } replaceState({}) }
export function resetAllData() {
  localStorage.removeItem(DB_KEY)
  logout()
}

// Components call useApp() to re-render whenever S changes.
export const useApp = () => { useSyncExternalStore(subscribe, () => version); return S }

// Funnel for the manager portal: first time each step happens.
export function trackFunnel(step) {
  if (S.funnel?.[step]) return
  update(s => { s.funnel = { ...s.funnel, [step]: new Date().toISOString() } })
}

// ===== toast + small app-wide UI state (not saved) =====
const ui = { toast: null, modal: null }
let uiVersion = 0
const uiListeners = new Set()
const setUi = patch => { Object.assign(ui, patch); uiVersion++; uiListeners.forEach(l => l()) }
export const useUi = () => { useSyncExternalStore(fn => { uiListeners.add(fn); return () => uiListeners.delete(fn) }, () => uiVersion); return ui }
let toastTimer
export function toast(msg) {
  clearTimeout(toastTimer)
  setUi({ toast: msg })
  toastTimer = setTimeout(() => setUi({ toast: null }), 2400)
}
// Modals shared across screens: 'support' | 'care' | 'soon' (with text) | 'lang' | 'name'.
export const openModal = (name, data) => setUi({ modal: { name, data } })
export const closeModal = () => setUi({ modal: null })

// ===== helpers =====
export const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN')
export const initials = name => (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
export const firstName = name => (name || 'there').split(' ')[0]

export function addNotification(text, unread = true) {
  update(s => { s.notifications.unshift({ text, unread, time: 'Just now' }) })
}
export function addPoints(amount, reason) {
  update(s => { s.loyaltyPoints += amount; s.pointsHistory.unshift({ amount, reason, date: 'Today' }) })
  toast(`+${amount} loyalty points · ${reason}`)
}

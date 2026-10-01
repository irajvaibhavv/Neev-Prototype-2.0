// Scheme catalogue as managed by the super admin: the list synced from employee/js/schemes.js
// (schemeCatalog.json) plus admin changes stored in localStorage 'neev_portal_schemes':
//   { custom: [scheme], overrides: { [catalogName]: { ...edited fields } | { deleted: true } }, disabled: [id] }
// Keeping changes separate means a re-sync from the app still picks up new app schemes.
// Enable/disable is its own list so "Undo edits" doesn't re-enable a scheme.
import catalog from './schemeCatalog.json' with { type: 'json' }
import { SCHEME_FEE } from './applications'

const KEY = 'neev_portal_schemes'
const EMPTY = { custom: [], overrides: {}, disabled: [] }
const read = () => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return { ...EMPTY } } }
const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* storage blocked */ } }

// Eligibility set in the portal. App schemes start with their "also check" note as a requirement;
// the app's own coded rules (employee/js/schemes.js) aren't shown here.
export const BLANK_ELIG = { minAge: '', maxAge: '', gender: 'any', rules: [], checks: [] }

export const STATES = [...new Set(catalog.map(s => s.scope).filter(s => s !== 'Central'))].sort()

// Every scheme gets an id: 'app:<original name>' for synced ones, 'cus:<n>' for admin-added ones.
export function getSchemes() {
  const { custom, overrides, disabled } = read()
  const fromApp = catalog
    .filter(s => !overrides[s.name]?.deleted)
    .map(s => ({ ...s, ...overrides[s.name], id: `app:${s.name}`, source: 'app', edited: !!overrides[s.name] }))
  return [...fromApp, ...custom.map(s => ({ ...s, source: 'custom' }))]
    .map(s => ({ desc: '', url: '', fee: SCHEME_FEE, ...s, fields: (s.fields || []).map(f => (typeof f === 'string' ? f : f.label)), elig: s.elig || { ...BLANK_ELIG, checks: s.check ? [s.check] : [] }, enabled: !disabled.includes(s.id) }))
}
export const getScheme = id => getSchemes().find(s => s.id === id) || null

export function validateScheme(s, list = getSchemes()) {
  if (!s.name.trim()) return 'Enter the scheme name'
  if (list.some(x => x.id !== s.id && x.name.trim().toLowerCase() === s.name.trim().toLowerCase())) return 'A scheme with this name already exists'
  if (!s.scope) return 'Choose Central or a state'
  if (s.url.trim() && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(s.url.trim())) return 'Enter a full apply link starting with https://'
  if (!/^\d{1,5}$/.test(String(s.fee).trim())) return 'Enter the price as a whole number of rupees (0 if free)'
  if (!s.docs.some(d => d.trim())) return 'Add at least one document'
  const { minAge, maxAge, rules } = s.elig
  if (minAge !== '' && maxAge !== '' && Number(minAge) > Number(maxAge)) return 'Minimum age is more than the maximum age'
  if (rules.some(r => !r.any.length)) return 'Each eligibility rule needs at least one qualifying answer'
  return ''
}

// Returns the saved scheme's id.
export function saveScheme(s) {
  const data = read()
  const clean = { name: s.name.trim(), icon: s.icon.trim() || '📄', scope: s.scope, desc: s.desc.trim(), url: s.url.trim(), fee: Number(s.fee), fields: s.fields || [], elig: { ...s.elig, checks: s.elig.checks.map(c => c.trim()).filter(Boolean) }, docs: s.docs.map(d => d.trim()).filter(Boolean) }
  let id = s.id
  if (id?.startsWith('app:')) data.overrides[id.slice(4)] = clean
  else if (id) data.custom = data.custom.map(x => (x.id === id ? { ...clean, id } : x))
  else { id = `cus:${Date.now().toString(36)}`; data.custom.push({ ...clean, id }) }
  data.disabled = data.disabled.filter(x => x !== id)
  if (s.enabled === false) data.disabled.push(id)
  write(data)
  return id
}

export function setEnabled(id, on) {
  const data = read()
  data.disabled = on ? data.disabled.filter(x => x !== id) : [...new Set([...data.disabled, id])]
  write(data)
  return getSchemes()
}

export function deleteScheme(id) {
  const data = read()
  if (id.startsWith('app:')) data.overrides[id.slice(4)] = { deleted: true }
  else data.custom = data.custom.filter(x => x.id !== id)
  data.disabled = data.disabled.filter(x => x !== id)
  write(data)
  return getSchemes()
}

// Undo admin edits on a synced scheme.
export function resetScheme(id) {
  const data = read()
  delete data.overrides[id.slice(4)]
  write(data)
  return getSchemes()
}

// A document was renamed in Documents: update every scheme that lists it.
export function renameDocInSchemes(from, to) {
  for (const s of getSchemes()) {
    if (s.docs.includes(from)) saveScheme({ ...s, docs: s.docs.map(d => (d === from ? to : d)) })
  }
}

// A field was renamed in Fields: update every scheme that asks for it.
export function renameFieldInSchemes(from, to) {
  for (const s of getSchemes()) {
    if (s.fields.includes(from)) saveScheme({ ...s, fields: s.fields.map(f => (f === from ? to : f)) })
  }
}

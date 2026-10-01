// Information fields the system supports (super admin → Master data → Fields): details collected from
// the person on a scheme's application form. Schemes pick their fields from this list, by name.
// Stored in localStorage 'neev_portal_fields'; seeded with the fields of every scheme's confirmed
// application form in the employee app (SCHEME_FORM, synced into schemeCatalog.json).
// import catalog from './schemeCatalog.json' with { type: 'json' } // old app-synced catalogue, parked
import { FIELD_DEFS } from './npsCatalog.js'
import { getSchemes, renameFieldInSchemes } from './schemes'

// const KEY = 'neev_portal_fields' // fields of the old catalogue, kept in storage but not shown
const KEY = 'neev_portal_fields_v2'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* storage blocked */ } }

// 'dropdown' = pick one option (key kept so saved fields still work); 'multiselect' = pick any number.
export const FIELD_TYPES = { text: 'Text', number: 'Number', date: 'Date', yesno: 'Yes / No', dropdown: 'Select single option', multiselect: 'Select multiple options' }
export const hasOptions = type => type === 'dropdown' || type === 'multiselect'
export const BLANK_FIELD = { name: '', desc: '', type: 'text', options: [], required: true }
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// First definition of each field label in the app's forms.
// const APP_DEFS = {}
// for (const s of catalog) for (const f of s.fields || []) {
//   APP_DEFS[f.label] ||= { type: f.type, options: f.options, required: !f.optional }
// }
const APP_DEFS = Object.fromEntries(Object.entries(FIELD_DEFS).map(([k, f]) => [k, { desc: f.desc, type: f.type, options: f.options || [], required: f.required !== false }]))

// Stored list + any field a scheme uses that isn't in it yet.
export function getFields() {
  const stored = read() || []
  const known = new Set(stored.map(f => f.name))
  const extra = [...new Set(getSchemes().flatMap(s => s.fields))].filter(n => !known.has(n))
    .map(name => ({ ...BLANK_FIELD, ...APP_DEFS[name], name, id: `fld-${slug(name)}` }))
  return [...stored, ...extra].sort((a, b) => a.name.localeCompare(b.name))
}
export const getField = id => getFields().find(f => f.id === id) || null

export function fieldUsage() {
  const out = {}
  for (const s of getSchemes()) for (const f of s.fields) (out[f] ||= []).push(s)
  return out
}

export function validateField(f, list = getFields()) {
  if (!f.name.trim()) return 'Enter the field name'
  if (list.some(x => x.id !== f.id && x.name.trim().toLowerCase() === f.name.trim().toLowerCase())) return 'A field with this name already exists'
  if (hasOptions(f.type) && f.options.filter(o => o.trim()).length < 2) return 'Add at least two options'
  return ''
}

export function saveField(f) {
  const list = getFields()
  const clean = { name: f.name.trim(), desc: f.desc.trim(), type: f.type, required: !!f.required,
    options: hasOptions(f.type) ? f.options.map(o => o.trim()).filter(Boolean) : [] }
  const old = list.find(x => x.id === f.id)
  const id = old ? f.id : `fld-${slug(clean.name)}-${Date.now().toString(36)}`
  if (old && old.name !== clean.name) renameFieldInSchemes(old.name, clean.name)
  write(old ? list.map(x => (x.id === id ? { ...clean, id } : x)) : [...list, { ...clean, id }])
  return id
}

// Only unused fields can be deleted (the page blocks it otherwise).
export function deleteField(id) {
  const list = getFields()
  const f = list.find(x => x.id === id)
  if (!f || fieldUsage()[f.name]) return list
  const next = list.filter(x => x.id !== id)
  write(next)
  return next
}

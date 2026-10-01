// Scheme catalogue as managed by the super admin: the list synced from employee/js/schemes.js
// (schemeCatalog.json) plus admin changes stored in localStorage 'neev_portal_schemes':
//   { custom: [scheme], overrides: { [catalogName]: { ...edited fields } | { deleted: true } }, disabled: [id] }
// Keeping changes separate means a re-sync from the app still picks up new app schemes.
// Enable/disable is its own list so "Undo edits" doesn't re-enable a scheme.
// Old app-synced catalogue (37 schemes) — parked while we start with the six NPS / insurance schemes.
// import catalog from './schemeCatalog.json' with { type: 'json' }
import catalog from './npsCatalog.js'
import { SCHEME_FEE } from './applications.js'

// const KEY = 'neev_portal_schemes' // edits to the old catalogue, kept in storage but not shown
const KEY = 'neev_portal_schemes_v2'
const EMPTY = { custom: [], overrides: {}, disabled: [] }
const read = () => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return { ...EMPTY } } }
const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* storage blocked */ } }

// Eligibility set in the portal. Every scheme starts with no rules; the admin adds them one by one.
// The app's own coded rules (employee/js/schemes.js) aren't shown here.
// custom = rules on this scheme's own fields / documents: { kind: 'field'|'doc', name, type, op, value, values }
// checks (free-text requirements the agent checked) was removed — old saved values are dropped on save.
export const BLANK_ELIG = { minAge: '', maxAge: '', gender: 'any', rules: [], custom: [] }

// Steps an application goes through after it's submitted (Application steps tab). Every scheme starts with
// these defaults; the admin can rename, reorder, remove or add steps per scheme. { name, desc }
// The last step means "filed": choosing it moves the application to Filled applications.
export const DEFAULT_STEPS = [
  { name: 'Application received', desc: 'Payment done and the application has reached Neev.' },
  { name: 'Application in progress', desc: 'The agent is filling it on the government portal.' },
  { name: 'Application filed', desc: 'Submitted on the government portal.' },
]
// Filing details: what the agent records from the government portal after filing (agent → application → Filing details).
// Set per scheme by the super admin. type: text | number | date | document (document = file upload).
export const FILING_TYPES = { text: 'Text', number: 'Number', date: 'Date', document: 'Document' }
export const DEFAULT_FILING = [
  { name: 'Portal application ID', type: 'text', required: true },
  { name: 'Filed on', type: 'date', required: false },
  { name: 'Acknowledgement / certificate', type: 'document', required: false },
]
// Earlier 5-step default, saved into schemes edited before the change — treated as "not customised".
const OLD_DEFAULT = 'Application received|Documents verified|Application filed|Under review|Decision'
const isOldDefault = steps => steps.map(x => x.name).join('|') === OLD_DEFAULT

// Conditions a custom rule can use, per field type: [key, symbol / short label, plain words].
// 'between' takes two values (value, value2). 'filled' (no value) is for optional fields. Documents: has / hasn't been provided.
const FILLED = ['filled', 'is filled in', 'is filled in']
export const RULE_OPS = {
  number: [['lt', '<', 'less than'], ['lte', '≤', 'at most'], ['gt', '>', 'more than'], ['gte', '≥', 'at least'], ['eq', '=', 'equal to'], ['ne', '≠', 'not equal to'], ['between', 'between', 'between'], FILLED],
  text: [['eq', 'is', 'is'], ['ne', 'is not', 'is not'], ['contains', 'contains', 'contains'], FILLED],
  date: [['before', 'on or before', 'on or before'], ['after', 'on or after', 'on or after'], ['between', 'between', 'between'], FILLED],
  yesno: [['is', 'is', 'is']],
  dropdown: [['in', 'is one of', 'is one of'], ['notin', 'is not one of', 'is not one of'], FILLED],
  multiselect: [['any', 'includes any of', 'includes any of'], ['all', 'includes all of', 'includes all of'], ['none', 'includes none of', 'includes none of'], FILLED],
  doc: [['has', 'must be provided', 'must be provided'], ['not', 'must NOT be held', 'must NOT be held']],
}
export const opsFor = r => RULE_OPS[r.kind === 'doc' ? 'doc' : r.type] || RULE_OPS.text
const ruleNeedsValue = r => r.kind === 'field' && r.op !== 'filled'
const blank = v => String(v ?? '').trim() === ''
const fmtDay = v => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : v)
// How a value reads in the rule sentence: dates as "2 Oct 2008", text in quotes.
const show = (r, v) => (blank(v) ? '…' : r.type === 'date' ? fmtDay(v) : r.type === 'text' ? `“${v}”` : v)

// Plain-words version of a rule, e.g. "Age is less than 60".
export function describeRule(r) {
  const op = opsFor(r).find(o => o[0] === r.op) || opsFor(r)[0]
  if (r.kind === 'doc') return `${r.name} ${op[2]}`
  if (r.op === 'filled') return `${r.name} is filled in`
  if (r.type === 'dropdown' || r.type === 'multiselect') return `${r.name} ${op[2]} ${r.values?.join(', ') || '…'}`
  if (r.type === 'yesno') return `${r.name} is ${r.value === 'no' ? 'No' : 'Yes'}`
  const v = show(r, r.value)
  if (r.op === 'between') return `${r.name} is between ${v} and ${show(r, r.value2)}`
  return `${r.name} ${r.type === 'number' || r.type === 'date' ? 'is ' : ''}${op[2]} ${v}`
}

// App-synced fields carry { label, optional }; admin-saved schemes store the optional list directly.
const appOptional = fields => (fields || []).filter(f => typeof f !== 'string' && f.optional).map(f => f.label)

export const STATES = [...new Set(catalog.map(s => s.scope).filter(s => s !== 'Central'))].sort()

// Every scheme gets an id: 'app:<original name>' for synced ones, 'cus:<n>' for admin-added ones.
export function getSchemes() {
  const { custom, overrides, disabled } = read()
  const fromApp = catalog
    .filter(s => !overrides[s.name]?.deleted)
    .map(s => ({ ...s, ...overrides[s.name], id: `app:${s.name}`, source: 'app', edited: !!overrides[s.name] }))
  return [...fromApp, ...custom.map(s => ({ ...s, source: 'custom' }))]
    .map(s => ({ desc: '', url: '', fee: SCHEME_FEE, optionalDocs: [], ...s,
      fields: (s.fields || []).map(f => (typeof f === 'string' ? f : f.label)),
      optionalFields: s.optionalFields || appOptional(s.fields),
      steps: s.steps?.length && !isOldDefault(s.steps) ? s.steps : DEFAULT_STEPS,
      filingFields: s.filingFields || DEFAULT_FILING,
      elig: { ...BLANK_ELIG, ...s.elig },
      enabled: !disabled.includes(s.id) }))
}
export const getScheme = id => getSchemes().find(s => s.id === id) || null

// Split by step of the add-scheme journey (General → Information → Documents → Eligibility).
export function validateGeneral(s, list = getSchemes()) {
  if (!s.name.trim()) return 'Enter the scheme name'
  if (list.some(x => x.id !== s.id && x.name.trim().toLowerCase() === s.name.trim().toLowerCase())) return 'A scheme with this name already exists'
  if (!s.scope) return 'Choose Central or a state'
  if (s.url.trim() && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(s.url.trim())) return 'Enter a full apply link starting with https://'
  if (!/^\d{1,5}$/.test(String(s.fee).trim())) return 'Enter the price as a whole number of rupees (0 if free)'
  return ''
}
export function validateFiling(s) {
  const names = (s.filingFields || []).map(x => x.name.trim().toLowerCase())
  if (names.some(n => !n)) return 'Every filing detail needs a name'
  if (new Set(names).size < names.length) return 'Two filing details have the same name'
  return ''
}
export function validateSteps(s) {
  const names = (s.steps || []).map(x => x.name.trim().toLowerCase())
  if (!names.length) return 'Add at least one application step'
  if (names.some(n => !n)) return 'Every application step needs a name'
  if (new Set(names).size < names.length) return 'Two application steps have the same name'
  return ''
}
export const validateDocs = s => (s.docs.some(d => d.trim()) ? '' : 'Add at least one document')
export function validateEligibility(s) {
  const { minAge, maxAge, rules } = s.elig
  if (minAge !== '' && maxAge !== '' && Number(minAge) > Number(maxAge)) return 'Minimum age is more than the maximum age'
  if (rules.some(r => !r.any.length)) return 'Each eligibility rule needs at least one qualifying answer'
  for (const r of s.elig.custom || []) {
    if (!(r.kind === 'doc' ? s.docs : s.fields || []).includes(r.name)) return `The eligibility rule on “${r.name}” uses something no longer on this scheme — remove that rule`
    if (ruleNeedsValue(r) && (r.type === 'dropdown' || r.type === 'multiselect' ? !r.values?.length : blank(r.value) || (r.op === 'between' && blank(r.value2)))) return `The eligibility rule on “${r.name}” needs a value`
    if (r.type === 'number' && ruleNeedsValue(r) && [r.value, ...(r.op === 'between' ? [r.value2] : [])].some(x => !/^\d+(\.\d+)?$/.test(String(x).trim()))) return `The eligibility rule on “${r.name}” needs a valid number`
    if (r.op === 'between' && (r.type === 'number' ? Number(r.value) > Number(r.value2) : r.value > r.value2)) return `The eligibility rule on “${r.name}”: the first value is more than the second`
  }
  return ''
}
// Number of eligibility rules set (age and gender count once each).
export const ruleCount = e => e.rules.length + e.custom.length + (e.minAge !== '' || e.maxAge !== '' ? 1 : 0) + (e.gender !== 'any' ? 1 : 0)

export function validateScheme(s, list = getSchemes()) {
  return validateGeneral(s, list) || validateDocs(s) || validateEligibility(s) || validateSteps(s) || validateFiling(s)
}

// Returns the saved scheme's id.
export function saveScheme(s) {
  const data = read()
  const docs = s.docs.map(d => d.trim()).filter(Boolean)
  const fields = s.fields || []
  const clean = { name: s.name.trim(), icon: s.icon.trim() || '📄', scope: s.scope, desc: s.desc.trim(), url: s.url.trim(), fee: Number(s.fee), fields, docs,
    optionalDocs: (s.optionalDocs || []).filter(d => docs.includes(d)), optionalFields: (s.optionalFields || []).filter(f => fields.includes(f)),
    steps: (s.steps || []).map(x => ({ name: x.name.trim(), desc: (x.desc || '').trim() })),
    filingFields: (s.filingFields || []).map(x => ({ name: x.name.trim(), type: x.type, required: !!x.required })),
    elig: (({ checks, ...elig }) => ({ ...BLANK_ELIG, ...elig }))(s.elig) }
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

const sw = (from, to) => x => (x === from ? to : x)
const renameInRules = (elig, kind, from, to) => ({ ...elig, custom: elig.custom.map(r => (r.kind === kind && r.name === from ? { ...r, name: to } : r)) })

// A document was renamed in Documents: update every scheme that lists it.
export function renameDocInSchemes(from, to) {
  for (const s of getSchemes()) {
    if (s.docs.includes(from)) saveScheme({ ...s, docs: s.docs.map(sw(from, to)), optionalDocs: s.optionalDocs.map(sw(from, to)), elig: renameInRules(s.elig, 'doc', from, to) })
  }
}

// A field was renamed in Fields: update every scheme that asks for it.
export function renameFieldInSchemes(from, to) {
  for (const s of getSchemes()) {
    if (s.fields.includes(from)) saveScheme({ ...s, fields: s.fields.map(sw(from, to)), optionalFields: s.optionalFields.map(sw(from, to)), elig: renameInRules(s.elig, 'field', from, to) })
  }
}

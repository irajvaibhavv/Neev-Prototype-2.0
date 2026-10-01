// Document types the system supports (super admin → Documents). Schemes pick their documents from
// this list. Stored in localStorage 'neev_portal_documents' as an array; seeded on first use with every
// document name the schemes already use. Schemes reference documents by name, so a rename is copied
// into every scheme that uses it.
import { getSchemes, renameDocInSchemes } from './schemes'

const KEY = 'neev_portal_documents'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* storage blocked */ } }

export const BLANK_DOC = { name: '', help: '', photo: true, bothSides: false, pdf: true, number: false, numberLabel: '' }
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Stored list + any document a scheme uses that isn't in it yet (e.g. new after an app re-sync).
export function getDocuments() {
  const stored = read() || []
  const known = new Set(stored.map(d => d.name))
  const extra = [...new Set(getSchemes().flatMap(s => s.docs))].filter(n => !known.has(n))
    .map(name => ({ ...BLANK_DOC, name, id: `doc-${slug(name)}` }))
  return [...stored, ...extra].sort((a, b) => a.name.localeCompare(b.name))
}
export const getDocument = id => getDocuments().find(d => d.id === id) || null

// How many / which schemes use each document name.
export function usage() {
  const out = {}
  for (const s of getSchemes()) for (const d of s.docs) (out[d] ||= []).push(s)
  return out
}

export function validateDocument(d, list = getDocuments()) {
  if (!d.name.trim()) return 'Enter the document name'
  if (list.some(x => x.id !== d.id && x.name.trim().toLowerCase() === d.name.trim().toLowerCase())) return 'A document with this name already exists'
  return ''
}

export function saveDocument(d) {
  const list = getDocuments()
  const clean = {
    name: d.name.trim(), help: d.help.trim(), photo: !!d.photo, bothSides: !!(d.photo && d.bothSides), pdf: !!d.pdf,
    number: !!d.number, numberLabel: d.number ? d.numberLabel.trim() : '',
  }
  const old = list.find(x => x.id === d.id)
  const id = old ? d.id : `doc-${slug(clean.name)}-${Date.now().toString(36)}`
  if (old && old.name !== clean.name) renameDocInSchemes(old.name, clean.name)
  write(old ? list.map(x => (x.id === id ? { ...clean, id } : x)) : [...list, { ...clean, id }])
  return id
}

// Only unused documents can be deleted (the page blocks it otherwise).
export function deleteDocument(id) {
  const list = getDocuments()
  const d = list.find(x => x.id === id)
  if (!d || usage()[d.name]) return list
  const next = list.filter(x => x.id !== id)
  write(next)
  return next
}

// One-line summary, e.g. "Photo (front & back) · PDF · Number".
export const formats = d => [d.photo && `Photo${d.bothSides ? ' (front & back)' : ''}`, d.pdf && 'PDF', d.number && (d.numberLabel || 'Number')].filter(Boolean).join(' · ')

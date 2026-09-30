import { useState } from 'react'
import catalog from '../lib/schemeCatalog.json'
import { SCHEME_FEE } from '../lib/applications'
import Modal from './Modal'
import { btnGhost, btnPrimary, seg, segBtn } from '../lib/ui'

// Agent adds a scheme application for a person (e.g. found eligible during a visit).
// Scheme list is synced from employee/js/schemes.js at build time (scripts/sync-schemes.mjs).
export default function AddAppModal({ person, existing, onClose, onAdd }) {
  const taken = new Set(existing.filter(a => a.stage !== 'removed').map(a => a.scheme))
  const groups = [
    ['Central schemes', catalog.filter(s => s.scope === 'Central')],
    [`${person.state} schemes`, catalog.filter(s => s.scope === person.state)],
    ['Other states', catalog.filter(s => s.scope !== 'Central' && s.scope !== person.state)],
  ].filter(([, list]) => list.length)
  const [name, setName] = useState('')
  const [payment, setPayment] = useState('collected')
  const [collected, setCollected] = useState([])
  const scheme = catalog.find(s => s.name === name)
  const toggle = d => setCollected(c => (c.includes(d) ? c.filter(x => x !== d) : [...c, d]))
  // Pre-tick what the app already verified for this person (same rule as docOnFile in employee/js/schemes.js)
  const onFile = d => (['Aadhaar card', 'Parent Aadhaar', 'Parent Aadhaar card', 'Address proof', 'Residence proof', 'Aadhaar-linked mobile'].includes(d) && person.aadhaarLast4)
    || d === 'Mobile number' || d === 'None needed'
  const choose = n => { setName(n); const s = catalog.find(x => x.name === n); setCollected(s ? s.docs.filter(onFile) : []) }

  return (
    <Modal title="Add an application" sub={`${person.name} · +91 ${person.mobile} · ${person.state}`} onClose={onClose} labelId="add-title"
      footer={<>
        <button onClick={onClose} className={btnGhost}>Cancel</button>
        <button disabled={!scheme} onClick={() => { onAdd(person, scheme, payment, collected); onClose() }} className={btnPrimary}>Add application</button>
      </>}>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Scheme *</span>
        <select value={name} onChange={e => choose(e.target.value)}
          className="mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand">
          <option value="">Choose a scheme…</option>
          {groups.map(([label, list]) => (
            <optgroup key={label} label={label}>
              {list.map(s => <option key={s.name} value={s.name} disabled={taken.has(s.name)}>{s.icon} {s.name}{taken.has(s.name) ? ' (already applied)' : ''}</option>)}
            </optgroup>
          ))}
        </select>
        <span className="mt-1.5 block text-xs text-ink-3">Check the person's eligibility answers before adding.</span>
      </label>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">Service fee</div>
        <div className={seg} role="group" aria-label="Service fee">
          <button type="button" onClick={() => setPayment('collected')} aria-pressed={payment === 'collected'} className={segBtn(payment === 'collected')}>₹{SCHEME_FEE} collected by agent</button>
          <button type="button" onClick={() => setPayment('waived')} aria-pressed={payment === 'waived'} className={segBtn(payment === 'waived')}>Fee waived</button>
        </div>
      </div>

      {scheme && (
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">Documents collected ({collected.length}/{scheme.docs.length})</legend>
          <div className="space-y-1.5">
            {scheme.docs.map(d => (
              <label key={d} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm cursor-pointer hover:border-ink-3">
                <input type="checkbox" checked={collected.includes(d)} onChange={() => toggle(d)} className="accent-brand size-4" />{d}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-3">
            {collected.length === scheme.docs.length ? 'All documents collected → goes to New applications.' : 'Missing documents → goes to Pending until they are collected.'}
          </p>
        </fieldset>
      )}
    </Modal>
  )
}

import { useState } from 'react'
import Modal from './Modal'
import { btnGhost, btnPrimary } from '../lib/ui'

export const FILED = '__filed' // returned when the last step (filed) is picked → move to Filled applications

// Pick the current status of an In-progress application from its scheme's Application steps (super admin → Schemes).
// The last step means filed: it moves the application to Filled applications.
export default function StatusModal({ app, steps, current, onClose, onSave }) {
  const [pick, setPick] = useState(current)
  const option = (value, title, desc, i) => (
    <label key={value} className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 cursor-pointer ${pick === value ? 'border-brand bg-brand/5' : 'border-line hover:border-ink-3'}`}>
      <input type="radio" name="status" value={value} checked={pick === value} onChange={() => setPick(value)} className="accent-brand mt-1" />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold">{i != null && <span className="text-ink-3 mr-1">{i + 1}.</span>}{title}
          {value === current && <span className="ml-2 rounded bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.5 font-bold align-middle">CURRENT</span>}</span>
        {desc && <span className="block text-xs text-ink-3 mt-0.5">{desc}</span>}
      </span>
    </label>
  )
  return (
    <Modal title="Update status" sub={`${app.applicant} · ${app.scheme}`} onClose={onClose} labelId="status-title"
      footer={<><button onClick={onClose} className={btnGhost}>Cancel</button>
        <button onClick={() => onSave(pick)} disabled={pick === current} className={btnPrimary}>{pick === FILED ? 'Move to Filled' : 'Save status'}</button></>}>
      <fieldset className="space-y-2">
        <legend className="sr-only">Status</legend>
        {steps.map((st, i) => i === steps.length - 1
          ? option(FILED, st.name, `${st.desc ? `${st.desc} ` : ''}Moves it to Filled applications.`, i)
          : option(st.name, st.name, st.desc, i))}
      </fieldset>
    </Modal>
  )
}

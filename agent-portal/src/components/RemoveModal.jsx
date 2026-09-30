import { useState } from 'react'
import { REMOVE_REASONS } from '../lib/applications'
import Modal from './Modal'
import { btnDanger, btnGhost } from '../lib/ui'

// Remove one scheme application (e.g. agent found the user isn't eligible). Soft delete: kept under "Removed".
export default function RemoveModal({ app, onClose, onRemove }) {
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const needsDetail = reason === 'Other' || reason === 'Not eligible for this scheme'
  const valid = reason && (!needsDetail || detail.trim().length >= 3)
  const refund = app.status === 'paid' && (app.amount || 0) > 0

  return (
    <Modal title="Remove this application?" sub={`${app.applicant} · ${app.scheme}`} onClose={onClose} labelId="remove-title"
      footer={<>
        <button onClick={onClose} className={btnGhost}>Cancel</button>
        <button disabled={!valid} onClick={() => { onRemove(app, reason, detail.trim()); onClose() }} className={btnDanger}>Remove application</button>
      </>}>
      <p className="text-sm text-ink-2">Only this scheme is removed — the person's other applications stay as they are. You can restore it later from <b>Removed</b>.</p>
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Reason *</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {REMOVE_REASONS.map(r => (
            <button key={r} type="button" onClick={() => setReason(r)} aria-pressed={reason === r}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${reason === r ? 'border-bad bg-bad-tint text-bad' : 'border-line text-ink-2 hover:border-ink-3'}`}>{r}</button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{needsDetail ? 'Details *' : 'Details (optional)'}</span>
        <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={3}
          placeholder={reason === 'Not eligible for this scheme' ? 'Which rule fails — e.g. "Has EPF account", "Family income above ₹2.5 lakh"' : 'Add a note for the record'}
          className="mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </label>
      {refund && (
        <div className="rounded-lg bg-warn-tint border border-warn/30 px-3 py-2.5 text-sm text-warn">
          <b>₹{app.amount} refund due.</b> This application was paid for — it will be flagged for refund under Removed.
        </div>
      )}
    </Modal>
  )
}

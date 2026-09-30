import { useEffect } from 'react'

// Shared dialog shell: backdrop click / Escape closes, focus-trapped enough for a prototype.
export default function Modal({ title, sub, onClose, children, footer, labelId = 'modal-title' }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 grid place-items-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby={labelId} onClick={e => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-card rounded-card shadow-card-hover border border-line">
        <div className="p-5 border-b border-line">
          <h2 id={labelId} className="font-bold text-lg">{title}</h2>
          {sub && <p className="text-sm text-ink-2 mt-0.5">{sub}</p>}
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">{children}</div>
        <div className="p-5 border-t border-line flex flex-wrap gap-2 justify-end">{footer}</div>
      </div>
    </div>
  )
}


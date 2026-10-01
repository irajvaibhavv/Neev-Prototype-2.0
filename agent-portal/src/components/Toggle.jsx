// On/off switch. Track is neutral grey when off, ok-green when on (status colour, not brand violet).
export default function Toggle({ on, onChange, label, disabled, title }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} title={title} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${on ? 'bg-ok' : 'bg-line-strong'}`}>
      <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
    </button>
  )
}

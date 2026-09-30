// Shared button / segmented-control classes (Saralya style: violet only for primary actions).
export const btnGhost = 'rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-2 hover:border-brand'
export const btnPrimary = 'rounded-lg bg-brand hover:bg-side-active disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold'
export const btnDanger = 'rounded-lg bg-bad hover:bg-bad/90 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold'
export const seg = 'flex rounded-lg bg-page border border-line p-0.5 gap-0.5 text-sm font-semibold'
export const segBtn = on => `flex-1 rounded-md px-3 py-1.5 ${on ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`

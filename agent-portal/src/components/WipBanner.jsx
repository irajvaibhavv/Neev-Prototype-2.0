// "Work in progress" strip for pages that are still being built (shown at the top of the page).
export default function WipBanner() {
  return (
    <div role="note" className="flex items-center gap-2.5 rounded-card border border-warn/40 bg-warn-tint px-4 py-3 text-sm text-warn">
      <span aria-hidden="true">🚧</span>
      <span><b>Work in progress</b> — this page is still being built. Numbers and layout may change.</span>
    </div>
  )
}

// Placeholder — the sales dashboard is the next thing to build.
export default function Sales({ user }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Sales dashboard</h1>
      <p className="mt-1 text-sm text-ink-2">Welcome, {user.name}.</p>
      <div className="mt-5 bg-card border border-line rounded-card shadow-card p-12 text-center">
        <div className="text-3xl" aria-hidden>💼</div>
        <p className="mt-2 font-semibold">Coming soon</p>
        <p className="mt-1 text-sm text-ink-2">The sales view is being built next.</p>
      </div>
    </div>
  )
}

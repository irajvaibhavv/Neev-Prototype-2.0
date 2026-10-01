import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEMO_OTP, DEMO_USERS, ROLES, findUser, login } from '../lib/auth'

export default function Login() {
  const nav = useNavigate()
  const [mobile, setMobile] = useState('')
  const [agent, setAgent] = useState(null)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [timer, setTimer] = useState(0)
  const boxes = useRef([])

  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(timer - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  function sendOtp(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{10}$/.test(mobile)) return setError('Enter your 10-digit mobile number')
    const a = findUser(mobile)
    if (!a) return setError("This number isn't registered on the Neev portal")
    if (a.active === false) return setError('This account is deactivated. Contact your Neev admin.')
    setAgent(a)
    setOtp(['', '', '', ''])
    setTimer(30)
    // Simulated SMS auto-read, same as the employee app
    setTimeout(() => setOtp(DEMO_OTP.split('')), 1500)
  }

  // Demo shortcut: log straight in as that user, skipping the OTP step.
  function quickLogin(m) {
    const u = findUser(m)
    if (!u) return setError("This number isn't registered on the Neev portal")
    if (u.active === false) return setError('This account is deactivated. Contact your Neev admin.')
    login(u)
    nav('/', { replace: true })
  }

  function typeOtp(i, v) {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...otp]; next[i] = d; setOtp(next)
    if (d && i < 3) boxes.current[i + 1]?.focus()
  }

  function verify(e) {
    e.preventDefault()
    setError('')
    if (otp.join('') !== DEMO_OTP) return setError('Incorrect OTP. Please try again.')
    setBusy(true)
    setTimeout(() => { login(agent); nav('/', { replace: true }) }, 600)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-12 text-white bg-gradient-to-br from-brand-darker via-brand-dark to-brand">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/15 grid place-items-center font-heading font-bold text-lg">N</div>
          <div>
            <div className="font-heading font-bold text-lg leading-tight">Neev</div>
            <div className="text-xs text-white/70">by Saralya</div>
          </div>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Track every worker from download to approved scheme.</h1>
          <p className="mt-4 text-white/75 leading-relaxed">
            See how Neev app users move through government schemes — who viewed, who applied, who paid — and take every application through to approval.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {['Live funnel from app download to payment', 'Leads who viewed or clicked a scheme', 'Separate logins for agents, sales and admins'].map(t => (
              <li key={t} className="flex items-center gap-3">
                <span className="size-5 rounded-full bg-white/20 grid place-items-center text-[11px]">✓</span>{t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">© 2026 Saralya · Neev Schemes Portal</p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="size-9 rounded-xl bg-brand text-white grid place-items-center font-heading font-bold">N</div>
            <span className="font-heading font-bold text-lg">Neev Portal</span>
          </div>

          <h2 className="text-2xl font-bold">{agent ? 'Enter OTP' : 'Log in'}</h2>
          <p className="mt-1 text-sm text-ink-2">
            {agent ? <>Sent to +91 {mobile.replace(/(\d{5})(\d{5})/, '$1 $2')} · <button type="button" className="text-side-active font-semibold hover:underline" onClick={() => { setAgent(null); setError('') }}>Change</button></>
                   : 'Log in with your registered mobile number.'}
          </p>

          <div className="mt-6 bg-card border border-line rounded-card shadow-card p-6">
            {!agent ? (
              <form onSubmit={sendOtp}>
                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wide mb-2" htmlFor="mobile">Mobile number</label>
                <div className="flex items-center rounded-lg bg-input border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <span className="pl-3 pr-2 text-sm text-ink-3">+91</span>
                  <input id="mobile" inputMode="numeric" autoComplete="tel" maxLength={10} autoFocus value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent py-2.5 pr-3 text-sm tracking-wider outline-none" placeholder="98765 00021" />
                </div>
                {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
                <button className="mt-5 w-full rounded-lg bg-brand hover:bg-side-active text-white text-sm font-semibold py-2.5 transition-colors">Send OTP</button>
              </form>
            ) : (
              <form onSubmit={verify}>
                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wide mb-2">4-digit OTP</label>
                <div className="flex gap-3">
                  {otp.map((d, i) => (
                    <input key={i} ref={el => (boxes.current[i] = el)} inputMode="numeric" maxLength={1} value={d} aria-label={`OTP digit ${i + 1}`}
                      onChange={e => typeOtp(i, e.target.value)}
                      onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && boxes.current[i - 1]?.focus()}
                      className="w-full aspect-square max-w-14 text-center text-xl font-semibold rounded-lg bg-input border border-line outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-3">
                  {timer > 0 ? <>Resend OTP in <b className="text-ink-2">{timer}s</b></>
                             : <button type="button" className="text-side-active font-semibold hover:underline" onClick={sendOtp}>Resend OTP</button>}
                </p>
                {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
                <button disabled={busy} className="mt-5 w-full rounded-lg bg-brand hover:bg-side-active disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors">
                  {busy ? 'Logging in…' : 'Verify & log in'}
                </button>
              </form>
            )}
          </div>

          {/* Demo helper — remove for production */}
          <div className="mt-5 rounded-lg bg-brand-tint/60 border border-brand-tint-2 p-3 text-xs text-ink-2">
            <b className="text-brand-dark">Demo login</b> — click to log straight in (no OTP):
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {DEMO_USERS.map(a => (
                <button key={a.mobile} type="button" onClick={() => quickLogin(a.mobile)}
                  className="rounded-md bg-white border border-line px-2 py-1 hover:border-brand"><b>{ROLES[a.role].label}</b> · {a.mobile}</button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

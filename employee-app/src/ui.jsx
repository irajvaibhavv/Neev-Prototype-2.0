// Shared building blocks — every screen is made of these, so the look stays consistent.
// Two looks: the default teal one, and "Play" (bright, chunky 3D) used ONLY on the Govt Schemes screens
// (<Screen play>). Inside a play screen every component below switches to its play classes via PlayCtx,
// and the .play class in index.css swaps the colour tokens.
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { speak, stopSpeaking, t } from './lib/i18n.js'

const PlayCtx = createContext(false)
const usePlay = () => useContext(PlayCtx)

// Back = previous screen in this tab's history; fallback when there is none (e.g. opened by link / after refresh).
export function useNav() {
  const navigate = useNavigate()
  return {
    go: (to, opts) => navigate(to, opts),
    back: (fallback = '/home') => (window.history.state?.idx > 0 ? navigate(-1) : navigate(fallback, { replace: true })),
  }
}

export function Screen({ title, back = '/home', onBack, right, footer, children, tone = 'page', noSpeak, play = false }) {
  const { back: goBack } = useNav()
  const body = useRef(null)
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => () => stopSpeaking(), [])
  const readAloud = () => {
    if (speaking) { stopSpeaking(); setSpeaking(false); return }
    setSpeaking(true)
    speak(body.current.innerText.split('\n').filter(Boolean).slice(0, 8).join('. '), () => setSpeaking(false))
  }
  return (
    <PlayCtx.Provider value={play}>
      <div className={`flex h-full flex-col ${tone === 'page' ? 'bg-page' : 'bg-card'} ${play ? 'play' : ''}`}>
        {title !== undefined && (
          <header className="flex items-center gap-2 px-3 pt-2 pb-2">
            {back !== false && (
              <IconBtn label="Back" onClick={onBack || (() => goBack(back))}>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </IconBtn>
            )}
            <h1 className={`flex-1 truncate leading-tight ${play ? 'text-[21px] text-ink' : 'text-[19px] font-bold text-teal-900'}`}>{t(title)}</h1>
            {right}
            {!noSpeak && <IconBtn label={speaking ? 'Stop reading' : 'Read aloud'} onClick={readAloud}>{speaking ? '⏹' : '🔊'}</IconBtn>}
          </header>
        )}
        <main ref={body} className="flex-1 overflow-y-auto px-4 pb-6 animate-in">{children}</main>
        {footer && <div className="border-t border-line bg-card/95 px-4 pt-3 pb-4 backdrop-blur">{footer}</div>}
      </div>
    </PlayCtx.Provider>
  )
}

export function IconBtn({ label, children, className = '', ...p }) {
  const play = usePlay()
  return (
    <button aria-label={label} title={label} className={`grid size-10 shrink-0 place-items-center bg-card ${play
      ? 'press rounded-2xl border-2 border-line text-ink shadow-card'
      : 'rounded-full text-teal-900 shadow-card transition active:scale-90'} ${className}`} {...p}>{children}</button>
  )
}

const BTN = {
  primary: 'bg-teal-700 text-white shadow-[0_6px_16px_rgb(18_105_90/.28)] hover:bg-teal-900',
  dark: 'bg-teal-950 text-white hover:bg-black',
  gold: 'bg-gold-500 text-teal-950 shadow-[0_6px_16px_rgb(245_166_35/.35)]',
  outline: 'border-2 border-teal-100 bg-card text-teal-700 hover:border-teal-500',
  ghost: 'text-muted hover:text-teal-900',
  danger: 'border-2 border-bad-100 bg-card text-bad',
}
// Play: chunky 3D buttons — a solid darker edge underneath that disappears when pressed (.press in index.css).
const PLAY_BTN = {
  primary: 'press bg-teal-700 text-white shadow-[0_5px_0_var(--color-teal-950)] [--edge:var(--color-teal-950)]',
  dark: 'press bg-ink text-white shadow-[0_5px_0_#0E161B] [--edge:#0E161B]',
  gold: 'press bg-gold-500 text-ink shadow-[0_5px_0_var(--color-gold-400)] [--edge:var(--color-gold-400)]',
  outline: 'press border-2 border-line bg-card text-sky-700 shadow-card',
  ghost: 'text-muted hover:text-ink',
  danger: 'press border-2 border-line bg-card text-bad shadow-card',
}
export function Btn({ v = 'primary', size = 'lg', className = '', children, ...p }) {
  const play = usePlay()
  const sz = play ? (size === 'lg' ? 'min-h-13 px-5 text-[17px]' : 'min-h-10 px-3 text-[14px]') : (size === 'lg' ? 'min-h-13 px-5 text-[15px]' : 'min-h-10 px-3 text-[13px]')
  return (
    <button className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl disabled:opacity-45 disabled:shadow-none ${
      play ? 'font-display font-semibold tracking-wide' : 'font-semibold transition active:scale-[.98]'} ${sz} ${(play ? PLAY_BTN : BTN)[v]} ${className}`} {...p}>{children}</button>
  )
}

export function Card({ className = '', children, ...p }) {
  const play = usePlay()
  return <div className={`rounded-3xl ${play ? 'border-2' : 'border'} border-line bg-card p-4 shadow-card ${className}`} {...p}>{children}</div>
}

// Label / value line (costs, details). `total` = the bottom line.
export function Row({ k, v, total, mono }) {
  const play = usePlay()
  return (
    <div className={`flex items-baseline justify-between gap-3 py-1.5 text-[13.5px] ${!total ? '' : play
      ? 'mt-1 border-t-2 border-dashed border-line pt-3 font-display text-[17px] text-ok'
      : 'mt-1 border-t border-dashed border-line pt-3 text-[15px] font-bold text-teal-900'}`}>
      <span className={total ? '' : 'text-muted'}>{t(k)}</span>
      <span className={`text-right font-semibold ${mono ? 'font-mono' : ''}`}>{v}</span>
    </div>
  )
}

// Tappable list item with an icon tile.
export function Item({ icon, bg = 'bg-teal-50', title, sub, right = '›', onClick, className = '' }) {
  const play = usePlay()
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 bg-card p-3 text-left shadow-card ${play
      ? 'press mb-3 rounded-3xl border-2 border-line' : 'mb-2.5 rounded-2xl border border-line transition active:scale-[.99]'} ${className}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-xl ${bg}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <b className={`block leading-snug ${play ? 'text-[15px] font-extrabold' : 'text-[14px]'}`}>{t(title)}</b>
        {sub && <span className="mt-0.5 block text-[12px] text-muted leading-snug">{sub}</span>}
      </span>
      {right && <span className={`text-xl ${play ? 'font-black text-line-2' : 'font-bold text-teal-500'}`}>{right}</span>}
    </button>
  )
}

export function Label({ children, opt }) {
  const play = usePlay()
  return (
    <label className={`mb-1.5 block ${play ? 'text-[14px] font-extrabold text-ink' : 'text-[12px] font-semibold tracking-wide text-muted uppercase'}`}>
      {t(children)}{opt && <span className={`ml-1.5 rounded-md px-1.5 py-0.5 ${play ? 'bg-sky-100 text-[11px] text-sky-700' : 'bg-teal-100 text-[10px] tracking-normal text-teal-700 normal-case'}`}>Optional</span>}
    </label>
  )
}
// Text input classes; inside play screens the .play tokens recolour it (pass usePlayInput() for the play shape).
export const inputCls = 'w-full rounded-2xl border-2 border-line bg-card px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-teal-500 read-only:bg-teal-50'
export const playInputCls = 'w-full rounded-2xl border-2 border-line bg-page px-4 py-3 text-[15px] font-bold outline-none transition placeholder:font-semibold placeholder:text-muted/60 focus:border-teal-500 focus:bg-card read-only:text-muted'
export const useInputCls = () => (usePlay() ? playInputCls : inputCls)
export function Field({ label, opt, className = 'mb-3', ...p }) {
  const cls = useInputCls()
  return <div className={className}>{label && <Label opt={opt}>{label}</Label>}<input className={cls} {...p} /></div>
}

// 4-box code input (OTP / PIN). `autoFill` simulates SMS auto-read.
export function Otp({ value, onChange, secret, autoFill, length = 4 }) {
  const refs = useRef([])
  useEffect(() => {
    if (!autoFill) return
    const id = setTimeout(() => onChange('1234'.slice(0, length)), 1500)
    return () => clearTimeout(id)
  }, [autoFill]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (i, d) => {
    const next = (value.slice(0, i) + d + value.slice(i + 1)).slice(0, length)
    onChange(next.replace(/\D/g, ''))
    if (d && i < length - 1) refs.current[i + 1]?.focus()
  }
  return (
    <div className="my-2 flex justify-center gap-2.5">
      {Array.from({ length }, (_, i) => (
        <input key={i} ref={el => (refs.current[i] = el)} inputMode="numeric" maxLength={1} type={secret ? 'password' : 'text'}
          value={value[i] || ''} aria-label={`Digit ${i + 1}`}
          onChange={e => set(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={e => { if (e.key === 'Backspace' && !value[i] && i) refs.current[i - 1]?.focus() }}
          className={`size-14 rounded-2xl border-2 bg-card text-center font-mono text-2xl outline-none transition focus:border-teal-500 ${value[i] ? 'border-teal-500' : 'border-line'}`} />
      ))}
    </div>
  )
}

export const Toggle = ({ on, onClick, label }) => (
  <button role="switch" aria-checked={!!on} aria-label={label} onClick={onClick}
    className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-teal-500' : 'bg-line'}`}>
    <span className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : ''}`} />
  </button>
)

export const Check = ({ checked, onChange, children }) => (
  <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-relaxed">
    <input type="checkbox" checked={!!checked} onChange={onChange} className="mt-0.5 size-5 shrink-0 accent-teal-700" />
    <span>{children}</span>
  </label>
)

export function Empty({ icon, children }) {
  const play = usePlay()
  return (
    <div className={`flex flex-col items-center rounded-3xl border-dashed px-6 py-8 text-center ${play ? 'border-2 border-line-2' : 'border border-line bg-card/60'}`}>
      <span className="mb-2 text-3xl">{icon}</span>
      <p className="text-[13px] text-muted">{t(children)}</p>
    </div>
  )
}

export const Spinner = ({ text, icon }) => (
  <div className="flex flex-col items-center py-8 text-center animate-in">
    {icon ? <span className="mb-3 text-3xl animate-pulse">{icon}</span>
      : <span className="mb-3 size-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />}
    <p className="text-[13px] font-semibold text-teal-900">{text}</p>
  </div>
)

export const SuccessHero = ({ title, children }) => (
  <div className="flex flex-col items-center pt-8 pb-5 text-center">
    <div className="mb-4 grid size-20 place-items-center rounded-full bg-ok text-white shadow-[0_10px_30px_rgb(35_118_79/.35)] animate-pop">
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none"><path d="M4 12l6 6L20 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
    <h2 className="text-2xl font-bold text-teal-900">{t(title)}</h2>
    {children && <p className="mt-1.5 max-w-72 text-[13.5px] text-muted">{children}</p>}
  </div>
)

export const Badge = ({ tone = 'teal', children }) => {
  const c = { teal: 'bg-teal-100 text-teal-700', ok: 'bg-ok-100 text-ok', gold: 'bg-gold-100 text-gold-600', bad: 'bg-bad-100 text-bad', grey: 'bg-page text-muted' }[tone]
  return <span className={`inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${c}`}>{children}</span>
}

// Choice tiles (quiz answers, reasons, yes/no).
export function Chip({ sel, icon, children, className = '', ...p }) {
  const play = usePlay()
  const look = play
    ? `press font-extrabold text-[14px] ${sel ? 'border-teal-500 bg-sky-100 text-sky-700 shadow-[0_4px_0_var(--color-teal-500)] [--edge:var(--color-teal-500)]' : 'border-line bg-card text-ink shadow-card'}`
    : `font-semibold text-[13.5px] transition active:scale-95 ${sel ? 'border-teal-700 bg-teal-700 text-white shadow-[0_6px_14px_rgb(18_105_90/.3)]' : 'border-line bg-card text-teal-900 hover:border-teal-500'}`
  return (
    <button type="button" className={`rounded-2xl border-2 px-2 py-3 leading-tight ${look} ${className}`} {...p}>
      {icon && <span className="mb-1 block text-2xl">{icon}</span>}{children}
    </button>
  )
}

// Bottom sheet (replaces centred modal boxes — easier to reach with a thumb).
export function Sheet({ open, onClose, children, tall }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45 animate-[in_.2s]" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className={`overflow-y-auto rounded-t-[28px] bg-card px-5 pt-3 pb-6 animate-up ${tall ? 'max-h-[92%]' : 'max-h-[85%]'}`}>
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}
export function SheetHead({ icon, title, sub }) {
  const play = usePlay()
  return (
    <div className="mb-4 text-center">
      {icon && <div className={`mx-auto mb-2 grid size-14 place-items-center rounded-2xl text-3xl ${play ? 'bg-gold-100' : 'bg-teal-50'}`}>{icon}</div>}
      <h2 className={play ? 'text-[22px] text-ink' : 'text-xl font-bold text-teal-900'}>{t(title)}</h2>
      {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
    </div>
  )
}

export const Section = ({ children, right }) => (
  <div className="mt-5 mb-2.5 flex items-center justify-between">
    <h3 className="text-[15px] font-bold text-teal-900">{t(children)}</h3>{right}
  </div>
)

// Govt schemes (CF-14/15): Aadhaar (+ optional PAN) → gamified one-question-per-screen quiz → eligible schemes
// → scheme-specific application form → cart (₹49 per scheme) → one UPI payment.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { S, addNotification, toast, trackFunnel, update, useApp } from '../store.js'
import { AADHAAR_SAMPLE } from '../lib/data.js'
import SchemeIcon from '../lib/SchemeIcon.jsx'
import { speak, stopSpeaking } from '../lib/i18n.js'
import { LEVELS_HI, QUIZ_HI } from '../lib/schemes-hi.js'

const VOICE_SPEED = 0.85 // quiz voice playback speed (1 = as recorded)
import {
  RE_MOB, SCHEME_FEE, SCHEME_FORM, SP_KEYS, SP_LEVELS, SP_QUESTIONS, STATE_SCHEMES, cartApps, docOnFile, docsToAsk,
  eligibleSchemes, findScheme, foundSchemes, getStateFromAddress, openAppFor, schemeApps, spQ, spQueue, spResolve,
} from '../lib/schemes.js'
import { Badge, Btn, Card, Chip, Empty, IconBtn, Label, Row, Screen, Sheet, SheetHead, Spinner, playInputCls, useNav } from '../ui.jsx'

// Home tile: once Aadhaar is known and answers are saved, go straight to results.
export function openSchemes(go) {
  trackFunnel('schemesOpened')
  if (S.aadhaar) trackFunnel('aadhaarGiven') // e.g. already verified in loan KYC
  go(hasAadhaar() && quizDone() ? '/schemes' : '/schemes/start')
}
// Results list only once the quiz is finished (all questions, or "See my schemes"). Until then Govt Schemes reopens
// the question screen where it was left; "Show all" users (no answers) get the choose screen again.
const answered = () => SP_KEYS.some(k => S.schemeProfile?.[k] !== undefined)
const quizDone = () => !!S.schemeQuizDone
const hasAadhaar = () => !!(S.aadhaar && S.gender && S.dob)

// ===== Identity: Aadhaar (scan or type) → optional PAN =====
function IdentityStep({ onDone }) {
  const [num, setNum] = useState('')
  const [busy, setBusy] = useState(null) // { icon, text }
  const [cam, setCam] = useState(false)
  const [pan, setPan] = useState('')
  const [panStep, setPanStep] = useState(false)
  const input = useRef(null)
  const finish = msg => {
    update({ schemeState: getStateFromAddress() })
    trackFunnel('aadhaarGiven')
    toast(msg)
    setBusy(null)
    if (S.panNumber || S.schemePan) onDone(); else setPanStep(true)
  }
  const verify = () => {
    const n = num.replace(/\s/g, '')
    if (!/^\d{12}$/.test(n)) { toast('Enter a valid 12-digit Aadhaar number'); return }
    setBusy({ text: 'Fetching details from UIDAI…' })
    setTimeout(() => {
      update(st => { st.aadhaar = n.replace(/(\d{4})(?=\d)/g, '$1 '); if (!st.name || st.name === 'User') st.name = 'Ramesh Kumar'; st.gender = 'Male'; st.dob = '15-03-1992' })
      finish('✅ Aadhaar verified')
    }, 1500)
  }
  const scan = () => {
    setCam(false)
    setBusy({ icon: '📷', text: 'Reading your Aadhaar card…' })
    setTimeout(() => {
      update(st => {
        st.aadhaar = AADHAAR_SAMPLE.number; if (!st.name || st.name === 'User') st.name = AADHAAR_SAMPLE.name
        st.gender = AADHAAR_SAMPLE.gender; st.dob = AADHAAR_SAMPLE.dob; if (!st.address) st.address = AADHAAR_SAMPLE.addr
      })
      finish('✅ Aadhaar card scanned')
    }, 1600)
  }
  // Kept apart from S.panNumber so a PAN typed here never skips the DigiLocker KYC the loan flow needs.
  const savePan = () => {
    const v = pan.trim().toUpperCase()
    if (v && !/^[A-Z]{5}\d{4}[A-Z]$/.test(v)) { toast('Enter a valid PAN, e.g. ABCDE1234F'); return }
    if (v) update({ schemePan: v })
    onDone()
  }
  return (
    <div className="pt-2 animate-in">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 grid size-20 place-items-center rounded-[26px] bg-gold-100 text-4xl animate-pop">{panStep ? '💳' : '🪪'}</div>
        <h2 className="text-2xl font-bold text-teal-900">{panStep ? 'Add your PAN' : 'Find schemes for you'}</h2>
        <p className="mt-1 text-[13px] text-muted">{panStep ? 'Optional — helps with some schemes' : 'Verify your Aadhaar · takes 10 seconds'}</p>
      </div>
      {panStep ? (
        <Card className="animate-in">
          <div className="mb-4 rounded-xl bg-ok-100 px-3 py-2.5 text-[13px] font-semibold text-ok">✅ Aadhaar verified · {S.name}</div>
          <Label opt>PAN card</Label>
          <input value={pan} onChange={e => setPan(e.target.value.toUpperCase())} maxLength={10} placeholder="ABCDE1234F" className={`${playInputCls} mb-3 font-mono tracking-widest`} />
          <Btn onClick={savePan}>Continue →</Btn>
          <Btn v="ghost" onClick={onDone}>Skip</Btn>
        </Card>
      ) : busy ? <Card><Spinner {...busy} /></Card> : (
        <Card>
          <Btn onClick={() => setCam(true)}>📷 Scan Aadhaar card</Btn>
          <div className="my-3 flex items-center gap-3 text-[12px] text-muted"><span className="h-px flex-1 bg-line" />or type the number<span className="h-px flex-1 bg-line" /></div>
          <input ref={input} type="tel" inputMode="numeric" maxLength={14} value={num} placeholder="XXXX XXXX XXXX"
            onChange={e => setNum(e.target.value.replace(/[^\d ]/g, ''))} className={`${playInputCls} mb-3 text-center font-mono text-lg tracking-widest`} />
          <Btn v="outline" onClick={verify}>Verify Aadhaar</Btn>
        </Card>
      )}
      <Sheet open={cam} onClose={() => setCam(false)}>
        <SheetHead icon="📷" title="Allow camera access" sub="To scan your Aadhaar card and read your details automatically." />
        <Btn onClick={scan}>Allow</Btn>
        <Btn v="ghost" onClick={() => { setCam(false); setTimeout(() => input.current?.focus(), 50) }}>Enter manually instead</Btn>
      </Sheet>
    </div>
  )
}

// ===== Quiz =====
function initialAnswers() {
  const saved = S.schemeProfile || {}
  const ans = {}, editAuto = {}
  SP_KEYS.forEach(k => { if (saved[k] !== undefined) ans[k] = saved[k] })
  // Profiles saved before the gate question existed: derive it from the four detail answers.
  if (ans.AnyTaxGovt === undefined && saved.SelfTax !== undefined) ans.AnyTaxGovt = ['SelfTax', 'Tax', 'Govt', 'Pension'].some(k => saved[k] === 'yes') ? 'yes' : 'no'
  // A saved answer that differs from the loan-profile value means the user changed it.
  SP_QUESTIONS.forEach(q => { if (q.auto && ans[q.f] !== undefined && q.auto() !== undefined && String(ans[q.f]) !== String(q.auto())) editAuto[q.f] = true })
  return { ans, editAuto }
}

// Steps: Aadhaar (+ PAN) → choose "best for me" (quiz) or "show all" (pick one scheme, no questions) → quiz.
// Coming back to edit answers / "Answer all" (state.quiz) goes straight to the quiz.
export function SchemeQuiz() {
  const { go, back } = useNav()
  const { mode = 'more', quiz } = useLocation().state || {}
  const [step, setStep] = useState(() => (!hasAadhaar() ? 'id' : mode === 'edit' || quiz || answered() ? 'quiz' : 'choose'))
  if (step === 'id') return <Screen play title="Find your schemes" back="/home"><IdentityStep onDone={() => setStep('choose')} /></Screen>
  if (step === 'choose') return <ChooseStep onBest={() => setStep('quiz')} go={go} />
  return <Quiz mode={mode} go={go} back={back} />
}

// All schemes of the user's state as squares, blurred until they pick: "Choose best for me" (quiz)
// or "Show all schemes" (tap one → its sheet → apply directly, without the questions).
function ChooseStep({ onBest, go }) {
  const [live] = useState(() => S.schemeProfile?.LiveState || S.schemeState || getStateFromAddress())
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState(null)
  const sp = { ...S.schemeProfile, LiveState: live }
  // Only schemes Aadhaar (age, gender) doesn't already rule out. 'locked' = depends on answers we skipped.
  const list = eligibleSchemes(sp)
  const best = () => { update({ schemeProfile: { ...S.schemeProfile, LiveState: live } }); onBest() }
  return (
    <Screen play title="Find your schemes" back="/home" footer={showAll && <Btn onClick={best}>✨ Find the best ones for me</Btn>}>
      <div>
        <div className={`grid grid-cols-2 gap-3 transition duration-500 ${showAll ? '' : 'pointer-events-none select-none blur-[5px]'}`} aria-hidden={!showAll}>
          {list.map(x => (
            <button key={x.name} onClick={() => setOpen(x)} tabIndex={showAll ? 0 : -1}
              className="press flex aspect-square flex-col items-start justify-between rounded-3xl border-2 border-line bg-card p-3 text-left shadow-card">
              <span className="grid size-12 place-items-center rounded-2xl bg-gold-100 text-2xl"><SchemeIcon s={x} size="size-9" /></span>
              <span>
                <b className="line-clamp-3 text-[13.5px] leading-tight font-extrabold">{x.name}</b>
                <span className="mt-1 line-clamp-2 block text-[12px] leading-tight font-extrabold text-ok">{x.win}</span>
              </span>
            </button>
          ))}
        </div>
        {!showAll && (
          // Centred over the whole screen (positioned against the app frame, so it stays put while the grid scrolls).
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-9 animate-in">
            <div className="pointer-events-auto w-full max-w-72 rounded-[26px] border-2 border-line bg-card p-4 text-center shadow-[0_6px_0_var(--color-line-2),0_20px_40px_rgb(0_0_0/.14)]">
              <span className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-gold-500 text-3xl shadow-[0_4px_0_var(--color-gold-400)]">🎁</span>
              <p className="font-display text-[19px] leading-tight font-semibold text-ink">{list.length} govt schemes in {live}</p>
              <p className="mt-1 mb-3 text-[12.5px] font-bold text-muted">Find the ones you get, or pick the one you want.</p>
              <Btn onClick={best}>✨ Choose best for me</Btn>
              <p className="mt-1 mb-2.5 text-[11.5px] font-bold text-muted">A few quick taps · about 1 minute</p>
              <Btn v="outline" onClick={() => setShowAll(true)}>📋 Show all schemes</Btn>
            </div>
          </div>
        )}
      </div>
      {open && <SchemeSheet s={open} closeLabel="Back to all schemes" onClose={() => setOpen(null)}
        onApply={() => { update({ schemeProfile: { ...S.schemeProfile, LiveState: live } }); go('/schemes/apply/' + encodeURIComponent(open.name)) }} go={go} />}
    </Screen>
  )
}

function Quiz({ mode, go, back }) {
  const init = useMemo(initialAnswers, [])
  const [ans, setAns] = useState(init.ans)
  const [editAuto, setEditAuto] = useState(init.editAuto)
  const [live, setLive] = useState(() => S.schemeProfile?.LiveState || S.schemeState || getStateFromAddress())
  const [done, setDone] = useState(() => new Set())
  const [checkpoint, setCheckpoint] = useState(0)
  const [openScheme, setOpenScheme] = useState(null) // tapped a won scheme → its details sheet
  // Question language (text + voice). Starts from the language picked at signup; the EN | हिं switch changes it.
  const [lang, setLang] = useState(S.voiceLang === 'hi' ? 'hi' : 'en')
  const [playing, setPlaying] = useState(false)
  const audio = useRef(null)
  const sp = { ...ans, LiveState: live }
  const opts = { mode, done, editAuto }
  const [cur, setCur] = useState(() => spQueue(sp, opts)[0]?.f)
  const [seen, setSeen] = useState(() => new Set(foundSchemes(sp, editAuto).map(s => s.name)))

  const all = eligibleSchemes(sp, editAuto)
  const found = all.filter(s => s.status !== 'locked')
  const locked = all.length - found.length
  const queue = spQueue(sp, opts)
  const q = spQ(cur)

  const save = next => update({ schemeProfile: next })
  const finish = next => { update({ schemeProfile: next, schemeQuizDone: true }); go('/schemes', { replace: true }) }
  useEffect(() => { if (!cur) finish(sp) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Voice: reads ONLY the question. Recorded human voice (Murf, public/voice/<lang>/<Field>.mp3); browser voice if missing.
  const stopVoice = () => { audio.current?.pause(); stopSpeaking(); setPlaying(false) }
  const playVoice = (l = lang) => {
    stopVoice()
    const text = l === 'hi' ? QUIZ_HI[q.f]?.q || q.q : q.q
    const a = new Audio(`./voice/${l}/${q.f}.mp3`)
    audio.current = a
    a.playbackRate = VOICE_SPEED // clips felt too fast for first-time users; pitch is kept (preservesPitch)
    a.onended = () => setPlaying(false)
    a.onerror = () => { if (audio.current === a) speak(text, () => setPlaying(false), l) }
    setPlaying(true)
    a.play()?.catch?.(() => {}) // a missing clip fires onerror → browser voice (older browsers return no promise)
  }
  useEffect(() => { if (q && S.voiceMode && !checkpoint) playVoice(); return stopVoice }, [cur, checkpoint]) // eslint-disable-line react-hooks/exhaustive-deps
  const switchLang = l => { setLang(l); update({ voiceLang: l }); if (playing) playVoice(l) }

  const advance = (nextAns, nextEdit, nextDone) => {
    const nsp = { ...nextAns, LiveState: live }
    setSeen(new Set(found.map(s => s.name))) // anything found after this answer pops in as NEW
    const nxt = spQueue(nsp, { mode, done: nextDone, editAuto: nextEdit }).find(x => SP_QUESTIONS.indexOf(x) > SP_QUESTIONS.indexOf(q))
    if (!nxt) { finish(nsp); return }
    setCheckpoint(mode !== 'edit' && nxt.lvl > q.lvl ? q.lvl : 0)
    setCur(nxt.f)
  }
  const pick = v => {
    const nextAns = { ...ans, [q.f]: q.num ? +v : v }
    const nextEdit = q.auto ? { ...editAuto, [q.f]: true } : editAuto
    const nextDone = new Set(done).add(q.f)
    setAns(nextAns); setEditAuto(nextEdit); setDone(nextDone)
    save({ ...nextAns, LiveState: live }) // saved after every tap — the user can leave and come back
    advance(nextAns, nextEdit, nextDone)
  }
  const skip = () => { const nextDone = new Set(done).add(q.f); setDone(nextDone); advance(ans, editAuto, nextDone) }
  // On a checkpoint `cur` is already the next question, so "previous" is the last question of the finished level.
  const prevQ = () => {
    const prev = queue.filter(x => SP_QUESTIONS.indexOf(x) < SP_QUESTIONS.indexOf(q)).pop()
    if (!prev) { back('/home'); return }
    setCheckpoint(0); setCur(prev.f)
  }
  const changeState = st => { setLive(st); save({ ...ans, LiveState: st }) }
  if (!q) return null
  const value = spResolve(sp, editAuto)[q.f]
  const left = queue.length - queue.indexOf(q)
  const progress = done.size / (done.size + left || 1)
  const level = checkpoint || q.lvl

  return (
    <Screen play title={undefined} noSpeak footer={checkpoint
      ? <><Btn onClick={() => setCheckpoint(0)}>Keep going</Btn><Btn v="ghost" onClick={() => finish(sp)}>See my schemes</Btn></>
      : <Btn v="outline" onClick={skip}>{lang === 'hi' ? 'छोड़ें' : 'Skip'}</Btn>}>
      <div className="flex min-h-full flex-col">
      <div className="flex items-center gap-3 pt-2">
        <IconBtn label="Back" onClick={prevQ}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </IconBtn>
        <div className="min-w-0 flex-1">
          <div className="h-4 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-label="Quiz progress">
            <div className="h-full rounded-full bg-teal-700 shadow-[inset_0_-4px_0_rgb(0_0_0/.15)] transition-all duration-500" style={{ width: `${Math.max(6, progress * 100)}%` }} />
          </div>
          <p className="mt-1 truncate pl-1 text-[11.5px] font-extrabold text-muted">{lang === 'hi' ? `लेवल ${level} / 3 · ${LEVELS_HI[level]}` : `Level ${level} of 3 · ${SP_LEVELS[level]}`}{locked > 0 && ` · 🔒 ${locked} ${lang === 'hi' ? 'बाकी' : 'to unlock'}`}</p>
        </div>
        <span key={found.length} className="flex h-10 items-center gap-1 rounded-2xl border-2 border-gold-500 bg-gold-100 px-2.5 font-display text-[16px] animate-pop">🎁 {found.length}</span>
      </div>
      {/* Voice + language at the top; Listen reads only the current question. */}
      <div className="mt-2 mb-3 flex items-center justify-between gap-2">
        <label className="flex min-w-0 items-center text-[13px] font-extrabold text-sky-700">📍
          <select value={live} onChange={e => changeState(e.target.value)} aria-label="State you live in" className="min-w-0 bg-transparent py-1 font-extrabold text-sky-700 outline-none">
            {Object.keys(STATE_SCHEMES).map(st => <option key={st}>{st}</option>)}
          </select>
        </label>
        <div className="flex shrink-0 items-center gap-1.5">
          {!checkpoint && (
            <button onClick={() => (playing ? stopVoice() : playVoice())} aria-label={playing ? 'Stop' : 'Listen to the question'}
              className={`press flex h-9 items-center gap-1.5 rounded-full border-2 px-3 font-display text-[14px] shadow-card ${playing ? 'border-teal-500 bg-sky-100 text-sky-700' : 'border-line bg-card text-sky-700'}`}>
              {playing ? <span className="flex h-4 items-end gap-0.5" aria-hidden>{[0, 1, 2].map(i => <i key={i} className="w-1 animate-pulse rounded-full bg-sky-700" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />)}</span> : '🔊'}
              {playing ? (lang === 'hi' ? 'रोकें' : 'Stop') : lang === 'hi' ? 'सुनें' : 'Listen'}
            </button>
          )}
          <div className="flex rounded-full border-2 border-line bg-card p-0.5 text-[12.5px] font-extrabold" role="group" aria-label="Language">
            {[['en', 'EN'], ['hi', 'हिं']].map(([k, l]) => (
              <button key={k} onClick={() => switchLang(k)} aria-pressed={lang === k}
                className={`rounded-full px-2.5 py-1 ${lang === k ? 'bg-teal-700 text-white' : 'text-muted'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Won schemes stay on screen for the whole quiz (user ask: "so he can't forget"). Newest first, full names. */}
      <WonGrid found={found} seen={seen} onOpen={setOpenScheme} />
      {openScheme && <SchemeSheet s={openScheme} onClose={() => setOpenScheme(null)}
        onApply={() => { save(sp); go('/schemes/apply/' + encodeURIComponent(openScheme.name)) }} go={go} />}

      {checkpoint ? (
        <div key="cp" className="flex flex-1 flex-col items-center justify-center py-6 text-center animate-in">
          <div className="text-7xl animate-pop">🏆</div>
          <p className="mt-3 font-display text-[28px] font-semibold text-ink">Level {checkpoint} complete!</p>
          <p className="mt-1 text-[14px] font-bold text-muted">{locked ? `${locked} more schemes to unlock · ${left} question${left !== 1 ? 's' : ''} left` : 'You found everything'}</p>
        </div>
      ) : (
        <div key={q.f} className="flex flex-1 flex-col justify-center py-6 animate-in">
          <div className="mb-5 text-center">
            <span aria-hidden className="mx-auto mb-3 grid size-18 place-items-center rounded-3xl bg-gold-500 text-[40px] shadow-[0_4px_0_var(--color-gold-400)]">{q.ic}</span>
            <p className="font-display text-[24px] leading-tight font-semibold text-ink">{lang === 'hi' ? QUIZ_HI[q.f]?.q || q.q : q.q}</p>
          </div>
          <div className={`grid gap-2.5 ${q.cols === 5 ? 'grid-cols-5' : 'grid-cols-2'}`}>
            {q.opts.map(([v, label, , ic]) => {
              const sel = String(value) === String(v)
              return (
                <button key={v} type="button" onClick={() => pick(v)}
                  className={`press flex min-h-14 items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left text-[15px] leading-tight font-extrabold ${q.cols === 5 || !ic ? 'justify-center text-center' : ''} ${q.cols === 5 ? 'px-1 font-display text-[20px]' : ''} ${
                    sel ? 'border-teal-500 bg-sky-100 text-sky-700 shadow-[0_4px_0_var(--color-teal-500)] [--edge:var(--color-teal-500)]' : 'border-line bg-card text-ink shadow-card'}`}>
                  {ic && <span className="text-2xl">{ic}</span>}{(lang === 'hi' && QUIZ_HI[q.f]?.opts[v]) || label}
                </button>
              )
            })}
          </div>
        </div>
      )}
      </div>
    </Screen>
  )
}

// Unlocked schemes, 2 per row with full names; newly unlocked first. Shows 4, the rest behind "+N more".
function WonGrid({ found, seen, onOpen }) {
  const [all, setAll] = useState(false)
  if (!found.length) return <p className="mb-2 rounded-2xl border-2 border-dashed border-line-2 py-3 text-center text-[13px] font-extrabold text-muted">Answer to unlock your first scheme 🔓</p>
  const list = [...found].sort((a, b) => seen.has(a.name) - seen.has(b.name))
  const shown = all || list.length <= 4 ? list : list.slice(0, 3)
  return (
    <div className="grid grid-cols-2 gap-2.5 pt-2">
      {shown.map(s => {
        const isNew = !seen.has(s.name)
        return (
          <button key={s.name} onClick={() => onOpen(s)} className={`press relative flex gap-2 rounded-2xl border-2 border-gold-500 bg-card p-2.5 text-left shadow-[0_4px_0_var(--color-gold-400)] [--edge:var(--color-gold-400)] ${isNew ? 'animate-pop' : ''}`}>
            {isNew && <em className="absolute -top-2.5 right-2 rounded-lg bg-coral px-1.5 py-0.5 font-display text-[11px] not-italic text-white">NEW</em>}
            <span className="text-xl leading-none"><SchemeIcon s={s} size="size-7" /></span>
            <span className="min-w-0">
              <b className="block text-[12.5px] leading-tight font-extrabold">{s.name}</b>
              <span className="mt-0.5 block text-[12px] leading-tight font-extrabold text-ok">{s.win}</span>
            </span>
          </button>
        )
      })}
      {list.length > 4 && (
        <button onClick={() => setAll(!all)} className="press rounded-2xl border-2 border-line bg-card p-2.5 font-display text-[15px] text-sky-700 shadow-card">
          {all ? 'Show less' : `+${list.length - 3} more won`}
        </button>
      )}
    </div>
  )
}

// A won scheme opened from the quiz: what you get, details, documents, and apply — without losing quiz progress.
function SchemeSheet({ s, onClose, onApply, go, closeLabel = 'Keep answering' }) {
  const paid = schemeApps().find(a => a.scheme === s.name && a.status === 'paid')
  const carted = schemeApps().find(a => a.scheme === s.name && a.status === 'cart')
  const docs = docsToAsk(s)
  return (
    <Sheet open onClose={onClose} tall>
      <div className="mb-4 text-center">
        <span className="mx-auto mb-2 grid size-16 place-items-center rounded-3xl bg-gold-500 text-4xl shadow-[0_4px_0_var(--color-gold-400)]"><SchemeIcon s={s} size="size-11" /></span>
        <h2 className="text-[22px] leading-tight text-ink">{s.name}</h2>
        <p className="mt-1 font-display text-[18px] text-ok">{s.win}</p>
        <div className="mt-2 flex justify-center gap-1.5">
          {s.status === 'yes' ? <Badge tone="ok">✅ Eligible</Badge> : s.status === 'maybe' ? <Badge tone="gold">🔎 May be eligible</Badge> : <Badge tone="grey">❔ Not checked yet</Badge>}
          <Badge>{s.scope}</Badge>
        </div>
        {s.status === 'locked' && <p className="mt-2 text-[12.5px] font-bold text-muted">You skipped the questions — our agent confirms eligibility before filing.</p>}
      </div>
      <Card className="mb-3 text-[13.5px] leading-relaxed">
        <p>{s.desc}</p>
        <p className="mt-2"><b>Also check:</b> {s.check}</p>
      </Card>
      <Card className="mb-4 text-[13.5px]">
        <b className="block">📄 Documents needed</b>
        {docs.length ? <ul className="mt-1 list-disc pl-5">{docs.map(d => <li key={d}>{d}</li>)}</ul> : <p className="mt-1">None — we already have what's needed.</p>}
      </Card>
      {paid ? <Btn v="outline" disabled>Applied ✓</Btn>
        : carted ? <Btn v="gold" onClick={() => go('/schemes/cart')}>In cart 🛒 · Pay now</Btn>
          : <Btn onClick={onApply}>Apply via Neev · ₹{SCHEME_FEE}</Btn>}
      <div className="h-2.5" />
      <Btn v="outline" onClick={() => { toast('Opening official website…'); window.open(s.url, '_blank') }}>Apply yourself · free</Btn>
      <Btn v="ghost" onClick={onClose}>{closeLabel}</Btn>
    </Sheet>
  )
}

// ===== Results =====
const optionLabel = (q, v) => q.opts.find(o => String(o[0]) === String(v))?.[1]

export function Schemes() {
  const s = useApp()
  const { go } = useNav()
  const sp = s.schemeProfile || {}
  const all = eligibleSchemes(sp)
  const found = all.filter(x => x.status !== 'locked'), locked = all.filter(x => x.status === 'locked')
  const inCart = cartApps().length
  if (!quizDone()) return <Navigate to="/schemes/start" replace />
  return (
    <Screen play title="Government schemes" right={
      <IconBtn label="Cart" className="relative" onClick={() => go('/schemes/cart')}>🛒
        {inCart > 0 && <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-gold-500 text-[11px] font-bold text-teal-950">{inCart}</span>}
      </IconBtn>}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <b className="font-display text-xl text-teal-900">✅ {found.length} scheme{found.length !== 1 && 's'} for you</b>
          <p className="text-[12px] text-muted">{locked.length > 0 && `🔒 ${locked.length} more to unlock · `}Central + {sp.LiveState}</p>
        </div>
        <button onClick={() => go('/schemes/start', { state: { mode: 'edit' } })} className="rounded-full bg-card px-3 py-1.5 text-[12px] font-bold text-teal-700 shadow-card">✏️ Edit answers</button>
      </div>
      <UnlockCard locked={locked} go={go} />
      {!found.length && <Empty icon="🔍">No matching schemes yet.</Empty>}
      {found.map(x => <SchemeCard key={x.name} s={x} onApply={() => go('/schemes/apply/' + encodeURIComponent(x.name))} go={go} />)}
    </Screen>
  )
}

// The next question that can unlock something, answered right here.
// Locked schemes left → one button back into the question screen (questions are only ever asked there).
function UnlockCard({ locked, go }) {
  if (!locked.length) return null
  const names = locked.map(s => s.icon + ' ' + s.name)
  return (
    <button onClick={() => go('/schemes/start', { state: { quiz: true } })}
      className="press mb-3 flex w-full items-center gap-3 rounded-3xl border-2 border-gold-500 bg-gold-100 p-3.5 text-left shadow-[0_4px_0_var(--color-gold-400)] [--edge:var(--color-gold-400)]">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-500 text-2xl">🔒</span>
      <span className="min-w-0 flex-1">
        <b className="block font-display text-[17px] font-semibold text-ink">Unlock {locked.length} more schemes</b>
        <span className="block truncate text-[12px] font-bold text-gold-600">{names.slice(0, 2).join(', ')}{names.length > 2 && ` +${names.length - 2} more`}</span>
      </span>
      <span className="font-display text-[15px] text-sky-700">Answer</span>
    </button>
  )
}

function SchemeCard({ s, onApply, go }) {
  const paid = schemeApps().find(a => a.scheme === s.name && a.status === 'paid')
  const carted = schemeApps().find(a => a.scheme === s.name && a.status === 'cart')
  const docs = docsToAsk(s)
  return (
    <Card className="mb-3">
      <div className="flex gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-2xl"><SchemeIcon s={s} size="size-9" /></span>
        <div className="min-w-0 flex-1">
          <b className="block text-[15px] leading-snug">{s.name}</b>
          <p className="my-0.5 text-[13px] font-bold text-ok">{s.win}</p>
          <div className="flex flex-wrap gap-1.5">
            {s.status === 'yes' ? <Badge tone="ok">✅ Eligible</Badge> : <Badge tone="gold">🔎 May be eligible</Badge>}
            <Badge>{s.scope}</Badge>
          </div>
        </div>
      </div>
      <details className="group mt-3 rounded-2xl bg-page px-3 py-2 text-[12.5px] leading-relaxed">
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-teal-700">Details & documents<span className="text-[10px] transition group-open:rotate-180">▼</span></summary>
        <p className="mt-2">{s.desc}</p>
        <p className="mt-1.5"><b>Also check:</b> {s.check}</p>
        <b className="mt-2 block">📄 Documents needed</b>
        {docs.length ? <ul className="mt-1 list-disc pl-5">{docs.map(d => <li key={d}>{d}</li>)}</ul> : <p>None — we already have what's needed.</p>}
      </details>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div><Btn v="outline" size="sm" onClick={() => { toast('Opening official website…'); window.open(s.url, '_blank') }}>Apply yourself</Btn><p className="mt-1 text-[11px] text-muted">Free</p></div>
        <div>
          {paid ? <><Btn v="outline" size="sm" disabled>Applied ✓</Btn><p className="mt-1 text-[11px] text-muted">{paid.docsMissing.length ? 'Documents pending' : 'Complete'}</p></>
            : carted ? <><Btn v="gold" size="sm" onClick={() => go('/schemes/cart')}>In cart 🛒</Btn><p className="mt-1 text-[11px] text-muted">Tap to pay</p></>
              : <><Btn size="sm" onClick={onApply}>Apply via Neev</Btn><p className="mt-1 text-[11px] text-muted">₹{SCHEME_FEE}</p></>}
        </div>
      </div>
    </Card>
  )
}

// ===== Application form (full page /schemes/apply/:name): Aadhaar + answers prefilled;
// new fields ONLY from the scheme's confirmed official form =====
export function SchemeApply() {
  const name = decodeURIComponent(useParams().name)
  const { go, back } = useNav()
  const sch = findScheme(name)
  const A = spResolve(S.schemeProfile || {})
  const fields = (SCHEME_FORM[name]?.fields || []).map((f, i) => ({ ...f, i })).filter(f => !f.if || f.if(A))
  const existing = openAppFor(name) // editing from the cart → keep what was filled
  const [vals, setVals] = useState(() => Object.fromEntries(fields.filter(f => existing?.formData?.[f.l]).map(f => [f.i, existing.formData[f.l]])))
  const [mobile, setMobile] = useState(existing?.mobile || S.mobile || '')
  const [address, setAddress] = useState(existing?.address || S.currentAddress || S.address || '')
  const [docs, setDocs] = useState(() => ({ ...existing?.docs }))
  const [added, setAdded] = useState(false)
  useEffect(() => { update({ schemeClickedName: name }); trackFunnel('schemeClicked') }, [name]) // sales dashboard: which scheme they tapped
  if (!sch) return <Screen play title="Apply" back="/schemes"><Empty icon="🔍">Scheme not found for your state.</Empty></Screen>

  // First interaction = "started filling": creates a draft application (manager sees it as Incomplete).
  const started = () => {
    trackFunnel('formStarted')
    if (!openAppFor(name)) update(st => { st.schemeApplications = [...(st.schemeApplications || []), { id: 'APP' + Date.now(), createdAt: new Date().toISOString(), scheme: name, status: 'draft' }] })
  }
  const set = (i, v) => { setVals(x => ({ ...x, [i]: v })); started() }
  const upload = d => {
    started()
    setDocs(x => ({ ...x, [d]: 'uploading' }))
    setTimeout(() => setDocs(x => ({ ...x, [d]: true })), 900)
  }
  const submit = () => {
    const data = {}
    for (const f of fields) {
      const v = (vals[f.i] || '').trim()
      if (!v) { if (f.opt) continue; toast('Please fill: ' + f.l); return }
      if (f.re && !f.re.test(v.replace(/\s/g, ''))) { toast(f.err || 'Check: ' + f.l); return }
      if (f.min && !(+v >= f.min)) { toast(f.err || `${f.l} must be at least ${f.min}`); return }
      if (f.must && v !== (f.must === 'yes' ? 'Yes' : 'No')) { toast(`This scheme needs: ${f.l.replace(/\?$/, '')} — ${f.must === 'yes' ? 'Yes' : 'No'}. Please check with your agent.`); return }
      data[f.l] = v
    }
    if (!RE_MOB.test(mobile)) { toast('Enter a valid 10-digit mobile number'); return }
    if (!address.trim()) { toast('Enter your current address'); return }
    if (Object.values(docs).includes('uploading')) { toast('Please wait for the upload to finish'); return }
    started()
    const docMap = Object.fromEntries(sch.docs.map(d => [d, docOnFile(d, name) ? 'on-file' : !!docs[d]]))
    update(() => Object.assign(openAppFor(name), { status: 'cart', cartAt: new Date().toISOString(), mobile, address: address.trim(), formData: data,
      docs: docMap, docsMissing: sch.docs.filter(d => !docMap[d]), state: S.schemeProfile?.LiveState }))
    trackFunnel('cartAdded')
    setAdded(true)
  }

  if (added) return (
    <Screen play title="" back="/schemes" footer={<><Btn onClick={() => go('/schemes/cart', { replace: true })}>Go to cart</Btn><Btn v="ghost" onClick={() => go('/schemes', { replace: true })}>Add more schemes</Btn></>}>
      <div className="flex flex-col items-center pt-10 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-gold-500 text-5xl shadow-[0_6px_0_var(--color-gold-400)] animate-pop">🛒</span>
        <h2 className="mt-4 text-[28px] text-ink">Added to cart</h2>
        <p className="mt-1 max-w-72 text-[14px] font-bold text-muted">{name} is in your cart.{cartApps().length > 1 && ` ${cartApps().length} schemes in total.`}</p>
      </div>
    </Screen>
  )
  const onFile = sch.docs.filter(d => docOnFile(d, name)), ask = sch.docs.filter(d => !docOnFile(d, name))
  const pan = S.panNumber || S.schemePan
  const answers = SP_QUESTIONS.filter(q => q.f !== 'AnyTaxGovt' && A[q.f] !== undefined)
  return (
    <Screen play title="Apply" onBack={() => back('/schemes')} footer={<Btn onClick={submit}>Add to cart 🛒 · ₹{SCHEME_FEE}</Btn>}>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gold-500 text-3xl shadow-[0_4px_0_var(--color-gold-400)]"><SchemeIcon s={sch} size="size-10" /></span>
        <div><h2 className="text-[21px] leading-tight text-ink">{name}</h2><p className="text-[13px] font-extrabold text-ok">{sch.win}</p></div>
      </div>
      <details className="group mb-4 rounded-2xl border-2 border-ok/30 bg-ok-100 px-3.5 py-2.5 text-[12.5px]">
        <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold text-ok">✅ Already filled from your Aadhaar & answers<span className="text-[10px] transition group-open:rotate-180">▼</span></summary>
        <div className="mt-2">
          <Row k="Name" v={S.name} /><Row k="Gender" v={S.gender} /><Row k="Date of birth" v={S.dob} />
          <Row k="Aadhaar" v={'XXXX XXXX ' + (S.aadhaar || '').replace(/\s/g, '').slice(-4)} />
          {pan && <Row k="PAN" v={'XXXXXX' + pan.slice(-4)} />}
          <Row k="State you live in" v={A.LiveState} />
          {answers.map(q => <Row key={q.f} k={q.q.replace(/\?.*$/, '')} v={optionLabel(q, A[q.f])} />)}
          <button className="mt-2 font-bold text-sky-700" onClick={() => go('/schemes/start', { state: { mode: 'edit' } })}>Something wrong? Edit answers</button>
        </div>
      </details>

      <Card className="mb-4">
        <h3 className="mb-3 text-[18px] text-ink">✏️ A few details</h3>
        {fields.map(f => (
          <div key={f.i} className="mb-3">
            <Label opt={f.opt}>{f.l}</Label>
            {f.t === 'yn' || f.t === 'sel' ? (
              <div className="grid grid-cols-2 gap-2">{(f.t === 'yn' ? ['Yes', 'No'] : f.o).map(o => <Chip key={o} className="py-2.5" sel={vals[f.i] === o} onClick={() => set(f.i, o)}>{o}</Chip>)}</div>
            ) : <input type={f.t} inputMode={f.t === 'tel' ? 'numeric' : undefined} placeholder={f.ph || ''} value={vals[f.i] || ''} onChange={e => set(f.i, e.target.value)} className={playInputCls} />}
            {f.hint && <p className="mt-1 text-[11px] text-muted">{f.hint}</p>}
          </div>
        ))}
        <div className="mb-3"><Label>Mobile number</Label><input type="tel" inputMode="numeric" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} className={playInputCls} /></div>
        <div><Label>Current address</Label><input value={address} onChange={e => setAddress(e.target.value)} className={playInputCls} /></div>
      </Card>

      <Card>
        <h3 className="mb-1 text-[18px] text-ink">📎 Documents</h3>
        {onFile.length > 0 && <p className="mb-2 text-[12.5px] font-bold text-ok">✓ Already with us: {onFile.join(', ')}</p>}
        {ask.length > 0 && <p className="mb-2 text-[12px] text-muted">You can also upload later.</p>}
        {ask.map(d => (
          <div key={d} className="mt-2 flex items-center justify-between gap-2 rounded-2xl border-2 border-line bg-page px-3 py-2.5 text-[13px] font-bold">
            <span>{docs[d] === true ? '✅' : '📄'} {d}</span>
            {docs[d] === 'uploading' ? <b className="text-[12px] text-muted">Uploading…</b>
              : docs[d] ? <button className="text-[12px] font-extrabold text-bad" onClick={() => setDocs(x => { const n = { ...x }; delete n[d]; return n })}>Remove</button>
                : <button className="press shrink-0 rounded-xl border-2 border-line bg-card px-2.5 py-1 text-[12px] font-extrabold text-sky-700 shadow-card" onClick={() => upload(d)}>📷 Upload</button>}
          </div>
        ))}
      </Card>
    </Screen>
  )
}

// ===== Cart: ₹49 per scheme, one payment for all =====
export function SchemeCart() {
  useApp()
  const { go } = useNav()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const items = cartApps()
  const total = items.length * SCHEME_FEE
  const pay = () => {
    setBusy(true)
    setTimeout(() => {
      const now = new Date().toISOString(), ref = 'NEEVSCH' + Date.now().toString().slice(-8)
      update(() => items.forEach(a => Object.assign(a, { status: 'paid', paidAt: now, amount: SCHEME_FEE, paymentRef: ref })))
      trackFunnel('paid')
      addNotification(`Payment of ₹${total} received for ${items.length} scheme application${items.length > 1 ? 's' : ''}. Ref: ${ref}`)
      setResult({ items, total, ref })
      setBusy(false)
    }, 1500)
  }
  if (result) {
    const pending = result.items.filter(a => a.docsMissing.length)
    return (
      <Screen play title="Your cart" back="/schemes" footer={<Btn onClick={() => go('/schemes', { replace: true })}>Back to schemes</Btn>}>
        <div className="flex flex-col items-center pt-6 pb-4 text-center">
          <div className="mb-3 grid size-20 place-items-center rounded-full bg-ok text-4xl text-white animate-pop">✓</div>
          <h2 className="text-2xl font-bold text-teal-900">Paid ₹{result.total}</h2>
          <p className="font-mono text-[12px] text-muted">Ref: {result.ref}</p>
        </div>
        <Card>{result.items.map(a => <Row key={a.id} k={a.scheme} v={<span className={a.docsMissing.length ? 'text-gold-600' : 'text-ok'}>{a.docsMissing.length ? 'Documents missing' : 'Complete'}</span>} />)}</Card>
        <p className="mt-3 text-[12.5px] text-muted">{pending.length ? 'Upload the missing documents to move forward. Our team will contact you.' : 'Our team will file your applications and keep you updated.'}</p>
      </Screen>
    )
  }
  return (
    <Screen play title="Your cart" back="/schemes" footer={items.length > 0 && <>
      <div className="mb-2 flex items-baseline justify-between"><span className="text-[13px] text-muted">{items.length} scheme{items.length !== 1 && 's'} × ₹{SCHEME_FEE}</span><b className="font-display text-2xl text-teal-900">₹{total}</b></div>
      <Btn disabled={busy} onClick={pay}>{busy ? 'Processing payment…' : `Pay ₹${total} via UPI`}</Btn>
    </>}>
      {items.length ? items.map(a => {
        const sch = findScheme(a.scheme) || { icon: '📄' }
        return (
          <Card key={a.id} className="mb-2.5 flex gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-xl"><SchemeIcon s={{ ...sch, name: a.scheme }} size="size-8" /></span>
            <div className="min-w-0 flex-1">
              <b className="block text-[14px]">{a.scheme}</b>
              <p className={`my-1 text-[12px] ${a.docsMissing.length ? 'text-gold-600' : 'text-ok'}`}>
                {a.docsMissing.length ? `⚠️ ${a.docsMissing.length} document${a.docsMissing.length > 1 ? 's' : ''} missing: ${a.docsMissing.join(', ')}` : '✅ All documents uploaded'}
              </p>
              <div className="flex gap-4 text-[12px] font-bold">
                <button className="text-teal-700" onClick={() => go('/schemes/apply/' + encodeURIComponent(a.scheme))}>Edit</button>
                <button className="text-bad" onClick={() => update(() => { a.status = 'draft' })}>Remove</button>
              </div>
            </div>
            <b className="text-[14px]">₹{SCHEME_FEE}</b>
          </Card>
        )
      }) : <Empty icon="🛒">Your cart is empty. Add schemes from your eligible list.</Empty>}
      <p className="mt-2 text-[11.5px] text-muted">Neev service fee for preparing and filing your applications. Govt schemes themselves are free.</p>
      <div className="h-2" />
      <Btn v="outline" onClick={() => go('/schemes')}>Add more schemes</Btn>
    </Screen>
  )
}

// Splash (language) → phone OTP → home. Login with mobile + PIN. Optional PIN setup. Bank (penny drop).
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { S, addNotification, findAccount, fmt, openModal, replaceState, resetAllData, toast, update, useApp } from '../store.js'
import { LANGS, t } from '../lib/i18n.js'
import { Btn, Card, Check, Field, Label, Otp, Screen, useNav } from '../ui.jsx'

export function Splash() {
  const s = useApp()
  useEffect(() => { openModal('lang') }, [])
  const lang = LANGS.find(l => l.code === (s.voiceMode ? 'voice' : s.voiceLang))
  const { go } = useNav()
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-teal-900 to-teal-950 px-6 pb-8 text-white">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-5 grid size-24 place-items-center rounded-[28px] bg-white/10 ring-1 ring-white/20 animate-pop">
          <span className="font-display text-5xl font-extrabold text-gold-500">न</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Neev</h1>
        <p className="mt-2 text-[15px] text-teal-100/80">{t('Get your earned salary early. No waiting till month end.')}</p>
      </div>
      <button onClick={() => openModal('lang')} className="mb-3 flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-left ring-1 ring-white/15">
        <span className="text-2xl">🌐</span>
        <span className="flex-1"><b className="block">{lang?.native}</b><span className="text-[12px] text-teal-100/80">Voice & language</span></span>
        <span className="text-[13px] font-semibold text-gold-500">Change →</span>
      </button>
      <Btn v="gold" onClick={() => go('/signup')}>Get started</Btn>
    </div>
  )
}

export function Signup() {
  const { go } = useNav()
  const [mobile, setMobile] = useState('')
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(30)
  useEffect(() => {
    if (!sent || timer <= 0) return
    const id = setTimeout(() => setTimer(timer - 1), 1000)
    return () => clearTimeout(id)
  }, [sent, timer])

  const send = () => {
    if (!/^\d{10}$/.test(mobile)) { toast('Enter a 10-digit mobile number'); return }
    if (findAccount(mobile)) { toast('You already have an account. Please log in.'); go('/login', { state: { mobile } }); return }
    setSent(true); setTimer(30)
    toast('OTP sent to ' + mobile)
  }
  const verify = () => {
    if (otp.length < 4) { toast('Enter the 4-digit OTP'); return }
    replaceState({ mobile, custId: parseInt(mobile.slice(-4)) || 1000, name: 'User', signupAt: new Date().toISOString(),
      voiceLang: S.voiceLang, voiceMode: S.voiceMode }) // "downloaded the app" for the manager funnel
    go('/home', { replace: true })
    toast('Welcome to Neev!')
  }
  return (
    <Screen title="" back="/">
      <div className="pt-4 pb-6 text-center">
        <div className="mx-auto mb-3 grid size-16 place-items-center rounded-3xl bg-teal-100 text-3xl">📱</div>
        <h2 className="text-2xl font-bold text-teal-900">Enter your mobile number</h2>
        <p className="mt-1 text-[13px] text-muted">We'll send you a one-time code</p>
      </div>
      <Card>
        <Label>Mobile number</Label>
        <div className="mb-3 flex items-center rounded-2xl border-2 border-line bg-card focus-within:border-teal-500">
          <span className="pl-4 pr-2 font-semibold text-muted">+91</span>
          <input type="tel" inputMode="numeric" maxLength={10} value={mobile} disabled={sent} autoFocus
            onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} placeholder="98XXXXXXXX"
            className="w-full bg-transparent py-3 pr-4 font-mono text-lg tracking-widest outline-none" />
        </div>
        {!sent ? <Btn onClick={send} disabled={mobile.length !== 10}>{t('Send OTP')}</Btn> : (
          <div className="animate-in">
            <Label>{t('Enter 4-digit OTP')}</Label>
            <Otp value={otp} onChange={setOtp} autoFill />
            <p className="mb-3 text-center text-[12px] text-muted">
              {timer > 0 ? <>Resend OTP in <b>{timer}s</b></> : <button className="font-bold text-teal-700" onClick={send}>Resend OTP</button>}
            </p>
            <Btn v="dark" onClick={verify} disabled={otp.length < 4}>Verify</Btn>
          </div>
        )}
      </Card>
      <p className="mt-5 text-center text-[13px] text-muted">Already have an account? <button className="font-bold text-teal-700" onClick={() => go('/login')}>{t('Log in')}</button></p>
      <p className="mt-4 text-center text-[12px] text-muted">Demo device? <button className="font-bold text-bad" onClick={() => {
        if (confirm('This deletes every saved account on this device. Continue?')) { resetAllData(); toast('All data cleared') }
      }}>Clear all data</button></p>
    </Screen>
  )
}

export function Login() {
  const { go } = useNav()
  const prefill = useLocation().state?.mobile || ''
  const [mobile, setMobile] = useState(prefill)
  const [pin, setPin] = useState('')
  const login = () => {
    if (!/^\d{10}$/.test(mobile)) { toast('Enter a 10-digit mobile number'); return }
    const profile = findAccount(mobile)
    if (!profile) { toast("This number isn't registered yet. Please sign up."); go('/signup'); return }
    if (pin.length < 4) { toast(profile.pin ? 'Enter your 4-digit PIN' : 'Enter any 4-digit OTP'); return }
    if (profile.pin && pin !== profile.pin) { toast('Incorrect PIN. Please try again.'); setPin(''); return }
    replaceState(profile)
    go('/home', { replace: true })
  }
  const soon = what => openModal('soon', `${what} login is coming soon. Please use your PIN for now.`)
  return (
    <Screen title="Log in" back="/signup">
      <p className="mb-4 text-[13px] text-muted">Use your mobile number and PIN.</p>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <button onClick={() => soon('Face ID')} className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-card p-4 text-[13px] font-semibold shadow-card"><span className="text-2xl">😊</span>Face</button>
        <button onClick={() => soon('Fingerprint')} className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-card p-4 text-[13px] font-semibold shadow-card"><span className="text-2xl">👆</span>Fingerprint</button>
      </div>
      <Card>
        <Field label="Mobile number" type="tel" inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} />
        <Label>Enter 4-digit PIN</Label>
        <Otp value={pin} onChange={setPin} secret />
        <div className="h-2" />
        <Btn onClick={login}>{t('Log in')}</Btn>
      </Card>
    </Screen>
  )
}

export function SetupPin() {
  const { go } = useNav()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirm] = useState('')
  const save = () => {
    if (pin.length < 4) { toast('Enter a 4-digit PIN'); return }
    if (pin !== confirmPin) { toast('PINs do not match. Try again.'); setPin(''); setConfirm(''); return }
    update({ pin })
    toast('PIN set! Use it to log in from now on.')
    go('/home', { replace: true })
  }
  return (
    <Screen title="Create your PIN">
      <div className="py-4 text-center"><div className="mx-auto grid size-16 place-items-center rounded-3xl bg-teal-100 text-3xl">🔒</div></div>
      <Card>
        <Label>Enter a 4-digit PIN</Label><Otp value={pin} onChange={setPin} secret />
        <div className="h-3" />
        <Label>Confirm PIN</Label><Otp value={confirmPin} onChange={setConfirm} secret />
        <div className="h-3" />
        <Btn onClick={save}>Set PIN</Btn>
      </Card>
    </Screen>
  )
}

// Penny-drop bank verification. Opened by requireBank() when an action needs money to move; returns there after.
export function BankSetup() {
  const { back } = useNav()
  const [acc, setAcc] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [allow, setAllow] = useState(false)
  const [state, setState] = useState('form') // form | sending | done
  const verify = () => {
    if (acc.length < 8) { toast('Enter a valid account number'); return }
    if (ifsc.length < 11) { toast('Enter a valid IFSC code'); return }
    setState('sending')
    setTimeout(() => {
      update({ bankLast4: acc.slice(-4), bankName: ifsc.slice(0, 4).toUpperCase() })
      addNotification('Bank account verified. You can now receive money from Neev.')
      setState('done')
      setTimeout(() => back('/home'), 900)
    }, 1500)
  }
  return (
    <Screen title="Bank account">
      <p className="mb-4 text-[13px] text-muted">{t('This is where we send your money. We verify by sending Re.1 to your account.')}</p>
      {state === 'done' ? (
        <Card className="text-center"><div className="text-4xl animate-pop">✅</div><b className="mt-2 block">Bank verified!</b>
          <p className="text-[13px] text-muted">{S.bankName} account ending {S.bankLast4}</p></Card>
      ) : (
        <Card>
          <Field label="Account number" inputMode="numeric" value={acc} onChange={e => setAcc(e.target.value.replace(/\D/g, ''))} placeholder="Enter account number" />
          <Field label="IFSC code" maxLength={11} value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" />
          <div className="mb-4"><Check checked={allow} onChange={e => setAllow(e.target.checked)}>Allow penny-drop: we send {fmt(1)} to confirm this account.</Check></div>
          <Btn disabled={!allow || state === 'sending'} onClick={verify}>{state === 'sending' ? `Sending ₹1 to ****${acc.slice(-4)}…` : 'Verify account'}</Btn>
        </Card>
      )}
    </Screen>
  )
}

// Wrap any money-moving action: asks for a bank account first if none is on file.
export function requireBank(go, next) {
  if (S.bankLast4) { next(); return }
  toast('Add a bank account first — needed to send or receive money.')
  go('/bank')
}

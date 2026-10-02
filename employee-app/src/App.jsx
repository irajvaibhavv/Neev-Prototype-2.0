import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { S, closeModal, openModal, update, useApp, useUi, toast } from './store.js'
import { LANGS, t } from './lib/i18n.js'
import { Btn, Field, Sheet, SheetHead } from './ui.jsx'
import { Splash, Signup, Login, SetupPin, BankSetup } from './screens/Auth.jsx'
import { Home, Notifications, Profile, Documents, Grievance, Referral, Loyalty } from './screens/Home.jsx'
import { EmployerSetup, NotPartnered, Kyc, Permissions, BankStatement, LoansHub, Apply, Kfs, LoanSuccess, Ledger, LoanDetail, History } from './screens/Loans.jsx'
import { Insurance, InsurancePlans, InsuranceCheckout, Invest, InvestGold, InvestMf, InvestMfCheckout, Bbps, BbpsPay, Scan, Done } from './screens/Money.jsx'
import { SchemeQuiz, Schemes, SchemeCart, SchemeApply } from './screens/Schemes.jsx'

const PUBLIC = ['/', '/signup', '/login']
const TABS = ['/home', '/ledger']

export default function App() {
  const s = useApp()
  const { pathname } = useLocation()
  const loggedIn = !!s.mobile
  if (!loggedIn && !PUBLIC.includes(pathname)) return <Frame><Navigate to="/" replace /></Frame>
  return (
    <Frame tabs={loggedIn && TABS.includes(pathname)}>
      <Routes>
        <Route path="/" element={loggedIn ? <Navigate to="/home" replace /> : <Splash />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pin" element={<SetupPin />} />
        <Route path="/bank" element={<BankSetup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/grievance" element={<Grievance />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/employer" element={<EmployerSetup />} />
        <Route path="/not-partnered" element={<NotPartnered />} />
        <Route path="/kyc" element={<Kyc />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/bank-statement" element={<BankStatement />} />
        <Route path="/loans" element={<LoansHub />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/kfs" element={<Kfs />} />
        <Route path="/loan-success" element={<LoanSuccess />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/ledger/:idx" element={<LoanDetail />} />
        <Route path="/history" element={<History />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/insurance/:type" element={<InsurancePlans />} />
        <Route path="/insurance/:type/:idx" element={<InsuranceCheckout />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/invest/gold" element={<InvestGold />} />
        <Route path="/invest/mf" element={<InvestMf />} />
        <Route path="/invest/mf/:idx" element={<InvestMfCheckout />} />
        <Route path="/bbps" element={<Bbps />} />
        <Route path="/bbps/:type" element={<BbpsPay />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/done" element={<Done />} />
        <Route path="/schemes/start" element={<SchemeQuiz />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/schemes/cart" element={<SchemeCart />} />
        <Route path="/schemes/apply/:name" element={<SchemeApply />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Frame>
  )
}

function Frame({ children, tabs }) {
  return (
    <div className="flex min-h-full items-center justify-center gap-10 py-6 max-[500px]:py-0">
      <aside className="hidden max-w-60 text-[13px] leading-relaxed text-teal-50/85 xl:block">
        <b className="mb-2 block font-display text-lg text-gold-500">Neev · Employee App</b>
        Language → phone OTP → home in under a minute. Employer, KYC and bank are asked only when the user first takes an advance.
        <a href="../index.html" className="mt-4 block font-semibold text-gold-500 hover:underline">← All prototypes</a>
      </aside>
      <div className="phone shrink-0">
        <div className="phone-screen relative flex h-full flex-col overflow-hidden bg-page">
          <StatusBar />
          <div className="phone-notch absolute top-0 left-1/2 z-50 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-[#050505]" />
          <div className="relative min-h-0 flex-1">{children}</div>
          {tabs && <TabBar />}
          <Toast />
          <Modals />
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id) }, [])
  return (
    <div className="phone-status flex h-11 shrink-0 items-end justify-between px-7 pb-1.5 text-[13px] font-semibold">
      <span>{now.getHours() % 12 || 12}:{String(now.getMinutes()).padStart(2, '0')}</span>
      <span className="flex items-center gap-1.5 text-[11px]">●●●● 📶 🔋</span>
    </div>
  )
}

function TabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const tab = (to, label, path) => (
    <button onClick={() => navigate(to)} className={`flex flex-col items-center gap-0.5 pt-2.5 pb-2 text-[11px] font-semibold transition ${pathname === to ? 'text-teal-700' : 'text-muted'}`}>
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
      {t(label)}
    </button>
  )
  // Three equal columns; Scan is a filled pill inside the bar, in line with Home / Ledger.
  return (
    <nav className="grid shrink-0 grid-cols-3 items-center border-t border-line bg-card px-4 pb-3 shadow-[0_-4px_16px_rgb(18_36_32/.05)]">
      {tab('/home', 'Home', <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>)}
      <button onClick={() => navigate('/scan')} aria-label="Scan & Pay" className="flex flex-col items-center gap-0.5 pt-2 pb-2 text-[11px] font-semibold text-teal-700">
        <span className="grid h-8 w-12 place-items-center rounded-xl bg-teal-700 text-white shadow-[0_3px_8px_rgb(11_79_69/.3)] transition active:scale-90">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M7 12h10" /></svg>
        </span>
        {t('Scan & Pay')}
      </button>
      {tab('/ledger', 'Ledger', <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></>)}
    </nav>
  )
}

function Toast() {
  const { toast: msg } = useUi()
  if (!msg) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex justify-center px-6">
      <div className="rounded-2xl bg-teal-950/95 px-4 py-3 text-center text-[13px] font-medium text-white shadow-lift animate-in">{msg}</div>
    </div>
  )
}

// App-wide sheets opened from many screens via openModal(name).
function Modals() {
  const { modal } = useUi()
  const navigate = useNavigate()
  const name = modal?.name
  return (
    <>
      <Sheet open={name === 'care'} onClose={closeModal}>
        <SheetHead icon="🎧" title="Customer Care" sub="How would you like to reach us?" />
        <Btn onClick={() => { closeModal(); navigate('/grievance') }}>💬 Chat with us</Btn>
        <div className="h-2.5" />
        <Btn v="outline" onClick={() => openModal('support')}>📞 Call support</Btn>
      </Sheet>
      <Sheet open={name === 'support'} onClose={closeModal}>
        <SheetHead icon="📞" title="Calling Neev Support" sub="1800-XXX-XXXX · Available 8 AM to 8 PM" />
        <Btn v="outline" onClick={closeModal}>{t('Close')}</Btn>
      </Sheet>
      <Sheet open={name === 'soon'} onClose={closeModal}>
        <SheetHead icon="🚧" title="Coming soon" sub={modal?.data} />
        <Btn v="outline" onClick={closeModal}>{t('Close')}</Btn>
      </Sheet>
      {name === 'lang' && <LangSheet />}
      {name === 'name' && <NameSheet then={modal.data} />}
    </>
  )
}

function LangSheet() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const current = S.voiceMode ? 'voice' : S.voiceLang
  const pick = code => {
    update({ voiceLang: code === 'hi' ? 'hi' : 'en', voiceMode: code === 'voice' })
    closeModal()
    if (code === 'voice') toast("Voice mode on — tap 🔊 on any screen and we'll read it aloud.")
    if (pathname === '/') navigate('/signup')
  }
  return (
    <Sheet open onClose={closeModal}>
      <SheetHead icon="🗣️" title="Choose language" />
      {LANGS.map(l => (
        <button key={l.code} onClick={() => pick(l.code)}
          className={`mb-2.5 flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition active:scale-[.99] ${current === l.code ? 'border-teal-700 bg-teal-50' : 'border-line bg-card'}`}>
          <span className="grid h-9 w-11 place-items-center rounded-lg border border-line bg-card text-lg">{l.flag}</span>
          <span className="flex-1"><b className="block text-[15px]">{l.native}</b><span className="text-[12px] text-muted">{l.name}</span></span>
          {current === l.code && <span className="grid size-6 place-items-center rounded-full bg-teal-700 text-[12px] text-white">✓</span>}
        </button>
      ))}
    </Sheet>
  )
}

// Signup only captures the phone — employer matching needs the real name first.
function NameSheet({ then }) {
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const save = () => {
    const n = name.trim().replace(/\s+/g, ' ')
    if (n.length < 3 || !/^[A-Za-z .]+$/.test(n)) { toast('Enter your full name as on Aadhaar'); return }
    update({ name: n })
    closeModal()
    if (then) navigate(then)
  }
  return (
    <Sheet open onClose={closeModal}>
      <SheetHead icon="👤" title="What's your name?" sub="We match it with your employer's records." />
      <Field label="Full name (as on Aadhaar)" placeholder="e.g. Ramesh Kumar" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <Btn onClick={save}>{t('Continue')}</Btn>
      <Btn v="ghost" onClick={closeModal}>Later</Btn>
    </Sheet>
  )
}

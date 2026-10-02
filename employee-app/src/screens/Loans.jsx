// Salary advance. First advance: Employer → DigiLocker KYC (+consents, selfie) → Bank (Account Aggregator) → Loans hub
// → amount + reason → Key Fact Statement → T&C → e-Sign + e-NACH → money sent. Later advances skip what's done.
import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { S, addNotification, addPoints, fmt, initials, openModal, toast, update, useApp } from '../store.js'
import { AA_ACCOUNTS, APR, KNOWN_COMPANIES, KYC_CONSENTS, LOAN_PERMS, REASONS, charges, eligible, outstanding, tenureWeeks } from '../lib/data.js'
import { t } from '../lib/i18n.js'
import { Badge, Btn, Card, Check, Chip, Empty, Field, Item, Label, Otp, Row, Screen, Section, Sheet, SheetHead, Spinner, SuccessHero, Toggle, inputCls, useNav } from '../ui.jsx'
import { requireBank } from './Auth.jsx'

export function startEmployerSetup(go) {
  if (!S.name || S.name === 'User') { openModal('name', '/employer'); return }
  go('/employer')
}

// Progressive gate: route to the first missing step of the loan flow.
export function openLoansEntry(go) {
  if (!S.company) {
    if (S.signupCompany && !KNOWN_COMPANIES[S.signupCompany]) { go('/not-partnered'); return }
    update({ _fromLoans: true })
    startEmployerSetup(go)
    return
  }
  if (!S.panNumber) { go('/kyc'); return }
  if (!LOAN_PERMS.every(k => S.permissions[k])) { go('/permissions'); return }
  if (!S.bankStatementDone) { go('/bank-statement'); return }
  go('/loans')
}

// Where the user is in the first-advance setup (shown on the setup screens).
function FlowSteps({ at }) {
  const steps = ['Employer', 'KYC', 'Bank', 'Advance']
  return (
    <div className="mb-4 flex items-center gap-1.5">
      {steps.map((x, i) => (
        <div key={x} className="flex-1">
          <div className={`h-1.5 rounded-full ${i < at ? 'bg-teal-500' : i === at ? 'bg-gold-500' : 'bg-line'}`} />
          <p className={`mt-1 text-[10.5px] font-semibold ${i === at ? 'text-teal-900' : 'text-muted'}`}>{i < at ? '✓ ' : ''}{x}</p>
        </div>
      ))}
    </div>
  )
}

const UserStrip = () => (
  <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
    <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-teal-700 to-teal-500 font-display font-bold text-white">{initials(S.name)}</span>
    <span className="flex-1"><b className="block text-[14px]">{S.name}</b><span className="text-[12px] text-muted">{S.company}</span></span>
  </div>
)

// ===== Employer: company (or badge scan) → Employee ID → verified =====
export function EmployerSetup() {
  const s = useApp()
  const { go } = useNav()
  const preset = s.signupCompany && KNOWN_COMPANIES[s.signupCompany] ? s.signupCompany : ''
  const [company, setCompany] = useState(preset)
  const [ecn, setEcn] = useState('')
  const [state, setState] = useState('form') // form | checking | found
  const known = KNOWN_COMPANIES[company]

  const scanBadge = () => {
    toast('Scanning badge…')
    setTimeout(() => { if (!known) setCompany('BuildRight Constructions'); setEcn('ECN-48213'); toast('Badge scanned! Details auto-filled.') }, 1500)
  }
  const verify = () => {
    if (ecn.trim().length < 3) { toast('Enter your Employee ID'); return }
    setState('checking')
    setTimeout(() => {
      update(st => {
        st.company = company; st.ecn = ecn.trim()
        if (!st.salary) st.salary = [20000, 25000, 30000][Math.floor(Math.random() * 3)]
        if (!st.department) { st.department = known.dept; st.designation = known.desig; st.region = known.region }
        if (company === 'BuildRight Constructions') st.name = 'Ramesh Kumar' // demo: every BuildRight employee is Ramesh Kumar
      })
      setState('found')
    }, 1400)
  }
  useEffect(() => {
    if (state !== 'found') return
    const id = setTimeout(finish, 2600)
    return () => clearTimeout(id)
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps
  const finish = () => {
    toast('Employer verified!')
    if (S._fromLoans) { update({ _fromLoans: false }); go(S.panNumber ? '/permissions' : '/kyc', { replace: true }) }
    else go('/home', { replace: true })
  }

  if (state === 'found') return (
    <Screen title="Verify employment details">
      {s._fromLoans && <FlowSteps at={0} />}
      <SuccessHero title="Employee verified!">{s.name} · {s.designation}<br />🏢 {s.department} · {s.region}</SuccessHero>
      <Btn onClick={finish}>{t('Continue')}</Btn>
    </Screen>
  )
  return (
    <Screen title="Verify employment details">
      {s._fromLoans && <FlowSteps at={0} />}
      {state === 'checking' ? <Spinner text={`Verifying with ${company}…`} /> : <>
        {!preset && <>
          <Label>Where do you work?</Label>
          <select value={company} onChange={e => setCompany(e.target.value)} className={`${inputCls} mb-3`}>
            <option value="">Select your company</option>
            {Object.keys(KNOWN_COMPANIES).map(c => <option key={c}>{c}</option>)}
            <option value="other">Other (not listed)</option>
          </select>
        </>}
        {company === 'other' && (
          <Card className="mb-3 border-bad-100 bg-bad-100/50">
            <b className="text-[13.5px] text-bad">Your company hasn't tied up with Neev yet</b>
            <p className="mt-1 text-[12px] text-muted">Tell us about it — or scan your badge.</p>
            <Btn v="outline" size="sm" className="mt-3" onClick={() => go('/not-partnered')}>Add company name →</Btn>
          </Card>
        )}
        {company && <Item icon="📷" title="Scan your employee badge" sub="Auto-fill company and Employee ID" onClick={scanBadge} />}
        {known && (
          <Card className="animate-in">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl font-display text-lg font-bold text-white" style={{ background: known.color }}>{known.initial}</span>
              <b className="text-[14px]">{company}</b>
            </div>
            <Field label="Employee ID" placeholder="e.g. ECN-48213" value={ecn} onChange={e => setEcn(e.target.value)} autoFocus />
            <Btn onClick={verify}>Verify</Btn>
          </Card>
        )}
      </>}
    </Screen>
  )
}

export function NotPartnered() {
  const s = useApp()
  const { go } = useNav()
  const [f, setF] = useState({ company: s.signupCompany || '', name: '', phone: '', email: '' })
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = () => {
    if (!f.company.trim()) { toast('Please enter your company name'); return }
    if (!f.name.trim()) { toast('Please enter your manager / HR name'); return }
    if (!/^\d{10}$/.test(f.phone)) { toast('Please enter a valid phone number'); return }
    update({ signupCompany: f.company.trim(), hrReferral: { name: f.name.trim(), phone: f.phone, email: f.email.trim(), company: f.company.trim() } })
    toast("Thanks! We'll reach out to your company")
    setTimeout(() => go('/home', { replace: true }), 1000)
  }
  return (
    <Screen title="Salary advance">
      <div className="py-4 text-center">
        <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-gold-100 text-3xl">🏢</div>
        <h2 className="text-xl font-bold text-teal-900">We're not with {f.company.trim() || 'your company'} yet</h2>
        <p className="mx-auto mt-1 max-w-72 text-[13px] text-muted">Share your HR or manager's details and we'll reach out.</p>
      </div>
      <Card>
        <Field label="Your company name" placeholder="e.g. Sharma Logistics" value={f.company} onChange={set('company')} />
        <Field label="Manager / HR name" placeholder="e.g. Priya Sharma" value={f.name} onChange={set('name')} />
        <Field label="Phone number" type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} />
        <Field label="Email" opt placeholder="hr@company.com" value={f.email} onChange={set('email')} />
        <Btn onClick={submit}>Notify my company</Btn>
      </Card>
      <p className="mt-4 text-center text-[12px] text-muted">💡 You can still use insurance, investments & govt schemes</p>
    </Screen>
  )
}

// ===== KYC: DigiLocker (Aadhaar + PAN) → consents → selfie =====
export function Kyc() {
  const s = useApp()
  const { go } = useNav()
  const [step, setStep] = useState('connect') // connect | fetching | details | consents | selfie | matching | done
  const allOn = KYC_CONSENTS.every(c => s.permissions[c.key])
  const open = () => {
    setStep('fetching')
    setTimeout(() => { update(st => { st.aadhaar = st.aadhaar || '1234 5678 9012'; st.name = st.name && st.name !== 'User' ? st.name : 'Ramesh Kumar' }); setStep('details') }, 2000)
  }
  const confirmDocs = () => { update({ panNumber: 'ABCDE1234F', panName: S.name }); toast('Documents verified via DigiLocker!'); setStep('consents') }
  const toggle = k => update(st => { st.permissions = { ...st.permissions, [k]: !st.permissions[k] } })
  const toggleAll = () => update(st => { st.permissions = { ...st.permissions, ...Object.fromEntries(KYC_CONSENTS.map(c => [c.key, !allOn])) } })
  const selfie = () => { setStep('matching'); setTimeout(() => { setStep('done'); toast('Face match successful!') }, 1500) }
  const finish = () => { toast('KYC complete!'); go('/bank-statement', { replace: true }) }

  return (
    <Screen title="KYC verification" back="/home">
      <FlowSteps at={1} />
      {step === 'connect' && <>
        <div className="py-4 text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#1A237E] to-[#3949AB] text-3xl">🔐</div>
          <h2 className="text-xl font-bold text-teal-900">Connect DigiLocker</h2>
          <p className="mt-1 text-[13px] text-muted">Fetch Aadhaar & PAN instantly. No photos needed.</p>
        </div>
        <Btn onClick={open}>📲 Open DigiLocker</Btn>
        <p className="mt-3 text-center text-[11px] text-muted">🛡️ Secured by DigiLocker · Ministry of Electronics & IT</p>
      </>}
      {step === 'fetching' && <Spinner text="Fetching documents from DigiLocker…" />}
      {step === 'details' && <div className="animate-in">
        <Card className="border-ok/30">
          <b className="mb-2 block text-[14px]">✅ Fetched from DigiLocker</b>
          <Row k="Name" v={s.name} /><Row k="PAN" v="ABCDE1234F" mono />
          <Row k="Aadhaar" v={'XXXX XXXX ' + s.aadhaar.replace(/\s/g, '').slice(-4)} mono /><Row k="Date of birth" v="15/03/1992" />
        </Card>
        <div className="h-3" /><Btn onClick={confirmDocs}>Confirm & continue</Btn>
        <Btn v="ghost" onClick={() => setStep('connect')}>Try again</Btn>
      </div>}
      {step === 'consents' && <div className="animate-in">
        <div className="mb-3 flex items-center justify-between">
          <b className="text-[15px] text-teal-900">Allow these to process your advance</b>
          <button onClick={toggleAll} className="text-[13px] font-bold text-teal-700">{allOn ? 'All allowed ✓' : 'Allow all'}</button>
        </div>
        {KYC_CONSENTS.map(c => (
          <div key={c.key} className="mb-2.5 flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-card">
            <span className="text-xl">{c.icon}</span>
            <span className="flex-1"><b className="block text-[14px]">{c.title}</b><span className="text-[12px] text-muted">{c.desc}</span></span>
            <Toggle on={s.permissions[c.key]} onClick={() => toggle(c.key)} label={c.title} />
          </div>
        ))}
        <div className="h-2" /><Btn disabled={!allOn} onClick={() => setStep('selfie')}>{t('Continue')}</Btn>
      </div>}
      {step === 'selfie' && <div className="animate-in text-center">
        <h2 className="mt-2 text-xl font-bold text-teal-900">Take a selfie</h2>
        <p className="mb-4 text-[13px] text-muted">We match it with your Aadhaar photo</p>
        <button onClick={selfie} className="mx-auto grid size-48 place-items-center rounded-full border-4 border-dashed border-teal-500 bg-teal-50 text-6xl transition active:scale-95">🤳</button>
        <p className="mt-3 text-[13px] font-semibold text-teal-700">Tap to capture</p>
      </div>}
      {step === 'matching' && <Spinner text="Matching your face…" icon="🤳" />}
      {step === 'done' && <><SuccessHero title="Face match successful!">Your identity is verified.</SuccessHero><Btn onClick={finish}>{t('Continue')}</Btn></>}
    </Screen>
  )
}

// Only reached if consents were turned off after KYC.
export function Permissions() {
  const s = useApp()
  const { go } = useNav()
  const PERMS = KYC_CONSENTS.filter(c => LOAN_PERMS.includes(c.key))
  const allOn = LOAN_PERMS.every(k => s.permissions[k])
  return (
    <Screen title="Loan consents" back="/home">
      <FlowSteps at={1} />
      {PERMS.map(c => (
        <div key={c.key} className="mb-2.5 flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-card">
          <span className="text-xl">{c.icon}</span>
          <span className="flex-1"><b className="block text-[14px]">{c.title}</b><span className="text-[12px] text-muted">{c.desc}</span></span>
          <Toggle on={s.permissions[c.key]} label={c.title} onClick={() => update(st => { st.permissions = { ...st.permissions, [c.key]: !st.permissions[c.key] } })} />
        </div>
      ))}
      <div className="h-2" />
      <Btn disabled={!allOn} onClick={() => go('/bank-statement', { replace: true })}>{t('Continue')}</Btn>
    </Screen>
  )
}

// ===== Bank: Account Aggregator consent + OTP → pick salary account =====
export function BankStatement() {
  const s = useApp()
  const { go } = useNav()
  const [agree, setAgree] = useState(false)
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(s.permissions.accountAggregator ? 'fetching' : 'consent') // consent | fetching | pick
  const [pick, setPick] = useState(AA_ACCOUNTS.findIndex(a => a.last4 === s.bankLast4))
  useEffect(() => {
    if (step !== 'fetching') return
    const id = setTimeout(() => setStep('pick'), 1300)
    return () => clearTimeout(id)
  }, [step])
  const verifyOtp = () => {
    if (otp.length < 4) { toast('Enter the 4-digit OTP'); return }
    update(st => { st.permissions = { ...st.permissions, accountAggregator: true } })
    setStep('fetching')
  }
  const finish = () => {
    const a = AA_ACCOUNTS[pick]
    update({ bsSelectedAccount: pick, bankName: a.bank, bankLast4: a.last4, bankStatementDone: true })
    toast('Bank account linked!')
    go('/loans', { replace: true })
  }
  return (
    <Screen title="Bank verification" back="/home">
      <FlowSteps at={2} />
      <UserStrip />
      {step === 'consent' && <>
        <div className="pb-4 text-center">
          <div className="mx-auto mb-2 grid size-14 place-items-center rounded-2xl bg-teal-100 text-3xl">🏦</div>
          <h2 className="text-xl font-bold text-teal-900">Link your bank account</h2>
          <p className="mx-auto mt-1 max-w-72 text-[12.5px] text-muted">RBI's Account Aggregator fetches your details securely. Read-only.</p>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="border-b border-line bg-teal-50 px-4 py-3 text-[12.5px] font-bold text-teal-900">🔒 Account Aggregator consent</div>
          <div className="p-4">
            <Check checked={agree} onChange={e => { setAgree(e.target.checked); if (e.target.checked) toast('OTP sent for AA consent') }}>I agree to share my financial data via Account Aggregator</Check>
            {agree && <div className="mt-3 animate-in">
              <p className="text-center text-[12px] text-muted">OTP sent to ****{s.mobile.slice(-4)}</p>
              <Otp value={otp} onChange={setOtp} autoFill />
              <Btn onClick={verifyOtp} disabled={otp.length < 4}>Verify & fetch accounts</Btn>
            </div>}
          </div>
        </Card>
        <p className="mt-3 text-center text-[11px] text-muted">🛡️ Regulated by RBI · 256-bit encrypted · Read-only</p>
      </>}
      {step === 'fetching' && <Spinner text="Fetching your bank accounts…" />}
      {step === 'pick' && <div className="animate-in">
        <Card className="mb-3 border-gold-500/40 bg-gold-100"><p className="text-[13px] text-[#5C4300]">💡 <b>Which account gets your salary?</b> Select it below.</p></Card>
        {AA_ACCOUNTS.map((a, i) => (
          <button key={a.last4} onClick={() => setPick(i)}
            className={`mb-2.5 flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${pick === i ? 'border-teal-700 bg-teal-50' : 'border-line bg-card'}`}>
            <span className="text-2xl">🏦</span>
            <span className="flex-1"><b className="block text-[14px]">{a.bank}</b><span className="font-mono text-[12px] text-muted">****{a.last4}</span></span>
            <span className={`grid size-6 place-items-center rounded-full border-2 text-[12px] ${pick === i ? 'border-teal-700 bg-teal-700 text-white' : 'border-line'}`}>{pick === i && '✓'}</span>
          </button>
        ))}
        <div className="h-1" /><Btn disabled={pick < 0} onClick={finish}>{t('Continue')}</Btn>
      </div>}
    </Screen>
  )
}

// ===== Loans hub =====
export function LoansHub() {
  const s = useApp()
  const { go } = useNav()
  const elig = eligible()
  const [amt, setAmt] = useState(Math.min(elig, 5000))
  const active = s.loans.find(l => l.status === 'Active')
  const lastAmt = s.loans[0]?.amount || 5000
  const deduction = outstanding()
  const getAdvance = a => { update({ _applyAmt: Math.max(1000, Math.min(a, elig)) }); go('/apply') }
  return (
    <Screen title="Loans">
      <UserStrip />
      <div className="mb-3 rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 p-5 text-white shadow-lift">
        {elig > 0 ? <>
          <p className="text-[13px] text-teal-100/80">You can withdraw up to</p>
          <b className="font-display text-4xl">{fmt(elig)}</b>
          <div className="mt-4 rounded-2xl bg-white/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] text-teal-100/80">Amount</span>
              <div className="flex items-center rounded-xl bg-white px-3 py-1.5 text-teal-900">
                <span className="font-mono font-semibold">₹</span>
                <input type="number" inputMode="numeric" value={amt} aria-label="Amount"
                  onChange={e => setAmt(Math.min(elig, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-20 bg-transparent text-right font-mono text-lg font-semibold outline-none" />
              </div>
            </div>
            <input type="range" min={1000} max={Math.max(1000, elig)} step={1000} value={amt} onChange={e => setAmt(+e.target.value)} aria-label="Withdraw amount" />
            <div className="mt-1 flex justify-between text-[11px] text-teal-100/70"><span>₹1,000</span><span>{fmt(elig)}</span></div>
          </div>
          <Btn v="gold" className="mt-4" disabled={amt < 1000} onClick={() => getAdvance(amt)}>{t('Get advance')} · {fmt(amt)}</Btn>
        </> : <div className="py-2 text-center">
          <div className="text-3xl">🔒</div>
          <b className="mt-1 block">{t('No advance available right now')}</b>
          <p className="text-[12.5px] text-teal-100/80">Your active advance covers your eligible amount.</p>
        </div>}
      </div>
      {s.t2eSigned && elig > 0 && (
        <Item icon="⚡" bg="bg-gold-100" title={`Quick repeat: ${fmt(Math.min(lastAmt, elig))}`} sub="Same as last time — one tap" onClick={() => { update({ _reason: 'personal' }); getAdvance(lastAmt); }} />
      )}
      {active && (
        <Card className="mb-3">
          <div className="flex items-center justify-between">
            <div><p className="text-[12px] text-muted">{t('Next repayment')}</p><b className="text-xl">{fmt(active.amount)}</b></div>
            <Badge tone="gold">{active.dueDate}</Badge>
          </div>
          <p className="mt-2 text-[12px] text-muted">{t('Auto-deducted from your salary. No action needed.')}</p>
        </Card>
      )}
      <Card className="mb-3">
        <Row k={s.company} v={`${fmt(s.salary)}/mo`} />
        <Row k="Next pay day" v={`${s.payDay}th Aug`} />
        {deduction > 0 && <Row k="Take-home after deduction" v={fmt(s.salary - deduction)} />}
      </Card>
      <Item icon="🏅" title="My repayment history" sub={s.loans.some(l => l.status === 'Repaid') ? 'On-time repayments raise your limit' : 'Build your track record'} onClick={() => go('/history')} />
      <Item icon="📋" bg="bg-gold-100" title="My loans" sub="Active & past advances" onClick={() => go('/ledger')} />
    </Screen>
  )
}

// ===== Amount + reason =====
export function Apply() {
  const s = useApp()
  const { go } = useNav()
  const elig = eligible()
  const amt = Math.min(s._applyAmt || 3000, Math.max(1000, elig))
  const c = charges(amt)
  const takehome = s.salary - outstanding() - amt
  const next = () => {
    if (!s._reason) { toast('Please pick a reason for the advance'); return }
    if (s._reason === 'other' && !(s._reasonOther || '').trim()) { toast('Please tell us your reason'); return }
    update({ selectedTenure: tenureWeeks(), esignConfirmed: false, enachConfirmed: false })
    go('/kfs')
  }
  return (
    <Screen title="Get advance" back="/loans" footer={<Btn onClick={next}>{t('Continue')}</Btn>}>
      <FlowSteps at={3} />
      <div className="text-center">
        <b className="font-mono text-5xl font-semibold text-teal-900">{fmt(amt)}</b>
        <p className="mt-1 text-[12px] text-muted">Max {fmt(elig)} (70% of earned salary)</p>
      </div>
      <div className="my-5"><input type="range" min={1000} max={Math.max(1000, elig)} step={1000} value={amt} onChange={e => update({ _applyAmt: +e.target.value })} aria-label="Advance amount" /></div>
      <Label>Why do you need it?</Label>
      <div className="mb-3 grid grid-cols-4 gap-2">
        {REASONS.map(([k, ic, l]) => <Chip key={k} sel={s._reason === k} icon={ic} className="px-1 text-[12px]" onClick={() => update({ _reason: k })}>{l}</Chip>)}
      </div>
      {s._reason === 'other' && <Field label="Please specify" placeholder="A few words" value={s._reasonOther || ''} onChange={e => update({ _reasonOther: e.target.value })} />}
      <Card>
        <Row k="Advance amount" v={fmt(amt)} />
        <Row k={`Service charge (₹15/1000 × ${c.weeks} wk${c.weeks > 1 ? 's' : ''})`} v={'−' + fmt(c.charge)} />
        <Row k="GST (18%)" v={'−' + fmt(c.gst)} />
        <Row k="Effective interest (annualised)" v={`${APR}% p.a.`} />
        <Row total k="You will receive" v={fmt(c.net)} />
      </Card>
      {takehome < s.salary * 0.3 && (
        <Card className="mt-3 border-bad/30 bg-bad-100"><b className="text-[13px] text-bad">⚠️ Low take-home</b>
          <p className="mt-1 text-[12.5px] text-bad">After this, your take-home will be {fmt(takehome)} — under 30% of your salary.</p></Card>
      )}
      <p className="mt-3 text-center text-[12px] text-muted">{t('Repaid from your salary on pay day. No separate payment.')}</p>
    </Screen>
  )
}

// ===== Key Fact Statement → T&C → e-Sign + e-NACH =====
const Fold = ({ title, open, children, className = '' }) => (
  <details open={open} className={`group mb-2.5 rounded-2xl border border-line bg-card px-4 py-3 shadow-card ${className}`}>
    <summary className="flex cursor-pointer list-none items-center justify-between text-[13.5px] font-semibold text-teal-700">{title}<span className="text-[11px] text-muted transition group-open:rotate-180">▼</span></summary>
    <div className="mt-2 text-[13px] leading-relaxed">{children}</div>
  </details>
)
export function Kfs() {
  const s = useApp()
  const { go } = useNav()
  const c = charges(Math.min(s._applyAmt || 3000, Math.max(1000, eligible())))
  const [agreed, setAgreed] = useState(false)
  const [sheet, setSheet] = useState(null) // tc | esign | enach
  const [repeat] = useState(S.t2eSigned) // signed before → this advance needs only an OTP
  const ready = agreed && s.esignConfirmed && s.enachConfirmed
  const confirmLoan = () => {
    const n = S.loans.length + 1
    const lan = `${S.custId}0${n}2026`, van = `NEEV00${S.custId}0${n}`
    const reason = S._reason === 'other' ? S._reasonOther.trim() : REASONS.find(r => r[0] === S._reason)?.[2] || ''
    const loan = { lan, van, amount: c.amt, charge: c.charge, gst: c.gst, net: c.net, tenure: c.weeks, reason, date: 'Today', dueDate: `${S.payDay}th Aug`, status: 'Active' }
    update(st => { st.t2eSigned = true; st.loans.unshift(loan); st._reason = ''; st._reasonOther = '' })
    addNotification(`Advance of ${fmt(c.net)} sent to ${S.bankName} ****${S.bankLast4}. LAN: ${lan}`)
    addNotification(`Reminder: ${fmt(c.amt)} will be deducted from your salary on ${S.payDay}th. Employer pays to VAN ${van}.`, false)
    addNotification(`Your employer ${S.company} has been notified about your advance and VAN.`, false)
    addPoints(10, 'Loan taken')
    go('/loan-success', { replace: true, state: { loan } })
  }
  return (
    <Screen title="Key Fact Statement" back="/apply"
      footer={<Btn v="dark" disabled={!ready} onClick={() => requireBank(go, confirmLoan)}>{repeat ? 'Confirm & get money' : t('E-sign & get money')}</Btn>}>
      <UserStrip />
      <p className="mb-3 text-[12px] text-muted">As per RBI digital lending rules, please review the full cost before you continue.</p>
      <Fold title="Loan details" open>
        <Row k="Advance amount" v={fmt(c.amt)} /><Row k="Tenure" v={`${c.weeks} week${c.weeks > 1 ? 's' : ''}`} />
        <Row k="Repayment date" v={`${s.payDay}th Aug`} /><Row k="Interest (1.5% per week)" v={'−' + fmt(c.charge)} />
        <Row k="Service charge" v={'−' + fmt(c.charge)} /><Row k="GST (18%)" v={'−' + fmt(c.gst)} />
        <Row k="Annualised cost (APR)" v={`${APR}% p.a.`} /><Row total k="You will receive" v={fmt(c.net)} />
      </Fold>
      <Fold title="Repayment">The full <b>{fmt(c.amt)}</b> is deducted from your salary by {s.company} on pay day and paid to Neev. No separate payment.</Fold>
      <Fold title="If repayment is delayed">A late fee of ₹15 per ₹1,000 per week applies until recovered, plus any bank bounce charges.</Fold>
      <Fold title="Your right to cancel (cooling-off)">Cancel within <b>24 hours</b> and repay only the {fmt(c.amt)} principal — no charges or GST.</Fold>
      <Fold title="Lender & grievance contact">
        <Row k="Regulated entity" v="Neev NBFC Pvt. Ltd." /><Row k="Grievance officer" v="Aarti Nair" /><Row k="Contact" v="grievance@neev.in" />
      </Fold>
      <Fold title="Disbursement account" open>
        <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-3">
          <span className="text-xl">🏦</span>
          <span className="flex-1"><b className="block">{s.bankName} ****{s.bankLast4}</b><span className="text-[12px] text-muted">Salary account</span></span>
          <span className="font-bold text-ok">✓</span>
        </div>
      </Fold>
      <Card className="border-teal-500/40">
        <Check checked={agreed} onChange={e => (e.target.checked ? setSheet('tc') : setAgreed(false))}>{t('I agree to the loan terms, E-NACH mandate, and repayment plan.')}</Check>
      </Card>
      {agreed && <div className="mt-2.5 grid grid-cols-2 gap-2.5 animate-in">
        {[['esign', s.esignConfirmed, '✍️', repeat ? 'Confirm with OTP' : 'E-Sign agreement'], ['enach', s.enachConfirmed, '🏦', 'E-NACH mandate']].map(([k, done, ic, l]) => (
          <button key={k} onClick={() => (done ? update({ [k + 'Confirmed']: false }) : setSheet(k))}
            className={`rounded-2xl border-2 p-3.5 text-left transition ${done ? 'border-ok bg-ok-100' : 'border-dashed border-teal-500 bg-card'}`}>
            <span className="text-xl">{done ? '✅' : ic}</span><b className="mt-1 block text-[13px]">{l}</b>
            <span className="text-[11px] text-muted">{done ? 'Done' : 'Tap to complete'}</span>
          </button>
        ))}
      </div>}
      {sheet === 'tc' && <TermsSheet onClose={() => setSheet(null)} onAccept={() => { setAgreed(true); setSheet(null) }} />}
      {sheet === 'esign' && <EsignSheet onClose={() => setSheet(null)} />}
      {sheet === 'enach' && <EnachSheet onClose={() => setSheet(null)} />}
    </Screen>
  )
}

const TERMS = [
  ['Nature of facility', 'A short-term salary advance by Neev NBFC Pvt. Ltd. (RBI-registered), against salary already earned, repaid via employer payroll deduction on the next pay day.'],
  ['Eligibility & verification', 'For salaried employees of employers partnered with Neev. Identity via Aadhaar e-KYC, PAN and employer records (Employee Code Number); salary confirmed through the employer HRMS.'],
  ['Amount & tenure', 'Limited to a share of net earned salary this pay cycle. Tenure runs to the next pay day (1–4 weeks). The limit may grow with on-time repayments.'],
  ['Charges & fees', '₹15 per ₹1,000 per week plus 18% GST on the charge. APR is shown in the Key Fact Statement before every advance. No hidden charges, no prepayment penalty.'],
  ['Repayment & recovery', 'The employer deducts principal + charges + GST on pay day and pays Neev via your Virtual Account Number. If the employer delays, E-NACH is the backup. Late payment continues the service charge plus bank bounce charges.'],
  ['Loan agreement', 'The agreement between you and Neev governs the advance, repayment and salary deduction. Signed electronically via Aadhaar e-Sign.'],
  ['E-NACH mandate', 'You authorise an auto-debit mandate on your bank account, used only if salary deduction fails.'],
  ['Cooling-off period', 'Cancel within 24 hours of disbursement and repay only the principal — no service charge or GST.'],
  ['Data privacy & consent', 'Aadhaar, PAN, bank and employment data is used only for credit assessment and servicing, per the IT Act 2000 and RBI Digital Lending Guidelines (Sept 2022). Account Aggregator data is encrypted end to end.'],
  ['Grievance redressal', 'Raise complaints in the app or at grievance@neev.in. The Grievance Officer (Aarti Nair) replies within 30 days; unresolved cases can go to the RBI Integrated Ombudsman (cms.rbi.org.in).'],
  ['Governing law', 'Governed by the laws of India; courts in New Delhi have exclusive jurisdiction.'],
]
function TermsSheet({ onClose, onAccept }) {
  const [ok, setOk] = useState(false)
  return (
    <Sheet open onClose={onClose} tall>
      <SheetHead icon="📜" title="Terms & Conditions" sub="Salary Advance Facility — Neev NBFC Pvt. Ltd." />
      <ol className="mb-4 max-h-80 overflow-y-auto rounded-2xl border border-line bg-page p-4 text-[12.5px] leading-relaxed">
        {TERMS.map(([h, b], i) => <li key={h} className="mb-3"><b className="block">{i + 1}. {h}</b>{b}</li>)}
      </ol>
      <Check checked={ok} onChange={e => setOk(e.target.checked)}>I have read and agree to the Terms & Conditions, E-NACH mandate and repayment plan.</Check>
      <div className="h-3" />
      <Btn disabled={!ok} onClick={onAccept}>Accept & continue</Btn>
      <Btn v="ghost" onClick={onClose}>Cancel</Btn>
    </Sheet>
  )
}
function EsignSheet({ onClose }) {
  const [name, setName] = useState(S.name || '')
  const [otp, setOtp] = useState('')
  const repeat = S.t2eSigned
  const confirm = () => {
    if (!repeat && name.trim().length < 3) { toast('Type your full name to e-sign'); return }
    if (otp.length < 4) { toast('Enter the 4-digit OTP'); return }
    update({ esignConfirmed: true, t2eSigned: true })
    toast('E-Sign confirmed')
    onClose()
  }
  return (
    <Sheet open onClose={onClose}>
      <SheetHead icon="✍️" title="E-Sign loan agreement" sub="Agreement between you and Neev." />
      <div className="mb-4 rounded-xl bg-gold-100 px-3 py-2.5 text-[12px] font-semibold text-gold-600">⚡ {repeat ? 'Already signed — confirm with OTP.' : 'After this, future advances need just an OTP.'}</div>
      {!repeat && <Field label="Type your full name to e-sign" value={name} onChange={e => setName(e.target.value)} />}
      <Label>Enter Aadhaar OTP</Label>
      <Otp value={otp} onChange={setOtp} autoFill />
      <div className="h-2" />
      <Btn onClick={confirm}>Confirm E-Sign</Btn>
      <Btn v="ghost" onClick={onClose}>Cancel</Btn>
    </Sheet>
  )
}
// Auto-filled from the Account Aggregator account; read-only.
function EnachSheet({ onClose }) {
  const confirm = () => { update({ enachConfirmed: true }); toast('E-NACH mandate set up'); onClose() }
  return (
    <Sheet open onClose={onClose}>
      <SheetHead icon="🏦" title="Set up E-NACH" sub="Backup auto-debit, used only if salary deduction fails." />
      <div className="mb-4 rounded-xl bg-teal-50 px-3 py-2.5 text-[12.5px] font-semibold text-teal-900">✅ Auto-filled from {S.bankName} ****{S.bankLast4} (Account Aggregator)</div>
      <Field label="Account holder name" value={S.name} readOnly />
      <Field label="Bank account number" value={S.bsSelectedAccount >= 0 ? '50100234567890' : 'XXXX' + S.bankLast4} readOnly />
      <Field label="IFSC code" value="SBIN0001234" readOnly />
      <Field label="Bank name" value={S.bankName || ''} readOnly />
      <Btn onClick={confirm}>OK</Btn>
      <Btn v="ghost" onClick={onClose}>Back</Btn>
    </Sheet>
  )
}

export function LoanSuccess() {
  const { go } = useNav()
  const loan = useLocation().state?.loan || S.loans[0]
  if (!loan) return <Screen title="Loans"><Empty icon="📋">No advance yet.</Empty></Screen>
  return (
    <Screen title="" back="/loans" footer={<><Btn onClick={() => go('/ledger', { replace: true })}>{t('View my ledger')}</Btn><Btn v="ghost" onClick={() => go('/loans', { replace: true })}>Back to loans</Btn></>}>
      <SuccessHero title="Money is on its way!"><b>{fmt(loan.net)}</b> will reach {S.bankName} ****{S.bankLast4} in a few minutes.</SuccessHero>
      <div className="mb-3 rounded-3xl border-2 border-dashed border-teal-500 bg-teal-50 p-4 text-center">
        <p className="text-[12px] text-muted">Your Virtual Account Number (VAN)</p>
        <b className="font-mono text-2xl tracking-wider text-teal-900">{loan.van}</b>
        <p className="mt-1 text-[11px] text-muted">Your employer sends repayment to this VAN</p>
      </div>
      <Card><Row k="Loan Account Number (LAN)" v={loan.lan} mono /><Row k="Customer ID" v={S.custId} /></Card>
    </Screen>
  )
}

const statusBadge = st => <Badge tone={st === 'Repaid' ? 'ok' : 'gold'}>{st}</Badge>

export function Ledger() {
  const s = useApp()
  const { go } = useNav()
  return (
    <Screen title="My loans" back={false}>
      {s.loans.length ? s.loans.map((l, i) => (
        <button key={l.lan} onClick={() => go('/ledger/' + i)} className="mb-2.5 block w-full rounded-3xl border border-line bg-card p-4 text-left shadow-card active:scale-[.99]">
          <div className="flex items-center justify-between"><div><p className="text-[11px] text-muted">LAN</p><b className="font-mono">{l.lan}</b></div>{statusBadge(l.status)}</div>
          <Row k="You received" v={fmt(l.net)} /><Row k="Repay" v={`${fmt(l.amount)} by ${l.dueDate}`} />
          <p className="mt-1 text-right text-[13px] font-semibold text-teal-700">View details →</p>
        </button>
      )) : <Empty icon="📋">No advances taken yet. Once you apply, it shows here.</Empty>}
    </Screen>
  )
}

export function LoanDetail() {
  const s = useApp()
  const l = s.loans[+useParams().idx]
  if (!l) return <Screen title="Loan details" back="/ledger"><Empty icon="📋">Loan not found.</Empty></Screen>
  const repaid = l.status === 'Repaid'
  const steps = [
    [true, '✓', 'Advance sent', `${fmt(l.net)} to your bank · ${l.date}`],
    [repaid, '📅', `Salary day (${l.dueDate})`, `Your employer deducts ${fmt(l.amount)} from your salary`],
    [repaid, '💸', `Employer pays ${fmt(l.amount)} to Neev`, `Sent to VAN ${l.van}`],
  ]
  return (
    <Screen title="Loan details" back="/ledger">
      <Card className="mb-3">
        <div className="mb-2 flex items-center justify-between"><div><p className="text-[11px] text-muted">LAN</p><b className="font-mono text-lg">{l.lan}</b></div>{statusBadge(l.status)}</div>
        <Row k="Reason" v={l.reason || '—'} /><Row k="Advance amount" v={fmt(l.amount)} />
        <Row k="Service charge" v={fmt(l.charge)} /><Row k="GST (18%)" v={fmt(l.gst)} /><Row total k="You received" v={fmt(l.net)} />
      </Card>
      <div className="mb-3 rounded-3xl border-2 border-dashed border-teal-500 bg-teal-50 p-4 text-center">
        <p className="text-[12px] text-muted">Employer pays to VAN</p><b className="font-mono text-xl text-teal-900">{l.van}</b>
      </div>
      <Section>Repayment timeline</Section>
      <ol>
        {steps.map(([done, ic, h, sub], i) => (
          <li key={h} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`grid size-9 place-items-center rounded-full text-sm ${done ? 'bg-ok text-white' : 'border-2 border-line bg-card'}`}>{ic}</span>
              {i < steps.length - 1 && <span className={`w-0.5 flex-1 ${done ? 'bg-ok' : 'bg-line'}`} />}
            </div>
            <div className="pb-5"><b className="text-[14px]">{h}</b><p className="text-[12.5px] text-muted">{sub}</p></div>
          </li>
        ))}
      </ol>
    </Screen>
  )
}

export function History() {
  const s = useApp()
  const repaid = s.loans.filter(l => l.status === 'Repaid').length
  const active = s.loans.filter(l => l.status === 'Active').length
  const badge = ['New borrower', 'Good borrower', 'Trusted borrower', 'Star borrower'][Math.min(repaid, 3)]
  return (
    <Screen title="My repayment history" back="/loans">
      <div className="mb-3 rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 p-5 text-center text-white shadow-lift">
        <div className="text-4xl animate-pop">🏅</div>
        <b className="mt-1 block font-display text-xl">{badge}</b>
        <p className="text-[12.5px] text-teal-100/80">{repaid} of {s.loans.length} advances repaid on time</p>
        <div className="mt-4 grid grid-cols-3 rounded-2xl bg-white/10 py-3">
          {[[s.loans.length, 'Total', ''], [repaid, 'On time', 'text-[#7FFFD4]'], [active, 'Active', 'text-gold-500']].map(([n, l, c]) => (
            <div key={l}><b className={`block font-display text-2xl ${c}`}>{n}</b><span className="text-[11px] text-teal-100/80">{l}</span></div>
          ))}
        </div>
      </div>
      {repaid < 3 && <p className="mb-3 text-center text-[12.5px] text-muted">Repay {3 - repaid} more on time to unlock a higher limit 🚀</p>}
      <Section>History</Section>
      {s.loans.length ? s.loans.map(l => (
        <Card key={l.lan} className="mb-2.5">
          <div className="flex items-center justify-between"><b className="font-mono text-[13px]">{l.lan}</b>{statusBadge(l.status)}</div>
          <Row k="Amount" v={fmt(l.amount)} /><Row k="Due" v={l.dueDate} />
        </Card>
      )) : <Empty icon="📋">No repayment history yet.</Empty>}
      <div className="h-2" />
      <Btn v="outline" onClick={() => toast('Generating statement PDF… check your downloads.')}>📄 Download statement</Btn>
    </Screen>
  )
}

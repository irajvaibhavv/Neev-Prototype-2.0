// Insurance, investments (gold / silver / mutual funds), bill payments and UPI scan & pay.
import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { S, addNotification, addPoints, fmt, toast, update, useApp } from '../store.js'
import { BILLERS, GOLD_RATE, INSURANCE, MERCHANTS, MF_FUNDS } from '../lib/data.js'
import { Badge, Btn, Card, Chip, Empty, Field, Item, Label, Row, Screen, Section, Spinner, SuccessHero, useNav } from '../ui.jsx'
import { requireBank } from './Auth.jsx'

// Shared success screen: navigate('/done', { state: { title, note, rows, next } }).
export function Done() {
  const { go } = useNav()
  const d = useLocation().state || { title: 'Done!', next: '/home' }
  return (
    <Screen title="" back={d.next} footer={<Btn onClick={() => go(d.next || '/home', { replace: true })}>Done</Btn>}>
      <SuccessHero title={d.title}>{d.note}</SuccessHero>
      {d.rows && <Card>{d.rows.map(([k, v]) => <Row key={k} k={k} v={v} mono />)}</Card>}
    </Screen>
  )
}

const coverText = c => (typeof c === 'number' ? fmt(c) + ' cover' : c)

export function Insurance() {
  const s = useApp()
  const { go } = useNav()
  return (
    <Screen title="Insurance">
      <p className="mb-4 text-[13px] text-muted">Affordable cover, paid from your salary — no paperwork.</p>
      {Object.entries(INSURANCE).map(([k, x]) => <Item key={k} icon={x.icon} bg="bg-bad-100" title={x.title} sub={x.sub} onClick={() => go('/insurance/' + k)} />)}
      <Section>My policies</Section>
      {s.policies.length ? s.policies.map(p => (
        <Card key={p.policy} className="mb-2.5">
          <div className="flex items-center justify-between"><b className="text-[14px]">{p.plan}</b><Badge tone="ok">Active</Badge></div>
          <p className="mt-1 text-[12px] text-muted">{p.type} · Nominee: {p.nominee}</p>
          <p className="mt-1 font-mono text-[11px] text-muted">{p.policy} · ₹{p.premium}/month</p>
        </Card>
      )) : <Empty icon="🛡️">No active policies yet.</Empty>}
    </Screen>
  )
}

export function InsurancePlans() {
  const { type } = useParams()
  const { go } = useNav()
  const x = INSURANCE[type]
  return (
    <Screen title={x.title} back="/insurance">
      <p className="mb-4 text-[13px] text-muted">Pick a plan. Premium is deducted from your salary.</p>
      {x.plans.map((p, i) => (
        <Card key={p.name} className="mb-3">
          <div className="flex items-center justify-between">
            <div><b className="text-[15px]">{p.name}</b><p className="mt-0.5 text-[12.5px] text-muted">{coverText(p.cover)}</p></div>
            <div className="text-right"><b className="font-display text-2xl text-teal-900">₹{p.premium}</b><p className="-mt-1 text-[11px] text-muted">/month</p></div>
          </div>
          <Btn v="outline" size="sm" className="mt-3" onClick={() => go(`/insurance/${type}/${i}`)}>Choose plan</Btn>
        </Card>
      ))}
    </Screen>
  )
}

export function InsuranceCheckout() {
  const { type, idx } = useParams()
  const { go } = useNav()
  const x = INSURANCE[type], p = x.plans[+idx]
  const [nominee, setNominee] = useState('')
  const buy = () => {
    if (!nominee.trim()) { toast('Enter a nominee name'); return }
    const policy = `NEEV-INS-${S.custId}${String(S.policies.length + 1).padStart(4, '0')}`
    update(st => { st.policies.unshift({ policy, type: x.title, plan: p.name, premium: p.premium, nominee: nominee.trim() }) })
    addNotification(`Your ${p.name} policy is now active. Policy: ${policy}`)
    addPoints(15, 'Insurance purchased')
    go('/done', { replace: true, state: { title: 'Policy activated!', note: "You're covered from today.", rows: [['Policy number', policy], ['Plan', p.name]], next: '/insurance' } })
  }
  return (
    <Screen title="Confirm & buy" back={`/insurance/${type}`} footer={<Btn onClick={() => requireBank(go, buy)}>Pay first premium · ₹{p.premium}</Btn>}>
      <Card className="mb-4"><Row k="Plan" v={p.name} /><Row k="Cover" v={coverText(p.cover).replace(' cover', '')} /><Row total k="Premium (monthly)" v={'₹' + p.premium} /></Card>
      <Field label="Nominee name" placeholder="e.g. spouse, parent, child" value={nominee} onChange={e => setNominee(e.target.value)} />
      <p className="text-[12px] text-muted">Premium is deducted from your salary along with any advance.</p>
    </Screen>
  )
}

export function Invest() {
  const s = useApp()
  const { go } = useNav()
  return (
    <Screen title="Investment">
      <p className="mb-4 text-[13px] text-muted">Start small, grow steadily. No minimum balance.</p>
      <Item icon="🪙" bg="bg-gold-100" title="Digital Gold" sub="Buy from ₹10. Sell anytime." onClick={() => go('/invest/gold', { state: { metal: 'Gold' } })} />
      <Item icon="🥈" bg="bg-page" title="Digital Silver" sub="Buy from ₹10. Sell anytime." onClick={() => go('/invest/gold', { state: { metal: 'Silver' } })} />
      <Item icon="📈" title="Mutual Funds" sub="Start a SIP from ₹500" onClick={() => go('/invest/mf')} />
      <Section>My investments</Section>
      {s.investments.length ? s.investments.map((v, i) => (
        <Card key={i} className="mb-2.5 flex items-center justify-between gap-3">
          <div><b className="text-[14px]">{v.type}</b><p className="text-[12px] text-muted">{v.detail}</p></div>
          <b className="text-teal-900">{fmt(v.amount)}</b>
        </Card>
      )) : <Empty icon="🪙">No investments yet.</Empty>}
    </Screen>
  )
}

export function InvestGold() {
  const { go } = useNav()
  const metal = useLocation().state?.metal || 'Gold'
  const [amt, setAmt] = useState('')
  const grams = (parseFloat(amt) || 0) / GOLD_RATE
  const buy = () => {
    const a = parseFloat(amt) || 0
    if (a < 10) { toast(`Minimum ₹10 to buy ${metal.toLowerCase()}`); return }
    if (!S.bankLast4) update({ bankLast4: '1234', bankName: 'State Bank of India' }) // demo: paid via UPI from SBI
    update(st => { st.investments.unshift({ type: 'Digital ' + metal, detail: grams.toFixed(3) + ' g', amount: a, date: 'Today' }) })
    addNotification(`You bought ${grams.toFixed(3)}g of digital ${metal.toLowerCase()} for ${fmt(a)}.`)
    addPoints(10, metal + ' purchase')
    go('/done', { replace: true, state: { title: `${metal} purchased!`, note: `${grams.toFixed(3)} g added to your locker.`, next: '/invest' } })
  }
  return (
    <Screen title={`Buy Digital ${metal}`} back="/invest" footer={<Btn onClick={buy}>Buy {metal.toLowerCase()}</Btn>}>
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-gold-100 to-[#FFE6AE] p-5 text-center">
        <p className="text-[12px] text-[#5C4300]">Today's rate</p>
        <b className="font-mono text-3xl text-[#5C4300]">{fmt(GOLD_RATE)}<span className="text-sm"> /gram</span></b>
      </div>
      <Label>Amount to invest</Label>
      <div className="mb-3 flex items-center rounded-2xl border-2 border-line bg-card px-4 focus-within:border-teal-500">
        <span className="font-mono text-xl font-semibold text-muted">₹</span>
        <input type="number" inputMode="numeric" value={amt} onChange={e => setAmt(e.target.value)} placeholder="500" autoFocus className="w-full bg-transparent px-2 py-3 font-mono text-xl outline-none" />
      </div>
      <div className="mb-3 flex gap-2">{[100, 500, 1000].map(v => <Chip key={v} className="flex-1 py-2" sel={+amt === v} onClick={() => setAmt(String(v))}>₹{v}</Chip>)}</div>
      <Card><Row k="You will get" v={grams.toFixed(3) + ' g'} mono /></Card>
    </Screen>
  )
}

export function InvestMf() {
  const { go } = useNav()
  return (
    <Screen title="Mutual Funds" back="/invest">
      <p className="mb-4 text-[13px] text-muted">Simple, low-risk funds for steady saving. Withdraw anytime.</p>
      {MF_FUNDS.map((f, i) => <Item key={f.scheme} icon={f.icon} title={f.scheme} sub={`${f.amc} · ${f.risk} · min ₹${f.min}`} onClick={() => go('/invest/mf/' + i)} />)}
    </Screen>
  )
}

export function InvestMfCheckout() {
  const { go } = useNav()
  const f = MF_FUNDS[+useParams().idx]
  const [amt, setAmt] = useState('')
  const [mode, setMode] = useState('sip')
  const invest = () => {
    const a = parseFloat(amt) || 0
    if (a < f.min) { toast(`Minimum ₹${f.min} for this fund`); return }
    const label = mode === 'sip' ? 'Monthly SIP' : 'One-time'
    update(st => { st.investments.unshift({ type: 'Mutual Fund', detail: `${f.scheme} · ${f.amc} · ${label}`, amount: a, date: 'Today' }) })
    addNotification(`You invested ${fmt(a)} in ${f.scheme} (${f.amc}).`)
    addPoints(10, 'Mutual fund investment')
    go('/done', { replace: true, state: { title: 'Investment successful!', note: `${mode === 'sip' ? 'Your monthly SIP of' : 'Your one-time investment of'} ${fmt(a)} in ${f.scheme} has started.`, next: '/invest' } })
  }
  return (
    <Screen title="Invest" back="/invest/mf" footer={<Btn onClick={() => requireBank(go, invest)}>Invest</Btn>}>
      <Card className="mb-4">
        <div className="mb-2 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-xl">{f.icon}</span>
          <div><b className="text-[14px]">{f.scheme}</b><p className="text-[12px] text-muted">{f.amc}</p></div></div>
        <Row k="Risk" v={f.risk} /><Row k="Returns (last 3 yrs)" v={f.returns} />
      </Card>
      <Field label="Amount (₹)" type="number" inputMode="numeric" placeholder="e.g. 500" value={amt} onChange={e => setAmt(e.target.value)} />
      <Label>How often</Label>
      <div className="grid grid-cols-2 gap-2"><Chip sel={mode === 'sip'} onClick={() => setMode('sip')}>Monthly SIP</Chip><Chip sel={mode === 'onetime'} onClick={() => setMode('onetime')}>One-time</Chip></div>
    </Screen>
  )
}

export function Bbps() {
  const s = useApp()
  const { go } = useNav()
  return (
    <Screen title="Bill Payments">
      <button onClick={() => go('/scan')} className="mb-5 flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 p-5 text-left text-white shadow-lift active:scale-[.99]">
        <span className="grid size-14 place-items-center rounded-2xl bg-white/15 text-3xl">📷</span>
        <span><b className="block text-[16px]">Scan & Pay</b><span className="text-[12px] text-teal-100/80">Scan any UPI QR code to pay instantly</span></span>
      </button>
      <h3 className="mb-3 text-[15px] font-bold text-teal-900">Recharges & bills</h3>
      <div className="grid grid-cols-4 gap-y-4">
        {Object.entries(BILLERS).map(([k, b]) => (
          <button key={k} onClick={() => go('/bbps/' + k)} className="flex flex-col items-center gap-1.5 text-[11.5px] font-medium active:scale-95">
            <span className="grid size-13 place-items-center rounded-2xl border border-line bg-card text-2xl shadow-card">{b.icon}</span>{b.short}
          </button>
        ))}
      </div>
      <Section>Recent payments</Section>
      {s.bbpsHistory.length ? s.bbpsHistory.map(h => (
        <Card key={h.ref} className="mb-2.5 flex items-center justify-between gap-3">
          <div><b className="text-[14px]">{h.label}</b><p className="text-[12px] text-muted">{h.detail} · {h.date}</p></div>
          <b className="text-teal-900">{fmt(h.amount)}</b>
        </Card>
      )) : <Empty icon="🧾">No bill payments yet.</Empty>}
    </Screen>
  )
}

function recordPayment(go, label, detail, amount, note, reason) {
  const ref = `NEEVUPI${S.custId}${String(S.bbpsHistory.length + 1).padStart(4, '0')}`
  update(st => { st.bbpsHistory.unshift({ label, detail, amount, ref, date: 'Today' }) })
  addNotification(`${note} Ref: ${ref}`)
  addPoints(5, reason)
  go('/done', { replace: true, state: { title: 'Payment successful!', note, rows: [['UPI reference', ref]], next: '/bbps' } })
}

export function BbpsPay() {
  const { type } = useParams()
  const { go } = useNav()
  const b = BILLERS[type]
  const loan = type === 'emi' && S.loans.find(l => l.status === 'Active')
  const [num, setNum] = useState(loan ? loan.lan : '')
  const [amt, setAmt] = useState(loan ? String(loan.amount) : '')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (type === 'emi' && !loan) toast('You have no active loan to pay towards.') }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const pay = () => {
    const a = parseFloat(amt) || 0
    if (!num.trim()) { toast('Enter the required number'); return }
    if (a <= 0) { toast('Enter a valid amount'); return }
    if (!S.bankLast4) update({ bankLast4: '1234', bankName: 'State Bank of India' })
    setBusy(true)
    setTimeout(() => recordPayment(go, b.title, num.trim(), a, `${fmt(a)} paid for ${b.title.toLowerCase()}.`, 'Bill payment'), 900)
  }
  return (
    <Screen title={b.title} back="/bbps" footer={<Btn disabled={busy} onClick={pay}>{busy ? 'Verifying with bank…' : 'Pay via UPI'}</Btn>}>
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-teal-50 text-3xl">{b.icon}</div>
      <Field label={b.label} placeholder={b.ph} value={num} onChange={e => setNum(e.target.value)} />
      <Field label="Amount (₹)" type="number" inputMode="numeric" placeholder="e.g. 299" value={amt} onChange={e => setAmt(e.target.value)} />
    </Screen>
  )
}

export function Scan() {
  const { go } = useNav()
  const [m, setM] = useState(null)
  const [amt, setAmt] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setM(MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)]), 1500)
    return () => clearTimeout(id)
  }, [])
  const pay = () => {
    const a = parseFloat(amt) || 0
    if (a <= 0) { toast('Enter a valid amount'); return }
    setBusy(true)
    setTimeout(() => recordPayment(go, 'Paid to ' + m.name, m.upi, a, `${fmt(a)} paid to ${m.name}.`, 'UPI payment'), 900)
  }
  return (
    <Screen title="Scan & Pay" back="/home" footer={m && <Btn disabled={busy} onClick={() => requireBank(go, pay)}>{busy ? 'Verifying with bank…' : 'Pay'}</Btn>}>
      <div className={`relative mx-auto my-4 grid size-60 place-items-center overflow-hidden rounded-3xl bg-teal-950 text-6xl ${m ? '' : 'animate-pulse'}`}>
        {['top-3 left-3 border-t-4 border-l-4', 'top-3 right-3 border-t-4 border-r-4', 'bottom-3 left-3 border-b-4 border-l-4', 'bottom-3 right-3 border-b-4 border-r-4'].map(c =>
          <span key={c} className={`absolute size-10 rounded-md border-gold-500 ${c}`} />)}
        <span className={m ? 'animate-pop' : ''}>{m ? '✅' : '📷'}</span>
      </div>
      {!m ? <Spinner text="Point your camera at any UPI QR code…" icon=" " /> : (
        <div className="animate-in">
          <Card className="mb-4 text-center"><div className="text-3xl">🏪</div><b className="mt-1 block">{m.name}</b><p className="font-mono text-[12px] text-muted">{m.upi}</p></Card>
          <Field label="Amount (₹)" type="number" inputMode="numeric" placeholder="e.g. 150" value={amt} onChange={e => setAmt(e.target.value)} autoFocus />
        </div>
      )}
    </Screen>
  )
}

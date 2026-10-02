// Home + account screens: notifications, profile, documents, complaints, referral, loyalty.
import { useEffect, useRef, useState } from 'react'
import { addNotification, firstName, initials, logout, openModal, toast, update, useApp } from '../store.js'
import { GRIEVANCE_TYPES, LOYALTY_TIERS, SAKHI } from '../lib/data.js'
import { t } from '../lib/i18n.js'
import { Badge, Btn, Card, Empty, IconBtn, Item, Label, Row, Screen, Section, inputCls, useNav } from '../ui.jsx'
import { openLoansEntry, startEmployerSetup } from './Loans.jsx'
import { openSchemes } from './Schemes.jsx'

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export function Home() {
  const s = useApp()
  const { go } = useNav()
  const unread = s.notifications.some(n => n.unread)
  const tiles = [
    { icon: '🎯', title: 'Govt Schemes', sub: 'See what you qualify for', bg: 'from-[#E3F4EA] to-[#CDEBDB]', on: () => openSchemes(go) },
    { icon: '💰', title: 'Loans', sub: 'Salary advance', bg: 'from-teal-100 to-[#C4E4DA]', on: () => openLoansEntry(go) },
    { icon: '🛡️', title: 'Insurance', sub: 'Health, accident, bike', bg: 'from-bad-100 to-[#F5D4C6]', on: () => go('/insurance') },
    { icon: '🪙', title: 'Investment', sub: 'Gold, silver & funds', bg: 'from-gold-100 to-[#FFE6AE]', on: () => go('/invest') },
  ]
  return (
    <Screen title={undefined} noSpeak>
      <div className="flex items-center gap-3 pt-2 pb-4">
        <button onClick={() => go('/profile')} aria-label="Profile"
          className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-teal-700 to-teal-500 font-display text-lg font-bold text-white shadow-card">
          {initials(s.name === 'User' ? '' : s.name) || '🙂'}
        </button>
        <div className="flex-1">
          <p className="text-[12px] text-muted">{greeting()}</p>
          <h1 className="-mt-1 text-[22px] font-bold text-teal-900">{t('Hi,')} {s.name === 'User' ? 'there' : firstName(s.name)} 👋</h1>
        </div>
        <IconBtn label="Notifications" className="relative" onClick={() => go('/notifications')}>
          🔔{unread && <span className="absolute top-2 right-2.5 size-2.5 rounded-full bg-bad ring-2 ring-card" />}
        </IconBtn>
        <IconBtn label="Help" onClick={() => openModal('care')}>🎧</IconBtn>
      </div>

      <Banners />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map(x => (
          <button key={x.title} onClick={x.on} className="rounded-3xl border border-line bg-card p-4 text-left shadow-card transition active:scale-[.97]">
            <span className={`mb-3 grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${x.bg}`}>{x.icon}</span>
            <b className="block text-[15px] text-teal-900">{t(x.title)}</b>
            <span className="text-[12px] leading-snug text-muted">{x.sub}</span>
          </button>
        ))}
      </div>

      <button onClick={() => go('/loyalty')} className="mt-3 flex w-full items-center gap-3 rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 p-4 text-left text-white shadow-lift active:scale-[.99]">
        <span className="grid size-11 place-items-center rounded-2xl bg-white/15 text-xl">🏅</span>
        <span className="flex-1"><b className="block text-[15px]">{s.loyaltyPoints} points</b><span className="text-[12px] text-teal-100/80">Earn on every advance, bill & referral</span></span>
        <span className="text-[13px] font-bold text-gold-500">View →</span>
      </button>
    </Screen>
  )
}

// Swipeable promo banners (native scroll-snap) — profile completion first until it's 100%.
function Banners() {
  const s = useApp()
  const { go } = useNav()
  const track = useRef(null)
  const [idx, setIdx] = useState(0)
  const steps = [!!s.mobile, !!s.aadhaar, !!s.company, !!s.pin]
  const pct = Math.round((steps.filter(Boolean).length / steps.length) * 100)
  const profile = pct < 100 && (!s.company
    ? { text: 'Verify your employer to unlock salary advances', on: () => startEmployerSetup(go) }
    : !s.aadhaar ? { text: 'Complete KYC to unlock salary advances', on: () => openLoansEntry(go) }
      : { text: 'Set a PIN to secure your account', on: () => go('/pin') })
  const slides = [
    profile && { key: 'p', cls: 'from-teal-50 to-teal-100 text-teal-900', on: profile.on, body: (
      <div className="flex items-center gap-3.5">
        <div className="grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold"
          style={{ background: `conic-gradient(#F5A623 ${pct * 3.6}deg, rgb(11 79 69 / .12) 0)` }}>
          <span className="grid size-11 place-items-center rounded-full bg-white">{pct}%</span>
        </div>
        <div className="flex-1"><b className="block">Complete your profile</b><span className="text-[12px] text-muted">{profile.text}</span></div>
        <span className="font-bold text-teal-700">→</span>
      </div>) },
    { key: 'a', cls: 'from-[#0E5C50] to-[#12695A] text-white', on: () => openLoansEntry(go), icon: '💸', title: 'Need cash before payday?', sub: 'Get up to 70% of earned salary instantly' },
    { key: 'g', cls: 'from-[#FFF4DE] to-[#FFE3A3] text-[#5C4300]', on: () => go('/invest'), icon: '🪙', title: 'Invest in Digital Gold', sub: 'Zero making charges. Start from ₹10' },
    { key: 'i', cls: 'from-[#E3F4EA] to-[#C9EAD6] text-[#14532D]', on: () => go('/insurance'), icon: '🛡️', title: 'Health cover @ ₹1/day', sub: '₹5L cover for your family' },
    { key: 'r', cls: 'from-[#EEE9FF] to-[#DCD3FF] text-[#3B2A8A]', on: () => go('/referral'), icon: '🎁', title: 'Refer & earn ₹50', sub: 'Your friend gets ₹50 too' },
    { key: 'b', cls: 'from-[#FFF1E2] to-[#FFDDB8] text-[#7A3E00]', on: () => go('/bbps'), icon: '⚡', title: 'Pay bills & recharge', sub: 'Electricity, mobile, DTH' },
  ].filter(Boolean)

  useEffect(() => {
    const id = setInterval(() => {
      const el = track.current
      if (!el || el.matches(':hover')) return
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, 3500)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <div>
      <div ref={track} onScroll={e => setIdx(Math.round(e.target.scrollLeft / e.target.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl">
        {slides.map(x => (
          <button key={x.key} onClick={x.on} className={`w-full shrink-0 snap-center bg-gradient-to-br p-4 text-left ${x.cls}`}>
            {x.body || (
              <div className="flex items-center gap-3.5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/25 text-3xl">{x.icon}</span>
                <span className="flex-1"><b className="block text-[15px]">{x.title}</b><span className="text-[12px] opacity-80">{x.sub}</span></span>
                <span className="font-bold">→</span>
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {slides.map((x, i) => <span key={x.key} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-teal-700' : 'w-1.5 bg-line'}`} />)}
      </div>
    </div>
  )
}

export function Notifications() {
  const s = useApp()
  return (
    <Screen title="Notifications">
      {s.notifications.length ? s.notifications.map((n, i) => (
        <button key={i} onClick={() => update(st => { st.notifications[i].unread = false })}
          className={`mb-2.5 flex w-full gap-3 rounded-2xl border p-3.5 text-left ${n.unread ? 'border-teal-100 bg-teal-50' : 'border-line bg-card'}`}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-base">{n.unread ? '🔔' : '✅'}</span>
          <span className="flex-1"><span className="block text-[13.5px] leading-relaxed">{n.text}</span><span className="text-[11px] text-muted">{n.time}</span></span>
        </button>
      )) : <Empty icon="🔕">No notifications yet.</Empty>}
    </Screen>
  )
}

export function Profile() {
  const s = useApp()
  const { go } = useNav()
  return (
    <Screen title="Profile">
      <Card className="mb-3 flex flex-col items-center text-center">
        <div className="grid size-16 place-items-center rounded-full bg-teal-100 font-display text-2xl font-bold text-teal-700">{initials(s.name === 'User' ? '' : s.name) || '🙂'}</div>
        <h2 className="mt-2 text-xl font-bold">{s.name === 'User' ? 'Your profile' : s.name}</h2>
        <p className="text-[13px] text-muted">{s.company || '+91 ' + s.mobile}</p>
      </Card>
      <Card className="mb-3">
        <Row k="Customer ID" v={s.custId} />
        {s.company && <Row k="ECN" v={s.ecn} />}
        <Row k="PAN" v={s.panNumber ? s.panNumber[0] + 'XXXX' + s.panNumber.slice(5) : '—'} />
        <Row k="Aadhaar" v={s.aadhaar ? 'XXXX XXXX ' + s.aadhaar.replace(/\s/g, '').slice(-4) : '—'} />
        <Row k="Bank" v={s.bankLast4 ? `${s.bankName} ****${s.bankLast4}` : 'Not added yet'} />
        {s.company && <Row k="VAN" v={`NEEV00${s.custId}01`} mono />}
      </Card>
      <p className="mb-3 text-[12px] text-muted">{t('To update PAN, Aadhaar or ECN, call support.')}</p>
      <Item icon="📄" title="My documents" sub="Agreements, statements, schedules" onClick={() => go('/documents')} />
      <Item icon="🎧" bg="bg-bad-100" title="Customer Care" sub="Wrong deduction, delayed credit, disputes" onClick={() => openModal('care')} />
      <Item icon="🌐" title={s.voiceMode ? 'Voice' : s.voiceLang === 'hi' ? 'हिंदी' : 'English'} sub="Voice & app language" right="Change" onClick={() => openModal('lang')} />
      {!s.pin && <Item icon="🔒" bg="bg-gold-100" title="Set a PIN" sub="Log in faster and safer" onClick={() => go('/pin')} />}
      <div className="h-2" />
      <Btn v="danger" onClick={() => { logout(); toast('You have been logged out'); go('/', { replace: true }) }}>{t('Log out')}</Btn>
    </Screen>
  )
}

export function Documents() {
  const s = useApp()
  const dl = name => toast(`Downloading "${name}"…`)
  return (
    <Screen title="My documents" back="/profile">
      <Item icon="📄" title="Loan Agreement" sub="Signed agreement between you and Neev" right="PDF" onClick={() => dl('Loan Agreement')} />
      <Item icon="📊" bg="bg-gold-100" title="Loan Account Statement" sub="All advances, deductions and credits" right="PDF" onClick={() => dl('Account Statement')} />
      <Section>Per-loan documents</Section>
      {s.loans.length ? s.loans.map(l => (
        <Item key={l.lan} icon="🧾" title={l.lan} sub={`Repayment schedule · ${l.dueDate}`} right="PDF" onClick={() => dl('Repayment schedule for ' + l.lan)} />
      )) : <Empty icon="📭">No loans yet. Documents appear after your first advance.</Empty>}
    </Screen>
  )
}

export function Grievance() {
  const s = useApp()
  const [type, setType] = useState('')
  const [desc, setDesc] = useState('')
  const [lan, setLan] = useState('')
  const submit = () => {
    if (!type) { toast('Please select a complaint type'); return }
    if (desc.trim().length < 10) { toast('Please describe the issue in a few words'); return }
    const ticket = 'NEV-GRV-' + Math.floor(10000 + Math.random() * 90000)
    update(st => { st.grievances = [{ ticket, type, desc: desc.trim(), lan, date: 'Today', status: 'Under review' }, ...(st.grievances || [])] })
    addNotification(`Complaint ${ticket} raised. We will respond within 2 working days.`)
    toast('Complaint submitted. Ticket: ' + ticket)
    setType(''); setDesc(''); setLan('')
  }
  return (
    <Screen title="Chat with us" back="/profile">
      <p className="mb-4 text-[13px] text-muted">Every complaint gets a ticket and a reply within 2 working days.</p>
      <Label>Type of complaint</Label>
      <div className="mb-3 grid gap-2">
        {Object.entries(GRIEVANCE_TYPES).map(([k, l]) => (
          <button key={k} onClick={() => setType(k)} className={`rounded-2xl border-2 px-4 py-3 text-left text-[13.5px] font-medium transition ${type === k ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-line bg-card'}`}>{l}</button>
        ))}
      </div>
      <Label>Describe the issue</Label>
      <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell us what happened in simple words…" className={`${inputCls} mb-3 min-h-28 resize-none`} />
      <Label opt>Loan ID</Label>
      <input value={lan} onChange={e => setLan(e.target.value)} placeholder="e.g. 5832012026" className={`${inputCls} mb-4`} />
      <Btn onClick={submit}>Submit complaint</Btn>
      {(s.grievances || []).length > 0 && <Section>Past complaints</Section>}
      {(s.grievances || []).map(g => (
        <Card key={g.ticket} className="mb-2.5">
          <div className="flex items-center justify-between"><b className="text-[13px]">{g.ticket}</b><Badge tone="gold">{g.status}</Badge></div>
          <p className="mt-1 text-[12px] text-muted">{GRIEVANCE_TYPES[g.type]} · {g.date}</p>
          <p className="mt-1 text-[13px]">{g.desc.length > 80 ? g.desc.slice(0, 80) + '…' : g.desc}</p>
        </Card>
      ))}
    </Screen>
  )
}

export function Referral() {
  const s = useApp()
  const code = 'NEEV' + s.custId
  const msg = `I use Neev to get my salary early! Join with my code ${code} and we both get ₹50 off our next advance. Download: neev.in/app`
  return (
    <Screen title="Refer a colleague">
      <div className="mb-3 rounded-3xl bg-gradient-to-br from-gold-500 to-[#DB8E0C] p-6 text-center text-[#2A1C00] shadow-[0_10px_30px_rgb(245_166_35/.35)]">
        <div className="text-4xl animate-pop">🎁</div>
        <b className="mt-2 block font-display text-xl">Invite a colleague</b>
        <p className="mt-1 text-[13.5px]">You both get <b>₹50 cashback</b> when they take their first advance.</p>
      </div>
      <Card className="mb-3">
        <p className="mb-2 text-[12px] text-muted">Your referral code</p>
        <div className="flex items-center gap-2.5">
          <div className="flex-1 rounded-2xl bg-teal-50 py-3.5 text-center font-mono text-xl font-semibold tracking-widest text-teal-900">{code}</div>
          <IconBtn label="Copy code" className="size-13" onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); toast('Referral code copied: ' + code) }}>📋</IconBtn>
        </div>
      </Card>
      <Btn className="bg-[#1FA855] hover:bg-[#178a45]" onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank')}>💬 Share on WhatsApp</Btn>
      <div className="h-2.5" />
      <Btn v="outline" onClick={() => toast('SMS link copied. Share: neev.in/ref/' + code)}>Share link via SMS</Btn>
      <Section>Your referrals</Section>
      <Empty icon="👥">No referrals yet. Share your code to get started.</Empty>
      <Section>Neev Sakhi community</Section>
      <Card>
        <p className="mb-2 text-[13px] text-muted">{s.company ? `12 colleagues from ${s.company} joined Neev this month.` : 'Join 500+ workers already using Neev.'}</p>
        {SAKHI.map((x, i) => (
          <div key={x.name} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
            <span className="grid size-7 place-items-center rounded-full bg-gold-100 text-[12px] font-bold text-gold-600">{i + 1}</span>
            <span className="flex-1"><b className="block text-[13px]">{x.name}</b><span className="text-[11px] text-muted">{x.company} · {x.referrals} referrals</span></span>
            <b className="text-[13px] text-teal-700">{x.points} pts</b>
          </div>
        ))}
      </Card>
    </Screen>
  )
}

export function Loyalty() {
  const s = useApp()
  const tier = [...LOYALTY_TIERS].reverse().find(x => s.loyaltyPoints >= x.min)
  const next = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(tier) + 1]
  const pct = next ? Math.min(100, Math.round(((s.loyaltyPoints - tier.min) / (next.min - tier.min)) * 100)) : 100
  const ways = [['Take a salary advance', 10], ['Pay a bill / recharge', 5], ['UPI scan & pay', 5], ['Buy insurance', 15], ['Invest in gold / funds', 10], ['Refer a colleague who joins', 25]]
  return (
    <Screen title="Loyalty points">
      <div className="mb-3 rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 p-5 text-white shadow-lift">
        <div className="flex items-start justify-between">
          <div><p className="text-[12px] text-teal-100/80">Total points</p><b className="font-display text-5xl">{s.loyaltyPoints}</b></div>
          <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: tier.bg, color: tier.color }}>{tier.name}</span>
        </div>
        {next && <>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: pct + '%' }} /></div>
          <p className="mt-2 text-[12px] text-teal-100/80">{next.min - s.loyaltyPoints} more points to reach {next.name}</p>
        </>}
      </div>
      <Section>Ways to earn</Section>
      <Card>{ways.map(([k, n]) => <Row key={k} k={k} v={<span className="text-ok">+{n} pts</span>} />)}</Card>
      <Card className="mt-3 border-teal-100 bg-teal-50"><b className="text-[13px] text-teal-900">🎁 Redeem — coming soon</b>
        <p className="mt-1 text-[12px] text-muted">Trade points for fee waivers and cashback.</p></Card>
      <Section>Points history</Section>
      {s.pointsHistory.length ? <Card>{s.pointsHistory.map((p, i) => <Row key={i} k={p.reason} v={<span className="text-ok">+{p.amount}</span>} />)}</Card>
        : <Empty icon="🏅">No points yet. Take an advance, pay a bill or invest to start earning.</Empty>}
    </Screen>
  )
}


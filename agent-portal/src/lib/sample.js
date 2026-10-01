// ~500 sample app users so the funnel looks real in a demo (toggle in the top bar hides them).
// Seeded random → the same people and numbers every time. Shape: 500 downloads → ~300 opened schemes
// → ~100 clicked a scheme → ~50 started filling → ~20 added to cart → ~12 paid.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Ramesh', 'Sita', 'Mohan', 'Anita', 'Suresh', 'Pooja', 'Rakesh', 'Sunita', 'Vijay', 'Kavita', 'Arjun', 'Meena', 'Rajendra', 'Geeta', 'Sanjay', 'Rekha', 'Manoj', 'Lakshmi', 'Deepak', 'Asha', 'Imran', 'Farida', 'Gurpreet', 'Harpreet']
const LAST = ['Kumar', 'Devi', 'Yadav', 'Singh', 'Patel', 'Sharma', 'Verma', 'Gupta', 'Khan', 'Das', 'Rao', 'Naik', 'Gill', 'Mandal']
const STATES = ['Delhi', 'Uttar Pradesh', 'Bihar', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Jharkhand', 'Karnataka', 'West Bengal']
const SCHEMES = [
  ['e-Shram Card', ['Aadhaar card', 'Aadhaar-linked mobile', 'Bank account details']],
  ['PM Shram Yogi Maandhan', ['Aadhaar card', 'Savings / Jan Dhan bank account', 'Mobile number']],
  ['PM Suraksha Bima Yojana', ['Aadhaar card', 'Bank account']],
  ['Atal Pension Yojana', ['Aadhaar card', 'Savings bank account', 'Mobile number']],
  ['Construction Workers Welfare Board', ['Aadhaar card', '90-day work certificate', 'Bank passbook', 'Passport-size photo']],
  ['PM Awas Yojana (Urban 2.0)', ['Aadhaar of all family members', 'Income certificate', 'Self-declaration of no pucca house', 'Bank account details']],
  ['Ayushman Bharat (PM-JAY)', ['Aadhaar card', 'Ration card', 'Mobile number']],
  ['Sukanya Samriddhi Yojana', ["Daughter's birth certificate", 'Parent Aadhaar & PAN', 'Address proof']],
]
const COMPANIES = ['Zomato', 'Swiggy', 'BuildRight Constructions', 'QuickServe Retail', 'SecureGuard Services', 'Urban Company', 'Porter']
const DAY = 86400000

export function makeSample(now = Date.now()) {
  const r = rng(20260930), r2 = rng(20261001)
  const pick = a => a[Math.floor(r() * a.length)]
  const people = [], apps = [], stageOverrides = {}
  for (let i = 0; i < 500; i++) {
    const signup = now - Math.floor(r() * 60) * DAY - Math.floor(r() * DAY)
    const at = (prev, maxDays) => prev + Math.floor(r() * maxDays * DAY) + 3600000
    const mobile = String(7000000000 + Math.floor(r() * 2999999999))
    const first = pick(FIRST)
    const female = ['Sita', 'Anita', 'Pooja', 'Sunita', 'Kavita', 'Meena', 'Geeta', 'Rekha', 'Lakshmi', 'Asha', 'Farida', 'Harpreet'].includes(first)
    const state = pick(STATES)
    const p = {
      mobile, name: `${first} ${pick(LAST)}`, state, sample: true, signupAt: new Date(signup).toISOString(), funnel: {},
      gender: female ? 'Female' : 'Male', dob: `${1 + Math.floor(r() * 28)}-${1 + Math.floor(r() * 12)}-${1975 + Math.floor(r() * 25)}`,
      aadhaarLast4: String(1000 + Math.floor(r() * 9000)), address: `Ward ${1 + Math.floor(r() * 40)}, ${state}`,
      answers: { LiveState: state, MonthlyIncome: r() < 0.6 ? 14999 : 15000, Occupation: pick(['Construction', 'Delivery', 'Domestic', 'Factory', 'Vendor']),
        FamilyIncome: pick([100000, 120000, 250000, 250000, 300000]), Pf: r() < 0.4 ? 'yes' : 'no', Marital: pick(['Married', 'Married', 'Unmarried']),
        Children: Math.floor(r() * 4), Ration: pick(['Priority', 'Priority', 'Antyodaya', 'Other', 'None']), AnyTaxGovt: 'no' },
    }
    const f = p.funnel
    let t = signup
    if (r() < 0.6) { t = at(t, 5); f.schemesOpened = t
      if (r() < 0.34) { t = at(t, 2); f.schemeClicked = t
        if (r() < 0.5) { t = at(t, 1); f.formStarted = t
          if (r() < 0.4) { t = at(t, 1); f.cartAdded = t
            if (r() < 0.6) { t = at(t, 1); f.paid = t } } } } }
    // Aadhaar step (sales dashboard) uses its own random stream so the rest of the sample stays unchanged.
    if (f.schemesOpened && (f.schemeClicked || r2() < 0.55)) f.aadhaarGiven = f.schemesOpened + 120000
    if (f.schemeClicked) p.clickedScheme = SCHEMES[Math.floor(r2() * SCHEMES.length)][0]
    if (f.aadhaarGiven) p.hasPan = r2() < 0.45 // PAN is optional
    p.company = r2() < 0.55 ? COMPANIES[Math.floor(r2() * COMPANIES.length)] : '' // employer linked in the loan flow
    for (const k in f) f[k] = new Date(f[k]).toISOString()
    people.push(p)

    if (!f.formStarted) continue
    const n = 1 + Math.floor(r() * (f.cartAdded ? 3 : 2))
    const chosen = [...SCHEMES].sort(() => r() - 0.5).slice(0, n)
    chosen.forEach(([scheme, docs], j) => {
      const status = f.paid ? 'paid' : f.cartAdded ? 'cart' : 'draft'
      const missing = status === 'draft' ? docs : docs.filter(() => r() < 0.3)
      const id = `S${i}-${j}`
      apps.push({ id, sample: true, owner: mobile, applicant: p.name, mobile, state: p.state, scheme, status, docsMissing: missing,
        docs: Object.fromEntries(docs.map(d => [d, !missing.includes(d)])), formData: {}, address: p.address,
        paymentRef: status === 'paid' ? `NEEVSCH${String(i).padStart(8, '0')}` : undefined,
        createdAt: f.formStarted, cartAt: f.cartAdded, paidAt: f.paid, amount: status === 'paid' ? 49 : 0 })
      // Some older paid applications have already been filed on the government portal.
      if (status === 'paid' && !missing.length && r() < 0.6) stageOverrides[id] = { stage: 'filled', outcome: pick(['in_process', 'in_process', 'approved', 'approved', 'disapproved']) }
    })
  }
  return { people, apps, stageOverrides }
}

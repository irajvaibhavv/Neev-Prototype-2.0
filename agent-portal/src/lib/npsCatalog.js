// Starter catalogue for the super admin (Oct 2026): six pension / insurance / ID schemes, from the
// research doc the user shared (PIB, PMO, PFRDA sources in each `url`). Replaces the app-synced
// schemeCatalog.json for now — the old import is commented out in schemes.js and fields.js.
// Same shape as schemeCatalog.json; `elig` seeds the Eligibility tab. Eligibility uses only the scheme's own
// information fields (age = its Date of birth field) — no gender / document / app-question rules.

// Every scheme asks for these.
const BASE_DOCS = ['Aadhaar card']
const BASE_FIELDS = ['Full name', 'Date of birth', 'Aadhaar number', 'Mobile number']

// Field definitions (Master data → Fields seeds from these).
export const FIELD_DEFS = {
  'Full name': { type: 'text', desc: 'As printed on Aadhaar — no initials.' },
  'Date of birth': { type: 'date', desc: 'As printed on Aadhaar.' },
  'Aadhaar number': { type: 'text', desc: '12-digit Aadhaar number.' },
  'Mobile number': { type: 'text', desc: '10-digit mobile number, ideally the one linked to Aadhaar.' },
  'Bank / post office account number': { type: 'text', desc: 'Savings account the scheme is linked to (auto-debit / pension credit).' },
  'IFSC': { type: 'text', desc: 'IFSC of the savings account branch.' },
  'Nominee name': { type: 'text', desc: 'Person who receives the benefit.' },
  'Nominee relationship': { type: 'dropdown', options: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Other'], desc: 'Relationship of the nominee to the applicant.' },
  "Spouse's name": { type: 'text', desc: 'Needed for APY — the spouse gets the pension after the subscriber.', required: false },
  'Monthly pension chosen': { type: 'dropdown', options: ['₹1,000', '₹2,000', '₹3,000', '₹4,000', '₹5,000'], desc: 'Guaranteed pension from age 60; sets the contribution.' },
  'Contribution frequency': { type: 'dropdown', options: ['Monthly', 'Quarterly', 'Half-yearly'], desc: 'How often the contribution is auto-debited.' },
  'Income tax payer': { type: 'yesno', desc: 'Income tax payers can’t join APY (from 1 Oct 2022).' },
  "Father's / parent's name": { type: 'text', desc: 'Full name, no initials.' },
  'Address': { type: 'text', desc: 'Current address for communication.' },
  'Ration card number': { type: 'text', desc: 'Only if the state asks for it.', required: false },
  'Family members': { type: 'number', desc: 'Number of family members to be covered.' },
  "Minor's name": { type: 'text', desc: 'The account is opened in the child’s name.' },
  "Minor's date of birth": { type: 'date', desc: 'Child must be below 18.' },
  "Guardian's PAN": { type: 'text', desc: '10-character PAN of the parent / guardian (or Form 60).' },
  'Pension fund choice': { type: 'text', desc: 'Pension fund manager the guardian picks.' },
  'PAN number': { type: 'text', desc: '10-character PAN.' },
  'Family members to cover': { type: 'dropdown', options: ['Self', 'Self + spouse', 'Self + spouse + children'], desc: 'Self, spouse and up to 2 dependent children (parents excluded).' },
  'Sum insured': { type: 'number', desc: 'Between ₹1 lakh and ₹30 lakh.' },
  'Good health declaration': { type: 'yesno', desc: 'Applicant confirms the Good Health Declaration.' },
}

// Document help text (Master data → Documents seeds from these).
export const DOC_HELP = {
  'Aadhaar card': 'Aadhaar for identity and e-KYC.',
  'APY registration form': 'Filled and signed APY subscriber registration form.',
  'Savings account details': 'Passbook or cancelled cheque of the savings / post office account.',
  'Consent-cum-declaration form': 'Signed PMJJBY consent-cum-declaration (auto-debit) form.',
  'Proof of identity, address & date of birth': 'e.g. passport, driving licence, voter ID. Not needed for Instant e-PAN (Aadhaar only).',
  'Ration card': 'Only if the state asks for it.',
  "Minor's date of birth proof": 'Birth certificate, passport, etc.',
  "Guardian's PAN or Form 60": 'PAN card of the parent / guardian, or Form 60 if they have none.',
  'NRE / NRO bank account proof': 'Only for NRI / OCI guardians.',
  'Passport-size photo': 'Recent colour photo.',
  'PAN card': 'PAN card of the applicant.',
  'Address proof': 'Any valid address proof.',
  'Bank proof': 'Passbook or cancelled cheque.',
  'Signed Good Health Declaration': 'Signed declaration for the health insurance policy.',
}

// Eligibility rule on one of the scheme's own information fields (shape: BLANK_ELIG.custom in schemes.js).
const rule = (name, r) => {
  const f = FIELD_DEFS[name]
  return { kind: 'field', name, type: f.type, options: f.options || [], op: f.type === 'yesno' ? 'is' : 'eq', value: '', value2: '', values: [], ...r }
}

const scheme = ({ fields, docs, optionalFields = [], optionalDocs = [], ...s }) => ({
  scope: 'Central', ...s,
  docs: [...BASE_DOCS, ...docs],
  fields: [...BASE_FIELDS, ...fields],
  optionalDocs,
  optionalFields: [...optionalFields, ...Object.keys(FIELD_DEFS).filter(f => FIELD_DEFS[f].required === false && fields.includes(f))],
})

export default [
  scheme({
    name: 'Atal Pension Yojana (APY)', icon: '👴',
    desc: 'Pension scheme for unorganised sector workers. Guaranteed pension of ₹1,000–₹5,000/month from age 60.',
    url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/may/doc202558551701.pdf',
    fields: ['Bank / post office account number', 'IFSC', 'Nominee name', 'Nominee relationship', "Spouse's name", 'Monthly pension chosen', 'Contribution frequency', 'Income tax payer'],
    docs: ['APY registration form', 'Savings account details'],
    elig: { minAge: 18, maxAge: 40, custom: [rule('Income tax payer', { value: 'no' })] },
  }),
  scheme({
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)', icon: '🛡️',
    desc: '₹2 lakh life cover (death from any cause) for ₹436/year, auto-debited. Cover period 1 June – 31 May, renewed yearly.',
    url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/may/doc202558551501.pdf',
    fields: ['Bank / post office account number', 'IFSC', 'Nominee name', 'Nominee relationship'],
    docs: ['Consent-cum-declaration form'],
    elig: { minAge: 18, maxAge: 50 },
  }),
  scheme({
    name: 'PAN Card', icon: '🪪',
    desc: '10-character ID issued by the Income Tax Department. Apply via Protean or UTIITSL (fee about ₹101–107), or get a free Instant e-PAN via Aadhaar.',
    url: '',
    fields: ["Father's / parent's name", 'Address'],
    docs: ['Proof of identity, address & date of birth'],
    optionalDocs: ['Proof of identity, address & date of birth'],
    elig: {},
  }),
  scheme({
    name: 'Ayushman Bharat PM-JAY', icon: '🏥',
    desc: 'Free treatment up to ₹5 lakh per family per year at empanelled hospitals.',
    url: 'https://pmindia.gov.in/en/news_updates/cabinet-approves-health-coverage-to-all-senior-citizens-of-the-age-70-years-and-above-irrespective-of-income-under-ayushman-bharat-pradhan-mantri-jan-arogya-yojana-ab-pm-jay/',
    fields: ['Ration card number', 'Family members'],
    docs: ['Ration card'],
    optionalDocs: ['Ration card'],
    elig: {},
  }),
  scheme({
    name: 'NPS Vatsalya', icon: '👶',
    desc: 'Pension savings account for children, regulated by PFRDA. Minimum contribution ₹250/year, no upper limit.',
    url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/sep/doc2024920398401.pdf',
    fields: ["Minor's name", "Minor's date of birth", "Guardian's PAN", 'Pension fund choice'],
    docs: ["Minor's date of birth proof", "Guardian's PAN or Form 60", 'NRE / NRO bank account proof'],
    optionalDocs: ['NRE / NRO bank account proof'],
    elig: {},
  }),
  scheme({
    name: 'NPS Swasthya', icon: '💊',
    desc: 'NPS account with a mandatory super top-up health insurance policy. Up to 25% of contributions can be withdrawn for medical bills, paid directly to the hospital. Sum insured ₹1 lakh – ₹30 lakh.',
    url: 'https://www.pfrda.org.in',
    fields: ['PAN number', 'Address', 'Family members to cover', 'Sum insured', 'Good health declaration'],
    docs: ['Passport-size photo', 'PAN card', 'Address proof', 'Bank proof', 'Signed Good Health Declaration'],
    elig: { minAge: 18, maxAge: 70,
      custom: [rule('Sum insured', { op: 'between', value: '100000', value2: '3000000' }), rule('Good health declaration', { value: 'yes' })] },
  }),
]

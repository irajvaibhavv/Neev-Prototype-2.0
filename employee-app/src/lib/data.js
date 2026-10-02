// Static demo data (ported from employee/js/*.js).
import { S } from '../store.js'

export const KNOWN_COMPANIES = {
  'BuildRight Constructions': { initial: 'B', color: '#0B4F45', dept: 'Site Labour', desig: 'Mason', region: 'Pune' },
  'QuickServe Logistics': { initial: 'Q', color: '#DB8E0C', dept: 'Delivery', desig: 'Rider', region: 'Mumbai' },
  'SecureGuard Facilities': { initial: 'S', color: '#3B5A9A', dept: 'Security', desig: 'Guard', region: 'Delhi NCR' },
  Zomato: { initial: 'Z', color: '#E23744', dept: 'Delivery', desig: 'Rider', region: 'Mumbai' },
  Swiggy: { initial: 'S', color: '#FC8019', dept: 'Delivery', desig: 'Rider', region: 'Delhi NCR' },
  'Urban Company': { initial: 'U', color: '#1B1B1B', dept: 'Services', desig: 'Technician', region: 'Delhi NCR' },
  BigBasket: { initial: 'B', color: '#84C225', dept: 'Delivery', desig: 'Rider', region: 'Mumbai' },
  Dunzo: { initial: 'D', color: '#00B97A', dept: 'Delivery', desig: 'Rider', region: 'Pune' },
  Porter: { initial: 'P', color: '#2C3E50', dept: 'Logistics', desig: 'Driver', region: 'Mumbai' },
  Rapido: { initial: 'R', color: '#E0B800', dept: 'Delivery', desig: 'Rider', region: 'Delhi NCR' },
}

export const AADHAAR_SAMPLE = { number: '1234 5678 9012', name: 'Ramesh Kumar', dob: '15/06/1994', gender: 'Male', addr: 'H.No. 214, Ward No. 6, Najafgarh, South West Delhi, Delhi, 110043' }

export const KYC_CONSENTS = [
  { key: 'ckyc', icon: '🪪', title: 'CKYC', desc: 'Central KYC registry check' },
  { key: 'cibil', icon: '📊', title: 'CIBIL', desc: 'Credit score for better rates' },
  { key: 'epfo', icon: '🏛️', title: 'EPFO', desc: 'Verify employment & PF' },
  { key: 'esic', icon: '🏥', title: 'ESIC', desc: 'Verify insurance coverage' },
]
export const LOAN_PERMS = ['cibil', 'epfo', 'esic']

export const AA_ACCOUNTS = [
  { bank: 'State Bank of India', last4: '1234' },
  { bank: 'HDFC Bank', last4: '5678' },
]

// ===== Loans: earned-wage maths =====
export const accrued = () => (S.salary * S.currentDay) / S.daysInMonth
export const outstanding = () => S.loans.filter(l => l.status === 'Active').reduce((a, l) => a + l.amount, 0)
export const eligible = () => Math.max(0, Math.floor((accrued() * 0.7 - outstanding()) / 1000) * 1000)
export const APR = Math.round((15 / 1000) * 100 * 52)
export const tenureWeeks = () => Math.max(1, Math.round((S.payDay - S.currentDay) / 7))
export function charges(amt, weeks = tenureWeeks()) {
  const charge = (amt / 1000) * 15 * weeks
  const gst = Math.round(charge * 0.18)
  return { amt, weeks, charge, gst, net: amt - charge - gst }
}
export const REASONS = [
  ['medical', '🏥', 'Medical'], ['personal', '👤', 'Personal'], ['education', '📚', 'Education'], ['other', '📝', 'Others'],
]

export const INSURANCE = {
  health: { title: 'Health Insurance', icon: '🏥', sub: 'Cover from ₹1L · from ₹49/mo', plans: [
    { name: 'Health — Basic', cover: 100000, premium: 49 },
    { name: 'Health — Family', cover: 300000, premium: 99 },
    { name: 'Health — Plus', cover: 500000, premium: 149 }] },
  vehicle: { title: 'Two-Wheeler Insurance', icon: '🏍️', sub: 'Third-party & own damage', plans: [
    { name: 'Third-party only', cover: 'Legal liability cover', premium: 29 },
    { name: 'Comprehensive', cover: 'Third-party + own damage', premium: 79 }] },
  accident: { title: 'Personal Accident', icon: '🦺', sub: 'For daily-wage & gig work · from ₹19/mo', plans: [
    { name: 'Accident — Basic', cover: 200000, premium: 19 },
    { name: 'Accident — Plus', cover: 500000, premium: 39 }] },
}

export const GOLD_RATE = 6250
export const MF_FUNDS = [
  { amc: 'SBI Mutual Fund', scheme: 'SBI Liquid Fund', icon: '🏦', risk: 'Low risk', returns: '~6-7% p.a.', min: 500 },
  { amc: 'HDFC Mutual Fund', scheme: 'HDFC Money Market Fund', icon: '🏛️', risk: 'Low risk', returns: '~6-7% p.a.', min: 500 },
  { amc: 'ICICI Prudential Mutual Fund', scheme: 'ICICI Pru Savings Fund', icon: '💠', risk: 'Low-moderate risk', returns: '~7-8% p.a.', min: 500 },
  { amc: 'Axis Mutual Fund', scheme: 'Axis Balanced Advantage Fund', icon: '📊', risk: 'Moderate risk', returns: '~9-11% p.a.', min: 500 },
]

export const BILLERS = {
  mobile: { title: 'Mobile Recharge', icon: '📱', short: 'Mobile', label: 'Mobile number', ph: 'e.g. 98XXXXXXXX' },
  dth: { title: 'DTH Recharge', icon: '📺', short: 'DTH', label: 'Subscriber ID', ph: 'e.g. 1023456789' },
  movie: { title: 'Movie Tickets', icon: '🎬', short: 'Movies', label: 'Theatre / booking ref', ph: 'e.g. PVR Saket' },
  electricity: { title: 'Electricity Bill', icon: '💡', short: 'Electricity', label: 'Consumer number', ph: 'e.g. 100234567' },
  gas: { title: 'Gas Bill', icon: '🔥', short: 'Gas', label: 'Consumer number', ph: 'e.g. 200456789' },
  water: { title: 'Water Bill', icon: '💧', short: 'Water', label: 'Consumer number', ph: 'e.g. 300789123' },
  broadband: { title: 'Broadband Bill', icon: '🌐', short: 'Broadband', label: 'Account ID', ph: 'e.g. BB-4021' },
  emi: { title: 'Pay Loan EMI', icon: '💳', short: 'Loan EMI', label: 'Loan Account (LAN)', ph: 'e.g. 5832012026' },
}
export const MERCHANTS = [
  { name: 'Raju General Store', upi: 'rajustore@upi' },
  { name: 'Sharma Tea Stall', upi: 'sharmatea@upi' },
  { name: 'City Medical Store', upi: 'citymedical@upi' },
]

export const LOYALTY_TIERS = [
  { name: 'Bronze', min: 0, color: '#8C6A4A', bg: '#F1E7DC' },
  { name: 'Silver', min: 100, color: '#5C6E68', bg: '#E9EEEC' },
  { name: 'Gold', min: 300, color: '#9A6B00', bg: '#FFF4DE' },
  { name: 'Platinum', min: 600, color: '#0B4F45', bg: '#DCEEE8' },
]
export const SAKHI = [
  { name: 'Sunita Devi', company: 'QuickServe Logistics', referrals: 14, points: 350 },
  { name: 'Meena Devi', company: 'BuildRight Constructions', referrals: 9, points: 225 },
  { name: 'Anil Singh', company: 'SecureGuard Facilities', referrals: 6, points: 150 },
]
export const GRIEVANCE_TYPES = {
  wrong_deduction: 'Wrong amount deducted from salary', delayed_credit: 'Money not credited to my bank',
  wrong_charge: 'Incorrect charges applied', employer_issue: 'Employer did not transfer salary',
  kyc_issue: 'KYC verification problem', other: 'Something else',
}

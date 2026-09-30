// Readable labels for the eligibility answers the employee app stores in profile.schemeProfile.
// Mirrors SP_QUESTIONS in employee/js/schemes.js — update both together.
const YN = { yes: 'Yes', no: 'No' }
export const ANSWER_LABELS = [
  ['LiveState', 'State they live in', null],
  ['MonthlyIncome', 'Own monthly income', { 14999: 'Below ₹15,000', 15000: '₹15,000 or more' }],
  ['Occupation', 'Work', { Construction: 'Construction', Delivery: 'Delivery / gig', Domestic: 'Domestic help', Factory: 'Factory / security', Farmer: 'Farmer', Vendor: 'Street vendor', Other: 'Other' }],
  ['FamilyIncome', "Family's yearly income", { 100000: 'Up to ₹1 lakh', 120000: '₹1 – 1.2 lakh', 250000: '₹1.2 – 2.5 lakh', 300000: '₹2.5 – 3 lakh', 400000: '₹3 – 4 lakh', 600000: '₹4 – 6 lakh', 900000: '₹6 – 9 lakh', 99999999: 'Above ₹9 lakh' }],
  ['Pf', 'PF / ESIC cut from salary', YN],
  ['Marital', 'Marital status', { Married: 'Married', Unmarried: 'Unmarried', Single: 'Widowed / divorced' }],
  ['Children', 'Children', { 4: '4+' }],
  ['DaughterU10', 'Daughter below 10', YN],
  ['Daughter10to18', 'Daughter aged 10–18', YN],
  ['Ration', 'Ration card', { Antyodaya: 'Antyodaya (AAY)', Priority: 'Priority / BPL', Other: 'Other card (APL / state)', None: 'No ration card' }],
  ['SelfTax', 'Pays income tax (self)', YN],
  ['Tax', 'Family member pays income tax / GST', YN],
  ['Govt', 'Govt / PSU job or pension in family', YN],
  ['Pension', 'Gets a govt pension / allowance', YN],
  ['OwnHome', 'Family owns a pucca house', YN],
  ['Car', 'Family owns a car / jeep', YN],
]
export function answerRows(answers = {}) {
  return ANSWER_LABELS.filter(([k]) => answers[k] !== undefined)
    .map(([k, label, map]) => [label, map?.[answers[k]] ?? String(answers[k])])
}

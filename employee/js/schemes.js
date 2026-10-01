// Neev Employee App — Government Schemes: Aadhaar + common questions → eligibility-matched schemes.
// Scheme list + rules come from research (Sep 2026) — see docs/research/scheme-eligibility/.
let agentFormScheme=null;
const SCHEME_FEE=49; // ₹ per scheme, paid once for the whole cart

// Funnel tracking for the manager portal (agent-portal/): first time each step happens, per user.
// downloaded = has an account; then schemesOpened → aadhaarGiven → schemeClicked → formStarted → cartAdded → paid.
function trackFunnel(step){
  S.funnel=S.funnel||{};
  if(!S.funnel[step]){ S.funnel[step]=new Date().toISOString(); saveCurrentProfile(); }
}

// One application per scheme: status 'draft' (started filling) → 'cart' → 'paid'.
// Paid + all documents = complete; paid + missing documents = pending (manager portal sections).
const schemeApps=()=>(S.schemeApplications=S.schemeApplications||[]);
const openAppFor=name=>schemeApps().find(a=>a.scheme===name&&a.status!=='paid');
const cartApps=()=>schemeApps().filter(a=>a.status==='cart');

// Each scheme: rule(p) → 'yes' (criteria fully covered by our questions),
// 'maybe' (official list / unverified criteria decide it — user must confirm), or false.
// `check` = criteria we can't ask simply; shown as "Also check" text. p is built in buildEligProfile().
const CENTRAL_SCHEMES=[
  {name:'Construction Workers Welfare Board',icon:'🔧',win:'Pension, accident & maternity aid',desc:'Registration with your state BOCW board — pension, accident, maternity, children\'s education and daughter\'s marriage aid.',url:'https://labour.gov.in',tag:'Labour',
   rule:p=>p.construction&&p.age>=18&&p.age<=60&&'yes',
   check:'90+ days of construction work in the last 12 months (certificate from employer, contractor or union). Registration fee about ₹20–50.',
   docs:['Aadhaar card','90-day work certificate','Bank passbook','Passport-size photo']},
  {name:'PM Shram Yogi Maandhan',icon:'👷',win:'₹3,000/month pension at 60',desc:'₹3,000/month pension from age 60. You pay ₹55–200/month, the government matches it.',url:'https://maandhan.in',tag:'Pension',
   rule:p=>p.age>=18&&p.age<=40&&p.monthlyIncome<15000&&!p.pf&&!p.selfTax&&'yes',
   check:'You are not in NPS.',
   docs:['Aadhaar card','Savings / Jan Dhan bank account','Mobile number']},
  {name:'e-Shram Card',icon:'🪪',win:'National worker ID card',desc:'National ID for unorganised workers — gateway to welfare schemes and disaster relief.',url:'https://eshram.gov.in',tag:'Labour',
   rule:p=>p.age>=16&&p.age<=59&&!p.pf&&'yes',
   check:'Mobile number linked to Aadhaar (or register with biometrics at a CSC).',
   docs:['Aadhaar card','Aadhaar-linked mobile','Bank account details']},
  {name:'Atal Pension Yojana',icon:'👴',win:'₹1,000–5,000/month pension',desc:'Guaranteed pension of ₹1,000–5,000/month from age 60.',url:'https://www.npscra.nsdl.co.in/scheme-details.php',tag:'Pension',
   rule:p=>p.age>=18&&p.age<=40&&!p.selfTax&&'yes',
   check:'Needs a savings bank or post office account.',
   docs:['Aadhaar card','Savings bank account','Mobile number']},
  {name:'PM Suraksha Bima Yojana',icon:'🛡️',win:'₹2 lakh accident cover',desc:'₹2 lakh accident cover for just ₹20 a year.',url:'https://jansuraksha.gov.in',tag:'Insurance',
   rule:p=>p.age>=18&&p.age<=70&&'yes',
   check:'Needs a bank account with auto-debit.',
   docs:['Aadhaar card','Bank account']},
  {name:'PM Jeevan Jyoti Bima Yojana',icon:'💙',win:'₹2 lakh life cover',desc:'₹2 lakh life cover for ₹436 a year.',url:'https://jansuraksha.gov.in',tag:'Insurance',
   rule:p=>p.age>=18&&p.age<=50&&'yes',
   check:'Needs a bank account with auto-debit.',
   docs:['Aadhaar card','Bank account']},
  {name:'PM Awas Yojana (Urban 2.0)',icon:'🏠',win:'Up to ₹2.5 lakh for a house',desc:'Up to ₹2.5 lakh help to build or buy your first pucca house.',url:'https://pmaymis.gov.in',tag:'Housing',
   rule:p=>!p.ownHome&&'maybe', // income limit (₹9L) not asked — almost no user is above it; shown in check
   check:'Family income up to ₹9 lakh a year (about ₹75,000 a month). No housing benefit from any government scheme in the last 20 years. House in the woman\'s name or joint name.',
   docs:['Aadhaar of all family members','Income certificate','Self-declaration of no pucca house','Bank account details']},
  {name:'Sukanya Samriddhi Yojana',icon:'👧',win:'High-interest savings for your daughter',desc:'High-interest savings account for your daughter\'s education and marriage.',url:'https://www.indiapost.gov.in',tag:'Savings',
   rule:p=>p.daughterU10&&'yes',
   check:'Up to 2 daughters per family.',
   docs:["Daughter's birth certificate",'Parent Aadhaar & PAN','Address proof']},
  {name:'Ayushman Bharat (PM-JAY)',icon:'🏥',win:'₹5 lakh free treatment',desc:'Free hospital treatment up to ₹5 lakh per family per year.',url:'https://beneficiary.nha.gov.in',tag:'Health',
   rule:p=>p.age>=70?'yes':((p.lowCard||p.construction||p.occupation==='Domestic')&&'maybe'),
   check:'Below 70, eligibility depends on the SECC-2011 / state list — check your name on beneficiary.nha.gov.in or at a CSC.',
   docs:['Aadhaar card','Ration card','Mobile number']},
  {name:'PM-KISAN',icon:'🌾',win:'₹6,000 a year',desc:'₹6,000/year to farmer families in three instalments.',url:'https://pmkisan.gov.in',tag:'Agriculture',
   rule:p=>p.farmer&&!p.tax&&!p.govt&&'maybe',
   check:'Farm land must be in your name. No family member gets a pension of ₹10,000+/month or is a doctor, lawyer, engineer or CA.',
   docs:['Aadhaar card','Land records','Bank passbook']},
  {name:'PM SVANidhi',icon:'🛒',win:'Loan up to ₹50,000',desc:'Collateral-free loans of ₹15,000 → ₹25,000 → ₹50,000 for street vendors.',url:'https://pmsvanidhi.mohua.gov.in',tag:'Loan',
   rule:p=>p.occupation==='Vendor'&&'maybe',
   check:'Need a Certificate of Vending or recommendation letter from your municipality.',
   docs:['Aadhaar card','Vending certificate / LoR','Bank account']},
  {name:'PM Ujjwala Yojana',icon:'🔥',win:'Free LPG connection',desc:'Free LPG connection with first refill for poor households.',url:'https://pmuy.gov.in',tag:'Welfare',
   rule:p=>p.female&&p.age>=18&&p.lowCard&&'maybe',
   check:'No LPG connection in the household already.',
   docs:['Aadhaar card','Ration card','Bank account']},
  {name:'Ration Card (NFSA)',icon:'🍚',win:'Free 5 kg grain per person',desc:'Free food grains — 5 kg per person per month (35 kg for Antyodaya families).',url:'https://nfsa.gov.in',tag:'Food',
   rule:p=>p.ration==='None'&&!p.tax&&!p.govt&&!p.car&&'maybe',
   check:'Your state decides who is a priority household — apply at the food & supply office or CSC.',
   docs:['Aadhaar of all family members','Income certificate','Residence proof','Passport-size photo']},
];

const STATE_SCHEMES={
  'Delhi':[
    {name:'Delhi Lakshmi Yojana',icon:'👩',win:'₹2,500/month',desc:'₹2,500/month for women.',url:'https://wcd.delhi.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.age<=60&&p.familyIncome<=250000&&!p.tax&&!p.govt&&!p.pension&&!p.car&&p.children<=3&&'maybe',
     check:'Must be the eldest eligible woman in the family, a registered Delhi voter, you/husband/parent living in Delhi 10+ years, electricity under 2,400 units/year, no criminal case.',
     docs:['Aadhaar card','Delhi voter ID','10-year residence proof','MP/MLA recommendation']},
  ],
  'Bihar':[
    {name:'Mukhyamantri Mahila Rojgar Yojana',icon:'👩',win:'₹10,000 to start work',desc:'₹10,000 to start a livelihood, up to ₹2 lakh more later.',url:'https://brlps.in',tag:'Livelihood',
     rule:p=>p.female&&p.age>=18&&p.age<=60&&'maybe',
     check:'Must be a JEEViKA self-help group member (you can join one). One woman per family.',
     docs:['Aadhaar card','Bank account in own name','JEEViKA SHG details']},
    {name:'Mukhyamantri Kanya Utthan',icon:'👩‍🎓',win:'Up to ₹50,000 for your daughter',desc:'₹25,000 on passing Class 12, ₹50,000 on graduation for daughters.',url:'https://medhasoft.bihar.gov.in',tag:'Education',
     rule:p=>p.daughter10to18&&!p.govt&&'maybe',
     check:'Up to 2 daughters per family. Amount depends on exam result and passing year.',
     docs:['Marksheet','Aadhaar card','Bihar residence certificate','Bank account']},
  ],
  'Uttar Pradesh':[
    {name:'Kanya Sumangala Yojana',icon:'👧',win:'₹25,000 for your daughter',desc:'₹25,000 in 6 stages from birth to graduation for daughters.',url:'https://mksy.up.gov.in',tag:'Welfare',
     rule:p=>(p.daughterU10||p.daughter10to18)&&p.familyIncome<=300000&&p.children<=2&&'yes',
     check:'UP resident family. Max 2 children (twins exception).',
     docs:["Daughter's birth certificate",'Parent Aadhaar card','UP residence proof','Income certificate']},
  ],
  'Maharashtra':[
    {name:'Majhi Ladki Bahin Yojana',icon:'👩',win:'₹1,500/month',desc:'₹1,500/month for women.',url:'https://ladakibahin.maharashtra.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.age<=65&&p.familyIncome<=250000&&!p.tax&&!p.car&&!p.govt&&!p.pension&&'yes',
     check:'Only one unmarried woman per family; max two women per family. Annual e-KYC required.',
     docs:['Aadhaar card','Maharashtra domicile / ration card','Income certificate or yellow/orange ration card','Bank passbook']},
    {name:'Mahatma Jyotiba Phule Jan Arogya',icon:'🏥',win:'₹5 lakh free treatment',desc:'Cashless treatment up to ₹5 lakh per family per year.',url:'https://www.jeevandayee.gov.in',tag:'Health',
     rule:p=>'yes',
     check:'Maharashtra resident with ration card or domicile certificate.',
     docs:['Aadhaar card','Ration card or domicile certificate']},
  ],
  'Rajasthan':[
    {name:'MAA Yojana (formerly Chiranjeevi)',icon:'🏥',win:'₹25 lakh health cover',desc:'Health cover up to ₹25 lakh per family per year.',url:'https://maayojana.rajasthan.gov.in',tag:'Health',
     rule:p=>!p.govt&&'yes',
     check:'Free for NFSA ration card families, small farmers and contract workers; others pay ₹850/year. Needs Jan Aadhaar.',
     docs:['Jan Aadhaar card','Aadhaar card']},
    {name:'Shri Annapurna Rasoi',icon:'🍛',win:'Full meal for ₹8',desc:'Full meal for ₹8.',url:'https://rajasthan.gov.in',tag:'Food',
     rule:p=>'yes',
     check:'Open to everyone — just visit a Rasoi.',
     docs:['None needed']},
  ],
  'Madhya Pradesh':[
    {name:'Ladli Bahna Yojana',icon:'👩',win:'₹1,500/month',desc:'₹1,500/month for married women.',url:'https://cmladlibahna.mp.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.marital!=='Unmarried'&&p.age>=21&&p.age<60&&p.familyIncome<=250000&&!p.tax&&!p.govt&&!p.car&&!p.pension&&'maybe',
     check:'New registrations open only in special windows. Family land up to 5 acres. Needs Samagra ID.',
     docs:['Samagra ID','Aadhaar card (linked to bank)','Bank passbook']},
    {name:'Ladli Laxmi Yojana',icon:'👧',win:'About ₹1.43 lakh for your daughter',desc:'About ₹1.43 lakh over school years and at age 21 for daughters.',url:'https://ladlilaxmi.mp.gov.in',tag:'Welfare',
     rule:p=>(p.daughterU10||p.daughter10to18)&&!p.tax&&'maybe',
     check:'First two daughters; family planning after the second child. Register early — usually before age 5.',
     docs:["Daughter's birth certificate",'Samagra ID','Parent Aadhaar']},
  ],
  'Jharkhand':[
    {name:'Maiyan Samman Yojana',icon:'👩',win:'₹2,500/month',desc:'₹2,500/month for women.',url:'https://mmmsy.jharkhand.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=18&&p.age<50&&p.anyCard&&!p.tax&&!p.govt&&!p.pf&&!p.pension&&'yes',
     check:'Single Aadhaar-linked bank account in your name.',
     docs:['Aadhaar card','Ration card','Bank passbook']},
  ],
  'Karnataka':[
    {name:'Gruha Lakshmi',icon:'👩',win:'₹2,000/month',desc:'₹2,000/month to the woman head of family.',url:'https://sevasindhugs.karnataka.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.anyCard&&!p.tax&&!p.govt&&'yes',
     check:'You must be named head of family on the ration card.',
     docs:['Aadhaar card','Ration card (you as head)','Bank passbook linked to Aadhaar']},
    {name:'Anna Bhagya',icon:'🍚',win:'Free rice + food kit',desc:'Free rice + Indira food kit every month.',url:'https://ahara.kar.nic.in',tag:'Food',
     rule:p=>p.lowCard&&'yes',
     check:'Automatic for AAY/BPL card holders — collect at your ration shop.',
     docs:['AAY/BPL ration card','Aadhaar of family members']},
  ],
  'Tamil Nadu':[
    {name:'Kalaignar Magalir Urimai Thogai',icon:'👩',win:'₹1,000/month',desc:'₹1,000/month for women head of family.',url:'https://kmut.tn.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.familyIncome<=250000&&p.anyCard&&!p.car&&!p.tax&&!p.govt&&'yes',
     check:'Named head of family on ration card. Land within limits (5 acres wet / 10 acres dry). No professional-tax payer in family.',
     docs:['Aadhaar card','Family ration card','Bank passbook','Electricity bill']},
    {name:"CM's Comprehensive Health Insurance (CMCHIS)",icon:'🏥',win:'Cashless treatment',desc:'Cashless treatment at empanelled hospitals.',url:'https://www.cmchistn.com',tag:'Health',
     rule:p=>p.familyIncome<=120000&&'yes',
     check:'Income certificate from VAO.',
     docs:['Ration card','VAO income certificate','Aadhaar card']},
  ],
  'West Bengal':[
    {name:'Annapurna Bhandar',icon:'👩',win:'₹3,000/month',desc:'₹3,000/month for women aged 25–60 (replaced Lakshmir Bhandar).',url:'https://wb.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=25&&p.age<=60&&!p.tax&&!p.govt&&'yes',
     check:'On the WB electoral roll; Aadhaar-seeded bank account in your name.',
     docs:['Aadhaar card','Voter ID','Bank passbook']},
  ],
  'Gujarat':[
    {name:'PMJAY-MA (Mukhyamantri Amrutum)',icon:'🏥',win:'₹10 lakh health cover',desc:'Health cover up to ₹10 lakh per family per year.',url:'https://pmjay.gov.in',tag:'Health',
     rule:p=>(p.lowCard||p.familyIncome<=400000)&&'yes',
     check:'Gujarat resident.',
     docs:['Aadhaar card','Income certificate or NFSA ration card']},
    {name:'Namo Lakshmi Yojana',icon:'👩‍🎓',win:'₹50,000 for your daughter',desc:'₹50,000 for daughters studying in Class 9–12.',url:'https://www.digitalgujarat.gov.in',tag:'Education',
     rule:p=>p.daughter10to18&&p.familyIncome<=600000&&'maybe',
     check:'Daughter must be in Class 9–12 — confirm with her school (private-school rules unclear).',
     docs:['School ID / bonafide certificate','Aadhaar card','Income certificate','Bank account']},
  ],
  'Odisha':[
    {name:'Subhadra Yojana',icon:'👩',win:'₹10,000 a year',desc:'₹10,000/year for women (two ₹5,000 instalments).',url:'https://subhadra.odisha.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.age<=60&&(p.anyCard||p.familyIncome<=250000)&&!p.tax&&!p.govt&&!p.car&&!p.pension&&'yes',
     check:'Family land within limits.',
     docs:['Aadhaar card','Ration card / income certificate','Bank passbook']},
    {name:'Gopabandhu Jan Arogya Yojana',icon:'🏥',win:'₹5 lakh health cover',desc:'₹5 lakh health cover per family (+₹5 lakh for women).',url:'https://health.odisha.gov.in',tag:'Health',
     rule:p=>p.anyCard&&'yes',
     check:'Needs an NFSA / SFSS ration card.',
     docs:['Aadhaar card','NFSA/SFSS ration card']},
  ],
  'Punjab':[
    {name:'Mukh Mantri Sehat Yojana',icon:'🏥',win:'₹10 lakh health cover',desc:'₹10 lakh cashless health cover for every Punjab family.',url:'https://sha.punjab.gov.in',tag:'Health',
     rule:p=>'yes',
     check:'Punjab resident with Punjab voter ID (for Sehat Card).',
     docs:['Aadhaar card','Punjab voter ID']},
    {name:'Smart Ration Card (Atta-Dal)',icon:'🍚',win:'Free wheat every month',desc:'Free wheat every month for NFSA families.',url:'https://epos.punjab.gov.in',tag:'Food',
     rule:p=>p.lowCard&&'yes',
     check:'Collect at your ration depot with the smart card.',
     docs:['Smart ration card','Aadhaar of family members']},
  ],
  'Haryana':[
    {name:'Deen Dayal Lado Lakshmi Yojana',icon:'👩',win:'₹2,100/month',desc:'₹2,100/month for women (₹1,100 cash + ₹1,000 deposit).',url:'https://meraparivar.haryana.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=23&&p.familyIncome<=100000&&!p.tax&&!p.pension&&'maybe',
     check:'Family income as verified in Parivar Pehchan Patra (PPP); Haryana resident for 15+ years.',
     docs:['Parivar Pehchan Patra (PPP)','Aadhaar card','Bank passbook']},
    {name:'Chirayu Ayushman Bharat',icon:'🏥',win:'₹5 lakh health cover',desc:'₹5 lakh health cover — free up to ₹1.8 lakh income, ₹1,500/year up to ₹3 lakh.',url:'https://chirayu.haryana.gov.in',tag:'Health',
     rule:p=>p.familyIncome<=300000&&'yes',
     check:'Income as verified in Parivar Pehchan Patra (PPP).',
     docs:['Parivar Pehchan Patra (PPP)','Aadhaar card']},
  ],
};

function getStateFromAddress(){
  const addr=(S.address||S.currentAddress||'').toLowerCase();
  for(const st of Object.keys(STATE_SCHEMES)){
    if(addr.includes(st.toLowerCase())) return st;
  }
  return 'Delhi';
}

function ageFromDob(dob){
  const m=(dob||'').match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if(!m) return 30;
  const now=new Date(), b=new Date(+m[3],+m[2]-1,+m[1]);
  let age=now.getFullYear()-b.getFullYear();
  if(now<new Date(now.getFullYear(),b.getMonth(),b.getDate())) age--;
  return age;
}

// Eligibility questions — one per screen, in 3 levels (shortened flow: Haqdarshak / myScheme research,
// docs/research/haqdarshak-onboarding/). Income brackets end exactly on real scheme thresholds
// (₹1L, 1.2L, 2.5L, 3L, 4L, 6L, 9L a year) and store the bracket's upper bound, so rules compare with <=.
//  - `auto`: filled from the loan flow (salary, occupation) — not asked; changeable via "Edit answers".
//  - `gate`/`show`: asked only when relevant; once the gate answer rules it out, `hidden` is the implied answer.
//  - Every question can be skipped. Unanswered = unknown: schemes that depend on it are 'locked', never 'yes'.
//  - Only questions that can still unlock a scheme are asked (see spQueue).
const YES_NO=[['yes','Yes'],['no','No']];
const DEPT_TO_OCCUPATION={'Site Labour':'Construction','Delivery':'Delivery','Logistics':'Delivery','Services':'Delivery','Security':'Factory'};
const hasKids=a=>a.Children>0;
const anyTaxGovt=a=>a.AnyTaxGovt==='yes';
const SP_LEVELS=['','Work','Family','Home'];
const SP_QUESTIONS=[
  {f:'Occupation',lvl:1,ic:'💼',q:'What work do you do?',cols:3,opts:[
    ['Construction','Construction','','🏗️'],['Delivery','Delivery / gig','','🛵'],['Domestic','Domestic help','','🧹'],
    ['Factory','Factory / security','','🏭'],['Farmer','Farmer','','🌾'],['Vendor','Street vendor','','🛒'],['Other','Other','','💼']],
   auto:()=>(S.company&&DEPT_TO_OCCUPATION[S.department])||undefined},
  {f:'Pf',lvl:1,ic:'🧾',q:'Is PF or ESIC cut from your salary?',opts:YES_NO},
  {f:'AnyTaxGovt',lvl:1,ic:'🏛️',q:'Anyone in your family pays income tax / GST, or has a govt job or pension?',opts:YES_NO},
  {f:'SelfTax',lvl:1,ic:'🧾',q:'Have you ever paid income tax?',opts:YES_NO,gate:'AnyTaxGovt',show:anyTaxGovt,hidden:'no'},
  {f:'Tax',lvl:1,ic:'👨‍👩‍👧',q:'Does anyone else pay income tax or GST?',opts:YES_NO,gate:'AnyTaxGovt',show:anyTaxGovt,hidden:'no'},
  {f:'Govt',lvl:1,ic:'🏢',q:'Anyone has a govt / PSU job (even contract) or govt pension?',opts:YES_NO,gate:'AnyTaxGovt',show:anyTaxGovt,hidden:'no'},
  {f:'Pension',lvl:1,ic:'👵',q:'Do you get a govt pension or allowance?',opts:YES_NO,gate:'AnyTaxGovt',show:anyTaxGovt,hidden:'no'},
  {f:'Ration',lvl:2,ic:'🍚',q:'Which ration card do you have?',opts:[['Antyodaya','Antyodaya (AAY)'],['Priority','BPL / Priority'],['Other','Other (APL)'],['None','No card']]},
  {f:'FamilyIncome',lvl:2,ic:'👨‍👩‍👧',q:'Whole family earns how much a month?',num:true,opts:[
    [100000,'Up to ₹8,000'],[120000,'₹8,000 – 10,000'],[250000,'₹10,000 – 20,000'],[300000,'₹20,000 – 25,000'],
    [400000,'₹25,000 – 33,000'],[600000,'₹33,000 – 50,000'],[900000,'₹50,000 – 75,000'],[99999999,'Above ₹75,000']]},
  {f:'Marital',lvl:2,ic:'💍',q:'Are you married?',cols:3,opts:[['Married','Married'],['Unmarried','Not married'],['Single','Widowed / divorced']]},
  {f:'Children',lvl:2,ic:'👶',q:'How many children?',num:true,cols:5,opts:[[0,'0'],[1,'1'],[2,'2'],[3,'3'],[4,'4+']]},
  {f:'DaughterU10',lvl:2,ic:'👧',q:'Do you have a daughter below 10?',opts:YES_NO,gate:'Children',show:hasKids,hidden:'no'},
  {f:'Daughter10to18',lvl:2,ic:'👧',q:'Do you have a daughter aged 10–18?',opts:YES_NO,gate:'Children',show:hasKids,hidden:'no'},
  {f:'MonthlyIncome',lvl:3,ic:'💰',q:'Your own monthly income?',num:true,opts:[[14999,'Below ₹15,000'],[15000,'₹15,000 or more']],
   auto:()=>S.salary?(S.salary<15000?14999:15000):undefined},
  {f:'OwnHome',lvl:3,ic:'🏠',q:'Does your family own a pucca house?',opts:YES_NO},
  {f:'Car',lvl:3,ic:'🚗',q:"Does your family own a car or jeep? (tractor doesn't count)",opts:YES_NO},
];
const SP_KEYS=SP_QUESTIONS.map(q=>q.f);
const spQ=f=>SP_QUESTIONS.find(q=>q.f===f);
const spVals=f=>{ const q=spQ(f); return q.opts.map(o=>q.num?+o[0]:o[0]); };
const spOpen=(q,a)=>!q.gate||(a[q.gate]!==undefined&&q.show(a));
const spIsAuto=q=>q.auto&&q.auto()!==undefined&&!spEditAuto[q.f];
let spAns={}, spEditAuto={}, spMode='more', spCur=null, spDone=new Set(), spCheckpoint=0, spShelfSeen=new Set();

// Answers + loan-profile values + implied answers for questions a known gate answer rules out.
function spResolve(a){
  const out={...a};
  SP_QUESTIONS.forEach(q=>{
    if(out[q.f]===undefined&&spIsAuto(q)) out[q.f]=q.auto();
    if(q.gate&&out[q.gate]!==undefined&&!q.show(out)) out[q.f]=q.hidden;
  });
  return out;
}

function buildEligProfile(sp){
  return {
    age:ageFromDob(S.dob), female:S.gender==='Female',
    monthlyIncome:sp.MonthlyIncome, familyIncome:sp.FamilyIncome,
    pf:sp.Pf==='yes', selfTax:sp.SelfTax==='yes', tax:sp.SelfTax==='yes'||sp.Tax==='yes', pension:sp.Pension==='yes', govt:sp.Govt==='yes',
    ration:sp.Ration, lowCard:sp.Ration==='Antyodaya'||sp.Ration==='Priority', anyCard:sp.Ration!=='None',
    ownHome:sp.OwnHome==='yes', car:sp.Car==='yes',
    occupation:sp.Occupation, construction:sp.Occupation==='Construction', farmer:sp.Occupation==='Farmer',
    marital:sp.Marital, children:sp.Children,
    daughterU10:sp.DaughterU10==='yes', daughter10to18:sp.Daughter10to18==='yes',
  };
}
// Answers each profile field reads (mirror of buildEligProfile).
const P_KEYS={monthlyIncome:['MonthlyIncome'],familyIncome:['FamilyIncome'],pf:['Pf'],selfTax:['SelfTax'],tax:['SelfTax','Tax'],
  pension:['Pension'],govt:['Govt'],ration:['Ration'],lowCard:['Ration'],anyCard:['Ration'],ownHome:['OwnHome'],car:['Car'],
  occupation:['Occupation'],construction:['Occupation'],farmer:['Occupation'],marital:['Marital'],children:['Children'],
  daughterU10:['DaughterU10'],daughter10to18:['Daughter10to18']};
// ponytail: a rule's inputs are read from its source text (p.<field>) — fine while rules stay simple expressions.
const ruleKeys=s=>s._keys||(s._keys=[...new Set((String(s.rule).match(/p\.\w+/g)||[]).flatMap(m=>P_KEYS[m.slice(2)]||[]))]);

// Unanswered questions a rule reads are tried with every possible answer.
// Never true → not shown. Always true → 'yes' ('maybe' if any case is maybe). Depends on the answer → 'locked',
// with `needs` = questions whose answer changes the result (a gated question maps to its gate until that is answered).
function schemeStatus(s,a){
  const unknown=ruleKeys(s).filter(k=>a[k]===undefined);
  const combos=unknown.reduce((acc,k)=>acc.flatMap(c=>spVals(k).map(v=>({...c,[k]:v}))),[{}]);
  const rs=combos.map(c=>s.rule(buildEligProfile(spResolve({...a,...c}))));
  if(rs.every(r=>!r)) return null;
  if(rs.every(r=>r)) return {status:rs.includes('maybe')?'maybe':'yes',needs:[]};
  const matters=k=>{ const seen={}; return combos.some((c,i)=>{ const id=JSON.stringify({...c,[k]:null}), t=!!rs[i];
    if(id in seen) return seen[id]!==t; seen[id]=t; return false; }); };
  const needs=unknown.filter(matters).map(k=>{ const q=spQ(k); return q.gate&&a[q.gate]===undefined?q.gate:k; });
  return {status:'locked',needs:[...new Set(needs)]};
}

function eligibleSchemes(sp=S.schemeProfile){
  const a=spResolve(sp), state=sp.LiveState, out=[];
  const add=(list,scope)=>list.forEach(s=>{ const r=schemeStatus(s,a); if(r) out.push({...s,scope,...r}); });
  add(CENTRAL_SCHEMES,'Central');
  add(STATE_SCHEMES[state]||[],state);
  const rank={yes:0,maybe:1,locked:2};
  return out.sort((x,y)=>rank[x.status]-rank[y.status]);
}
const foundSchemes=sp=>eligibleSchemes(sp).filter(s=>s.status!=='locked');
const newlyFound=(before,sp)=>foundSchemes(sp).filter(s=>!before.includes(s.name));

// Home tile entry: once Aadhaar is known and any answers are saved, go straight to results.
function openSchemes(){
  trackFunnel('schemesOpened');
  if(S.aadhaar) trackFunnel('aadhaarGiven'); // e.g. already verified in loan KYC
  if(S.aadhaar&&S.gender&&S.dob&&S.schemeProfile){ renderSchemes(); go('s-schemes'); return; }
  openSchemeProfile();
}

// mode 'more' = only questions that can still unlock something; 'edit' = every question, current answers selected.
function openSchemeProfile(mode){
  spMode=mode||'more'; spDone=new Set(); spCheckpoint=0;
  const saved=S.schemeProfile||{};
  spAns={}; spEditAuto={};
  SP_KEYS.forEach(k=>{ if(saved[k]!==undefined) spAns[k]=saved[k]; });
  // Profiles saved before the gate question existed: derive it from the four detail answers.
  if(spAns.AnyTaxGovt===undefined&&saved.SelfTax!==undefined)
    spAns.AnyTaxGovt=['SelfTax','Tax','Govt','Pension'].some(k=>saved[k]==='yes')?'yes':'no';
  // A saved answer that differs from the loan-profile value means the user changed it.
  SP_QUESTIONS.forEach(q=>{ if(q.auto&&spAns[q.f]!==undefined&&q.auto()!==undefined&&String(spAns[q.f])!==String(q.auto())) spEditAuto[q.f]=true; });
  const hasAadhaar=S.aadhaar&&S.gender&&S.dob;
  document.getElementById('spAadhaarInputBlock').style.display=hasAadhaar?'none':'block';
  document.getElementById('spAadhaarStep').style.display='block';
  document.getElementById('spPanStep').style.display='none';
  document.getElementById('spScanChoice').style.display='block';
  document.getElementById('spVerifyBtn').style.display='block';
  document.getElementById('spVerifying').style.display='none';
  document.getElementById('spAadhaarInput').value=S.aadhaar||'';
  document.getElementById('spQuiz').style.display='none';
  go('s-scheme-profile');
  if(hasAadhaar) spStart();
}

// State defaults to the Aadhaar state (client ask: e.g. Aadhaar from Bihar but working in Delhi — user can switch).
function spStart(){
  if(!S.schemeState) S.schemeState=getStateFromAddress();
  const sel=document.getElementById('spLiveState');
  sel.innerHTML=Object.keys(STATE_SCHEMES).map(st=>'<option value="'+st+'">'+st+'</option>').join('');
  sel.value=(S.schemeProfile&&S.schemeProfile.LiveState)||S.schemeState;
  document.getElementById('spQuiz').style.display='block';
  spShelfSeen=new Set(foundSchemes(spAnswers()).map(s=>s.name));
  const first=spQueue()[0];
  if(!first) return spFinish();
  spCur=first.f;
  renderSp();
}

const spAnswers=()=>({...spAns,LiveState:document.getElementById('spLiveState').value||S.schemeState});
function spQueue(){
  const sp=spAnswers(), a=spResolve(sp);
  const need=spMode==='edit'?null:new Set(eligibleSchemes(sp).flatMap(s=>s.needs));
  return SP_QUESTIONS.filter(q=>spOpen(q,a)&&(spMode==='edit'||!spIsAuto(q)&&(spDone.has(q.f)||(sp[q.f]===undefined&&need.has(q.f)))));
}

function renderSp(){
  const sp=spAnswers(), all=eligibleSchemes(sp), queue=spQueue();
  const found=all.filter(s=>s.status!=='locked').length, locked=all.length-found;
  const q=spQ(spCur), pos=queue.indexOf(q);
  document.getElementById('spFound').textContent=found;
  document.getElementById('spLocked').textContent=locked;
  renderSpShelf(all);
  // Level stepper: finished levels ✓, current one highlighted.
  const lvl=spCheckpoint?spCheckpoint+0.5:q.lvl;
  document.getElementById('spLevels').innerHTML=[1,2,3].map(n=>
    '<span class="sp-lv'+(n<lvl?' done':n===lvl?' cur':'')+'">'+(n<lvl?'✓ ':'')+SP_LEVELS[n]+'</span>').join('');
  const step=document.getElementById('spStep');
  if(spCheckpoint){
    const left=queue.length-pos;
    step.innerHTML='<div class="sp-card sp-check"><div class="sp-trophy">🏆</div>'
      +'<p class="sp-qt">Level '+spCheckpoint+' complete!</p>'
      +'<p class="sp-check-sub">'+(locked?'🔒 '+locked+' more to unlock · just '+left+' question'+(left!==1?'s':''):'All done')+'</p>'
      +'<button class="btn btn-primary" onclick="spKeepGoing()">Keep going →</button>'
      +'<button class="sp-skip" onclick="spFinish()">See my schemes</button></div>';
    return;
  }
  const cur=spResolve(sp)[q.f];
  step.innerHTML='<div class="sp-card"><div class="sp-ic">'+q.ic+'</div>'
    +'<p class="sp-qt">'+q.q+'</p>'
    +spChips(q,cur,'selectSpChip')+'<button class="sp-skip" onclick="skipSp()">Skip</button></div>';
  if(S.voiceLang==='voice') speak(q.q);
}
// Unlocked schemes stay on screen for the whole quiz; ones unlocked by the last answer pop in with a NEW tag.
function renderSpShelf(all){
  const found=all.filter(s=>s.status!=='locked');
  document.getElementById('spShelf').innerHTML=found.length?found.map(s=>{
    const isNew=!spShelfSeen.has(s.name);
    return '<div class="sp-won'+(isNew?' new':'')+'">'+(isNew?'<em>NEW</em>':'')+'<span class="sp-won-ic">'+s.icon+'</span>'
      +'<b>'+s.name+'</b><i>'+s.win+'</i></div>';
  }).join(''):'<p class="sp-shelf-empty">Answer to unlock your first scheme 🔓</p>';
  const el=document.getElementById('spShelf'), first=el.querySelector('.new');
  if(first&&el.scrollTo) el.scrollTo({left:first.offsetLeft-el.offsetLeft-8,behavior:'smooth'});
  spShelfSeen=new Set(found.map(s=>s.name));
}
const spChips=(q,cur,fn)=>'<div class="opt-grid'+(q.cols?' cols-'+q.cols:'')+'">'+q.opts.map(([v,label,,ic])=>
  '<button type="button" class="opt-chip'+(String(cur)===String(v)?' sel':'')+'" onclick="'+fn+'(\''+q.f+'\',\''+v+'\')">'
  +(ic?'<span class="ic">'+ic+'</span>':'')+label+'</button>').join('')+'</div>';

function selectSpChip(f,v){
  const q=spQ(f);
  spAns[f]=q.num?+v:v;
  if(q.auto) spEditAuto[f]=true;
  spDone.add(f);
  spSave();
  spNext();
}
function skipSp(){ spDone.add(spCur); spNext(); }
function spNext(){
  const cur=spQ(spCur), nxt=spQueue().find(q=>SP_QUESTIONS.indexOf(q)>SP_QUESTIONS.indexOf(cur));
  if(!nxt) return spFinish();
  spCheckpoint=spMode!=='edit'&&nxt.lvl>cur.lvl?cur.lvl:0;
  spCur=nxt.f;
  renderSp();
}
function spKeepGoing(){ spCheckpoint=0; renderSp(); }
// On a checkpoint spCur is already the next question, so "previous" is the last question of the finished level.
function spBack(){
  const quiz=document.getElementById('spQuiz').style.display!=='none';
  const prev=quiz&&spQueue().filter(q=>SP_QUESTIONS.indexOf(q)<SP_QUESTIONS.indexOf(spQ(spCur))).pop();
  if(!prev){ goBack('s-home'); return; }
  spCheckpoint=0; spCur=prev.f; renderSp();
}
function onSpStateChange(){ spSave(); renderSp(); }
function spSave(){ S.schemeProfile=spAnswers(); saveCurrentProfile(); }
function spFinish(){ spSave(); renderSchemes(); go('s-schemes'); }

function setSchemeAadhaarBusy(icon,text){
  document.getElementById('spScanChoice').style.display='none';
  document.getElementById('spVerifyBtn').style.display='none';
  document.getElementById('spVerifyingIcon').textContent=icon;
  document.getElementById('spVerifyingText').textContent=text;
  document.getElementById('spVerifying').style.display='block';
}

// After Aadhaar: optional PAN (skipped if loan KYC already has it). Kept apart from S.panNumber so typing a PAN
// here never skips the DigiLocker KYC the loan flow needs.
function finishSchemeAadhaar(msg){
  S.schemeState=getStateFromAddress();
  applyProfileFields();
  trackFunnel('aadhaarGiven');
  toast(msg);
  if(S.panNumber||S.schemePan){ startSchemeQuiz(); return; }
  document.getElementById('spAadhaarStep').style.display='none';
  document.getElementById('spIdName').textContent=S.name||'';
  document.getElementById('spPanInput').value='';
  document.getElementById('spPanStep').style.display='block';
}
function saveSchemePan(){
  const v=document.getElementById('spPanInput').value.trim().toUpperCase();
  if(!v){ startSchemeQuiz(); return; }
  if(!/^[A-Z]{5}\d{4}[A-Z]$/.test(v)){ toast('Enter a valid PAN, e.g. ABCDE1234F'); return; }
  S.schemePan=v;
  saveCurrentProfile();
  startSchemeQuiz();
}
function startSchemeQuiz(){
  document.getElementById('spAadhaarInputBlock').style.display='none';
  spStart();
}

function verifySchemeAadhaar(){
  const num=document.getElementById('spAadhaarInput').value.replace(/\s/g,'');
  if(!/^\d{12}$/.test(num)){toast('Enter a valid 12-digit Aadhaar number');return;}
  setSchemeAadhaarBusy('⏳','Fetching details from UIDAI…');
  setTimeout(()=>{
    S.aadhaar=num.replace(/(\d{4})(?=\d)/g,'$1 ');
    if(!S.name||S.name==='User') S.name='Ramesh Kumar';
    S.gender='Male';
    S.dob='15-03-1992';
    finishSchemeAadhaar('✅ Aadhaar verified');
  },1500);
}

// OCR path: shared camera-permission modal (signup.js) calls runSchemeAadhaarScan() when S._camForScheme is set.
function scanSchemeAadhaar(){
  S._camForScheme=true;
  document.getElementById('cameraPermModal').classList.add('show');
}
function runSchemeAadhaarScan(){
  setSchemeAadhaarBusy('📷','Reading your Aadhaar card…');
  setTimeout(()=>{
    // Mock OCR result (AADHAAR_SAMPLE from signup.js)
    S.aadhaar=AADHAAR_SAMPLE.number;
    if(!S.name||S.name==='User') S.name=AADHAAR_SAMPLE.name;
    S.gender=AADHAAR_SAMPLE.gender;
    S.dob=AADHAAR_SAMPLE.dob;
    if(!S.address) S.address=AADHAAR_SAMPLE.addr;
    finishSchemeAadhaar('✅ Aadhaar card scanned');
  },1600);
}

// Results: unlock card (next question that can unlock something, answered in place) + found schemes, details folded.
function renderSchemes(){
  const sp=S.schemeProfile, all=eligibleSchemes(sp);
  const found=all.filter(s=>s.status!=='locked'), locked=all.filter(s=>s.status==='locked');
  document.getElementById('schemeCountText').textContent='✅ '+found.length+' scheme'+(found.length!==1?'s':'')+' for you';
  document.getElementById('schemeStateHint').textContent=(locked.length?'🔒 '+locked.length+' more to unlock · ':'')+'Central + '+sp.LiveState;
  let html=unlockCard(locked);
  if(!found.length) html+='<div class="card center-col" style="padding:20px;"><div style="font-size:28px;">🔍</div><p class="muted" style="margin-top:6px;text-align:center;">No matching schemes yet.</p></div>';
  found.forEach(s=>{
    const badge=s.status==='yes'
      ?'<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:#E6F6EC;color:var(--success);">✅ Eligible</span>'
      :'<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:var(--marigold-100);color:var(--marigold-600);">🔎 May be eligible</span>';
    html+=`<div class="card">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <div class="scheme-ic">${s.icon}</div>
        <div style="flex:1;">
          <b style="font-size:14px;">${s.name}</b>
          <p class="scheme-win">${s.win}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">${badge}<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:var(--teal-100);color:var(--teal-700);">${s.scope}</span></div>
        </div>
      </div>
      <details class="scheme-more"><summary>Details & documents</summary>
        <p style="margin:8px 0 6px;">${s.desc}</p>
        <p style="margin:0 0 8px;"><b>Also check:</b> ${s.check}</p>
        <b>📄 Documents needed</b>
        ${docsToAsk(s).length?`<ul style="margin:4px 0 0 16px;padding:0;">${docsToAsk(s).map(d=>'<li>'+d+'</li>').join('')}</ul>`
          :'<p style="margin:4px 0 0;">None — we already have what\'s needed.</p>'}
      </details>
      <div style="display:flex;gap:8px;">
        <div style="flex:1;text-align:center;">
          <button class="btn btn-outline btn-sm" style="width:100%;" onclick="openScheme('${s.url}')">Apply Yourself</button>
          <p class="muted" style="font-size:11px;margin-top:4px;">Free of cost</p>
        </div>
        <div style="flex:1;text-align:center;">${applyButton(s)}</div>
      </div>
    </div>`;
  });
  document.getElementById('schemesList').innerHTML=html;
  updateCartBadge();
}

function unlockCard(locked){
  const keys=new Set(locked.flatMap(s=>s.needs)), q=SP_QUESTIONS.find(q=>keys.has(q.f));
  if(!q) return '';
  const names=locked.filter(s=>s.needs.includes(q.f)).map(s=>s.icon+' '+s.name);
  return '<div class="card sp-unlock-card"><div class="sp-unlock-head"><b>🔒 Unlock '+locked.length+' more</b>'
    +'<span class="ag-link" onclick="openSchemeProfile()">Answer all →</span></div>'
    +'<p class="sp-qt-sm">'+q.ic+' '+q.q+'</p>'+spChips(q,undefined,'answerUnlock')
    +'<p class="muted" style="font-size:11px;margin-top:8px;">Could unlock: '+names.slice(0,2).join(', ')+(names.length>2?' +'+(names.length-2)+' more':'')+'</p></div>';
}
function answerUnlock(f,v){
  const q=spQ(f), before=foundSchemes(S.schemeProfile).map(s=>s.name);
  S.schemeProfile={...S.schemeProfile,[f]:q.num?+v:v};
  saveCurrentProfile();
  const fresh=newlyFound(before,S.schemeProfile);
  renderSchemes();
  toast(fresh.length?'🎉 '+fresh[0].name+' — '+fresh[0].win+(fresh.length>1?' · +'+(fresh.length-1)+' more':''):'Saved ✓');
}

function applyButton(s){
  const q=s.name.replace(/'/g,"\\'");
  const paid=schemeApps().find(a=>a.scheme===s.name&&a.status==='paid');
  const inCart=schemeApps().find(a=>a.scheme===s.name&&a.status==='cart');
  if(paid) return '<button class="btn btn-outline btn-sm" style="width:100%;" disabled>Applied ✓</button><p class="muted" style="font-size:11px;margin-top:4px;">'+(paid.docsMissing.length?'Documents pending':'Complete')+'</p>';
  if(inCart) return '<button class="btn btn-outline btn-sm" style="width:100%;" onclick="openSchemeCart()">In cart 🛒</button><p class="muted" style="font-size:11px;margin-top:4px;">Tap to pay</p>';
  return '<button class="btn btn-primary btn-sm" style="width:100%;" onclick="openAgentForm(\''+q+'\')">Apply via Neev</button><p class="muted" style="font-size:11px;margin-top:4px;">₹'+SCHEME_FEE+'</p>';
}

// Application-form fields per scheme — built ONLY from what the official form / portal was CONFIRMED to ask
// (see docs/research/scheme-forms/). Anything not confirmed is deliberately NOT asked here;
// the agent collects it at the visit. Never add a field from memory or an aggregator site.
// Field: {l:label, t:'text'|'tel'|'date'|'yn'|'sel', o:[options], ph, hint, opt:true, must:'yes'|'no', re:RegExp, err, min, if:profile=>bool}
const F=(l,ph,x)=>({l,t:'text',ph,...x});
const YN=(l,must,x)=>({l,t:'yn',must,...x});
const SEL=(l,o,x)=>({l,t:'sel',o,...x});
const RE_MOB=/^\d{10}$/, RE_AADHAAR=/^\d{12}$/, RE_ACC=/^\d{8,18}$/, RE_IFSC=/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const BANK=[F('Bank account number','',{t:'tel',re:RE_ACC,err:'Enter a valid bank account number'}),F('IFSC code','e.g. SBIN0001234',{re:RE_IFSC,err:'Enter a valid IFSC code'})];
const AUTODEBIT=YN('I agree to the yearly premium being auto-debited from this account','yes');
const NOMINEE=[F('Nominee name'),F('Nominee address'),F('Nominee date of birth','',{t:'date'}),F('Nominee relationship to you'),
  F('Nominee mobile','',{t:'tel',opt:true,re:RE_MOB,err:'Nominee mobile must be 10 digits'}),
  F('Guardian name (only if nominee is under 18)','',{opt:true}),F('Guardian relationship to nominee','',{opt:true})];
const JS_FORM='https://www.jansuraksha.gov.in';
const SCHEME_FORM={
  'PM Suraksha Bima Yojana':{src:JS_FORM,fields:[F("Father's / husband's name"),YN('Do you have any disability?'),F('Disability details (if any)','',{opt:true}),
    ...NOMINEE,F('Email','',{opt:true}),...BANK,AUTODEBIT]},
  'PM Jeevan Jyoti Bima Yojana':{src:JS_FORM,fields:[F("Father's / husband's name"),...NOMINEE,F('Email','',{opt:true}),...BANK,AUTODEBIT]},
  'Atal Pension Yojana':{src:'https://www.pfrda.org.in (standard APY form)',fields:[
    F('Spouse name (required if married)','',{if:p=>p.Marital==='Married'}),
    YN('Do you get any other government social-security benefit?'),
    SEL('Pension you want per month',['₹1,000','₹2,000','₹3,000','₹4,000','₹5,000']),SEL('Pay contribution',['Monthly','Quarterly','Half-yearly']),
    F('Nominee name'),F('Nominee relationship to you'),F('Nominee date of birth','',{t:'date'}),F('Guardian name (only if nominee is under 18)','',{opt:true}),
    F('Existing PRAN (if any)','',{opt:true}),F('Email','',{opt:true}),
    F('Bank name'),F('Branch'),BANK[0],AUTODEBIT]},
  'Construction Workers Welfare Board':{src:'https://bocw.delhi.gov.in',fields:[
    F('Days worked in the last 12 months','e.g. 120',{t:'tel',min:90,err:'You need at least 90 days of construction work in the last 12 months'}),
    SEL('Who will give your 90-day work certificate?',['Employer / contractor','Trade union','Self-certificate'])]},
  'PM Awas Yojana (Urban 2.0)':{src:'https://pmaymis.gov.in',fields:[
    F('Husband / wife name (if married)','',{opt:true}),F('Number of unmarried children','',{t:'tel'}),
    YN('Do you own land to build the house on?'),...BANK]},
  'PM Ujjwala Yojana':{src:'https://www.pmuy.gov.in',fields:[
    YN('Does anyone in your household already have an LPG connection?','no'),F('Number of adult family members','',{t:'tel'}),...BANK]},
  'PM SVANidhi':{src:'https://pmsvanidhi.mohua.gov.in',fields:[YN('Is your Aadhaar linked to the mobile number below?','yes')]},
  'Delhi Lakshmi Yojana':{src:'https://dly.delhi.gov.in',fields:[
    F('Delhi voter ID (EPIC) number'),YN('Are you the eldest woman in your family?','yes'),
    SEL('Who has lived in Delhi for 10+ years?',['Me','My husband','My parent']),
    YN('Is your family electricity use 2,400 units a year or less?','yes'),YN('Do you have the MP / MLA endorsement letter?'),
    YN('Are you free of any criminal case?','yes'),
    F('Bank name','',{hint:'Must be a CBDC-participating bank — SBI, ICICI, Axis, HDFC, Kotak and 12 more'}),...BANK]},
  'Ladli Bahna Yojana':{src:'https://cmladlibahna.mp.gov.in',fields:[
    F('Family Samagra ID'),F('Personal Samagra ID'),YN('Is your Aadhaar–Samagra e-KYC already done?'),...BANK,
    YN('Is this account only in your name (not joint) and linked to Aadhaar?','yes')]},
  'Maiyan Samman Yojana':{src:'https://mmmsy.jharkhand.gov.in',fields:[
    SEL('Ration card colour',['Yellow (Antyodaya)','Pink (Priority)','White','Green']),...BANK,
    YN('Is this your only bank account linked to Aadhaar?','yes')]},
  'Kanya Sumangala Yojana':{src:'https://mksy.up.gov.in',fields:[
    F("Father's Aadhaar number",'',{t:'tel',re:RE_AADHAAR,err:"Enter father's 12-digit Aadhaar number"}),
    F("Mother's Aadhaar number",'',{t:'tel',re:RE_AADHAAR,err:"Enter mother's 12-digit Aadhaar number"}),
    F("Daughter's Aadhaar number",'',{t:'tel',re:RE_AADHAAR,err:"Enter daughter's 12-digit Aadhaar number"})]},
  'Mukh Mantri Sehat Yojana':{src:'https://sha.punjab.gov.in',fields:[F('Number of family members to enrol','e.g. 4',{t:'tel'})]},
  'Deen Dayal Lado Lakshmi Yojana':{src:'https://socialjusticehry.gov.in',fields:[
    YN('Have you lived in Haryana for 15+ years?','yes')]},
};

function findScheme(name){
  const st=(S.schemeProfile&&S.schemeProfile.LiveState)||'';
  return [...CENTRAL_SCHEMES,...(STATE_SCHEMES[st]||[])].find(s=>s.name===name);
}
const agRow=(k,v)=>'<div class="ag-row"><span>'+k+'</span><b>'+v+'</b></div>';
let agFields=[], agState={};

function renderAgentField(f,i){
  const req=f.opt?' <span class="muted" style="font-weight:400;text-transform:none;">(optional)</span>':' *';
  const hint=f.hint?'<p class="muted" style="font-size:11px;margin-top:4px;">'+f.hint+'</p>':'';
  let body;
  if(f.t==='yn'||f.t==='sel'){
    const opts=f.t==='yn'?['Yes','No']:f.o;
    body='<div class="opt-grid">'+opts.map((o,j)=>'<button type="button" class="opt-chip'+(agState[i]===o?' sel':'')+'" onclick="agPick('+i+','+j+')">'+o+'</button>').join('')+'</div>';
  } else {
    body='<input type="'+f.t+'" id="agF'+i+'" placeholder="'+(f.ph||'')+'"'+(f.t==='tel'?' inputmode="numeric"':'')+'>';
  }
  return '<div class="field-row" id="agW'+i+'"><label class="field-label">'+f.l+req+'</label>'+body+hint+'</div>';
}
function agPick(i,j){
  const f=agFields[i], opts=f.t==='yn'?['Yes','No']:f.o;
  agState[i]=opts[j];
  document.getElementById('agW'+i).outerHTML=renderAgentField(f,i);
  markFormStarted();
}

// Scheme application form (opens from "Apply via Neev"): Aadhaar + quiz answers arrive prefilled (read-only); the "new details" are only
// fields CONFIRMED from the scheme's official form (SCHEME_FORM). Unverified schemes: agent collects the rest.
function openAgentForm(schemeName){
  const sch=findScheme(schemeName);
  agentFormScheme=schemeName;
  S.schemeClickedName=schemeName; // sales dashboard: which scheme they tapped
  trackFunnel('schemeClicked');
  agDocs={...((openAppFor(schemeName)||{}).docs||{})};
  document.getElementById('agentFormScheme').textContent=(sch?sch.icon+' ':'')+schemeName;
  const aadhaar=(S.aadhaar||'').replace(/\s/g,'');
  const A=spResolve(S.schemeProfile||{});
  const label=q=>{ const o=q.opts.find(o=>String(o[0])===String(A[q.f])); return o?o[1]:'—'; };
  const answers=SP_QUESTIONS.filter(q=>q.f&&q.f!=='AnyTaxGovt'&&A[q.f]!==undefined).map(q=>agRow(q.q.replace(/^↳ /,'').replace(/\?.*$/,''),label(q))).join('');
  document.getElementById('agentPrefill').innerHTML=
    '<details class="ag-prefill"><summary>✅ Already filled from your Aadhaar & answers</summary>'+
    agRow('Name',S.name||'—')+agRow('Gender',S.gender||'—')+agRow('Date of birth',S.dob||'—')+
    agRow('Aadhaar','XXXX XXXX '+aadhaar.slice(-4))+((S.panNumber||S.schemePan)?agRow('PAN','XXXXXX'+(S.panNumber||S.schemePan).slice(-4)):'')+agRow('Address',S.address||'—')+
    agRow('State you live in',A.LiveState||'—')+answers+
    '<p style="margin:8px 0 0;"><span class="ag-link" onclick="closeAgentForm();openSchemeProfile(\'edit\')">Something wrong? Edit answers</span></p></details>';
  const cfg=SCHEME_FORM[schemeName];
  agState={};
  agFields=cfg?cfg.fields:[];
  const fieldsHtml=agFields.map((f,i)=>f.if&&!f.if(A)?'':renderAgentField(f,i)).join('');
  document.getElementById('agentNewFields').innerHTML=
    '<div class="ag-sec">✏️ A few details</div>'+fieldsHtml+
    '<div class="field-row"><label class="field-label">Mobile number *</label><input type="tel" id="agentMobile" inputmode="numeric" maxlength="10" value="'+(S.mobile||'')+'"></div>'+
    '<div class="field-row"><label class="field-label">Current address *</label><input type="text" id="agentAddress" value="'+(S.currentAddress||S.address||'')+'"></div>';
  renderAgentDocs();
  document.getElementById('agentFormBlock').style.display='block';
  document.getElementById('agentAddedBlock').style.display='none';
  document.getElementById('agentModal').classList.add('show');
}

// Mock document upload — one slot per "Documents needed" item. Skipping is allowed (→ Pending after payment).
let agDocs={};

// Documents we already hold — never ask the user to upload these again (minimal-questions rule).
// Returns why we have it, or '' if the user must provide it. Keep this conservative: only exact matches,
// e.g. "Bank passbook" (a copy of the passbook) is still asked even when we know the account.
const BANK_DOCS=['Bank account','Bank account details','Savings bank account','Savings / Jan Dhan bank account','Bank account in own name'];
function docOnFile(d,schemeName){
  const form=SCHEME_FORM[schemeName];
  const formHasBank=!!(form&&form.fields.some(f=>f.l==='Bank account number'));
  if(['Aadhaar card','Parent Aadhaar','Parent Aadhaar card','Address proof','Residence proof'].includes(d)&&S.aadhaar) return 'Aadhaar verified';
  if(d==='Parent Aadhaar & PAN'&&S.aadhaar&&(S.panNumber||S.schemePan)) return 'Aadhaar + PAN on file';
  if(d==='Mobile number'&&S.mobile) return 'OTP verified';
  if(d==='Aadhaar-linked mobile'&&S.mobile&&S.aadhaar) return 'OTP verified';
  if(BANK_DOCS.includes(d)&&(formHasBank||S.bankLast4)) return formHasBank?'asked in the form above':'verified in loan KYC';
  if(d==='None needed') return 'nothing to upload';
  return '';
}
const docsToAsk=s=>s.docs.filter(d=>!docOnFile(d,s.name));

function renderAgentDocs(){
  const sch=findScheme(agentFormScheme); const docs=(sch&&sch.docs)||[];
  const onFile=docs.filter(d=>docOnFile(d,sch.name)), ask=docs.filter(d=>!docOnFile(d,sch.name));
  document.getElementById('agentDocs').innerHTML='<div class="ag-sec">📎 Documents</div>'
    +(onFile.length?'<p style="font-size:12px;margin:0 0 8px;color:var(--success);">✓ Already with us: '+onFile.join(', ')+'</p>':'')
    +(ask.length?'<p class="muted" style="font-size:11px;margin:0 0 8px;">You can also upload later.</p>':'')
    +docs.map((d,i)=>docOnFile(d,sch.name)?'':'<div class="ag-doc"><span>'+(agDocs[d]?'✅ ':'📄 ')+d+'</span>'
      +(agDocs[d]==='uploading'?'<b class="muted">Uploading…</b>'
        :agDocs[d]?'<span class="ag-link" onclick="agentDocUpload('+i+',true)">Remove</span>'
        :'<button type="button" class="btn btn-outline btn-sm" onclick="agentDocUpload('+i+')">📷 Upload</button>')+'</div>').join('');
}
function agentDocUpload(i,remove){
  const d=findScheme(agentFormScheme).docs[i];
  if(remove){ delete agDocs[d]; renderAgentDocs(); return; }
  markFormStarted();
  agDocs[d]='uploading'; renderAgentDocs();
  setTimeout(()=>{ agDocs[d]=true; renderAgentDocs(); },900);
}

// First interaction with the form = "started filling": creates a draft application (manager sees it as Incomplete).
function markFormStarted(){
  trackFunnel('formStarted');
  if(!openAppFor(agentFormScheme)) schemeApps().push({id:'APP'+Date.now(),createdAt:new Date().toISOString(),scheme:agentFormScheme,status:'draft'});
}
function closeAgentForm(){
  document.getElementById('agentModal').classList.remove('show');
}
function submitAgentForm(){
  const A=spResolve(S.schemeProfile||{});
  const data={};
  for(let i=0;i<agFields.length;i++){
    const f=agFields[i];
    if(f.if&&!f.if(A)) continue;
    const isChip=f.t==='yn'||f.t==='sel';
    const v=isChip?(agState[i]||''):document.getElementById('agF'+i).value.trim();
    if(!v){ if(f.opt) continue; toast('Please fill: '+f.l); return; }
    if(f.re&&!f.re.test(v.replace(/\s/g,''))){toast(f.err||'Check: '+f.l);return;}
    if(f.min&&!(+v>=f.min)){toast(f.err||f.l+' must be at least '+f.min);return;}
    if(f.must&&v!==(f.must==='yes'?'Yes':'No')){toast('This scheme needs: '+f.l.replace(/\?$/,'')+' — '+(f.must==='yes'?'Yes':'No')+'. Please check with your agent.');return;}
    data[f.l]=v;
  }
  const mobile=document.getElementById('agentMobile').value.trim();
  const address=document.getElementById('agentAddress').value.trim();
  if(!RE_MOB.test(mobile)){toast('Enter a valid 10-digit mobile number');return;}
  if(!address){toast('Enter your current address');return;}
  if(Object.values(agDocs).includes('uploading')){toast('Please wait for the upload to finish');return;}
  markFormStarted();
  const sch=findScheme(agentFormScheme);
  const docs={}; sch.docs.forEach(d=>{ docs[d]=docOnFile(d,sch.name)?'on-file':!!agDocs[d]; });
  Object.assign(openAppFor(agentFormScheme),{status:'cart',cartAt:new Date().toISOString(),mobile,address,formData:data,docs,
    docsMissing:sch.docs.filter(d=>!docs[d]),state:(S.schemeProfile||{}).LiveState});
  trackFunnel('cartAdded');
  saveCurrentProfile();
  document.getElementById('agentFormBlock').style.display='none';
  document.getElementById('agentAddedText').textContent=agentFormScheme+' is in your cart.'
    +(cartApps().length>1?' You have '+cartApps().length+' schemes in your cart.':'');
  document.getElementById('agentAddedBlock').style.display='block';
  renderSchemes();
}

// ===== Scheme cart (Amazon-style): ₹49 per scheme, one payment for all =====
function updateCartBadge(){
  const n=cartApps().length, el=document.getElementById('schemeCartBadge');
  if(el){ el.textContent=n; el.style.display=n?'grid':'none'; }
}
function openSchemeCart(){
  closeAgentForm();
  renderSchemeCart();
  go('s-scheme-cart');
}
function renderSchemeCart(){
  const items=cartApps();
  document.getElementById('cartResult').style.display='none';
  document.getElementById('cartMain').style.display='block';
  document.getElementById('cartItems').innerHTML=items.length?items.map(a=>{
    const sch=findScheme(a.scheme)||{icon:'📄'};
    return '<div class="card" style="display:flex;gap:12px;align-items:flex-start;">'
      +'<div class="scheme-ic">'+sch.icon+'</div><div style="flex:1;"><b style="font-size:14px;">'+a.scheme+'</b>'
      +'<p style="font-size:12px;margin:4px 0;color:'+(a.docsMissing.length?'var(--marigold-600)':'var(--success)')+';">'
      +(a.docsMissing.length?'⚠️ '+a.docsMissing.length+' document'+(a.docsMissing.length>1?'s':'')+' missing: '+a.docsMissing.join(', '):'✅ All documents uploaded')+'</p>'
      +'<div style="display:flex;gap:14px;margin-top:6px;font-size:12px;"><span class="ag-link" onclick="openAgentForm(\''+a.scheme.replace(/'/g,"\\'")+'\')">Edit</span>'
      +'<span class="ag-link" style="color:var(--danger);" onclick="removeFromCart(\''+a.id+'\')">Remove</span></div></div>'
      +'<b style="font-size:14px;">₹'+SCHEME_FEE+'</b></div>';
  }).join(''):'<div class="card center-col" style="padding:24px;"><div style="font-size:30px;">🛒</div><p class="muted" style="margin-top:6px;">Your cart is empty. Add schemes from your eligible list.</p></div>';
  const total=items.length*SCHEME_FEE;
  document.getElementById('cartTotal').textContent='₹'+total;
  document.getElementById('cartCount').textContent=items.length+' scheme'+(items.length!==1?'s':'')+' × ₹'+SCHEME_FEE;
  const btn=document.getElementById('cartPayBtn');
  btn.textContent='Pay ₹'+total+' via UPI'; btn.disabled=!items.length; btn.style.opacity=items.length?'1':'0.5';
  updateCartBadge();
}
function removeFromCart(id){
  const a=schemeApps().find(x=>x.id===id);
  if(a) a.status='draft';
  saveCurrentProfile();
  renderSchemeCart();
}
function payForCart(){
  const items=cartApps(); if(!items.length) return;
  const btn=document.getElementById('cartPayBtn');
  btn.disabled=true; btn.textContent='Processing payment…';
  setTimeout(()=>{
    const now=new Date().toISOString(), ref='NEEVSCH'+Date.now().toString().slice(-8);
    items.forEach(a=>Object.assign(a,{status:'paid',paidAt:now,amount:SCHEME_FEE,paymentRef:ref}));
    trackFunnel('paid');
    saveCurrentProfile();
    const pending=items.filter(a=>a.docsMissing.length);
    document.getElementById('cartMain').style.display='none';
    document.getElementById('cartResult').style.display='block';
    document.getElementById('cartResultTitle').textContent='Payment successful · ₹'+items.length*SCHEME_FEE;
    document.getElementById('cartResultRef').textContent='Ref: '+ref;
    document.getElementById('cartResultList').innerHTML=items.map(a=>'<div class="ag-row"><span>'+a.scheme+'</span><b style="color:'
      +(a.docsMissing.length?'var(--marigold-600)':'var(--success)')+';">'+(a.docsMissing.length?'Pending · documents missing':'Complete')+'</b></div>').join('');
    document.getElementById('cartResultNote').textContent=pending.length
      ?'Upload the missing documents to move '+(pending.length>1?'these applications':'this application')+' forward. Our team will contact you.'
      :'Our team will file your applications and keep you updated.';
    addNotification('Payment of ₹'+items.length*SCHEME_FEE+' received for '+items.length+' scheme application'+(items.length>1?'s':'')+'. Ref: '+ref,true);
    updateCartBadge();
  },1500);
}


// Neev Employee App — Government Schemes: Aadhaar + common questions → eligibility-matched schemes.
// Scheme list + rules come from research (Sep 2026) — see research_notes/Indian welfare schemes eligibility/.
const AGENT_POOL=[
  { name:'Rajesh Kumar', phone:'98XXXXXX21' },
  { name:'Sunita Sharma', phone:'98XXXXXX47' },
  { name:'Vikram Singh', phone:'98XXXXXX63' }
];
let agentFormScheme=null;

// Each scheme: rule(p) → 'yes' (criteria fully covered by our questions),
// 'maybe' (official list / unverified criteria decide it — user must confirm), or false.
// `check` = criteria we can't ask simply; shown as "Also check" text. p is built in buildEligProfile().
const CENTRAL_SCHEMES=[
  {name:'Construction Workers Welfare Board',icon:'🔧',desc:'Registration with your state BOCW board — pension, accident, maternity, children\'s education and daughter\'s marriage aid.',url:'https://labour.gov.in',tag:'Labour',
   rule:p=>p.construction&&p.age>=18&&p.age<=60&&'yes',
   check:'90+ days of construction work in the last 12 months (certificate from employer, contractor or union). Registration fee about ₹20–50.',
   docs:['Aadhaar card','90-day work certificate','Bank passbook','Passport-size photo']},
  {name:'PM Shram Yogi Maandhan',icon:'👷',desc:'₹3,000/month pension from age 60. You pay ₹55–200/month, the government matches it.',url:'https://maandhan.in',tag:'Pension',
   rule:p=>p.age>=18&&p.age<=40&&p.monthlyIncome<15000&&!p.pf&&!p.selfTax&&'yes',
   check:'You are not in NPS.',
   docs:['Aadhaar card','Savings / Jan Dhan bank account','Mobile number']},
  {name:'e-Shram Card',icon:'🪪',desc:'National ID for unorganised workers — gateway to welfare schemes and disaster relief.',url:'https://eshram.gov.in',tag:'Labour',
   rule:p=>p.age>=16&&p.age<=59&&!p.pf&&'yes',
   check:'Mobile number linked to Aadhaar (or register with biometrics at a CSC).',
   docs:['Aadhaar card','Aadhaar-linked mobile','Bank account details']},
  {name:'Atal Pension Yojana',icon:'👴',desc:'Guaranteed pension of ₹1,000–5,000/month from age 60.',url:'https://www.npscra.nsdl.co.in/scheme-details.php',tag:'Pension',
   rule:p=>p.age>=18&&p.age<=40&&!p.selfTax&&'yes',
   check:'Needs a savings bank or post office account.',
   docs:['Aadhaar card','Savings bank account','Mobile number']},
  {name:'PM Suraksha Bima Yojana',icon:'🛡️',desc:'₹2 lakh accident cover for just ₹20 a year.',url:'https://jansuraksha.gov.in',tag:'Insurance',
   rule:p=>p.age>=18&&p.age<=70&&'yes',
   check:'Needs a bank account with auto-debit.',
   docs:['Aadhaar card','Bank account']},
  {name:'PM Jeevan Jyoti Bima Yojana',icon:'💙',desc:'₹2 lakh life cover for ₹436 a year.',url:'https://jansuraksha.gov.in',tag:'Insurance',
   rule:p=>p.age>=18&&p.age<=50&&'yes',
   check:'Needs a bank account with auto-debit.',
   docs:['Aadhaar card','Bank account']},
  {name:'PM Awas Yojana (Urban 2.0)',icon:'🏠',desc:'Up to ₹2.5 lakh help to build or buy your first pucca house.',url:'https://pmaymis.gov.in',tag:'Housing',
   rule:p=>!p.ownHome&&p.familyIncome<=900000&&'yes',
   check:'No housing benefit from any government scheme in the last 20 years. House in the woman\'s name or joint name.',
   docs:['Aadhaar of all family members','Income certificate','Self-declaration of no pucca house','Bank account details']},
  {name:'Sukanya Samriddhi Yojana',icon:'👧',desc:'High-interest savings account for your daughter\'s education and marriage.',url:'https://www.indiapost.gov.in',tag:'Savings',
   rule:p=>p.daughterU10&&'yes',
   check:'Up to 2 daughters per family.',
   docs:["Daughter's birth certificate",'Parent Aadhaar & PAN','Address proof']},
  {name:'Ayushman Bharat (PM-JAY)',icon:'🏥',desc:'Free hospital treatment up to ₹5 lakh per family per year.',url:'https://beneficiary.nha.gov.in',tag:'Health',
   rule:p=>p.age>=70?'yes':((p.lowCard||p.construction||p.occupation==='Domestic')&&'maybe'),
   check:'Below 70, eligibility depends on the SECC-2011 / state list — check your name on beneficiary.nha.gov.in or at a CSC.',
   docs:['Aadhaar card','Ration card','Mobile number']},
  {name:'PM-KISAN',icon:'🌾',desc:'₹6,000/year to farmer families in three instalments.',url:'https://pmkisan.gov.in',tag:'Agriculture',
   rule:p=>p.farmer&&!p.tax&&!p.govt&&'maybe',
   check:'Farm land must be in your name. No family member gets a pension of ₹10,000+/month or is a doctor, lawyer, engineer or CA.',
   docs:['Aadhaar card','Land records','Bank passbook']},
  {name:'PM SVANidhi',icon:'🛒',desc:'Collateral-free loans of ₹15,000 → ₹25,000 → ₹50,000 for street vendors.',url:'https://pmsvanidhi.mohua.gov.in',tag:'Loan',
   rule:p=>p.occupation==='Vendor'&&'maybe',
   check:'Need a Certificate of Vending or recommendation letter from your municipality.',
   docs:['Aadhaar card','Vending certificate / LoR','Bank account']},
  {name:'PM Ujjwala Yojana',icon:'🔥',desc:'Free LPG connection with first refill for poor households.',url:'https://pmuy.gov.in',tag:'Welfare',
   rule:p=>p.female&&p.age>=18&&p.lowCard&&'maybe',
   check:'No LPG connection in the household already.',
   docs:['Aadhaar card','Ration card','Bank account']},
  {name:'Ration Card (NFSA)',icon:'🍚',desc:'Free food grains — 5 kg per person per month (35 kg for Antyodaya families).',url:'https://nfsa.gov.in',tag:'Food',
   rule:p=>p.ration==='None'&&!p.tax&&!p.govt&&!p.car&&'maybe',
   check:'Your state decides who is a priority household — apply at the food & supply office or CSC.',
   docs:['Aadhaar of all family members','Income certificate','Residence proof','Passport-size photo']},
];

const STATE_SCHEMES={
  'Delhi':[
    {name:'Delhi Lakshmi Yojana',icon:'👩',desc:'₹2,500/month for women.',url:'https://wcd.delhi.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.age<=60&&p.familyIncome<=250000&&!p.tax&&!p.govt&&!p.pension&&!p.car&&p.children<=3&&'maybe',
     check:'Must be the eldest eligible woman in the family, a registered Delhi voter, you/husband/parent living in Delhi 10+ years, electricity under 2,400 units/year, no criminal case.',
     docs:['Aadhaar card','Delhi voter ID','10-year residence proof','MP/MLA recommendation']},
  ],
  'Bihar':[
    {name:'Mukhyamantri Mahila Rojgar Yojana',icon:'👩',desc:'₹10,000 to start a livelihood, up to ₹2 lakh more later.',url:'https://brlps.in',tag:'Livelihood',
     rule:p=>p.female&&p.age>=18&&p.age<=60&&'maybe',
     check:'Must be a JEEViKA self-help group member (you can join one). One woman per family.',
     docs:['Aadhaar card','Bank account in own name','JEEViKA SHG details']},
    {name:'Mukhyamantri Kanya Utthan',icon:'👩‍🎓',desc:'₹25,000 on passing Class 12, ₹50,000 on graduation for daughters.',url:'https://medhasoft.bihar.gov.in',tag:'Education',
     rule:p=>p.daughter10to18&&!p.govt&&'maybe',
     check:'Up to 2 daughters per family. Amount depends on exam result and passing year.',
     docs:['Marksheet','Aadhaar card','Bihar residence certificate','Bank account']},
  ],
  'Uttar Pradesh':[
    {name:'Kanya Sumangala Yojana',icon:'👧',desc:'₹25,000 in 6 stages from birth to graduation for daughters.',url:'https://mksy.up.gov.in',tag:'Welfare',
     rule:p=>(p.daughterU10||p.daughter10to18)&&p.familyIncome<=300000&&p.children<=2&&'yes',
     check:'UP resident family. Max 2 children (twins exception).',
     docs:["Daughter's birth certificate",'Parent Aadhaar card','UP residence proof','Income certificate']},
  ],
  'Maharashtra':[
    {name:'Majhi Ladki Bahin Yojana',icon:'👩',desc:'₹1,500/month for women.',url:'https://ladakibahin.maharashtra.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.age<=65&&p.familyIncome<=250000&&!p.tax&&!p.car&&!p.govt&&!p.pension&&'yes',
     check:'Only one unmarried woman per family; max two women per family. Annual e-KYC required.',
     docs:['Aadhaar card','Maharashtra domicile / ration card','Income certificate or yellow/orange ration card','Bank passbook']},
    {name:'Mahatma Jyotiba Phule Jan Arogya',icon:'🏥',desc:'Cashless treatment up to ₹5 lakh per family per year.',url:'https://www.jeevandayee.gov.in',tag:'Health',
     rule:p=>'yes',
     check:'Maharashtra resident with ration card or domicile certificate.',
     docs:['Aadhaar card','Ration card or domicile certificate']},
  ],
  'Rajasthan':[
    {name:'MAA Yojana (formerly Chiranjeevi)',icon:'🏥',desc:'Health cover up to ₹25 lakh per family per year.',url:'https://maayojana.rajasthan.gov.in',tag:'Health',
     rule:p=>!p.govt&&'yes',
     check:'Free for NFSA ration card families, small farmers and contract workers; others pay ₹850/year. Needs Jan Aadhaar.',
     docs:['Jan Aadhaar card','Aadhaar card']},
    {name:'Shri Annapurna Rasoi',icon:'🍛',desc:'Full meal for ₹8.',url:'https://rajasthan.gov.in',tag:'Food',
     rule:p=>'yes',
     check:'Open to everyone — just visit a Rasoi.',
     docs:['None needed']},
  ],
  'Madhya Pradesh':[
    {name:'Ladli Bahna Yojana',icon:'👩',desc:'₹1,500/month for married women.',url:'https://cmladlibahna.mp.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.marital!=='Unmarried'&&p.age>=21&&p.age<60&&p.familyIncome<=250000&&!p.tax&&!p.govt&&!p.car&&!p.pension&&'maybe',
     check:'New registrations open only in special windows. Family land up to 5 acres. Needs Samagra ID.',
     docs:['Samagra ID','Aadhaar card (linked to bank)','Bank passbook']},
    {name:'Ladli Laxmi Yojana',icon:'👧',desc:'About ₹1.43 lakh over school years and at age 21 for daughters.',url:'https://ladlilaxmi.mp.gov.in',tag:'Welfare',
     rule:p=>(p.daughterU10||p.daughter10to18)&&!p.tax&&'maybe',
     check:'First two daughters; family planning after the second child. Register early — usually before age 5.',
     docs:["Daughter's birth certificate",'Samagra ID','Parent Aadhaar']},
  ],
  'Jharkhand':[
    {name:'Maiyan Samman Yojana',icon:'👩',desc:'₹2,500/month for women.',url:'https://mmmsy.jharkhand.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=18&&p.age<50&&p.anyCard&&!p.tax&&!p.govt&&!p.pf&&!p.pension&&'yes',
     check:'Single Aadhaar-linked bank account in your name.',
     docs:['Aadhaar card','Ration card','Bank passbook']},
  ],
  'Karnataka':[
    {name:'Gruha Lakshmi',icon:'👩',desc:'₹2,000/month to the woman head of family.',url:'https://sevasindhugs.karnataka.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.anyCard&&!p.tax&&!p.govt&&'yes',
     check:'You must be named head of family on the ration card.',
     docs:['Aadhaar card','Ration card (you as head)','Bank passbook linked to Aadhaar']},
    {name:'Anna Bhagya',icon:'🍚',desc:'Free rice + Indira food kit every month.',url:'https://ahara.kar.nic.in',tag:'Food',
     rule:p=>p.lowCard&&'yes',
     check:'Automatic for AAY/BPL card holders — collect at your ration shop.',
     docs:['AAY/BPL ration card','Aadhaar of family members']},
  ],
  'Tamil Nadu':[
    {name:'Kalaignar Magalir Urimai Thogai',icon:'👩',desc:'₹1,000/month for women head of family.',url:'https://kmut.tn.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.familyIncome<=250000&&p.anyCard&&!p.car&&!p.tax&&!p.govt&&'yes',
     check:'Named head of family on ration card. Land within limits (5 acres wet / 10 acres dry). No professional-tax payer in family.',
     docs:['Aadhaar card','Family ration card','Bank passbook','Electricity bill']},
    {name:"CM's Comprehensive Health Insurance (CMCHIS)",icon:'🏥',desc:'Cashless treatment at empanelled hospitals.',url:'https://www.cmchistn.com',tag:'Health',
     rule:p=>p.familyIncome<=120000&&'yes',
     check:'Income certificate from VAO.',
     docs:['Ration card','VAO income certificate','Aadhaar card']},
  ],
  'West Bengal':[
    {name:'Annapurna Bhandar',icon:'👩',desc:'₹3,000/month for women aged 25–60 (replaced Lakshmir Bhandar).',url:'https://wb.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=25&&p.age<=60&&!p.tax&&!p.govt&&'yes',
     check:'On the WB electoral roll; Aadhaar-seeded bank account in your name.',
     docs:['Aadhaar card','Voter ID','Bank passbook']},
  ],
  'Gujarat':[
    {name:'PMJAY-MA (Mukhyamantri Amrutum)',icon:'🏥',desc:'Health cover up to ₹10 lakh per family per year.',url:'https://pmjay.gov.in',tag:'Health',
     rule:p=>(p.lowCard||p.familyIncome<=400000)&&'yes',
     check:'Gujarat resident.',
     docs:['Aadhaar card','Income certificate or NFSA ration card']},
    {name:'Namo Lakshmi Yojana',icon:'👩‍🎓',desc:'₹50,000 for daughters studying in Class 9–12.',url:'https://www.digitalgujarat.gov.in',tag:'Education',
     rule:p=>p.daughter10to18&&p.familyIncome<=600000&&'maybe',
     check:'Daughter must be in Class 9–12 — confirm with her school (private-school rules unclear).',
     docs:['School ID / bonafide certificate','Aadhaar card','Income certificate','Bank account']},
  ],
  'Odisha':[
    {name:'Subhadra Yojana',icon:'👩',desc:'₹10,000/year for women (two ₹5,000 instalments).',url:'https://subhadra.odisha.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=21&&p.age<=60&&(p.anyCard||p.familyIncome<=250000)&&!p.tax&&!p.govt&&!p.car&&!p.pension&&'yes',
     check:'Family land within limits.',
     docs:['Aadhaar card','Ration card / income certificate','Bank passbook']},
    {name:'Gopabandhu Jan Arogya Yojana',icon:'🏥',desc:'₹5 lakh health cover per family (+₹5 lakh for women).',url:'https://health.odisha.gov.in',tag:'Health',
     rule:p=>p.anyCard&&'yes',
     check:'Needs an NFSA / SFSS ration card.',
     docs:['Aadhaar card','NFSA/SFSS ration card']},
  ],
  'Punjab':[
    {name:'Mukh Mantri Sehat Yojana',icon:'🏥',desc:'₹10 lakh cashless health cover for every Punjab family.',url:'https://sha.punjab.gov.in',tag:'Health',
     rule:p=>'yes',
     check:'Punjab resident with Punjab voter ID (for Sehat Card).',
     docs:['Aadhaar card','Punjab voter ID']},
    {name:'Smart Ration Card (Atta-Dal)',icon:'🍚',desc:'Free wheat every month for NFSA families.',url:'https://epos.punjab.gov.in',tag:'Food',
     rule:p=>p.lowCard&&'yes',
     check:'Collect at your ration depot with the smart card.',
     docs:['Smart ration card','Aadhaar of family members']},
  ],
  'Haryana':[
    {name:'Deen Dayal Lado Lakshmi Yojana',icon:'👩',desc:'₹2,100/month for women (₹1,100 cash + ₹1,000 deposit).',url:'https://meraparivar.haryana.gov.in',tag:'Welfare',
     rule:p=>p.female&&p.age>=23&&p.familyIncome<=100000&&!p.tax&&!p.pension&&'maybe',
     check:'Family income as verified in Parivar Pehchan Patra (PPP); Haryana resident for 15+ years.',
     docs:['Parivar Pehchan Patra (PPP)','Aadhaar card','Bank passbook']},
    {name:'Chirayu Ayushman Bharat',icon:'🏥',desc:'₹5 lakh health cover — free up to ₹1.8 lakh income, ₹1,500/year up to ₹3 lakh.',url:'https://chirayu.haryana.gov.in',tag:'Health',
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

// Part B questions, rendered as tap-to-select chips. Income brackets end exactly on real scheme
// thresholds (₹1L, 1.2L, 2.5L, 3L, 4L, 6L, 9L) and store the bracket's upper bound, so rules compare with <=.
const YES_NO=[['yes','Yes'],['no','No']];
// Shortened flow (Haqdarshak / myScheme research, research_notes/Haqdarshak onboarding/):
//  - `auto`: filled from the loan flow when the user did employer verify first (salary, occupation) — shown with "Change".
//  - `show`: branching — asked only when relevant; when hidden, `hidden` gives the implied answer.
//  - `optional`: not required; unanswered → affected schemes become "may be eligible", never "eligible".
const DEPT_TO_OCCUPATION={'Site Labour':'Construction','Delivery':'Delivery','Logistics':'Delivery','Services':'Delivery','Security':'Factory'};
const hasKids=a=>a.Children>0;
const anyTaxGovt=a=>a.AnyTaxGovt==='yes';
const SP_QUESTIONS=[
  {sec:'💰 Income & work'},
  {f:'MonthlyIncome',q:'Your own monthly income',num:true,opts:[[14999,'Below ₹15,000'],[15000,'₹15,000 or more']],
   auto:()=>S.salary?(S.salary<15000?14999:15000):undefined, autoFrom:()=>'₹'+Number(S.salary).toLocaleString('en-IN')+'/month salary · '+S.company},
  {f:'Occupation',q:'What work do you do?',cols:3,opts:[
    ['Construction','Construction','','🏗️'],['Delivery','Delivery / gig','','🛵'],['Domestic','Domestic help','','🧹'],
    ['Factory','Factory / security','','🏭'],['Farmer','Farmer','','🌾'],['Vendor','Street vendor','','🛒'],['Other','Other','','💼']],
   auto:()=>S.company&&DEPT_TO_OCCUPATION[S.department], autoFrom:()=>(S.designation||S.department)+' at '+S.company},
  {f:'FamilyIncome',q:"Whole family's yearly income",num:true,opts:[
    [100000,'Up to ₹1 lakh','≈ ₹8,000/month'],[120000,'₹1 – 1.2 lakh','≈ ₹10,000/month'],
    [250000,'₹1.2 – 2.5 lakh','≈ ₹20,000/month'],[300000,'₹2.5 – 3 lakh','≈ ₹25,000/month'],
    [400000,'₹3 – 4 lakh','≈ ₹33,000/month'],[600000,'₹4 – 6 lakh','≈ ₹50,000/month'],
    [900000,'₹6 – 9 lakh','≈ ₹75,000/month'],[99999999,'Above ₹9 lakh','']]},
  {f:'Pf',q:'Is PF or ESIC cut from your salary?',opts:YES_NO},
  {sec:'👨‍👩‍👧 Family'},
  {f:'Marital',q:'Marital status',cols:3,opts:[['Married','Married'],['Unmarried','Unmarried'],['Single','Widowed / divorced']]},
  {f:'Children',q:'How many children?',num:true,cols:5,opts:[[0,'0'],[1,'1'],[2,'2'],[3,'3'],[4,'4+']]},
  {f:'DaughterU10',q:'Do you have a daughter below 10 years?',opts:YES_NO,show:hasKids,hidden:'no'},
  {f:'Daughter10to18',q:'Do you have a daughter aged 10–18 years?',opts:YES_NO,show:hasKids,hidden:'no'},
  {f:'Ration',q:'Which ration card do you have?',opts:[
    ['Antyodaya','Antyodaya (AAY)','Poorest families'],['Priority','Priority / BPL','NFSA card'],
    ['Other','Other card','APL / state card'],['None','No ration card','']]},
  {f:'AnyTaxGovt',q:'Does anyone in your family pay income tax / GST, have a government job, or get a government pension or allowance?',opts:YES_NO},
  {f:'SelfTax',q:'↳ Do you yourself pay income tax, or have you ever paid it?',opts:YES_NO,show:anyTaxGovt,hidden:'no'},
  {f:'Tax',q:'↳ Does anyone else in your family pay income tax or file GST?',opts:YES_NO,show:anyTaxGovt,hidden:'no'},
  {f:'Govt',q:'↳ Does anyone have a government / PSU job (even contract) or government pension?',opts:YES_NO,show:anyTaxGovt,hidden:'no'},
  {f:'Pension',q:'↳ Do you yourself get a government pension or allowance? (old-age, widow, disability, or a scheme for women)',opts:YES_NO,show:anyTaxGovt,hidden:'no'},
  {sec:'➕ Optional — confirms housing & women\'s schemes'},
  {f:'OwnHome',q:'Does anyone in your family own a pucca house?',opts:YES_NO,optional:true},
  {f:'Car',q:"Does your family own a car or jeep? (tractor doesn't count)",opts:YES_NO,optional:true},
];
const SP_KEYS=SP_QUESTIONS.filter(q=>q.f).map(q=>q.f);
const SP_OPTIONAL=SP_QUESTIONS.filter(q=>q.optional).map(q=>q.f);
let spAns={}, spEditAuto={};

const spVisible=(q,a)=>!q.show||q.show(a);
const spIsAuto=q=>q.auto&&q.auto()!==undefined&&!spEditAuto[q.f];
// Questions the user must answer now (visible, not optional, not auto-filled).
const spRequired=a=>SP_QUESTIONS.filter(q=>q.f&&!q.optional&&spVisible(q,a)&&!spIsAuto(q));
// Full answer set: user answers + auto values + implied answers for hidden branches.
function spResolve(a){
  const out={...a};
  SP_QUESTIONS.forEach(q=>{
    if(!q.f) return;
    if(spIsAuto(q)&&out[q.f]===undefined) out[q.f]=q.auto();
    if(q.show&&!q.show(out)) out[q.f]=q.hidden;
  });
  return out;
}
const spOptLabel=(q,v)=>{ const o=q.opts.find(o=>String(o[0])===String(v)); return o?o[1]:'—'; };

function renderSchemeQuestions(){
  const a=spResolve(spAns);
  document.getElementById('spQuestions').innerHTML=SP_QUESTIONS.map(q=>{
    if(q.sec) return '<div class="sp-sec">'+q.sec+'</div>';
    if(!spVisible(q,a)) return '';
    if(spIsAuto(q)) return '<div class="sp-q sp-auto"><span class="sp-q-label">'+q.q+'</span>'
      +'<div class="sp-auto-val"><b>✓ '+spOptLabel(q,q.auto())+'</b><span class="ag-link" onclick="editSpAuto(\''+q.f+'\')">Change</span></div>'
      +'<p class="muted" style="font-size:11px;margin-top:3px;">From your loan profile: '+q.autoFrom()+'</p></div>';
    const chips=q.opts.map(([v,label,sub,ic])=>
      '<button type="button" class="opt-chip'+(String(spAns[q.f])===String(v)?' sel':'')+'" onclick="selectSpChip(\''+q.f+'\',\''+v+'\')">'
      +(ic?'<span class="ic">'+ic+'</span>':'')+label+(sub?'<span class="sub">'+sub+'</span>':'')+'</button>').join('');
    return '<div class="sp-q"><span class="sp-q-label">'+q.q+'</span><div class="opt-grid'+(q.cols?' cols-'+q.cols:'')+'">'+chips+'</div></div>';
  }).join('');
  updateSpProgress();
}

function selectSpChip(f,v){
  const q=SP_QUESTIONS.find(x=>x.f===f);
  spAns[f]=q.num?+v:v;
  renderSchemeQuestions();
}
function editSpAuto(f){
  spEditAuto[f]=true;
  spAns[f]=undefined;
  renderSchemeQuestions();
}

function updateSpProgress(){
  const req=spRequired(spResolve(spAns));
  const done=req.filter(q=>spAns[q.f]!==undefined).length;
  document.getElementById('spFindBtn').textContent=done<req.length?'Find my schemes ('+done+'/'+req.length+' answered)':'Find my schemes →';
}

// Home tile entry: users with Aadhaar data + a complete saved profile go straight to results.
function openSchemes(){
  if(S.aadhaar&&S.gender&&S.dob&&S.schemeProfile&&spRequired(S.schemeProfile).every(q=>S.schemeProfile[q.f]!==undefined)){ renderSchemes(); go('s-schemes'); return; }
  openSchemeProfile();
}

// Part A (Aadhaar) is skipped when KYC already gave us aadhaar/gender/dob; Part B is prefilled on edit.
function openSchemeProfile(){
  const hasAadhaar=S.aadhaar&&S.gender&&S.dob;
  document.getElementById('spAadhaarInputBlock').style.display=hasAadhaar?'none':'block';
  document.getElementById('spScanChoice').style.display='block';
  document.getElementById('spVerifyBtn').style.display='block';
  document.getElementById('spVerifying').style.display='none';
  document.getElementById('spAadhaarInput').value=S.aadhaar||'';
  if(hasAadhaar){
    showSchemeAadhaarDetails();
  } else {
    document.getElementById('spAadhaarDoneBlock').style.display='none';
    document.getElementById('spDetailsBlock').style.display='none';
  }
  spAns={}; spEditAuto={};
  const saved=S.schemeProfile||{};
  SP_KEYS.forEach(k=>{ if(saved[k]!==undefined) spAns[k]=saved[k]; });
  // Profiles saved before the gate question existed: derive it from the four detail answers.
  if(spAns.AnyTaxGovt===undefined&&saved.SelfTax!==undefined)
    spAns.AnyTaxGovt=['SelfTax','Tax','Govt','Pension'].some(k=>saved[k]==='yes')?'yes':'no';
  // A saved answer that differs from the loan-profile value means the user changed it — keep it editable.
  SP_QUESTIONS.forEach(q=>{ if(q.auto&&spAns[q.f]!==undefined&&q.auto()!==undefined&&String(spAns[q.f])!==String(q.auto())) spEditAuto[q.f]=true; });
  renderSchemeQuestions();
  go('s-scheme-profile');
}

function setSchemeAadhaarBusy(icon,text){
  document.getElementById('spScanChoice').style.display='none';
  document.getElementById('spVerifyBtn').style.display='none';
  document.getElementById('spVerifyingIcon').textContent=icon;
  document.getElementById('spVerifyingText').textContent=text;
  document.getElementById('spVerifying').style.display='block';
}

function finishSchemeAadhaar(badge,msg){
  S.schemeState=getStateFromAddress();
  applyProfileFields();
  document.getElementById('spAadhaarInputBlock').style.display='none';
  document.getElementById('spVerifiedBadge').textContent=badge;
  showSchemeAadhaarDetails();
  toast(msg);
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
    finishSchemeAadhaar('✅ Verified via Aadhaar','Aadhaar verified');
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
    finishSchemeAadhaar('✅ Read from Aadhaar card','Aadhaar card scanned');
  },1600);
}

// Shows the verified Aadhaar card + Part B. "State you live in" defaults to the Aadhaar state
// (client ask: e.g. Aadhaar from Bihar but working in Delhi — user can switch).
function showSchemeAadhaarDetails(){
  if(!S.schemeState) S.schemeState=getStateFromAddress();
  document.getElementById('spName').value=S.name||'Ramesh Kumar';
  document.getElementById('spGender').value=S.gender;
  document.getElementById('spDob').value=S.dob;
  document.getElementById('spState').value=S.schemeState;
  const sel=document.getElementById('spLiveState');
  sel.innerHTML=Object.keys(STATE_SCHEMES).map(st=>'<option value="'+st+'">'+st+(st===S.schemeState?' (Aadhaar)':'')+'</option>').join('');
  sel.value=(S.schemeProfile&&S.schemeProfile.LiveState)||S.schemeState;
  document.getElementById('spAadhaarDoneBlock').style.display='block';
  document.getElementById('spDetailsBlock').style.display='block';
}

function findMySchemes(){
  const missing=spRequired(spResolve(spAns)).find(q=>spAns[q.f]===undefined);
  if(missing){toast('Please answer: '+missing.q.replace(/^↳ /,''));return;}
  S.schemeProfile={...spResolve(spAns),LiveState:document.getElementById('spLiveState').value};
  renderSchemes();
  go('s-schemes');
}

function buildEligProfile(){
  const sp=S.schemeProfile;
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

// Optional questions left blank are unknown: evaluate every rule under each possible answer.
// Same result in all cases → keep it; differs → 'maybe' (with the questions that would settle it); never an optimistic 'yes'.
function eligibleSchemes(){
  const sp=S.schemeProfile, state=sp.LiveState;
  const unknown=SP_OPTIONAL.filter(k=>sp[k]===undefined);
  const combos=unknown.reduce((acc,k)=>acc.flatMap(c=>[{...c,[k]:'yes'},{...c,[k]:'no'}]),[{}]);
  const profiles=combos.map(c=>{ const saved=S.schemeProfile; S.schemeProfile={...saved,...c}; const p=buildEligProfile(); S.schemeProfile=saved; return p; });
  const out=[];
  const add=(list,scope)=>list.forEach(s=>{
    const rs=profiles.map(p=>s.rule(p));
    if(rs.every(r=>!r)) return;
    const same=rs.every(r=>r===rs[0]);
    // an unknown question matters if flipping only its answer changes the result
    const flip=(i,k)=>combos.findIndex(d=>d[k]!==combos[i][k]&&unknown.every(x=>x===k||d[x]===combos[i][x]));
    const needs=same?[]:unknown.filter(k=>combos.some((c,i)=>rs[i]!==rs[flip(i,k)]));
    out.push({...s,scope,status:same?rs[0]:'maybe',needs});
  });
  add(CENTRAL_SCHEMES,'Central');
  add(STATE_SCHEMES[state]||[],state);
  return out.sort((a,b)=>(a.status==='yes'?0:1)-(b.status==='yes'?0:1));
}

function renderSchemes(){
  const all=eligibleSchemes();
  const state=S.schemeProfile.LiveState;
  const yes=all.filter(s=>s.status==='yes').length, maybe=all.length-yes;
  document.getElementById('schemeCountText').textContent="You're eligible for "+yes+" scheme"+(yes!==1?'s':'');
  const pending=[...new Set(all.flatMap(s=>s.needs||[]))];
  document.getElementById('schemeStateHint').innerHTML=(maybe?'+ '+maybe+' more you may qualify for · ':'')+'Central + '+state
    +(pending.length?'<br><span class="ag-link" onclick="openSchemeProfile()">Answer '+pending.length+' optional question'+(pending.length>1?'s':'')+' to confirm more →</span>':'');

  let html='';
  if(!all.length){
    html='<div class="card center-col" style="padding:20px;"><div style="font-size:28px;">🔍</div><p class="muted" style="margin-top:6px;text-align:center;">No matching schemes right now. Try updating your profile.</p></div>';
  }
  all.forEach(s=>{
    const badge=s.status==='yes'
      ?'<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:#E6F6EC;color:var(--success);">✅ Eligible</span>'
      :'<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:var(--marigold-100);color:var(--marigold-600);">🔎 May be eligible — confirm</span>';
    html+=`<div class="card" style="display:flex;gap:12px;align-items:flex-start;">
      <div class="scheme-ic">${s.icon}</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <b style="font-size:14px;">${s.name}</b>
          <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:var(--teal-100);color:var(--teal-700);">${s.scope}</span>
        </div>
        <div style="margin-top:4px;">${badge}</div>
        <p class="muted" style="font-size:13px;margin:6px 0;">${s.desc}</p>
        ${s.needs&&s.needs.length?`<p style="font-size:12px;margin:0 0 6px;color:var(--marigold-600);"><b>To confirm:</b> ${s.needs.map(k=>SP_QUESTIONS.find(q=>q.f===k).q).join(' · ')} <span class="ag-link" onclick="openSchemeProfile()">Answer</span></p>`:''}
        <p style="font-size:12px;margin:0 0 8px;color:var(--teal-900);"><b>Also check:</b> ${s.check}</p>
        <div style="background:var(--teal-100);border-radius:8px;padding:8px 10px;margin-bottom:10px;">
          <b style="font-size:11px;color:var(--teal-900);">📄 Documents needed</b>
          <ul style="margin:4px 0 0 16px;padding:0;font-size:12px;color:var(--teal-900);">${s.docs.map(d=>'<li>'+d+'</li>').join('')}</ul>
        </div>
        <div style="display:flex;gap:8px;">
          <div style="flex:1;text-align:center;">
            <button class="btn btn-outline btn-sm" style="width:100%;" onclick="openScheme('${s.url}')">Apply Yourself</button>
            <p class="muted" style="font-size:11px;margin-top:4px;">Free of cost</p>
          </div>
          <div style="flex:1;text-align:center;">
            <button class="btn btn-primary btn-sm" style="width:100%;" onclick="openAgentForm('${s.name.replace(/'/g,"\\'")}')">Apply with Agent</button>
            <p class="muted" style="font-size:11px;margin-top:4px;">₹49</p>
          </div>
        </div>
      </div>
    </div>`;
  });
  document.getElementById('schemesList').innerHTML=html;
}

// Application-form fields per scheme — built ONLY from what the official form / portal was CONFIRMED to ask
// (see research_notes/Scheme application fields/). Anything not confirmed is deliberately NOT asked here;
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
}

// Scheme-specific agent form: Aadhaar + quiz answers arrive prefilled (read-only); the "new details" are only
// fields CONFIRMED from the scheme's official form (SCHEME_FORM). Unverified schemes: agent collects the rest.
function openAgentForm(schemeName){
  const sch=findScheme(schemeName);
  agentFormScheme=schemeName;
  document.getElementById('agentFormScheme').textContent=(sch?sch.icon+' ':'')+schemeName;
  const aadhaar=(S.aadhaar||'').replace(/\s/g,'');
  const A=S.schemeProfile||{};
  const label=q=>{ const o=q.opts.find(o=>String(o[0])===String(A[q.f])); return o?o[1]:'—'; };
  const answers=SP_QUESTIONS.filter(q=>q.f&&q.f!=='AnyTaxGovt'&&A[q.f]!==undefined).map(q=>agRow(q.q.replace(/^↳ /,'').replace(/\?.*$/,''),label(q))).join('');
  document.getElementById('agentPrefill').innerHTML=
    '<div class="ag-sec">✅ From your Aadhaar</div>'+
    agRow('Name',S.name||'—')+agRow('Gender',S.gender||'—')+agRow('Date of birth',S.dob||'—')+
    agRow('Aadhaar','XXXX XXXX '+aadhaar.slice(-4))+agRow('Address (as per Aadhaar)',S.address||'—')+
    '<div class="ag-sec">📝 From your answers <span class="ag-link" onclick="closeAgentForm();openSchemeProfile()">Wrong? Update</span></div>'+
    agRow('State you live in',A.LiveState||'—')+answers;
  const cfg=SCHEME_FORM[schemeName];
  agState={};
  agFields=cfg?cfg.fields:[];
  const fieldsHtml=agFields.map((f,i)=>f.if&&!f.if(A)?'':renderAgentField(f,i)).join('');
  const note=cfg
    ?'<p class="muted" style="font-size:11px;margin:4px 0 10px;">Asked as per the scheme\'s official form ('+cfg.src+'). Anything else, your agent will collect at the visit.</p>'
    :'<p class="muted" style="font-size:11px;margin:4px 0 10px;">ℹ️ We have not verified this scheme\'s application form yet, so we only take the details above. Your agent will collect anything else at the visit.</p>';
  document.getElementById('agentNewFields').innerHTML=
    '<div class="ag-sec">✏️ New details for this scheme</div>'+note+fieldsHtml+
    '<div class="field-row"><label class="field-label">Mobile number *</label><input type="tel" id="agentMobile" inputmode="numeric" maxlength="10" value="'+(S.mobile||'')+'"></div>'+
    '<div class="field-row"><label class="field-label">Where should the agent visit you? *</label><input type="text" id="agentAddress" value="'+(S.currentAddress||S.address||'')+'"></div>';
  document.getElementById('agentTime').value='morning';
  document.getElementById('agentFormBlock').style.display='block';
  document.getElementById('agentAssigningBlock').style.display='none';
  document.getElementById('agentAssignedBlock').style.display='none';
  document.getElementById('agentModal').classList.add('show');
}
function closeAgentForm(){
  document.getElementById('agentModal').classList.remove('show');
}
function openPaymentLink(){
  toast('💳 Online payments coming soon! For now, just submit your request below.');
}
function submitAgentForm(){
  const A=S.schemeProfile||{};
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
  if(!address){toast('Enter an address for the agent to reach you');return;}
  const time=document.getElementById('agentTime').value;
  document.getElementById('agentFormBlock').style.display='none';
  document.getElementById('agentAssigningBlock').style.display='block';
  setTimeout(()=>{
    const agent=AGENT_POOL[Math.floor(Math.random()*AGENT_POOL.length)];
    (S.schemeApplications=S.schemeApplications||[]).push({scheme:agentFormScheme,agent:agent.name,mobile,address,time,formData:data});
    document.getElementById('agentAssigningBlock').style.display='none';
    document.getElementById('agentAssignedText').textContent='Application started for '+agentFormScheme+'. '+agent.name+' ('+agent.phone+') will contact you during your preferred time slot.';
    document.getElementById('agentAssignedBlock').style.display='block';
    addNotification('Agent '+agent.name+' assigned to help with your '+agentFormScheme+' application.', true);
  },1400);
}

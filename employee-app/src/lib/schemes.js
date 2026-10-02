// Govt schemes: research-based scheme list + eligibility engine (ported from employee/js/schemes.js).
// Data sections below are copied verbatim from the old app — see docs/research/scheme-eligibility/ and scheme-forms/.
// Never add a scheme rule or form field from memory: research only.
import { S } from '../store.js'

export const SCHEME_FEE = 49 // ₹ per scheme, paid once for the whole cart

export const CENTRAL_SCHEMES=[
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

export const STATE_SCHEMES={
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


const YES_NO=[['yes','Yes'],['no','No']];
export const DEPT_TO_OCCUPATION={'Site Labour':'Construction','Delivery':'Delivery','Logistics':'Delivery','Services':'Delivery','Security':'Factory'};
const hasKids=a=>a.Children>0;
const anyTaxGovt=a=>a.AnyTaxGovt==='yes';
export const SP_LEVELS=['','Work','Family','Home'];
export const SP_QUESTIONS=[
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

const F=(l,ph,x)=>({l,t:'text',ph,...x});
const YN=(l,must,x)=>({l,t:'yn',must,...x});
const SEL=(l,o,x)=>({l,t:'sel',o,...x});
export const RE_MOB=/^\d{10}$/, RE_AADHAAR=/^\d{12}$/, RE_ACC=/^\d{8,18}$/, RE_IFSC=/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const BANK=[F('Bank account number','',{t:'tel',re:RE_ACC,err:'Enter a valid bank account number'}),F('IFSC code','e.g. SBIN0001234',{re:RE_IFSC,err:'Enter a valid IFSC code'})];
const AUTODEBIT=YN('I agree to the yearly premium being auto-debited from this account','yes');
const NOMINEE=[F('Nominee name'),F('Nominee address'),F('Nominee date of birth','',{t:'date'}),F('Nominee relationship to you'),
  F('Nominee mobile','',{t:'tel',opt:true,re:RE_MOB,err:'Nominee mobile must be 10 digits'}),
  F('Guardian name (only if nominee is under 18)','',{opt:true}),F('Guardian relationship to nominee','',{opt:true})];
const JS_FORM='https://www.jansuraksha.gov.in';
export const SCHEME_FORM={
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


const BANK_DOCS=['Bank account','Bank account details','Savings bank account','Savings / Jan Dhan bank account','Bank account in own name'];
export function docOnFile(d,schemeName){
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
export const docsToAsk=s=>s.docs.filter(d=>!docOnFile(d,s.name));

// ===== Engine =====
export const SP_KEYS = SP_QUESTIONS.map(q => q.f)
export const spQ = f => SP_QUESTIONS.find(q => q.f === f)
const spVals = f => { const q = spQ(f); return q.opts.map(o => (q.num ? +o[0] : o[0])) }
export const spOpen = (q, a) => !q.gate || (a[q.gate] !== undefined && q.show(a))
// editAuto[f] = user chose to answer an auto-filled question themselves.
export const spIsAuto = (q, editAuto = {}) => q.auto && q.auto() !== undefined && !editAuto[q.f]

export function getStateFromAddress() {
  const addr = (S.address || S.currentAddress || '').toLowerCase()
  return Object.keys(STATE_SCHEMES).find(st => addr.includes(st.toLowerCase())) || 'Delhi'
}
export function ageFromDob(dob) {
  const m = (dob || '').match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
  if (!m) return 30
  const now = new Date(), b = new Date(+m[3], +m[2] - 1, +m[1])
  let age = now.getFullYear() - b.getFullYear()
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--
  return age
}

// Answers + loan-profile values + implied answers for questions a known gate answer rules out.
export function spResolve(a, editAuto) {
  const out = { ...a }
  SP_QUESTIONS.forEach(q => {
    if (out[q.f] === undefined && spIsAuto(q, editAuto)) out[q.f] = q.auto()
    if (q.gate && out[q.gate] !== undefined && !q.show(out)) out[q.f] = q.hidden
  })
  return out
}
function buildEligProfile(sp) {
  return {
    age: ageFromDob(S.dob), female: S.gender === 'Female',
    monthlyIncome: sp.MonthlyIncome, familyIncome: sp.FamilyIncome,
    pf: sp.Pf === 'yes', selfTax: sp.SelfTax === 'yes', tax: sp.SelfTax === 'yes' || sp.Tax === 'yes', pension: sp.Pension === 'yes', govt: sp.Govt === 'yes',
    ration: sp.Ration, lowCard: sp.Ration === 'Antyodaya' || sp.Ration === 'Priority', anyCard: sp.Ration !== 'None',
    ownHome: sp.OwnHome === 'yes', car: sp.Car === 'yes',
    occupation: sp.Occupation, construction: sp.Occupation === 'Construction', farmer: sp.Occupation === 'Farmer',
    marital: sp.Marital, children: sp.Children,
    daughterU10: sp.DaughterU10 === 'yes', daughter10to18: sp.Daughter10to18 === 'yes',
  }
}
// Answers each profile field reads (mirror of buildEligProfile).
const P_KEYS = { monthlyIncome: ['MonthlyIncome'], familyIncome: ['FamilyIncome'], pf: ['Pf'], selfTax: ['SelfTax'], tax: ['SelfTax', 'Tax'],
  pension: ['Pension'], govt: ['Govt'], ration: ['Ration'], lowCard: ['Ration'], anyCard: ['Ration'], ownHome: ['OwnHome'], car: ['Car'],
  occupation: ['Occupation'], construction: ['Occupation'], farmer: ['Occupation'], marital: ['Marital'], children: ['Children'],
  daughterU10: ['DaughterU10'], daughter10to18: ['Daughter10to18'] }
// ponytail: a rule's inputs are read from its source text (<param>.<field>) — fine while rules stay simple expressions.
// The parameter name is read too: the production build minifies `p` to another letter.
export function ruleKeys(s) {
  if (s._keys) return s._keys
  const src = String(s.rule), param = src.match(/^\(?\s*(\w+)/)[1]
  const fields = [...src.matchAll(new RegExp(`\\b${param}\\.(\\w+)`, 'g'))].map(m => m[1])
  return (s._keys = [...new Set(fields.flatMap(f => P_KEYS[f] || []))])
}

// Unanswered questions a rule reads are tried with every possible answer.
// Never true → hidden. Always true → 'yes' ('maybe' if any case is maybe). Depends → 'locked' + `needs`.
function schemeStatus(s, a, editAuto) {
  const unknown = ruleKeys(s).filter(k => a[k] === undefined)
  const combos = unknown.reduce((acc, k) => acc.flatMap(c => spVals(k).map(v => ({ ...c, [k]: v }))), [{}])
  const rs = combos.map(c => s.rule(buildEligProfile(spResolve({ ...a, ...c }, editAuto))))
  if (rs.every(r => !r)) return null
  if (rs.every(r => r)) return { status: rs.includes('maybe') ? 'maybe' : 'yes', needs: [] }
  const matters = k => { const seen = {}; return combos.some((c, i) => { const id = JSON.stringify({ ...c, [k]: null }), t = !!rs[i]
    if (id in seen) return seen[id] !== t; seen[id] = t; return false }) }
  const needs = unknown.filter(matters).map(k => { const q = spQ(k); return q.gate && a[q.gate] === undefined ? q.gate : k })
  return { status: 'locked', needs: [...new Set(needs)] }
}

export function eligibleSchemes(sp = S.schemeProfile || {}, editAuto) {
  const a = spResolve(sp, editAuto), out = []
  const add = (list, scope) => list.forEach(s => { const r = schemeStatus(s, a, editAuto); if (r) out.push({ ...s, scope, ...r }) })
  add(CENTRAL_SCHEMES, 'Central')
  add(STATE_SCHEMES[sp.LiveState] || [], sp.LiveState)
  const rank = { yes: 0, maybe: 1, locked: 2 }
  return out.sort((x, y) => rank[x.status] - rank[y.status])
}
export const foundSchemes = (sp, editAuto) => eligibleSchemes(sp, editAuto).filter(s => s.status !== 'locked')

// mode 'more' = only questions that can still unlock something (plus ones already answered this round); 'edit' = all.
export function spQueue(sp, { mode, done, editAuto }) {
  const a = spResolve(sp, editAuto)
  const need = mode === 'edit' ? null : new Set(eligibleSchemes(sp, editAuto).flatMap(s => s.needs))
  return SP_QUESTIONS.filter(q => spOpen(q, a) && (mode === 'edit' || (!spIsAuto(q, editAuto) && (done.has(q.f) || (sp[q.f] === undefined && need.has(q.f))))))
}

export const findScheme = name => [...CENTRAL_SCHEMES, ...(STATE_SCHEMES[S.schemeProfile?.LiveState] || [])].find(s => s.name === name)

// One application per scheme: 'draft' → 'cart' → 'paid'.
export const schemeApps = () => S.schemeApplications || []
export const openAppFor = name => schemeApps().find(a => a.scheme === name && a.status !== 'paid')
export const cartApps = () => schemeApps().filter(a => a.status === 'cart')

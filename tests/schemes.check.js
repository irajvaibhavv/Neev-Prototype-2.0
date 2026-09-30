// Run from repo root: node tests/schemes.check.js — sanity-checks scheme eligibility rules.
const assert=require("assert");
global.saveCurrentProfile=()=>{};global.applyProfileFields=()=>{};
global.document={getElementById:()=>({})};
global.S={address:'Patna, Bihar',gender:'Male',dob:'15-03-1992'};
eval(require('fs').readFileSync('employee/js/schemes.js','utf8')+';global.E=eligibleSchemes;global.G=getStateFromAddress;');
const res=()=>Object.fromEntries(E().map(s=>[s.name,s.status]));
assert.equal(G(),'Bihar');
const base={LiveState:'Delhi',MonthlyIncome:12000,FamilyIncome:150000,Pf:'no',SelfTax:'no',Tax:'no',Govt:'no',Pension:'no',Ration:'Priority',OwnHome:'no',Car:'no',Occupation:'Construction',Marital:'Married',Children:2,DaughterU10:'yes',Daughter10to18:'no'};
// Male construction worker, Bihar Aadhaar, living in Delhi, no PF, BPL card
S.schemeProfile={...base};
let r=res(); console.log(r);
['Construction Workers Welfare Board','PM Shram Yogi Maandhan','e-Shram Card','PM Awas Yojana (Urban 2.0)','Sukanya Samriddhi Yojana'].forEach(n=>assert.equal(r[n],'yes',n));
assert.equal(r['Ayushman Bharat (PM-JAY)'],'maybe');
assert(!r['Delhi Lakshmi Yojana'],'male must not get women scheme');
// Salaried with PF, ₹20k, owns home → loses PM-SYM, e-Shram, PMAY
S.schemeProfile={...base,Pf:'yes',MonthlyIncome:20000,OwnHome:'yes',Occupation:'Factory'};
r=res();
['PM Shram Yogi Maandhan','e-Shram Card','PM Awas Yojana (Urban 2.0)','Construction Workers Welfare Board'].forEach(n=>assert(!r[n],n));
// Woman in Jharkhand with own PF → excluded from Maiyan; without PF → eligible
S.gender='Female'; S.schemeProfile={...base,LiveState:'Jharkhand',Pf:'yes'};
assert(!res()['Maiyan Samman Yojana']);
S.schemeProfile={...base,LiveState:'Jharkhand'};
assert.equal(res()['Maiyan Samman Yojana'],'yes');
S.schemeProfile={...base,LiveState:'Jharkhand',Pension:'yes'};
assert(!res()['Maiyan Samman Yojana'],'already on pension must be excluded');
// APY excludes only the subscriber's own income tax (family tax must not block it)
S.gender='Male'; S.schemeProfile={...base,Tax:'yes'}; assert.equal(res()['Atal Pension Yojana'],'yes');
S.schemeProfile={...base,SelfTax:'yes'}; assert(!res()['Atal Pension Yojana']&&!res()['PM Shram Yogi Maandhan']);
// Delhi Lakshmi: voter/residency/eldest-woman aren't asked → 'maybe', never 'yes'; existing pension excludes
S.gender='Female'; S.schemeProfile={...base}; assert.equal(res()['Delhi Lakshmi Yojana'],'maybe');
S.schemeProfile={...base,Pension:'yes'}; assert(!res()['Delhi Lakshmi Yojana']);
// Delhi woman: car in family excludes Delhi Lakshmi
S.schemeProfile={...base,Car:'yes'};
assert(!res()['Delhi Lakshmi Yojana']);
console.log('ok');

// ---- agent form: only researched fields, and validation works ----
const els2={};const mk2=id=>els2[id]||(els2[id]={innerHTML:'',textContent:'',value:'',style:{},classList:{add(){}},outerHTML:''});
global.document={getElementById:mk2};
let lastToast='';global.toast=m=>{lastToast=m;};global.addNotification=()=>{};
eval(require('fs').readFileSync('employee/js/schemes.js','utf8')+';global.FORMS=SCHEME_FORM;global.ALL=[...CENTRAL_SCHEMES,...Object.values(STATE_SCHEMES).flat()];global.OPEN=openAgentForm;global.SUB=submitAgentForm;global.PICK=agPick;global.FLD=()=>agFields;');
Object.keys(FORMS).forEach(k=>assert(ALL.some(s=>s.name===k),'SCHEME_FORM key has no scheme: '+k));
S.gender='Female';S.name='Sita';S.aadhaar='1234 5678 9012';S.mobile='9876543210';S.address='Delhi';
S.schemeProfile={...base,Marital:'Married'};
// unverified scheme → no extra fields; verified scheme → fields
OPEN('e-Shram Card'); assert.equal(FLD().length,0);
OPEN('Delhi Lakshmi Yojana'); assert(FLD().length>5);
SUB(); assert(/Please fill/.test(lastToast),'empty required field must block: '+lastToast);
// APY: spouse field appears for married only
OPEN('Atal Pension Yojana'); assert(els2.agentNewFields.innerHTML.includes('Spouse name'));
S.schemeProfile={...base,Marital:'Unmarried'}; OPEN('Atal Pension Yojana'); assert(!els2.agentNewFields.innerHTML.includes('Spouse name'));
// 'must' rule: Ujjwala needs "no existing LPG connection"
OPEN('PM Ujjwala Yojana'); const f=FLD();
els2.agF1={value:'3'}; els2.agF2={value:'12345678'}; els2.agF3={value:'SBIN0001234'};
els2.agW0={outerHTML:''}; PICK(0,0); // Yes → already has LPG
SUB(); assert(/needs/.test(lastToast),'LPG=Yes must be rejected: '+lastToast);
console.log('agent form ok');

// ---- shortened flow: auto-fill, branching, optional unknowns ----
eval(require('fs').readFileSync('employee/js/schemes.js','utf8')+';global.REQ=spRequired;global.RES=spResolve;global.EL=eligibleSchemes;');
// straight to schemes (no loan data): income + occupation asked; no kids & gate "no" hide 6 questions
delete S.salary; delete S.company; delete S.department;
let a={Children:0,AnyTaxGovt:'no'};
const direct=REQ(a).map(q=>q.f); console.log('direct-to-schemes questions:',direct.length,direct.join(','));
assert(direct.includes('Occupation')&&direct.includes('MonthlyIncome')&&!direct.includes('DaughterU10')&&!direct.includes('SelfTax'));
// came via loan flow (BuildRight): occupation + income auto-filled
S.salary=20000;S.company='BuildRight Constructions';S.department='Site Labour';S.designation='Mason';
const viaLoan=REQ(a).map(q=>q.f); console.log('via-loan questions:',viaLoan.length);
assert(!viaLoan.includes('Occupation')&&!viaLoan.includes('MonthlyIncome'));
const rv=RES(a); assert.equal(rv.Occupation,'Construction'); assert.equal(rv.MonthlyIncome,15000); assert.equal(rv.DaughterU10,"no"); assert.equal(rv.SelfTax,"no");
// branching: kids → daughter qs; gate yes → 4 detail qs
assert(REQ({Children:2,AnyTaxGovt:'yes'}).map(q=>q.f).filter(f=>['DaughterU10','Daughter10to18','SelfTax','Tax','Govt','Pension'].includes(f)).length===6);
// optional unknown: PMAY depends on OwnHome → must be 'maybe' with needs, never 'yes'
S.gender='Male'; S.schemeProfile={...base}; delete S.schemeProfile.OwnHome; delete S.schemeProfile.Car;
const pm=EL().find(s=>s.name==='PM Awas Yojana (Urban 2.0)');
assert.equal(pm.status,'maybe'); assert.deepEqual(pm.needs,['OwnHome']);
assert.equal(EL().find(s=>s.name==='e-Shram Card').status,'yes','schemes not depending on optional qs stay yes');
// answered OwnHome=yes → PMAY gone
S.schemeProfile={...base,OwnHome:'yes'}; delete S.schemeProfile.Car; assert(!EL().some(s=>s.name==='PM Awas Yojana (Urban 2.0)'));
console.log('short flow ok');

// ---- cart flow: funnel steps, draft → cart → paid, complete vs pending ----
global.setTimeout=fn=>fn();
eval(require('fs').readFileSync('employee/js/schemes.js','utf8')+';global.OPENF=openAgentForm;global.UP=agentDocUpload;global.ADD=submitAgentForm;global.PAY=payForCart;global.CART=cartApps;global.APPS=schemeApps;global.RE_IFSC=RE_IFSC;global.RE_ACC=RE_ACC;global.RE_MOB=RE_MOB;global.FLD=()=>agFields;global.PICK=agPick;');
S.gender='Male'; S.schemeProfile={...base}; S.schemeApplications=[]; S.funnel={};
global.openSchemes&&0;
// e-Shram has no official form fields → only mobile/address + docs
OPENF('e-Shram Card'); assert(S.funnel.schemeClicked&&!S.funnel.formStarted,'opening form = clicked, not started');
els2.agentMobile={value:'9876543210'}; els2.agentAddress={value:'Delhi'};
UP(0); assert(S.funnel.formStarted,'uploading a doc = started'); assert.equal(APPS()[0].status,'draft');
ADD(); assert.equal(APPS()[0].status,'cart'); assert(S.funnel.cartAdded);
// Aadhaar + mobile are already verified → not asked; only the bank detail (not in e-Shram's form, no loan KYC) is missing
assert.deepEqual(APPS()[0].docsMissing,['Bank account details'],'only docs we do not hold can be missing');
assert.equal(APPS()[0].docs['Aadhaar card'],'on-file');
// second scheme, all docs uploaded
OPENF('PM Suraksha Bima Yojana');
FLD().forEach((f,i)=>{ if(f.t==='yn'||f.t==='sel'){ els2['agW'+i]={outerHTML:''}; PICK(i,f.must==='no'?1:0); } else els2['agF'+i]={value:f.re===RE_IFSC?'SBIN0001234':f.re===RE_ACC?'12345678':f.t==='date'?'1990-01-01':f.re===RE_MOB?'9876543210':'x'}; });
ALL.find(s=>s.name==='PM Suraksha Bima Yojana').docs.forEach((d,i)=>UP(i));
ADD(); assert.equal(CART().length,2,'two schemes in cart: '+lastToast);
PAY(); assert.equal(CART().length,0); assert(S.funnel.paid);
const paid=APPS().filter(a=>a.status==='paid');
assert.equal(paid.length,2); assert(paid.find(a=>a.scheme==='e-Shram Card').docsMissing.length>0,'e-Shram → pending');
assert.equal(paid.find(a=>a.scheme==='PM Suraksha Bima Yojana').docsMissing.length,0,'PMSBY → complete');
// docsToAsk: bank verified in loan KYC → nothing left to ask for e-Shram; PMSBY asks bank in its own form
eval(require('fs').readFileSync('employee/js/schemes.js','utf8')+';global.ASK=docsToAsk;');
const esh=ALL.find(s=>s.name==='e-Shram Card'), pmsby=ALL.find(s=>s.name==='PM Suraksha Bima Yojana');
assert.deepEqual(ASK(esh),['Bank account details']);
assert.deepEqual(ASK(pmsby),[],'PMSBY: Aadhaar on file + bank asked in its form');
S.bankLast4='1234'; assert.deepEqual(ASK(esh),[]); delete S.bankLast4;
const sav=S.aadhaar; delete S.aadhaar; assert(ASK(esh).includes('Aadhaar card'),'no Aadhaar yet → must ask'); S.aadhaar=sav;
console.log('cart flow ok');

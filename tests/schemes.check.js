// Run from repo root: node tests/schemes.check.js — sanity-checks scheme eligibility rules.
const assert=require('assert');
global.document={getElementById:()=>({})};
global.S={address:'Patna, Bihar',gender:'Male',dob:'15-03-1992'};
eval(require('fs').readFileSync('employee/js/schemes.js','utf8')+';global.E=eligibleSchemes;global.G=getStateFromAddress;');
const res=()=>Object.fromEntries(E().map(s=>[s.name,s.status]));
assert.equal(G(),'Bihar');
const base={LiveState:'Delhi',MonthlyIncome:12000,FamilyIncome:150000,Pf:'no',Tax:'no',Govt:'no',Ration:'Priority',OwnHome:'no',Car:'no',Occupation:'Construction',Marital:'Married',Children:2,DaughterU10:'yes',Daughter10to18:'no'};
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
// Delhi woman: car in family excludes Delhi Lakshmi
S.schemeProfile={...base,Car:'yes'};
assert(!res()['Delhi Lakshmi Yojana']);
console.log('ok');

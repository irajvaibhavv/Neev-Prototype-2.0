// Neev Employee App — Insurance: browse types → plans → checkout → success.
const INSURANCE_PLANS={
  health:{title:'Health Insurance',plans:[
    {name:'Health — Basic',cover:100000,premium:49},
    {name:'Health — Family',cover:300000,premium:99},
    {name:'Health — Plus',cover:500000,premium:149}
  ]},
  vehicle:{title:'Two-Wheeler Insurance',plans:[
    {name:'Third-party only',cover:'Legal liability cover',premium:29},
    {name:'Comprehensive',cover:'Third-party + own damage',premium:79}
  ]},
  accident:{title:'Personal Accident Cover',plans:[
    {name:'Accident — Basic',cover:200000,premium:19},
    {name:'Accident — Plus',cover:500000,premium:39}
  ]}
};
let insCurrentType=null;
let insCurrentPlanIdx=null;

function openInsuranceType(type){
  insCurrentType=type;
  const data=INSURANCE_PLANS[type];
  document.getElementById('ins-planTitle').textContent=data.title;
  const list=document.getElementById('ins-planList');
  list.innerHTML='';
  data.plans.forEach((p,i)=>{
    const coverText=typeof p.cover==='number'?fmt(p.cover)+' cover':p.cover;
    list.innerHTML+=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;"><div><b style="font-size:14px;">${p.name}</b><p class="muted" style="font-size:12px;margin-top:4px;">${coverText}</p></div><div style="text-align:right;"><b style="font-size:16px;color:var(--teal-900);">₹${p.premium}</b><p class="muted" style="font-size:11px;">/month</p></div></div><button class="btn btn-outline btn-sm" style="width:100%;margin-top:10px;" onclick="openInsuranceCheckout(${i})">Buy</button></div>`;
  });
  go('s-insurance-plans');
}
function openInsuranceCheckout(idx){
  insCurrentPlanIdx=idx;
  const p=INSURANCE_PLANS[insCurrentType].plans[idx];
  const coverText=typeof p.cover==='number'?fmt(p.cover):p.cover;
  document.getElementById('ins-ckPlan').textContent=p.name;
  document.getElementById('ins-ckCover').textContent=coverText;
  document.getElementById('ins-ckPremium').textContent='₹'+p.premium;
  document.getElementById('ins-nominee').value='';
  go('s-insurance-checkout');
}
function confirmInsurance(){
  const nominee=document.getElementById('ins-nominee').value.trim();
  if(!nominee){toast('Enter a nominee name');return;}
  const p=INSURANCE_PLANS[insCurrentType].plans[insCurrentPlanIdx];
  const policyNum='NEEV-INS-'+S.custId+String(S.policies.length+1).padStart(4,'0');
  S.policies.unshift({policy:policyNum,type:INSURANCE_PLANS[insCurrentType].title,plan:p.name,premium:p.premium,nominee:nominee});
  document.getElementById('ins-successPolicy').textContent=policyNum;
  document.getElementById('ins-successPlan').textContent=p.name;
  addNotification('Your '+p.name+' policy is now active. Policy: '+policyNum,true);
  addPoints(15,'Insurance purchased');
  renderPolicies();
  go('s-insurance-success');
}
function renderPolicies(){
  const list=document.getElementById('policyList');
  const empty=document.getElementById('policyEmpty');
  if(S.policies.length===0){list.innerHTML='';empty.style.display='flex';return;}
  empty.style.display='none';
  list.innerHTML='';
  S.policies.forEach(p=>{
    list.innerHTML+=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;"><div><b style="font-size:14px;">${p.plan}</b><p class="muted" style="font-size:12px;margin-top:2px;">${p.type} · Nominee: ${p.nominee}</p></div><span class="badge">Active</span></div><p class="muted" style="font-size:11px;margin-top:8px;">Policy: ${p.policy} · ₹${p.premium}/month</p></div>`;
  });
}

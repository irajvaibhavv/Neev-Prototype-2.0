// Neev Employee App — Investment: digital gold + small FDs ("Gullak"-style micro-savings).
const GOLD_RATE=6250; // ₹ per gram
function updateGoldPreview(){
  const amt=parseFloat(document.getElementById('goldAmount').value)||0;
  document.getElementById('goldGrams').textContent=(amt/GOLD_RATE).toFixed(3)+' g';
}
function buyGold(){
  const amt=parseFloat(document.getElementById('goldAmount').value)||0;
  if(amt<10){toast('Minimum ₹10 to buy gold');return;}
  // Simulate payment from bank — save bank details for reuse in loan flow
  if(!S.bankLast4){S.bankLast4='1234';S.bankName='State Bank of India';try{document.getElementById('profileBank').textContent='State Bank of India ****1234';}catch(e){}}
  const grams=amt/GOLD_RATE;
  S.investments.unshift({type:'Digital Gold',detail:grams.toFixed(3)+' g',amount:amt,date:'Today'});
  document.getElementById('inv-successTitle').textContent='Gold purchased!';
  document.getElementById('inv-successNote').textContent=grams.toFixed(3)+'g added to your gold locker.';
  addNotification('You bought '+grams.toFixed(3)+'g of digital gold for '+fmt(amt)+'.',true);
  addPoints(10,'Gold purchase');
  document.getElementById('goldAmount').value='';
  renderInvestments();
  go('s-invest-success');
}

let fdTenure=6;
function pickFdTenure(el,months){
  fdTenure=months;
  document.querySelectorAll('#s-invest-fd .tenure-pill').forEach(p=>p.classList.remove('selected'));
  el.classList.add('selected');updateFdPreview();
}
function updateFdPreview(){
  const amt=parseFloat(document.getElementById('fdAmount').value)||0;
  const maturity=amt*(1+0.07*fdTenure/12);
  document.getElementById('fdMaturity').textContent=fmt(maturity);
}
function createFd(){
  const amt=parseFloat(document.getElementById('fdAmount').value)||0;
  if(amt<100){toast('Minimum ₹100 to create an FD');return;}
  if(!S.bankLast4){S.bankLast4='1234';S.bankName='State Bank of India';try{document.getElementById('profileBank').textContent='State Bank of India ****1234';}catch(e){}}
  const maturity=amt*(1+0.07*fdTenure/12);
  S.investments.unshift({type:'Small FD',detail:fdTenure+' months @ 7% p.a.',amount:amt,date:'Today'});
  document.getElementById('inv-successTitle').textContent='FD created!';
  document.getElementById('inv-successNote').textContent=fmt(amt)+' locked for '+fdTenure+' months. Maturity value: '+fmt(maturity)+'.';
  addNotification('Your FD of '+fmt(amt)+' for '+fdTenure+' months has been created.',true);
  addPoints(10,'FD created');
  document.getElementById('fdAmount').value='';
  renderInvestments();
  go('s-invest-success');
}

const MF_FUNDS=[
  {amc:'SBI Mutual Fund',scheme:'SBI Liquid Fund',icon:'🏦',risk:'Low risk',returns:'~6-7% p.a.',minAmount:500},
  {amc:'HDFC Mutual Fund',scheme:'HDFC Money Market Fund',icon:'🏛️',risk:'Low risk',returns:'~6-7% p.a.',minAmount:500},
  {amc:'ICICI Prudential Mutual Fund',scheme:'ICICI Pru Savings Fund',icon:'💠',risk:'Low-moderate risk',returns:'~7-8% p.a.',minAmount:500},
  {amc:'Axis Mutual Fund',scheme:'Axis Balanced Advantage Fund',icon:'📊',risk:'Moderate risk',returns:'~9-11% p.a.',minAmount:500}
];
let mfCurrentIdx=null;
let mfMode='sip';

function openMfList(){
  const list=document.getElementById('mfList');
  list.innerHTML='';
  MF_FUNDS.forEach((f,i)=>{
    list.innerHTML+=`<div class="company-item" onclick="openMfCheckout(${i})"><div class="scheme-ic" style="background:#E6F4EE;">${f.icon}</div><div style="flex:1;"><b style="font-size:14px;">${f.scheme}</b><p class="muted" style="font-size:12px;margin-top:2px;">${f.amc} · ${f.risk} · min ₹${f.minAmount}</p></div><span style="color:var(--teal-700);font-size:18px;font-weight:700;">→</span></div>`;
  });
  go('s-invest-mf');
}
function openMfCheckout(idx){
  mfCurrentIdx=idx;
  mfMode='sip';
  const f=MF_FUNDS[idx];
  document.getElementById('mf-ckIcon').textContent=f.icon;
  document.getElementById('mf-ckScheme').textContent=f.scheme;
  document.getElementById('mf-ckAmc').textContent=f.amc;
  document.getElementById('mf-ckRisk').textContent=f.risk;
  document.getElementById('mf-ckReturns').textContent=f.returns;
  document.getElementById('mfAmount').value='';
  document.querySelectorAll('#s-invest-mf-checkout .tenure-pill').forEach(p=>p.classList.remove('selected'));
  document.querySelector('#s-invest-mf-checkout .tenure-pill').classList.add('selected');
  go('s-invest-mf-checkout');
}
function pickMfMode(el,mode){
  mfMode=mode;
  document.querySelectorAll('#s-invest-mf-checkout .tenure-pill').forEach(p=>p.classList.remove('selected'));
  el.classList.add('selected');
}
function investMf(){
  const f=MF_FUNDS[mfCurrentIdx];
  const amt=parseFloat(document.getElementById('mfAmount').value)||0;
  if(amt<f.minAmount){toast('Minimum ₹'+f.minAmount+' for this fund');return;}
  const modeLabel=mfMode==='sip'?'Monthly SIP':'One-time';
  S.investments.unshift({type:'Mutual Fund',detail:f.scheme+' · '+f.amc+' · '+modeLabel,amount:amt,date:'Today'});
  document.getElementById('inv-successTitle').textContent='Investment successful!';
  document.getElementById('inv-successNote').textContent=(mfMode==='sip'?'Your monthly SIP of ':'Your one-time investment of ')+fmt(amt)+' in '+f.scheme+' has started.';
  addNotification('You invested '+fmt(amt)+' in '+f.scheme+' ('+f.amc+').',true);
  addPoints(10,'Mutual fund investment');
  document.getElementById('mfAmount').value='';
  renderInvestments();
  go('s-invest-success');
}

function renderInvestments(){
  const list=document.getElementById('investList');
  const empty=document.getElementById('investEmpty');
  if(S.investments.length===0){list.innerHTML='';empty.style.display='flex';return;}
  empty.style.display='none';
  list.innerHTML='';
  S.investments.forEach(inv=>{
    list.innerHTML+=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;"><div><b style="font-size:14px;">${inv.type}</b><p class="muted" style="font-size:12px;margin-top:2px;">${inv.detail}</p></div><b style="font-size:14px;color:var(--teal-900);">${fmt(inv.amount)}</b></div></div>`;
  });
}

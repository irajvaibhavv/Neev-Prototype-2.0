// Neev Employee App — BBPS: bill payments/recharges + UPI QR scan-to-pay.
const BILLERS={
  mobile:{title:'Mobile Recharge',label:'Mobile number',placeholder:'e.g. 98XXXXXXXX'},
  dth:{title:'DTH Recharge',label:'Subscriber ID',placeholder:'e.g. 1023456789'},
  movie:{title:'Movie Tickets',label:'Theatre / booking ref',placeholder:'e.g. PVR Saket'},
  electricity:{title:'Electricity Bill',label:'Consumer number',placeholder:'e.g. 100234567'},
  gas:{title:'Gas Bill',label:'Consumer number',placeholder:'e.g. 200456789'},
  water:{title:'Water Bill',label:'Consumer number',placeholder:'e.g. 300789123'},
  broadband:{title:'Broadband Bill',label:'Account ID',placeholder:'e.g. BB-4021'},
  emi:{title:'Pay Loan EMI',label:'Loan Account (LAN)',placeholder:'e.g. 5832012026'}
};
let bbpsCurrentType=null;
function openBiller(type){
  bbpsCurrentType=type;
  const b=BILLERS[type];
  document.getElementById('bbps-payTitle').textContent=b.title;
  document.getElementById('bbps-numberLabel').textContent=b.label;
  document.getElementById('bbps-number').placeholder=b.placeholder;
  document.getElementById('bbps-number').value='';
  document.getElementById('bbps-amount').value='';
  if(type==='emi'){
    const activeLoan=S.loans.find(l=>l.status==='Active');
    if(activeLoan){
      document.getElementById('bbps-number').value=activeLoan.lan;
      document.getElementById('bbps-amount').value=activeLoan.amount;
    } else {
      toast('You have no active loan to pay towards.');
    }
  }
  go('s-bbps-pay');
}
function payBill(){
  const number=document.getElementById('bbps-number').value.trim();
  const amt=parseFloat(document.getElementById('bbps-amount').value)||0;
  if(!number){toast('Enter the required number');return;}
  if(amt<=0){toast('Enter a valid amount');return;}
  if(!S.bankLast4){S.bankLast4='1234';S.bankName='State Bank of India';try{document.getElementById('profileBank').textContent='State Bank of India ****1234';}catch(e){}}
  toast('Verifying with bank…');
  setTimeout(()=>{
    const ref='NEEVUPI'+S.custId+String(S.bbpsHistory.length+1).padStart(4,'0');
    S.bbpsHistory.unshift({label:BILLERS[bbpsCurrentType].title,detail:number,amount:amt,ref:ref,date:'Today'});
    document.getElementById('bbps-successNote').textContent=fmt(amt)+' paid for '+BILLERS[bbpsCurrentType].title.toLowerCase()+'.';
    document.getElementById('bbps-successRef').textContent=ref;
    addNotification(fmt(amt)+' paid for '+BILLERS[bbpsCurrentType].title+'. Ref: '+ref,true);
    addPoints(5,'Bill payment');
    renderBbpsHistory();
    go('s-bbps-success');
  },900);
}

const MOCK_MERCHANTS=[{name:'Raju General Store',upi:'rajustore@upi'},{name:'Sharma Tea Stall',upi:'sharmatea@upi'},{name:'City Medical Store',upi:'citymedical@upi'}];
function openScanner(){
  document.getElementById('scanResult').style.display='none';
  document.getElementById('scanStatus').style.display='block';
  document.getElementById('scanStatus').textContent='Point your camera at any UPI QR code…';
  document.getElementById('scanFrame').textContent='📷';
  go('s-bbps-scan');
  setTimeout(()=>{
    const m=MOCK_MERCHANTS[Math.floor(Math.random()*MOCK_MERCHANTS.length)];
    document.getElementById('scanFrame').textContent='✅';
    document.getElementById('scanStatus').style.display='none';
    document.getElementById('scanMerchant').textContent=m.name;
    document.getElementById('scanUpiId').textContent=m.upi;
    document.getElementById('scanAmount').value='';
    document.getElementById('scanResult').style.display='block';
  },1500);
}
function payScan(){
  const amt=parseFloat(document.getElementById('scanAmount').value)||0;
  if(amt<=0){toast('Enter a valid amount');return;}
  const merchant=document.getElementById('scanMerchant').textContent;
  toast('Verifying with bank…');
  setTimeout(()=>{
    const ref='NEEVUPI'+S.custId+String(S.bbpsHistory.length+1).padStart(4,'0');
    S.bbpsHistory.unshift({label:'Paid to '+merchant,detail:document.getElementById('scanUpiId').textContent,amount:amt,ref:ref,date:'Today'});
    document.getElementById('bbps-successNote').textContent=fmt(amt)+' paid to '+merchant+'.';
    document.getElementById('bbps-successRef').textContent=ref;
    addNotification(fmt(amt)+' paid to '+merchant+' via scan & pay. Ref: '+ref,true);
    addPoints(5,'UPI payment');
    renderBbpsHistory();
    go('s-bbps-success');
  },900);
}

function renderBbpsHistory(){
  const list=document.getElementById('bbpsList');
  const empty=document.getElementById('bbpsEmpty');
  if(S.bbpsHistory.length===0){list.innerHTML='';empty.style.display='flex';return;}
  empty.style.display='none';
  list.innerHTML='';
  S.bbpsHistory.forEach(h=>{
    list.innerHTML+=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;"><div><b style="font-size:14px;">${h.label}</b><p class="muted" style="font-size:12px;margin-top:2px;">${h.detail} · ${h.date}</p></div><b style="font-size:14px;color:var(--teal-900);">${fmt(h.amount)}</b></div></div>`;
  });
}

// Neev Employee App — loan list, loan detail + repayment timeline, early repay.
function renderLedger(){
  const list=document.getElementById('ledgerList');const empty=document.getElementById('ledgerEmpty');
  list.innerHTML='';
  if(S.loans.length===0){empty.style.display='flex';return;}
  empty.style.display='none';
  S.loans.forEach((l,i)=>{
    const div=document.createElement('div');div.className='loan-item';
    div.innerHTML=`<div class="row"><div><p class="muted" style="font-size:11px;">LAN</p><b>${l.lan}</b></div><span class="badge ${l.status==='Repaid'?'repaid':'due'}">${l.status}</span></div>
    <div class="row" style="margin-top:8px;"><span class="muted" style="font-size:13px;">You received</span><span style="font-weight:600;">${fmt(l.net)}</span></div>
    <div class="row" style="margin-top:4px;"><span class="muted" style="font-size:13px;">Repay</span><span>${fmt(l.amount)} by ${l.dueDate}</span></div>
    <p style="color:var(--teal-700);font-size:13px;font-weight:600;margin-top:10px;text-align:right;">View details →</p>`;
    div.onclick=()=>openLoanDetail(i);list.appendChild(div);
  });
}
function openLoanDetail(idx){
  const l=S.loans[idx];
  document.getElementById('ld-lan').textContent=l.lan;
  document.getElementById('ld-status').textContent=l.status;
  document.getElementById('ld-status').className='badge '+(l.status==='Repaid'?'repaid':'due');
  document.getElementById('ld-reason').textContent=l.reason||'—';
  document.getElementById('ld-amount').textContent=fmt(l.amount);
  document.getElementById('ld-charge').textContent=fmt(l.charge);
  document.getElementById('ld-gst').textContent=fmt(l.gst);
  document.getElementById('ld-net').textContent=fmt(l.net);
  document.getElementById('ld-van').textContent=l.van;
  const tl=document.getElementById('ld-timeline');
  tl.innerHTML=`
    <div class="timeline-step"><div class="timeline-dot done">✓</div><div class="timeline-line"></div><div><b style="font-size:14px;">Advance sent</b><p class="muted" style="font-size:13px;">${fmt(l.net)} to your bank · ${l.date}</p></div></div>
    <div class="timeline-step"><div class="timeline-dot ${l.status==='Repaid'?'done':''}">📅</div><div class="timeline-line"></div><div><b style="font-size:14px;">Salary day (${l.dueDate})</b><p class="muted" style="font-size:13px;">Your employer deducts ${fmt(l.amount)} from your salary</p></div></div>
    <div class="timeline-step"><div class="timeline-dot ${l.status==='Repaid'?'done':''}">💸</div><div><b style="font-size:14px;">Employer transfers ${fmt(l.amount)} to Neev</b><p class="muted" style="font-size:13px;">Sent to VAN ${l.van}</p></div></div>`;
  go('s-loan-detail');
}

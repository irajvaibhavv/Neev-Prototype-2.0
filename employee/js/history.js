// Neev Employee App — repayment history / credit track (borrower badge, limit-increase progress).
function renderHistory(){
  const total = S.loans.length;
  const repaid = S.loans.filter(l=>l.status==='Repaid').length;
  const active = S.loans.filter(l=>l.status==='Active').length;
  const _h=id=>document.getElementById(id);
  if(_h('hist-total')) _h('hist-total').textContent = total;
  if(_h('hist-ontime')) _h('hist-ontime').textContent = repaid;
  if(_h('hist-active')) _h('hist-active').textContent = active;
  if(_h('hist-subtext')) _h('hist-subtext').textContent = repaid+' of '+total+' advances repaid on time';
  const badges = ['New borrower','Good borrower','Trusted borrower','Star borrower'];
  if(_h('hist-badge')) _h('hist-badge').textContent = badges[Math.min(repaid, 3)];
  const needed = Math.max(0, 3 - repaid);
  const homeHist = _h('homeHistNote');
  if(homeHist) homeHist.textContent = repaid > 0 ? repaid+' on-time repayments' : 'Build your track record';
  // list
  const list = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  list.innerHTML = '';
  if(S.loans.length === 0){ empty.style.display='flex'; return; }
  empty.style.display = 'none';
  S.loans.forEach(l=>{
    const div = document.createElement('div');
    div.className = 'loan-item';
    div.innerHTML = `<div class="row"><b style="font-size:13px;">${l.lan}</b><span class="badge ${l.status==='Repaid'?'repaid':'due'}">${l.status}</span></div>
    <div class="row" style="margin-top:6px;"><span class="muted" style="font-size:13px;">Amount</span><span>${fmt(l.amount)}</span></div>
    <div class="row" style="margin-top:4px;"><span class="muted" style="font-size:13px;">Due</span><span>${l.dueDate}</span></div>`;
    list.appendChild(div);
  });
}

function downloadStatement(){
  toast('Generating statement PDF… check your downloads.');
}

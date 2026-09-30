// Neev Employee App — my documents (T2E agreement, statements, per-loan repayment schedules).
function renderDocuments(){
  const perLoan = document.getElementById('docsPerLoan');
  if(S.loans.length === 0){ perLoan.innerHTML='<p class="muted" style="font-size:13px;">No loans yet.</p>'; return; }
  perLoan.innerHTML = '';
  S.loans.forEach(l=>{
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer;';
    div.innerHTML = `<div class="scheme-ic" style="width:36px;height:36px;font-size:14px;">📄</div>
    <div style="flex:1;"><b style="font-size:13px;">${l.lan}</b><p class="muted" style="font-size:12px;">Repayment schedule · ${l.dueDate}</p></div>
    <span style="color:var(--teal-700);font-weight:700;font-size:12px;">PDF</span>`;
    div.onclick = ()=>downloadDoc('Repayment schedule for '+l.lan);
    perLoan.appendChild(div);
  });
}

function downloadDoc(name){
  toast('Downloading "'+name+'"…');
}

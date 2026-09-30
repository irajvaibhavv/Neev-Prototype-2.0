// Neev Employer Portal — employee verification queue.
function renderVerify(){
  const list = document.getElementById('verifyList');
  const empty = document.getElementById('verifyEmpty');
  const scoped = scopedPendingVerify();
  if(scoped.length===0){ list.innerHTML=''; empty.style.display='block'; document.getElementById('dotVerify').style.display='none'; return; }
  empty.style.display='none';
  document.getElementById('dotVerify').style.display='block';
  list.innerHTML = '';
  scoped.forEach((p)=>{
    const i=PENDING_VERIFY.indexOf(p);
    list.innerHTML += `<div class="card" style="display:flex;align-items:center;justify-content:space-between;"><div><b style="font-size:14px;">${p.name}</b><p style="color:var(--mu);font-size:12px;">ECN: ${p.ecn} · Branch: ${p.branch} · Mobile: ${p.mobile} · Applied: ${p.date}</p></div><div style="display:flex;gap:8px;"><button class="btn btn-success btn-sm" onclick="approveVerify(${i})">✅ Approve</button><button class="btn btn-danger btn-sm" onclick="rejectVerify(${i})">❌ Reject</button></div></div>`;
  });
}
function approveVerify(i){
  const p = PENDING_VERIFY.splice(i,1)[0];
  EMPS.push({ ecn:p.ecn, name:p.name, branch:p.branch, dept:'New', desig:'Unassigned', joined:'Aug 2026', type:'Full-time', salary:15000, rating:3, loan:null });
  toast(p.name+' verified and added to active employees.');
  logAction('Verified and onboarded '+p.name+' ('+p.ecn+')');
  renderAll();
}
function rejectVerify(i){
  const p = PENDING_VERIFY.splice(i,1)[0];
  toast(p.name+' verification rejected.');
  logAction('Rejected verification request for '+p.name+' ('+p.ecn+')');
  renderAll();
}

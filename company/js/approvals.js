// Neev Employer Portal — loan approval queue. Every loan request lands here for HR sign-off;
// requests over TWO_STAGE_THRESHOLD need Area Manager approval first, then a Company Admin final approval.
function renderApprovals(){
  const list = document.getElementById('approvalList');
  const empty = document.getElementById('approvalEmpty');
  const scoped = scopedPendingApprovals();
  if(scoped.length===0){ list.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  list.innerHTML='';
  scoped.forEach((a)=>{
    const i=PENDING_APPROVALS.indexOf(a);
    const needsTwoStage = a.amount > TWO_STAGE_THRESHOLD;
    const isEscalated = a.stage==='escalated';
    let stageBadge = '';
    let approveLabel = 'Approve';
    if(isEscalated){
      stageBadge = `<span class="badge badge-warn" style="margin-left:8px;">Escalated — needs Company Admin</span>`;
      approveLabel = 'Final approve';
    } else if(needsTwoStage){
      stageBadge = `<span class="badge badge-info" style="margin-left:8px;">Two-step required (over ${fmt(TWO_STAGE_THRESHOLD)})</span>`;
      if(currentScope.role==='branch') approveLabel = 'Approve & escalate';
    }
    list.innerHTML += `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;"><div><b style="font-size:15px;">${a.name}</b> (${a.ecn})${stageBadge}<p style="color:var(--mu);font-size:12px;margin-top:4px;">Requesting ${fmt(a.amount)} · Salary: ${fmt(a.salary)} · Accrued: ${fmt(a.accrued)} · Current deduction load: ${a.deductionLoad}</p></div><div style="display:flex;gap:8px;"><button class="btn btn-success btn-sm" onclick="approveReq(${i})">${approveLabel}</button><button class="btn btn-danger btn-sm" onclick="rejectReq(${i})">Reject</button></div></div></div>`;
  });
}
function approveReq(i){
  const a=PENDING_APPROVALS[i];
  if(currentScope.role==='branch' && a.amount>TWO_STAGE_THRESHOLD && a.stage!=='escalated'){
    a.stage='escalated';
    toast('Approved at branch level — escalated to Company Admin for final sign-off.');
    logAction('Escalated loan request for '+a.name+' ('+fmt(a.amount)+') to Company Admin');
    renderApprovals();renderDashboard();
    return;
  }
  PENDING_APPROVALS.splice(i,1);
  toast('Loan approved.');
  logAction('Approved loan request for '+a.name+' ('+fmt(a.amount)+')');
  renderApprovals();renderDashboard();
}
function rejectReq(i){
  const a=PENDING_APPROVALS[i];
  PENDING_APPROVALS.splice(i,1);
  toast('Loan rejected.');
  logAction('Rejected loan request for '+a.name+' ('+fmt(a.amount)+')');
  renderApprovals();renderDashboard();
}

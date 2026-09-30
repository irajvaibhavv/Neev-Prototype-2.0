// Neev Employer Portal — branch/area scoping. A Company Admin sees every branch;
// an Area Manager (picked at login) only ever sees their own branch's data.
function scopedEmps(){
  if(currentScope.role==='branch') return EMPS.filter(e=>e.branch===currentScope.branch);
  return EMPS;
}
function scopedPendingVerify(){
  if(currentScope.role==='branch') return PENDING_VERIFY.filter(p=>p.branch===currentScope.branch);
  return PENDING_VERIFY;
}
function scopedPendingApprovals(){
  if(currentScope.role==='branch'){
    // Once escalated to Company Admin, it's no longer the Area Manager's job — drops off their queue.
    return PENDING_APPROVALS.filter(a=>{
      const emp=EMPS.find(e=>e.ecn===a.ecn);
      return emp && emp.branch===currentScope.branch && a.stage!=='escalated';
    });
  }
  return PENDING_APPROVALS;
}

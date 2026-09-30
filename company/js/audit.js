// Neev Employer Portal — audit log: every HR action taken this session, who did it and when.
function logAction(text){
  const time = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  const user = currentScope.role==='branch' ? 'Area Manager · '+currentScope.branch : 'Company Admin';
  AUDIT_LOG.unshift({ text:text, time:time, user:user });
  renderAuditLog();
  if(typeof saveCompanyState==='function') saveCompanyState();
}
function renderAuditLog(){
  const list=document.getElementById('auditList');
  const empty=document.getElementById('auditEmpty');
  if(!list) return;
  if(AUDIT_LOG.length===0){ list.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  list.innerHTML='';
  AUDIT_LOG.forEach(a=>{
    list.innerHTML+=`<div class="detail-row"><span>${a.time} · ${a.user}</span><b>${a.text}</b></div>`;
  });
}

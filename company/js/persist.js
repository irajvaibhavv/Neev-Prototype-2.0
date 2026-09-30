// Neev Employer Portal — resume where you left off (survives a page refresh) instead of
// dropping back to the login screen. Persists login/scope state plus every mutable list
// (employees, pending queues, audit log) since those change during the session.
// Only sidebar-level screens are safe to resume on directly — they're fully re-rendered from
// data on load. A mid-flow screen (employee detail, add employee, bulk upload) falls back to Dashboard.
const RESTORABLE_SCREENS=['dashboard','employees','payroll','prepayday','settlement','recon','policy','audit','referral','settings'];

function saveCompanyState(){
  try{
    const loggedIn=document.getElementById('appWrap').style.display==='block';
    if(!loggedIn){ localStorage.removeItem('neev_company_state'); return; }
    const activeEl=document.querySelector('.screen.active');
    const activeId=activeEl?activeEl.id.replace(/^s-/,''):'dashboard';
    localStorage.setItem('neev_company_state', JSON.stringify({
      companyCin: currentCompany?currentCompany.cin:null,
      currentScope: currentScope,
      activeScreen: activeId,
      EMPS: EMPS,
      AUDIT_LOG: AUDIT_LOG,
      REGISTERED_COMPANIES: REGISTERED_COMPANIES,
      REPORT_SCHEDULE: REPORT_SCHEDULE
    }));
  }catch(e){}
}

function restoreCompanyState(){
  try{
    const raw=localStorage.getItem('neev_company_state');
    if(!raw) return false;
    const saved=JSON.parse(raw);
    if(saved.REGISTERED_COMPANIES) REGISTERED_COMPANIES=saved.REGISTERED_COMPANIES;
    let comp=Object.values(COMPANIES).find(c=>c.cin===saved.companyCin) || REGISTERED_COMPANIES.find(c=>c.cin===saved.companyCin);
    if(!comp) return false;
    currentCompany=comp;
    currentScope=saved.currentScope||{role:'company',branch:null};

    if(saved.EMPS){ EMPS.length=0; EMPS.push(...saved.EMPS); }
    if(saved.AUDIT_LOG) AUDIT_LOG=saved.AUDIT_LOG;
    if(saved.REPORT_SCHEDULE) REPORT_SCHEDULE=saved.REPORT_SCHEDULE;

    document.getElementById('loginWrap').style.display='none';
    document.getElementById('signupWrap').style.display='none';
    document.getElementById('appWrap').style.display='block';
    document.getElementById('sbCompany').textContent=currentCompany.name;
    document.getElementById('setCompanyName').textContent=currentCompany.name;
    document.getElementById('sbScope').textContent = currentScope.role==='branch' ? 'Area Manager · '+currentScope.branch : 'Company Admin · all branches';

    const branchFilter=document.getElementById('empBranchFilter');
    if(branchFilter){
      if(currentScope.role==='branch'){ branchFilter.value=currentScope.branch; branchFilter.disabled=true; }
      else branchFilter.disabled=false;
    }
    document.getElementById('addEmpBtn').style.display = currentScope.role==='company' ? 'inline-block' : 'none';
    document.getElementById('bulkUploadBtn').style.display = currentScope.role==='company' ? 'inline-block' : 'none';

    renderAll();
    renderAuditLog();
    const target = RESTORABLE_SCREENS.includes(saved.activeScreen) ? saved.activeScreen : 'dashboard';
    nav(target);
    return true;
  }catch(e){ return false; }
}

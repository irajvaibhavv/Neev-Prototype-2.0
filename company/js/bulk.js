// Neev Employer Portal — bulk employee upload via CSV. Company Admin only (button hidden otherwise).
function setupCsvTemplate(){
  const link=document.getElementById('csvTemplateLink');
  if(!link) return;
  const csv='name,ecn,branch,dept,desig,type,salary\nRahul Verma,ECN-50001,Delhi Hub,Delivery,Rider,Full-time,15000\n';
  link.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
}
function handleBulkCsv(evt){
  const file=evt.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>parseBulkCsv(e.target.result);
  reader.readAsText(file);
}
function parseBulkCsv(text){
  const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if(lines.length===0){ toast('That CSV looks empty'); return; }
  let rows=lines.map(l=>l.split(','));
  if(rows[0][0] && rows[0][0].toLowerCase().includes('name')) rows=rows.slice(1);
  const seenEcns=new Set();
  BULK_ROWS = rows.map(cols=>{
    const [name,ecn,branch,dept,desig,type,salaryStr] = cols.map(c=>(c||'').trim());
    const salary = parseInt(salaryStr)||0;
    let error=null;
    if(!name) error='Missing name';
    else if(!ecn) error='Missing ECN';
    else if(EMPS.some(e=>e.ecn===ecn) || seenEcns.has(ecn)) error='Duplicate ECN';
    else if(!BRANCHES.includes(branch)) error='Unknown branch';
    else if(salary<=0) error='Invalid salary';
    if(!error) seenEcns.add(ecn);
    return { name, ecn, branch, dept:dept||'Site Labour', desig:desig||'Staff', type:type||'Full-time', salary, error };
  });
  renderBulkPreview();
}
function renderBulkPreview(){
  document.getElementById('bulkPreviewWrap').style.display='block';
  const valid=BULK_ROWS.filter(r=>!r.error).length;
  const errors=BULK_ROWS.length-valid;
  document.getElementById('bulkSummary').textContent = valid+' valid row'+(valid!==1?'s':'')+' · '+errors+' row'+(errors!==1?'s':'')+' with errors (will be skipped on import)';
  let html='<thead><tr><th>Name</th><th>ECN</th><th>Branch</th><th>Dept</th><th>Salary</th><th>Status</th></tr></thead><tbody>';
  BULK_ROWS.forEach(r=>{
    const status = r.error ? `<span class="badge badge-err">${r.error}</span>` : '<span class="badge badge-ok">Valid</span>';
    html+=`<tr><td><b>${r.name||'—'}</b></td><td>${r.ecn||'—'}</td><td>${r.branch||'—'}</td><td>${r.dept}</td><td>${r.salary?fmt(r.salary):'—'}</td><td>${status}</td></tr>`;
  });
  html+='</tbody>';
  document.getElementById('bulkPreviewTable').innerHTML=html;
  document.getElementById('bulkConfirmBtn').disabled = valid===0;
}
function confirmBulkImport(){
  const valid=BULK_ROWS.filter(r=>!r.error);
  valid.forEach(r=>{
    EMPS.push({ ecn:r.ecn, name:r.name, branch:r.branch, dept:r.dept, desig:r.desig, joined:'Aug 2026', type:r.type, salary:r.salary, rating:3, loan:null });
  });
  toast(valid.length+' employee'+(valid.length!==1?'s':'')+' imported.');
  logAction('Bulk-imported '+valid.length+' employee'+(valid.length!==1?'s':'')+' via CSV upload');
  BULK_ROWS=[];
  document.getElementById('bulkPreviewWrap').style.display='none';
  document.getElementById('bulkCsvFile').value='';
  renderEmployees();
  renderDashboard();
  nav('employees');
}

// Neev Employer Portal — active employees list + detail view.
function populateBranchFilter(){
  const sel=document.getElementById('empBranchFilter');
  if(!sel)return;
  sel.innerHTML='<option value="all">All branches</option>'+BRANCHES.map(b=>`<option value="${b}">${b}</option>`).join('');
}
function renderEmployees(){
  const search = (document.getElementById('empSearch')?.value||'').toLowerCase();
  const filter = document.getElementById('empFilter')?.value||'all';
  const branchFilter = document.getElementById('empBranchFilter')?.value||'all';
  let list = scopedEmps().filter(e=>{
    const matchSearch = e.name.toLowerCase().includes(search)||e.ecn.toLowerCase().includes(search)||e.dept.toLowerCase().includes(search)||e.branch.toLowerCase().includes(search);
    const matchBranch = branchFilter==='all'||e.branch===branchFilter;
    if(filter==='active_loan') return matchSearch && matchBranch && e.loan && e.loan.status==='Active';
    if(filter==='no_loan') return matchSearch && matchBranch && !e.loan;
    return matchSearch && matchBranch;
  });
  let html = `<table class="tbl"><thead><tr><th>Employee</th><th>ECN</th><th>Branch</th><th>Department</th><th>Salary</th><th>Loan status</th><th>Action</th></tr></thead><tbody>`;
  list.forEach((e,i)=>{
    const loanBadge = e.loan && e.loan.status==='Active' ? `<span class="badge badge-active">Active · ${fmt(e.loan.amount)}</span>` : `<span class="badge badge-ok">No loan</span>`;
    html += `<tr><td><b>${e.name}</b></td><td>${e.ecn}</td><td>${e.branch}</td><td>${e.dept}</td><td>${fmt(e.salary)}</td><td>${loanBadge}</td><td><button class="btn btn-outline btn-sm" onclick="openEmpDetail(${EMPS.indexOf(e)})">View</button></td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('empTable').innerHTML = html;
}
let currentEmpDetailIdx=null;
function openEmpDetail(idx){
  currentEmpDetailIdx=idx;
  const e = EMPS[idx];
  document.getElementById('ed-name').textContent = e.name;
  document.getElementById('ed-ecn').textContent = e.ecn;
  document.getElementById('ed-branch').textContent = e.branch;
  document.getElementById('ed-dept').textContent = e.dept;
  document.getElementById('ed-desig').textContent = e.desig;
  document.getElementById('ed-joined').textContent = e.joined;
  document.getElementById('ed-type').textContent = e.type;
  document.getElementById('ed-salary').textContent = fmt(e.salary);
  const loanInfo = document.getElementById('ed-loanInfo');
  if(e.loan && e.loan.status==='Active'){
    loanInfo.innerHTML = `<div class="detail-row"><span>LAN</span><b>${e.loan.lan}</b></div><div class="detail-row"><span>Amount</span><b>${fmt(e.loan.amount)}</b></div><div class="detail-row"><span>Charges + GST</span><b>${fmt(e.loan.charge+e.loan.gst)}</b></div><div class="detail-row"><span>Net to employee</span><b>${fmt(e.loan.net)}</b></div><div class="detail-row"><span>Tenure</span><b>${e.loan.tenure}</b></div><div class="detail-row"><span>Due</span><b>${e.loan.due}</b></div><div class="detail-row"><span>VAN</span><b class="van-mono">${e.loan.van}</b></div>`;
  } else { loanInfo.innerHTML = '<p style="color:var(--mu);">No active loan.</p>'; }
  document.getElementById('ed-loanHistory').innerHTML = e.loan ? `<div class="detail-row"><span>${e.loan.lan}</span><b><span class="badge badge-active">${e.loan.status}</span> · ${fmt(e.loan.amount)} · Due ${e.loan.due}</b></div>` : '<p style="color:var(--mu);">No loan history.</p>';
  renderStarRow(e.rating||3);
  nav('emp-detail');
}
function renderStarRow(rating){
  const row=document.getElementById('ed-starRow');
  row.innerHTML='';
  for(let i=1;i<=5;i++){
    const star=document.createElement('span');
    star.textContent = i<=rating ? '★' : '☆';
    star.style.cursor='pointer';
    star.style.color = i<=rating ? 'var(--m5)' : 'var(--brd)';
    star.onclick=()=>setEmpRating(i);
    row.appendChild(star);
  }
}
function setEmpRating(stars){
  const e=EMPS[currentEmpDetailIdx];
  e.rating=stars;
  renderStarRow(stars);
  logAction('Rated '+e.name+' '+stars+' stars');
  renderEmployees();
  renderDashboard();
}
function flagExit(){
  toast('Employee flagged for exit. Loan eligibility frozen. FnF initiated.');
}

// ===== ADD EMPLOYEE (Company Admin only — button is hidden for Area Manager logins) =====
function openAddEmployee(){
  nav('add-employee');
}
function onAeDesigChange(){
  const deptMap={
    'HR Manager':'HR','Area Manager':'Management','Branch Manager':'Management','Operations Lead':'Management',
    'Mason':'Site Labour','Helper':'Site Labour','Painter':'Site Labour','Foreman':'Site Labour',
    'Supervisor':'Housekeeping','Cleaner':'Housekeeping','Guard':'Security','Rider':'Delivery','Loader':'Delivery'
  };
  const desig=document.getElementById('ae-desig').value;
  if(deptMap[desig]) document.getElementById('ae-dept').value=deptMap[desig];
}
function addEmployee(){
  const name=document.getElementById('ae-name').value.trim();
  const ecn=document.getElementById('ae-ecn').value.trim();
  const branch=document.getElementById('ae-branch').value;
  const desig=document.getElementById('ae-desig').value;
  const dept=document.getElementById('ae-dept').value;
  const type=document.getElementById('ae-type').value;
  const salary=parseInt(document.getElementById('ae-salary').value)||0;
  if(!name){toast('Enter the employee\'s full name');return;}
  if(!ecn){toast('Enter an ECN');return;}
  if(EMPS.some(e=>e.ecn===ecn)){toast('An employee with this ECN already exists');return;}
  if(salary<=0){toast('Enter a valid monthly salary');return;}
  EMPS.push({ ecn:ecn, name:name, branch:branch, dept:dept, desig:desig, joined:'Aug 2026', type:type, salary:salary, rating:3, loan:null });
  toast(name+' added to '+branch+'.');
  logAction('Added employee '+name+' ('+desig+', '+branch+')');
  document.getElementById('ae-name').value='';
  document.getElementById('ae-ecn').value='';
  document.getElementById('ae-salary').value='';
  renderEmployees();
  renderDashboard();
  nav('employees');
}

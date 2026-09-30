// Neev NBFC Dashboard — global employee search screen.
function doGlobalSearch(){
  const q=document.getElementById('globalSearch').value.toLowerCase().trim();
  const box=document.getElementById('globalSearchResults');
  if(q.length<2){box.innerHTML='<div class="card" style="text-align:center;padding:30px;"><p style="color:var(--mu);">Type at least 2 characters to search.</p></div>';return;}
  const results=ALL_EMPS.filter(e=>e.name.toLowerCase().includes(q)||e.ecn.toLowerCase().includes(q)||e.custId.includes(q)||e.mobile.includes(q));
  if(results.length===0){box.innerHTML='<div class="card" style="text-align:center;padding:20px;"><p style="color:var(--mu);">No employees found for "'+q+'"</p></div>';return;}
  let html='<table class="tbl"><thead><tr><th>Employee</th><th>ECN</th><th>Company</th><th>Customer ID</th><th>Mobile</th><th>Loan status</th><th>LAN</th><th>Action</th></tr></thead><tbody>';
  results.forEach(e=>{
    const loanClass=e.loan.includes('Active')?'badge-warn':e.loan.includes('Overdue')?'badge-err':e.loan.includes('FnF')?'badge-err':'badge-ok';
    html+=`<tr><td><b>${e.name}</b></td><td>${e.ecn}</td><td>${e.company}</td><td>${e.custId}</td><td>${e.mobile}</td><td><span class="badge ${loanClass}">${e.loan}</span></td><td class="van">${e.lan}</td><td><button class="btn btn-outline btn-sm" onclick="nav('loandetail')">View loan</button></td></tr>`;
  });
  html+='</tbody></table>';
  box.innerHTML=html;
}

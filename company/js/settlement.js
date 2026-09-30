// Neev Employer Portal — post-payday settlement report.
function renderSettlement(){
  const withLoans = scopedEmps().filter(e=>e.loan&&e.loan.status==='Active');
  let html = `<table class="tbl"><thead><tr><th>Employee</th><th>Monthly salary</th><th>Deducted for Neev</th><th>Transferred to VAN</th><th>Paid to employee</th><th>Status</th></tr></thead><tbody>`;
  withLoans.forEach(e=>{
    const paidToEmp = e.salary - e.loan.amount;
    html += `<tr><td><b>${e.name}</b> (${e.ecn})</td><td>${fmt(e.salary)}</td><td style="color:var(--err);font-weight:600;">${fmt(e.loan.amount)}</td><td><span class="van-mono" style="font-size:12px;">${e.loan.van}</span></td><td style="color:var(--ok);font-weight:600;">${fmt(paidToEmp)}</td><td><span class="badge badge-ok">Settled</span></td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('settlementTable').innerHTML = html;
}

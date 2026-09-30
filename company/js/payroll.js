// Neev Employer Portal — salary transfers + pre-payday confirmation.
function renderPayroll(){
  const emps = scopedEmps();
  const withLoans = emps.filter(e=>e.loan&&e.loan.status==='Active');
  const totalDeduction = withLoans.reduce((a,e)=>a+e.loan.amount,0);
  const totalSalary = emps.reduce((a,e)=>a+e.salary,0);
  const totalRemaining = totalSalary - totalDeduction;
  document.getElementById('payroll-total').textContent = fmt(totalDeduction);
  document.getElementById('payroll-remaining').textContent = totalRemaining.toLocaleString('en-IN');
  document.getElementById('pp-total').textContent = fmt(totalDeduction);
  document.getElementById('pp-empCount').textContent = withLoans.length;
  document.getElementById('pp-deductions').textContent = fmt(totalDeduction);

  let html = `<table class="tbl"><thead><tr><th>Employee</th><th>ECN</th><th>Monthly salary</th><th>Deduct for Neev</th><th>Pay to employee</th><th>Transfer to VAN</th><th>Status</th></tr></thead><tbody>`;
  emps.forEach(e=>{
    const hasLoan = e.loan&&e.loan.status==='Active';
    const deduction = hasLoan ? fmt(e.loan.amount) : '—';
    const empPay = hasLoan ? fmt(e.salary - e.loan.amount) : fmt(e.salary);
    const van = hasLoan ? `<span class="van-mono" style="font-size:12px;">${e.loan.van}</span>` : '—';
    const status = hasLoan ? '<span class="badge badge-pending">Pending</span>' : '<span class="badge badge-ok">Full salary</span>';
    html += `<tr><td><b>${e.name}</b></td><td>${e.ecn}</td><td>${fmt(e.salary)}</td><td style="font-weight:600;color:var(--err);">${hasLoan?deduction:'—'}</td><td style="font-weight:600;color:var(--ok);">${empPay}</td><td>${van}</td><td>${status}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('payrollTable').innerHTML = html;
}
function exportPayroll(){ toast('Deduction file exported to Excel. Check your downloads.'); }
function exportEmployees(){ toast('Employee list exported to CSV.'); }
function confirmPrePayday(){
  document.getElementById('pp-confirmCard').style.display='none';
  document.getElementById('pp-doneCard').style.display='block';
  document.getElementById('d-preconfirm').textContent='Confirmed ✅';
  document.getElementById('d-preconfirm').style.color='var(--ok)';
  toast('Pre-payday transfer confirmed. Neev will prepare instant crediting.');
  logAction('Confirmed pre-payday salary transfer commitment');
}

// Neev Employer Portal — scheduled report delivery + other settings-screen actions.
function renderCompanyProfile(){
  const c = currentCompany;
  if(!c) return;
  document.getElementById('cp-cin').textContent = c.cin || '—';
  document.getElementById('cp-gst').textContent = c.gst || '—';
  document.getElementById('cp-pan').textContent = c.pan || '—';
  document.getElementById('cp-tan').textContent = c.tan || '—';
  document.getElementById('cp-hrms').textContent = c.hrms || '—';
  document.getElementById('cp-ip').textContent = c.ip || '—';
  document.getElementById('cp-companyAddr').textContent = c.companyAddr || '—';
  document.getElementById('cp-hoAddr').textContent = c.hoAddr || '—';
  document.getElementById('cp-contact').textContent = c.contact || '—';
  document.getElementById('cp-email').textContent = c.email || '—';
  document.getElementById('cp-employees').textContent = (c.onNeev!=null && c.employees!=null) ? (c.onNeev+' of '+c.employees) : '—';
}
function saveReportSchedule(){
  const reportType=document.getElementById('setReportType').value;
  const frequency=document.getElementById('setReportFreq').value;
  const recipients=document.getElementById('setReportRecipients').value.trim();
  if(!recipients){ toast('Enter at least one recipient email'); return; }
  REPORT_SCHEDULE = { reportType, frequency, recipients };
  document.getElementById('reportScheduleStatus').textContent = reportType+' will be emailed '+frequency.toLowerCase()+' to '+recipients+'.';
  toast('Report schedule saved.');
  logAction('Scheduled '+reportType+' delivery ('+frequency+') to '+recipients);
}

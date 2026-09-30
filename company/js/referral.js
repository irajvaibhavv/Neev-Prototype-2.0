// Neev Employer Portal — refer a company.
function submitReferral(){
  const name = document.getElementById('refCompName').value.trim();
  if(!name){ toast('Enter the company name'); return; }
  toast('Referral for '+name+' submitted. We will reach out to them.');
  logAction('Submitted referral for '+name);
  document.getElementById('refCompName').value='';
  document.getElementById('refContactName').value='';
  document.getElementById('refContactInfo').value='';
}

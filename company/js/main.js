// Neev Employer Portal — bootstrap (runs once, at page load).
const d=new Date();document.getElementById('topDate').textContent=d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
populateBranchFilter();
setupCsvTemplate();
restoreCompanyState();

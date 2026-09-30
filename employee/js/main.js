// Neev Employee App — bootstrap. Loads last, after every other employee/js/*.js file.
// A refresh in the same tab resumes where you left off (sessionStorage); a fresh open starts at splash.
tickClock();setInterval(tickClock,30000);
if(!restoreAppState()){
  renderLoansHub();renderLedger();renderNotifs();renderLangList();renderHistory();renderDocuments();renderGrievances();
  renderPolicies();renderInvestments();renderBbpsHistory();renderLoyalty();renderSakhi();
}
updateProfileNudge();
if(document.getElementById('s-splash').classList.contains('active')) openLangModal();
setTimeout(()=>indexTexts(),100);

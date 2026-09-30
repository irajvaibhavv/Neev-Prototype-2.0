// Neev Employee App — returning-user login: mobile + PIN, or OTP fallback if no PIN set.
function completeLogin(){
  const mobile=document.getElementById('mobileInput').value;
  const pin=readPinRow('loginPinRow');
  if(mobile.length<10){toast('Enter a 10-digit mobile number');return;}
  const profile=loadProfileByMobile(mobile);
  if(!profile){
    toast("This number isn't registered yet. Please sign up.");
    document.getElementById('signupMobileInput').value=mobile;
    go('s-signup');
    return;
  }
  // If user has a PIN, require it; otherwise accept any 4 digits (OTP fallback in prototype)
  if(profile.pin && pin!==profile.pin){
    if(pin.length<4){toast('Enter your 4-digit PIN');return;}
    toast('Incorrect PIN. Please try again.');
    clearPinRow('loginPinRow');
    return;
  }
  if(!profile.pin && pin.length<4){toast('Enter any 4-digit OTP');return;}
  Object.keys(S).forEach(k=>delete S[k]);
  Object.assign(S,profile);
  applyProfileFields();
  renderLoansHub();renderLedger();renderNotifs();renderLangList();renderHistory();renderDocuments();renderGrievances();
  renderPolicies();renderInvestments();renderBbpsHistory();renderLoyalty();renderSakhi();renderPermissions();
  updateProfileNudge();
  document.getElementById('bottomNav').style.display='flex';
  navTo('s-home');
}
function logoutEmployee(){
  document.getElementById('bottomNav').style.display='none';
  toast('You have been logged out');
  go('s-signup');
}

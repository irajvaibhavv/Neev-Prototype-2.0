// Neev Employee App — sign up: phone OTP → straight to home. Also owns the camera-permission modal (Aadhaar scan in schemes.js).
const AADHAAR_SAMPLE={number:'1234 5678 9012',name:'Ramesh Kumar',fatherName:'Suresh Kumar',dob:'15/06/1994',gender:'Male',addr:'H.No. 214, Ward No. 6, Najafgarh, South West Delhi, Delhi, 110043'};

function sendSignupOtp(){
  const m=document.getElementById('signupMobileInput').value;
  if(m.length<10){toast('Enter a 10-digit mobile number');return;}
  if(loadProfileByMobile(m)){
    toast('You already have an account. Please log in.');
    document.getElementById('mobileInput').value=m;
    go('s-login');
    return;
  }
  S.mobile=m;
  S.custId=parseInt(m.slice(-4))||Math.floor(1000+Math.random()*9000);
  document.getElementById('signupOtpBlock').style.display='block';
  document.getElementById('signupSendOtpBtn').style.display='none';
  toast('OTP sent to '+m);
  setTimeout(function(){
    var otps=document.querySelectorAll('#signupOtpBlock .otpd');
    ['1','2','3','4'].forEach(function(v,i){ otps[i].value=v; });
  },1500);
  let t=30;const el=document.getElementById('signupResendTimer');
  const iv=setInterval(()=>{t--;el.textContent=t;if(t<=0){clearInterval(iv);document.getElementById('signupResendTxt').innerHTML='<span style="color:var(--teal-700);font-weight:700;cursor:pointer;">Resend OTP</span>';}},1000);
}

function verifySignupOtp(){
  var btn=document.querySelector('#signupOtpBlock .btn-dark');
  btn.textContent='Verified ✓';
  btn.disabled=true;
  btn.style.opacity='0.7';
  btn.style.pointerEvents='none';
  S.name=S.name||'User';
  finishSignup();
}

function grantCameraPermission(){
  document.getElementById('cameraPermModal').classList.remove('show');
  S._camForScheme=false; runSchemeAadhaarScan();
}
function denyCameraPermission(){
  document.getElementById('cameraPermModal').classList.remove('show');
  S._camForScheme=false; document.getElementById('spAadhaarInput').focus();
}

function finishSignup(){
  S.signupAt=S.signupAt||new Date().toISOString(); // "downloaded the app" step for the manager funnel
  var nameStr=S.name||'User';
  document.getElementById('homeName').textContent=nameStr.split(' ')[0];
  document.getElementById('profileName').textContent=nameStr;
  document.getElementById('profileInitials').textContent=nameStr.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  if(S.aadhaar){
    document.getElementById('profileAadhaar').textContent='XXXX XXXX '+S.aadhaar.replace(/\s/g,'').slice(-4);
  }
  document.getElementById('bottomNav').style.display='flex';
  renderLoansHub();renderLedger();renderNotifs();renderHistory();renderDocuments();
  renderPolicies();renderInvestments();renderBbpsHistory();renderLoyalty();renderSakhi();
  updateProfileNudge();
  navTo('s-home');
  toast('Welcome to Neev, '+nameStr.split(' ')[0]+'!');
}

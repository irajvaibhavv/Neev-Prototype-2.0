// Neev Employee App — sign up: phone OTP → straight to home.
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

function onSignupCompanyChange(){
  const val=document.getElementById('signupCompanySelect').value;
  document.getElementById('signupCompanyOtherRow').style.display=val==='other'?'block':'none';
}

function continueFromSignupCompany(){
  const val=document.getElementById('signupCompanySelect').value;
  if(!val){toast('Please select your company');return;}
  if(val==='other'){
    const custom=document.getElementById('signupCompanyOther').value.trim();
    if(!custom){toast('Please enter your company name');return;}
    S.signupCompany=custom;
  } else {
    S.signupCompany=val;
  }
  document.getElementById('signupAadhaarCapture').style.display='block';
  document.getElementById('signupAadhaarScanning').style.display='none';
  document.getElementById('signupAadhaarConfirm').style.display='none';
  document.getElementById('signupAadhaarManual').style.display='none';
  go('s-signup-aadhaar');
}

function captureSignupAadhaar(){
  document.getElementById('cameraPermModal').classList.add('show');
}
function grantCameraPermission(){
  document.getElementById('cameraPermModal').classList.remove('show');
  if(S._camForScheme){ S._camForScheme=false; runSchemeAadhaarScan(); return; } // opened from Govt schemes (schemes.js)
  document.getElementById('signupAadhaarCapture').style.display='none';
  document.getElementById('signupAadhaarScanning').style.display='block';
  setTimeout(()=>{
    document.getElementById('signupAadhaarScanning').style.display='none';
    document.getElementById('signupAadhaarConfirm').style.display='block';
    document.getElementById('signupAadhaarName').value=AADHAAR_SAMPLE.name;
    document.getElementById('signupAadhaarNum').value=AADHAAR_SAMPLE.number;
    S.name=AADHAAR_SAMPLE.name;
    S.aadhaar=AADHAAR_SAMPLE.number;
    S.fatherName=AADHAAR_SAMPLE.fatherName;
    S.dob=AADHAAR_SAMPLE.dob;
    S.gender=AADHAAR_SAMPLE.gender;
    S.address=AADHAAR_SAMPLE.addr;
    S.currentAddress=AADHAAR_SAMPLE.addr;
    document.getElementById('signupAadhaarAddr').textContent=AADHAAR_SAMPLE.addr;
    document.getElementById('signupAddressBlock').style.display='block';
    document.getElementById('sameAddressCheck').checked=true;
    document.getElementById('currentAddressFields').style.display='none';
  },1400);
}
function denyCameraPermission(){
  document.getElementById('cameraPermModal').classList.remove('show');
  if(S._camForScheme){ S._camForScheme=false; document.getElementById('spAadhaarInput').focus(); return; }
  showSignupAadhaarManual();
}

function showSignupAadhaarManual(){
  document.getElementById('signupAadhaarCapture').style.display='none';
  document.getElementById('signupAadhaarManual').style.display='block';
}

function completeSignupManualAadhaar(){
  const num=document.getElementById('signupAadhaarManualNum').value.trim();
  if(num.replace(/\s/g,'').length<12){toast('Enter a valid Aadhaar number');return;}
  toast('Verifying with UIDAI…');
  setTimeout(()=>{
    S.name=AADHAAR_SAMPLE.name;
    S.aadhaar=num;
    S.fatherName=AADHAAR_SAMPLE.fatherName;
    S.dob=AADHAAR_SAMPLE.dob;
    S.gender=AADHAAR_SAMPLE.gender;
    S.address=AADHAAR_SAMPLE.addr;
    S.currentAddress=AADHAAR_SAMPLE.addr;
    document.getElementById('signupAadhaarManual').style.display='none';
    document.getElementById('signupAadhaarConfirm').style.display='block';
    document.getElementById('signupAadhaarName').value=S.name;
    document.getElementById('signupAadhaarNum').value=num;
    document.getElementById('signupAadhaarAddr').textContent=AADHAAR_SAMPLE.addr;
    document.getElementById('signupAddressBlock').style.display='block';
    document.getElementById('sameAddressCheck').checked=true;
    document.getElementById('currentAddressFields').style.display='none';
  },900);
}

function toggleSignupAddress(){
  var same=document.getElementById('sameAddressCheck').checked;
  document.getElementById('currentAddressFields').style.display=same?'none':'block';
  if(!same){
    document.getElementById('currentAddrLine').focus();
  }
}

function completeSignup(){
  var same=document.getElementById('sameAddressCheck').checked;
  if(!same){
    var line=document.getElementById('currentAddrLine').value.trim();
    var city=document.getElementById('currentAddrCity').value.trim();
    var state=document.getElementById('currentAddrState').value.trim();
    var pin=document.getElementById('currentAddrPin').value.trim();
    if(!line||!city||!state||!pin){toast('Please fill in your current address');return;}
    S.currentAddress=line+', '+city+', '+state+' — '+pin;
  }
  finishSignup();
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

// ===== IDENTITY VERIFICATION TRACKER (PAN -> Aadhaar -> Photo) =====
// Used when user comes back to complete KYC from profile or loans flow
function idvSetNodeStatus(node,status){
  const el=document.getElementById('idvNode'+node);
  if(!el) return;
  el.className='idv-node '+status;
  el.querySelector('.ring').textContent=status==='done'?'✓':status==='skipped'?'—':'○';
  document.getElementById('idvStatus'+node).textContent=status==='done'?'Done':status==='active'?'In progress':status==='skipped'?'Skipped':'Pending';
}

// ===== PAN (for additional KYC, triggered from identity-verify screen) =====
const PAN_SAMPLE={name:'Ramesh Kumar',pan:'ABCPK1234F',dob:'15/06/1994'};
function capturePan(){
  document.getElementById('panCaptureBlock').style.display='none';
  document.getElementById('panScanBlock').style.display='block';
  setTimeout(()=>{
    document.getElementById('panScanBlock').style.display='none';
    document.getElementById('panFormBlock').style.display='block';
    document.getElementById('panOcrNote').style.display='block';
    document.getElementById('panName').value=PAN_SAMPLE.name;
    document.getElementById('panNumber').value=PAN_SAMPLE.pan;
    document.getElementById('panDob').value=PAN_SAMPLE.dob;
  },1400);
}
function showPanManual(){
  document.getElementById('panCaptureBlock').style.display='none';
  document.getElementById('panFormBlock').style.display='block';
  document.getElementById('panOcrNote').style.display='none';
}
function confirmPan(){
  const name=document.getElementById('panName').value.trim();
  const pan=document.getElementById('panNumber').value.trim();
  if(!name){toast('Enter your full name');return;}
  if(pan.length<10){toast('Enter a valid PAN number');return;}
  S.pan=pan;
  toast('Verifying PAN…');
  setTimeout(()=>{
    document.getElementById('panFormBlock').style.display='none';
    document.getElementById('panDoneCard').style.borderColor='var(--success)';
    document.getElementById('panDoneIcon').textContent='✅';
    document.getElementById('panDoneTitle').textContent='PAN verified';
    document.getElementById('panDoneSummary').textContent=name+' · '+pan;
    document.getElementById('panDoneBlock').style.display='block';
    idvSetNodeStatus('Pan','done');
    goToAadhaarStep();
  },900);
}
function skipPan(){
  document.getElementById('panCaptureBlock').style.display='none';
  document.getElementById('panFormBlock').style.display='none';
  document.getElementById('panDoneCard').style.borderColor='var(--border)';
  document.getElementById('panDoneIcon').textContent='ℹ️';
  document.getElementById('panDoneTitle').textContent='PAN skipped';
  document.getElementById('panDoneSummary').textContent='You can add this later';
  document.getElementById('panDoneBlock').style.display='block';
  idvSetNodeStatus('Pan','skipped');
  goToAadhaarStep();
}
function goToAadhaarStep(){
  // If Aadhaar already done (from signup), skip to photo
  if(S.aadhaar){
    idvSetNodeStatus('Aadhaar','done');
    document.getElementById('idvAadhaarSection').style.display='block';
    document.getElementById('aadhaarDoneSummary').textContent='XXXX XXXX '+S.aadhaar.replace(/\s/g,'').slice(-4);
    document.getElementById('aadhaarDoneBlock').style.display='block';
    document.getElementById('aadhaarCaptureBlock').style.display='none';
    idvSetNodeStatus('Photo','active');
    document.getElementById('idvPhotoSection').style.display='block';
    document.getElementById('idvPhotoSection').scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  idvSetNodeStatus('Aadhaar','active');
  document.getElementById('idvAadhaarSection').style.display='block';
  document.getElementById('idvVoiceLabel').textContent='Aadhaar capture';
  document.getElementById('idvAadhaarSection').scrollIntoView({behavior:'smooth',block:'start'});
}
function captureAadhaar(){
  document.getElementById('aadhaarCaptureBlock').style.display='none';
  document.getElementById('aadhaarScanBlock').style.display='block';
  setTimeout(()=>{
    document.getElementById('aadhaarScanBlock').style.display='none';
    document.getElementById('aadhaarFormBlock').style.display='block';
    document.getElementById('aadhaarOcrNote').style.display='block';
    document.getElementById('aadhaarNumber').value=AADHAAR_SAMPLE.number;
    document.getElementById('aadhaarName').value=AADHAAR_SAMPLE.name;
    document.getElementById('aadhaarFatherName').value=AADHAAR_SAMPLE.fatherName;
    document.getElementById('aadhaarDob').value=AADHAAR_SAMPLE.dob;
    document.getElementById('aadhaarGenderDisplay').textContent=AADHAAR_SAMPLE.gender;
    document.getElementById('aadhaarAddr').value=AADHAAR_SAMPLE.addr;
  },1400);
}
function showAadhaarManual(){
  document.getElementById('aadhaarCaptureBlock').style.display='none';
  document.getElementById('aadhaarFormBlock').style.display='block';
  document.getElementById('aadhaarOcrNote').style.display='none';
  document.getElementById('aadhaarGenderDisplay').textContent=AADHAAR_SAMPLE.gender;
}
function toggleCurrentAddress(){
  document.getElementById('currentAddrBlock').style.display=document.getElementById('sameAsAadhaarAddr').checked?'none':'block';
}
function confirmAadhaar(){
  const aadhaar=document.getElementById('aadhaarNumber').value.trim();
  const name=document.getElementById('aadhaarName').value.trim();
  const addr=document.getElementById('aadhaarAddr').value.trim();
  const sameAsAadhaar=document.getElementById('sameAsAadhaarAddr').checked;
  const currentAddr=sameAsAadhaar?addr:document.getElementById('currentAddr').value.trim();
  if(aadhaar.replace(/\s/g,'').length<12){toast('Enter a valid Aadhaar number');return;}
  if(!name){toast('Enter the name');return;}
  if(!addr){toast('Enter your address');return;}
  if(!sameAsAadhaar&&!currentAddr){toast('Enter your current address');return;}
  S.aadhaar=aadhaar;S.address=addr;S.currentAddress=currentAddr;
  S.fatherName=document.getElementById('aadhaarFatherName').value.trim();
  S.dob=document.getElementById('aadhaarDob').value.trim();
  S.gender=document.getElementById('aadhaarGenderDisplay').textContent.trim();
  if(!S.name) S.name=name;
  toast('Verifying Aadhaar…');
  document.getElementById('homeName').textContent=S.name.split(' ')[0];
  document.getElementById('profileName').textContent=S.name;
  document.getElementById('profileInitials').textContent=S.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  if(S.pan) document.getElementById('profilePan').textContent=S.pan.slice(0,1)+'XXXX'+S.pan.slice(5);
  document.getElementById('profileAadhaar').textContent='XXXX XXXX '+aadhaar.replace(/\s/g,'').slice(-4);
  setTimeout(()=>{
    document.getElementById('aadhaarFormBlock').style.display='none';
    document.getElementById('aadhaarDoneSummary').textContent='XXXX XXXX '+aadhaar.replace(/\s/g,'').slice(-4);
    document.getElementById('aadhaarDoneBlock').style.display='block';
    idvSetNodeStatus('Aadhaar','done');
    idvSetNodeStatus('Photo','active');
    document.getElementById('idvPhotoSection').style.display='block';
    document.getElementById('idvPhotoSection').scrollIntoView({behavior:'smooth',block:'start'});
  },900);
}
function capturePhoto(){
  document.getElementById('photoCaptureBlock').style.display='none';
  document.getElementById('photoScanBlock').style.display='block';
  setTimeout(()=>{
    document.getElementById('photoScanBlock').style.display='none';
    document.getElementById('photoDoneBlock').style.display='block';
    idvSetNodeStatus('Photo','done');
  },1400);
}

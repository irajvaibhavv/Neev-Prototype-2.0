// Neev Employee App — KYC via DigiLocker (fetches Aadhaar + PAN) + consents + selfie.
function openPanCapture(){
  document.getElementById('digilockerArea').style.display='block';
  document.getElementById('digilockerFetchingBlock').style.display='none';
  document.getElementById('digilockerDetailsBlock').style.display='none';
  document.getElementById('kycConsentsBlock').style.display='none';
  document.getElementById('kycSelfieBlock').style.display='none';
  document.getElementById('kycSelfieDoneBlock').style.display='none';
  go('s-pan-capture');
}

function openDigiLocker(){
  document.getElementById('digilockerArea').style.display='none';
  document.getElementById('digilockerFetchingBlock').style.display='block';
  toast('Connecting to DigiLocker...');
  setTimeout(()=>{
    // Simulate DigiLocker fetching Aadhaar + PAN
    S._panFetched={
      name:S.name||'Ramesh Kumar',
      number:'ABCDE1234F',
      dob:'15/03/1992'
    };
    S.aadhaar=S.aadhaar||'1234 5678 9012';
    S.name=S._panFetched.name;
    document.getElementById('dlFetchedName').textContent=S._panFetched.name;
    document.getElementById('dlFetchedPan').textContent=S._panFetched.number;
    document.getElementById('dlFetchedAadhaar').textContent='XXXX XXXX '+S.aadhaar.replace(/\s/g,'').slice(-4);
    document.getElementById('dlFetchedDob').textContent=S._panFetched.dob;
    document.getElementById('digilockerFetchingBlock').style.display='none';
    document.getElementById('digilockerDetailsBlock').style.display='block';
  },2000);
}

function confirmDigiLockerDetails(){
  S.panNumber=S._panFetched.number;
  S.panName=S._panFetched.name;
  toast('Documents verified via DigiLocker!');
  // Show consents
  document.getElementById('digilockerDetailsBlock').style.display='none';
  document.getElementById('kycConsentsBlock').style.display='block';
  renderKycConsents();
}

// KYC consents (CKYC, CIBIL, EPFO, ESIC)
const KYC_CONSENTS=[
  {key:'ckyc',icon:'🪪',title:'CKYC',desc:'Central KYC registry verification'},
  {key:'cibil',icon:'📊',title:'CIBIL',desc:'Credit score check for better rates'},
  {key:'epfo',icon:'🏛️',title:'EPFO',desc:'Verify employment and provident fund'},
  {key:'esic',icon:'🏥',title:'ESIC',desc:'Verify insurance coverage'}
];

function renderKycConsents(){
  var allOn=KYC_CONSENTS.every(c=>S.permissions[c.key]);
  var container=document.getElementById('kycConsentsList');
  container.innerHTML='';
  KYC_CONSENTS.forEach(c=>{
    var on=!!S.permissions[c.key];
    container.innerHTML+=`<div class="dp-card">
      <span class="ic">${c.icon}</span>
      <div class="body"><div class="head"><b>${c.title}</b></div><p>${c.desc}</p></div>
      <div class="dp-toggle ${on?'on':''}" id="kycToggle-${c.key}" onclick="toggleKycConsent('${c.key}')"></div>
    </div>`;
  });
  var btn=document.getElementById('kycAllowAllBtn');
  if(btn) btn.textContent=allOn?'All allowed ✓':'Allow All';
}

function toggleKycConsent(key){
  S.permissions[key]=!S.permissions[key];
  // Also update the permissions screen toggles if they exist
  var permToggle=document.getElementById('permToggle-'+key);
  if(permToggle) permToggle.classList.toggle('on',!!S.permissions[key]);
  renderKycConsents();
}

function toggleAllKycConsents(){
  var allOn=KYC_CONSENTS.every(c=>S.permissions[c.key]);
  KYC_CONSENTS.forEach(c=>S.permissions[c.key]=!allOn);
  renderKycConsents();
}

function continueFromKycConsents(){
  if(!KYC_CONSENTS.every(c=>S.permissions[c.key])){
    toast('Please allow all consents to continue');
    return;
  }
  // Also mark the 3 permissions screen keys as done
  S.permissions.cibil=true;
  S.permissions.epfo=true;
  S.permissions.esic=true;
  // Show selfie capture
  document.getElementById('kycConsentsBlock').style.display='none';
  document.getElementById('kycSelfieBlock').style.display='block';
}

function captureKycSelfie(){
  document.getElementById('kycSelfieBlock').style.display='none';
  toast('Capturing selfie for face match...');
  setTimeout(function(){
    document.getElementById('kycSelfieDoneBlock').style.display='block';
    toast('Face match successful!');
  },1500);
}

function finishKycFlow(){
  toast('KYC complete!');
  if(S._panThenLoan){
    S._panThenLoan=false;
    // Skip permissions since they were done on KYC screen
    openBankStatementStep();
  } else {
    openLoansHub();
  }
}

// Legacy: keep confirmPanDetails working for any old callers
function confirmPanDetails(){
  finishKycFlow();
}

function retakePanPhoto(){
  document.getElementById('digilockerDetailsBlock').style.display='none';
  document.getElementById('digilockerArea').style.display='block';
}

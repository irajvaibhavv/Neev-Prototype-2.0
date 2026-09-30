// Neev Employee App — employer verification: company (or badge scan) → Employee ID → HRMS phone OTP.
const KNOWN_COMPANIES={
  'BuildRight Constructions':{initial:'B',color:'var(--teal-900)',dept:'Site Labour',desig:'Mason',region:'Pune'},
  'QuickServe Logistics':{initial:'Q',color:'var(--marigold-600)',dept:'Delivery',desig:'Rider',region:'Mumbai'},
  'SecureGuard Facilities':{initial:'S',color:'#3B5A9A',dept:'Security',desig:'Guard',region:'Delhi NCR'},
  'Zomato':{initial:'Z',color:'#E23744',dept:'Delivery',desig:'Rider',region:'Mumbai'},
  'Swiggy':{initial:'S',color:'#FC8019',dept:'Delivery',desig:'Rider',region:'Delhi NCR'},
  'Urban Company':{initial:'U',color:'#1B1B1B',dept:'Services',desig:'Technician',region:'Delhi NCR'},
  'BigBasket':{initial:'B',color:'#84C225',dept:'Delivery',desig:'Rider',region:'Mumbai'},
  'Dunzo':{initial:'D',color:'#00D290',dept:'Delivery',desig:'Rider',region:'Pune'},
  'Porter':{initial:'P',color:'#2C3E50',dept:'Logistics',desig:'Driver',region:'Mumbai'},
  'Rapido':{initial:'R',color:'#FFD700',dept:'Delivery',desig:'Rider',region:'Delhi NCR'}
};

function startEmployerSetup(){
  // Signup only captures the phone — ask for the real name before matching with HR records
  if(!S.name||S.name==='User'){
    document.getElementById('profileNameInput').value='';
    document.getElementById('profileNameModal').classList.add('show');
    return;
  }
  const companyRow=document.getElementById('esCompanyRow');
  document.getElementById('esCompanySelect').value='';
  document.getElementById('esNotTiedUp').style.display='none';
  document.getElementById('esEcnBlock').style.display='none';
  document.getElementById('esBadgeScanBlock').style.display='none';

  if(S.signupCompany && KNOWN_COMPANIES[S.signupCompany]){
    if(companyRow) companyRow.style.display='none';
    S.company=S.signupCompany;
    const known=KNOWN_COMPANIES[S.signupCompany];
    document.getElementById('esEcnLogo').textContent=known.initial;
    document.getElementById('esEcnLogo').style.background=known.color;
    document.getElementById('esEcnCompanyName').textContent=S.signupCompany;
    document.getElementById('esEcnInput').value='';
    document.getElementById('esEcnResult').style.display='none';
    document.getElementById('esPhoneAuthBlock').style.display='none';
    document.getElementById('esPhoneMismatchNote').style.display='none';
    document.getElementById('esNameMismatch').style.display='none';
    document.getElementById('esEcnBtn').disabled=false;
    document.getElementById('esEcnBtn').textContent='Verify';
    document.getElementById('esEcnBlock').style.display='block';
  } else {
    if(companyRow) companyRow.style.display='';
  }

  go('s-employer-setup');
}

function onEsCompanyChange(){
  const val=document.getElementById('esCompanySelect').value;
  const known=KNOWN_COMPANIES[val];
  document.getElementById('esBadgeScanBlock').style.display='none';
  if(!val){
    document.getElementById('esNotTiedUp').style.display='none';
    document.getElementById('esEcnBlock').style.display='none';
  } else if(val==='other'){
    // Company not listed — show "Add company name" + badge scan option
    document.getElementById('esEcnBlock').style.display='none';
    document.getElementById('esNotTiedUp').style.display='block';
    document.getElementById('esBadgeScanBlock').style.display='block';
  } else if(known){
    document.getElementById('esNotTiedUp').style.display='none';
    S.company=val;
    document.getElementById('esEcnLogo').textContent=known.initial;
    document.getElementById('esEcnLogo').style.background=known.color;
    document.getElementById('esEcnCompanyName').textContent=val;
    document.getElementById('esEcnInput').value='';
    document.getElementById('esEcnResult').style.display='none';
    document.getElementById('esPhoneAuthBlock').style.display='none';
    document.getElementById('esPhoneMismatchNote').style.display='none';
    document.getElementById('esNameMismatch').style.display='none';
    document.getElementById('esEcnBtn').disabled=false;
    document.getElementById('esEcnBtn').textContent='Verify';
    document.getElementById('esEcnBlock').style.display='block';
    document.getElementById('esBadgeScanBlock').style.display='block';
    setTimeout(()=>document.getElementById('esEcnInput').focus(),200);
  } else {
    document.getElementById('esEcnBlock').style.display='none';
    document.getElementById('esNotTiedUp').style.display='block';
    document.getElementById('esBadgeScanBlock').style.display='block';
  }
}

function scanEmployeeBadge(){
  toast('Scanning badge...');
  setTimeout(function(){
    var sel=document.getElementById('esCompanySelect');
    if(!sel.value || sel.value==='other'){
      sel.value='BuildRight Constructions';
      onEsCompanyChange();
    }
    document.getElementById('esEcnInput').value='ECN-48213';
    toast('Badge scanned! Details auto-filled.');
  },1500);
}

function verifyEmployerSetupEcn(){
  const ecn=document.getElementById('esEcnInput').value.trim();
  if(ecn.length<3){toast('Enter your Employee ID');return;}
  S.ecn=ecn;
  const btn=document.getElementById('esEcnBtn');btn.disabled=true;btn.textContent="Checking…";
  const box=document.getElementById('esEcnResult');box.style.display='block';
  box.innerHTML='<div class="card center-col" style="padding:16px;"><div style="font-size:20px;">⏳</div><p class="muted" style="margin-top:6px;">Verifying with '+S.company+'…</p></div>';
  setTimeout(()=>{
    if(!S.salary) S.salary=[20000,25000,30000][Math.floor(Math.random()*3)];
    const known=KNOWN_COMPANIES[S.company];
    if(!S.department){
      S.department=known?known.dept:'General';
      S.designation=known?known.desig:'Staff';
      S.region=known?(known.region||'Mumbai'):'Mumbai';
    }
    // MVP demo: every BuildRight employee is Ramesh Kumar; other companies echo the name the user entered
    if(S.company==='BuildRight Constructions'){ S.name='Ramesh Kumar'; applyProfileFields(); }
    S._empNameFromHR=S.name;
    S._empPhoneFromHR=S.mobile||'9876543210';

    const aadhaarName=(S.name||'').toLowerCase().trim();
    const empName=(S._empNameFromHR||'').toLowerCase().trim();
    if(aadhaarName && empName && aadhaarName!==empName){
      box.style.display='none';
      document.getElementById('esMismatchAadhaar').textContent=S.name;
      document.getElementById('esMismatchEmp').textContent=S._empNameFromHR;
      document.getElementById('esNameMismatch').style.display='block';
      btn.disabled=false;btn.textContent='Verify';
      return;
    }

    const loginPhone=(S.mobile||'').replace(/\D/g,'').slice(-10);
    const hrmsPhone=(S._empPhoneFromHR||'').replace(/\D/g,'').slice(-10);
    const phoneMatch=loginPhone && hrmsPhone && loginPhone===hrmsPhone;

    if(phoneMatch){
      box.innerHTML='<div class="card center-col" style="padding:16px;border-color:var(--success);"><div style="font-size:28px;">✅</div><b style="margin-top:8px;">Employee verified!</b><p class="muted" style="font-size:13px;margin-top:4px;">'+S._empNameFromHR+' · '+S.designation+'</p><p class="muted" style="font-size:12px;margin-top:4px;">🏢 '+(S.department||'Operations')+' · '+(S.region||'Mumbai')+'</p></div>';
      document.getElementById('esPhoneAuthBlock').style.display='none';
      setTimeout(()=>verifyEcnPhoneOtp(),3000);
    } else {
      box.innerHTML='<div class="card center-col" style="padding:16px;border-color:var(--success);"><div style="font-size:28px;">✅</div><b style="margin-top:8px;">Employee found!</b><p class="muted" style="font-size:13px;margin-top:4px;">'+S._empNameFromHR+' · '+S.designation+'</p><p class="muted" style="font-size:12px;margin-top:4px;">🏢 '+(S.department||'Operations')+' · '+(S.region||'Mumbai')+'</p></div>';
      const phoneLast4=S._empPhoneFromHR.slice(-4);
      document.getElementById('esPhoneLast4').textContent=phoneLast4;
      document.getElementById('esPhoneMismatchNote').style.display='block';
      document.getElementById('esPhoneAuthBlock').style.display='block';
      setTimeout(()=>document.getElementById('esPhoneAuthBlock').scrollIntoView({behavior:'smooth',block:'center'}),100);
      toast('Phone mismatch — OTP sent to employer records number');
    }
  },1400);
}

function verifyEcnPhoneOtp(){
  toast('Verifying…');
  setTimeout(()=>{
    document.getElementById('companyNameHome').textContent=S.company;
    document.getElementById('profileCompany').textContent=S.company;
    document.getElementById('profileEcn').textContent=S.ecn;
    const van='NEEV00'+S.custId+'01';
    document.getElementById('profileVan').textContent=van;
    renderSakhi();
    updateProfileNudge();
    toast('Employer verified!');
    setTimeout(()=>{
      if(S._fromLoans){
        S._fromLoans=false;
        if(!S.panNumber){
          S._panThenLoan=true;
          openPanCapture();
        } else {
          startPermissions();
        }
      } else {
        go('s-home');
      }
    },500);
  },900);
}

// Called when identity verify finishes
function finishIdentityVerify(){
  updateProfileNudge();
  if(!S.company && S._fromLoans){
    S._fromLoans=false;
    startEmployerSetup();
  } else {
    go('s-home');
    toast('Identity verified!');
  }
}

function saveProfileName(){
  const name=document.getElementById('profileNameInput').value.trim().replace(/\s+/g,' ');
  if(name.length<3||!/^[A-Za-z .]+$/.test(name)){toast('Enter your full name as on Aadhaar');return;}
  S.name=name;
  applyProfileFields();
  saveCurrentProfile();
  document.getElementById('profileNameModal').classList.remove('show');
  startEmployerSetup();
}

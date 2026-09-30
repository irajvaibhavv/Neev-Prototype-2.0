// Neev Employer Portal — login + render-all bootstrap.
// Flow: phone number → OTP → (optional CIN) → log in.
function toggleLoginBranch(){
  const role=document.querySelector('input[name="loginRole"]:checked').value;
  document.getElementById('loginBranchRow').style.display = role==='branch' ? 'block' : 'none';
}
function findLoginCompany(){
  const cin = (document.getElementById('loginCin').value||'').trim().toUpperCase();
  if(cin) return Object.values(COMPANIES).find(c=>c.cin===cin) || REGISTERED_COMPANIES.find(c=>c.cin===cin);
  return COMPANIES.buildright;
}
function sendCompanyOtp(){
  const mobile = document.getElementById('loginMobile').value.trim();
  if(mobile.length<10){ toast('Enter a valid 10-digit mobile number'); return; }
  document.getElementById('loginOtpBlock').style.display='block';
  document.getElementById('loginCinRow').style.display='block';
  document.getElementById('loginSendOtpBtn').style.display='none';
  toast('OTP sent to '+mobile);
  let t=30;
  const iv=setInterval(()=>{
    t--;
    const timerEl=document.getElementById('loginResendTimer');
    if(timerEl) timerEl.textContent=t;
    if(t<=0){
      clearInterval(iv);
      document.getElementById('loginResendTxt').innerHTML='<span style="color:var(--t7);font-weight:700;cursor:pointer;" onclick="sendCompanyOtp()">Resend OTP</span>';
    }
  },1000);
}
function doLogin(){
  if(document.getElementById('loginOtpBlock').style.display!=='block'){ toast('Send an OTP to your registered mobile first'); return; }
  const otp = document.getElementById('loginOtp').value.trim();
  if(otp.length<4){ toast('Enter the 4-digit OTP'); return; }
  const comp = findLoginCompany();
  if(!comp){ toast('Company ID not recognised. Check the CIN or leave it blank to use the default demo company.'); return; }
  currentCompany = comp;

  const role = document.querySelector('input[name="loginRole"]:checked').value;
  const branch = role==='branch' ? document.getElementById('loginBranch').value : null;
  currentScope = { role:role, branch:branch };

  document.getElementById('loginWrap').style.display = 'none';
  document.getElementById('appWrap').style.display = 'block';
  document.getElementById('sbCompany').textContent = currentCompany.name;
  document.getElementById('sbScope').textContent = role==='branch' ? 'Area Manager · '+branch : 'Company Admin · all branches';
  document.getElementById('setCompanyName').textContent = currentCompany.name;

  const branchFilter=document.getElementById('empBranchFilter');
  if(branchFilter){
    if(role==='branch'){ branchFilter.value=branch; branchFilter.disabled=true; }
    else { branchFilter.disabled=false; }
  }
  document.getElementById('addEmpBtn').style.display = role==='company' ? 'inline-block' : 'none';
  document.getElementById('bulkUploadBtn').style.display = role==='company' ? 'inline-block' : 'none';
  renderAll();
  saveCompanyState();
}

function logout(){
  localStorage.removeItem('neev_company_state');
  location.reload();
}

function renderAll(){
  renderDashboard();renderEmployees();renderPayroll();renderSettlement();renderRecon();renderAnalyticsChart();renderCompanyProfile();
}

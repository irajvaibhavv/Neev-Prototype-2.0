// Neev Employer Portal — company sign-up: CIN/GST/PAN/TAN, HRMS + IP, addresses, then log in with CIN.
function showSignup(){
  document.getElementById('loginWrap').style.display='none';
  document.getElementById('signupWrap').style.display='flex';
}
function showLogin(prefillCin){
  document.getElementById('signupWrap').style.display='none';
  document.getElementById('loginWrap').style.display='flex';
  if(prefillCin) document.getElementById('loginCin').value=prefillCin;
}
function syncHoAddress(){
  if(document.getElementById('suSameAddr').checked){
    document.getElementById('suHoAddr').value=document.getElementById('suCompanyAddr').value;
  }
}
function toggleSameAddress(){
  const same=document.getElementById('suSameAddr').checked;
  const ho=document.getElementById('suHoAddr');
  ho.disabled=same;
  if(same) ho.value=document.getElementById('suCompanyAddr').value;
}
function submitSignup(){
  const name=document.getElementById('suName').value.trim();
  const cin=document.getElementById('suCin').value.trim().toUpperCase();
  const gst=document.getElementById('suGst').value.trim().toUpperCase();
  const pan=document.getElementById('suPan').value.trim().toUpperCase();
  const tan=document.getElementById('suTan').value.trim().toUpperCase();
  const ip=document.getElementById('suIp').value.trim();
  const companyAddr=document.getElementById('suCompanyAddr').value.trim();
  const hoAddr=document.getElementById('suHoAddr').value.trim();
  const contact=document.getElementById('suContact').value.trim();
  const email=document.getElementById('suEmail').value.trim();
  const pass=document.getElementById('suPass').value;
  const pass2=document.getElementById('suPass2').value;

  if(!name){toast('Enter your company name');return;}
  if(cin.length<21){toast('Enter a valid 21-character CIN number');return;}
  if(gst.length<15){toast('Enter a valid 15-character GST number');return;}
  if(pan.length<10){toast('Enter a valid 10-character PAN');return;}
  if(tan.length<10){toast('Enter a valid 10-character TAN');return;}
  if(!ip){toast('Enter the server IP address to whitelist');return;}
  if(!companyAddr){toast('Enter your company address');return;}
  if(!hoAddr){toast('Enter your head office address');return;}
  if(!contact||!email){toast('Enter a contact person and work email');return;}
  if(!pass||pass!==pass2){toast('Passwords do not match');return;}

  REGISTERED_COMPANIES.push({
    name:name, cin:cin, gst:gst, pan:pan, tan:tan,
    hrms:document.getElementById('suHrms').value,
    ip:ip, companyAddr:companyAddr, hoAddr:hoAddr,
    contact:contact, email:email, password:pass,
    sector:'—', employees:0, onNeev:0
  });
  toast('Company registered! Log in with your CIN to continue.');
  showLogin(cin);
}

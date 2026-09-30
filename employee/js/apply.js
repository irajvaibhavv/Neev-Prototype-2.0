// Neev Employee App — get advance: amount + reason tiles, cost breakdown, T2E agreement/quick confirm, success.

function renderLoanUserStrips(){
  const initials=S.name?S.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2):'';
  for(let i=1;i<=3;i++){
    const av=document.getElementById('loanAvatar'+i);
    const nm=document.getElementById('loanName'+i);
    const co=document.getElementById('loanCompany'+i);
    if(av) av.textContent=initials;
    if(nm) nm.textContent=S.name||'';
    if(co) co.textContent=S.company||'';
  }
}

function openLoansEntry(){
  if(!S.company){
    if(S.signupCompany && !KNOWN_COMPANIES[S.signupCompany]){
      openNotPartnered();
      return;
    }
    S._fromLoans=true;
    startEmployerSetup();
    return;
  }
  if(!S.panNumber){
    S._panThenLoan=true;
    openPanCapture();
    return;
  }
  if(!ALL_PERM_KEYS.every(k=>S.permissions[k])){
    startPermissions();
    return;
  }
  if(!S.bankStatementDone){
    openBankStatementStep();
    return;
  }
  openLoansHub();
}

function openApplyEntry(){
  openApply();
}
function openApply(){
  const elig=eligible();
  const slider=document.getElementById('applySlider');
  slider.max=Math.max(1000,elig);slider.min=1000;
  slider.value=Math.min(parseInt(slider.value),elig);
  document.getElementById('applyMaxLabel').textContent=fmt(elig);
  S.selectedTenure=Math.max(1,Math.round((S.payDay-S.currentDay)/7));
  // Reset reason tiles
  S._selectedReason='';
  var tiles=document.querySelectorAll('.reason-tile');
  tiles.forEach(function(t){t.classList.remove('selected');});
  document.getElementById('loanReasonOtherRow').style.display='none';
  document.getElementById('loanReasonOther').value='';
  renderLoanUserStrips();
  updateApply();go('s-apply');
}

function selectReasonTile(reason,el){
  S._selectedReason=reason;
  var tiles=document.querySelectorAll('.reason-tile');
  tiles.forEach(function(t){t.classList.remove('selected');});
  el.classList.add('selected');
  document.getElementById('loanReasonOtherRow').style.display=reason==='other'?'block':'none';
}

function effectiveAPR(){return Math.round(15/1000*100*52);}

function updateApply(){
  const amt=parseInt(document.getElementById('applySlider').value);
  const units=amt/1000;
  const weeks=S.selectedTenure;
  const charge=units*15*weeks;
  const gst=Math.round(charge*0.18);
  const net=amt-charge-gst;
  document.getElementById('applyAmtDisplay').textContent=fmt(amt);
  document.getElementById('bkAmount').textContent=fmt(amt);
  document.getElementById('bkRateLabel').textContent='₹15/1000 x '+weeks+' wk'+(weeks>1?'s':'');
  document.getElementById('bkCharge').textContent='-'+fmt(charge);
  document.getElementById('bkGst').textContent='-'+fmt(gst);
  document.getElementById('bkApr').textContent=effectiveAPR()+'% p.a.';
  document.getElementById('bkNet').textContent=fmt(net);
  checkLowBalance();
}
function goToConfirm(){
  if(!S._selectedReason){toast('Please select a reason for the advance');return;}
  if(S._selectedReason==='other'&&!document.getElementById('loanReasonOther').value.trim()){toast('Please specify your reason');return;}
  continueFromBankStatement();
}

function continueFromBankStatement(){
  const amt=parseInt(document.getElementById('applySlider').value);
  const units=amt/1000;const weeks=S.selectedTenure;
  const charge=units*15*weeks;const gst=Math.round(charge*0.18);const net=amt-charge-gst;
  document.getElementById('kfsAmount').textContent=fmt(amt);
  document.getElementById('kfsAmount2').textContent=fmt(amt);
  document.getElementById('kfsAmount3').textContent=amt.toLocaleString('en-IN');
  document.getElementById('kfsTenure').textContent=weeks+' week'+(weeks>1?'s':'');
  document.getElementById('kfsDueDate').textContent=S.payDay+'th Aug';
  document.getElementById('kfsInterest').textContent='-'+fmt(charge);
  document.getElementById('kfsCharge').textContent='-'+fmt(charge);
  document.getElementById('kfsGst').textContent='-'+fmt(gst);
  document.getElementById('kfsApr').textContent=effectiveAPR()+'% p.a.';
  document.getElementById('kfsNet').textContent=fmt(net);
  document.getElementById('kfsCompany').textContent=S.company||'your employer';
  populateDisbursementAccounts();
  S.enachConfirmed=false;
  S.esignConfirmed=false;
  document.getElementById('enachCheck').checked=false;
  document.getElementById('esignCheck').checked=false;
  document.getElementById('agreeCheck').checked=false;
  if(S.t2eSigned){
    document.getElementById('kfsEsignTitle').textContent='Confirm with OTP';
    document.getElementById('kfsEsignBtn').textContent='Confirm & get money';
  } else {
    document.getElementById('kfsEsignTitle').textContent='E-Sign (Loan agreement)';
    document.getElementById('kfsEsignBtn').textContent='E-sign & get money';
  }
  document.getElementById('kfsEsignBtn').disabled=true;
  checkKfsSubmit();
  go('s-kfs');
}

function onAgreeCheckClick(){
  const cb=document.getElementById('agreeCheck');
  if(cb.checked){
    cb.checked=false;
    openTcModal();
  } else {
    document.getElementById('kfsAgreeReveal').style.display='none';
    checkKfsEsign();
  }
}
function openTcModal(){
  document.getElementById('tcAgreeCheck').checked=false;
  document.getElementById('tcConfirmBtn').disabled=true;
  document.getElementById('loanTcModal').classList.add('show');
}
function toggleTcAgree(){
  document.getElementById('tcConfirmBtn').disabled=!document.getElementById('tcAgreeCheck').checked;
}
function confirmTcModal(){
  if(!document.getElementById('tcAgreeCheck').checked) return;
  document.getElementById('loanTcModal').classList.remove('show');
  document.getElementById('agreeCheck').checked=true;
  const reveal=document.getElementById('kfsAgreeReveal');
  reveal.style.display='block';
  reveal.style.animation='fadein .32s cubic-bezier(.22,1,.36,1)';
  setTimeout(()=>reveal.scrollIntoView({behavior:'smooth',block:'start'}),50);
  checkKfsEsign();
}
function cancelTcModal(){
  document.getElementById('loanTcModal').classList.remove('show');
  document.getElementById('agreeCheck').checked=false;
}

function checkKfsEsign(){
  const btn=document.getElementById('kfsEsignBtn');
  if(!btn) return;
  const agreed=document.getElementById('agreeCheck')?.checked;
  if(!agreed){btn.disabled=true;return;}
  btn.disabled=!(S.enachConfirmed && S.esignConfirmed);
}

function onEsignCheckClick(cb){
  if(cb.checked){
    cb.checked=false;
    openEsignForm();
  } else {
    S.esignConfirmed=false;
    checkKfsEsign();
  }
}
function openEsignForm(){
  document.getElementById('esignName').value=S.name||'';
  if(S.t2eSigned){
    document.getElementById('esignFirstTimeBanner').style.display='none';
    document.getElementById('esignRepeatBanner').style.display='block';
    document.getElementById('esignNameRow').style.display='none';
  } else {
    document.getElementById('esignFirstTimeBanner').style.display='block';
    document.getElementById('esignRepeatBanner').style.display='none';
    document.getElementById('esignNameRow').style.display='block';
  }
  Array.from(document.querySelectorAll('#esignOtpRow .otpd')).forEach(i=>i.value='');
  document.getElementById('esignModal').classList.add('show');
}
// Auto-fill removed per client feedback (Point 12)
function confirmEsignForm(){
  var name=document.getElementById('esignName').value.trim();
  var otp=Array.from(document.querySelectorAll('#esignOtpRow .otpd')).map(function(i){return i.value;}).join('');
  if(!S.t2eSigned && name.length<3){toast('Type your full name to e-sign');return;}
  if(otp.length<4){toast('Enter the 4-digit OTP');return;}
  S.esignConfirmed=true;
  S.t2eSigned=true;
  document.getElementById('esignModal').classList.remove('show');
  document.getElementById('esignCheck').checked=true;
  toast('E-Sign confirmed');
  checkKfsEsign();
}
function cancelEsignForm(){
  document.getElementById('esignModal').classList.remove('show');
  document.getElementById('esignCheck').checked=false;
}

const REASON_LABELS={medical:'Medical',personal:'Personal',education:'Education',other:'Others'};
function confirmLoan(){
  const amt=parseInt(document.getElementById('applySlider').value);
  const units=amt/1000;const weeks=S.selectedTenure;
  const charge=units*15*weeks;const gst=Math.round(charge*0.18);const net=amt-charge-gst;
  const reason=S._selectedReason==='other'?document.getElementById('loanReasonOther').value.trim():(REASON_LABELS[S._selectedReason]||'');
  S.t2eSigned=true;
  const loanNum=S.loans.length+1;
  const lan=S.custId+'0'+loanNum+'2026';
  const van='NEEV00'+S.custId+'0'+loanNum;
  const loan={lan:lan,van:van,amount:amt,charge:charge,gst:gst,net:net,tenure:weeks,reason:reason,date:'Today',dueDate:S.payDay+'th Aug',status:'Active'};
  S.loans.unshift(loan);
  document.getElementById('successAmt').textContent=fmt(net);
  document.getElementById('successLan').textContent=lan;
  document.getElementById('successCustId').textContent=String(S.custId);
  document.getElementById('successVan').textContent=van;
  addNotification('Advance of '+fmt(net)+' sent to '+S.bankName+' ****'+S.bankLast4+'. LAN: '+lan,true);
  addNotification('Reminder: '+fmt(amt)+' will be deducted from your salary on '+S.payDay+'th. Employer pays to VAN '+van+'.',false);
  addNotification('Your employer '+S.company+' has been notified about your advance and VAN.',false);
  addPoints(10,'Loan taken');
  renderLoansHub();renderLedger();renderHistory();renderDocuments();go('s-success');
}

function quickRepeatLoan(){
  const lastLoan=S.loans.find(l=>l.status!=='Active');
  const amt=lastLoan?lastLoan.amount:5000;
  document.getElementById('applySlider').value=amt;
  S._selectedReason='personal';
  S.selectedTenure=Math.max(1,Math.round((S.payDay-S.currentDay)/7));
  updateApply();
  continueFromBankStatement();
}

function checkLowBalance(){
  const amt = parseInt(document.getElementById('applySlider').value);
  const takehome = S.salary - outstanding() - amt;
  const warn = document.getElementById('lowBalanceWarn');
  const msg = document.getElementById('lowBalanceMsg');
  if(takehome < S.salary * 0.3){
    warn.style.display = 'block';
    msg.textContent = 'After this deduction, your take-home will be '+fmt(takehome)+'. That is less than 30% of your salary. Are you sure?';
  } else {
    warn.style.display = 'none';
  }
}

function populateDisbursementAccounts(){
  const el=document.getElementById('kfsSalaryBank');
  if(!el) return;
  const salaryIdx=typeof bsSelectedAccount!=='undefined'?bsSelectedAccount:-1;
  if(salaryIdx>=0 && typeof MOCK_AA_ACCOUNTS!=='undefined'){
    const acc=MOCK_AA_ACCOUNTS[salaryIdx];
    el.textContent=acc.bank+' ****'+acc.last4;
  } else if(S.bankLast4){
    el.textContent=(S.bankName||'Bank')+' ****'+S.bankLast4;
  } else {
    el.textContent='Your salary account';
  }
}
function onDisbursementChange(){
  const val=document.getElementById('kfsDisbursementAcct').value;
  document.getElementById('kfsDisbursementOther').style.display=val==='other'?'block':'none';
}
function saveOtherBankAccount(){
  const accNum=document.getElementById('kfsOtherAccNum').value.trim();
  const ifsc=document.getElementById('kfsOtherIfsc').value.trim();
  const bankName=document.getElementById('kfsOtherBankName').value.trim();
  if(!accNum){toast('Enter account number');return;}
  if(!ifsc){toast('Enter IFSC code');return;}
  if(!bankName){toast('Enter bank name');return;}
  const last4=accNum.slice(-4);
  const sel=document.getElementById('kfsDisbursementAcct');
  const opt=document.createElement('option');
  opt.value='custom_'+accNum;
  opt.textContent=bankName+' ****'+last4;
  sel.insertBefore(opt,sel.querySelector('option[value="other"]'));
  sel.value=opt.value;
  document.getElementById('kfsDisbursementOther').style.display='none';
  toast('Account saved');
}

function openNotPartnered(){
  document.getElementById('npCompanyName').textContent=S.signupCompany||'your company';
  document.getElementById('npHrName').value='';
  document.getElementById('npHrPhone').value='';
  document.getElementById('npHrEmail').value='';
  go('s-not-partnered');
}

function submitHrReferral(){
  const name=document.getElementById('npHrName').value.trim();
  const phone=document.getElementById('npHrPhone').value.trim();
  const email=document.getElementById('npHrEmail').value.trim();
  if(!name){toast('Please enter your manager/HR name');return;}
  if(!phone||phone.length<10){toast('Please enter a valid phone number');return;}
  S.hrReferral={name:name,phone:phone,email:email,company:S.signupCompany};
  toast('Details saved! We\'ll reach out to your company');
  setTimeout(function(){go('s-home');},1200);
}

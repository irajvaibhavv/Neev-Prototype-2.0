// Neev Employee App — bank verification via Account Aggregator only.
// No manual upload. ESIC/EPF verification removed (collected post-advance).
const MOCK_AA_ACCOUNTS=[
  {bank:'State Bank of India',last4:'1234',icon:'🏦'},
  {bank:'HDFC Bank',last4:'5678',icon:'🏦'}
];
let bsSelectedAccount=-1;

function openBankStatementStep(){
  bsSelectedAccount=-1;
  // AA consent
  const aaBlock=document.getElementById('aaConsentBlock');
  const aaOtp=document.getElementById('aaOtpSection');
  const aaBadge=document.getElementById('aaVerifiedBadge');
  if(S.permissions.accountAggregator){
    aaBlock.style.display='none';
    document.getElementById('bsFetchingAccountsBlock').style.display='block';
  } else {
    aaBlock.style.display='block';
    document.getElementById('bsAaConsentCheck').checked=false;
    document.getElementById('aaConsentCheckRow').style.display='block';
    aaOtp.style.display='none';
    aaBadge.style.display='none';
    document.getElementById('aaPhoneLast4').textContent=(S.mobile||'9876543210').slice(-4);
    const otpInputs=document.querySelectorAll('#aaOtpSection .otpd');
    otpInputs.forEach(i=>i.value='');
    document.getElementById('bsFetchingAccountsBlock').style.display='none';
  }
  document.getElementById('bsAccountSelectBlock').style.display='none';
  if(typeof renderLoanUserStrips==='function') renderLoanUserStrips();
  go('s-bank-statement');
  if(S.permissions.accountAggregator){
    setTimeout(fetchAaAccounts,1200);
  }
}

function toggleBsAaConsentOtp(){
  const checked=document.getElementById('bsAaConsentCheck').checked;
  const otpBlock=document.getElementById('aaOtpSection');
  if(checked){
    otpBlock.style.display='block';
    toast('OTP sent for AA consent');
  } else {
    otpBlock.style.display='none';
  }
}

function verifyAaConsent(){
  const otpInputs=document.querySelectorAll('#aaOtpSection .otpd');
  const otp=Array.from(otpInputs).map(i=>i.value).join('');
  if(otp.length<4){toast('Enter the 4-digit OTP');return;}
  toast('Verifying consent…');
  setTimeout(()=>{
    S.permissions.accountAggregator=true;
    document.getElementById('aaConsentCheckRow').style.display='none';
    document.getElementById('aaOtpSection').style.display='none';
    document.getElementById('aaVerifiedBadge').style.display='block';
    document.getElementById('bsFetchingAccountsBlock').style.display='block';
    setTimeout(fetchAaAccounts,1000);
  },800);
}

function fetchAaAccounts(){
  document.getElementById('bsFetchingAccountsBlock').style.display='none';
  if(S.bankLast4){
    const matchIdx=MOCK_AA_ACCOUNTS.findIndex(a=>a.last4===S.bankLast4);
    if(matchIdx>=0) bsSelectedAccount=matchIdx;
  }
  document.getElementById('bsAccountsFoundText').textContent=MOCK_AA_ACCOUNTS.length+' accounts found via Account Aggregator';
  document.getElementById('bsSalaryHint').style.display='block';
  document.getElementById('bsAccountSelectBlock').style.display='block';
  renderBsAccountCards();
}

function renderBsAccountCards(){
  const container=document.getElementById('bsAccountCards');
  let html='';
  for(let i=0;i<MOCK_AA_ACCOUNTS.length;i++){
    const acc=MOCK_AA_ACCOUNTS[i];
    html+='<div class="card" style="display:flex;align-items:center;gap:12px;cursor:pointer;'+(bsSelectedAccount===i?'border-color:var(--teal-500);background:var(--teal-100);':'')+'" onclick="selectBsAccount('+i+')">';
    html+='<span style="font-size:22px;">'+acc.icon+'</span>';
    html+='<div style="flex:1;"><b style="font-size:14px;">'+acc.bank+'</b><p class="muted" style="font-size:12px;">****'+acc.last4+'</p></div>';
    html+='<span style="font-size:14px;color:var(--teal-700);font-weight:700;">'+(bsSelectedAccount===i?'Selected ✓':'Select')+'</span>';
    html+='</div>';
  }
  container.innerHTML=html;
  document.getElementById('bsContinueBtn').disabled=bsSelectedAccount<0;
}

function selectBsAccount(idx){
  bsSelectedAccount=idx;
  renderBsAccountCards();
}

function finishBankStatementStep(){
  if(bsSelectedAccount<0){toast('Please select your salary account');return;}
  const acc=MOCK_AA_ACCOUNTS[bsSelectedAccount];
  S.bsSelectedAccount=bsSelectedAccount;
  S.bankName=acc.bank;
  S.bankLast4=acc.last4;
  S.bankStatementDone=true;
  toast('Bank account linked!');
  openLoansHub();
}

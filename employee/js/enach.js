// Neev Employee App — E-NACH mandate. Auto-populates from AA, fields are readonly.
function onEnachCheckClick(cb){
  if(cb.checked){
    cb.checked=false;
    openEnachForm();
  } else {
    S.enachConfirmed=false;
    checkKfsSubmit();
  }
}
function openEnachForm(){
  // Auto-populate from Account Aggregator data
  const acc=typeof MOCK_AA_ACCOUNTS!=='undefined'&&bsSelectedAccount>=0?MOCK_AA_ACCOUNTS[bsSelectedAccount]:null;
  const banner=document.getElementById('enachExistingBanner');
  const bannerText=document.getElementById('enachExistingText');
  document.getElementById('enachName').value=S.name||'';
  document.getElementById('enachName').readOnly=true;
  if(acc){
    document.getElementById('enachAccNum').value='50100234567890';
    document.getElementById('enachAccNumConfirm').value='50100234567890';
    document.getElementById('enachIfsc').value='SBIN0001234';
    document.getElementById('enachBankName').value=acc.bank;
    banner.style.display='flex';
    bannerText.textContent='Auto-filled from '+acc.bank+' ****'+acc.last4+' (via Account Aggregator)';
  } else if(S.bankLast4){
    document.getElementById('enachAccNum').value='XXXX'+S.bankLast4;
    document.getElementById('enachAccNumConfirm').value='XXXX'+S.bankLast4;
    document.getElementById('enachIfsc').value='';
    document.getElementById('enachBankName').value=S.bankName||'';
    banner.style.display='flex';
    bannerText.textContent='Auto-filled from '+S.bankName+' ****'+S.bankLast4;
  } else {
    document.getElementById('enachAccNum').value='';
    document.getElementById('enachAccNumConfirm').value='';
    document.getElementById('enachIfsc').value='';
    document.getElementById('enachBankName').value='';
    banner.style.display='none';
  }
  // Make all bank fields readonly (auto-populated from AA)
  document.getElementById('enachAccNum').readOnly=true;
  document.getElementById('enachAccNumConfirm').readOnly=true;
  document.getElementById('enachIfsc').readOnly=true;
  document.getElementById('enachBankName').readOnly=true;
  document.getElementById('enachModal').classList.add('show');
}
function confirmEnachForm(){
  const name=document.getElementById('enachName').value.trim();
  const acc=document.getElementById('enachAccNum').value.trim();
  const accConfirm=document.getElementById('enachAccNumConfirm').value.trim();
  const ifsc=document.getElementById('enachIfsc').value.trim();
  const bankName=document.getElementById('enachBankName').value.trim();
  if(!name){toast('Enter the account holder name');return;}
  if(acc.length<8){toast('Enter a valid account number');return;}
  if(acc!==accConfirm){toast('Account numbers do not match');return;}
  if(ifsc.length<11){toast('Enter a valid IFSC code');return;}
  if(!bankName){toast('Enter your bank name');return;}
  S.enachConfirmed=true;
  S.bankLast4=acc.slice(-4);
  S.bankName=bankName;
  document.getElementById('profileBank').textContent=bankName+' ****'+S.bankLast4;
  document.getElementById('successBank').textContent=bankName+' ****'+S.bankLast4;
  document.getElementById('enachModal').classList.remove('show');
  document.getElementById('enachCheck').checked=true;
  toast('E-NACH confirmed — bank details saved');
  checkKfsSubmit();
}
function cancelEnachForm(){
  document.getElementById('enachModal').classList.remove('show');
  document.getElementById('enachCheck').checked=false;
}
function checkKfsSubmit(){
  checkKfsEsign();
}

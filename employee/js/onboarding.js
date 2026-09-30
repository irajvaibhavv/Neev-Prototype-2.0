// Neev Employee App — bank account setup (penny drop verification).
// Asked only when the user first moves money: requireBank(next) gates the action, then resumes it.
let pendingAfterBank=null;
function requireBank(next){
  if(S.bankLast4){next();return;}
  pendingAfterBank=next;
  toast('Add a bank account first — needed to send or receive money.');
  go('s-bank');
}
function checkPennyDrop(){
  document.getElementById('bankBtn').disabled=!document.getElementById('pennyDropCheck').checked;
}
function verifyBank(){
  const acc=document.getElementById('accInput').value.trim();
  const ifsc=document.getElementById('ifscInput').value.trim();
  if(acc.length<8){toast('Enter a valid account number');return;}
  if(ifsc.length<11){toast('Enter a valid IFSC code');return;}
  const btn=document.getElementById('bankBtn');btn.disabled=true;btn.textContent='Sending Re.1 to verify…';
  const box=document.getElementById('bankResult');box.style.display='block';
  box.innerHTML='<div class="card center-col" style="padding:16px;"><div style="font-size:20px;">💸</div><p class="muted" style="margin-top:6px;">Penny drop: sending Re.1 to account ending '+acc.slice(-4)+'…</p></div>';
  setTimeout(()=>{
    S.bankLast4=acc.slice(-4);S.bankName=ifsc.substring(0,4).toUpperCase();
    box.innerHTML='<div class="card center-col" style="padding:16px;border-color:var(--success);"><div style="font-size:28px;">✅</div><b style="margin-top:8px;">Bank verified!</b><p class="muted" style="font-size:13px;margin-top:4px;">'+S.bankName+' account ending '+S.bankLast4+'</p></div>';
    document.getElementById('profileBank').textContent=S.bankName+' ****'+S.bankLast4;
    document.getElementById('successBank').textContent=S.bankName+' ****'+S.bankLast4;
    addNotification('Bank account verified. You can now receive money from Neev.',true);
    const next=pendingAfterBank;pendingAfterBank=null;
    setTimeout(()=>{next?next():go('s-home');},800);
  },1500);
}

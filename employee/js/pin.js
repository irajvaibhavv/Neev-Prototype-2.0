// Neev Employee App — PIN setup + shared 4-box PIN row helpers.
// PIN can be set from profile nudge or settings, not forced during signup.
function readPinRow(rowId){
  return Array.from(document.querySelectorAll('#'+rowId+' .otpd')).map(i=>i.value).join('');
}
function clearPinRow(rowId){
  document.querySelectorAll('#'+rowId+' .otpd').forEach(i=>i.value='');
}
function savePin(){
  const pin=readPinRow('createPinRow');
  const confirmPin=readPinRow('confirmPinRow');
  if(pin.length<4){toast('Enter a 4-digit PIN');return;}
  if(pin!==confirmPin){
    toast('PINs do not match. Try again.');
    clearPinRow('createPinRow');clearPinRow('confirmPinRow');
    return;
  }
  S.pin=pin;
  updateProfileNudge();
  toast('PIN set! You can now log in with your PIN.');
  go('s-home');
}

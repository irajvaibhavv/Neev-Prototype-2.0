// Neev Employee App — Loan Consents: loan-relevant permissions, shown at loan time.
// AA consent is handled on the bank statement screen separately.
const PERMISSIONS=[
  { key:'cibil', icon:'📊', title:'Credit Score (CIBIL)', desc:'Better rates and higher advance limit.' },
  { key:'epfo', icon:'🏛️', title:'EPFO', desc:'Verify employment and provident fund.' },
  { key:'esic', icon:'🏥', title:'ESIC', desc:'Verify employment and insurance coverage.' }
];
const ALL_PERM_KEYS=['cibil','epfo','esic'];
function startPermissions(){
  renderPermissions();
  go('s-permissions');
}
function renderPermissions(){
  const granted=ALL_PERM_KEYS.filter(k=>S.permissions[k]).length;
  try{document.getElementById('permGrantedCount').textContent=granted;}catch(e){}
  try{document.getElementById('permTotalCount').textContent=ALL_PERM_KEYS.length;}catch(e){}
  try{document.getElementById('permCounterBar').style.width=(granted/ALL_PERM_KEYS.length*100)+'%';}catch(e){}
  PERMISSIONS.forEach(p=>{
    const el=document.getElementById('permToggle-'+p.key);
    if(el) el.classList.toggle('on',!!S.permissions[p.key]);
  });
  try{document.getElementById('permGrantAllBtn').textContent = granted===ALL_PERM_KEYS.length ? 'All allowed ✓' : 'Allow All';}catch(e){}
}
function togglePermission(key){
  S.permissions[key]=!S.permissions[key];
  renderPermissions();
}
function toggleAllPermissions(){
  const allOn=ALL_PERM_KEYS.every(k=>S.permissions[k]);
  PERMISSIONS.forEach(p=>S.permissions[p.key]=!allOn);
  renderPermissions();
}
function continueFromPermissions(){
  if(!ALL_PERM_KEYS.every(k=>S.permissions[k])){toast('Please allow all consents');return;}
  openBankStatementStep();
}

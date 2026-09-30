// Neev Employee App — persistent accounts: localStorage 'neev_employee_db' = { [mobile]: S }.
// Saved on every navigation (saveAppState → saveCurrentProfile). The manager portal reads this key.
const EMPLOYEE_DB_KEY='neev_employee_db';

function loadEmployeeDb(){
  try{ return JSON.parse(localStorage.getItem(EMPLOYEE_DB_KEY))||{}; }catch(e){ return {}; }
}
function saveCurrentProfile(){
  if(!S.mobile) return;
  try{
    const db=loadEmployeeDb();
    db[S.mobile]=S;
    localStorage.setItem(EMPLOYEE_DB_KEY,JSON.stringify(db));
  }catch(e){}
}
function loadProfileByMobile(mobile){
  return loadEmployeeDb()[mobile]||null;
}
function resetAllDemoData(){
  if(!confirm('This deletes every saved account on this device. Continue?')) return;
  localStorage.removeItem(EMPLOYEE_DB_KEY);
  sessionStorage.removeItem('neev_employee_state_v2');
  location.reload();
}

// Neev Employee App — persistent multi-employee accounts.
// Unlike the sessionStorage resume in core.js (which only survives a refresh in the same tab and
// forgets everything once the tab closes), this is a real "database": a JSON object in
// localStorage, keyed by mobile number, so 2-4 signed-up employees each keep their own data
// (profile, loans, points, notifications...) across app opens forever — no manual reset needed
// before every demo. saveAppState() in core.js calls saveCurrentProfile() on every navigation,
// so this stays in sync automatically as the session progresses.
const EMPLOYEE_DB_KEY='neev_employee_db';

function loadEmployeeDb(){
  try{ return JSON.parse(localStorage.getItem(EMPLOYEE_DB_KEY))||{}; }catch(e){ return {}; }
}
function saveCurrentProfile(){
  if(!S.mobile) return; // no identity yet (still on splash/signup) — nothing to key a record by
  try{
    const db=loadEmployeeDb();
    db[S.mobile]=S;
    localStorage.setItem(EMPLOYEE_DB_KEY,JSON.stringify(db));
  }catch(e){}
}
function loadProfileByMobile(mobile){
  return loadEmployeeDb()[mobile]||null;
}
// Visible in-app "clear everything" button (Signup screen) — doesn't rely on the user correctly
// typing a ?reset=1 query string onto a local file:// path, which isn't reliable in every browser/OS setup.
function resetAllDemoData(){
  if(!confirm('This deletes every saved account on this device. Continue?')) return;
  localStorage.removeItem(EMPLOYEE_DB_KEY);
  sessionStorage.removeItem('neev_employee_state_v2');
  location.reload();
}

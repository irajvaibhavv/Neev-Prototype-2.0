// Neev Employee App — global state + helpers used across every screen.
// Starts blank; signup/login fill it (see account.js).
const S = {
  voiceLang:'en', custId:0, name:'', mobile:'', company:null, ecn:'',
  salary:0, daysInMonth:30, currentDay:15, payDay:30,
  bankName:null, bankLast4:null,
  panNumber:null, panName:null,
  t2eSigned:false, selectedTenure:2,
  loans:[], notifications:[], policies:[], investments:[], bbpsHistory:[],
  loyaltyPoints:0, pointsHistory:[],
  permissions:{}
};

function fmt(n){return '₹'+Math.round(n).toLocaleString('en-IN');}

// Screens are reachable from several places, so back uses a history stack, not a fixed parent.
let screenHistory=[];
function go(id){
  const activeEl=document.querySelector('.screen.active');
  const currentId=activeEl?activeEl.id:null;
  if(currentId&&currentId!==id) screenHistory.push(currentId);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('appBody').scrollTop=0;
  saveAppState();
}
// fallback: used when there's no history (e.g. right after a refresh).
function goBack(fallback){
  go(screenHistory.pop()||fallback||'s-home');
  screenHistory.pop(); // go() just re-pushed the screen we left
}
function navTo(id){
  screenHistory=[];
  go(id);
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.getAttribute('data-target')===id));
}

// Refresh resumes the current screen (sessionStorage: a new tab starts clean).
// Only screens fully re-rendered from S are restorable; mid-flow screens fall back to a parent.
const RESTORABLE_SCREENS=['s-home','s-loans-hub','s-insurance','s-invest','s-bbps','s-ledger','s-history','s-profile','s-notifs','s-schemes','s-referral','s-loyalty','s-documents','s-grievance','s-login','s-signup','s-permissions','s-bank','s-setup-pin','s-employer-setup'];
function saveAppState(){
  try{
    const activeEl=document.querySelector('.screen.active');
    const bottomNavVisible=document.getElementById('bottomNav').style.display==='flex';
    sessionStorage.setItem('neev_employee_state_v2',JSON.stringify({S:S,activeScreen:activeEl?activeEl.id:'s-splash',bottomNavVisible:bottomNavVisible}));
  }catch(e){}
  saveCurrentProfile();
}
function restoreAppState(){
  try{
    const raw=sessionStorage.getItem('neev_employee_state_v2');
    if(!raw) return false;
    const saved=JSON.parse(raw);
    Object.assign(S,saved.S);
    if(saved.bottomNavVisible) document.getElementById('bottomNav').style.display='flex';
    applyProfileFields();
    renderLoansHub();renderLedger();renderNotifs();renderLangList();renderHistory();renderDocuments();renderGrievances();
    renderPolicies();renderInvestments();renderBbpsHistory();renderLoyalty();renderSakhi();renderPermissions();
    let target=saved.activeScreen;
    if(!RESTORABLE_SCREENS.includes(target)) target=saved.bottomNavVisible?'s-home':'s-splash';
    if(saved.bottomNavVisible) navTo(target); else go(target);
    return true;
  }catch(e){ return false; }
}
function applyProfileFields(){
  if(S.name){
    document.getElementById('homeName').textContent=S.name.split(' ')[0];
    document.getElementById('profileName').textContent=S.name;
    const initials=S.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    document.getElementById('profileInitials').textContent=initials;
    const av=document.getElementById('homeAvatar');
    if(av) av.textContent=initials;
  }
  const h=new Date().getHours();
  const greetEl=document.getElementById('homeGreeting');
  if(greetEl) greetEl.textContent=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  if(S.pan) document.getElementById('profilePan').textContent=S.pan.slice(0,1)+'XXXX'+S.pan.slice(5);
  if(S.aadhaar) document.getElementById('profileAadhaar').textContent='XXXX XXXX '+S.aadhaar.replace(/\s/g,'').slice(-4);
  if(S.company){
    document.getElementById('companyNameHome').textContent=S.company;
    document.getElementById('profileCompany').textContent=S.company;
    document.getElementById('profileEcn').textContent=S.ecn;
    document.getElementById('profileVan').textContent='NEEV00'+S.custId+'01';
  }
  if(S.bankLast4) document.getElementById('profileBank').textContent=S.bankName+' ****'+S.bankLast4;
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}
function showModal(){document.getElementById('supportModal').classList.add('show');}
function hideModal(){document.getElementById('supportModal').classList.remove('show');}
function openCustomerCareModal(){document.getElementById('customerCareModal').classList.add('show');}
function hideCustomerCareModal(){document.getElementById('customerCareModal').classList.remove('show');}
function showComingSoon(msg){document.getElementById('comingSoonText').textContent=msg||"This feature isn't available yet.";document.getElementById('comingSoonModal').classList.add('show');}
function hideComingSoonModal(){document.getElementById('comingSoonModal').classList.remove('show');}
function openScheme(url){toast('Opening official website…');window.open(url,'_blank');}
function otpMove(el){if(el.value&&el.nextElementSibling&&el.nextElementSibling.classList.contains('otpd'))el.nextElementSibling.focus();}

function tickClock(){const d=new Date();let h=d.getHours()%12;if(h===0)h=12;document.getElementById('clock').textContent=h+':'+d.getMinutes().toString().padStart(2,'0');}

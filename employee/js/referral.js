// Neev Employee App — refer a colleague (referral code copy/share).
function copyRef(){
  const code = document.getElementById('refCode').textContent;
  navigator.clipboard.writeText(code).catch(()=>{});
  toast('Referral code copied: '+code);
}
function shareRef(){
  const code = document.getElementById('refCode').textContent;
  const msg = 'I use Neev to get my salary early! Join with my code '+code+' and we both get ₹50 off our next advance. Download: neev.in/app';
  toast('Opening WhatsApp…');
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}
function shareLink(){
  const code = document.getElementById('refCode').textContent;
  toast('SMS link copied. Share: neev.in/ref/'+code);
}

// ===== NEEV SAKHI COMMUNITY (referral leaderboard / social proof) =====
const SAKHI_LEADERBOARD=[
  {name:'Sunita Devi', company:'QuickServe Logistics', referrals:14, points:350},
  {name:'Meena Devi', company:'BuildRight Constructions', referrals:9, points:225},
  {name:'Anil Singh', company:'SecureGuard Facilities', referrals:6, points:150}
];
function renderSakhi(){
  const note=document.getElementById('sakhiCompanyNote');
  if(note){
    note.textContent = S.company
      ? '12 colleagues from '+S.company+' have already joined Neev this month.'
      : 'Join 500+ workers already using Neev across companies.';
  }
  const list=document.getElementById('sakhiLeaderboard');
  if(!list) return;
  list.innerHTML='';
  SAKHI_LEADERBOARD.forEach((s,i)=>{
    list.innerHTML+=`<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);"><div style="width:26px;height:26px;border-radius:50%;background:var(--marigold-100);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:var(--marigold-600);flex-shrink:0;">${i+1}</div><div style="flex:1;"><b style="font-size:13px;">${s.name}</b><p class="muted" style="font-size:11px;">${s.company} · ${s.referrals} referrals</p></div><b style="font-size:13px;color:var(--teal-700);">${s.points} pts</b></div>`;
  });
}

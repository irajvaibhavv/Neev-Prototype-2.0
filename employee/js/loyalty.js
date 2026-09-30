// Neev Employee App — loyalty points: earned on every loan/insurance/investment/bill payment.
const LOYALTY_TIERS=[
  {name:'Bronze',min:0,color:'#8C6A4A',bg:'#F1E7DC'},
  {name:'Silver',min:100,color:'#5C6E68',bg:'#E9EEEC'},
  {name:'Gold',min:300,color:'#B8860B',bg:'var(--marigold-100)'},
  {name:'Platinum',min:600,color:'var(--teal-900)',bg:'var(--teal-100)'}
];
function currentTier(){
  let tier=LOYALTY_TIERS[0];
  LOYALTY_TIERS.forEach(t=>{ if(S.loyaltyPoints>=t.min) tier=t; });
  return tier;
}
function nextTier(){
  const idx=LOYALTY_TIERS.indexOf(currentTier());
  return LOYALTY_TIERS[idx+1]||null;
}
function addPoints(amount,reason){
  S.loyaltyPoints+=amount;
  S.pointsHistory.unshift({amount:amount,reason:reason,date:'Today'});
  toast('+'+amount+' loyalty points · '+reason);
  renderLoyalty();
}
function renderLoyalty(){
  const tier=currentTier();
  const next=nextTier();

  const homeAmt=document.getElementById('homePointsAmt');
  const homeTier=document.getElementById('homePointsTier');
  if(homeAmt) homeAmt.textContent=S.loyaltyPoints+' points';
  if(homeTier) homeTier.textContent=tier.name+' member';

  const total=document.getElementById('loyTotal');
  if(!total) return;
  total.textContent=S.loyaltyPoints;
  const badge=document.getElementById('loyTierBadge');
  badge.textContent=tier.name;
  badge.style.background=tier.bg;badge.style.color=tier.color;

  const progressWrap=document.getElementById('loyProgressWrap');
  if(next){
    const span=next.min-tier.min;
    const done=S.loyaltyPoints-tier.min;
    const pct=Math.min(100,Math.round((done/span)*100));
    document.getElementById('loyProgressFill').style.width=pct+'%';
    document.getElementById('loyProgressNote').textContent=(next.min-S.loyaltyPoints)+' more points to reach '+next.name;
    progressWrap.style.display='block';
  } else {
    progressWrap.style.display='none';
  }

  const list=document.getElementById('loyHistoryList');
  const empty=document.getElementById('loyHistoryEmpty');
  if(S.pointsHistory.length===0){ list.innerHTML=''; empty.style.display='flex'; return; }
  empty.style.display='none';
  list.innerHTML='';
  S.pointsHistory.forEach(p=>{
    list.innerHTML+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);"><div><b style="font-size:13px;">${p.reason}</b><p class="muted" style="font-size:11px;margin-top:2px;">${p.date}</p></div><b style="font-size:14px;color:var(--success);">+${p.amount}</b></div>`;
  });
}

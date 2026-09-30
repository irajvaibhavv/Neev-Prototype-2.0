// Neev Employee App — in-app notifications feed.
function addNotification(text,unread){S.notifications.unshift({text,unread,time:'Just now'});renderNotifs();}
function renderNotifs(){
  const list=document.getElementById('notifList');const empty=document.getElementById('notifEmpty');
  list.innerHTML='';
  if(S.notifications.length===0){empty.style.display='flex';document.getElementById('notifDot').style.display='none';return;}
  empty.style.display='none';
  document.getElementById('notifDot').style.display=S.notifications.some(n=>n.unread)?'block':'none';
  S.notifications.forEach(n=>{
    const div=document.createElement('div');div.className='notif-item'+(n.unread?' unread':'');
    div.innerHTML=`<div class="scheme-ic" style="width:36px;height:36px;font-size:16px;">${n.unread?'🔔':'✅'}</div><div style="flex:1;"><p style="font-size:14px;line-height:1.5;">${n.text}</p><p class="muted" style="font-size:12px;margin-top:4px;">${n.time}</p></div>`;
    div.onclick=()=>{n.unread=false;renderNotifs();};list.appendChild(div);
  });
}

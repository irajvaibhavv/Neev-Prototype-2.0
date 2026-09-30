// Neev Employee App — raise/track complaints.
const grievances = [];
function submitGrievance(){
  const type = document.getElementById('grievanceType').value;
  const desc = document.getElementById('grievanceDesc').value.trim();
  if(!type){ toast('Please select a complaint type'); return; }
  if(desc.length < 10){ toast('Please describe the issue in a few words'); return; }
  const ticket = 'NEV-GRV-'+Math.floor(10000+Math.random()*90000);
  grievances.unshift({ ticket, type, desc, date:'Today', status:'Under review' });
  document.getElementById('grievanceType').value='';
  document.getElementById('grievanceDesc').value='';
  document.getElementById('grievanceLan').value='';
  renderGrievances();
  addNotification('Complaint '+ticket+' raised. We will respond within 2 working days.', true);
  toast('Complaint submitted. Ticket: '+ticket);
}
function renderGrievances(){
  const el = document.getElementById('grievanceItems');
  if(grievances.length===0){ el.innerHTML='<p class="muted" style="font-size:13px;">No complaints raised yet.</p>'; return; }
  el.innerHTML = '';
  grievances.forEach(g=>{
    const labels = {wrong_deduction:'Wrong deduction',delayed_credit:'Delayed credit',wrong_charge:'Wrong charges',employer_issue:'Employer issue',kyc_issue:'KYC issue',other:'Other'};
    const div = document.createElement('div');
    div.style.cssText = 'padding:12px 0;border-bottom:1px solid var(--border);';
    div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;"><b style="font-size:13px;">${g.ticket}</b><span class="badge">${g.status}</span></div>
    <p class="muted" style="font-size:12px;margin-top:4px;">${labels[g.type]||g.type} · ${g.date}</p>
    <p style="font-size:13px;margin-top:4px;color:var(--ink);">${g.desc.slice(0,80)}${g.desc.length>80?'…':''}</p>`;
    el.appendChild(div);
  });
}

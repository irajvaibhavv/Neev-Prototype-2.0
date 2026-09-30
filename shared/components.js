// Neev prototype — shared dashboard behaviour.
// Used by company.html (employer portal) and admin.html (NBFC ops dashboard).
// Each screen is a `.screen` div with id `s-<name>`; sidebar items are `.sb-item[data-s=<name>]`.

function nav(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('s-'+id).classList.add('active');
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.toggle('active',i.getAttribute('data-s')===id));
  // if the newly active item lives inside a collapsible sidebar group (admin.html), expand that group
  // so the highlight is visible even when it was reached via a button elsewhere in the app, not the sidebar.
  const activeChild=document.querySelector('.sb-item.sb-child.active');
  if(activeChild){
    const group=activeChild.closest('.sb-children');
    if(group){
      group.style.display='block';
      const arrow=document.getElementById(group.id.replace('-children','-arrow'));
      if(arrow) arrow.classList.remove('collapsed');
    }
  }
  // company.html defines saveCompanyState() to survive a refresh; admin.html doesn't, so this is a no-op there.
  if(typeof saveCompanyState==='function') saveCompanyState();
}

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2400);
}

function fmt(n){ return '₹'+Math.round(n).toLocaleString('en-IN'); }

function toggleSidebar(){
  document.body.classList.toggle('sb-collapsed');
}

function printSaralReport(){
  document.body.classList.add('print-saral');
  setTimeout(function(){ window.print(); document.body.classList.remove('print-saral'); }, 100);
}

// Tab row: hides/shows the sibling panels that follow a .tab-row until the next .tab-row.
function showTab(btn,tabId){
  const parent=btn.parentElement;
  parent.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  let sibling=parent.nextElementSibling;
  while(sibling&&!sibling.classList.contains('tab-row')){
    if(sibling.id){sibling.style.display=sibling.id===tabId?'block':'none';}
    sibling=sibling.nextElementSibling;
  }
}

// Day-end/month-end checklist rows: clicking the row toggles its checkbox.
function toggleCheck(row){
  const cb=row.querySelector('input[type=checkbox]');
  cb.checked=!cb.checked;
}

// Expandable sidebar categories (admin.html) — a .sb-parent + its .sb-children sibling, keyed by id prefix.
function toggleSbGroup(key){
  const kids=document.getElementById(key+'-children');
  const arrow=document.getElementById(key+'-arrow');
  const collapsed=kids.style.display==='none';
  kids.style.display=collapsed?'block':'none';
  if(arrow) arrow.classList.toggle('collapsed',!collapsed);
}
function collapseAllSbGroups(){
  document.querySelectorAll('.sb-children').forEach(g=>g.style.display='none');
  document.querySelectorAll('.sb-arrow').forEach(a=>a.classList.add('collapsed'));
}

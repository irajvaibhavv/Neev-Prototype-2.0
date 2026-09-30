// Neev NBFC Dashboard — bootstrap: loan book chart (run once, at load). Command-center rendering lives in dashboard.js.
const months=['Mar','Apr','May','Jun','Jul','Aug'];
const vals=[4.2,6.8,8.1,11.5,14.2,18.4];
const max=Math.max(...vals);
const chart=document.getElementById('bookChart');
months.forEach((m,i)=>{
  const h=Math.round((vals[i]/max)*100);
  chart.innerHTML+=`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="font-size:11px;font-weight:600;color:var(--t9);">₹${vals[i]}L</div><div style="width:100%;height:${h}px;background:linear-gradient(180deg,var(--t5),var(--t7));border-radius:6px 6px 0 0;"></div><span style="font-size:11px;color:var(--mu);">${m}</span></div>`;
});

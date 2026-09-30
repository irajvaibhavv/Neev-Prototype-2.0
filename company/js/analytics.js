// Neev Employer Portal — analytics: monthly borrowing trend chart.
function renderAnalyticsChart(){
  const months = ['Mar','Apr','May','Jun','Jul','Aug'];
  const values = [12,18,15,22,28,24];
  const max = Math.max(...values);
  const chart = document.getElementById('analyticsChart');
  chart.innerHTML = '';
  months.forEach((m,i)=>{
    const h = Math.round((values[i]/max)*120);
    chart.innerHTML += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:100%;height:${h}px;background:linear-gradient(180deg,var(--t5),var(--t7));border-radius:6px 6px 0 0;"></div><span style="font-size:11px;color:var(--mu);">${m}</span></div>`;
  });
}

// Neev NBFC Dashboard — Command center v2: portfolio analytics (mirrors the reference NBFC
// dashboard template's section layout — portfolio mix, disbursement trend, DPD buckets,
// company-wise DPD with insight callouts, arrears, ranking, delinquency hotspots, alerts).
// Neev only has 3 client companies (not a branch network), so "branch-wise" sections in the
// reference are reframed here as "company-wise".

const DASH_COMPANIES = [
  { name:'QuickServe Logistics', short:'QuickServe', amount:980000, color:'#F5A623' },
  { name:'SecureGuard Facilities', short:'SecureGuard', amount:418000, color:'#2F80ED' },
  { name:'Other companies (pipeline)', short:'Other', amount:400000, color:'#C7D0CB' },
  { name:'BuildRight Constructions', short:'BuildRight', amount:42000, color:'#12695A' }
];
const DASH_TOTAL_AUM = DASH_COMPANIES.reduce((a,c)=>a+c.amount,0);

const DISBURSEMENT_TREND = [
  {m:'Mar',v:180000},{m:'Apr',v:240000},{m:'May',v:210000},
  {m:'Jun',v:340000},{m:'Jul',v:290000},{m:'Aug',v:360000}
];

const DPD_BUCKETS = [
  {label:'Regular',key:'0 DPD',count:138,amount:1817900,color:'var(--ok)'},
  {label:'SMA-0',key:'1-30 DPD',count:3,amount:10100,color:'#F5A623'},
  {label:'SMA-1',key:'31-60 DPD',count:0,amount:0,color:'#E8791E'},
  {label:'SMA-2',key:'61-90 DPD',count:0,amount:0,color:'#D94F3D'},
  {label:'NPA',key:'90+ DPD',count:1,amount:12000,color:'var(--err)'}
];

const DPD_BY_COMPANY = [
  { name:'BuildRight', total:8, regular:8, atRisk:0, npaAmt:0, outstanding:42000 },
  { name:'QuickServe', total:42, regular:39, atRisk:3, npaAmt:12000, outstanding:980000 },
  { name:'SecureGuard', total:22, regular:21, atRisk:1, npaAmt:0, outstanding:418000 }
];

const ARREARS = [
  { label:'Principal in arrears (shortfall carry-forward)', value: 8200+1500 },
  { label:'Interest on shortfall', value: 246+45 },
  { label:'Bounce / late charges pending', value: 1800 }
];

const DELINQUENCY_HOTSPOTS = [
  { name:'Firoz Khan', company:'QuickServe', amount:12000, days:94, bucket:'NPA' },
  { name:'Manoj Pal', company:'SecureGuard', amount:4200, days:8, bucket:'SMA-0' },
  { name:'Geeta Rani', company:'QuickServe', amount:2800, days:3, bucket:'SMA-0' },
  { name:'Sonu Kumar', company:'QuickServe', amount:3100, days:2, bucket:'SMA-0' }
];

const ACTIONABLE_ALERTS = [
  { icon:'🚨', text:'Device sharing detected — 3 QuickServe employees on the same device IMEI', action:'fraud', label:'Investigate' },
  { icon:'🔍', text:'4 KYC verifications pending review', action:'kyc', label:'Review' },
  { icon:'📅', text:'QuickServe payday tomorrow — pre-payday not confirmed', action:'repayment', label:'Follow up' }
];

function fmtL(n){ return n>=100000 ? '₹'+(n/100000).toFixed(1).replace(/\.0$/,'')+'L' : fmt(n); }

function runAiInsight(){
  const q = document.getElementById('aiInsightInput').value;
  if(!q){ toast('Type a question or pick a suggestion first'); return; }
  toast('Generating insight… (AI Insights is a preview feature)');
}
function fillAiChip(text){ document.getElementById('aiInsightInput').value = text; }

function toggleChartView(btn,chartId,tableId){
  const showChart = btn.getAttribute('data-mode')==='chart';
  document.getElementById(chartId).style.display = showChart ? 'block' : 'none';
  document.getElementById(tableId).style.display = showChart ? 'none' : 'block';
  btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function renderPortfolioDonut(){
  let angle=0; const stops=[];
  DASH_COMPANIES.forEach(c=>{
    const pct = c.amount/DASH_TOTAL_AUM*100;
    stops.push(`${c.color} ${angle}% ${angle+pct}%`);
    angle+=pct;
  });
  document.getElementById('portfolioDonut').style.background = `conic-gradient(${stops.join(',')})`;
  let legend='';
  DASH_COMPANIES.forEach(c=>{
    const pct = Math.round(c.amount/DASH_TOTAL_AUM*100);
    legend+=`<div class="legend-row"><span class="legend-dot" style="background:${c.color};"></span><span>${c.short}</span><span class="lv"><b>${fmt(c.amount)}</b><span>${pct}%</span></span></div>`;
  });
  document.getElementById('portfolioLegend').innerHTML = legend;
  let table='<table class="tbl"><thead><tr><th>Company</th><th>Outstanding</th><th>Share</th></tr></thead><tbody>';
  DASH_COMPANIES.forEach(c=>{ table+=`<tr><td>${c.short}</td><td>${fmt(c.amount)}</td><td>${Math.round(c.amount/DASH_TOTAL_AUM*100)}%</td></tr>`; });
  table+='</tbody></table>';
  document.getElementById('portfolioTable').innerHTML = table;
}

function renderDisbursementTrend(){
  const max = Math.max(...DISBURSEMENT_TREND.map(d=>d.v));
  let chart = '<div style="display:flex;align-items:flex-end;gap:10px;height:130px;">';
  DISBURSEMENT_TREND.forEach(d=>{
    const h = Math.round(d.v/max*105);
    chart += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="font-size:10.5px;font-weight:600;color:var(--t9);">${fmtL(d.v)}</div><div style="width:100%;height:${h}px;background:linear-gradient(180deg,#4E8CFF,#7C5CFC);border-radius:6px 6px 0 0;"></div><span style="font-size:11px;color:var(--mu);">${d.m}</span></div>`;
  });
  chart += '</div>';
  document.getElementById('trendChart').innerHTML = chart;
  let table = '<table class="tbl"><thead><tr><th>Month</th><th>Disbursed</th></tr></thead><tbody>';
  DISBURSEMENT_TREND.forEach(d=>{ table += `<tr><td>${d.m}</td><td>${fmt(d.v)}</td></tr>`; });
  table += '</tbody></table>';
  document.getElementById('trendTable').innerHTML = table;
}

function renderDpdBuckets(){
  const totalCount = DPD_BUCKETS.reduce((a,b)=>a+b.count,0);
  let bar=''; let legend=''; let rows='';
  DPD_BUCKETS.forEach(b=>{
    const w = totalCount ? (b.count/totalCount*100) : 0;
    bar += `<div style="width:${w}%;background:${b.color};" title="${b.label}: ${b.count}"></div>`;
    legend += `<span><i style="background:${b.color};"></i>${b.label}: ${b.count}</span>`;
    rows += `<div class="dpd-row"><span>${b.key} <span class="badge" style="background:${b.color};color:#fff;margin-left:6px;">${b.label}</span></span><span class="cnt">${b.count} loans</span><b>${fmt(b.amount)}</b></div>`;
  });
  document.getElementById('dpdBar').innerHTML = bar;
  document.getElementById('dpdLegend').innerHTML = legend;
  document.getElementById('dpdRows').innerHTML = rows;
}

function renderDpdByCompany(){
  let rows='';
  DPD_BY_COMPANY.forEach(c=>{
    const regPct = c.total ? c.regular/c.total*100 : 0;
    const riskPct = 100-regPct;
    const npaPct = Math.round(c.npaAmt/c.outstanding*100);
    const label = npaPct>=2 ? {t:'High risk',cl:'var(--err)'} : (c.atRisk>0 ? {t:'Watch',cl:'var(--m6)'} : {t:'Healthy',cl:'var(--ok)'});
    rows += `<div class="branch-dpd-row">
      <div class="branch-dpd-top"><span><b>${c.name}</b> <span class="badge" style="background:${label.cl};color:#fff;margin-left:6px;">${label.t}</span></span><span>${c.total} loans · <span class="npa-tag" style="color:${label.cl};">${npaPct}% NPA</span></span></div>
      <div class="dpd-bar"><div style="width:${regPct}%;background:var(--ok);" title="Regular: ${c.regular}"></div><div style="width:${riskPct}%;background:var(--err);" title="At risk: ${c.atRisk}"></div></div>
    </div>`;
  });
  document.getElementById('dpdCompanyRows').innerHTML = rows;

  let table='<table class="tbl"><thead><tr><th>Company</th><th>Total loans</th><th>At risk</th><th>NPA %</th></tr></thead><tbody>';
  DPD_BY_COMPANY.forEach(c=>{ const npaPct=Math.round(c.npaAmt/c.outstanding*100); table+=`<tr><td>${c.name}</td><td>${c.total}</td><td>${c.atRisk}</td><td>${npaPct}%</td></tr>`; });
  table+='</tbody></table>';
  document.getElementById('dpdCompanyTable').innerHTML = table;

  const totalAtRisk = DPD_BY_COMPANY.reduce((a,c)=>a+c.atRisk,0);
  const qs = DPD_BY_COMPANY.find(c=>c.name==='QuickServe');
  const qsShare = Math.round(qs.atRisk/totalAtRisk*100);
  document.getElementById('dpdInsight').innerHTML = `⚠️ <b>QuickServe</b> accounts for ${qsShare}% of all at-risk loans across the portfolio despite being only 53% of the outstanding book — a disproportionate concentration. <b>Recommendation:</b> tighten the fast-track approval threshold for QuickServe and prioritise their collections follow-up before increasing their credit limit further.`;
}

function renderArrears(){
  let rows=''; let total=0;
  ARREARS.forEach(a=>{ total+=a.value; rows+=`<div class="detail-row"><span>${a.label}</span><b>${fmt(a.value)}</b></div>`; });
  rows += `<div class="detail-row" style="border-top:2px solid var(--brd);padding-top:10px;"><span><b>Total arrears</b></span><b style="color:var(--err);">${fmt(total)}</b></div>`;
  document.getElementById('arrearsRows').innerHTML = rows;
}

function renderDisbursementAnalysis(){
  const monthLabels=['Mar','Apr','May','Jun','Jul','Aug'];
  const monthlySplit = [
    {bu:20000,sg:60000,qs:100000},
    {bu:22000,sg:78000,qs:140000},
    {bu:18000,sg:62000,qs:130000},
    {bu:28000,sg:92000,qs:220000},
    {bu:24000,sg:76000,qs:190000},
    {bu:30000,sg:100000,qs:230000}
  ];
  const max = Math.max(...monthlySplit.map(m=>m.bu+m.sg+m.qs));
  let chart='<div style="display:flex;align-items:flex-end;gap:8px;height:130px;">';
  monthLabels.forEach((mo,i)=>{
    const m = monthlySplit[i]; const tot=m.bu+m.sg+m.qs;
    const h = Math.round(tot/max*105);
    chart+=`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div style="width:100%;height:${h}px;border-radius:4px 4px 0 0;overflow:hidden;display:flex;flex-direction:column-reverse;">
        <div style="height:${Math.round(m.bu/tot*h)}px;background:#12695A;"></div>
        <div style="height:${Math.round(m.sg/tot*h)}px;background:#2F80ED;"></div>
        <div style="height:${Math.round(m.qs/tot*h)}px;background:#F5A623;"></div>
      </div>
      <span style="font-size:11px;color:var(--mu);">${mo}</span>
    </div>`;
  });
  chart+='</div><div style="display:flex;gap:14px;margin-top:10px;font-size:11px;color:var(--mu);"><span><i style="display:inline-block;width:9px;height:9px;background:#12695A;border-radius:2px;margin-right:5px;"></i>BuildRight</span><span><i style="display:inline-block;width:9px;height:9px;background:#2F80ED;border-radius:2px;margin-right:5px;"></i>SecureGuard</span><span><i style="display:inline-block;width:9px;height:9px;background:#F5A623;border-radius:2px;margin-right:5px;"></i>QuickServe</span></div>';
  document.getElementById('monthlyByCompanyChart').innerHTML = chart;

  let table='<table class="tbl"><thead><tr><th>Month</th><th>BuildRight</th><th>SecureGuard</th><th>QuickServe</th></tr></thead><tbody>';
  monthLabels.forEach((mo,i)=>{ const m=monthlySplit[i]; table+=`<tr><td>${mo}</td><td>${fmt(m.bu)}</td><td>${fmt(m.sg)}</td><td>${fmt(m.qs)}</td></tr>`; });
  table+='</tbody></table>';
  document.getElementById('monthlyByCompanyTable').innerHTML = table;

  const medals=['🥇','🥈','🥉','4'];
  const sorted = DASH_COMPANIES.slice().sort((a,b)=>b.amount-a.amount);
  let rank='';
  sorted.forEach((c,i)=>{
    const pct = Math.round(c.amount/DASH_TOTAL_AUM*100);
    rank+=`<div class="rank-row"><span class="rank-medal">${medals[i]}</span><div class="rank-bar-wrap"><div class="rank-bar-fill" style="width:${pct}%;background:${c.color};">${fmtL(c.amount)}</div></div><span class="rank-pct">${pct}%</span></div>`;
  });
  document.getElementById('companyRanking').innerHTML = rank;
  let rankTable='<table class="tbl"><thead><tr><th>#</th><th>Company</th><th>Amount</th><th>Share</th></tr></thead><tbody>';
  sorted.forEach((c,i)=>{ rankTable+=`<tr><td>${i+1}</td><td>${c.short}</td><td>${fmt(c.amount)}</td><td>${Math.round(c.amount/DASH_TOTAL_AUM*100)}%</td></tr>`; });
  rankTable+='</tbody></table>';
  document.getElementById('companyRankingTable').innerHTML = rankTable;

  document.getElementById('disbAnalysisInsight').innerHTML = `<b>QuickServe</b> leads disbursements at 53% (${fmtL(980000)}) of the portfolio. <b>BuildRight</b> is the smallest contributor at 2%. <b>Recommendation:</b> compare QuickServe's conversion quality and early delinquency against BuildRight's before scaling the fastest-growing company further.`;
}

function renderDelinquencyHotspots(){
  let rows='<table class="tbl"><thead><tr><th>Employee</th><th>Company</th><th>Amount</th><th>Days overdue</th><th>Bucket</th></tr></thead><tbody>';
  DELINQUENCY_HOTSPOTS.forEach(h=>{
    const cl = h.bucket==='NPA' ? 'badge-err' : 'badge-warn';
    rows+=`<tr><td><b>${h.name}</b></td><td>${h.company}</td><td>${fmt(h.amount)}</td><td style="font-weight:700;">${h.days}</td><td><span class="badge ${cl}">${h.bucket}</span></td></tr>`;
  });
  rows+='</tbody></table>';
  document.getElementById('hotspotsTable').innerHTML = rows;
}

function renderActionableAlerts(){
  document.getElementById('alertsCount').textContent = ACTIONABLE_ALERTS.length+' active';
  let html='';
  ACTIONABLE_ALERTS.forEach(a=>{
    html+=`<div class="alert-card"><span>${a.icon}</span><div style="flex:1;">${a.text}</div><button class="btn btn-outline btn-sm" onclick="nav('${a.action}')">${a.label}</button></div>`;
  });
  document.getElementById('actionableAlerts').innerHTML = html;
}

renderPortfolioDonut();
renderDisbursementTrend();
renderDpdBuckets();
renderDpdByCompany();
renderArrears();
renderDisbursementAnalysis();
renderDelinquencyHotspots();
renderActionableAlerts();

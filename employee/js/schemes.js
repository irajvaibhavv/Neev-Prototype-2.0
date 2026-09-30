// Neev Employee App — Government Schemes with state selector.
const AGENT_POOL=[
  { name:'Rajesh Kumar', phone:'98XXXXXX21' },
  { name:'Sunita Sharma', phone:'98XXXXXX47' },
  { name:'Vikram Singh', phone:'98XXXXXX63' }
];
let agentFormScheme=null;
const AGENT_FORM_MOCK={rationCard:'DL-01-023-004567',category:'general',familySize:4,familyIncome:'₹1,50,000'};

// Central schemes available in all states
const CENTRAL_SCHEMES=[
  {name:'Ayushman Bharat (PM-JAY)',icon:'🏥',desc:'Free health cover up to ₹5 lakh per family per year.',url:'https://pmjay.gov.in',tag:'Health'},
  {name:'PM Shram Yogi Maandhan',icon:'👷',desc:'Monthly pension of ₹3,000 after age 60 for unorganised workers.',url:'https://labour.gov.in/pmsym',tag:'Pension'},
  {name:'PM Awas Yojana',icon:'🏠',desc:'Subsidy towards owning your first home.',url:'https://pmay-urban.gov.in',tag:'Housing'},
];

// State-specific schemes
const STATE_SCHEMES={
  'Delhi':[
    {name:'Delhi Majdoor Sahayata',icon:'🔧',desc:'₹5,000 one-time aid for registered construction workers.',url:'https://labourcis.nic.in',tag:'Labour'},
    {name:'Ladli Yojana',icon:'👧',desc:'Financial assistance for girl child education.',url:'https://wcddel.in',tag:'Education'},
  ],
  'Bihar':[
    {name:'Mukhyamantri Kanya Utthan',icon:'👩‍🎓',desc:'Up to ₹50,000 for girl child from birth to graduation.',url:'https://ekalyan.bih.nic.in',tag:'Education'},
    {name:'Bihar Ration Card (EPDS)',icon:'🍚',desc:'Subsidised food grains for BPL families.',url:'https://epds.bihar.gov.in',tag:'Food'},
  ],
  'Uttar Pradesh':[
    {name:'Kanya Sumangala Yojana',icon:'👧',desc:'₹15,000 in stages for girl child welfare.',url:'https://mksy.up.gov.in',tag:'Welfare'},
    {name:'UP Shramik Majdoor Card',icon:'🪪',desc:'Labour card for construction workers — access to 17 schemes.',url:'https://upbocw.in',tag:'Labour'},
  ],
  'Maharashtra':[
    {name:'Mahatma Phule Jan Arogya',icon:'🏥',desc:'Free treatment up to ₹1.5 lakh for BPL families in empanelled hospitals.',url:'https://www.jeevandayee.gov.in',tag:'Health'},
    {name:'Gharkul Yojana',icon:'🏠',desc:'Housing for economically weaker sections in rural Maharashtra.',url:'https://mhada.gov.in',tag:'Housing'},
  ],
  'Rajasthan':[
    {name:'Chiranjeevi Yojana',icon:'🏥',desc:'Free health insurance up to ₹25 lakh per family per year.',url:'https://chiranjeevi.rajasthan.gov.in',tag:'Health'},
    {name:'Indira Rasoi Yojana',icon:'🍛',desc:'Meals at ₹8 for low-income workers across Rajasthan.',url:'https://indirarasoi.rajasthan.gov.in',tag:'Food'},
  ],
  'Madhya Pradesh':[
    {name:'Ladli Bahna Yojana',icon:'👩',desc:'₹1,250/month direct transfer to women aged 21–60.',url:'https://ladlibahna.mp.gov.in',tag:'Welfare'},
    {name:'Sambal Yojana',icon:'🔧',desc:'Accident insurance & education support for unorganised workers.',url:'https://sambal.mp.gov.in',tag:'Labour'},
  ],
  'Karnataka':[
    {name:'Gruha Lakshmi',icon:'👩',desc:'₹2,000/month to women head of household.',url:'https://sevasindhu.karnataka.gov.in',tag:'Welfare'},
    {name:'Anna Bhagya',icon:'🍚',desc:'10 kg free rice per person per month for BPL families.',url:'https://ahara.kar.nic.in',tag:'Food'},
  ],
  'Tamil Nadu':[
    {name:'Kalaignar Magalir Urimai Thogai',icon:'👩',desc:'₹1,000/month for women head of family.',url:'https://tnpds.gov.in',tag:'Welfare'},
    {name:'TN Construction Workers Welfare',icon:'🔧',desc:'Pension, marriage aid, maternity benefit for registered workers.',url:'https://tnlabour.gov.in',tag:'Labour'},
  ],
  'West Bengal':[
    {name:'Lakshmir Bhandar',icon:'👩',desc:'₹500–1,000/month for women aged 25–60.',url:'https://socialsecurity.wb.gov.in',tag:'Welfare'},
    {name:'Swasthya Sathi',icon:'🏥',desc:'₹5 lakh health cover per family — cashless at empanelled hospitals.',url:'https://swasthyasathi.gov.in',tag:'Health'},
  ],
  'Gujarat':[
    {name:'Mukhyamantri Amrutum (MA)',icon:'🏥',desc:'Free treatment for BPL families at empanelled hospitals.',url:'https://maguj.org',tag:'Health'},
    {name:'Manav Garima Yojana',icon:'🔧',desc:'Tool kits for self-employment in manual trades.',url:'https://sje.gujarat.gov.in',tag:'Labour'},
  ],
  'Jharkhand':[
    {name:'Mukhyamantri Sukanya Yojana',icon:'👧',desc:'₹40,000 on reaching 18 for girls enrolled since birth.',url:'https://jharsewa.jharkhand.gov.in',tag:'Education'},
    {name:'Universal PDS (Jharkhand)',icon:'🍚',desc:'1 kg dal + 5 kg rice free per person per month.',url:'https://aahar.jharkhand.gov.in',tag:'Food'},
  ],
  'Odisha':[
    {name:'KALIA Yojana',icon:'🌾',desc:'₹4,000/year for small and marginal farmers.',url:'https://kalia.odisha.gov.in',tag:'Agriculture'},
    {name:'Biju Swasthya Kalyan Yojana',icon:'🏥',desc:'₹5 lakh health cover for 96 lakh families.',url:'https://bsky.odisha.gov.in',tag:'Health'},
  ],
  'Punjab':[
    {name:'Sarbat Sehat Bima Yojana',icon:'🏥',desc:'₹5 lakh health cover per family — extends Ayushman Bharat.',url:'https://sha.punjab.gov.in',tag:'Health'},
    {name:'Atta Dal Scheme',icon:'🍚',desc:'Free wheat flour & dal for BPL families.',url:'https://punjab.gov.in',tag:'Food'},
  ],
  'Haryana':[
    {name:'Ayushman Bharat - Chirayu',icon:'🏥',desc:'₹5 lakh health cover — Haryana extension of PM-JAY.',url:'https://nha.gov.in',tag:'Health'},
    {name:'Mukhyamantri Parivar Samman Nidhi',icon:'🌾',desc:'₹6,000/year for farmer families with ≤5 acres.',url:'https://fasal.haryana.gov.in',tag:'Agriculture'},
  ],
};

function getStateFromAddress(){
  const addr=(S.currentAddress||S.address||'').toLowerCase();
  const states=Object.keys(STATE_SCHEMES);
  for(const st of states){
    if(addr.includes(st.toLowerCase())) return st;
  }
  return 'Delhi';
}

function initSchemes(){
  const sel=document.getElementById('schemeStateSelect');
  const userState=getStateFromAddress();
  sel.value=userState;
  renderSchemes(userState);
  updateSchemeHint(userState);
}

function onSchemeStateChange(){
  const state=document.getElementById('schemeStateSelect').value;
  renderSchemes(state);
  updateSchemeHint(state);
}

function updateSchemeHint(state){
  const hint=document.getElementById('schemeStateHint');
  const userState=getStateFromAddress();
  if(state===userState){
    hint.textContent='Based on your Aadhaar address';
  } else {
    hint.textContent='You changed from '+userState;
  }
}

function renderSchemes(state){
  const container=document.getElementById('schemesList');
  const stateList=STATE_SCHEMES[state]||[];
  const all=[...CENTRAL_SCHEMES.map(s=>({...s,scope:'Central'})),...stateList.map(s=>({...s,scope:state}))];

  document.getElementById('schemeCountText').textContent=CENTRAL_SCHEMES.length+' central + '+stateList.length+' '+state+' scheme'+(stateList.length!==1?'s':'')+' available';

  let html='';
  all.forEach(s=>{
    html+=`<div class="card" style="display:flex;gap:12px;align-items:flex-start;">
      <div class="scheme-ic">${s.icon}</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <b style="font-size:14px;">${s.name}</b>
          <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:${s.scope==='Central'?'var(--marigold-100);color:var(--marigold-600)':'var(--teal-100);color:var(--teal-700)'};">${s.scope==='Central'?'Central':s.scope}</span>
        </div>
        <p class="muted" style="font-size:13px;margin:4px 0 10px;">${s.desc}</p>
        <div style="display:flex;gap:8px;">
          <div style="flex:1;text-align:center;">
            <button class="btn btn-outline btn-sm" style="width:100%;" onclick="openScheme('${s.url}')">Apply Yourself</button>
            <p class="muted" style="font-size:11px;margin-top:4px;">Free of cost</p>
          </div>
          <div style="flex:1;text-align:center;">
            <button class="btn btn-primary btn-sm" style="width:100%;" onclick="openAgentForm('${s.name}')">Apply with Agent</button>
            <p class="muted" style="font-size:11px;margin-top:4px;">₹49</p>
          </div>
        </div>
      </div>
    </div>`;
  });
  container.innerHTML=html;
}

function openAgentForm(schemeName){
  agentFormScheme=schemeName;
  document.getElementById('agentFormScheme').textContent='For: '+schemeName;
  document.getElementById('agentName').value=S.name||'Ramesh Kumar';
  document.getElementById('agentMobile').value=S.mobile||'9876543210';
  document.getElementById('agentAadhaar').value=S.aadhaar||'1234 5678 9012';
  document.getElementById('agentRationCard').value=AGENT_FORM_MOCK.rationCard;
  document.getElementById('agentCategory').value=AGENT_FORM_MOCK.category;
  document.getElementById('agentFamilySize').value=AGENT_FORM_MOCK.familySize;
  document.getElementById('agentFamilyIncome').value=AGENT_FORM_MOCK.familyIncome;
  document.getElementById('agentAddress').value=S.currentAddress||S.address||'H.No. 214, Ward No. 6, Najafgarh, South West Delhi, Delhi, 110043';
  document.getElementById('agentTime').value='morning';
  document.getElementById('agentFormBlock').style.display='block';
  document.getElementById('agentAssigningBlock').style.display='none';
  document.getElementById('agentAssignedBlock').style.display='none';
  document.getElementById('agentModal').classList.add('show');
}
function closeAgentForm(){
  document.getElementById('agentModal').classList.remove('show');
}
function openPaymentLink(){
  toast('💳 Online payments coming soon! For now, just submit your request below.');
}
function submitAgentForm(){
  const name=document.getElementById('agentName').value.trim();
  const mobile=document.getElementById('agentMobile').value.trim();
  const aadhaar=document.getElementById('agentAadhaar').value.trim();
  const address=document.getElementById('agentAddress').value.trim();
  if(!name){toast('Enter your full name');return;}
  if(mobile.length<10){toast('Enter a valid 10-digit mobile number');return;}
  if(aadhaar.replace(/\s/g,'').length<12){toast('Enter a valid Aadhaar number');return;}
  if(!address){toast('Enter an address for the agent to reach you');return;}
  document.getElementById('agentFormBlock').style.display='none';
  document.getElementById('agentAssigningBlock').style.display='block';
  setTimeout(()=>{
    const agent=AGENT_POOL[Math.floor(Math.random()*AGENT_POOL.length)];
    document.getElementById('agentAssigningBlock').style.display='none';
    document.getElementById('agentAssignedText').textContent='Registration done for '+agentFormScheme+'. '+agent.name+' ('+agent.phone+') will contact you during your preferred time slot.';
    document.getElementById('agentAssignedBlock').style.display='block';
    addNotification('Agent '+agent.name+' assigned to help with your '+agentFormScheme+' application.', true);
  },1400);
}

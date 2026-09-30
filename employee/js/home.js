// Neev Employee App — Home screen + Loans hub.

// ===== BANNER CAROUSEL =====
let bannerIdx=0, bannerTimer=null, bannerSlides=[], bannerTouchX=0, bannerSwiping=false;

function initBannerCarousel(){
  const track=document.getElementById('bannerTrack');
  const dotsWrap=document.getElementById('bannerDots');
  if(!track||!dotsWrap) return;

  updateProfileSlide();

  bannerSlides=Array.from(track.querySelectorAll('.banner-slide')).filter(s=>s.style.display!=='none');
  bannerIdx=0;

  dotsWrap.innerHTML='';
  bannerSlides.forEach((_,i)=>{
    const dot=document.createElement('div');
    dot.className='banner-dot'+(i===0?' active':'');
    dot.onclick=()=>goToSlide(i);
    dotsWrap.appendChild(dot);
  });

  updateBannerPos(false);
  startBannerTimer();

  track.addEventListener('touchstart',onBannerTouchStart,{passive:true});
  track.addEventListener('touchmove',onBannerTouchMove,{passive:false});
  track.addEventListener('touchend',onBannerTouchEnd,{passive:true});
  track.addEventListener('mousedown',onBannerMouseDown);
}

function updateProfileSlide(){
  const slide=document.getElementById('bannerProfile');
  if(!slide) return;
  const steps=[
    {done:!!S.mobile, label:'Phone verified'},
    {done:!!S.aadhaar, label:'Aadhaar verified'},
    {done:!!S.company, label:'Employer linked'},
    {done:!!S.pin, label:'PIN set'},
  ];
  const done=steps.filter(s=>s.done).length;
  const pct=Math.round(done/steps.length*100);

  if(done>=steps.length){
    slide.style.display='none';
    return;
  }
  slide.style.display='';
  document.getElementById('profileNudgePct').textContent=pct;
  document.getElementById('profileNudgeBar').style.width=pct+'%';

  const textEl=document.getElementById('profileNudgeText');
  const ctaEl=slide.querySelector('.banner-cta');
  if(!S.company){
    textEl.textContent='Verify employment details to unlock salary advances';
    if(ctaEl) ctaEl.setAttribute('onclick',"startEmployerSetup()");
  } else if(!S.aadhaar){
    textEl.textContent='Complete KYC with DigiLocker to unlock salary advances';
    if(ctaEl) ctaEl.setAttribute('onclick',"openLoansEntry()");
  } else if(!S.pin){
    textEl.textContent='Set a PIN to secure your account';
    if(ctaEl) ctaEl.setAttribute('onclick',"go('s-setup-pin')");
  }
}

function goToSlide(i){
  bannerIdx=i;
  updateBannerPos(true);
  updateBannerDots();
  resetBannerTimer();
}

function nextSlide(){
  bannerSlides=Array.from(document.getElementById('bannerTrack').querySelectorAll('.banner-slide')).filter(s=>s.style.display!=='none');
  if(bannerSlides.length<=1) return;
  bannerIdx=(bannerIdx+1)%bannerSlides.length;
  updateBannerPos(true);
  updateBannerDots();
}

function updateBannerPos(animate){
  const track=document.getElementById('bannerTrack');
  if(!track) return;
  track.style.transition=animate?'transform .4s cubic-bezier(.22,1,.36,1)':'none';
  track.style.transform='translateX(-'+(bannerIdx*100)+'%)';
}

function updateBannerDots(){
  const dots=document.querySelectorAll('#bannerDots .banner-dot');
  dots.forEach((d,i)=>d.className='banner-dot'+(i===bannerIdx?' active':''));
}

function startBannerTimer(){
  stopBannerTimer();
  bannerTimer=setInterval(nextSlide,2000);
}
function stopBannerTimer(){ if(bannerTimer){clearInterval(bannerTimer);bannerTimer=null;} }
function resetBannerTimer(){ stopBannerTimer(); startBannerTimer(); }

function onBannerTouchStart(e){
  bannerTouchX=e.touches[0].clientX;
  bannerSwiping=true;
  stopBannerTimer();
}
function onBannerTouchMove(e){
  if(!bannerSwiping) return;
  const dx=e.touches[0].clientX-bannerTouchX;
  if(Math.abs(dx)>10) e.preventDefault();
}
function onBannerTouchEnd(e){
  if(!bannerSwiping) return;
  bannerSwiping=false;
  const dx=e.changedTouches[0].clientX-bannerTouchX;
  if(dx<-40 && bannerIdx<bannerSlides.length-1) goToSlide(bannerIdx+1);
  else if(dx>40 && bannerIdx>0) goToSlide(bannerIdx-1);
  else startBannerTimer();
}

function onBannerMouseDown(e){
  bannerTouchX=e.clientX;
  bannerSwiping=true;
  stopBannerTimer();
  const onUp=(ev)=>{
    bannerSwiping=false;
    document.removeEventListener('mouseup',onUp);
    const dx=ev.clientX-bannerTouchX;
    if(dx<-40 && bannerIdx<bannerSlides.length-1) goToSlide(bannerIdx+1);
    else if(dx>40 && bannerIdx>0) goToSlide(bannerIdx-1);
    else startBannerTimer();
  };
  document.addEventListener('mouseup',onUp);
}

// Legacy compat
function updateProfileNudge(){ updateProfileSlide(); initBannerCarousel(); }

// ===== LOANS HUB =====
function accrued(){return S.salary*S.currentDay/S.daysInMonth;}
function outstanding(){return S.loans.filter(l=>l.status==='Active').reduce((a,l)=>a+l.amount,0);}
function eligible(){return Math.max(0,Math.floor((accrued()*0.7 - outstanding())/1000)*1000);}

function openLoansHub(){renderLoansHub();go('s-loans-hub');}

function renderLoansHub(){
  const prompt=document.getElementById('loansVerifyPrompt');
  const dashboard=document.getElementById('loansDashboard');
  prompt.style.display='none';
  dashboard.style.display='block';

  document.getElementById('loansProfileName').textContent=S.name||'—';
  document.getElementById('loansProfileDesig').textContent=S.designation||'—';
  document.getElementById('loansProfileInitials').textContent=S.name?S.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2):'—';
  document.getElementById('loansProfileDate').textContent=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});

  document.getElementById('companyNameHome').textContent=S.company||'—';
  document.getElementById('meterSalary').textContent='Salary: '+fmt(S.salary)+'/mo';
  const elig=eligible();
  document.getElementById('eligibleAmt').textContent=fmt(elig);

  // Set up interactive slider + manual entry for withdrawal amount
  const slider=document.getElementById('loansWithdrawSlider');
  const manualInput=document.getElementById('loansWithdrawInput');
  if(slider){
    slider.max=Math.max(1000,elig);
    slider.min=1000;
    slider.step=1000;
    slider.value=Math.min(elig,5000);
    slider.oninput=function(){
      if(manualInput) manualInput.value=this.value;
      updateLoansWithdrawDisplay();
    };
  }
  if(manualInput){
    manualInput.value=slider?slider.value:Math.min(elig,5000);
    manualInput.oninput=function(){
      var val=parseInt(this.value)||0;
      if(val>elig) val=elig;
      if(slider) slider.value=val;
      updateLoansWithdrawDisplay();
    };
  }
  updateLoansWithdrawDisplay();

  const activeLoan=S.loans.find(l=>l.status==='Active');
  if(activeLoan){
    document.getElementById('homeActiveLoan').style.display='block';
    document.getElementById('homeRepayAmt').textContent=fmt(activeLoan.amount);
    document.getElementById('homeRepayDate').textContent=activeLoan.dueDate;
    // Show remaining amount after active loan
    var remaining=elig;
    var remainEl=document.getElementById('loansRemainingAmt');
    if(remainEl) remainEl.textContent=fmt(remaining);
    var remainCard=document.getElementById('loansRemainingCard');
    if(remainCard) remainCard.style.display=remaining>0?'block':'none';
  } else {
    document.getElementById('homeActiveLoan').style.display='none';
    var remainCard2=document.getElementById('loansRemainingCard');
    if(remainCard2) remainCard2.style.display='none';
  }
  if(elig<=0){document.getElementById('homeEligibleCard').style.display='none';document.getElementById('homeNotEligible').style.display='block';}
  else{document.getElementById('homeEligibleCard').style.display='block';document.getElementById('homeNotEligible').style.display='none';}

  const qr=document.getElementById('quickRepeatCard');
  if(qr){
    if(S.t2eSigned && elig>0){
      const lastAmt=S.loans.length>0?S.loans[0].amount:5000;
      const repeatAmt=Math.min(lastAmt,elig);
      document.getElementById('quickRepeatBtn').textContent='Get '+fmt(repeatAmt)+' again';
      qr.style.display='block';
    } else {
      qr.style.display='none';
    }
  }

  const totalDeduction=outstanding();
  const takehome=S.salary-totalDeduction;
  document.getElementById('loansPaydayLine').textContent = 'Next pay day: '+S.payDay+'th Aug'
    + (totalDeduction>0 ? ' · Take-home after deduction: '+fmt(takehome) : '');

  renderHistory();
}

function updateLoansWithdrawDisplay(){
  var slider=document.getElementById('loansWithdrawSlider');
  var display=document.getElementById('loansWithdrawAmt');
  if(display && slider) display.textContent=fmt(parseInt(slider.value));
}

function getAdvanceFromHub(){
  var slider=document.getElementById('loansWithdrawSlider');
  var amt=slider?parseInt(slider.value):5000;
  document.getElementById('applySlider').value=amt;
  openApplyEntry();
}

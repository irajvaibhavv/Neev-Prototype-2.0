// Neev Employee App — voice narration (TTS) + language picker (Hindi / English / Voice) + text translation.
const LANGS=[
  {code:'hi',name:'Hindi',native:'हिंदी',flag:'🇮🇳'},
  {code:'en',name:'English',native:'English',flag:'🇬🇧'},
  {code:'voice',name:'Voice',native:'Voice',flag:'🔊'}
];
const LOCALE={en:'en-IN',hi:'hi-IN',bn:'bn-IN',ta:'ta-IN',te:'te-IN',kn:'kn-IN',ml:'ml-IN',mr:'mr-IN',gu:'gu-IN',pa:'pa-IN',as:'as-IN',doi:'hi-IN',
  brx:'hi-IN',ks:'ur-IN',kok:'mr-IN',mai:'hi-IN',mni:'bn-IN',ne:'ne-IN',or:'or-IN',sa:'hi-IN',sat:'hi-IN',sd:'ur-IN',ur:'ur-IN'};

let activeSpeakBtn=null;
function resetSpeakBtn(){if(activeSpeakBtn){activeSpeakBtn.textContent='🔊';activeSpeakBtn=null;}}
function speak(text){
  if(!('speechSynthesis' in window))return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang=LOCALE[S.voiceLang]||'en-IN';
  u.onend=resetSpeakBtn;u.onerror=resetSpeakBtn;
  window.speechSynthesis.speak(u);
}
// Tap the speaker icon to start reading the screen aloud; tap the same icon again to stop mid-sentence.
function speakScreen(id){
  const btn=(typeof event!=='undefined'&&event)?event.currentTarget:null;
  if(window.speechSynthesis.speaking){
    const tappedActiveBtn=btn&&activeSpeakBtn===btn;
    window.speechSynthesis.cancel();
    resetSpeakBtn();
    if(tappedActiveBtn)return; // same icon tapped mid-speech -> just stop
  }
  speak(document.getElementById(id).innerText.split('\n').filter(Boolean).slice(0,8).join('. '));
  if(btn){btn.textContent='⏹️';activeSpeakBtn=btn;}
}

function openLangModal(){document.getElementById('langModal').classList.add('show');document.getElementById('langSearch').value='';renderLangList();}
function renderLangList(){
  const term=document.getElementById('langSearch').value.toLowerCase();
  const list=document.getElementById('langList');list.innerHTML='';
  LANGS.filter(l=>l.name.toLowerCase().includes(term)||l.native.toLowerCase().includes(term)).forEach(l=>{
    const sel=l.code===S.voiceLang;
    const d=document.createElement('div');
    d.className='company-item';
    d.style.justifyContent='space-between';
    d.style.border=sel?'1.5px solid var(--teal-700)':'1.6px solid var(--border)';
    d.style.background=sel?'var(--teal-100)':'#fff';
    d.innerHTML=`<div style="display:flex;align-items:center;gap:12px;"><div style="width:40px;height:28px;border-radius:6px;background:#fff;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${l.flag}</div><div><b style="font-size:14px;color:${sel?'var(--teal-900)':'var(--ink)'};">${l.native}</b><p class="muted" style="font-size:12px;">${l.name}</p></div></div>${sel?'<span style="width:24px;height:24px;border-radius:50%;background:var(--teal-700);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">✓</span>':''}`;
    d.onclick=()=>selectLanguage(l.code);list.appendChild(d);
  });
}

// ===== TRANSLATION DICTIONARIES =====
const T={
  hi:{
    'Log in':'लॉग इन करें','Enter your mobile number or use face/fingerprint.':'अपना मोबाइल नंबर डालें या फेस/फिंगरप्रिंट से लॉगिन करें।',
    'Log in with Face':'फेस से लॉग इन करें','Log in with Fingerprint':'फिंगरप्रिंट से लॉग इन करें','or use OTP':'या OTP से',
    'Mobile number':'मोबाइल नंबर','Send OTP':'OTP भेजें','Enter 4-digit OTP':'4 अंकों का OTP डालें','Verify & continue':'सत्यापित करें',
    'Your profile':'आपकी प्रोफ़ाइल','Fill in your details. No paperwork, we verify everything digitally.':'अपनी जानकारी भरें। कोई कागज़ात नहीं, सब डिजिटल।',
    'Full name (as on PAN)':'पूरा नाम (PAN पर जैसा है)','Gender':'लिंग','PAN number':'पैन नंबर','Aadhaar number':'आधार नंबर',
    'Communication address':'संपर्क पता','Permanent address (from Aadhaar)':'स्थायी पता (आधार से)','Verify & continue':'सत्यापित करें',
    'Your employer':'आपकी कंपनी','Select the company you work for and enter your Employee Code Number (ECN).':'वह कंपनी चुनें जहाँ आप काम करते हैं।',
    'My company is not listed':'मेरी कंपनी सूची में नहीं है','Request your company':'अपनी कंपनी जोड़ें',
    'Verify employment':'नौकरी सत्यापित करें','ECN (Employee Code Number)':'कर्मचारी कोड नंबर (ECN)','Verify with employer':'नियोक्ता से सत्यापित करें',
    'Bank account':'बैंक खाता','This is where we send your money. We verify by sending Re.1 to your account.':'यहाँ हम आपका पैसा भेजेंगे। हम Re.1 भेजकर सत्यापित करते हैं।',
    'Account number':'खाता नंबर','IFSC code':'IFSC कोड','Verify account (penny drop)':'खाता सत्यापित करें',
    'Hi,':'नमस्ते,','Salary earned so far':'अब तक कमाई गई सैलरी','Day':'दिन',
    'You can withdraw up to (70% of earned)':'आप इतना निकाल सकते हैं (कमाई का 70%)','Get advance':'एडवांस लें',
    'No advance available right now':'अभी कोई एडवांस उपलब्ध नहीं है',
    'Next repayment':'अगला भुगतान','Auto-deducted from your salary. No action needed.':'सैलरी से अपने-आप कटेगा।',
    'Government schemes for you':'आपके लिए सरकारी योजनाएं','3 schemes you may qualify for':'3 योजनाएं जो आप पर लागू हो सकती हैं',
    'Get advance':'एडवांस लें',
    'Advance amount':'एडवांस राशि','You will receive':'आपको मिलेगा',
    'Repaid from your salary on pay day. No separate payment.':'सैलरी से अपने-आप कटेगा। अलग से भुगतान नहीं करना है।',
    'Continue':'आगे बढ़ें','Loan agreement':'ऋण समझौता',
    'Type your full name to e-sign':'ई-हस्ताक्षर के लिए अपना पूरा नाम लिखें',
    'I agree to the loan terms, E-NACH mandate, and repayment plan.':'मैं शर्तों, E-NACH और भुगतान योजना से सहमत हूँ।',
    'E-sign & get money':'ई-हस्ताक्षर करें और पैसा पाएं','Confirm advance':'एडवांस की पुष्टि','Get money now':'अभी पैसा पाएं',
    'Money is on its way!':'पैसा भेजा जा रहा है!','View my ledger':'मेरा बहीखाता देखें','Back to home':'होम पर वापस जाएं',
    'My loans':'मेरे लोन','No advances taken yet. Once you apply, it shows here.':'अभी तक कोई एडवांस नहीं लिया। आवेदन करने पर यहाँ दिखेगा।',
    'Loan details':'लोन विवरण','Repayment timeline':'भुगतान समयरेखा','Repay early':'जल्दी भुगतान करें',
    'Notifications':'सूचनाएं','No notifications yet.':'अभी कोई सूचना नहीं।',
    'Government schemes':'सरकारी योजनाएं','Based on your location (Delhi), these may apply to you.':'आपके स्थान (दिल्ली) के अनुसार, ये योजनाएं लागू हो सकती हैं।',
    'Open official website →':'सरकारी वेबसाइट खोलें →',
    'Profile':'प्रोफ़ाइल','Log out':'लॉग आउट','To update PAN, Aadhaar or ECN, call support.':'PAN, आधार या ECN बदलने के लिए सपोर्ट को कॉल करें।',
    'Home':'होम','Ledger':'बहीखाता','Schemes':'योजनाएं',
    'Get your earned salary early. No waiting till month end.':'कमाई हुई सैलरी जल्दी पाएं। महीने के अंत तक इंतज़ार नहीं।',
    'Tap to change voice & language':'आवाज़ और भाषा बदलने के लिए टैप करें',
    'Calling Neev Support':'नीव सपोर्ट को कॉल कर रहे हैं','Available 8 AM to 8 PM':'सुबह 8 से रात 8 बजे तक उपलब्ध','Close':'बंद करें',
    'Service charge':'सेवा शुल्क','GST (18%)':'GST (18%)','Processing fee':'प्रोसेसिंग शुल्क',
    'Advance sent':'एडवांस भेजा गया',
    'Male':'पुरुष','Female':'महिला','Other':'अन्य',
    'Customer ID':'ग्राहक आईडी','Bank':'बैंक','Address':'पता','Repay on':'भुगतान तिथि'
  },
  bn:{
    'Log in':'লগ ইন করুন','Enter your mobile number or use face/fingerprint.':'আপনার মোবাইল নম্বর দিন বা ফেস/ফিঙ্গারপ্রিন্ট ব্যবহার করুন।',
    'Log in with Face':'ফেস দিয়ে লগ ইন','Log in with Fingerprint':'ফিঙ্গারপ্রিন্ট দিয়ে লগ ইন','or use OTP':'বা OTP ব্যবহার করুন',
    'Mobile number':'মোবাইল নম্বর','Send OTP':'OTP পাঠান','Enter 4-digit OTP':'৪ সংখ্যার OTP দিন','Verify & continue':'যাচাই করুন',
    'Your profile':'আপনার প্রোফাইল','Fill in your details. No paperwork, we verify everything digitally.':'আপনার তথ্য দিন। কোনো কাগজপত্র নেই, সব ডিজিটাল।',
    'Full name (as on PAN)':'পুরো নাম (PAN অনুযায়ী)','Gender':'লিঙ্গ','PAN number':'PAN নম্বর','Aadhaar number':'আধার নম্বর',
    'Communication address':'যোগাযোগের ঠিকানা','Permanent address (from Aadhaar)':'স্থায়ী ঠিকানা (আধার থেকে)',
    'Your employer':'আপনার কোম্পানি','Select the company you work for and enter your Employee Code Number (ECN).':'আপনি যেখানে কাজ করেন সেই কোম্পানি বেছে নিন।',
    'My company is not listed':'আমার কোম্পানি তালিকায় নেই','Verify employment':'কর্মসংস্থান যাচাই',
    'Verify with employer':'নিয়োগকর্তার সাথে যাচাই','Bank account':'ব্যাংক অ্যাকাউন্ট',
    'Hi,':'নমস্কার,','Salary earned so far':'এখন পর্যন্ত অর্জিত বেতন','Day':'দিন',
    'You can withdraw up to (70% of earned)':'আপনি তুলতে পারেন (অর্জিতের ৭০%)','Get advance':'অগ্রিম নিন',
    'Government schemes for you':'আপনার জন্য সরকারি প্রকল্প','3 schemes you may qualify for':'৩টি প্রকল্প প্রযোজ্য হতে পারে',
    'Advance amount':'অগ্রিম পরিমাণ','You will receive':'আপনি পাবেন','Continue':'চালিয়ে যান',
    'Money is on its way!':'টাকা পাঠানো হচ্ছে!','View my ledger':'আমার লেজার দেখুন','Back to home':'হোমে ফিরে যান',
    'My loans':'আমার ঋণ','Loan details':'ঋণের বিবরণ','Repay early':'তাড়াতাড়ি পরিশোধ করুন',
    'Notifications':'বিজ্ঞপ্তি','Government schemes':'সরকারি প্রকল্প','Open official website →':'সরকারি ওয়েবসাইট খুলুন →',
    'Profile':'প্রোফাইল','Log out':'লগ আউট','Home':'হোম','Ledger':'লেজার','Schemes':'প্রকল্প',
    'Get your earned salary early. No waiting till month end.':'অর্জিত বেতন তাড়াতাড়ি পান। মাস শেষ পর্যন্ত অপেক্ষা নেই।',
    'E-sign & get money':'ই-স্বাক্ষর করুন এবং টাকা পান','Get money now':'এখনই টাকা পান',
    'Close':'বন্ধ করুন','Repayment timeline':'পরিশোধের সময়রেখা'
  }
};

let originals=[];
function indexTexts(){
  originals=[];
  document.querySelectorAll('.app-body *, .bottomnav *, .modal-box *, .fab-support').forEach(el=>{
    if(el.children.length===0 && el.textContent.trim() && !['SCRIPT','STYLE','INPUT','SELECT'].includes(el.tagName)){
      originals.push({el:el, orig:el.textContent.trim()});
    }
  });
}

function applyTranslation(lang){
  const dict=T[lang];
  originals.forEach(item=>{
    if(dict && dict[item.orig]){
      item.el.textContent=dict[item.orig];
    } else {
      item.el.textContent=item.orig; // fallback to English
    }
  });
  if(lang==='hi'){
    document.querySelectorAll('#aadhaarGender option').forEach(o=>{
      if(o.value==='male')o.textContent='पुरुष';
      if(o.value==='female')o.textContent='महिला';
      if(o.value==='other')o.textContent='अन्य';
    });
  } else if(lang==='bn'){
    document.querySelectorAll('#aadhaarGender option').forEach(o=>{
      if(o.value==='male')o.textContent='পুরুষ';
      if(o.value==='female')o.textContent='মহিলা';
      if(o.value==='other')o.textContent='অন্যান্য';
    });
  } else {
    document.querySelectorAll('#aadhaarGender option').forEach(o=>{
      if(o.value==='male')o.textContent='Male';
      if(o.value==='female')o.textContent='Female';
      if(o.value==='other')o.textContent='Other';
    });
  }
  if(dict){
    document.querySelectorAll('input[placeholder]').forEach(inp=>{
      // keep placeholders in English for now as they are examples
    });
  }
}

function selectLanguage(code){
  S.voiceLang=code==='voice'?'en':code;
  const name=LANGS.find(x=>x.code===code).name;
  document.getElementById('langSummaryName').textContent=name;
  document.getElementById('langSummaryName2').textContent=name;
  document.getElementById('langModal').classList.remove('show');
  const textLang=(code==='hi')?'hi':'en';
  applyTranslation(textLang);
  if(code==='voice'){
    toast('Voice mode enabled. We\'ll read screens aloud for you.');
  }
  const active=document.querySelector('.screen.active');
  if(active&&active.id==='s-splash') go('s-signup');
}

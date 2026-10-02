// Language: Hindi / English text + voice narration (browser TTS). Ported from employee/js/i18n.js.
import { S } from '../store.js'

export const LANGS = [
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'voice', name: 'Voice', native: 'Voice', flag: '🔊' },
]
// S.voiceLang holds the text language ('hi' | 'en'); S.voiceMode = read screens aloud.
const HI = {
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
}
// t('Get advance') → Hindi when the user picked Hindi; untranslated strings stay English.
export const t = str => (S.voiceLang === 'hi' && HI[str]) || str

// Browser voice — the fallback when a recorded clip is missing. Prefers natural/neural voices
// (Edge "Natural", Google) over the robotic default.
export function speak(text, onEnd, lang = S.voiceLang === 'hi' ? 'hi' : 'en') {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const voices = window.speechSynthesis.getVoices().filter(v => v.lang.replace('_', '-').startsWith(u.lang.slice(0, 2)))
  u.voice = voices.find(v => /natural|neural|online/i.test(v.name)) || voices.find(v => /google/i.test(v.name)) ||
    voices.find(v => v.lang.replace('_', '-') === u.lang) || voices[0] || null
  u.rate = 0.85
  u.onend = u.onerror = onEnd
  window.speechSynthesis.speak(u)
}
export const stopSpeaking = () => window.speechSynthesis?.cancel()

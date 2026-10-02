// Hindi for the schemes quiz: question text + answer labels, keyed by question field (SP_QUESTIONS in schemes.js).
// Spoken-style Hindi for workers, not formal Hindi. Voice clips in public/voice/hi/ are generated from these
// (scripts/make-voice.mjs) — re-run it after changing a question.
const YN = { yes: 'हाँ', no: 'नहीं' }
export const QUIZ_HI = {
  Occupation: { q: 'आप क्या काम करते हैं?', opts: { Construction: 'निर्माण / मज़दूरी', Delivery: 'डिलीवरी / गिग', Domestic: 'घरेलू काम', Factory: 'फैक्ट्री / सिक्योरिटी', Farmer: 'किसान', Vendor: 'रेहड़ी / ठेला', Other: 'कुछ और' } },
  Pf: { q: 'क्या आपकी सैलरी से PF या ESIC कटता है?', opts: YN },
  AnyTaxGovt: { q: 'क्या परिवार में कोई इनकम टैक्स या GST भरता है, या किसी की सरकारी नौकरी या पेंशन है?', opts: YN },
  SelfTax: { q: 'क्या आपने कभी इनकम टैक्स भरा है?', opts: YN },
  Tax: { q: 'क्या परिवार में कोई और इनकम टैक्स या GST भरता है?', opts: YN },
  Govt: { q: 'क्या किसी की सरकारी या PSU नौकरी है, कॉन्ट्रैक्ट वाली भी, या सरकारी पेंशन मिलती है?', opts: YN },
  Pension: { q: 'क्या आपको सरकारी पेंशन या भत्ता मिलता है?', opts: YN },
  Ration: { q: 'आपके पास कौन सा राशन कार्ड है?', opts: { Antyodaya: 'अंत्योदय (AAY)', Priority: 'BPL / प्राथमिकता', Other: 'दूसरा (APL)', None: 'कोई कार्ड नहीं' } },
  FamilyIncome: { q: 'पूरे परिवार की महीने की कमाई कितनी है?', opts: {
    100000: '₹8,000 तक', 120000: '₹8,000 – 10,000', 250000: '₹10,000 – 20,000', 300000: '₹20,000 – 25,000',
    400000: '₹25,000 – 33,000', 600000: '₹33,000 – 50,000', 900000: '₹50,000 – 75,000', 99999999: '₹75,000 से ज़्यादा' } },
  Marital: { q: 'क्या आप शादीशुदा हैं?', opts: { Married: 'शादीशुदा', Unmarried: 'शादी नहीं हुई', Single: 'विधवा / तलाकशुदा' } },
  Children: { q: 'आपके कितने बच्चे हैं?', opts: {} },
  DaughterU10: { q: 'क्या आपकी 10 साल से छोटी बेटी है?', opts: YN },
  Daughter10to18: { q: 'क्या आपकी 10 से 18 साल की बेटी है?', opts: YN },
  MonthlyIncome: { q: 'आपकी अपनी महीने की कमाई कितनी है?', opts: { 14999: '₹15,000 से कम', 15000: '₹15,000 या ज़्यादा' } },
  OwnHome: { q: 'क्या आपके परिवार का अपना पक्का घर है?', opts: YN },
  Car: { q: 'क्या परिवार के पास कार या जीप है? ट्रैक्टर नहीं गिना जाएगा।', opts: YN },
}
export const LEVELS_HI = ['', 'काम', 'परिवार', 'घर']

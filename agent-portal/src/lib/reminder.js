// Missing-document reminder text + real deep links (WhatsApp opens with the message typed; SMS opens the SMS app).
export function reminderText(a, lang) {
  const first = a.applicant.split(' ')[0]
  const list = a.docsMissing.map((d, i) => `${i + 1}. ${d}`).join('\n')
  return lang === 'hi'
    ? `नमस्ते ${first} जी,\nआपके "${a.scheme}" आवेदन के लिए ये दस्तावेज़ अभी बाकी हैं:\n${list}\nकृपया Neev ऐप में Government Schemes → Cart में जाकर अपलोड करें, ताकि हम आपका आवेदन जमा कर सकें।\n– टीम Neev`
    : `Hi ${first},\nFor your "${a.scheme}" application, these documents are still missing:\n${list}\nPlease upload them in the Neev app (Government Schemes → Cart) so we can file your application.\n– Team Neev`
}
export const whatsappLink = (mobile, text) => `https://wa.me/91${mobile}?text=${encodeURIComponent(text)}`
export const smsLink = (mobile, text) => `sms:+91${mobile}?body=${encodeURIComponent(text)}`

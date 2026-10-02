// Generates the quiz voice clips with Murf AI: public/voice/{en,hi}/<Field>.mp3 (one per question, both languages).
// Run once after changing a question:   MURF_API_KEY=… node employee-app/scripts/make-voice.mjs   (only missing clips; --all redoes all)
// The key is read from the environment ONLY — never write it into a file: the repo is public.
import fs from 'fs'
import { SP_QUESTIONS } from '../src/lib/schemes.js'
import { QUIZ_HI } from '../src/lib/schemes-hi.js'

const KEY = process.env.MURF_API_KEY
if (!KEY) { console.error('Set MURF_API_KEY first (see CLAUDE.md).'); process.exit(1) }
// Voice picked by the user (Murf: Prathamesh, Conversation style, Falcon). Same voice for both languages.
const VOICE = { voice_id: 'Prathamesh', style: 'Conversation', model: 'FALCON' }
const LOCALE = { en: 'en-IN', hi: 'hi-IN' }
const OUT = new URL('../public/voice/', import.meta.url)
const all = process.argv.includes('--all')

// Read-aloud wording: no slashes or abbreviations the voice would spell out.
const spoken = t => t.replace(/ \/ /g, ' or ').replace(/\bgovt\b/gi, 'government').replace(/(\d)–(\d)/g, '$1 to $2')
  .replace(/\? \(([^)]*)\)/, (_, x) => `? ${x[0].toUpperCase()}${x.slice(1)}.`) // "jeep? (tractor doesn't count)" → "jeep? Tractor doesn't count."
  .replace(/ \(([^)]*)\)/g, ', $1,') // "PSU job (even contract) or" → "PSU job, even contract, or"

async function tts(text, locale) {
  // Falcon streaming endpoint returns the audio bytes directly.
  const res = await fetch('https://global.api.murf.ai/v1/speech/stream', {
    method: 'POST', headers: { 'api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...VOICE, text, multiNativeLocale: locale, multi_native_locale: locale, format: 'MP3', sampleRate: 24000, channelType: 'MONO' }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

let made = 0
for (const lang of ['en', 'hi']) {
  fs.mkdirSync(new URL(lang + '/', OUT), { recursive: true })
  for (const q of SP_QUESTIONS) {
    const file = new URL(`${lang}/${q.f}.mp3`, OUT)
    if (!all && fs.existsSync(file)) continue
    const text = lang === 'hi' ? QUIZ_HI[q.f].q : spoken(q.q)
    const audio = await tts(text, LOCALE[lang])
    fs.writeFileSync(file, audio)
    made++
    console.log(`✓ ${lang}/${q.f}.mp3  ${(audio.length / 1024).toFixed(0)} KB  "${text}"`)
  }
}
console.log(made ? `${made} clips written to employee-app/public/voice/ — run npm run build` : 'All clips already exist (use --all to regenerate).')

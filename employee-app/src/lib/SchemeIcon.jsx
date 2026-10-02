// 3D scheme icons (Microsoft Fluent Emoji, MIT licence) — glossy and the same on every phone, unlike system emoji.
// Loaded from jsDelivr; if an image can't load (offline), the scheme's own emoji (`s.icon`) shows instead.
// Key = scheme name, value = Fluent asset name ('*' = people icon, stored under a Default skin-tone folder).
const ICONS = {
  'Construction Workers Welfare Board': 'Construction worker*',
  'PM Shram Yogi Maandhan': 'Older person*',
  'e-Shram Card': 'Identification card',
  'Atal Pension Yojana': 'Money bag',
  'PM Suraksha Bima Yojana': 'Shield',
  'PM Jeevan Jyoti Bima Yojana': 'Blue heart',
  'PM Awas Yojana (Urban 2.0)': 'House',
  'Sukanya Samriddhi Yojana': 'Girl*',
  'Ayushman Bharat (PM-JAY)': 'Hospital',
  'PM-KISAN': 'Farmer*',
  'PM SVANidhi': 'Shopping cart',
  'PM Ujjwala Yojana': 'Fire',
  'Ration Card (NFSA)': 'Cooked rice',
  'Delhi Lakshmi Yojana': 'Woman*',
  'Mukhyamantri Mahila Rojgar Yojana': 'Money with wings',
  'Mukhyamantri Kanya Utthan': 'Graduation cap',
  'Kanya Sumangala Yojana': 'Girl*',
  'Majhi Ladki Bahin Yojana': 'Woman*',
  'Mahatma Jyotiba Phule Jan Arogya': 'Hospital',
  'MAA Yojana (formerly Chiranjeevi)': 'Stethoscope',
  'Shri Annapurna Rasoi': 'Curry rice',
  'Ladli Bahna Yojana': 'Woman*',
  'Ladli Laxmi Yojana': 'Girl*',
  'Maiyan Samman Yojana': 'Woman*',
  'Gruha Lakshmi': 'Woman*',
  'Anna Bhagya': 'Cooked rice',
  'Kalaignar Magalir Urimai Thogai': 'Woman*',
  "CM's Comprehensive Health Insurance (CMCHIS)": 'Hospital',
  'Annapurna Bhandar': 'Woman*',
  'PMJAY-MA (Mukhyamantri Amrutum)': 'Hospital',
  'Namo Lakshmi Yojana': 'Graduation cap',
  'Subhadra Yojana': 'Woman*',
  'Gopabandhu Jan Arogya Yojana': 'Hospital',
  'Mukh Mantri Sehat Yojana': 'Stethoscope',
  'Smart Ration Card (Atta-Dal)': 'Sheaf of rice',
  'Deen Dayal Lado Lakshmi Yojana': 'Woman*',
  'Chirayu Ayushman Bharat': 'Stethoscope',
}
const BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/'
function iconUrl(name) {
  const asset = ICONS[name]
  if (!asset) return null
  const people = asset.endsWith('*'), n = asset.replace('*', ''), file = n.toLowerCase().replace(/ /g, '_')
  return BASE + encodeURIComponent(n) + (people ? `/Default/3D/${file}_3d_default.png` : `/3D/${file}_3d.png`)
}

// size = Tailwind size class for the image; the emoji fallback inherits the parent's font size.
export default function SchemeIcon({ s, size = 'size-8' }) {
  const url = iconUrl(s.name)
  if (!url) return s.icon
  return (
    <img src={url} alt="" loading="lazy" draggable={false} className={`${size} object-contain drop-shadow-[0_2px_2px_rgb(0_0_0/.15)]`}
      onError={e => e.currentTarget.replaceWith(document.createTextNode(s.icon))} />
  )
}

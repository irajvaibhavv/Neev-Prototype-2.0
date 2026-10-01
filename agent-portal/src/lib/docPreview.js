// The prototype doesn't store real uploads (the app only marks a document uploaded), so View / Download
// show a generated stand-in image with the applicant's details, clearly labelled as a sample.
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function docSvg(app, doc) {
  const p = app.person || {}
  const rows = [['Name', app.applicant], ['Aadhaar', p.aadhaarLast4 ? `XXXX XXXX ${p.aadhaarLast4}` : '—'],
    ['Date of birth', p.dob || '—'], ['State', app.state || '—'], ['Scheme', app.scheme]]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" font-family="Arial, sans-serif">
  <rect width="640" height="420" rx="18" fill="#ffffff" stroke="#cdd5e2" stroke-width="2"/>
  <rect width="640" height="74" rx="18" fill="#46237a"/><rect y="56" width="640" height="18" fill="#46237a"/>
  <text x="32" y="46" font-size="24" font-weight="bold" fill="#ffffff">${esc(doc)}</text>
  ${rows.map(([k, v], i) => `<text x="32" y="${130 + i * 46}" font-size="15" fill="#5f5680">${esc(k)}</text>
  <text x="200" y="${130 + i * 46}" font-size="18" font-weight="bold" fill="#1a0f2e">${esc(v)}</text>`).join('\n  ')}
  <rect x="470" y="104" width="138" height="170" rx="10" fill="#f3f1f9" stroke="#e2dff0"/>
  <circle cx="539" cy="165" r="34" fill="#cdd5e2"/><rect x="497" y="210" width="84" height="48" rx="24" fill="#cdd5e2"/>
  <text x="320" y="396" font-size="13" fill="#b45309" text-anchor="middle">SAMPLE — prototype preview, not the real uploaded file</text>
</svg>`
}

export const docUrl = (app, doc) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(docSvg(app, doc))}`

export function downloadDoc(app, doc) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([docSvg(app, doc)], { type: 'image/svg+xml' }))
  a.download = `${app.applicant} - ${doc}.svg`.replace(/[\\/:*?"<>|]/g, '')
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 0)
}

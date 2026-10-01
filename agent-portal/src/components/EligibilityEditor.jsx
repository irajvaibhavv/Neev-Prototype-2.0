import { ANSWER_LABELS } from '../lib/labels'

// Eligibility for one scheme: age + gender (known from Aadhaar), rules on the employee app's
// eligibility questions (person qualifies if their answer is one of the ticked ones), and
// requirements the agent checks by hand. Value shape: see BLANK_ELIG in lib/schemes.js.
const YN = { yes: 'Yes', no: 'No' }
const CHILDREN = { 0: 'None', 1: '1', 2: '2', 3: '3', 4: '4+' }
// LiveState is the scheme's "Available in", so it isn't a rule here.
export const QUESTIONS = ANSWER_LABELS.filter(([k]) => k !== 'LiveState')
  .map(([key, label, map]) => ({ key, label, options: key === 'Children' ? CHILDREN : map || YN }))

const Label = ({ children }) => <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>
const Chip = ({ on, onClick, children }) => (
  <button type="button" aria-pressed={on} onClick={onClick}
    className={`rounded-full border px-3 py-1 text-sm font-semibold ${on ? 'bg-info-tint text-info border-info/40' : 'bg-card text-ink-2 border-line hover:border-ink-3'}`}>
    {on && '✓ '}{children}
  </button>
)
const num = 'w-24 rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand'
const Section = ({ title, sub, children }) => (
  <section className="p-5 space-y-4">
    <div><h2 className="font-bold">{title}</h2>{sub && <p className="text-sm text-ink-2 mt-0.5">{sub}</p>}</div>
    {children}
  </section>
)

export default function EligibilityEditor({ value: e, onChange }) {
  const set = patch => onChange({ ...e, ...patch })
  const setRule = (i, patch) => set({ rules: e.rules.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
  const toggleAns = (i, v) => { const any = e.rules[i].any; setRule(i, { any: any.includes(v) ? any.filter(x => x !== v) : [...any, v] }) }
  const unused = QUESTIONS.filter(q => !e.rules.some(r => r.q === q.key))
  const setCheck = (i, v) => set({ checks: e.checks.map((c, j) => (j === i ? v : c)) })

  return (
    <>
      <Section title="Age and gender" sub="Checked from the person's Aadhaar.">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <Label>Age</Label>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-ink-2">
              <input inputMode="numeric" maxLength={3} value={e.minAge} onChange={ev => set({ minAge: ev.target.value.replace(/\D/g, '') })} className={num} placeholder="Min" aria-label="Minimum age" />
              to
              <input inputMode="numeric" maxLength={3} value={e.maxAge} onChange={ev => set({ maxAge: ev.target.value.replace(/\D/g, '') })} className={num} placeholder="Max" aria-label="Maximum age" />
              years
            </div>
          </div>
          <div>
            <Label>Gender</Label>
            <div className="mt-1.5 flex gap-2">
              {[['any', 'Anyone'], ['female', 'Women only'], ['male', 'Men only']].map(([k, l]) => <Chip key={k} on={e.gender === k} onClick={() => set({ gender: k })}>{l}</Chip>)}
            </div>
          </div>
        </div>
        <p className="text-xs text-ink-3">Leave age empty for no limit.</p>
      </Section>

      <Section title={`Rules from the eligibility questions (${e.rules.length})`} sub="The person qualifies only if every rule matches. Tick the answers that qualify.">
        {e.rules.length === 0 && <p className="text-sm text-ink-3">No rules — anyone in the state can apply.</p>}
        <ul className="space-y-3">
          {e.rules.map((r, i) => {
            const q = QUESTIONS.find(x => x.key === r.q)
            return (
              <li key={r.q} className="rounded-lg border border-line p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 font-semibold">{q.label}</div>
                  <button type="button" onClick={() => set({ rules: e.rules.filter((_, j) => j !== i) })} aria-label={`Remove rule ${q.label}`}
                    className="text-sm text-ink-3 hover:text-bad">Remove</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(q.options).map(([v, l]) => <Chip key={v} on={r.any.includes(v)} onClick={() => toggleAns(i, v)}>{l}</Chip>)}
                </div>
              </li>
            )
          })}
        </ul>
        {unused.length > 0 && (
          <select value="" onChange={ev => ev.target.value && set({ rules: [...e.rules, { q: ev.target.value, any: [] }] })} aria-label="Add a rule"
            className="w-full sm:w-80 rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand">
            <option value="">+ Add a rule…</option>
            {unused.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
          </select>
        )}
      </Section>

      <Section title="Other requirements" sub="Things the questions can't check — the agent confirms these with the person.">
        <ul className="space-y-2">
          {e.checks.map((c, i) => (
            <li key={i} className="flex gap-2">
              <textarea rows={2} value={c} onChange={ev => setCheck(i, ev.target.value)} aria-label={`Requirement ${i + 1}`}
                className="flex-1 rounded-lg bg-input border border-line px-3 py-2 text-sm outline-none focus:border-brand" placeholder="e.g. 90+ days of construction work in the last 12 months" />
              <button type="button" onClick={() => set({ checks: e.checks.filter((_, j) => j !== i) })} aria-label={`Remove requirement ${i + 1}`}
                className="self-start rounded-lg border border-line px-2.5 py-2 text-ink-3 hover:text-bad hover:border-bad">✕</button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => set({ checks: [...e.checks, ''] })} className="text-sm text-side-active font-semibold hover:underline">+ Add requirement</button>
      </Section>
    </>
  )
}

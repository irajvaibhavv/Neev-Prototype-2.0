import { ANSWER_LABELS } from '../lib/labels'
import { useEffect, useState } from 'react'
import { FIELD_TYPES, hasOptions } from '../lib/fields'
import { RULE_OPS, opsFor, describeRule } from '../lib/schemes'

// Eligibility for one scheme: rules only on this scheme's own information fields (Information tab) —
// age needs its Date of birth field.
// Older rule kinds (gender, app questions, documents) still render so they can be removed, but can't be added. Value shape: see BLANK_ELIG in lib/schemes.js.
const YN = { yes: 'Yes', no: 'No' }
const CHILDREN = { 0: 'None', 1: '1', 2: '2', 3: '3', 4: '4+' }
// LiveState is the scheme's "Available in", so it isn't a rule here.
export const QUESTIONS = ANSWER_LABELS.filter(([k]) => k !== 'LiveState')
  .map(([key, label, map]) => ({ key, label, options: key === 'Children' ? CHILDREN : map || YN }))

const Chip = ({ on, onClick, children }) => (
  <button type="button" aria-pressed={on} onClick={onClick}
    className={`rounded-full border px-3 py-1 text-sm font-semibold ${on ? 'bg-info-tint text-info border-info/40' : 'bg-card text-ink-2 border-line hover:border-ink-3'}`}>
    {on && '✓ '}{children}
  </button>
)
const num = 'w-24 rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand'

const input = 'rounded-lg bg-input border border-line px-3 py-2 text-sm outline-none focus:border-brand'

// One rule on a field or document: "<name> <condition> <value>". Number fields use < ≤ > ≥ = ≠ / between.
function CustomRule({ r, onChange, onRemove, missing }) {
  const ops = opsFor(r)
  const set = patch => onChange({ ...r, ...patch })
  const toggle = v => set({ values: r.values.includes(v) ? r.values.filter(x => x !== v) : [...r.values, v] })
  const valueInput = (key, label) => (
    <input type={r.type === 'date' ? 'date' : 'text'} inputMode={r.type === 'number' ? 'decimal' : undefined} value={r[key] ?? ''}
      onChange={ev => set({ [key]: r.type === 'number' ? ev.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1') : ev.target.value })}
      aria-label={`${label} for ${r.name}`} placeholder={r.type === 'number' ? 'e.g. 60' : 'Value'} className={`${input} ${r.type === 'number' ? 'w-28' : 'w-40'}`} />
  )
  return (
    <li className="rounded-lg border border-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-3">{r.kind === 'doc' ? 'Document' : 'Field'}</span>
        <span className="font-semibold">{r.name}</span>
        {ops.length > 1
          ? <select value={r.op} onChange={ev => set({ op: ev.target.value })} aria-label={`Condition for ${r.name}`} className={`${input} font-semibold`}>
              {ops.map(([k, sym, words]) => <option key={k} value={k}>{sym === words ? sym : `${sym}  ${words}`}</option>)}
            </select>
          : <span className="text-sm text-ink-2">{ops[0][1]}</span>}
        {r.kind === 'field' && r.op !== 'filled' && (
          r.type === 'yesno' ? (
            <span className="flex gap-2">{[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => <Chip key={v} on={r.value === v} onClick={() => set({ value: v })}>{l}</Chip>)}</span>
          ) : !hasOptions(r.type) && (
            r.op === 'between'
              ? <span className="flex items-center gap-2 text-sm text-ink-2">{valueInput('value', 'From')} and {valueInput('value2', 'To')}</span>
              : valueInput('value', 'Value')
          )
        )}
        <button type="button" onClick={onRemove} aria-label={`Remove rule on ${r.name}`} className="ml-auto text-sm text-ink-3 hover:text-bad">Remove</button>
      </div>
      {r.kind === 'field' && hasOptions(r.type) && r.op !== 'filled' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(r.options || []).map(o => <Chip key={o} on={r.values.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}
          {!(r.options || []).length && <p className="text-sm text-ink-3">This field has no options yet — add them in Fields.</p>}
        </div>
      )}
      <p className="mt-2 text-xs text-ink-3">Qualifies if: <span className="text-ink-2 font-semibold">{describeRule(r)}</span>{r.op === 'between' && r.kind === 'field' && ' (both ends included)'}</p>
      {missing && <p className="mt-2 text-xs text-bad font-semibold">No longer on this scheme — add it back or remove this rule.</p>}
    </li>
  )
}

// A field's type/options may have changed in Fields since the rule was made: follow the master list.
function syncRule(r, allFields) {
  if (r.kind === 'doc') return r
  const fd = allFields.find(f => f.name === r.name)
  if (!fd || (fd.type === r.type && (fd.options || []).join('|') === (r.options || []).join('|'))) return r
  const typeChanged = fd.type !== r.type
  const op = RULE_OPS[fd.type].some(o => o[0] === r.op) ? r.op : RULE_OPS[fd.type][0][0]
  return { ...r, type: fd.type, options: fd.options || [], op,
    value: typeChanged ? (fd.type === 'yesno' ? 'yes' : '') : r.value, value2: typeChanged ? '' : r.value2,
    values: (r.values || []).filter(v => (fd.options || []).includes(v)) }
}

const Card = ({ title, onRemove, children }) => (
  <li className="rounded-lg border border-line p-4">
    <div className="flex items-center gap-3">
      <div className="flex-1 font-semibold">{title}</div>
      <button type="button" onClick={onRemove} aria-label={`Remove rule ${title}`} className="text-sm text-ink-3 hover:text-bad">Remove</button>
    </div>
    <div className="mt-3">{children}</div>
  </li>
)

// fields / docs = what this scheme collects (names); allFields = master list, for each field's type.
// Starts empty: every rule (age, gender, question, field, document, written requirement) is added one by one.
export default function EligibilityEditor({ value: e, onChange, fields = [], docs = [], allFields = [] }) {
  const set = patch => onChange({ ...e, ...patch })
  const setRule = (i, patch) => set({ rules: e.rules.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
  const toggleAns = (i, v) => { const any = e.rules[i].any; setRule(i, { any: any.includes(v) ? any.filter(x => x !== v) : [...any, v] }) }
  // const unused = QUESTIONS.filter(q => !e.rules.some(r => r.q === q.key)) // app questions parked (see picker)
  const hasDob = fields.includes('Date of birth')
  const custom = e.custom || []
  // Age / gender rows stay visible once added, even before a value is chosen.
  const [shown, setShown] = useState({ age: e.minAge !== '' || e.maxAge !== '', gender: e.gender !== 'any' })
  useEffect(() => {
    const synced = custom.map(r => syncRule(r, allFields))
    if (synced.some((r, i) => r !== custom[i])) set({ custom: synced })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function add(key) {
    const [kind, name] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)]
    if (kind === 'age' || kind === 'gender') return setShown({ ...shown, [kind]: true })
    if (kind === 'q') return set({ rules: [...e.rules, { q: name, any: [] }] })
    const fd = allFields.find(f => f.name === name) || { type: 'text', options: [] }
    const type = kind === 'doc' ? 'doc' : fd.type
    set({ custom: [...custom, { kind, name, type, options: fd.options, op: RULE_OPS[type][0][0], value: type === 'yesno' ? 'yes' : '', value2: '', values: [] }] })
  }
  const total = (shown.age ? 1 : 0) + (shown.gender ? 1 : 0) + e.rules.length + custom.length

  return (
    <section className="p-5 space-y-4">
      <div>
        <h2 className="font-bold">Eligibility rules ({total})</h2>
        <p className="text-sm text-ink-2 mt-0.5">The person qualifies only if every rule matches.</p>
      </div>
      {total === 0 && <p className="text-sm text-ink-3">No rules — anyone in the state can apply. Add rules one by one below.</p>}

      <ul className="space-y-3">
        {shown.age && (
          <Card title={hasDob ? 'Age (from Date of birth)' : 'Age — add Date of birth in the Information tab'} onRemove={() => { setShown({ ...shown, age: false }); set({ minAge: '', maxAge: '' }) }}>
            <div className="flex items-center gap-2 text-sm text-ink-2">
              <input inputMode="numeric" maxLength={3} value={e.minAge} onChange={ev => set({ minAge: ev.target.value.replace(/\D/g, '') })} className={num} placeholder="Min" aria-label="Minimum age" />
              to
              <input inputMode="numeric" maxLength={3} value={e.maxAge} onChange={ev => set({ maxAge: ev.target.value.replace(/\D/g, '') })} className={num} placeholder="Max" aria-label="Maximum age" />
              years <span className="text-xs text-ink-3">(leave one empty for no limit)</span>
            </div>
          </Card>
        )}
        {shown.gender && (
          <Card title="Gender (from Aadhaar)" onRemove={() => { setShown({ ...shown, gender: false }); set({ gender: 'any' }) }}>
            <div className="flex gap-2">
              {[['female', 'Women only'], ['male', 'Men only']].map(([k, l]) => <Chip key={k} on={e.gender === k} onClick={() => set({ gender: k })}>{l}</Chip>)}
            </div>
          </Card>
        )}
        {e.rules.map((r, i) => {
          const q = QUESTIONS.find(x => x.key === r.q)
          return (
            <Card key={r.q} title={q.label} onRemove={() => set({ rules: e.rules.filter((_, j) => j !== i) })}>
              <p className="text-xs text-ink-3 mb-2">Tick the answers that qualify.</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(q.options).map(([v, l]) => <Chip key={v} on={r.any.includes(v)} onClick={() => toggleAns(i, v)}>{l}</Chip>)}
              </div>
            </Card>
          )
        })}
        {custom.map((r, i) => (
          <CustomRule key={i} r={r} missing={!(r.kind === 'doc' ? docs : fields).includes(r.name)}
            onChange={nr => set({ custom: custom.map((x, j) => (j === i ? nr : x)) })}
            onRemove={() => set({ custom: custom.filter((_, j) => j !== i) })} />
        ))}
      </ul>

      {fields.length === 0 && <p className="text-sm text-ink-3">Add information fields in the Information tab first — rules can only use this scheme's fields.</p>}
      <select value="" onChange={ev => ev.target.value && add(ev.target.value)} aria-label="Add a rule"
        className="w-full sm:w-96 rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand">
        <option value="">+ Add a rule…</option>
        {/* Only this scheme's own information fields (Information tab). Age needs its Date of birth field. */}
        {(fields.length > 0 || (hasDob && !shown.age)) && (
          <optgroup label="Information fields (this scheme)">
            {hasDob && !shown.age && <option value="age:">Age (from Date of birth)</option>}
            {fields.map(f => <option key={f} value={`field:${f}`}>{f} · {FIELD_TYPES[allFields.find(x => x.name === f)?.type] || 'Text'}</option>)}
          </optgroup>
        )}
        {/* Parked: gender, documents and the app's eligibility questions aren't this scheme's information fields.
        {!shown.gender && <option value="gender:">Gender</option>}
        {docs.length > 0 && <optgroup label="Documents">{docs.map(d => <option key={d} value={`doc:${d}`}>{d}</option>)}</optgroup>}
        {unused.length > 0 && <optgroup label="Eligibility questions (app)">{unused.map(q => <option key={q.key} value={`q:${q.key}`}>{q.label}</option>)}</optgroup>}
        */}
      </select>
    </section>
  )
}

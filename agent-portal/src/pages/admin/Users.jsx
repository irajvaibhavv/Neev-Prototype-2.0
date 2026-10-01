import { useState } from 'react'
import { MANAGED_ROLES, ROLES, deleteUser, getUsers, saveUser, validateUser } from '../../lib/auth'
import Modal from '../../components/Modal'
import { btnDanger, btnGhost, btnPrimary, seg, segBtn } from '../../lib/ui'

const field = 'mt-1.5 w-full rounded-lg bg-input border border-line px-3 py-2.5 text-sm outline-none focus:border-brand'
const Label = ({ children }) => <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>

function UserForm({ user, onClose, onSave, onDelete }) {
  const [u, setU] = useState(user)
  const [error, setError] = useState('')
  const set = patch => { setU(x => ({ ...x, ...patch })); setError('') }
  const isSuper = u.role === 'super'
  function submit() {
    const e = validateUser(u)
    if (e) return setError(e)
    onSave(u)
  }
  return (
    <Modal title={u.id ? 'Edit user' : 'Create user'} onClose={onClose} labelId="user-title"
      footer={<>{u.id && !isSuper && <button onClick={onDelete} className="mr-auto text-sm text-bad font-semibold hover:underline">Delete user</button>}<button onClick={onClose} className={btnGhost}>Cancel</button><button onClick={submit} className={btnPrimary}>{u.id ? 'Save changes' : 'Create user'}</button></>}>
      <label className="block"><Label>Full name *</Label>
        <input autoFocus value={u.name} onChange={e => set({ name: e.target.value })} className={field} placeholder="e.g. Priya Sharma" />
      </label>
      <label className="block"><Label>Mobile number * (used to log in)</Label>
        <input inputMode="numeric" maxLength={10} value={u.mobile} onChange={e => set({ mobile: e.target.value.replace(/\D/g, '') })} className={field} placeholder="98765 00021" />
      </label>
      {!isSuper && (
        <div><Label>Role *</Label>
          <div className={`${seg} mt-1.5`} role="group" aria-label="Role">
            {MANAGED_ROLES.map(r => <button key={r} type="button" aria-pressed={u.role === r} onClick={() => set({ role: r })} className={segBtn(u.role === r)}>{ROLES[r].label}</button>)}
          </div>
          <p className="mt-1.5 text-xs text-ink-3">{u.role === 'agent' ? 'Works scheme applications: leads, documents, filing.' : 'Sees the sales dashboard.'}</p>
        </div>
      )}
      <label className="block"><Label>Area / region</Label>
        <input value={u.area} onChange={e => set({ area: e.target.value })} className={field} placeholder="e.g. Pune · Maharashtra" />
      </label>
      {!isSuper && (
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
          <input type="checkbox" checked={u.active !== false} onChange={e => set({ active: e.target.checked })} className="accent-brand size-4" />
          Active — can log in
        </label>
      )}
      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
    </Modal>
  )
}

export default function Users({ me }) {
  const [users, setUsers] = useState(getUsers)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('agent')
  const rows = users.filter(u => u.role === filter)

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-ink-2">Create and manage agent and sales logins. Each user logs in with their mobile number + OTP.</p>
        </div>
        <button onClick={() => setEditing({ name: '', mobile: '', role: 'agent', area: '', active: true })} className={btnPrimary}>+ Create user</button>
      </div>

      <div className="mt-5 inline-flex flex-wrap rounded-lg bg-page border border-line p-0.5 gap-0.5" role="tablist" aria-label="Filter by role">
        {['agent', 'sales', 'super'].map(r => (
          <button key={r} role="tab" aria-selected={filter === r} onClick={() => setFilter(r)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-semibold ${filter === r ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'}`}>
            {ROLES[r].label}
            <span className="ml-2 text-xs text-ink-3">{users.filter(u => u.role === r).length}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 bg-card border border-line rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-3">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Mobile</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(u => (
              <tr key={u.id} className="hover:bg-brand/5">
                <td className="px-4 py-3 font-semibold">{u.name}{u.id === me.id && <span className="ml-2 text-xs font-normal text-ink-3">(you)</span>}</td>
                <td className="px-4 py-3 text-ink-2 whitespace-nowrap">+91 {u.mobile}</td>
                <td className="px-4 py-3">{u.active === false ? <span className="text-bad font-semibold">Deactivated</span> : <span className="text-ok font-semibold">Active</span>}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(u)} className="text-side-active font-semibold hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-10 text-center text-ink-2">No users with this role yet.</p>}
      </div>

      {editing && <UserForm user={editing} onClose={() => setEditing(null)} onSave={u => { setUsers(saveUser(u)); setEditing(null) }} onDelete={() => { setDeleting(editing); setEditing(null) }} />}
      {deleting && (
        <Modal title={`Delete ${deleting.name}?`} sub={`${ROLES[deleting.role].label} · +91 ${deleting.mobile}`} onClose={() => setDeleting(null)} labelId="del-title"
          footer={<><button onClick={() => setDeleting(null)} className={btnGhost}>Cancel</button>
            <button onClick={() => { setUsers(deleteUser(deleting.id)); setDeleting(null) }} className={btnDanger}>Delete user</button></>}>
          <p className="text-sm text-ink-2">They won't be able to log in any more. To block them for a while instead, edit the user and untick <b>Active</b>.</p>
        </Modal>
      )}
    </div>
  )
}

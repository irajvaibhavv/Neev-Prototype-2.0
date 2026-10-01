// Agent ↔ applicant chat, one thread per application. Stored in localStorage 'neev_chats':
//   { [appId]: [{ id, from: 'agent' | 'user', name, text, file?: { name, type, size, url }, at }] }
// Same origin as employee.html (localhost:3000), so the employee app can read / append to the same threads.
import { useCallback, useEffect, useState } from 'react'

export const CHAT_KEY = 'neev_chats'
export const MAX_FILE = 1024 * 1024 // 1 MB — attachments are kept inline in localStorage
const read = () => { try { return JSON.parse(localStorage.getItem(CHAT_KEY)) || {} } catch { return {} } }
const write = v => { try { localStorage.setItem(CHAT_KEY, JSON.stringify(v)); return true } catch { return false } }

// Append one message to an application's thread. Returns false if storage is full.
export function postChat(appId, msg) {
  const all = read()
  all[appId] = [...(all[appId] || []), { id: `m${Date.now().toString(36)}`, at: new Date().toISOString(), ...msg }]
  return write(all)
}

export function useChat(appId) {
  const [msgs, setMsgs] = useState(() => read()[appId] || [])
  const reload = useCallback(() => setMsgs(read()[appId] || []), [appId])
  useEffect(() => {
    reload()
    const onStorage = e => { if (e.key === CHAT_KEY) reload() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [reload])
  // Returns false if storage is full (e.g. too many attachments).
  const send = useCallback(msg => {
    const ok = postChat(appId, msg)
    if (ok) reload()
    return ok
  }, [appId, reload])
  return { msgs, send }
}

export const fmtSize = n => (n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`)

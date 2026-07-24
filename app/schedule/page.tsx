'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Item = { id: string; title: string; kind: string; scheduled_date: string | null }

export default function SchedulePage() {
  const [items, setItems] = useState<Item[]>([])
  const [newSched, setNewSched] = useState('')

  async function load() {
    const { data } = await supabase.from('items').select('id,title,kind,scheduled_date').order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [])

  const toSchedule = items.filter((i) => i.kind === 'to_schedule' && !i.scheduled_date)

  async function addToSchedule() {
    if (!newSched.trim()) return
    await supabase.from('items').insert({ title: newSched, kind: 'to_schedule' })
    setNewSched('')
    load()
  }
  async function renameSched(id: string, title: string) {
    if (!title.trim()) return
    await supabase.from('items').update({ title }).eq('id', id)
    load()
  }
  async function deleteSched(id: string) {
    await supabase.from('items').delete().eq('id', id)
    load()
  }
  async function scheduleIt(id: string, date: string) {
    if (!date) return
    await supabase.from('items').update({ scheduled_date: date, kind: 'event' }).eq('id', id)
    load()
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>To schedule</h1>
      <p style={{ fontSize: 13, color: '#888', marginTop: 0, marginBottom: 20 }}>
        {toSchedule.length === 0 ? 'All caught up.' : `${toSchedule.length} waiting for a date`}
      </p>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        {toSchedule.map((i) => (
          <div key={i.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
            <input defaultValue={i.title} onBlur={(e) => renameSched(i.id, e.target.value)}
              style={{ flex: 1, padding: 6, border: '1px solid #f0f0f0', borderRadius: 6, fontSize: 14 }} />
            <input type="date" onChange={(e) => scheduleIt(i.id, e.target.value)}
              style={{ padding: 5, border: '1px solid #ddd', borderRadius: 6, fontSize: 13, color: '#666' }} />
            <button onClick={() => deleteSched(i.id)}
              style={{ border: 'none', background: 'none', color: '#c5221f', fontSize: 13, cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input value={newSched} onChange={(e) => setNewSched(e.target.value)} placeholder="Something that needs a date"
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <button onClick={addToSchedule} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
        </div>
      </section>
    </main>
  )
}
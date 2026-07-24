'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Item = {
  id: string
  title: string
  kind: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
}

export default function CalendarPage() {
  const [items, setItems] = useState<Item[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.from('items').select('*').order('created_at')
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function addToSchedule() {
    if (!newTitle.trim()) return
    await supabase.from('items').insert({ title: newTitle, kind: 'to_schedule' })
    setNewTitle('')
    load()
  }

  const toSchedule = items.filter((i) => i.kind === 'to_schedule' && !i.scheduled_date)
  const scheduled = items.filter((i) => i.scheduled_date)

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Calendar</h1>

      {loading ? (
        <p style={{ color: '#888' }}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
          <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Scheduled</h2>
            {scheduled.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>Nothing scheduled yet.</p>}
            {scheduled.map((i) => (
              <div key={i.id} style={{ padding: '8px 0', borderTop: '1px solid #f0f0f0', fontSize: 14 }}>
                <span style={{ color: '#888', marginRight: 8 }}>{i.scheduled_date}</span>
                {i.title}
              </div>
            ))}
          </section>

          <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>To schedule</h2>
            {toSchedule.map((i) => (
              <div key={i.id} style={{ padding: '8px 0', borderTop: '1px solid #f0f0f0', fontSize: 14 }}>
                {i.title}
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Something that needs a date"
                style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
              />
              <button onClick={addToSchedule} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14 }}>
                Add
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Item = {
  id: string
  title: string
  kind: string
  scheduled_date: string | null
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarPage() {
  const [items, setItems] = useState<Item[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState('')
  const [newSched, setNewSched] = useState('')

  async function load() {
    const { data } = await supabase.from('items').select('id,title,kind,scheduled_date').order('created_at')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = ymd(today)

  // Start: Sunday of the current week
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay())

// Exactly 5 weeks (35 cells) from the start
  const cells: Date[] = []
  for (let i = 0; i < 35; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }

  function eventsOn(dateStr: string) {
    return items.filter((i) => i.scheduled_date === dateStr)
  }

  async function addEvent() {
    if (!newEvent.trim() || !selected) return
    await supabase.from('items').insert({ title: newEvent, kind: 'event', scheduled_date: selected })
    setNewEvent('')
    load()
  }

  async function addToSchedule() {
    if (!newSched.trim()) return
    await supabase.from('items').insert({ title: newSched, kind: 'to_schedule' })
    setNewSched('')
    load()
  }

  const toSchedule = items.filter((i) => i.kind === 'to_schedule' && !i.scheduled_date)

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Calendar</h1>
      <p style={{ fontSize: 13, color: '#888', marginTop: 0, marginBottom: 20 }}>Through the end of next month</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((date) => {
              const ds = ymd(date)
              const isPast = date < today
              if (isPast) return <div key={ds} style={{ minHeight: 70 }} />

              const evs = eventsOn(ds)
              const isToday = ds === todayStr
              const isSel = ds === selected
              const firstOfMonth = date.getDate() === 1
              return (
                <div key={ds} onClick={() => setSelected(ds)}
                  style={{
                    minHeight: 70, borderRadius: 8, padding: 5, cursor: 'pointer', fontSize: 11,
                    background: isSel ? '#eef0ff' : '#fafafa',
                    border: isToday ? '2px solid #3b45c4' : '1px solid #f0f0f0',
                  }}>
                  <div style={{ fontSize: 12, color: isToday ? '#3b45c4' : '#666', fontWeight: isToday ? 600 : 400, textAlign: 'right' }}>
                    {firstOfMonth ? date.toLocaleString('default', { month: 'short' }) + ' ' : ''}{date.getDate()}
                  </div>
                  {evs.slice(0, 3).map((e) => (
                    <div key={e.id} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#333', marginTop: 2 }}>{e.title}</div>
                  ))}
                  {evs.length > 3 && <div style={{ color: '#aaa' }}>+{evs.length - 3}</div>}
                </div>
              )
            })}
          </div>

          {selected && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Add event on {selected}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newEvent} onChange={(e) => setNewEvent(e.target.value)} placeholder="Event title"
                  style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
                <button onClick={addEvent} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
              </div>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>To schedule</h2>
          {toSchedule.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>Nothing waiting.</p>}
          {toSchedule.map((i) => (
            <div key={i.id} style={{ padding: '8px 0', borderTop: '1px solid #f0f0f0', fontSize: 14 }}>{i.title}</div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input value={newSched} onChange={(e) => setNewSched(e.target.value)} placeholder="Needs a date"
              style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            <button onClick={addToSchedule} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
          </div>
        </section>
      </div>
    </main>
  )
}
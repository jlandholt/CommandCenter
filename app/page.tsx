'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

type Item = {
  id: string
  title: string
  kind: string
  scheduled_date: string | null
  end_date: string | null
  type_id: string | null
}
type ItemType = { id: string; name: string; color: string }

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarPage() {
  const [items, setItems] = useState<Item[]>([])
  const [types, setTypes] = useState<ItemType[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [editing, setEditing] = useState<Item | null>(null)
  const [newEvent, setNewEvent] = useState('')
  const [newType, setNewType] = useState('')

  async function load() {
    const { data } = await supabase.from('items').select('id,title,kind,scheduled_date,end_date,type_id').order('created_at')
    setItems(data ?? [])
    const { data: t } = await supabase.from('item_types').select('*').order('position')
    setTypes(t ?? [])
  }
  useEffect(() => { load() }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = ymd(today)

  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay())

  const cells: Date[] = []
  for (let i = 0; i < 35; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }

  function typeOf(id: string | null) {
    return types.find((t) => t.id === id)
  }
  // an event shows on a day if that day is between its start and end (inclusive)
  function eventsOn(dateStr: string) {
    return items.filter((i) => {
      if (!i.scheduled_date) return false
      const endD = i.end_date || i.scheduled_date
      return dateStr >= i.scheduled_date && dateStr <= endD
    })
  }

  const toScheduleCount = items.filter((i) => i.kind === 'to_schedule' && !i.scheduled_date).length

  async function addEvent() {
    if (!newEvent.trim() || !selected) return
    await supabase.from('items').insert({
      title: newEvent, kind: 'event', scheduled_date: selected, type_id: newType || null,
    })
    setNewEvent(''); setNewType('')
    load()
  }

  async function saveEdit() {
    if (!editing) return
    await supabase.from('items').update({
      title: editing.title,
      scheduled_date: editing.scheduled_date,
      end_date: editing.end_date || null,
      type_id: editing.type_id || null,
    }).eq('id', editing.id)
    setEditing(null)
    load()
  }

  async function deleteEvent(id: string) {
    await supabase.from('items').delete().eq('id', id)
    setEditing(null)
    load()
  }

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Calendar</h1>

      <Link href="/schedule" style={{ textDecoration: 'none' }}>
        {toScheduleCount > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff7e6', border: '1px solid #ffe1a8', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#8a5a00' }}>
              ⚠️ {toScheduleCount} thing{toScheduleCount > 1 ? 's' : ''} to schedule
            </span>
            <span style={{ fontSize: 13, color: '#b98800', marginLeft: 'auto' }}>Open →</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#e9f7ef', border: '1px solid #b7e4c7', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#1b6b3a' }}>
              ✓ All caught up — add something to schedule
            </span>
            <span style={{ fontSize: 13, color: '#2d8f56', marginLeft: 'auto' }}>Open →</span>
          </div>
        )}
      </Link>

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
            if (isPast) return <div key={ds} style={{ minHeight: 74 }} />

            const evs = eventsOn(ds)
            const isToday = ds === todayStr
            const isSel = ds === selected
            const firstOfMonth = date.getDate() === 1
            return (
              <div key={ds} onClick={() => setSelected(ds)}
                style={{
                  minHeight: 74, borderRadius: 8, padding: 5, cursor: 'pointer', fontSize: 11,
                  background: isSel ? '#eef0ff' : '#fafafa',
                  border: isToday ? '2px solid #3b45c4' : '1px solid #f0f0f0',
                }}>
                <div style={{ fontSize: 12, color: isToday ? '#3b45c4' : '#666', fontWeight: isToday ? 600 : 400, textAlign: 'right' }}>
                  {firstOfMonth ? date.toLocaleString('default', { month: 'short' }) + ' ' : ''}{date.getDate()}
                </div>
                {evs.slice(0, 3).map((e) => {
                  const t = typeOf(e.type_id)
                  return (
                    <div key={e.id} onClick={(ev) => { ev.stopPropagation(); setEditing(e) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t?.color || '#bbb', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#333' }}>{e.title}</span>
                    </div>
                  )
                })}
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
              <select value={newType} onChange={(e) => setNewType(e.target.value)}
                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}>
                <option value="">Type…</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={addEvent} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        )}
      </section>

      {editing && (
        <div onClick={() => setEditing(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, padding: 20, width: 360, maxWidth: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>Edit event</h3>

            <label style={{ fontSize: 12, color: '#888' }}>Title</label>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />

            <label style={{ fontSize: 12, color: '#888' }}>Start date</label>
            <input type="date" value={editing.scheduled_date ?? ''} onChange={(e) => setEditing({ ...editing, scheduled_date: e.target.value })}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />

            <label style={{ fontSize: 12, color: '#888' }}>End date (optional)</label>
            <input type="date" value={editing.end_date ?? ''} onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />

            <label style={{ fontSize: 12, color: '#888' }}>Type</label>
            <select value={editing.type_id ?? ''} onChange={(e) => setEditing({ ...editing, type_id: e.target.value || null })}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }}>
              <option value="">No type</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveEdit} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Save</button>
              <button onClick={() => deleteEvent(editing.id)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #f0c0c0', background: '#fff', color: '#c5221f', fontSize: 14, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
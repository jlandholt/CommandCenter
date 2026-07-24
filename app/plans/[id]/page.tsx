'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

type Plan = { id: string; title: string }
type Action = { id: string; heading: string }
type Item = { id: string; section_id: string; label: string; checked: boolean }

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [actions, setActions] = useState<Action[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [newAction, setNewAction] = useState('')
  const [newItem, setNewItem] = useState<Record<string, string>>({})

  async function load() {
    const { data: p } = await supabase.from('plans').select('*').eq('id', id).single()
    setPlan(p)
    const { data: a } = await supabase.from('plan_sections').select('id,heading').eq('plan_id', id).order('position')
    setActions(a ?? [])
    const ids = (a ?? []).map((x) => x.id)
    if (ids.length) {
      const { data: it } = await supabase.from('action_items').select('*').in('section_id', ids).order('position')
      setItems(it ?? [])
    } else {
      setItems([])
    }
  }
  useEffect(() => { if (id) load() }, [id])

  async function addAction() {
    if (!newAction.trim()) return
    await supabase.from('plan_sections').insert({ plan_id: id, heading: newAction })
    setNewAction('')
    load()
  }

  async function addItem(sectionId: string) {
    const label = (newItem[sectionId] || '').trim()
    if (!label) return
    await supabase.from('action_items').insert({ section_id: sectionId, label })
    setNewItem((n) => ({ ...n, [sectionId]: '' }))
    load()
  }

  async function toggleItem(item: Item) {
    setItems((list) => list.map((x) => (x.id === item.id ? { ...x, checked: !x.checked } : x)))
    await supabase.from('action_items').update({ checked: !item.checked }).eq('id', item.id)
  }

  if (!plan) return <main style={{ padding: 24 }}>Loading…</main>

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <Link href="/plans" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Plans</Link>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '8px 0 24px' }}>{plan.title}</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: '4px 16px' }}>
        {actions.map((a) => {
          const mine = items.filter((i) => i.section_id === a.id)
          const done = mine.filter((i) => i.checked).length
          return (
            <div key={a.id} style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}>
              <div onClick={() => setOpen((o) => ({ ...o, [a.id]: !o[a.id] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span style={{ color: '#999' }}>{open[a.id] ? '▾' : '▸'}</span>
                <span style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>{a.heading}</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>{done} of {mine.length}</span>
              </div>

              {open[a.id] && (
                <div style={{ padding: '8px 0 4px 24px' }}>
                  {mine.map((i) => (
                    <div key={i.id} onClick={() => toggleItem(i)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 14,
                        color: i.checked ? '#aaa' : '#222', textDecoration: i.checked ? 'line-through' : 'none' }}>
                      <span>{i.checked ? '☑' : '☐'}</span>
                      {i.label}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <input value={newItem[a.id] || ''} onChange={(e) => setNewItem((n) => ({ ...n, [a.id]: e.target.value }))}
                      placeholder="Add item"
                      style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />
                    <button onClick={() => addItem(a.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div style={{ display: 'flex', gap: 8, padding: '14px 0' }}>
          <input value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="Add an action (e.g. Shopping @ Costco)"
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <button onClick={addAction} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
        </div>
      </section>
    </main>
  )
}
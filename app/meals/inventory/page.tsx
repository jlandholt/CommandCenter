'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import MealsNav from '../MealsNav'

type Inv = {
  id: string
  name: string
  location: string | null
  in_stock: boolean
  force_to_list: boolean
}

export default function InventoryPage() {
  const [items, setItems] = useState<Inv[]>([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  async function load() {
    const { data } = await supabase.from('inventory').select('*').order('location')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function addItem() {
    if (!name.trim()) return
    await supabase.from('inventory').insert({ name, location: location || null })
    setName(''); setLocation('')
    load()
  }

  async function toggle(id: string, field: 'in_stock' | 'force_to_list', value: boolean) {
    await supabase.from('inventory').update({ [field]: !value }).eq('id', id)
    load()
  }

  // group by location
  const groups: Record<string, Inv[]> = {}
  for (const it of items) {
    const key = it.location || 'Other'
    ;(groups[key] ||= []).push(it)
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
     <MealsNav />
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Inventory</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item (e.g. olive oil)"
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (e.g. Pantry cabinet)"
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <button onClick={addItem} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
        </div>
      </section>

      {Object.keys(groups).length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>No items yet.</p>}
      {Object.entries(groups).map(([loc, list]) => (
        <section key={loc} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>{loc}</h2>
          {list.map((it) => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
              <span style={{ flex: 1, fontSize: 14 }}>{it.name}</span>

              <button onClick={() => toggle(it.id, 'in_stock', it.in_stock)}
                style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: it.in_stock ? '#e6f4ea' : '#fde8e8',
                  color: it.in_stock ? '#137333' : '#c5221f' }}>
                {it.in_stock ? 'In stock' : 'Out'}
              </button>

              <button onClick={() => toggle(it.id, 'force_to_list', it.force_to_list)}
                style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                  border: '1px solid ' + (it.force_to_list ? '#3b45c4' : '#ddd'),
                  background: it.force_to_list ? '#eef0ff' : '#fff',
                  color: it.force_to_list ? '#3b45c4' : '#888' }}>
                {it.force_to_list ? 'On list' : 'Add to list'}
              </button>
            </div>
          ))}
        </section>
      ))}
    </main>
  )
}
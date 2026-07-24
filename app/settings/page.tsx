'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type ItemType = { id: string; name: string; color: string; position: number }

export default function SettingsPage() {
  const [types, setTypes] = useState<ItemType[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('#378add')

  async function load() {
    const { data } = await supabase.from('item_types').select('*').order('position')
    setTypes(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function addType() {
    if (!name.trim()) return
    const nextPos = types.length ? Math.max(...types.map((t) => t.position)) + 1 : 1
    await supabase.from('item_types').insert({ name, color, position: nextPos })
    setName(''); setColor('#378add')
    load()
  }

  async function deleteType(id: string) {
    if (!confirm('Delete this type? Events using it will just lose their label.')) return
    await supabase.from('item_types').delete().eq('id', id)
    load()
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Calendar types</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        {types.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>No types yet.</p>}
        {types.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14 }}>{t.name}</span>
            <button onClick={() => deleteType(t.id)}
              style={{ border: 'none', background: 'none', color: '#c5221f', fontSize: 13, cursor: 'pointer' }}>Delete</button>
          </div>
        ))}
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Add a type</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
            style={{ width: 40, height: 38, border: '1px solid #ddd', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type name (e.g. Work trip)"
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <button onClick={addType} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
        </div>
      </section>
    </main>
  )
}
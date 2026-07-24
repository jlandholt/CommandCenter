'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Garment = { id: string; name: string; photo_url: string | null; category: string | null }
type Trip = { id: string; title: string }
type Packed = { trip_id: string; wardrobe_id: string; packed: boolean }

export default function PackingPage() {
  const [garments, setGarments] = useState<Garment[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [packed, setPacked] = useState<Packed[]>([])
  const [activeTrip, setActiveTrip] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newTrip, setNewTrip] = useState('')

  async function load() {
    const { data: g } = await supabase.from('wardrobe').select('*').order('created_at')
    setGarments(g ?? [])
    const { data: t } = await supabase.from('trips').select('id,title').order('created_at')
    setTrips(t ?? [])
    if (!activeTrip && t && t.length) setActiveTrip(t[0].id)
    const { data: p } = await supabase.from('trip_wardrobe').select('*')
    setPacked(p ?? [])
  }
  useEffect(() => { load() }, [])

  async function addGarment(file: File | null) {
    if (!name.trim()) { alert('Give the item a name first'); return }
   setUploading(true)
    let photoUrl: string | null = null
    if (file) {
      const path = `${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('wardrobe').upload(path, file)
      if (upErr) { alert(upErr.message); setUploading(false); return }
      photoUrl = supabase.storage.from('wardrobe').getPublicUrl(path).data.publicUrl
    }
    await supabase.from('wardrobe').insert({ name, category: category || null, photo_url: photoUrl })
    setName(''); setCategory(''); setUploading(false)
    load()
  }

  async function addTrip() {
    if (!newTrip.trim()) return
    const { data } = await supabase.from('trips').insert({ title: newTrip }).select().single()
    setNewTrip('')
    await load()
    if (data) setActiveTrip(data.id)
  }

  function isPacked(garmentId: string) {
    return packed.some((p) => p.trip_id === activeTrip && p.wardrobe_id === garmentId && p.packed)
  }

  async function togglePack(garmentId: string) {
    if (!activeTrip) { alert('Make or pick a trip first'); return }
    const existing = packed.find((p) => p.trip_id === activeTrip && p.wardrobe_id === garmentId)
    if (existing) {
      await supabase.from('trip_wardrobe').update({ packed: !existing.packed })
        .eq('trip_id', activeTrip).eq('wardrobe_id', garmentId)
    } else {
      await supabase.from('trip_wardrobe').insert({ trip_id: activeTrip, wardrobe_id: garmentId, packed: true })
    }
    load()
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>Packing</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#666' }}>Trip:</span>
          {trips.map((t) => (
            <button key={t.id} onClick={() => setActiveTrip(t.id)}
              style={{ padding: '5px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                border: t.id === activeTrip ? '1px solid #111' : '1px solid #ddd',
                background: t.id === activeTrip ? '#111' : '#fff',
                color: t.id === activeTrip ? '#fff' : '#333' }}>
              {t.title}
            </button>
          ))}
          <input value={newTrip} onChange={(e) => setNewTrip(e.target.value)} placeholder="New trip"
            style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 120 }} />
          <button onClick={addTrip} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer' }}>+</button>
        </div>
      </section>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Add to wardrobe</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name (e.g. blue linen shirt)"
            style={{ flex: 1, minWidth: 180, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. tops)"
            style={{ width: 140, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <label style={{ padding: '8px 14px', borderRadius: 8, background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
            {uploading ? 'Uploading…' : 'Photo + add'}
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) addGarment(f) }} />
          </label>
          <button onClick={() => addGarment(null)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#333', fontSize: 14, cursor: 'pointer' }}>
            Add without photo
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Wardrobe {activeTrip && '— tap to pack'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {garments.map((g) => (
            <div key={g.id} onClick={() => togglePack(g.id)}
              style={{ border: isPacked(g.id) ? '2px solid #137333' : '1px solid #eee', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
              {g.photo_url
                ? <img src={g.photo_url} alt={g.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                : <div style={{ height: 140, background: '#f5f5f5' }} />}
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{g.category}</div>
                {isPacked(g.id) && <div style={{ fontSize: 11, color: '#137333', marginTop: 2 }}>✓ Packed</div>}
              </div>
            </div>
          ))}
        </div>
        {garments.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>No clothes yet — add one above.</p>}
      </section>
    </main>
  )
}
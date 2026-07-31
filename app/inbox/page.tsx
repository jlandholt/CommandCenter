'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type InboxItem = {
  id: string
  text: string
  item_type: string | null
  detail: string | null
  resolved: boolean
}
type Category = { id: string; name: string; parent_id: string | null }

const TYPE_LABELS: Record<string, string> = {
  chore: 'Chore',
  project: 'Project',
  trip: 'Trip',
  shopping: 'Shopping',
  talk_to: 'Talk to someone',
}

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Seasonal']
const STORES = ['Costco', 'Target', 'Discount Builders']

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [text, setText] = useState('')
  const [type, setType] = useState('')
  const [detail, setDetail] = useState('')

  async function load() {
    const { data } = await supabase.from('inbox_items').select('*').eq('resolved', false).order('created_at', { ascending: false })
    setItems(data ?? [])
    const { data: c } = await supabase.from('plan_categories').select('*')
    setCategories(c ?? [])
  }
  useEffect(() => { load() }, [])

  async function addItem() {
    if (!text.trim()) return
    await supabase.from('inbox_items').insert({ text, item_type: type || null, detail: detail || null })
    setText(''); setType(''); setDetail('')
    load()
  }

  async function deleteItem(id: string) {
    await supabase.from('inbox_items').delete().eq('id', id)
    load()
  }

  async function updateItemType(id: string, item_type: string) {
    await supabase.from('inbox_items').update({ item_type: item_type || null, detail: null }).eq('id', id)
    load()
  }

  async function updateItemDetail(id: string, detail: string) {
    await supabase.from('inbox_items').update({ detail: detail || null }).eq('id', id)
    load()
  }

  function detailOptions(itemType: string | null) {
    if (itemType === 'chore') return FREQUENCIES
    if (itemType === 'shopping') return STORES
    return null
  }

  function categoryByName(name: string) {
    return categories.find((c) => c.name === name)
  }

  async function ensureScheduled(categoryId: string, storeName: string) {
    const { data: existing } = await supabase
      .from('items').select('id')
      .eq('source_category_id', categoryId).eq('kind', 'to_schedule').limit(1)
    if (!existing || existing.length === 0) {
      await supabase.from('items').insert({ title: storeName, kind: 'to_schedule', source_category_id: categoryId })
    }
  }

  async function sendItem(item: InboxItem) {
    if (!item.item_type) { alert('Pick a type first'); return }

    if (item.item_type === 'chore') {
      const chores = categoryByName('Chores')
      if (!chores) { alert("No 'Chores' category found"); return }
      await supabase.from('todos').insert({ category_id: chores.id, label: item.text, frequency: item.detail || null })
    }

    if (item.item_type === 'shopping') {
      if (!item.detail) { alert('Pick a store first'); return }
      const store = categoryByName(item.detail)
      if (!store) { alert(`No '${item.detail}' category found`); return }
      await supabase.from('todos').insert({ category_id: store.id, label: item.text })
      await ensureScheduled(store.id, store.name)
    }

    if (item.item_type === 'project') {
      await supabase.from('plans').insert({ title: item.text })
    }

    if (item.item_type === 'trip') {
      await supabase.from('items').insert({ title: item.text, kind: 'to_schedule' })
      // full Trip-type automation (packing list + auto to-do) comes in a later step
    }

    if (item.item_type === 'talk_to') {
      if (!item.detail) { alert('Add who this is about first'); return }
      await supabase.from('meeting_notes').insert({ person: item.detail, note: item.text })
    }

    await supabase.from('inbox_items').update({ resolved: true }).eq('id', item.id)
    load()
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Inbox</h1>
      <p style={{ fontSize: 13, color: '#888', marginTop: 0, marginBottom: 20 }}>Jot it down now, sort it later.</p>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !type) addItem() }}
          placeholder="Quick thought…"
          style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, fontSize: 15, marginBottom: 10, boxSizing: 'border-box' }} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={type} onChange={(e) => { setType(e.target.value); setDetail('') }}
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 13, color: '#666' }}>
            <option value="">Type (optional)</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {type === 'chore' && (
            <select value={detail} onChange={(e) => setDetail(e.target.value)}
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 13, color: '#666' }}>
              <option value="">Frequency</option>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          {type === 'shopping' && (
            <select value={detail} onChange={(e) => setDetail(e.target.value)}
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 13, color: '#666' }}>
              <option value="">Store</option>
              {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {type === 'talk_to' && (
            <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Who?"
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 13, width: 140 }} />
          )}

          <button onClick={addItem}
            style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      </section>

      <section>
        {items.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>Inbox is empty.</p>}
        {items.map((i) => {
          const opts = detailOptions(i.item_type)
          return (
            <div key={i.id} style={{ border: '1px solid #eee', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 14 }}>{i.text}</span>
                <button onClick={() => deleteItem(i.id)}
                  style={{ border: 'none', background: 'none', color: '#c5221f', fontSize: 13, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                <select value={i.item_type ?? ''} onChange={(e) => updateItemType(i.id, e.target.value)}
                  style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 6, color: '#666' }}>
                  <option value="">Type…</option>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>

                {opts && (
                  <select value={i.detail ?? ''} onChange={(e) => updateItemDetail(i.id, e.target.value)}
                    style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 6, color: '#666' }}>
                    <option value="">{i.item_type === 'chore' ? 'Frequency' : 'Store'}</option>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {i.item_type === 'talk_to' && (
                  <input defaultValue={i.detail ?? ''} onBlur={(e) => updateItemDetail(i.id, e.target.value)} placeholder="Who?"
                    style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 6, width: 100 }} />
                )}

                {i.item_type && (
                  <button onClick={() => sendItem(i)}
                    style={{ marginLeft: 'auto', fontSize: 12, padding: '5px 12px', borderRadius: 999, border: 'none', background: '#111', color: '#fff', cursor: 'pointer' }}>
                    Send →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}
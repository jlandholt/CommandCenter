'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Category = { id: string; name: string; parent_id: string | null; position: number }
type Todo = { id: string; category_id: string; label: string; checked: boolean; frequency: string | null }

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Seasonal']

export default function TodosPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newFreq, setNewFreq] = useState('')

  async function load() {
    const { data: c } = await supabase.from('plan_categories').select('*').order('position')
    setCategories(c ?? [])
    const { data: t } = await supabase.from('todos').select('*').order('position')
    setTodos(t ?? [])
  }
  useEffect(() => { load() }, [])

  // flatten Chores + the Shopping List sub-categories into one tab row
  const chores = categories.find((c) => c.name === 'Chores')
  const shoppingParent = categories.find((c) => c.name === 'Shopping List')
  const stores = categories.filter((c) => c.parent_id === shoppingParent?.id)
  const tabs = [chores, ...stores].filter(Boolean) as Category[]

  useEffect(() => {
    if (!activeCat && tabs.length) setActiveCat(tabs[0].id)
  }, [tabs, activeCat])

  const isChoresTab = activeCat === chores?.id
  const activeTodos = todos.filter((t) => t.category_id === activeCat)

  // ensure the store shows up on the Calendar's "to schedule" list
  async function ensureScheduled(categoryId: string, storeName: string) {
    const { data: existing } = await supabase
      .from('items')
      .select('id')
      .eq('source_category_id', categoryId)
      .eq('kind', 'to_schedule')
      .limit(1)
    if (!existing || existing.length === 0) {
      await supabase.from('items').insert({
        title: storeName, kind: 'to_schedule', source_category_id: categoryId,
      })
    }
  }

  async function addTodo() {
    if (!newLabel.trim() || !activeCat) return
    await supabase.from('todos').insert({
      category_id: activeCat, label: newLabel, frequency: isChoresTab ? (newFreq || null) : null,
    })
    setNewLabel(''); setNewFreq('')

    if (!isChoresTab) {
      const cat = categories.find((c) => c.id === activeCat)
      if (cat) await ensureScheduled(cat.id, cat.name)
    }
    load()
  }

  async function toggleTodo(t: Todo) {
    await supabase.from('todos').update({ checked: !t.checked }).eq('id', t.id)
    load()
  }

  async function deleteTodo(id: string) {
    await supabase.from('todos').delete().eq('id', id)
    load()
  }

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>To-dos</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map((c) => (
          <button key={c.id} onClick={() => setActiveCat(c.id)}
            style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
              border: c.id === activeCat ? '1px solid #111' : '1px solid #ddd',
              background: c.id === activeCat ? '#111' : '#fff',
              color: c.id === activeCat ? '#fff' : '#333' }}>
            {c.name}
          </button>
        ))}
      </div>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        {activeTodos.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>Nothing here yet.</p>}
        {activeTodos.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: '1px solid #f0f0f0' }}>
            <span onClick={() => toggleTodo(t)} style={{ cursor: 'pointer', fontSize: 16 }}>{t.checked ? '☑' : '☐'}</span>
            <span style={{ flex: 1, fontSize: 14, color: t.checked ? '#aaa' : '#222', textDecoration: t.checked ? 'line-through' : 'none' }}>
              {t.label}
            </span>
            {t.frequency && (
              <span style={{ fontSize: 11, background: '#eef0ff', color: '#3b45c4', padding: '2px 8px', borderRadius: 999 }}>
                {t.frequency}
              </span>
            )}
            <button onClick={() => deleteTodo(t.id)}
              style={{ border: 'none', background: 'none', color: '#c5221f', fontSize: 13, cursor: 'pointer' }}>✕</button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTodo() }}
            placeholder={isChoresTab ? 'New chore' : 'Item to buy'}
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          {isChoresTab && (
            <select value={newFreq} onChange={(e) => setNewFreq(e.target.value)}
              style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}>
              <option value="">Frequency</option>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          <button onClick={addTodo} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
        </div>
      </section>

      {!isChoresTab && activeTodos.length > 0 && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 10 }}>
          This store is on your calendar's "to schedule" list — set a date whenever you're ready to go.
        </p>
      )}
    </main>
  )
}
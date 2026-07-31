'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Category = { id: string; name: string; parent_id: string | null; position: number }

export default function NewPlanPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    supabase.from('plan_categories').select('*').order('position').then(({ data }) => setCategories(data ?? []))
  }, [])

  const topLevel = categories.filter((c) => !c.parent_id)
  function childrenOf(id: string) {
    return categories.filter((c) => c.parent_id === id)
  }

  async function addPlan() {
    if (!title.trim()) return
    await supabase.from('plans').insert({ title, category_id: categoryId || null })
    router.push('/plans')
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <Link href="/plans" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Plans</Link>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '8px 0 24px' }}>New plan</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        <label style={{ fontSize: 12, color: '#888' }}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Plan title"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') addPlan() }}
          style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginTop: 4, marginBottom: 14, boxSizing: 'border-box' }} />

        <label style={{ fontSize: 12, color: '#888' }}>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginTop: 4, marginBottom: 18, boxSizing: 'border-box' }}>
          <option value="">No category</option>
          {topLevel.map((c) => (
            childrenOf(c.id).length > 0 ? (
              <optgroup key={c.id} label={c.name}>
                {childrenOf(c.id).map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </optgroup>
            ) : (
              <option key={c.id} value={c.id}>{c.name}</option>
            )
          ))}
        </select>

        <button onClick={addPlan}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 15, cursor: 'pointer' }}>
          Create plan
        </button>
      </section>
    </main>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

type Plan = { id: string; title: string; category_id: string | null }
type Category = { id: string; name: string; parent_id: string | null; position: number }

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newPlan, setNewPlan] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  async function load() {
    const { data: p } = await supabase.from('plans').select('*').order('created_at')
    setPlans(p ?? [])
    const { data: c } = await supabase.from('plan_categories').select('*').order('position')
    setCategories(c ?? [])
  }
  useEffect(() => { load() }, [])

  async function addPlan() {
    if (!newPlan.trim()) return
    await supabase.from('plans').insert({ title: newPlan, category_id: newCategory || null })
    setNewPlan(''); setNewCategory('')
    load()
  }

  async function renamePlan(id: string, title: string) {
    if (!title.trim()) return
    await supabase.from('plans').update({ title }).eq('id', id)
    setEditingId(null)
    load()
  }

  async function recategorize(id: string, category_id: string) {
    await supabase.from('plans').update({ category_id: category_id || null }).eq('id', id)
    load()
  }

  async function deletePlan(id: string) {
    if (!confirm('Delete this plan and everything in it?')) return
    await supabase.from('plans').delete().eq('id', id)
    load()
  }

  const topLevel = categories.filter((c) => !c.parent_id)
  function childrenOf(id: string) {
    return categories.filter((c) => c.parent_id === id)
  }
  function plansIn(categoryId: string | null) {
    return plans.filter((p) => p.category_id === categoryId)
  }
  const uncategorized = plans.filter((p) => !p.category_id)

  function PlanRow({ p }: { p: Plan }) {
    const isEditing = editingId === p.id
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
        {isEditing ? (
          <input
            defaultValue={p.title}
            autoFocus
            onBlur={(e) => renamePlan(p.id, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}
          />
        ) : (
          <Link href={`/plans/${p.id}`} style={{ flex: 1, fontSize: 15, color: '#111', textDecoration: 'none' }}>
            {p.title} →
          </Link>
        )}

        <select value={p.category_id ?? ''} onChange={(e) => recategorize(p.id, e.target.value)}
          style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 6, color: '#666' }}>
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

        <button onClick={() => setEditingId(isEditing ? null : p.id)}
          style={{ border: 'none', background: 'none', color: '#3b45c4', fontSize: 13, cursor: 'pointer' }}>
          {isEditing ? 'Done' : 'Rename'}
        </button>
        <button onClick={() => deletePlan(p.id)}
          style={{ border: 'none', background: 'none', color: '#c5221f', fontSize: 13, cursor: 'pointer' }}>✕</button>
      </div>
    )
  }

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Plans</h1>

      {topLevel.map((cat) => {
        const kids = childrenOf(cat.id)
        const directPlans = plansIn(cat.id)
        const hasAnything = directPlans.length > 0 || kids.some((k) => plansIn(k.id).length > 0)

        return (
          <section key={cat.id} style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#444', marginBottom: 6 }}>{cat.name}</h2>
            <div style={{ border: '1px solid #eee', borderRadius: 12, padding: '2px 16px' }}>
              {!hasAnything && <p style={{ color: '#bbb', fontSize: 13, padding: '10px 0' }}>Nothing here yet.</p>}

              {directPlans.map((p) => <PlanRow key={p.id} p={p} />)}

              {kids.map((sub) => {
                const subPlans = plansIn(sub.id)
                if (subPlans.length === 0) return null
                return (
                  <div key={sub.id} style={{ paddingTop: 4 }}>
                    <div style={{ fontSize: 12, color: '#999', paddingTop: 8 }}>{sub.name}</div>
                    {subPlans.map((p) => <PlanRow key={p.id} p={p} />)}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {uncategorized.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#444', marginBottom: 6 }}>Uncategorized</h2>
          <div style={{ border: '1px solid #eee', borderRadius: 12, padding: '2px 16px' }}>
            {uncategorized.map((p) => <PlanRow key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <Link href="/plans/new" style={{ textDecoration: 'none' }}>
        <div style={{ marginTop: 24, padding: '14px 16px', border: '1px dashed #ccc', borderRadius: 12, textAlign: 'center', fontSize: 14, color: '#666' }}>
          + New plan
        </div>
      </Link>
    </main>
  )
}
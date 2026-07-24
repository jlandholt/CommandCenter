'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

type Plan = { id: string; title: string }

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [newPlan, setNewPlan] = useState('')

  async function load() {
    const { data } = await supabase.from('plans').select('*').order('created_at')
    setPlans(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function addPlan() {
    if (!newPlan.trim()) return
    await supabase.from('plans').insert({ title: newPlan })
    setNewPlan('')
    load()
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Plans</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        {plans.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>No plans yet.</p>}
        {plans.map((p) => (
          <Link key={p.id} href={`/plans/${p.id}`}
            style={{ display: 'block', padding: '12px 0', borderTop: '1px solid #f0f0f0', fontSize: 15, color: '#111', textDecoration: 'none' }}>
            {p.title} →
          </Link>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input value={newPlan} onChange={(e) => setNewPlan(e.target.value)} placeholder="New plan"
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          <button onClick={addPlan} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>Add</button>
        </div>
      </section>
    </main>
  )
}
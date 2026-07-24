'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import MealsNav from './MealsNav'

type Ing = { name: string; amount: string; kind: 'fresh' | 'pantry' }
type Recipe = { id: string; title: string; directions: string | null }

export default function MealsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [title, setTitle] = useState('')
  const [directions, setDirections] = useState('')
  const [ings, setIngs] = useState<Ing[]>([{ name: '', amount: '', kind: 'fresh' }])

  async function load() {
    const { data } = await supabase.from('recipes').select('*').order('created_at')
    setRecipes(data ?? [])
  }
  useEffect(() => { load() }, [])

  function updateIng(idx: number, field: keyof Ing, value: string) {
    const copy = [...ings]
    ;(copy[idx] as any)[field] = value
    setIngs(copy)
  }
  function toggleKind(idx: number) {
    const copy = [...ings]
    copy[idx].kind = copy[idx].kind === 'fresh' ? 'pantry' : 'fresh'
    setIngs(copy)
  }
  function addRow() {
    setIngs([...ings, { name: '', amount: '', kind: 'fresh' }])
  }

  async function saveRecipe() {
    if (!title.trim()) return
    const { data: recipe } = await supabase
      .from('recipes')
      .insert({ title, directions })
      .select()
      .single()
    if (recipe) {
      const rows = ings
        .filter((i) => i.name.trim())
        .map((i) => ({ recipe_id: recipe.id, name: i.name, amount: i.amount, kind: i.kind }))
      if (rows.length) await supabase.from('ingredients').insert(rows)
    }
    setTitle(''); setDirections(''); setIngs([{ name: '', amount: '', kind: 'fresh' }])
    load()
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <MealsNav />
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Meals</h1>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>New recipe</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recipe name"
          style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, marginBottom: 12, fontSize: 14, boxSizing: 'border-box' }} />

        <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>Ingredients — tap the tag to flip fresh/pantry</p>
        {ings.map((ing, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input value={ing.name} onChange={(e) => updateIng(idx, 'name', e.target.value)} placeholder="Ingredient"
              style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            <input value={ing.amount} onChange={(e) => updateIng(idx, 'amount', e.target.value)} placeholder="Amount"
              style={{ width: 90, padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            <button onClick={() => toggleKind(idx)}
              style={{ width: 80, borderRadius: 999, border: 'none', fontSize: 12, cursor: 'pointer',
                background: ing.kind === 'fresh' ? '#e6f4ea' : '#eef0ff',
                color: ing.kind === 'fresh' ? '#137333' : '#3b45c4' }}>
              {ing.kind}
            </button>
          </div>
        ))}
        <button onClick={addRow} style={{ fontSize: 13, background: 'none', border: 'none', color: '#3b45c4', cursor: 'pointer', padding: '6px 0' }}>+ add ingredient</button>

        <textarea value={directions} onChange={(e) => setDirections(e.target.value)} placeholder="Directions"
          rows={4} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, marginTop: 12, fontSize: 14, boxSizing: 'border-box' }} />

        <div style={{ marginTop: 12 }}>
          <button onClick={saveRecipe} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Save recipe
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Your recipes</h2>
        {recipes.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>No recipes yet.</p>}
        {recipes.map((r) => (
          <div key={r.id} style={{ padding: '10px 0', borderTop: '1px solid #f0f0f0', fontSize: 14 }}>{r.title}</div>
        ))}
      </section>
    </main>
  )
}
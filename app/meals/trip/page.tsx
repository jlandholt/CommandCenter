'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import MealsNav from '../MealsNav'

type Recipe = { id: string; title: string }
type Ing = { name: string; amount: string | null; kind: string; recipe_id: string }
type Inv = { name: string; in_stock: boolean; force_to_list: boolean; location: string | null }

export default function TripPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [picked, setPicked] = useState<string[]>([])
  const [ings, setIngs] = useState<Ing[]>([])
  const [inv, setInv] = useState<Inv[]>([])

  useEffect(() => {
    supabase.from('recipes').select('id,title').then(({ data }) => setRecipes(data ?? []))
    supabase.from('ingredients').select('name,amount,kind,recipe_id').then(({ data }) => setIngs(data ?? []))
    supabase.from('inventory').select('name,in_stock,force_to_list,location').then(({ data }) => setInv(data ?? []))
  }, [])

  function togglePick(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  // ingredients from picked recipes
  const chosen = ings.filter((i) => picked.includes(i.recipe_id))

  function invFor(name: string) {
    return inv.find((v) => v.name.toLowerCase() === name.toLowerCase())
  }

  // decide what goes on the list
  const toBuy: Ing[] = []
  const alreadyHave: Ing[] = []
  for (const ing of chosen) {
    if (ing.kind === 'fresh') { toBuy.push(ing); continue }
    const match = invFor(ing.name)
    if (!match) { toBuy.push(ing); continue }              // not tracked → buy it
    if (match.force_to_list || !match.in_stock) toBuy.push(ing)
    else alreadyHave.push(ing)
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <MealsNav />
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Shopping trip</h1>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>Pick the meals you&apos;re cooking.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {recipes.map((r) => (
          <button key={r.id} onClick={() => togglePick(r.id)}
            style={{ padding: '6px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
              border: picked.includes(r.id) ? '1px solid #111' : '1px solid #ddd',
              background: picked.includes(r.id) ? '#111' : '#fff',
              color: picked.includes(r.id) ? '#fff' : '#333' }}>
            {r.title}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16 }}>
        <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Shopping list</h2>
          {toBuy.length === 0 && <p style={{ color: '#aaa', fontSize: 14 }}>Pick some meals above.</p>}
          {toBuy.map((i, n) => (
            <div key={n} style={{ display: 'flex', padding: '8px 0', borderTop: '1px solid #f0f0f0', fontSize: 14 }}>
              <span style={{ flex: 1 }}>{i.name}</span>
              <span style={{ color: '#888' }}>{i.amount}</span>
            </div>
          ))}
        </section>

        <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Already have</h2>
          <p style={{ fontSize: 12, color: '#888', marginTop: 0 }}>Pantry items you&apos;re stocked on</p>
          {alreadyHave.map((i, n) => (
            <div key={n} style={{ display: 'flex', padding: '8px 0', borderTop: '1px solid #f0f0f0', fontSize: 14, color: '#666' }}>
              <span style={{ flex: 1 }}>{i.name}</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>{invFor(i.name)?.location}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
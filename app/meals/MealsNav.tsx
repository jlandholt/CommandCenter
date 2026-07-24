import Link from 'next/link'

export default function MealsNav() {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 14 }}>
      <Link href="/meals">Recipes</Link>
      <Link href="/meals/trip">Trip</Link>
      <Link href="/meals/inventory">Inventory</Link>
    </div>
  )
}
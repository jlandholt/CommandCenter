'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const links = [
  { href: '/', label: 'Calendar', icon: '📅' },
  { href: '/meals', label: 'Meals', icon: '🍽️' },
  { href: '/plans', label: 'Plans', icon: '📝' },
  { href: '/packing', label: 'Packing', icon: '🧳' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Nav() {
  const path = usePathname()
  const router = useRouter()

  function active(href: string) {
    return href === '/' ? path === '/' : path.startsWith(href)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="side-nav" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 16, fontWeight: 600, padding: '4px 12px 20px' }}>Home</div>
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 8, marginBottom: 4, textDecoration: 'none', fontSize: 14,
              background: active(l.href) ? '#f0f0f0' : 'transparent',
              color: active(l.href) ? '#111' : '#555',
              fontWeight: active(l.href) ? 600 : 400,
            }}>
            <span style={{ fontSize: 18 }}>{l.icon}</span>
            {l.label}
          </Link>
        ))}
        <button onClick={signOut}
          style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            border: 'none', background: 'none', color: '#888', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ fontSize: 18 }}>↩</span> Sign out
        </button>
      </nav>

      {/* Phone bottom bar */}
      <nav className="bottom-nav">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              textDecoration: 'none', fontSize: 11,
              color: active(l.href) ? '#111' : '#999',
              fontWeight: active(l.href) ? 600 : 400,
            }}>
            <span style={{ fontSize: 20 }}>{l.icon}</span>
            {l.label}
          </Link>
        ))}
        <button onClick={signOut}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            border: 'none', background: 'none', color: '#999', fontSize: 11, cursor: 'pointer' }}>
          <span style={{ fontSize: 20 }}>↩</span> Out
        </button>
      </nav>
    </>
  )
}
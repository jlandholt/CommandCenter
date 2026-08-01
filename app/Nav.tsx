'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const allLinks = [
  { href: '/inbox', label: 'Inbox', icon: '📥' },
  { href: '/', label: 'Calendar', icon: '📅' },
  { href: '/todos', label: 'To-dos', icon: '✅' },
  { href: '/plans', label: 'Plans', icon: '📝' },
  { href: '/meals', label: 'Meals', icon: '🍽️' },
  { href: '/packing', label: 'Packing', icon: '🧳' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

const PRIMARY_HREFS = ['/inbox', '/', '/todos', '/plans']
const primary = allLinks.filter((l) => PRIMARY_HREFS.includes(l.href))
const overflow = allLinks.filter((l) => !PRIMARY_HREFS.includes(l.href))

export default function Nav() {
  const path = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  function active(href: string) {
    return href === '/' ? path === '/' : path.startsWith(href)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <nav className="side-nav">
        <div style={{ fontSize: 16, fontWeight: 600, padding: '4px 12px 20px' }}>Home</div>
        {allLinks.map((l) => (
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

      <nav className="bottom-nav">
        {primary.map((l) => (
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
        <button onClick={() => setMoreOpen(true)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            border: 'none', background: 'none', color: '#999', fontSize: 11, cursor: 'pointer' }}>
          <span style={{ fontSize: 20 }}>⋯</span> More
        </button>
      </nav>

      {moreOpen && (
        <div onClick={() => setMoreOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 50,
            display: 'flex', alignItems: 'flex-end' }}
          className="more-overlay">
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', width: '100%', borderRadius: '16px 16px 0 0', padding: '10px 8px calc(20px + env(safe-area-inset-bottom))' }}>
            {overflow.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMoreOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  textDecoration: 'none', fontSize: 15, color: '#222' }}>
                <span style={{ fontSize: 20 }}>{l.icon}</span>
                {l.label}
              </Link>
            ))}
            <button onClick={signOut}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', width: '100%',
                border: 'none', background: 'none', textAlign: 'left', fontSize: 15, color: '#888', cursor: 'pointer' }}>
              <span style={{ fontSize: 20 }}>↩</span> Sign out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
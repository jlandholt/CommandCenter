'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Calendar', icon: '📅' },
  { href: '/meals', label: 'Meals', icon: '🍽️' },
  { href: '/plans', label: 'Plans', icon: '📝' },
  { href: '/packing', label: 'Packing', icon: '🧳' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Nav() {
  const path = usePathname()
  function active(href: string) {
    return href === '/' ? path === '/' : path.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="side-nav">
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
      </nav>
    </>
  )
}

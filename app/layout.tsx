import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui' }}>
        <nav style={{ display: 'flex', gap: 18, padding: '14px 24px', borderBottom: '1px solid #eee', fontSize: 14 }}>
          <Link href="/">Calendar</Link>
          <Link href="/meals">Meals</Link>
          <Link href="/plans">Plans</Link>
          <Link href="/packing">Packing</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
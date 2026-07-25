'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Nav from './Nav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (ready && !signedIn && pathname !== '/login') {
      router.push('/login')
    }
  }, [ready, signedIn, pathname, router])

  const isLogin = pathname === '/login'

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui' }}>
        {!ready ? (
          <div style={{ padding: 40, color: '#888' }}>Loading…</div>
        ) : isLogin ? (
          children
        ) : signedIn ? (
          <>
            <Nav />
            <div className="page-content">{children}</div>
          </>
        ) : (
          <div style={{ padding: 40, color: '#888' }}>Redirecting to sign in…</div>
        )}

        <style>{`
          .side-nav {
            position: fixed; top: 0; left: 0; bottom: 0; width: 200px;
            border-right: 1px solid #eee; padding: 20px 12px; box-sizing: border-box;
          }
          .bottom-nav { display: none; }
          .page-content { margin-left: 200px; }

          @media (max-width: 700px) {
            .side-nav { display: none; }
            .page-content { margin-left: 0; padding-bottom: 90px; }
            .bottom-nav {
              display: flex; justify-content: space-around; align-items: center;
              position: fixed; left: 0; right: 0; bottom: 0;
              padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
              background: #fff; border-top: 1px solid #eee;
            }
          }
        `}</style>
      </body>
    </html>
  )
}
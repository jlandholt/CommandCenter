'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Nav from './Nav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => setLoadError(true), 8000)
    supabase.auth.getSession()
      .then(({ data }) => {
        clearTimeout(timeout)
        setSignedIn(!!data.session)
        setReady(true)
      })
      .catch(() => {
        clearTimeout(timeout)
        setLoadError(true)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session)
    })
    return () => { sub.subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  useEffect(() => {
    if (ready && !signedIn && pathname !== '/login') {
      router.push('/login')
    }
  }, [ready, signedIn, pathname, router])

  const isLogin = pathname === '/login'

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui' }}>
        {loadError ? (
          <div style={{ padding: 40, color: '#c5221f' }}>
            Couldn't reach the server. Check your connection and refresh.
          </div>
        ) : !ready ? (
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
            display: flex; flex-direction: column;
          }
          .bottom-nav { display: none; }
          .more-overlay { display: none; }
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
            .more-overlay { display: flex; }
          }
        `}</style>
      </body>
    </html>
  )
}
'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true); setError(''); setNote('')
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setBusy(false)
      if (error) { setError(error.message); return }
      router.push('/')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setBusy(false)
      if (error) { setError(error.message); return }
      if (data.session) {
        router.push('/')            // confirm-email is off → straight in
      } else {
        setNote('Account created. You can sign in now.')
        setMode('signin')
      }
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h1>

      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
        style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password"
        onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />

      {error && <p style={{ color: '#c5221f', fontSize: 13, marginTop: 0 }}>{error}</p>}
      {note && <p style={{ color: '#1b6b3a', fontSize: 13, marginTop: 0 }}>{note}</p>}

      <button onClick={submit} disabled={busy}
        style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 15, cursor: 'pointer' }}>
        {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>

      <button
        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNote('') }}
        style={{ width: '100%', marginTop: 12, padding: 8, border: 'none', background: 'none', color: '#3b45c4', fontSize: 13, cursor: 'pointer' }}>
        {mode === 'signin' ? "No account? Create one" : 'Have an account? Sign in'}
      </button>
    </main>
  )
}

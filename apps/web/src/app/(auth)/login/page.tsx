'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/hive'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-hornet-black flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-hornet-grid bg-grid opacity-40" />
      <div className="absolute inset-0 scanline-overlay" />

      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-hornet-gold/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-mono text-4xl font-bold tracking-[0.5em] text-hornet-gold gold-glow">
            H0RN3T
          </h1>
          <p className="mt-2 text-hornet-dim font-mono text-xs tracking-widest uppercase">
            Cybersecurity Intelligence Platform
          </p>
        </div>

        <div className="hornet-panel p-8 shadow-panel">
          <h2 className="font-mono text-lg font-bold text-hornet-text mb-6 tracking-wider">
            // AUTHENTICATE
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 rounded text-red-400 font-mono text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-hornet-dim uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="hornet-input w-full"
                placeholder="operator@hornet.io"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-hornet-dim uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="hornet-input w-full"
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full hornet-btn py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="font-mono tracking-widest">AUTHENTICATING...</span>
              ) : (
                <span className="font-mono tracking-widest">ENTER THE HIVE</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-xs text-hornet-dim">
            No account?{' '}
            <Link href="/register" className="text-hornet-gold hover:underline">
              Register
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center font-mono text-xs text-hornet-muted">
          &copy; {new Date().getFullYear()} H0RN3T. All rights reserved.
        </p>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: username },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-hornet-black flex items-center justify-center">
        <div className="hornet-panel p-8 max-w-md w-full mx-6 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="font-mono text-lg font-bold text-hornet-gold mb-3">
            REGISTRATION COMPLETE
          </h2>
          <p className="font-mono text-sm text-hornet-dim mb-6">
            Check your email to confirm your account, then{' '}
            <Link href="/login" className="text-hornet-gold hover:underline">sign in</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hornet-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-hornet-grid bg-grid opacity-40" />
      <div className="absolute inset-0 scanline-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-hornet-gold/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <h1 className="font-mono text-4xl font-bold tracking-[0.5em] text-hornet-gold gold-glow">
            H0RN3T
          </h1>
          <p className="mt-2 text-hornet-dim font-mono text-xs tracking-widest uppercase">
            Join the Network
          </p>
        </div>

        <div className="hornet-panel p-8 shadow-panel">
          <h2 className="font-mono text-lg font-bold text-hornet-text mb-6 tracking-wider">
            // REGISTER OPERATOR
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 rounded text-red-400 font-mono text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-hornet-dim uppercase tracking-wider mb-1.5">
                Operator Handle
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="hornet-input w-full"
                placeholder="operator_handle"
                required
                autoComplete="username"
              />
            </div>

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
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full hornet-btn py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="font-mono tracking-widest">REGISTERING...</span>
              ) : (
                <span className="font-mono tracking-widest">CREATE ACCOUNT</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-xs text-hornet-dim">
            Already registered?{' '}
            <Link href="/login" className="text-hornet-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

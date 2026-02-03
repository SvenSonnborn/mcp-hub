'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Github, Lock, Mail } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' })

const easing: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/dashboard'
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push(redirectTo)
      router.refresh()
      return
    }

    setMessage('Check your inbox to confirm your email address before signing in.')
    setLoading(false)
  }

  const handleGithub = async () => {
    setError(null)
    setMessage(null)
    setLoading(true)

    const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easing }}
      className={`${spaceGrotesk.className} min-h-screen bg-slate-950 text-slate-100`}
    >
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/30 blur-[140px]" />
          <div className="absolute right-[-10%] bottom-0 h-[360px] w-[360px] rounded-full bg-violet-500/20 blur-[140px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/60 to-slate-950" />
        </div>

        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
          <div className="mb-6 space-y-2">
            <p className="text-sm tracking-[0.3em] text-cyan-300 uppercase">MCP Hub</p>
            <h1 className="text-3xl font-semibold text-white">Create your account</h1>
            <p className="text-sm text-slate-400">Start discovering and deploying MCP servers.</p>
          </div>

          <button
            type="button"
            onClick={handleGithub}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-cyan-400/40 hover:bg-white/10"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Password</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-100">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-300"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </motion.main>
  )
}

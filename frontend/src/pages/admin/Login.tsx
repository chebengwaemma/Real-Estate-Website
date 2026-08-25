import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Loader2, Lock, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'

type Mode = 'signin' | 'forgot' | 'sent' | 'new-password'

export default function Login() {
  const { isAdmin, signInAdmin } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('new-password')
        setError(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (isAdmin && mode !== 'new-password') return <Navigate to="/admin" replace />

  const onSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await signInAdmin(email, password)
    setSubmitting(false)
    if (signInError) {
      setError(signInError)
      return
    }
    navigate('/admin')
  }

  const onForgot = async (e: FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet.')
      return
    }
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError('Enter your admin email.')
      return
    }
    setSubmitting(true)
    setError(null)
    const redirectTo = `${window.location.origin}/admin/login`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo })
    setSubmitting(false)
    if (resetError) {
      const msg = resetError.message || 'Error sending recovery email'
      const hint =
        /rate limit|email|smtp|sending|redirect|url/i.test(msg)
          ? ' Fix in Supabase → Authentication → URL Configuration (add this site /admin/login) and Emails/SMTP. Or set a new password under Authentication → Users.'
          : ' Or open Supabase → Authentication → Users → your user → reset password.'
      setError(`${msg}${hint}`)
      return
    }
    setMode('sent')
    toast.success('Password reset email sent.')
  }

  const onNewPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    toast.success('Password updated. Sign in with your new password.')
    setPassword('')
    setPassword2('')
    setMode('signin')
    await supabase.auth.signOut()
  }

  return (
    <>
      <Helmet>
        <title>Admin Login — Hopeland Global Checkers</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-navy px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {mode === 'signin' ? <Lock size={22} /> : <KeyRound size={22} />}
            </span>
            <h1 className="text-h3 mt-4 text-ink">
              {mode === 'signin' && 'Admin Sign In'}
              {mode === 'forgot' && 'Forgot password'}
              {mode === 'sent' && 'Check your email'}
              {mode === 'new-password' && 'Set new password'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {mode === 'signin' && 'Manage registrations, videos, sponsors, and blog content.'}
              {mode === 'forgot' && 'We will email you a link to reset your admin password.'}
              {mode === 'sent' && `If an account exists for ${email.trim()}, a reset link is on the way.`}
              {mode === 'new-password' && 'Choose a new password for your admin account.'}
            </p>
          </div>

          {!isSupabaseConfigured && (
            <p className="mb-4 rounded-lg bg-warning/10 px-4 py-3 text-xs font-semibold text-warning">
              Supabase is not configured yet — connect your project in .env to enable real admin authentication.
            </p>
          )}

          {mode === 'signin' && (
            <form onSubmit={(e) => void onSignIn(e)} className="flex flex-col gap-4">
              <FormField
                label="Email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormField
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-xs font-semibold text-error">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-semibold text-primary hover:underline"
                  onClick={() => {
                    setError(null)
                    setMode('forgot')
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full"
                icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={(e) => void onForgot(e)} className="flex flex-col gap-4">
              <FormField
                label="Email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-xs font-semibold text-error">{error}</p>}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full"
                icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
              >
                {submitting ? 'Sending…' : 'Send reset link'}
              </Button>
              <button
                type="button"
                className="text-sm font-semibold text-muted hover:text-ink"
                onClick={() => {
                  setError(null)
                  setMode('signin')
                }}
              >
                Back to Sign In
              </button>
            </form>
          )}

          {mode === 'sent' && (
            <div className="flex flex-col gap-4">
              <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-ink">
                Open the email and click the link. You will return here to set a new password.
              </p>
              <Button type="button" variant="secondary" className="w-full" onClick={() => setMode('signin')}>
                Back to Sign In
              </Button>
            </div>
          )}

          {mode === 'new-password' && (
            <form onSubmit={(e) => void onNewPassword(e)} className="flex flex-col gap-4">
              <FormField
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
              {error && <p className="text-xs font-semibold text-error">{error}</p>}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full"
                icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
              >
                {submitting ? 'Saving…' : 'Update password'}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  )
}

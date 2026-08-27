import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { PageHero } from '@/components/layout/PageHero'
import { useRegistrantStore } from '@/store/registrantStore'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Login() {
  const { t } = useTranslation()
  const { isAuthenticated, isAdmin, isPaidPlayer, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const setRegistrantId = useRegistrantStore((s) => s.setRegistrantId)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated && !submitting) {
    if (isAdmin) return <Navigate to="/admin" replace />
    if (isPaidPlayer) return <Navigate to="/account" replace />
    return <Navigate to="/register" replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError, role, registration: reg } = await signIn(email, password)
    if (signInError) {
      setSubmitting(false)
      setError(
        /invalid login credentials/i.test(signInError)
          ? 'Wrong email or password. Use the password from Register Now (after payment), or reset it in Supabase Authentication → Users.'
          : signInError,
      )
      return
    }

    if (role === 'admin' || role === 'superadmin') {
      setSubmitting(false)
      navigate('/admin')
      return
    }

    if (reg?.id) setRegistrantId(reg.id)

    if (reg?.status === 'paid') {
      setSubmitting(false)
      toast.success('Welcome back — your player profile is ready.')
      navigate('/account')
      return
    }

    if (reg?.status === 'pending') {
      setSubmitting(false)
      toast.message('Finish payment to unlock your player profile.')
      navigate('/register')
      return
    }

    await signOut()
    setSubmitting(false)
    setError(
      'No paid championship registration found for this email. Complete Register Now + payment first, then sign in.',
    )
  }

  return (
    <>
      <Helmet>
        <title>
          {t('pages.login.title')} — {SITE_NAME}
        </title>
        <meta name="description" content={t('pages.login.metaDescription')} />
        <link rel="canonical" href={`${SITE_URL}/login`} />
      </Helmet>

      <PageHero
        eyebrow={t('pages.login.eyebrow')}
        title={t('pages.login.title')}
        subtitle={t('pages.login.subtitle')}
      />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-black/5 bg-white p-4 shadow-card sm:p-6 md:p-8"
          >
            {!isSupabaseConfigured && (
              <p className="mb-4 rounded-lg bg-warning/10 px-4 py-3 text-xs font-semibold text-warning">
                Supabase is not configured yet — add credentials to .env to enable login.
              </p>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <FormField
                label={t('pages.login.email')}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormField
                label={t('pages.login.password')}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-xs font-semibold text-error">{error}</p>}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="mt-2 w-full"
                icon={submitting ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              >
                {submitting ? t('buttons.sending') : t('pages.login.submit')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {t('pages.login.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                {t('pages.login.registerLink')}
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}

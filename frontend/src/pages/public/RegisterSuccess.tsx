import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { useRegistrantStore } from '@/store/registrantStore'
import { activatePaidAccount, finalizePaidRegistration } from '@/lib/activatePaidAccount'
import { clearPendingAuth } from '@/lib/pendingAuth'
import {
  readLocalPaidRegistration,
} from '@/lib/localPaidRegistration'
import { mockRegistrations } from '@/lib/mockData'
import type { Registration } from '@/types'

export default function RegisterSuccess() {
  const [params] = useSearchParams()
  const isDemo = params.get('demo') === 'true'
  const isLocal = params.get('local') === 'true'
  const sessionId = params.get('session_id')
  const registrantId = useRegistrantStore((s) => s.registrantId)
  const setRegistrantId = useRegistrantStore((s) => s.setRegistrantId)

  const [registration, setRegistration] = useState<Registration | null>(() => {
    if (typeof window === 'undefined') return null
    if (import.meta.env.PROD) return null
    if (new URLSearchParams(window.location.search).get('local') === 'true') {
      return readLocalPaidRegistration()
    }
    return null
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    if (import.meta.env.PROD) return true
    if (new URLSearchParams(window.location.search).get('local') === 'true') {
      const local = readLocalPaidRegistration()
      return !(local?.status === 'paid')
    }
    return true
  })
  const [unpaid, setUnpaid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      // Fake local/demo success is local-only. Live site must have a Stripe session.
      if (import.meta.env.PROD && (isLocal || isDemo)) {
        if (!cancelled) {
          setUnpaid(true)
          setError('Payment was not completed with Stripe. Please register again.')
          setLoading(false)
        }
        return
      }

      // Intermediate local payment — registration already saved; no Stripe session.
      if (isLocal) {
        const local = readLocalPaidRegistration()
        if (local?.status === 'paid') {
          await activatePaidAccount(local)
          if (!cancelled) {
            setRegistration(local)
            setRegistrantId(local.id)
            setUnpaid(false)
            setError(null)
          }
        } else if (!cancelled) {
          setUnpaid(true)
          setError('Local payment record missing. Please register again.')
        }
        // Do not clear sessionStorage here — React Strict Mode remounts this
        // effect and would wipe the record before the second mount can read it.
        if (!cancelled) setLoading(false)
        return
      }

      // Demo mode: local mock only.
      if (isDemo) {
        const demo =
          mockRegistrations.find((r) => r.id === registrantId) ?? mockRegistrations[0] ?? null
        if (demo) {
          await activatePaidAccount(demo)
          if (!cancelled) {
            setRegistration(demo)
            setRegistrantId(demo.id)
          }
        }
        if (!cancelled) setLoading(false)
        return
      }

      if (!sessionId) {
        clearPendingAuth()
        if (!cancelled) {
          setUnpaid(true)
          setError('Missing payment session. No account was created.')
          setLoading(false)
        }
        return
      }

      // Live: Stripe must confirm paid before registration + Auth account exist.
      const result = await finalizePaidRegistration(sessionId)
      if (cancelled) return

      if (result.registration?.status === 'paid') {
        setRegistration(result.registration)
        setRegistrantId(result.registration.id)
        setUnpaid(false)
        setError(null)
      } else {
        clearPendingAuth()
        setUnpaid(Boolean(result.unpaid))
        setError(result.error ?? 'Payment not completed. No account was created.')
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [isDemo, isLocal, sessionId, registrantId, setRegistrantId])

  const confirmed =
    Boolean(registration?.status === 'paid') || ((isDemo || isLocal) && Boolean(registration))

  return (
    <>
      <Helmet>
        <title>Registration Confirmed — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/register/success`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="flex min-h-[70vh] items-center bg-surface-white">
        <div className="container-page max-w-lg text-center">
          {loading ? (
            <>
              <LoadingSpinner size={40} className="mx-auto text-primary" />
              <h1 className="text-h1 mt-8 text-ink">Confirming your payment…</h1>
              <p className="text-body-lg mt-4 text-muted">
                We only open your account after payment is confirmed. Please don&rsquo;t close this page.
              </p>
            </>
          ) : confirmed ? (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success"
              >
                <CheckCircle2 size={40} />
              </motion.div>
              <h1 className="text-h1 mt-8 text-ink">Registration confirmed</h1>
              <p className="text-body-lg mt-4 text-muted">
                {isLocal || isDemo
                  ? 'Payment complete — your player registration is saved. Sign in with the email and password you set.'
                  : 'Payment successful. Your account is open — sign in with the email and password you set.'}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/login">
                  <Button size="lg">Sign In to Player Profile</Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-h1 mt-8 text-ink">
                {unpaid ? 'Payment failed' : 'Account setup incomplete'}
              </h1>
              <p className="text-body-lg mt-4 text-muted">
                {error ??
                  'Payment did not succeed, so no account was created and nothing was saved. Try again with a valid card.'}
              </p>
              <div className="mt-10">
                <Link to="/register">
                  <Button size="lg">Register Again</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}

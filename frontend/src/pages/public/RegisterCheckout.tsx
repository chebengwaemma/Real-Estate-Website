import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/common/Button'
import { getStripe } from '@/lib/stripeClient'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { clearPendingAuth } from '@/lib/pendingAuth'

const CLIENT_SECRET_KEY = 'hopeland_stripe_checkout_client_secret'

type EmbeddedCheckout = {
  destroy: () => void
  mount: (el: HTMLElement) => void
}

/** Stripe allows only one Embedded Checkout instance per page. */
let activeCheckout: EmbeddedCheckout | null = null
/** Serialize create/destroy so React Strict Mode cannot open two at once. */
let checkoutQueue: Promise<void> = Promise.resolve()

function destroyActiveCheckout() {
  if (!activeCheckout) return
  try {
    activeCheckout.destroy()
  } catch {
    // ignore double-destroy
  }
  activeCheckout = null
}

function enqueueCheckoutWork(work: () => Promise<void>) {
  checkoutQueue = checkoutQueue.then(work, work)
  return checkoutQueue
}

export function saveCheckoutClientSecret(clientSecret: string) {
  sessionStorage.setItem(CLIENT_SECRET_KEY, clientSecret)
}

export function readCheckoutClientSecret() {
  return sessionStorage.getItem(CLIENT_SECRET_KEY)
}

export function clearCheckoutClientSecret() {
  sessionStorage.removeItem(CLIENT_SECRET_KEY)
}

export default function RegisterCheckout() {
  const navigate = useNavigate()
  const mountRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void enqueueCheckoutWork(async () => {
      destroyActiveCheckout()
      if (mountRef.current) mountRef.current.innerHTML = ''
      if (cancelled) return

      const clientSecret = readCheckoutClientSecret()
      if (!clientSecret) {
        if (!cancelled) {
          setError('Checkout session missing. Please start registration again.')
          setLoading(false)
        }
        return
      }

      const stripe = await getStripe()
      if (cancelled) return
      if (!stripe) {
        setError('Stripe failed to load. Check your publishable key and network, then try again.')
        setLoading(false)
        return
      }

      try {
        const stripeAny = stripe as unknown as {
          createEmbeddedCheckoutPage?: (opts: { clientSecret: string }) => Promise<EmbeddedCheckout>
          initEmbeddedCheckout?: (opts: { clientSecret: string }) => Promise<EmbeddedCheckout>
        }

        destroyActiveCheckout()

        const checkout = stripeAny.createEmbeddedCheckoutPage
          ? await stripeAny.createEmbeddedCheckoutPage({ clientSecret })
          : await stripeAny.initEmbeddedCheckout!({ clientSecret })

        if (cancelled) {
          try {
            checkout.destroy()
          } catch {
            // ignore
          }
          return
        }

        if (!mountRef.current) {
          try {
            checkout.destroy()
          } catch {
            // ignore
          }
          setError('Checkout UI could not mount. Refresh and try again.')
          setLoading(false)
          return
        }

        activeCheckout = checkout
        checkout.mount(mountRef.current)
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Could not open Stripe Checkout.'
        setError(message)
        setLoading(false)
        toast.error(message)
      }
    })

    return () => {
      cancelled = true
      void enqueueCheckoutWork(async () => {
        destroyActiveCheckout()
        if (mountRef.current) mountRef.current.innerHTML = ''
      })
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>Pay Registration Fee — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/register/checkout`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="bg-surface-white py-12 sm:py-16">
        <div className="container-page max-w-2xl">
          <h1 className="text-h1 text-ink">Complete payment</h1>
          <p className="text-body-lg mt-3 text-muted">
            Pay securely with Stripe. Your player account opens only after payment succeeds.
          </p>

          {loading && (
            <div className="mt-10 flex flex-col items-center gap-4 py-16">
              <LoadingSpinner size={36} className="text-primary" />
              <p className="text-sm text-muted">Loading Stripe Checkout…</p>
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-xl border border-error/20 bg-error/5 px-4 py-4 text-sm text-error">
              <p>{error}</p>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    destroyActiveCheckout()
                    clearCheckoutClientSecret()
                    clearPendingAuth()
                    navigate('/register')
                  }}
                >
                  Back to registration
                </Button>
              </div>
            </div>
          )}

          <div ref={mountRef} id="stripe-embedded-checkout" className="mt-8 min-h-[420px]" />

          {!loading && !error && (
            <p className="mt-6 text-center text-xs text-muted">
              Need to change your details?{' '}
              <Link to="/register" className="font-semibold text-primary underline-offset-2 hover:underline">
                Start over
              </Link>
            </p>
          )}
        </div>
      </section>
    </>
  )
}

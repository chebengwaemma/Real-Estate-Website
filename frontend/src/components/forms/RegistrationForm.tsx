import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import { FormField } from '@/components/forms/FormField'
import { CountrySelect } from '@/components/forms/CountrySelect'
import { Button } from '@/components/common/Button'
import { createRegistrationSchema, type RegistrationSchema } from '@/lib/validators'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { useRegistrationFee } from '@/hooks/useRegistrationFee'
import { getStripePublishableKey } from '@/lib/stripePublishableKey'
import { formatCurrency } from '@/lib/utils'
import { savePendingAuth, clearPendingAuth } from '@/lib/pendingAuth'
import { isLocalHost, isLocalPaymentMode } from '@/lib/env'
import { saveLocalPaidRegistration, clearLocalPaidRegistration } from '@/lib/localPaidRegistration'
import { startRegistrationCheckout } from '@/lib/startCheckout'
import { useCreateDemoRegistration } from '@/hooks/useRegistrations'
import { useRegistrantStore } from '@/store/registrantStore'
import type { Registration } from '@/types'

export function RegistrationForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const createDemoRegistration = useCreateDemoRegistration()
  const setRegistrantId = useRegistrantStore((s) => s.setRegistrantId)
  const registrationFee = useRegistrationFee()
  const localPayment = isLocalPaymentMode()
  const schema = useMemo(() => createRegistrationSchema((key) => t(key)), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationSchema>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: RegistrationSchema) => {
    setSubmitting(true)
    try {
      // Intermediate / local payment mode — no Stripe Checkout redirect.
      if (localPayment) {
        clearPendingAuth()
        savePendingAuth(values.email, values.password)
        clearLocalPaidRegistration()
        const { password, confirmPassword: _confirm, ...checkoutFields } = values

        if (isLocalHost()) {
          try {
            const localRes = await fetch('/api/local-paid-registration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...checkoutFields, password }),
            })
            const contentType = localRes.headers.get('content-type') ?? ''
            if (localRes.ok && contentType.includes('application/json')) {
              const localData = (await localRes.json()) as {
                paid?: boolean
                registration?: Registration
                localOnly?: boolean
                accountError?: string | null
                error?: string
              }
              if (localData.error) throw new Error(localData.error)
              if (localData.paid && localData.registration) {
                let registration = localData.registration
                if (localData.localOnly) {
                  registration = await createDemoRegistration.mutateAsync({
                    first_name: values.firstName,
                    last_name: values.lastName,
                    date_of_birth: values.dateOfBirth,
                    city: values.city,
                    country: values.country,
                    nationality: values.nationality,
                    phone: values.phone,
                    email: values.email,
                  })
                } else if (!localData.accountError) {
                  await supabase.auth.signInWithPassword({
                    email: values.email.trim().toLowerCase(),
                    password,
                  })
                }
                setRegistrantId(registration.id)
                saveLocalPaidRegistration(registration)
                // Keep pending auth until success page can open the player account.
                toast.success('Payment complete — your player account is ready.')
                navigate('/register/success?local=true')
                return
              }
            } else if (!localRes.ok && contentType.includes('application/json')) {
              const errBody = (await localRes.json()) as { error?: string }
              throw new Error(errBody.error ?? 'Could not complete local payment.')
            }
          } catch (err) {
            if (err instanceof Error && !/Failed to fetch|NetworkError|fetch|JSON/i.test(err.message)) {
              throw err
            }
          }
        }

        // Fallback: in-browser demo paid registration (no server).
        const registration = await createDemoRegistration.mutateAsync({
          first_name: values.firstName,
          last_name: values.lastName,
          date_of_birth: values.dateOfBirth,
          city: values.city,
          country: values.country,
          nationality: values.nationality,
          phone: values.phone,
          email: values.email,
        })
        setRegistrantId(registration.id)
        saveLocalPaidRegistration(registration)
        toast.success('Payment complete — your player account is ready.')
        navigate('/register/success?local=true')
        return
      }

      // Demo mode only — simulates a successful paid registration locally.
      if (!isSupabaseConfigured) {
        await new Promise((resolve) => setTimeout(resolve, 900))
        const registration = await createDemoRegistration.mutateAsync({
          first_name: values.firstName,
          last_name: values.lastName,
          date_of_birth: values.dateOfBirth,
          city: values.city,
          country: values.country,
          nationality: values.nationality,
          phone: values.phone,
          email: values.email,
        })
        setRegistrantId(registration.id)
        savePendingAuth(values.email, values.password)
        toast.success('Demo mode: paid registration saved locally.')
        navigate('/register/success?demo=true')
        return
      }

      // Live Stripe — hosted Checkout (redirect to Stripe). Secret key never touches the browser.
      const publishableKey = getStripePublishableKey()
      if (!publishableKey) {
        throw new Error(
          'Stripe publishable key is missing. Set VITE_STRIPE_PUBLIC_KEY (pk_live_…) for this build.',
        )
      }

      clearPendingAuth()
      savePendingAuth(values.email, values.password)

      const { password: _password, confirmPassword: _confirm, ...checkoutFields } = values
      const checkout = await startRegistrationCheckout(checkoutFields)

      if ('url' in checkout && checkout.url) {
        window.location.assign(checkout.url)
        return
      }

      clearPendingAuth()
      throw new Error('Could not start checkout. Please try again.')
    } catch (err) {
      clearPendingAuth()
      toast.error(err instanceof Error ? err.message : t('registerForm.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs text-muted">
        {localPayment ? t('registerForm.localMode') : t('registerForm.payFirst')}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t('registerForm.firstName')} placeholder="Amara" error={errors.firstName?.message} {...register('firstName')} />
        <FormField label={t('registerForm.lastName')} placeholder="Okafor" error={errors.lastName?.message} {...register('lastName')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t('registerForm.dateOfBirth')} type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
        <FormField label={t('registerForm.city')} placeholder="Lagos" error={errors.city?.message} {...register('city')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <CountrySelect
          label={t('registerForm.country')}
          placeholder={t('registerForm.selectCountry')}
          error={errors.country?.message}
          {...register('country')}
        />
        <CountrySelect
          label={t('registerForm.nationality')}
          placeholder={t('registerForm.selectNationality')}
          error={errors.nationality?.message}
          {...register('nationality')}
        />
      </div>

      <FormField label={t('registerForm.phone')} type="tel" placeholder="+234 801 234 5678" error={errors.phone?.message} {...register('phone')} />
      <FormField label={t('registerForm.email')} type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label={t('registerForm.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('registerForm.passwordHint')}
          error={errors.password?.message}
          {...register('password')}
        />
        <FormField
          label={t('registerForm.confirmPassword')}
          type="password"
          autoComplete="new-password"
          placeholder={t('registerForm.repeatPassword')}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>
      <p className="text-xs text-muted">{t('registerForm.passwordUnlocks')}</p>

      <div className="flex flex-col gap-2 rounded-xl border border-black/10 bg-surface-light px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{t('registerForm.feeLabel')}</p>
          <p className="text-xs text-muted">{localPayment ? t('registerForm.feeHintLocal') : t('registerForm.feeHint')}</p>
        </div>
        <p className="text-h3 text-primary">{formatCurrency(registrationFee.amount, registrationFee.currency)}</p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full whitespace-normal"
        icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}
      >
        {submitting
          ? localPayment
            ? t('registerForm.completing')
            : t('registerForm.submitting')
          : localPayment
            ? t('registerForm.submitLocal')
            : t('registerForm.submit')}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <ShieldCheck size={14} className="text-success" />
        {localPayment ? t('registerForm.secureLocal') : t('registerForm.secure')}
      </p>
    </form>
  )
}

import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, MapPin, Phone, Loader2 } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { useSiteSettings, useSubmitContactMessage } from '@/hooks/useCms'
import { publicContactEmail } from '@/lib/publicContactEmail'

export default function Contact() {
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const { data: settings } = useSiteSettings()
  const submitMessage = useSubmitContactMessage()
  const email = publicContactEmail(settings?.contact_email)
  const phone = settings?.contact_phone?.trim() || ''
  const address = settings?.contact_address?.trim() || settings?.championship_location || 'Atlanta, Georgia, USA'
  const orgName = settings?.site_name || 'Hopeland Global Checkers (Draughts) Federation'

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') ?? '').trim()
    const emailValue = String(fd.get('email') ?? '').trim()
    const subject = String(fd.get('subject') ?? '').trim()
    const message = String(fd.get('message') ?? '').trim()
    const body = subject ? `Subject: ${subject}\n\n${message}` : message
    try {
      await submitMessage.mutateAsync({ name, email: emailValue, message: body })
      toast.success(t('pages.contact.success'))
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pages.contact.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>
          {t('pages.contact.title')} — {SITE_NAME}
        </title>
        <meta name="description" content={t('pages.contact.metaDescription')} />
        <link rel="canonical" href={`${SITE_URL}/contact`} />
      </Helmet>

      <PageHero eyebrow={t('pages.contact.eyebrow')} title={t('pages.contact.title')} subtitle={t('pages.contact.subtitle')} />

      <section className="section-y bg-surface-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{t('pages.contact.email')}</p>
                <a href={`mailto:${email}`} className="text-sm text-muted hover:text-primary">
                  {email}
                </a>
              </div>
            </div>
            {phone ? (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{t('pages.contact.phone')}</p>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-sm text-muted hover:text-primary">
                    {phone}
                  </a>
                </div>
              </div>
            ) : null}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{t('pages.contact.address')}</p>
                <address className="not-italic">
                  <p className="text-sm text-muted">{orgName}</p>
                  <p className="whitespace-pre-line text-sm text-muted">{address}</p>
                </address>
              </div>
            </div>
          </div>

          <motion.form
            onSubmit={(e) => void onSubmit(e)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-4 shadow-card sm:p-6 md:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label={t('pages.contact.fullName')} name="name" placeholder="Jane Doe" required />
              <FormField
                label={t('pages.contact.emailAddress')}
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <FormField label={t('pages.contact.subject')} name="subject" placeholder="Sponsorship inquiry" required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-bold text-ink">
                {t('pages.contact.message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" size="lg" disabled={submitting} icon={submitting ? <Loader2 className="animate-spin" size={18} /> : undefined}>
              {submitting ? t('buttons.sending') : t('buttons.sendMessage')}
            </Button>
          </motion.form>
        </div>
      </section>
    </>
  )
}

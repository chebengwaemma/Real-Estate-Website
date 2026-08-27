import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ShieldCheck, Globe2, Clock } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { RegistrationForm } from '@/components/forms/RegistrationForm'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Register() {
  const { t } = useTranslation()
  const perks = [
    { icon: Globe2, text: t('pages.register.perkBracket') },
    { icon: Clock, text: t('pages.register.perkStream') },
    { icon: ShieldCheck, text: t('pages.register.perkReferee') },
  ]

  return (
    <>
      <Helmet>
        <title>
          {t('pages.register.title')} — {SITE_NAME}
        </title>
        <meta name="description" content={t('pages.register.metaDescription')} />
        <link rel="canonical" href={`${SITE_URL}/register`} />
      </Helmet>

      <PageHero
        eyebrow={t('pages.register.eyebrow')}
        title={t('pages.register.title')}
        subtitle={t('pages.register.subtitle')}
      />

      <section className="section-y bg-surface-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="order-2 lg:order-1">
            <h2 className="text-h3 text-ink">{t('pages.register.included')}</h2>
            <div className="mt-6 flex flex-col gap-5">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <perk.icon size={18} />
                  </span>
                  <p className="pt-2 text-sm text-muted">{perk.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1 rounded-2xl border border-black/5 bg-white p-4 shadow-card sm:p-6 md:p-10 lg:order-2"
          >
            <RegistrationForm />
          </motion.div>
        </div>
      </section>
    </>
  )
}

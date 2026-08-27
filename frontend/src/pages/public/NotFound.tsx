import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { SITE_NAME } from '@/lib/seo'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <>
      <Helmet>
        <title>
          {t('pages.notFound.title')} — {SITE_NAME}
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="flex min-h-[70vh] items-center bg-surface-white">
        <div className="container-page text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-display text-primary">
            404
          </motion.p>
          <h1 className="text-h2 mt-4 text-ink">{t('pages.notFound.title')}</h1>
          <p className="text-body-lg mx-auto mt-3 max-w-md text-muted">{t('pages.notFound.subtitle')}</p>
          <div className="mt-8">
            <Link to="/">
              <Button size="lg">{t('pages.notFound.home')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

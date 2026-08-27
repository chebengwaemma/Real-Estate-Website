import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SponsorsWall } from '@/components/home/SponsorsWall'
import { Button } from '@/components/common/Button'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Sponsors() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>
          {t('pages.sponsors.title')} — {SITE_NAME}
        </title>
        <meta name="description" content={t('pages.sponsors.metaDescription')} />
        <link rel="canonical" href={`${SITE_URL}/sponsors`} />
      </Helmet>

      <section className="bg-[#0099FF] py-16 text-white sm:py-24">
        <div className="container-page">
          <p className="text-center text-[11px] font-semibold tracking-[0.22em] text-white/80 uppercase">
            {t('pages.sponsors.eyebrow')}
          </p>
          <h1 className="text-h1 mt-3 text-center text-white">{t('pages.sponsors.title')}</h1>
          <p className="text-body-lg mx-auto mt-3 max-w-xl text-center text-white/85">
            {t('pages.sponsors.subtitle')}
          </p>
          <div className="mt-12 sm:mt-16">
            <SponsorsWall />
          </div>
        </div>
      </section>

      <section className="section-y bg-navy text-center text-white">
        <div className="container-page">
          <h2 className="text-h2 text-white">{t('pages.sponsors.ctaTitle')}</h2>
          <p className="text-body-lg mx-auto mt-4 max-w-xl text-white/70">{t('pages.sponsors.ctaText')}</p>
          <div className="mt-8">
            <Link to="/contact">
              <Button size="lg">{t('buttons.getInTouch')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

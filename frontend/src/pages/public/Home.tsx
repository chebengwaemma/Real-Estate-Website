import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { PrizeBanner } from '@/components/home/PrizeBanner'
import { HeroSection } from '@/components/home/HeroSection'
import { CHAMPIONSHIP_DATES_ISO, CHAMPIONSHIP_LOCATION } from '@/components/home/ChampionshipBanner'
import { SponsorsStaticGrid } from '@/components/home/SponsorsStaticGrid'
import { AboutTeaserSection } from '@/components/home/AboutTeaserSection'
import { StatsSection } from '@/components/home/StatsSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { VideosPreviewSection } from '@/components/home/VideosPreviewSection'
import { KeyDatesSection } from '@/components/home/KeyDatesSection'
import { BlogPreviewSection } from '@/components/home/BlogPreviewSection'
import { FAQSection } from '@/components/home/FAQSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { FinalCTASection } from '@/components/home/FinalCTASection'
import { eventJsonLd, organizationJsonLd, SITE_NAME, SITE_URL } from '@/lib/seo'
import { useSiteSettings } from '@/hooks/useCms'

export default function Home() {
  const { t } = useTranslation('home')
  const { data: settings } = useSiteSettings()
  const location = settings?.championship_location ?? CHAMPIONSHIP_LOCATION
  const start = settings?.championship_dates_start ?? CHAMPIONSHIP_DATES_ISO.start
  const end = settings?.championship_dates_end ?? CHAMPIONSHIP_DATES_ISO.end
  const datesLabel = settings?.championship_dates ?? 'July 19–25, 2027'

  const jsonLd = [
    organizationJsonLd(),
    eventJsonLd({
      name: 'Global Checkers / Draughts Championship',
      startDate: start,
      endDate: end,
      location,
    }),
  ]

  return (
    <>
      <Helmet>
        <title>{SITE_NAME}</title>
        <meta
          name="description"
          content={`Hopeland Global Checkers (Draughts) Federation. Global Checkers/Draughts Championship — ${location}, ${datesLabel}. Register to compete.`}
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={SITE_NAME} />
        <meta
          property="og:description"
          content={`Global Checkers / Draughts Championship in ${location} — ${datesLabel}.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PrizeBanner />
      <HeroSection />
      <AboutTeaserSection />
      <StatsSection />
      <FeaturesSection />
      <section className="bg-navy py-12 text-white sm:py-16">
        <div className="container-page">
          <p className="mb-6 text-center text-[10px] font-semibold tracking-[0.18em] text-white/50 uppercase sm:mb-8 sm:text-[11px] sm:tracking-[0.2em]">
            {t('hero.officialPartners')}
          </p>
          <SponsorsStaticGrid tone="navy" />
        </div>
      </section>
      <VideosPreviewSection />
      <KeyDatesSection />
      <BlogPreviewSection />
      <FAQSection />
      <TestimonialsSection />
      <FinalCTASection />
    </>
  )
}

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/common/Button'
import { useSiteSettings } from '@/hooks/useCms'
import { cmsOrTranslated } from '@/lib/localizedCms'
import { floatY, slideFromLeft, slideFromRight, viewportOnce } from '@/lib/motion'

export function AboutTeaserSection() {
  const { t, i18n } = useTranslation('home')
  const { data: settings } = useSiteSettings()
  const teaser = cmsOrTranslated(i18n.language, settings?.about_teaser, t('about.teaser'))
  return (
    <section className="section-y bg-surface-light">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={slideFromLeft}
          className="order-2 lg:order-1"
        >
          <motion.div animate={floatY} className="relative mx-auto max-w-lg overflow-hidden">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/15 blur-2xl" aria-hidden />
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-navy/10 bg-navy shadow-[0_20px_60px_-20px_rgba(3,13,67,0.55)]">
              <img
                src="/home/home-about-board.png"
                alt="Championship checkers board"
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={slideFromRight}
          className="order-1 lg:order-2"
        >
          <SectionHeading
            eyebrow={t('about.eyebrow')}
            title={t('about.title')}
            align="left"
            className="mx-0 text-left"
          />
          <p className="text-body-lg mt-5 text-muted">
            {teaser}
          </p>
          <div className="mt-6 flex items-start gap-3 text-sm font-semibold text-ink sm:items-center">
            <Trophy size={18} className="mt-0.5 shrink-0 text-primary sm:mt-0" />
            <span className="min-w-0">{t('about.divisions')}</span>
          </div>
          <div className="mt-8">
            <Link to="/about">
              <Button variant="secondary" icon={<ArrowRight size={16} />}>
                {t('about.learnFormat')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

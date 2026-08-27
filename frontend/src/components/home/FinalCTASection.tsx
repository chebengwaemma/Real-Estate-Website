import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useSiteSettings } from '@/hooks/useCms'
import { cmsOrTranslated } from '@/lib/localizedCms'
import { useTranslation } from 'react-i18next'
import { slideFromLeft, slideFromRight, staggerContainer, viewportOnce } from '@/lib/motion'

export function FinalCTASection() {
  const { t, i18n } = useTranslation(['home', 'common'])
  const { data: settings } = useSiteSettings()
  const title = cmsOrTranslated(i18n.language, settings?.final_cta_title, t('cta.title'))
  const subtitle = cmsOrTranslated(i18n.language, settings?.final_cta_subtitle, t('cta.subtitle'))

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <img
        src="/home/home-cta-glow.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-primary/40" />
      <div className="container-page section-y relative text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.h2 variants={slideFromLeft} className="text-h1 mx-auto max-w-3xl text-white">
            {title}
          </motion.h2>
          <motion.p variants={slideFromRight} className="text-body-lg mx-auto mt-4 max-w-xl text-white/85">
            {subtitle}
          </motion.p>
          <motion.div
            variants={slideFromLeft}
            className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
          >
            <Link to="/register" className="min-w-0 sm:flex-none">
              <Button size="lg" icon={<ArrowRight size={18} />} className="w-full sm:w-auto">
                {t('buttons.registerNow', { ns: 'common' })}
              </Button>
            </Link>
            <Link to="/about" className="min-w-0 sm:flex-none">
              <Button size="lg" variant="outline" className="w-full border-white/40 text-white sm:w-auto">
                {t('buttons.howItWorks', { ns: 'common' })}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

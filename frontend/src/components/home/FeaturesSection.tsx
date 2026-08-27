import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SectionHeading } from '@/components/common/SectionHeading'
import { FeatureCard } from '@/components/cards/FeatureCard'
import { useSiteFeatures } from '@/hooks/useCms'
import { defaultSiteFeatures } from '@/lib/cmsDefaults'
import { cmsList } from '@/lib/cmsList'
import { floatY, floatYSlow, slideByIndex, slideFromLeft, slideFromRight, staggerContainer, viewportOnce } from '@/lib/motion'
import type { FeatureItem } from '@/types'

export function FeaturesSection() {
  const { t } = useTranslation('home')
  const { data } = useSiteFeatures()
  const features: FeatureItem[] = cmsList(data, defaultSiteFeatures).map((f) => ({
    id: f.id,
    icon: f.icon,
    title: f.title,
    description: f.description,
  }))
  const showcase = [
    { src: '/home/home-feature-live.png', label: t('features.liveFinals'), float: floatY },
    { src: '/home/home-feature-open.png', label: t('features.openDivision'), float: floatYSlow },
    { src: '/home/home-feature-masters.png', label: t('features.masters'), float: floatY },
    { src: '/home/home-feature-junior.png', label: t('features.junior'), float: floatYSlow },
  ]

  return (
    <section className="section-y bg-surface-white">
      <div className="container-page">
        <SectionHeading eyebrow={t('features.eyebrow')} title={t('features.title')} />

        <div className="mt-8 grid min-w-0 grid-cols-2 gap-2 sm:mt-12 sm:gap-4 lg:grid-cols-4">
          {showcase.map((item, i) => (
            <motion.div
              key={item.src}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={i % 2 === 0 ? slideFromLeft : slideFromRight}
            >
              <motion.div animate={item.float} className="relative overflow-hidden rounded-2xl border border-black/5 shadow-card">
                <img
                  src={item.src}
                  alt={item.label}
                  className="aspect-square h-full w-full object-cover sm:aspect-[3/4] lg:aspect-square"
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-2 sm:p-3">
                  <p className="truncate text-[10px] font-bold tracking-wide text-white uppercase sm:text-[11px]">{item.label}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div key={feature.id} variants={slideByIndex(i)}>
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

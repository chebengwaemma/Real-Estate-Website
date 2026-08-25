import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, PlayCircle, UserRound } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { HeroCube } from '@/components/home/HeroCube'
import { NetworkBackground } from '@/components/home/NetworkBackground'
import { SponsorsMarquee } from '@/components/home/SponsorsMarquee'
import { SponsorsStaticGrid } from '@/components/home/SponsorsStaticGrid'
import { useAuth } from '@/context/AuthContext'
import { useSiteSettings } from '@/hooks/useCms'
import { fadeUp, floatY, floatYSlow, slideFromLeft, slideFromRight, staggerContainer } from '@/lib/motion'

export function HeroSection() {
  const { t } = useTranslation('home')
  const { isPaidPlayer } = useAuth()
  const { data: settings } = useSiteSettings()
  const isRegistered = isPaidPlayer
  const primaryTo = isRegistered ? '/account' : '/register'
  // Admin CMS is source of truth for all languages
  const eyebrow = settings?.hero_eyebrow || t('hero.eyebrow')
  const title = settings?.hero_title || t('hero.title')
  const subtitle = settings?.hero_subtitle || t('hero.subtitle')
  const location = settings?.championship_location ?? 'Atlanta, Georgia, USA'
  const dates = settings?.championship_dates ?? '19 July – 25 July, 2027'

  return (
    <section className="relative w-full max-w-full overflow-x-clip bg-navy text-white max-lg:pb-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/home/home-hero-board.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          draggable={false}
        />
        <NetworkBackground className="h-full w-full opacity-55 mix-blend-screen sm:opacity-65" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#38bdf8]/90 via-[#3b82f6]/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/45" />
        <div className="absolute inset-x-0 top-1/3 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.18),transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,transparent_0%,rgba(14,165,233,0.14)_28%,rgba(3,13,67,0.55)_55%,rgba(7,16,64,0.92)_78%,#f5f6fa_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.35),transparent_70%)]" />
      </div>

      <motion.img
        src="/home/home-feature-live.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-24 right-[8%] hidden h-28 w-20 rounded-xl object-cover opacity-80 shadow-[0_0_40px_rgba(14,165,233,0.35)] lg:block"
        animate={floatY}
        draggable={false}
      />
      <motion.img
        src="/home/home-feature-open.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-28 left-[6%] hidden h-24 w-[4.5rem] rounded-xl object-cover opacity-70 shadow-[0_0_30px_rgba(47,107,255,0.3)] xl:block"
        animate={floatYSlow}
        draggable={false}
      />

      <div className="container-page relative grid w-full gap-4 py-6 sm:gap-5 sm:py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-6 lg:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.span
            variants={slideFromLeft}
            className="text-eyebrow mb-2 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] backdrop-blur-sm sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs"
          >
            {eyebrow}
          </motion.span>
          <motion.h1
            variants={slideFromLeft}
            className="max-w-4xl text-balance font-display font-extrabold tracking-tight text-white text-[clamp(1.5rem,7vw,3.5rem)] leading-[1.12]"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-3 flex w-full max-w-lg flex-col items-center gap-0.5 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm sm:mt-5 sm:px-5 lg:mx-0 lg:items-start lg:text-left"
          >
            <span className="text-[10px] font-bold tracking-[0.18em] text-primary-light uppercase sm:text-[11px]">
              Global Checkers / Draughts Competition
            </span>
            <span className="text-sm font-extrabold text-white sm:text-base">
              {location}
            </span>
            <span className="text-sm font-semibold text-white/90 sm:text-base">
              {dates}
            </span>
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-2 max-w-xl text-[0.9rem] leading-snug text-white/70 line-clamp-3 sm:mt-4 sm:max-w-2xl sm:text-body-lg sm:leading-relaxed sm:line-clamp-none lg:mx-0"
          >
            {subtitle}
          </motion.p>
          <motion.div
            variants={slideFromLeft}
            className="mt-4 flex w-full max-w-md flex-col items-stretch gap-2 sm:mt-7 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start"
          >
            <Link to={primaryTo} className="w-full min-w-0 sm:w-auto sm:flex-none">
              <Button
                size="md"
                icon={isRegistered ? <UserRound size={16} /> : <ArrowRight size={16} />}
                iconPosition={isRegistered ? 'left' : 'right'}
                className="w-full px-4 py-2.5 text-sm sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                {isRegistered ? t('hero.ctaProfile') : t('hero.ctaPrimary')}
              </Button>
            </Link>
            <Link to="/videos" className="w-full min-w-0 sm:w-auto sm:flex-none">
              <Button
                size="md"
                variant="outline"
                icon={<PlayCircle size={16} />}
                className="w-full border-white/30 px-4 py-2.5 text-sm text-white sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideFromRight}
          className="relative hidden items-center justify-center lg:flex"
        >
          <motion.div animate={floatY} className="relative">
            <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
            <HeroCube />
          </motion.div>
        </motion.div>
      </div>

      <div className="container-page relative z-10 w-full border-t border-white/10 pb-8 pt-4 sm:pb-10 sm:pt-5">
        <p className="mb-2 text-center text-[10px] font-semibold tracking-[0.18em] text-white/50 uppercase sm:mb-3 sm:text-[11px] sm:tracking-[0.2em]">
          Official partners
        </p>
        <div className="max-w-full overflow-hidden">
          <SponsorsMarquee variant="dark" compact />
        </div>
        <div className="mt-6 hidden sm:mt-8 md:block">
          <SponsorsStaticGrid tone="navy" />
        </div>
      </div>
    </section>
  )
}

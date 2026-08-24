import { motion } from 'framer-motion'
import type { Sponsor } from '@/types'
import { cn } from '@/lib/utils'

interface SponsorLogoProps {
  sponsor: Sponsor
  /** Position within the grid — even indexes slide in from the left, odd from the right. */
  index?: number
  /** `wall` = white icon + name on blue. `card` = light card. `marquee` = compact wall chip. */
  variant?: 'wall' | 'card' | 'marquee'
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function SponsorBrand({
  sponsor,
  compact = false,
}: {
  sponsor: Sponsor
  compact?: boolean
}) {
  return (
    <span className={cn('flex min-w-0 items-center', compact ? 'gap-2.5' : 'gap-3 sm:gap-3.5')}>
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt=""
          className={cn(
            'shrink-0 object-contain brightness-0 invert',
            compact ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-10 sm:w-10',
          )}
        />
      ) : (
        <span
          className={cn(
            'grid shrink-0 place-items-center rounded-full border border-white/70 font-display font-extrabold text-white',
            compact ? 'h-7 w-7 text-[11px] sm:h-8 sm:w-8' : 'h-8 w-8 text-xs sm:h-10 sm:w-10 sm:text-sm',
          )}
        >
          {sponsor.name.slice(0, 1)}
        </span>
      )}
      <span
        className={cn(
          'truncate font-display font-semibold tracking-tight text-white',
          compact ? 'text-sm sm:text-base' : 'text-base sm:text-xl',
        )}
      >
        {sponsor.name}
      </span>
    </span>
  )
}

export function SponsorLogo({ sponsor, index = 0, variant = 'card' }: SponsorLogoProps) {
  const isPhotoWall = variant === 'wall'
  const isNameChip = variant === 'marquee'
  const offsetX = index % 2 === 0 ? -64 : 64

  const content = isPhotoWall ? (
    sponsor.logo_url ? (
      <img src={sponsor.logo_url} alt={sponsor.name} className="h-full w-full object-cover" />
    ) : null
  ) : isNameChip ? (
    <SponsorBrand sponsor={sponsor} compact />
  ) : sponsor.logo_url ? (
    <img
      src={sponsor.logo_url}
      alt={sponsor.name}
      className="max-h-10 w-auto max-w-[85%] object-contain sm:max-h-12"
    />
  ) : (
    <span className="max-w-[90%] truncate text-center font-display font-bold text-lg text-ink/70">
      {sponsor.name}
    </span>
  )

  const className = isPhotoWall
    ? 'relative aspect-[16/9] overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] sm:rounded-3xl'
    : isNameChip
      ? 'relative flex shrink-0 items-center'
      : 'relative flex h-28 items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white shadow-card'

  const motionProps = {
    initial: { opacity: 0, x: offsetX },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, amount: 0.35 },
    transition: { duration: 0.65, ease: EASE_OUT, delay: (index % 4) * 0.06 },
  } as const

  const href = sponsor.website_url && sponsor.website_url !== '#' ? sponsor.website_url : null

  if (!href) {
    return isNameChip ? (
      <div className={className}>{content}</div>
    ) : (
      <motion.div {...motionProps} className={className}>
        {content}
      </motion.div>
    )
  }

  if (isNameChip) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`Visit ${sponsor.name}'s website`}
      >
        {content}
      </a>
    )
  }

  return (
    <motion.a
      {...motionProps}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: isPhotoWall || isNameChip ? -2 : -4 }}
      className={className}
      aria-label={`Visit ${sponsor.name}'s website`}
    >
      {content}
    </motion.a>
  )
}

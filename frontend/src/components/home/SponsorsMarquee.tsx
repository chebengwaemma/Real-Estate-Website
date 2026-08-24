import { useSponsors } from '@/hooks/useSponsors'
import { mockSponsors } from '@/lib/mockData'
import type { Sponsor } from '@/types'
import { cn } from '@/lib/utils'

/** Minimum logos in one half of the track so short lists still scroll smoothly. */
const MIN_TRACK_LOGOS = 8

function MarqueeLogo({
  sponsor,
  variant,
  size,
}: {
  sponsor: Sponsor
  variant: 'light' | 'dark'
  size: 'compact' | 'default' | 'feature'
}) {
  const href = sponsor.website_url && sponsor.website_url !== '#' ? sponsor.website_url : null
  const content = sponsor.logo_url ? (
    <img
      src={sponsor.logo_url}
      alt={sponsor.name}
      className="absolute inset-0 h-full w-full object-cover"
    />
  ) : (
    <span
      className={cn(
        'relative z-10 max-w-[90%] truncate px-1 text-center font-display font-bold',
        size === 'compact' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base',
        variant === 'dark' ? 'text-ink/80' : 'text-ink/70',
      )}
    >
      {sponsor.name}
    </span>
  )

  const className = cn(
    'relative flex shrink-0 items-center justify-center overflow-hidden bg-white',
    size === 'compact' && 'h-10 w-[110px] rounded-xl sm:h-16 sm:w-[160px]',
    size === 'default' && 'h-14 w-[140px] rounded-xl sm:h-20 sm:w-[180px]',
    size === 'feature' && 'h-[4.75rem] w-[10.5rem] rounded-2xl sm:h-24 sm:w-[13.5rem] sm:rounded-3xl',
    variant === 'dark'
      ? 'border border-white/20 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]'
      : 'border border-black/5 shadow-card',
  )

  if (!href) {
    return <div className={className}>{content}</div>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, 'transition-transform hover:-translate-y-0.5')}
      aria-label={`Visit ${sponsor.name}'s website`}
    >
      {content}
    </a>
  )
}

function buildTrack(sponsors: Sponsor[]): Sponsor[] {
  if (sponsors.length === 0) return []
  const copies = Math.max(1, Math.ceil(MIN_TRACK_LOGOS / sponsors.length))
  return Array.from({ length: copies }, () => sponsors).flat()
}

interface SponsorsMarqueeProps {
  variant?: 'light' | 'dark'
  compact?: boolean
  /** Larger photo pills — Official Partners images in the Sponsors section. */
  size?: 'compact' | 'default' | 'feature'
  className?: string
  fadeFrom?: string
  /** Only show sponsors that have a logo/photo uploaded. */
  photosOnly?: boolean
  reverse?: boolean
}

/** Auto-scrolling sponsor logos from admin (`useSponsors`). Falls back to mock when DB is empty. */
export function SponsorsMarquee({
  variant = 'light',
  compact = false,
  size,
  className,
  fadeFrom,
  photosOnly = false,
  reverse = false,
}: SponsorsMarqueeProps) {
  const { data: sponsors } = useSponsors()
  const source = sponsors && sponsors.length > 0 ? sponsors : mockSponsors
  const list = photosOnly ? source.filter((s) => Boolean(s.logo_url)) : source
  const track = buildTrack(list.length ? list : source)
  const loop = [...track, ...track]
  const durationSec = Math.max(24, track.length * 3.5)
  const resolvedSize = size ?? (compact ? 'compact' : 'default')

  const fade = fadeFrom ?? (variant === 'dark' ? 'from-navy' : 'from-surface-white')

  return (
    <div className={cn('relative overflow-hidden', className)} aria-label="Sponsors">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 bg-gradient-to-r to-transparent',
          compact ? 'w-8 sm:w-14' : resolvedSize === 'feature' ? 'w-10 sm:w-20' : 'w-10 sm:w-16',
          fade,
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-10 bg-gradient-to-l to-transparent',
          compact ? 'w-8 sm:w-14' : resolvedSize === 'feature' ? 'w-10 sm:w-20' : 'w-10 sm:w-16',
          fade,
        )}
      />
      <div
        className={cn(
          'flex w-max items-center',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          'hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:w-full motion-reduce:justify-center',
          compact ? 'gap-2 px-2 sm:gap-4 sm:px-4' : resolvedSize === 'feature' ? 'gap-3 px-4 sm:gap-5' : 'gap-3 px-4 sm:gap-4',
        )}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {loop.map((sponsor, index) => (
          <MarqueeLogo
            key={`${sponsor.id}-${index}`}
            sponsor={sponsor}
            variant={variant}
            size={resolvedSize}
          />
        ))}
      </div>
    </div>
  )
}

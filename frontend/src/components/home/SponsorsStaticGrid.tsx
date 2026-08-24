import { useSponsors } from '@/hooks/useSponsors'
import { mockSponsors } from '@/lib/mockData'
import type { Sponsor } from '@/types'
import { cn } from '@/lib/utils'

interface SponsorsStaticGridProps {
  className?: string
  tone?: 'navy' | 'blue' | 'light'
}

/** BlockDAG-style static logo wall — same partners as the marquee, not scrolling. */
export function SponsorsStaticGrid({ className, tone = 'navy' }: SponsorsStaticGridProps) {
  const { data: sponsors } = useSponsors()
  const list = (sponsors && sponsors.length > 0 ? sponsors : mockSponsors) as Sponsor[]

  if (list.length === 0) return null

  const emptyCard =
    tone === 'light'
      ? 'border-black/10 bg-white'
      : 'border-white/20 bg-white'

  return (
    <div
      className={cn(
        'mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6',
        className,
      )}
      aria-label="Official partners logos"
    >
      {list.map((sponsor) => {
        const href = sponsor.website_url && sponsor.website_url !== '#' ? sponsor.website_url : null
        const hasPhoto = Boolean(sponsor.logo_url)
        const inner = hasPhoto ? (
          <img
            src={sponsor.logo_url}
            alt={sponsor.name}
            className="block h-full w-full object-cover object-center"
          />
        ) : (
          <span className="max-w-[90%] truncate px-2 text-center text-sm font-display font-bold text-ink/70">
            {sponsor.name}
          </span>
        )

        const classNameCard = cn(
          'relative h-20 w-full overflow-hidden rounded-xl border p-0 sm:h-24',
          hasPhoto
            ? cn(
                'block',
                tone === 'light' ? 'border-black/10 bg-white' : 'border-white/20 bg-white',
              )
            : cn('flex items-center justify-center', emptyCard),
          !hasPhoto && tone !== 'light' && 'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]',
        )

        if (!href) {
          return (
            <div key={sponsor.id} className={classNameCard}>
              {inner}
            </div>
          )
        }

        return (
          <a
            key={sponsor.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(classNameCard, 'transition-transform hover:-translate-y-0.5')}
            aria-label={sponsor.name}
          >
            {inner}
          </a>
        )
      })}
    </div>
  )
}

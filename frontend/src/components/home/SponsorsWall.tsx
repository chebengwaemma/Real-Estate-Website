import { SponsorLogo } from '@/components/cards/SponsorLogo'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useSponsors } from '@/hooks/useSponsors'
import { mockSponsors } from '@/lib/mockData'
import { cn } from '@/lib/utils'

interface SponsorsWallProps {
  className?: string
}

/** Two-column photo grid — actual partner images, no Sponsor 01/02 labels. */
export function SponsorsWall({ className }: SponsorsWallProps) {
  const { data: sponsors, isLoading } = useSponsors()
  const source = sponsors && sponsors.length > 0 ? sponsors : mockSponsors
  const list = source.filter((s) => Boolean(s.logo_url))

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size={28} className="text-white" />
      </div>
    )
  }

  if (list.length === 0) return null

  return (
    <div
      className={cn(
        'mx-auto grid max-w-3xl grid-cols-2 items-center gap-3 sm:gap-5',
        className,
      )}
    >
      {list.map((sponsor, index) => (
        <SponsorLogo key={sponsor.id} sponsor={sponsor} index={index} variant="wall" />
      ))}
    </div>
  )
}

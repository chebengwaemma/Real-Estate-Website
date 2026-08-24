import { useSponsors } from '@/hooks/useSponsors'
import { mockSponsors } from '@/lib/mockData'
import type { Sponsor } from '@/types'
import { cn } from '@/lib/utils'

type Photo = { id: string; src: string; name: string; href?: string | null }

function photosFromSponsors(sponsors: Sponsor[]): Photo[] {
  return sponsors
    .filter((s) => Boolean(s.logo_url?.trim()))
    .map((s) => ({
      id: s.id,
      src: s.logo_url.trim(),
      name: s.name,
      href: s.website_url && s.website_url !== '#' ? s.website_url : null,
    }))
}

function loopTrack(photos: Photo[]): Photo[] {
  if (photos.length === 0) return []
  const copies = Math.max(3, Math.ceil(6 / photos.length))
  return Array.from({ length: copies }, () => photos).flat()
}

function PhotoCard({ photo }: { photo: Photo }) {
  const inner = (
    <span className="relative block aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] sm:rounded-3xl">
      <img
        src={photo.src}
        alt={photo.name}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </span>
  )
  if (!photo.href) return inner
  return (
    <a href={photo.href} target="_blank" rel="noopener noreferrer" aria-label={photo.name} className="block">
      {inner}
    </a>
  )
}

function VerticalColumn({
  photos,
  durationSec,
  direction,
  fadeFrom,
}: {
  photos: Photo[]
  durationSec: number
  direction: 'down' | 'up'
  fadeFrom: string
}) {
  const loop = [...photos, ...photos]

  return (
    <div className="relative h-[18rem] overflow-hidden sm:h-[24rem]">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b to-transparent sm:h-14',
          fadeFrom,
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t to-transparent sm:h-14',
          fadeFrom,
        )}
      />
      <div
        className={cn('flex flex-col gap-3 sm:gap-5', direction === 'up' ? 'animate-sponsor-up' : 'animate-sponsor-down')}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {loop.map((photo, index) => (
          <PhotoCard key={`${photo.id}-${index}`} photo={photo} />
        ))}
      </div>
    </div>
  )
}

interface SponsorsDualCarouselProps {
  className?: string
  tone?: 'blue' | 'navy'
}

/** Two columns of sponsor photos: left scrolls down, right scrolls up. */
export function SponsorsDualCarousel({ className, tone = 'blue' }: SponsorsDualCarouselProps) {
  const { data: sponsors } = useSponsors()
  const source = (sponsors && sponsors.length > 0 ? sponsors : mockSponsors) ?? []
  const photos = photosFromSponsors(source)
  const track = loopTrack(photos)

  if (track.length === 0) return null

  const leftTrack = track.filter((_, i) => i % 2 === 0)
  const rightTrack = track.filter((_, i) => i % 2 === 1)
  const left = leftTrack.length ? leftTrack : track
  const right = rightTrack.length ? rightTrack : [...track].reverse()
  const fadeFrom = tone === 'navy' ? 'from-navy' : 'from-[#0099FF]'

  return (
    <div
      className={cn('mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 px-4 sm:gap-5 sm:px-6', className)}
      aria-label="Sponsor up and down carousel"
    >
      <VerticalColumn photos={left} durationSec={24} direction="down" fadeFrom={fadeFrom} />
      <VerticalColumn photos={right} durationSec={28} direction="up" fadeFrom={fadeFrom} />
    </div>
  )
}

import { SectionHeading } from '@/components/common/SectionHeading'
import { Carousel } from '@/components/common/Carousel'
import { TimelineCard } from '@/components/cards/TimelineCard'
import { useSiteSettings, useTimeline } from '@/hooks/useCms'
import { defaultTimeline } from '@/lib/cmsDefaults'
import { cmsList } from '@/lib/cmsList'
import { CHAMPIONSHIP_DATES, CHAMPIONSHIP_LOCATION } from '@/components/home/ChampionshipBanner'
import type { TimelineItem } from '@/types'

export function KeyDatesSection() {
  const { data: settings } = useSiteSettings()
  const { data } = useTimeline()
  const location = settings?.championship_location ?? CHAMPIONSHIP_LOCATION
  const dates = settings?.championship_dates ?? CHAMPIONSHIP_DATES
  const timeline: TimelineItem[] = cmsList(data, defaultTimeline).map((t) => ({
    id: t.id,
    quarter: t.quarter,
    title: t.title,
    items: t.items,
    status: t.status,
  }))

  return (
    <section className="section-y bg-navy">
      <div className="container-page">
        <SectionHeading
          eyebrow="SEASON ROADMAP"
          title="Key Dates"
          subtitle={`${location} · ${dates}`}
          tone="dark"
        />
        <div className="mt-12">
          <Carousel slideClassName="w-[min(100%,18rem)] sm:w-80" tone="dark">
            {timeline.map((item, i) => (
              <TimelineCard key={item.id} item={item} index={i} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

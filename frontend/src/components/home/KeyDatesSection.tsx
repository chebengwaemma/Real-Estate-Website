import { SectionHeading } from '@/components/common/SectionHeading'
import { Carousel } from '@/components/common/Carousel'
import { TimelineCard } from '@/components/cards/TimelineCard'
import { CHAMPIONSHIP_DATES, CHAMPIONSHIP_LOCATION } from '@/components/home/ChampionshipBanner'
import type { TimelineItem } from '@/types'

const timeline: TimelineItem[] = [
  {
    id: 't0',
    quarter: '2027',
    title: 'World Championship — Atlanta',
    items: [CHAMPIONSHIP_LOCATION, CHAMPIONSHIP_DATES, 'Checkers / Draughts'],
    status: 'active',
  },
  { id: 't1', quarter: 'Q1', title: 'Registration Opens', items: ['Early-bird entry fee', 'Player profile setup'], status: 'done' },
  { id: 't2', quarter: 'Q1', title: 'Regional Qualifiers Begin', items: ['9 host cities', '5 continents'], status: 'upcoming' },
  { id: 't3', quarter: 'Q2', title: 'Qualifiers Conclude', items: ['Regional champions crowned', 'Bracket seeding published'], status: 'upcoming' },
  { id: 't4', quarter: 'Q3', title: 'World Semifinals', items: ['Live-streamed matches', 'Certified referee panel'], status: 'upcoming' },
  { id: 't5', quarter: 'July', title: 'World Final — Atlanta, USA', items: [CHAMPIONSHIP_DATES, 'Global broadcast'], status: 'upcoming' },
]

export function KeyDatesSection() {
  return (
    <section className="section-y bg-navy">
      <div className="container-page">
        <SectionHeading
          eyebrow="SEASON ROADMAP"
          title="Key Dates"
          subtitle={`${CHAMPIONSHIP_LOCATION} · ${CHAMPIONSHIP_DATES}`}
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

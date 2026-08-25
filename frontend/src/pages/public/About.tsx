import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Globe2, MapPin, ShieldCheck, Trophy, Users } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { useCmsPage, useSiteSettings } from '@/hooks/useCms'
import { defaultCmsPages } from '@/lib/cmsDefaults'

const pillars = [
  { icon: Globe2, title: 'Global Reach', text: 'Regional qualifiers run across five continents and feed directly into the World Championship bracket.' },
  { icon: ShieldCheck, title: 'Certified Fair Play', text: 'An independent referee panel and digital move-review system protect every result, every round.' },
  { icon: Trophy, title: 'Real Stakes', text: 'A growing prize pool is distributed across finalists in the Open, Masters, and Junior divisions.' },
  { icon: Users, title: 'Open To Everyone', text: 'From first-time club players to federation-rated masters, there is a division built for every skill level.' },
]

function renderBody(body: string) {
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(body)
  if (looksHtml) {
    return <div className="prose prose-sm max-w-none text-ink/80" dangerouslySetInnerHTML={{ __html: body }} />
  }
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">
      {body}
    </div>
  )
}

export default function About() {
  const { data: page, isLoading } = useCmsPage('about')
  const { data: settings } = useSiteSettings()
  const fallback = defaultCmsPages.find((p) => p.slug === 'about')
  const title = page?.title ?? fallback?.title ?? 'About Hopeland Global Checkers'
  const body = page?.body ?? fallback?.body ?? ''
  const location = settings?.championship_location ?? 'Atlanta, Georgia, USA'
  const dates = settings?.championship_dates ?? 'July 19 – 25, 2027'

  return (
    <>
      <Helmet>
        <title>About — {SITE_NAME}</title>
        <meta name="description" content="Learn how the Hopeland Global Checkers World Championship runs, from regional qualifiers to the live-streamed world final." />
        <link rel="canonical" href={`${SITE_URL}/about`} />
      </Helmet>

      <PageHero
        eyebrow="ABOUT THE CHAMPIONSHIP"
        title={title}
        subtitle="Hopeland Global Checkers brings together players from over 120 countries in a transparent, fairly-judged path from local qualifier to world champion."
      />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-3xl">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={28} className="text-primary" />
            </div>
          ) : (
            renderBody(body)
          )}
        </div>
      </section>

      <section className="section-y bg-surface-light">
        <div className="container-page">
          <SectionHeading eyebrow="THE FORMAT" title="How The Championship Works" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            {pillars.map((pillar) => (
              <Card key={pillar.title}>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <pillar.icon size={24} />
                </span>
                <h3 className="text-h3 mt-5 text-ink">{pillar.title}</h3>
                <p className="mt-2 text-sm text-muted">{pillar.text}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-y bg-surface-white">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          {[
            { title: 'Open Division', text: 'Open to all players. Regional qualifiers determine seeding for the World Championship bracket.' },
            { title: 'Masters Division', text: 'Reserved for federation-rated players competing for the highest level of recognition.' },
            { title: 'Junior Division', text: 'For competitors under 16, with dedicated qualifiers and a standalone Junior world title.' },
          ].map((division, index) => (
            <motion.div
              key={division.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-black/5 bg-white p-8 shadow-card"
            >
              <p className="text-eyebrow mb-3">Division 0{index + 1}</p>
              <h3 className="text-h3 text-ink">{division.title}</h3>
              <p className="mt-2 text-sm text-muted">{division.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-y bg-surface-light">
        <div className="container-page">
          <SectionHeading eyebrow="LOCATION" title="Address" />
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-6 shadow-card">
            <MapPin className="mt-1 shrink-0 text-primary" size={20} />
            <div>
              <p className="font-bold text-ink">Hopeland Global Checkers (Draughts) Federation</p>
              <p className="mt-1 text-sm text-muted">{location}</p>
              <p className="text-sm text-muted">{dates}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { SponsorsWall } from '@/components/home/SponsorsWall'
import { Button } from '@/components/common/Button'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export default function Sponsors() {
  return (
    <>
      <Helmet>
        <title>Sponsors — {SITE_NAME}</title>
        <meta name="description" content="Meet the organizations powering the Hopeland Global Checkers World Championship." />
        <link rel="canonical" href={`${SITE_URL}/sponsors`} />
      </Helmet>

      <section className="bg-[#0099FF] py-16 text-white sm:py-24">
        <div className="container-page">
          <p className="text-center text-[11px] font-semibold tracking-[0.22em] text-white/80 uppercase">
            Our partners
          </p>
          <h1 className="text-h1 mt-3 text-center text-white">Sponsors</h1>
          <p className="text-body-lg mx-auto mt-3 max-w-xl text-center text-white/85">
            The organizations powering every board, broadcast, and prize pool of the championship.
          </p>
          <div className="mt-12 sm:mt-16">
            <SponsorsWall />
          </div>
        </div>
      </section>

      <section className="section-y bg-navy text-center text-white">
        <div className="container-page">
          <h2 className="text-h2 text-white">Become a Championship Sponsor</h2>
          <p className="text-body-lg mx-auto mt-4 max-w-xl text-white/70">
            Reach a global audience of players, coaches, and fans across more than 120 countries.
          </p>
          <div className="mt-8">
            <Link to="/contact">
              <Button size="lg">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

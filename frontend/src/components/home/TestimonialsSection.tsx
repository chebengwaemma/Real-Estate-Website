import { SectionHeading } from '@/components/common/SectionHeading'
import { Carousel } from '@/components/common/Carousel'
import { TestimonialCard } from '@/components/cards/TestimonialCard'
import { useTestimonials } from '@/hooks/useCms'
import { defaultTestimonials } from '@/lib/cmsDefaults'
import { cmsList } from '@/lib/cmsList'
import type { TestimonialItem } from '@/types'

export function TestimonialsSection() {
  const { data } = useTestimonials()
  const testimonials: TestimonialItem[] = cmsList(data, defaultTestimonials).map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    quote: t.quote,
    avatarInitials: t.avatar_initials,
  }))

  return (
    <section className="section-y bg-surface-white">
      <div className="container-page">
        <SectionHeading eyebrow="COMMUNITY" title="Join The Fastest Growing Community" subtitle="Hear from players and coaches across the Hopeland Global Checkers community." />
        <div className="mt-12">
          <Carousel slideClassName="w-[min(100%,20rem)] sm:w-96">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

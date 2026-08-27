import { SectionHeading } from '@/components/common/SectionHeading'
import { FAQItem } from '@/components/cards/FAQItem'
import { useTranslation } from 'react-i18next'
import { useFaqs } from '@/hooks/useCms'
import { defaultFaqs } from '@/lib/cmsDefaults'
import { cmsList } from '@/lib/cmsList'
import type { FaqItem } from '@/types'

export function FAQSection() {
  const { t } = useTranslation('home')
  const { data } = useFaqs()
  const faqs: FaqItem[] = cmsList(data, defaultFaqs).map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }))

  return (
    <section className="section-y bg-navy">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} tone="dark" />
        <div className="mt-10">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.id} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

import { Helmet } from 'react-helmet-async'
import { PageHero } from '@/components/layout/PageHero'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { useCmsPage } from '@/hooks/useCms'
import { defaultCmsPages } from '@/lib/cmsDefaults'

function renderBody(body: string) {
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(body)
  if (looksHtml) {
    return <div className="prose prose-sm max-w-none text-ink/80" dangerouslySetInnerHTML={{ __html: body }} />
  }
  return <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">{body}</div>
}

export default function PrivacyPolicy() {
  const { data: page, isLoading } = useCmsPage('privacy-policy')
  const fallback = defaultCmsPages.find((p) => p.slug === 'privacy-policy')
  const title = page?.title ?? fallback?.title ?? 'Privacy Policy'
  const body = page?.body ?? fallback?.body ?? ''

  return (
    <>
      <Helmet>
        <title>Privacy Policy — {SITE_NAME}</title>
        <link rel="canonical" href={`${SITE_URL}/privacy-policy`} />
      </Helmet>

      <PageHero eyebrow="LEGAL" title={title} />

      <section className="section-y bg-surface-white">
        <div className="container-page max-w-3xl text-ink/80">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={28} className="text-primary" />
            </div>
          ) : (
            renderBody(body)
          )}
        </div>
      </section>
    </>
  )
}

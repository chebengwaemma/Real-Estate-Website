import { Helmet } from 'react-helmet-async'
import { PageHero } from '@/components/layout/PageHero'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { useCmsPage } from '@/hooks/useCms'
import { defaultCmsPages } from '@/lib/cmsDefaults'
import { useTranslation } from 'react-i18next'
import { cmsOrTranslated } from '@/lib/localizedCms'

function renderBody(body: string) {
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(body)
  if (looksHtml) {
    return <div className="prose prose-sm max-w-none text-ink/80" dangerouslySetInnerHTML={{ __html: body }} />
  }
  return <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">{body}</div>
}

function CmsSlugPage({
  slug,
  path,
  eyebrowKey,
  fallbackTitleKey,
  fallbackBodyKey,
}: {
  slug: string
  path: string
  eyebrowKey: string
  fallbackTitleKey: string
  fallbackBodyKey: string
}) {
  const { t, i18n } = useTranslation()
  const { data: page, isLoading } = useCmsPage(slug)
  const fallback = defaultCmsPages.find((p) => p.slug === slug)
  const title = cmsOrTranslated(i18n.language, page?.title ?? fallback?.title, t(fallbackTitleKey))
  const body = page?.body?.trim() || fallback?.body || t(fallbackBodyKey)

  return (
    <>
      <Helmet>
        <title>
          {title} — {SITE_NAME}
        </title>
        <link rel="canonical" href={`${SITE_URL}${path}`} />
      </Helmet>
      <PageHero eyebrow={t(eyebrowKey)} title={title} />
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

export default function LeadershipPage() {
  return (
    <CmsSlugPage
      slug="leadership"
      path="/leadership"
      eyebrowKey="pages.leadership.eyebrow"
      fallbackTitleKey="pages.leadership.fallbackTitle"
      fallbackBodyKey="pages.leadership.fallbackBody"
    />
  )
}

export function RulesPage() {
  return (
    <CmsSlugPage
      slug="rules"
      path="/rules"
      eyebrowKey="pages.rules.eyebrow"
      fallbackTitleKey="pages.rules.fallbackTitle"
      fallbackBodyKey="pages.rules.fallbackBody"
    />
  )
}

export function Competition2027Page() {
  return (
    <CmsSlugPage
      slug="competition-2027"
      path="/competition-2027"
      eyebrowKey="pages.competition2027.eyebrow"
      fallbackTitleKey="pages.competition2027.fallbackTitle"
      fallbackBodyKey="pages.competition2027.fallbackBody"
    />
  )
}

import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { useCmsPageMutations, useCmsPages, useSiteSettings, useUpdateSiteSettings } from '@/hooks/useCms'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { cn } from '@/lib/utils'
import type { CmsPage } from '@/types'
import { DEFAULT_HEADER_EDITABLE, parseNavJson } from '@/lib/navConfig'

export default function CmsPagesManager() {
  const { data, isLoading } = useCmsPages()
  const { data: settings } = useSiteSettings()
  const updateSettings = useUpdateSiteSettings()
  const { update, create } = useCmsPageMutations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newTitle, setNewTitle] = useState('')

  const pages = data ?? []
  const selected = pages.find((p) => p.id === selectedId) ?? pages[0] ?? null

  useEffect(() => {
    if (!selectedId && pages[0]) setSelectedId(pages[0].id)
  }, [pages, selectedId])

  useEffect(() => {
    if (selected) {
      setTitle(selected.title)
      setBody(selected.body)
    }
  }, [selected?.id])

  const save = async () => {
    if (!selected) return
    try {
      await update.mutateAsync({ id: selected.id, title, body })
      toast.success('Page saved. Header and footer show this title when the link uses this page.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save.')
    }
  }

  const addPage = async () => {
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
    try {
      await create.mutateAsync({ slug: newSlug, title: newTitle })
      if (settings) {
        const items = parseNavJson(settings.extras.header_nav) ?? DEFAULT_HEADER_EDITABLE
        const to = `/${slug}`
        if (!items.some((item) => item.to === to)) {
          await updateSettings.mutateAsync({
            ...settings,
            extras: {
              ...settings.extras,
              header_nav: JSON.stringify([...items, { to, label: newTitle.trim(), cmsSlug: slug }]),
            },
          })
        }
      }
      toast.success(`Page created at /${slug} and added to the header. Save Site Settings if you want it in the footer too.`)
      setNewSlug('')
      setNewTitle('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create page.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size={28} className="text-primary" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Pages — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="text-h2 text-ink">Pages</h1>
      <p className="mt-1 text-sm text-muted">
        Edit titles and body for About, Leadership, Rules, 2027 Competition, Privacy, Terms, and any page you create.
        New pages get a public URL immediately and are added to the header. Reorder or add footer links in Site Settings.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {pages.map((p: CmsPage) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold',
              (selected?.id ?? selectedId) === p.id ? 'bg-primary text-white' : 'bg-black/5 text-ink',
            )}
          >
            {p.title || p.slug}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-6 max-w-3xl rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">/{selected.slug}</p>
          <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-ink">Body</p>
            <RichTextEditor value={body} onChange={setBody} rows={16} />
          </div>
          <Button className="mt-6" size="lg" onClick={() => void save()} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save page'}
          </Button>
        </div>
      )}

      <div className="mt-8 max-w-3xl rounded-2xl border border-dashed border-black/15 bg-white p-6">
        <h2 className="text-sm font-bold text-ink">Add another editable page</h2>
        <p className="mt-1 text-xs text-muted">
          Slug becomes the live URL, e.g. <code>history</code> → https://hcheckers.org/history
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="history" />
          <FormField label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Our History" />
        </div>
        <Button className="mt-4" variant="secondary" onClick={() => void addPage()} disabled={create.isPending || !newSlug || !newTitle}>
          {create.isPending ? 'Creating…' : 'Create page'}
        </Button>
      </div>
    </>
  )
}

import { useEffect, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useCms'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { defaultSiteSettings } from '@/lib/cmsDefaults'
import type { SiteSettings } from '@/types'
import { useState } from 'react'

export default function SiteSettingsManager() {
  const { data, isLoading } = useSiteSettings()
  const update = useUpdateSiteSettings()
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const set = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const { id: _id, updated_at: _u, ...payload } = form
      await update.mutateAsync(payload)
      toast.success('Site settings saved. Public pages will update shortly.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save settings.')
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
        <title>Site Settings — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="text-h2 text-ink">Site Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Championship meta, announcement bar, hero, footer, and contact — controls the public frontend.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 flex max-w-3xl flex-col gap-8">
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-h3 text-ink">Championship</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Location" value={form.championship_location} onChange={(e) => set('championship_location', e.target.value)} />
            <FormField label="Dates (display)" value={form.championship_dates} onChange={(e) => set('championship_dates', e.target.value)} />
            <FormField label="Start date" type="date" value={form.championship_dates_start} onChange={(e) => set('championship_dates_start', e.target.value)} />
            <FormField label="End date" type="date" value={form.championship_dates_end} onChange={(e) => set('championship_dates_end', e.target.value)} />
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-h3 text-ink">Announcement bar</h2>
          <div className="mt-4 grid gap-4">
            <FormField label="Text" value={form.announcement_text} onChange={(e) => set('announcement_text', e.target.value)} />
            <FormField label="CTA" value={form.announcement_cta} onChange={(e) => set('announcement_cta', e.target.value)} />
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-h3 text-ink">Hero</h2>
          <div className="mt-4 flex flex-col gap-4">
            <FormField label="Eyebrow" value={form.hero_eyebrow} onChange={(e) => set('hero_eyebrow', e.target.value)} />
            <FormField label="Title" value={form.hero_title} onChange={(e) => set('hero_title', e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-ink">Subtitle</label>
              <textarea
                value={form.hero_subtitle}
                onChange={(e) => set('hero_subtitle', e.target.value)}
                rows={3}
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-h3 text-ink">About teaser & Final CTA</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-ink">About teaser</label>
              <textarea
                value={form.about_teaser}
                onChange={(e) => set('about_teaser', e.target.value)}
                rows={4}
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <FormField label="Final CTA title" value={form.final_cta_title} onChange={(e) => set('final_cta_title', e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-ink">Final CTA subtitle</label>
              <textarea
                value={form.final_cta_subtitle}
                onChange={(e) => set('final_cta_subtitle', e.target.value)}
                rows={2}
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-h3 text-ink">Contact & Footer</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Contact email" type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
            <FormField label="Twitter / X URL" value={form.social_twitter} onChange={(e) => set('social_twitter', e.target.value)} />
            <FormField label="Instagram URL" value={form.social_instagram} onChange={(e) => set('social_instagram', e.target.value)} />
            <FormField label="Facebook URL" value={form.social_facebook} onChange={(e) => set('social_facebook', e.target.value)} />
            <FormField label="YouTube URL" value={form.social_youtube} onChange={(e) => set('social_youtube', e.target.value)} />
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Footer tagline</label>
            <textarea
              value={form.footer_tagline}
              onChange={(e) => set('footer_tagline', e.target.value)}
              rows={3}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </section>

        <Button type="submit" size="lg" disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save site settings'}
        </Button>
      </form>
    </>
  )
}

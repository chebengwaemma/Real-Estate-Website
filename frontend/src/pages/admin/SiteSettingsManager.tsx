import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useCms'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FileUploadDropzone } from '@/components/admin/FileUploadDropzone'
import { defaultSiteSettings } from '@/lib/cmsDefaults'
import { cmsErrorMessage } from '@/lib/cmsError'
import { normalizeSiteSettings } from '@/lib/siteSettings'
import { SITE_SETTING_FIELDS, SITE_SETTING_SECTIONS, type SiteSettingFieldDef } from '@/lib/siteSettingsFields'
import type { SiteSettings } from '@/types'

export default function SiteSettingsManager() {
  const { data, isLoading, isError, error, refetch } = useSiteSettings()
  const update = useUpdateSiteSettings()
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings)
  const [customKey, setCustomKey] = useState('')
  const [customValue, setCustomValue] = useState('')

  useEffect(() => {
    if (data) setForm(normalizeSiteSettings(data))
  }, [data])

  const sections = useMemo(() => {
    const map = new Map<string, SiteSettingFieldDef[]>()
    for (const section of SITE_SETTING_SECTIONS) {
      if (section === 'Custom') continue
      map.set(section, [])
    }
    for (const field of SITE_SETTING_FIELDS) {
      const list = map.get(field.section) ?? []
      list.push(field)
      map.set(field.section, list)
    }
    return [...map.entries()].filter(([, fields]) => fields.length > 0)
  }, [])

  const setColumn = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const setExtra = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, extras: { ...prev.extras, [key]: value } }))
  }

  const removeExtra = (key: string) => {
    setForm((prev) => {
      const next = { ...prev.extras }
      delete next[key]
      return { ...prev, extras: next }
    })
  }

  const addCustomField = () => {
    const key = customKey.trim().replace(/\s+/g, '_').toLowerCase()
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      toast.error('Custom key must start with a letter (a-z) and use letters, numbers, underscore.')
      return
    }
    if (key in form && key !== 'extras') {
      toast.error('That key is already a built-in setting.')
      return
    }
    setExtra(key, customValue)
    setCustomKey('')
    setCustomValue('')
    toast.success(`Custom field “${key}” added — click Save to persist.`)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await update.mutateAsync(form)
      toast.success('Settings saved. Public website will show the new values.')
    } catch (err) {
      toast.error(cmsErrorMessage(err, 'Could not save settings.'))
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
        Admin → Supabase → Frontend. Save once; public pages load these values automatically.
      </p>

      {isError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {cmsErrorMessage(error, 'Could not load settings.')}{' '}
          <button type="button" className="font-semibold underline" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        First-time setup: Supabase → SQL Editor → run{' '}
        <code className="font-mono text-xs">backend/supabase/FIX_ADMIN_SAVE.sql</code>, then Save here.
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 flex max-w-3xl flex-col gap-8">
        {sections.map(([section, fields]) => (
          <section key={section} className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
            <h2 className="text-h3 text-ink">{section}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const value =
                  field.storage === 'extras'
                    ? (form.extras[field.key] ?? '')
                    : String(form[field.key as keyof SiteSettings] ?? '')

                if (field.type === 'image') {
                  return (
                    <div key={field.key} className="sm:col-span-2">
                      <FileUploadDropzone
                        label={field.label}
                        bucket="sponsor-logos"
                        accept="image/*"
                        currentUrl={value}
                        onUploaded={(url) => setColumn(field.key as keyof SiteSettings, url)}
                      />
                      <FormField
                        label="Or logo URL"
                        value={value}
                        onChange={(e) => setColumn(field.key as keyof SiteSettings, e.target.value)}
                      />
                      {field.hint ? <p className="mt-1 text-xs text-muted">{field.hint}</p> : null}
                    </div>
                  )
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.key} className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-sm font-bold text-ink">{field.label}</label>
                      <textarea
                        value={value}
                        rows={field.rows ?? 3}
                        onChange={(e) =>
                          field.storage === 'extras'
                            ? setExtra(field.key, e.target.value)
                            : setColumn(field.key as keyof SiteSettings, e.target.value)
                        }
                        className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  )
                }

                return (
                  <FormField
                    key={field.key}
                    label={field.label}
                    type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
                    value={value}
                    onChange={(e) =>
                      field.storage === 'extras'
                        ? setExtra(field.key, e.target.value)
                        : setColumn(field.key as keyof SiteSettings, e.target.value)
                    }
                  />
                )
              })}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-h3 text-ink">Custom fields</h2>
          <p className="mt-1 text-sm text-muted">
            Extra keys are stored in <code className="text-xs">extras</code> — no SQL needed. Use them on the frontend via{' '}
            <code className="text-xs">settings.extras.your_key</code>.
          </p>

          {Object.keys(form.extras).length > 0 ? (
            <div className="mt-4 grid gap-3">
              {Object.entries(form.extras).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <FormField label={key} value={value} onChange={(e) => setExtra(key, e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" onClick={() => removeExtra(key)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <FormField label="New key" placeholder="whatsapp_url" value={customKey} onChange={(e) => setCustomKey(e.target.value)} />
            <FormField label="Value" placeholder="https://…" value={customValue} onChange={(e) => setCustomValue(e.target.value)} />
            <Button type="button" variant="secondary" onClick={addCustomField}>
              Add field
            </Button>
          </div>
        </section>

        <Button type="submit" size="lg" disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save settings'}
        </Button>
      </form>
    </>
  )
}

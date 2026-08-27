import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import {
  mockCmsPages,
  mockContactMessages,
  mockFaqs,
  mockSiteFeatures,
  mockSiteSettings,
  mockSiteStats,
  mockSportsGames,
  mockTestimonials,
  mockTimeline,
  persistCmsPages,
  persistContactMessages,
  persistFaqs,
  persistSiteFeatures,
  persistSiteStats,
  persistSportsGames,
  persistTestimonials,
  persistTimeline,
  setMockSiteSettings,
} from '@/lib/mockData'
import { defaultSiteSettings } from '@/lib/cmsDefaults'
import { cmsErrorMessage, isCmsTableMissing } from '@/lib/cmsError'
import { normalizeSiteSettings, siteSettingsToPayload } from '@/lib/siteSettings'
import type {
  CmsPage,
  ContactMessage,
  FaqRow,
  FeatureRow,
  SiteSettings,
  SiteStatRow,
  SportsGameRow,
  TestimonialRow,
  TimelineRow,
} from '@/types'

function throwCms(err: unknown, fallback: string): never {
  throw new Error(cmsErrorMessage(err, fallback))
}

function normalizeTimeline(rows: TimelineRow[]): TimelineRow[] {
  return rows.map((row) => ({
    ...row,
    items: Array.isArray(row.items)
      ? row.items
      : typeof row.items === 'string'
        ? (JSON.parse(row.items) as string[])
        : [],
  }))
}

const CMS_QUERY = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
} as const

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    ...CMS_QUERY,
    queryFn: async (): Promise<SiteSettings> => {
      if (!isSupabaseConfigured) return normalizeSiteSettings(mockSiteSettings)
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (error) {
        if (isCmsTableMissing(error)) return { ...defaultSiteSettings }
        throwCms(error, 'Could not load site settings.')
      }
      return normalizeSiteSettings(data as SiteSettings | null)
    },
  })
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SiteSettings | Partial<SiteSettings>) => {
      const merged = normalizeSiteSettings({ ...defaultSiteSettings, ...input } as SiteSettings)
      if (!isSupabaseConfigured) {
        const next = { ...merged, updated_at: new Date().toISOString() }
        setMockSiteSettings(next)
        return next
      }

      const payload = siteSettingsToPayload(merged)

      type RpcResult = { data: unknown; error: { message: string; code?: string } | null }
      const rpcClient = supabase as unknown as {
        rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<RpcResult>
      }
      const rpc = await rpcClient.rpc('save_site_settings', { data: payload })
      if (!rpc.error && rpc.data) {
        return normalizeSiteSettings(rpc.data as SiteSettings)
      }

      // Fallback: direct upsert (older DB without RPC)
      if (rpc.error && !isMissingRpc(rpc.error)) {
        throwCms(rpc.error, 'Could not save settings.')
      }

      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, ...payload, updated_at: new Date().toISOString() } as never)
        .select('*')
        .single()
      if (error) {
        if (isCmsTableMissing(error) || isMissingRpc(rpc.error)) {
          throw new Error(
            'Settings API missing. Run backend/supabase/FIX_ADMIN_SAVE.sql in Supabase SQL Editor, then Save again.',
          )
        }
        throwCms(error, 'Could not save settings.')
      }
      return normalizeSiteSettings(data as SiteSettings)
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['site_settings'], saved)
      void queryClient.invalidateQueries({ queryKey: ['site_settings'] })
    },
  })
}

function isMissingRpc(err: unknown): boolean {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err && 'message' in err
        ? String((err as { message: unknown }).message)
        : ''
  const code =
    typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : ''
  return (
    code === 'PGRST202' ||
    /could not find the function|function .* does not exist|save_site_settings/i.test(message)
  )
}

function useOrderedCollection<T extends { id: string; display_order?: number }>(opts: {
  key: string
  table: string
  mock: T[]
  persist: () => void
  publicFilter?: (row: T) => boolean
  mapRows?: (rows: T[]) => T[]
}) {
  const query = useQuery({
    queryKey: [opts.key],
    ...CMS_QUERY,
    queryFn: async (): Promise<T[]> => {
      if (!isSupabaseConfigured) {
        const rows = [...opts.mock].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        return opts.mapRows ? opts.mapRows(rows) : rows
      }
      const { data, error } = await supabase.from(opts.table).select('*').order('display_order', { ascending: true })
      if (error) {
        if (isCmsTableMissing(error)) return []
        throwCms(error, `Could not load ${opts.table}.`)
      }
      let rows = (data ?? []) as T[]
      if (opts.mapRows) rows = opts.mapRows(rows)
      return rows
    },
  })

  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [opts.key] })

  const create = useMutation({
    mutationFn: async (input: Partial<T>) => {
      if (!isSupabaseConfigured) {
        const row = {
          id: crypto.randomUUID(),
          display_order: opts.mock.length + 1,
          created_at: new Date().toISOString(),
          ...input,
        } as unknown as T
        opts.mock.push(row)
        opts.persist()
        return row
      }
      const { count } = await supabase.from(opts.table).select('*', { count: 'exact', head: true })
      const { error } = await supabase.from(opts.table).insert({
        ...input,
        display_order: (input as { display_order?: number }).display_order ?? (count ?? 0) + 1,
      } as never)
      if (error) throwCms(error, `Could not create ${opts.table} row.`)
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<T> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const index = opts.mock.findIndex((r) => r.id === id)
        if (index !== -1) {
          opts.mock[index] = { ...opts.mock[index], ...input }
          opts.persist()
        }
        return
      }
      const { error } = await supabase.from(opts.table).update(input as never).eq('id', id)
      if (error) throwCms(error, `Could not update ${opts.table} row.`)
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const index = opts.mock.findIndex((r) => r.id === id)
        if (index !== -1) {
          opts.mock.splice(index, 1)
          opts.persist()
        }
        return
      }
      const { error } = await supabase.from(opts.table).delete().eq('id', id)
      if (error) throwCms(error, `Could not delete ${opts.table} row.`)
    },
    onSuccess: invalidate,
  })

  return { query, create, update, remove }
}

export function useSiteStats(admin = false) {
  const { query, create, update, remove } = useOrderedCollection<SiteStatRow>({
    key: 'site_stats',
    table: 'site_stats',
    mock: mockSiteStats,
    persist: persistSiteStats,
  })
  return { ...query, create, update, remove, admin }
}

export function useSiteFeatures() {
  const { query, create, update, remove } = useOrderedCollection<FeatureRow>({
    key: 'site_features',
    table: 'site_features',
    mock: mockSiteFeatures,
    persist: persistSiteFeatures,
  })
  return { ...query, create, update, remove }
}

export function useFaqs(admin = false) {
  const { query, create, update, remove } = useOrderedCollection<FaqRow>({
    key: 'faqs',
    table: 'faqs',
    mock: mockFaqs,
    persist: persistFaqs,
  })
  const data = admin ? query.data : query.data?.filter((f) => f.published !== false)
  return { ...query, data, create, update, remove }
}

export function useTestimonials(admin = false) {
  const { query, create, update, remove } = useOrderedCollection<TestimonialRow>({
    key: 'testimonials',
    table: 'testimonials',
    mock: mockTestimonials,
    persist: persistTestimonials,
  })
  const data = admin ? query.data : query.data?.filter((t) => t.published !== false)
  return { ...query, data, create, update, remove }
}

export function useTimeline() {
  const { query, create, update, remove } = useOrderedCollection<TimelineRow>({
    key: 'timeline_items',
    table: 'timeline_items',
    mock: mockTimeline,
    persist: persistTimeline,
    mapRows: normalizeTimeline,
  })
  return { ...query, create, update, remove }
}

export function useCmsPages() {
  return useQuery({
    queryKey: ['cms_pages'],
    ...CMS_QUERY,
    queryFn: async (): Promise<CmsPage[]> => {
      if (!isSupabaseConfigured) return [...mockCmsPages]
      const { data, error } = await supabase.from('cms_pages').select('*').order('slug')
      if (error) throwCms(error, 'Database operation failed.')
      return data ?? []
    },
  })
}

export function useCmsPage(slug: string) {
  return useQuery({
    queryKey: ['cms_pages', slug],
    enabled: Boolean(slug),
    ...CMS_QUERY,
    queryFn: async (): Promise<CmsPage | null> => {
      if (!isSupabaseConfigured) return mockCmsPages.find((p) => p.slug === slug) ?? null
      const { data, error } = await supabase.from('cms_pages').select('*').eq('slug', slug).maybeSingle()
      if (error) throwCms(error, 'Database operation failed.')
      return data
    },
  })
}

export function useCmsPageMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cms_pages'] })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CmsPage> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const index = mockCmsPages.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockCmsPages[index] = {
            ...mockCmsPages[index],
            ...input,
            updated_at: new Date().toISOString(),
          }
          persistCmsPages()
        }
        return
      }
      const { error } = await supabase
        .from('cms_pages')
        .update({ ...input, updated_at: new Date().toISOString() } as never)
        .eq('id', id)
      if (error) throwCms(error, 'Database operation failed.')
    },
    onSuccess: invalidate,
  })

  const create = useMutation({
    mutationFn: async (input: { slug: string; title: string; body?: string }) => {
      const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
      const title = input.title.trim()
      const body = input.body?.trim() || `<p>Edit this page to add your content.</p>`
      if (!slug || !title) throw new Error('Slug and title are required.')
      if (!isSupabaseConfigured) {
        mockCmsPages.push({
          id: crypto.randomUUID(),
          slug,
          title,
          body,
          updated_at: new Date().toISOString(),
        })
        persistCmsPages()
        return
      }
      const { error } = await supabase.from('cms_pages').insert({ slug, title, body } as never)
      if (error) throwCms(error, 'Database operation failed.')
    },
    onSuccess: invalidate,
  })

  return { update, create }
}

export function useSportsGames(admin = false) {
  const query = useQuery({
    queryKey: ['sports_games'],
    ...CMS_QUERY,
    queryFn: async (): Promise<SportsGameRow[]> => {
      if (!isSupabaseConfigured) return [...mockSportsGames].sort((a, b) => a.display_order - b.display_order)
      const { data, error } = await supabase.from('sports_games').select('*').order('display_order', { ascending: true })
      if (error) throwCms(error, 'Database operation failed.')
      return data ?? []
    },
  })
  const data = admin ? query.data : query.data?.filter((g) => g.published !== false)

  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['sports_games'] })

  const create = useMutation({
    mutationFn: async (input: Partial<SportsGameRow> & { id: string; title: string; category: string }) => {
      if (!isSupabaseConfigured) {
        mockSportsGames.push({
          id: input.id,
          title: input.title,
          provider: input.provider ?? '',
          category: input.category,
          variant: input.variant ?? 'portrait',
          gradient: input.gradient ?? 'from-[#312e81] to-[#0f172a]',
          accent: input.accent ?? null,
          badge: input.badge ?? null,
          display_order: input.display_order ?? mockSportsGames.length + 1,
          published: input.published ?? true,
          created_at: new Date().toISOString(),
        })
        persistSportsGames()
        return
      }
      const { error } = await supabase.from('sports_games').insert(input as never)
      if (error) throwCms(error, 'Database operation failed.')
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<SportsGameRow> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const index = mockSportsGames.findIndex((g) => g.id === id)
        if (index !== -1) {
          mockSportsGames[index] = { ...mockSportsGames[index], ...input }
          persistSportsGames()
        }
        return
      }
      const { error } = await supabase.from('sports_games').update(input as never).eq('id', id)
      if (error) throwCms(error, 'Database operation failed.')
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const index = mockSportsGames.findIndex((g) => g.id === id)
        if (index !== -1) {
          mockSportsGames.splice(index, 1)
          persistSportsGames()
        }
        return
      }
      const { error } = await supabase.from('sports_games').delete().eq('id', id)
      if (error) throwCms(error, 'Database operation failed.')
    },
    onSuccess: invalidate,
  })

  return { ...query, data, create, update, remove }
}

export function useContactMessages() {
  const query = useQuery({
    queryKey: ['contact_messages'],
    ...CMS_QUERY,
    queryFn: async (): Promise<ContactMessage[]> => {
      if (!isSupabaseConfigured) {
        return [...mockContactMessages].sort((a, b) => b.created_at.localeCompare(a.created_at))
      }
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throwCms(error, 'Database operation failed.')
      return data ?? []
    },
  })

  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['contact_messages'] })

  const markRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      if (!isSupabaseConfigured) {
        const index = mockContactMessages.findIndex((m) => m.id === id)
        if (index !== -1) {
          mockContactMessages[index] = { ...mockContactMessages[index], read }
          persistContactMessages()
        }
        return
      }
      const { error } = await supabase.from('contact_messages').update({ read } as never).eq('id', id)
      if (error) throwCms(error, 'Database operation failed.')
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const index = mockContactMessages.findIndex((m) => m.id === id)
        if (index !== -1) {
          mockContactMessages.splice(index, 1)
          persistContactMessages()
        }
        return
      }
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) throwCms(error, 'Database operation failed.')
    },
    onSuccess: invalidate,
  })

  return { ...query, markRead, remove }
}

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: async (input: { name: string; email: string; message: string }) => {
      if (!isSupabaseConfigured) {
        mockContactMessages.unshift({
          id: crypto.randomUUID(),
          ...input,
          read: false,
          created_at: new Date().toISOString(),
        })
        persistContactMessages()
        return
      }
      const { error } = await supabase.from('contact_messages').insert(input as never)
      if (error) throwCms(error, 'Database operation failed.')
    },
  })
}

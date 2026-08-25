import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useFaqs,
  useSiteFeatures,
  useSiteStats,
  useTestimonials,
  useTimeline,
} from '@/hooks/useCms'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { FormField } from '@/components/forms/FormField'
import { cn } from '@/lib/utils'
import type { FaqRow, FeatureRow, SiteStatRow, TestimonialRow, TimelineRow } from '@/types'

type Tab = 'stats' | 'features' | 'faqs' | 'testimonials' | 'timeline'

const tabs: { id: Tab; label: string }[] = [
  { id: 'stats', label: 'Stats' },
  { id: 'features', label: 'Features' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'timeline', label: 'Key dates' },
]

export default function HomeSectionsManager() {
  const [tab, setTab] = useState<Tab>('stats')

  return (
    <>
      <Helmet>
        <title>Home Sections — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="text-h2 text-ink">Home Sections</h1>
      <p className="mt-1 text-sm text-muted">Edit homepage stats, features, FAQs, testimonials, and timeline.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.id ? 'bg-primary text-white' : 'bg-black/5 text-ink hover:bg-black/10',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'stats' && <StatsTab />}
        {tab === 'features' && <FeaturesTab />}
        {tab === 'faqs' && <FaqsTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'timeline' && <TimelineTab />}
      </div>
    </>
  )
}

function StatsTab() {
  const { data, isLoading, create, update, remove } = useSiteStats(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SiteStatRow | null>(null)
  const [label, setLabel] = useState('')
  const [sublabel, setSublabel] = useState('')
  const [value, setValue] = useState('0')
  const [suffix, setSuffix] = useState('')

  const openCreate = () => {
    setEditing(null)
    setLabel('')
    setSublabel('')
    setValue('0')
    setSuffix('')
    setOpen(true)
  }
  const openEdit = (row: SiteStatRow) => {
    setEditing(row)
    setLabel(row.label)
    setSublabel(row.sublabel ?? '')
    setValue(String(row.value))
    setSuffix(row.suffix ?? '')
    setOpen(true)
  }
  const save = async () => {
    try {
      const payload = { label, sublabel: sublabel || null, value: Number(value) || 0, suffix }
      if (editing) await update.mutateAsync({ id: editing.id, ...payload })
      else await create.mutateAsync(payload)
      toast.success(editing ? 'Stat updated.' : 'Stat added.')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.')
    }
  }

  const columns: DataTableColumn<SiteStatRow>[] = [
    { key: 'label', header: 'Label', render: (r) => r.label },
    { key: 'value', header: 'Value', render: (r) => `${r.value}${r.suffix}` },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => openEdit(r)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Delete this stat?')) return
              await remove.mutateAsync(r.id)
              toast.success('Deleted.')
            }}
            className="rounded-lg p-2 text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add stat
        </Button>
      </div>
      <DataTable columns={columns} data={data ?? []} keyField="id" isLoading={isLoading} emptyMessage="No stats." />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit stat' : 'Add stat'}>
        <div className="flex flex-col gap-4">
          <FormField label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <FormField label="Sublabel" value={sublabel} onChange={(e) => setSublabel(e.target.value)} />
          <FormField label="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          <FormField label="Suffix" placeholder="+" value={suffix} onChange={(e) => setSuffix(e.target.value)} />
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </Modal>
    </>
  )
}

function FeaturesTab() {
  const { data, isLoading, create, update, remove } = useSiteFeatures()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FeatureRow | null>(null)
  const [icon, setIcon] = useState('Globe2')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const openCreate = () => {
    setEditing(null)
    setIcon('Globe2')
    setTitle('')
    setDescription('')
    setOpen(true)
  }
  const openEdit = (row: FeatureRow) => {
    setEditing(row)
    setIcon(row.icon)
    setTitle(row.title)
    setDescription(row.description)
    setOpen(true)
  }
  const save = async () => {
    try {
      const payload = { icon, title, description }
      if (editing) await update.mutateAsync({ id: editing.id, ...payload })
      else await create.mutateAsync(payload)
      toast.success(editing ? 'Feature updated.' : 'Feature added.')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.')
    }
  }

  const columns: DataTableColumn<FeatureRow>[] = [
    { key: 'title', header: 'Title', render: (r) => r.title },
    { key: 'icon', header: 'Icon', render: (r) => r.icon },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => openEdit(r)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Delete?')) return
              await remove.mutateAsync(r.id)
              toast.success('Deleted.')
            }}
            className="rounded-lg p-2 text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add feature
        </Button>
      </div>
      <DataTable columns={columns} data={data ?? []} keyField="id" isLoading={isLoading} emptyMessage="No features." />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit feature' : 'Add feature'}>
        <div className="flex flex-col gap-4">
          <FormField label="Icon (Lucide name)" value={icon} onChange={(e) => setIcon(e.target.value)} />
          <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl border border-black/10 px-4 py-3 text-sm" />
          </div>
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </Modal>
    </>
  )
}

function FaqsTab() {
  const { data, isLoading, create, update, remove } = useFaqs(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FaqRow | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [published, setPublished] = useState(true)

  const openCreate = () => {
    setEditing(null)
    setQuestion('')
    setAnswer('')
    setPublished(true)
    setOpen(true)
  }
  const openEdit = (row: FaqRow) => {
    setEditing(row)
    setQuestion(row.question)
    setAnswer(row.answer)
    setPublished(row.published)
    setOpen(true)
  }
  const save = async () => {
    try {
      const payload = { question, answer, published }
      if (editing) await update.mutateAsync({ id: editing.id, ...payload })
      else await create.mutateAsync(payload)
      toast.success(editing ? 'FAQ updated.' : 'FAQ added.')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.')
    }
  }

  const columns: DataTableColumn<FaqRow>[] = [
    { key: 'question', header: 'Question', render: (r) => r.question },
    { key: 'published', header: 'Published', render: (r) => (r.published ? 'Yes' : 'No') },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => openEdit(r)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Delete?')) return
              await remove.mutateAsync(r.id)
              toast.success('Deleted.')
            }}
            className="rounded-lg p-2 text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add FAQ
        </Button>
      </div>
      <DataTable columns={columns} data={data ?? []} keyField="id" isLoading={isLoading} emptyMessage="No FAQs." />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit FAQ' : 'Add FAQ'}>
        <div className="flex flex-col gap-4">
          <FormField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Answer</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className="rounded-xl border border-black/10 px-4 py-3 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
          </label>
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </Modal>
    </>
  )
}

function TestimonialsTab() {
  const { data, isLoading, create, update, remove } = useTestimonials(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TestimonialRow | null>(null)
  const [quote, setQuote] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [avatar, setAvatar] = useState('')
  const [published, setPublished] = useState(true)

  const openCreate = () => {
    setEditing(null)
    setQuote('')
    setName('')
    setRole('')
    setAvatar('')
    setPublished(true)
    setOpen(true)
  }
  const openEdit = (row: TestimonialRow) => {
    setEditing(row)
    setQuote(row.quote)
    setName(row.name)
    setRole(row.role)
    setAvatar(row.avatar_initials)
    setPublished(row.published)
    setOpen(true)
  }
  const save = async () => {
    try {
      const initials =
        avatar ||
        name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      const payload = { quote, name, role, avatar_initials: initials, published }
      if (editing) await update.mutateAsync({ id: editing.id, ...payload })
      else await create.mutateAsync(payload)
      toast.success(editing ? 'Updated.' : 'Added.')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.')
    }
  }

  const columns: DataTableColumn<TestimonialRow>[] = [
    { key: 'name', header: 'Name', render: (r) => r.name },
    { key: 'role', header: 'Role', render: (r) => r.role },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => openEdit(r)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Delete?')) return
              await remove.mutateAsync(r.id)
              toast.success('Deleted.')
            }}
            className="rounded-lg p-2 text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add testimonial
        </Button>
      </div>
      <DataTable columns={columns} data={data ?? []} keyField="id" isLoading={isLoading} emptyMessage="No testimonials." />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit testimonial' : 'Add testimonial'}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Quote</label>
            <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} className="rounded-xl border border-black/10 px-4 py-3 text-sm" />
          </div>
          <FormField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <FormField label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <FormField label="Avatar initials" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
          </label>
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </Modal>
    </>
  )
}

function TimelineTab() {
  const { data, isLoading, create, update, remove } = useTimeline()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TimelineRow | null>(null)
  const [quarter, setQuarter] = useState('')
  const [title, setTitle] = useState('')
  const [itemsText, setItemsText] = useState('')
  const [status, setStatus] = useState<TimelineRow['status']>('upcoming')

  const openCreate = () => {
    setEditing(null)
    setQuarter('')
    setTitle('')
    setItemsText('')
    setStatus('upcoming')
    setOpen(true)
  }
  const openEdit = (row: TimelineRow) => {
    setEditing(row)
    setQuarter(row.quarter)
    setTitle(row.title)
    setItemsText((row.items ?? []).join('\n'))
    setStatus(row.status)
    setOpen(true)
  }
  const save = async () => {
    try {
      const items = itemsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const payload = { quarter, title, items, status }
      if (editing) await update.mutateAsync({ id: editing.id, ...payload })
      else await create.mutateAsync(payload)
      toast.success(editing ? 'Updated.' : 'Added.')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.')
    }
  }

  const columns: DataTableColumn<TimelineRow>[] = [
    { key: 'quarter', header: 'Quarter', render: (r) => r.quarter },
    { key: 'title', header: 'Title', render: (r) => r.title },
    { key: 'status', header: 'Status', render: (r) => r.status },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => openEdit(r)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Delete?')) return
              await remove.mutateAsync(r.id)
              toast.success('Deleted.')
            }}
            className="rounded-lg p-2 text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add date
        </Button>
      </div>
      <DataTable columns={columns} data={data ?? []} keyField="id" isLoading={isLoading} emptyMessage="No timeline items." />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit key date' : 'Add key date'}>
        <div className="flex flex-col gap-4">
          <FormField label="Quarter / label" value={quarter} onChange={(e) => setQuarter(e.target.value)} />
          <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Items (one per line)</label>
            <textarea value={itemsText} onChange={(e) => setItemsText(e.target.value)} rows={4} className="rounded-xl border border-black/10 px-4 py-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TimelineRow['status'])} className="rounded-xl border border-black/10 px-4 py-3 text-sm">
              <option value="done">Done</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </Modal>
    </>
  )
}

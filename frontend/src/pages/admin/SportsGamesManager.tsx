import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSportsGames } from '@/hooks/useCms'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { FormField } from '@/components/forms/FormField'
import type { SportsGameRow } from '@/types'

export default function SportsGamesManager() {
  const { data, isLoading, create, update, remove } = useSportsGames(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SportsGameRow | null>(null)
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [category, setCategory] = useState('trending')
  const [variant, setVariant] = useState<'original' | 'portrait'>('portrait')
  const [gradient, setGradient] = useState('from-[#312e81] to-[#0f172a]')
  const [badge, setBadge] = useState('')
  const [published, setPublished] = useState(true)

  const openCreate = () => {
    setEditing(null)
    setId('')
    setTitle('')
    setProvider('')
    setCategory('trending')
    setVariant('portrait')
    setGradient('from-[#312e81] to-[#0f172a]')
    setBadge('')
    setPublished(true)
    setOpen(true)
  }

  const openEdit = (row: SportsGameRow) => {
    setEditing(row)
    setId(row.id)
    setTitle(row.title)
    setProvider(row.provider)
    setCategory(row.category)
    setVariant(row.variant)
    setGradient(row.gradient)
    setBadge(row.badge ?? '')
    setPublished(row.published)
    setOpen(true)
  }

  const save = async () => {
    try {
      if (!id.trim() || !title.trim()) {
        toast.error('ID and title are required.')
        return
      }
      const payload = {
        id: id.trim(),
        title: title.trim(),
        provider: provider.trim(),
        category: category.trim(),
        variant,
        gradient,
        badge: badge.trim() || null,
        published,
      }
      if (editing) {
        const { id: _ignore, ...rest } = payload
        await update.mutateAsync({ id: editing.id, ...rest })
        toast.success('Game updated.')
      } else {
        await create.mutateAsync(payload)
        toast.success('Game added.')
      }
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.')
    }
  }

  const columns: DataTableColumn<SportsGameRow>[] = [
    { key: 'title', header: 'Title', render: (r) => r.title },
    { key: 'category', header: 'Category', render: (r) => r.category },
    { key: 'provider', header: 'Provider', render: (r) => r.provider },
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
              if (!window.confirm(`Remove "${r.title}"?`)) return
              await remove.mutateAsync(r.id)
              toast.success('Removed.')
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
      <Helmet>
        <title>Sports Games — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Sports Games</h1>
          <p className="mt-1 text-sm text-muted">Games shown on the Sports lobby.</p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add game
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={data ?? []} keyField="id" isLoading={isLoading} emptyMessage="No games." />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit game' : 'Add game'}>
        <div className="flex flex-col gap-4">
          <FormField label="ID (slug)" value={id} onChange={(e) => setId(e.target.value)} disabled={Boolean(editing)} />
          <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <FormField label="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
          <FormField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as 'original' | 'portrait')} className="rounded-xl border border-black/10 px-4 py-3 text-sm">
              <option value="portrait">Portrait</option>
              <option value="original">Original</option>
            </select>
          </div>
          <FormField label="Gradient classes" value={gradient} onChange={(e) => setGradient(e.target.value)} />
          <FormField label="Badge" value={badge} onChange={(e) => setBadge(e.target.value)} />
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

import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSportsGames } from '@/hooks/useCms'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { FileUploadDropzone } from '@/components/admin/FileUploadDropzone'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { FormField } from '@/components/forms/FormField'
import { SportsGameCover } from '@/components/sports/SportsGameCover'
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
  const [imageUrl, setImageUrl] = useState('')
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
    setImageUrl('')
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
    setImageUrl(row.image_url ?? '')
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
        image_url: imageUrl.trim() || null,
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

  const previewGame = {
    id: id.trim() || 'preview',
    title: title.trim() || 'Preview',
    gradient,
    imageUrl: imageUrl.trim() || null,
  }

  const columns: DataTableColumn<SportsGameRow>[] = [
    {
      key: 'cover',
      header: 'Cover',
      render: (r) => (
        <div className="relative h-12 w-9 overflow-hidden rounded-lg border border-black/10">
          <SportsGameCover game={{ id: r.id, title: r.title, gradient: r.gradient, imageUrl: r.image_url }} />
        </div>
      ),
    },
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
          <p className="mt-1 text-sm text-muted">Games shown on the Sports lobby and header.</p>
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
          <FormField label="Gradient classes (fallback when no image)" value={gradient} onChange={(e) => setGradient(e.target.value)} />
          <FormField label="Badge" value={badge} onChange={(e) => setBadge(e.target.value)} />

          <FileUploadDropzone
            bucket="sports-games"
            label="Upload cover image"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg"
            hint="Drag a JPG, PNG, or WebP here, or click to browse (max 5 MB)."
            maxSizeBytes={5 * 1024 * 1024}
            currentUrl={imageUrl || undefined}
            onUploaded={(url) => setImageUrl(url)}
          />
          <FormField
            label="Or paste image URL"
            placeholder="https://…/cover.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <p className="text-xs text-muted">
            Upload a cover image or paste a link. The image appears on the Sports lobby, game page, and Sports header strip.
          </p>

          <div className="overflow-hidden rounded-xl border border-black/10">
            <p className="bg-black/5 px-3 py-2 text-xs font-bold text-muted uppercase">Preview</p>
            <div className="relative aspect-[3/4] max-h-48 bg-[#0b1648]">
              <SportsGameCover game={previewGame} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-xs font-bold text-white uppercase">{previewGame.title}</p>
              </div>
            </div>
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

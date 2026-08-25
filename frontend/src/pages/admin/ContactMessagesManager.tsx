import { Helmet } from 'react-helmet-async'
import { Trash2, MailOpen, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useContactMessages } from '@/hooks/useCms'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { ContactMessage } from '@/types'

export default function ContactMessagesManager() {
  const { data, isLoading, markRead, remove } = useContactMessages()

  const columns: DataTableColumn<ContactMessage>[] = [
    {
      key: 'read',
      header: '',
      render: (m) => (m.read ? <MailOpen size={16} className="text-muted" /> : <Mail size={16} className="text-primary" />),
    },
    { key: 'name', header: 'Name', render: (m) => m.name },
    { key: 'email', header: 'Email', render: (m) => m.email },
    {
      key: 'message',
      header: 'Message',
      render: (m) => <span className="line-clamp-2 max-w-xs text-left">{m.message}</span>,
    },
    {
      key: 'created',
      header: 'When',
      render: (m) => new Date(m.created_at).toLocaleString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={async () => {
              await markRead.mutateAsync({ id: m.id, read: !m.read })
              toast.success(m.read ? 'Marked unread.' : 'Marked read.')
            }}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            {m.read ? 'Unread' : 'Read'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Delete this message?')) return
              await remove.mutateAsync(m.id)
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
        <title>Messages — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="text-h2 text-ink">Contact Messages</h1>
      <p className="mt-1 text-sm text-muted">Inbox from the public Contact form.</p>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={data ?? []}
          keyField="id"
          emptyMessage="No messages yet."
        />
      </div>
    </>
  )
}

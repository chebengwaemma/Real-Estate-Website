export type ContactEmailPayload = {
  name: string
  email: string
  phone?: string
  message: string
}

type ContactEmailResponse = {
  success?: boolean
  message?: string
  error?: string
}

function mailApiBase(): string {
  const configured = import.meta.env.VITE_MAIL_API_URL?.trim().replace(/\/$/, '')
  if (configured) return configured
  if (import.meta.env.DEV) return ''
  return ''
}

export async function submitContactEmail(payload: ContactEmailPayload): Promise<void> {
  const res = await fetch(`${mailApiBase()}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let data: ContactEmailResponse | null = null
  try {
    data = (await res.json()) as ContactEmailResponse
  } catch {
    data = null
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.error ?? 'Could not send your message. Please try again later.')
  }
}

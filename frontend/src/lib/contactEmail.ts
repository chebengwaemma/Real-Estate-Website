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

function mailApiConfigured(): boolean {
  return Boolean(mailApiBase() || import.meta.env.DEV)
}

export async function submitContactEmail(payload: ContactEmailPayload): Promise<void> {
  if (!mailApiConfigured()) {
    throw new Error('Mail service is not configured for this site.')
  }

  let res: Response
  try {
    res = await fetch(`${mailApiBase()}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      import.meta.env.DEV
        ? 'Mail server is not running. Start it with: npm run mail:dev'
        : 'Could not reach the mail server. Please try again later.',
    )
  }

  let data: ContactEmailResponse | null = null
  try {
    data = (await res.json()) as ContactEmailResponse
  } catch {
    data = null
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.error ?? `Could not send your message (${res.status}). Please try again later.`)
  }
}

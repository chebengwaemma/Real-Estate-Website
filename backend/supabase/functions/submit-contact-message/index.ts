import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

function cleanSecret(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
}

async function notifyContactInbox(input: { name: string; email: string; message: string; phone?: string }) {
  const mailApiUrl = cleanSecret(Deno.env.get('MAIL_API_URL') ?? '').replace(/\/$/, '')
  const mailApiSecret = cleanSecret(Deno.env.get('MAIL_API_SECRET') ?? '')

  const payload = {
    name: input.name,
    email: input.email,
    message: input.message,
    ...(input.phone ? { phone: input.phone } : {}),
  }

  if (mailApiUrl) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (mailApiSecret) headers.Authorization = `Bearer ${mailApiSecret}`

      const secretPath = mailApiSecret ? '/api/email/contact-notification' : '/api/send-email'
      const res = await fetch(`${mailApiUrl}${secretPath}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.text()
        console.error(`Contact email failed (${res.status}): ${body}`)
      } else {
        return
      }
    } catch (err) {
      console.error('Contact email request failed', err)
    }
  } else {
    console.warn('MAIL_API_URL is not set — contact saved to database only.')
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()
    const phone = String(body?.phone ?? '').trim()
    const message = String(body?.message ?? '').trim()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { error } = await supabase.from('contact_messages').insert({ name, email, message } as never)
    if (error) {
      throw new Error(error.message)
    }

    await notifyContactInbox({ name, email, message, ...(phone ? { phone } : {}) })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('submit-contact-message failed', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Could not submit message.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

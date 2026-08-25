/** Normalize Supabase / unknown errors for admin toasts. */
export function cmsErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err && 'message' in err && typeof (err as { message: unknown }).message === 'string'
        ? (err as { message: string }).message
        : ''

  const code =
    typeof err === 'object' && err && 'code' in err && typeof (err as { code: unknown }).code === 'string'
      ? (err as { code: string }).code
      : ''

  const lower = message.toLowerCase()
  const missingTable =
    code === '42P01' ||
    code === 'PGRST205' ||
    lower.includes('does not exist') ||
    lower.includes('schema cache') ||
    lower.includes('could not find the table')

  if (missingTable) {
    return 'CMS tables missing. Run backend/supabase/FIX_ADMIN_SAVE.sql in Supabase SQL Editor, then try again.'
  }

  const missingRpc =
    code === 'PGRST202' ||
    lower.includes('could not find the function') ||
    lower.includes('save_site_settings')

  if (missingRpc) {
    return 'Settings API missing. Run backend/supabase/FIX_ADMIN_SAVE.sql in Supabase SQL Editor, then Save again.'
  }

  if (lower.includes('row-level security') || code === '42501' || lower.includes('only admins')) {
    return 'Save blocked: account must be admin. Run FIX_ADMIN_SAVE.sql (promotes sheikhsayeed0002@gmail.com) or set profiles.role = admin.'
  }

  if (lower.includes('invalid api key')) {
    return 'Invalid API key — rebuild with matching project URL + anon key, then redeploy public_html on Hostinger.'
  }

  return message.trim() || fallback
}

export function isCmsTableMissing(err: unknown): boolean {
  return cmsErrorMessage(err, '').includes('CMS tables missing')
}

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
    return 'CMS tables missing in Supabase. Open SQL Editor and run backend/supabase/SITE_SETTINGS.sql, then try Save again.'
  }

  const missingRpc =
    code === 'PGRST202' ||
    lower.includes('could not find the function') ||
    lower.includes('save_site_settings')

  if (missingRpc) {
    return 'Settings API missing. Run backend/supabase/SITE_SETTINGS.sql in Supabase SQL Editor, then Save again.'
  }

  if (lower.includes('row-level security') || code === '42501' || lower.includes('only admins')) {
    return 'Save blocked by permissions. Your account must be admin (profiles.role = admin or superadmin).'
  }

  return message.trim() || fallback
}

export function isCmsTableMissing(err: unknown): boolean {
  return cmsErrorMessage(err, '').includes('CMS tables missing')
}

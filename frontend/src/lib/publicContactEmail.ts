import { CONTACT_EMAIL_DEFAULT } from '@/config/publicNav'

/** Published contact address for the site (defaults to chebengwaemma@gmail.com). */
export function publicContactEmail(raw?: string | null): string {
  const email = raw?.trim() || ''
  if (!email) return CONTACT_EMAIL_DEFAULT
  return email
}

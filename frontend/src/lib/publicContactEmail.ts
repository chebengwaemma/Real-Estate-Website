import { CONTACT_EMAIL_DEFAULT } from '@/config/publicNav'

const PERSONAL_INBOX = /@(gmail|googlemail|yahoo|outlook|hotmail|icloud|me|aol)\./i

/** Public site never shows a personal inbox — Info@HCheckers.org is the published address. */
export function publicContactEmail(raw?: string | null): string {
  const email = raw?.trim() || ''
  if (!email || PERSONAL_INBOX.test(email)) return CONTACT_EMAIL_DEFAULT
  return email
}

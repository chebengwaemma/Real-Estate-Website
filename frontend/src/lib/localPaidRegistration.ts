import type { Registration } from '@/types'

const KEY = 'hopeland_local_paid_registration'

/** Stash a just-completed local paid registration for the success page. */
export function saveLocalPaidRegistration(registration: Registration) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(registration))
  } catch {
    // ignore quota / private mode
  }
}

export function readLocalPaidRegistration(): Registration | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Registration
  } catch {
    return null
  }
}

export function clearLocalPaidRegistration() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

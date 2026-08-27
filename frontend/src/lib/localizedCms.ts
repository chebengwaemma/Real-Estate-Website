/** CMS English copy is used only when the UI language is English. */
export function isEnglishLocale(lang: string | undefined): boolean {
  return (lang ?? 'en').toLowerCase().startsWith('en')
}

/**
 * Prefer translated UI strings whenever the visitor is not in English.
 * English visitors still see admin-edited CMS text when it is set.
 */
export function cmsOrTranslated(
  lang: string | undefined,
  cmsValue: string | null | undefined,
  translated: string,
): string {
  if (isEnglishLocale(lang) && cmsValue?.trim()) return cmsValue.trim()
  return translated
}

export function formatPrizeUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

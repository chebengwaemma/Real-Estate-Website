import { useTranslation } from 'react-i18next'
import { useCmsPages, useSiteSettings } from '@/hooks/useCms'
import { FOOTER_LEGAL, FOOTER_NAV, HEADER_NAV } from '@/config/publicNav'
import { parseNavJson, resolveNavLinks, type ResolvedNavLink } from '@/lib/navConfig'

export function usePublicNav(): {
  header: ResolvedNavLink[]
  footer: ResolvedNavLink[]
  legal: ResolvedNavLink[]
} {
  const { t } = useTranslation()
  const { data: settings } = useSiteSettings()
  const { data: pages } = useCmsPages()

  return {
    header: resolveNavLinks(parseNavJson(settings?.extras?.header_nav), HEADER_NAV, pages, t),
    footer: resolveNavLinks(parseNavJson(settings?.extras?.footer_nav), FOOTER_NAV, pages, t),
    legal: resolveNavLinks(parseNavJson(settings?.extras?.footer_legal), FOOTER_LEGAL, pages, t),
  }
}

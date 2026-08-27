import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '@/hooks/useCms'
import { SocialLinks } from '@/components/layout/SocialLinks'
import { FOOTER_LEGAL, FOOTER_NAV } from '@/config/publicNav'
import { cmsOrTranslated } from '@/lib/localizedCms'
import { publicContactEmail } from '@/lib/publicContactEmail'

export function Footer() {
  const { t, i18n } = useTranslation()
  const { data: settings } = useSiteSettings()
  const tagline = cmsOrTranslated(i18n.language, settings?.footer_tagline, t('footer.tagline'))
  const brand = settings?.site_name || 'Hopeland Global Checkers'
  const logoUrl = settings?.logo_url?.trim() || ''
  const email = publicContactEmail(settings?.contact_email)
  const phone = settings?.contact_phone?.trim() || ''
  const address = settings?.contact_address?.trim() || ''

  const sitemapLinks = FOOTER_NAV.map((item) => ({ to: item.to, label: t(item.labelKey) }))
  const legalLinks = FOOTER_LEGAL.map((item) => ({ to: item.to, label: t(item.labelKey) }))

  return (
    <footer className="bg-navy pb-[calc(5rem+env(safe-area-inset-bottom))] text-white/70 lg:pb-0">
      <div className="container-page section-y flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="max-w-sm min-w-0">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" />
            ) : null}
            <p className="text-h2 break-words font-display font-extrabold text-white">
              {brand}
              <span className="text-primary">.</span>
            </p>
          </div>
          <p className="text-body-lg mt-5 text-white/60">{tagline}</p>
          <div className="mt-5 space-y-1 text-sm text-white/55">
            <p>
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
            </p>
            {phone ? (
              <p>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white">
                  {phone}
                </a>
              </p>
            ) : null}
            {address ? <p className="whitespace-pre-line">{address}</p> : null}
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/50">{t('footer.followUs')}</p>
          <SocialLinks className="mt-3" />
          <p className="mt-8 text-xs text-white/40">
            &copy; {new Date().getFullYear()} {brand}
          </p>
        </div>

        <div className="min-w-0 w-full lg:w-auto">
          <p className="text-eyebrow mb-5 sm:mb-6">{t('footer.sitemapHeading')}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-12 sm:gap-y-5 md:gap-x-20">
            {sitemapLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="break-words text-xs font-extrabold leading-snug tracking-tight text-white underline decoration-primary/70 decoration-2 underline-offset-4 transition-colors hover:text-primary sm:text-sm sm:uppercase sm:underline-offset-8 md:text-base"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
        <p>{t('footer.rights')}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {legalLinks.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

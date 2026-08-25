import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Camera, MessageCircle, Play, Send } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useCms'

export function Footer() {
  const { t } = useTranslation()
  const { data: settings } = useSiteSettings()
  const tagline = settings?.footer_tagline || t('footer.tagline')
  const brand = settings?.site_name || 'Hopeland Global Checkers'
  const logoUrl = settings?.logo_url?.trim() || ''
  const email = settings?.contact_email || ''
  const phone = settings?.contact_phone?.trim() || ''
  const address = settings?.contact_address?.trim() || ''

  const sitemapLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/videos', label: t('nav.videos') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/sponsors', label: t('nav.sponsors') },
    { to: '/register', label: t('header.registerCta') },
  ]

  const legalLinks = [
    { to: '/privacy-policy', label: 'Privacy Policy' },
    { to: '/terms-of-use', label: 'Terms of Use' },
    { to: '/contact', label: t('nav.contact') },
  ]

  const socials = [
    { icon: Send, href: settings?.social_twitter || '#', label: 'X / Twitter' },
    { icon: Camera, href: settings?.social_instagram || '#', label: 'Instagram' },
    { icon: MessageCircle, href: settings?.social_facebook || '#', label: 'Facebook' },
    { icon: Play, href: settings?.social_youtube || '#', label: 'YouTube' },
  ].filter((s) => s.href && s.href !== '#')

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
          {(email || phone || address) && (
            <div className="mt-5 space-y-1 text-sm text-white/55">
              {email ? (
                <p>
                  <a href={`mailto:${email}`} className="hover:text-white">
                    {email}
                  </a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white">
                    {phone}
                  </a>
                </p>
              ) : null}
              {address ? <p className="whitespace-pre-line">{address}</p> : null}
            </div>
          )}
          <p className="mt-8 text-xs text-white/40">
            &copy; {new Date().getFullYear()} {brand}
          </p>
          {socials.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-primary hover:text-white"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          ) : null}
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

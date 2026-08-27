import { useSiteSettings } from '@/hooks/useCms'
import { CONTACT_EMAIL_DEFAULT } from '@/config/publicNav'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.56l-5.14-6.72L5.2 22H1.93l8.02-9.16L1.5 2h6.72l4.64 6.18L18.244 2Zm-1.15 18.06h1.8L7.01 3.84H5.08l12.014 16.22Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm10 1.8H7A2.2 2.2 0 0 0 4.8 7v10A2.2 2.2 0 0 0 7 19.2h10A2.2 2.2 0 0 0 19.2 17V7A2.2 2.2 0 0 0 17 4.8ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8Zm5.15-3.35a.95.95 0 1 1-.95.95.95.95 0 0 1 .95-.95Z" />
    </svg>
  )
}

export function SocialLinks({
  className,
  iconClassName,
}: {
  className?: string
  iconClassName?: string
}) {
  const { t } = useTranslation()
  const { data: settings } = useSiteSettings()

  const items = [
    { key: 'facebook', label: t('social.facebook'), href: settings?.social_facebook?.trim() || '', Icon: FacebookIcon },
    { key: 'x', label: t('social.x'), href: settings?.social_twitter?.trim() || '', Icon: XIcon },
    { key: 'youtube', label: t('social.youtube'), href: settings?.social_youtube?.trim() || '', Icon: YouTubeIcon },
    { key: 'instagram', label: t('social.instagram'), href: settings?.social_instagram?.trim() || '', Icon: InstagramIcon },
  ]

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {items.map((item) => {
        const href = item.href && item.href !== '#' ? item.href : ''
        const classNames = cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors',
          href ? 'hover:bg-primary hover:text-white' : 'cursor-default opacity-50',
          iconClassName,
        )
        if (href) {
          return (
            <a
              key={item.key}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={item.label}
              title={item.label}
              className={classNames}
            >
              <item.Icon />
            </a>
          )
        }
        return (
          <span key={item.key} aria-label={item.label} title={t('footer.socialHint')} className={classNames}>
            <item.Icon />
          </span>
        )
      })}
    </div>
  )
}

export function ContactEmailLink({ className }: { className?: string }) {
  const { data: settings } = useSiteSettings()
  const email = settings?.contact_email?.trim() || CONTACT_EMAIL_DEFAULT
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  )
}

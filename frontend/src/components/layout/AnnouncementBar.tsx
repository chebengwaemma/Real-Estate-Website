import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useSiteSettings } from '@/hooks/useCms'
import { cmsOrTranslated } from '@/lib/localizedCms'

export function AnnouncementBar() {
  const { t, i18n } = useTranslation()
  const { isPaidPlayer } = useAuth()
  const { data: settings } = useSiteSettings()

  const text = cmsOrTranslated(i18n.language, settings?.announcement_text, t('announcement.text'))
  const cta = cmsOrTranslated(i18n.language, settings?.announcement_cta, t('announcement.cta'))

  return (
    <div className="relative z-40 bg-black text-white">
      <div className="container-page flex items-center justify-center px-2 py-1.5 text-center sm:px-3 sm:py-2">
        {isPaidPlayer ? (
          <p className="text-[9px] font-bold leading-snug tracking-wide text-balance text-white uppercase sm:text-xs sm:tracking-[0.14em]">
            {text}
          </p>
        ) : (
          <Link
            to="/register"
            className="text-[9px] font-bold leading-snug tracking-wide text-balance text-white uppercase sm:text-xs sm:tracking-[0.14em]"
          >
            {text}
            <span className="mx-1 sm:mx-2">—</span>
            {cta}
          </Link>
        )}
      </div>
    </div>
  )
}

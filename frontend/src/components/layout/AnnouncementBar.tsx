import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function AnnouncementBar() {
  const { t } = useTranslation()
  const { isPaidPlayer } = useAuth()

  return (
    <div className="relative z-40 bg-black text-white">
      <div className="container-page flex items-center justify-center px-2 py-1.5 text-center sm:px-3 sm:py-2">
        {isPaidPlayer ? (
          <p className="text-[9px] font-bold leading-snug tracking-wide text-balance text-white uppercase sm:text-xs sm:tracking-[0.14em]">
            {t('announcement.text')}
          </p>
        ) : (
          <Link
            to="/register"
            className="text-[9px] font-bold leading-snug tracking-wide text-balance text-white uppercase sm:text-xs sm:tracking-[0.14em]"
          >
            {t('announcement.text')}
            <span className="mx-1 sm:mx-2">—</span>
            {t('announcement.cta')}
          </Link>
        )}
      </div>
    </div>
  )
}

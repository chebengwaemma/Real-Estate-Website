import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function AnnouncementBar() {
  const { t } = useTranslation()
  const { isPaidPlayer } = useAuth()

  return (
    <div className="relative z-40 bg-black text-white">
      <div className="container-page flex items-center justify-center px-3 py-2 text-center">
        {isPaidPlayer ? (
          <p className="text-[10px] font-bold tracking-[0.14em] text-white uppercase sm:text-xs">
            {t('announcement.text')}
          </p>
        ) : (
          <Link
            to="/register"
            className="text-[10px] font-bold tracking-[0.14em] text-white uppercase sm:text-xs"
          >
            {t('announcement.text')}
            <span className="mx-2">—</span>
            {t('announcement.cta')}
          </Link>
        )}
      </div>
    </div>
  )
}

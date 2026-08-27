import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '@/hooks/useCms'
import { DEFAULT_PRIZES } from '@/config/publicNav'
import { formatPrizeUsd } from '@/lib/localizedCms'
import { getSiteSetting } from '@/lib/siteSettings'

export function PrizeBanner() {
  const { t } = useTranslation('home')
  const { data: settings } = useSiteSettings()

  const first = Number(getSiteSetting(settings, 'prize_first', String(DEFAULT_PRIZES.first))) || DEFAULT_PRIZES.first
  const second = Number(getSiteSetting(settings, 'prize_second', String(DEFAULT_PRIZES.second))) || DEFAULT_PRIZES.second
  const third = Number(getSiteSetting(settings, 'prize_third', String(DEFAULT_PRIZES.third))) || DEFAULT_PRIZES.third

  const items = [
    { label: getSiteSetting(settings, 'prize_first_label', t('prizes.winner')), amount: first },
    { label: getSiteSetting(settings, 'prize_second_label', t('prizes.second')), amount: second },
    { label: getSiteSetting(settings, 'prize_third_label', t('prizes.third')), amount: third },
  ]

  return (
    <div className="bg-gradient-to-r from-[#071040] via-[#0b3a8a] to-[#071040] py-3 text-white sm:py-4">
      <div className="container-page flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
        {items.map((item) => (
          <p
            key={item.label}
            className="font-display text-[clamp(1.35rem,5.5vw,2.75rem)] font-extrabold leading-none tracking-tight text-[#fde68a] drop-shadow-[0_2px_12px_rgba(253,224,71,0.35)]"
          >
            <span className="mr-1.5">•</span>
            {item.label} = {formatPrizeUsd(item.amount)}
          </p>
        ))}
      </div>
    </div>
  )
}

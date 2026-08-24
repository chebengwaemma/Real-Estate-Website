import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function Header() {
  const { t } = useTranslation()
  const { toggleMobileMenu } = useUiStore()
  const { isPaidPlayer, isAdmin } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/about', label: t('nav.about') },
    { to: '/videos', label: t('nav.videos') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/sponsors', label: t('nav.sponsors') },
    { to: '/contact', label: t('nav.contact') },
  ]

  const ctaTo = isPaidPlayer ? '/account' : '/register'

  return (
    <header
      className={cn(
        'relative w-full border-b border-white/25 shadow-[0_10px_40px_rgba(15,23,42,0.18)] backdrop-blur-[20px] backdrop-saturate-150 transition-[background-color] duration-300 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/40',
        scrolled ? 'bg-[#2563eb]/75' : 'bg-[#3b82f6]/45',
      )}
    >
      <div className="container-page flex min-h-[3.25rem] min-w-0 items-center justify-between gap-2 py-2 sm:min-h-[4.25rem] sm:gap-3 sm:py-3">
        <Link
          to="/"
          className="relative flex min-w-0 shrink items-center py-0.5 text-base font-display font-extrabold tracking-tight text-white drop-shadow-sm sm:text-xl md:text-2xl"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 z-0 h-8 w-8 -translate-y-1/2 sm:h-12 sm:w-12 md:h-14 md:w-14"
          >
            <img
              src="/brand/hopeland-mark.svg"
              alt=""
              className="h-full w-full drop-shadow-[0_0_12px_rgba(56,189,248,0.65)]"
              draggable={false}
            />
          </span>
          <span className="relative z-10 truncate pl-9 sm:pl-10 md:pl-12">
            Hopeland
            <span className="hidden font-semibold tracking-normal sm:inline"> Global Checkers</span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-5 xl:gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap text-sm font-semibold text-white/90 drop-shadow-sm transition-colors hover:text-white',
                  isActive && 'text-white underline decoration-2 underline-offset-8',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <LanguageSwitcher tone="dark" />
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 md:inline"
            >
              Admin
            </Link>
          )}
          <Link
            to={ctaTo}
            className="inline-flex items-center justify-center rounded-lg bg-[#60a5fa] px-2.5 py-1.5 text-[11px] font-display font-bold text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-colors hover:bg-[#93c5fd] sm:rounded-2xl sm:px-6 sm:py-2.5 sm:text-base"
          >
            Dashboard
          </Link>
          <button
            onClick={toggleMobileMenu}
            aria-label="Open menu"
            className="rounded-full p-1.5 text-white hover:bg-white/10 sm:p-2 lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}

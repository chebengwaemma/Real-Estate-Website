import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  Sparkles,
  Flame,
  Radio,
  Dice5,
  Crown,
  Zap,
  Puzzle,
  Target,
  Play,
  type LucideIcon,
} from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { GAMES, type GameCard, type SportsCategoryId as CategoryId } from '@/data/sportsGames'
import { useSportsGames } from '@/hooks/useCms'
import { SportsGameCover } from '@/components/sports/SportsGameCover'
import type { SportsGameRow } from '@/types'

const CATEGORIES: { id: CategoryId; label: string; icon: LucideIcon }[] = [
  { id: 'lobby', label: 'Lobby', icon: LayoutGrid },
  { id: 'originals', label: 'Hopeland Originals', icon: Sparkles },
  { id: 'trending', label: 'Trending Games', icon: Flame },
  { id: 'new', label: 'New Releases', icon: Zap },
  { id: 'live', label: 'Live Tables', icon: Radio },
  { id: 'blitz', label: 'Blitz', icon: Dice5 },
  { id: 'classic', label: 'Classic', icon: Crown },
  { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { id: 'tournaments', label: 'Tournaments', icon: Target },
]

const SECTION_ORDER: Exclude<CategoryId, 'lobby'>[] = [
  'originals',
  'trending',
  'new',
  'live',
  'blitz',
  'classic',
  'puzzles',
  'tournaments',
]

const SECTION_TITLES: Record<Exclude<CategoryId, 'lobby'>, string> = {
  originals: 'Hopeland Originals',
  trending: 'Trending Games',
  new: 'New Releases',
  live: 'Live Tables',
  blitz: 'Blitz',
  classic: 'Classic',
  puzzles: 'Puzzles',
  tournaments: 'Tournaments',
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function toGameCard(row: SportsGameRow): GameCard {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    category: row.category as Exclude<CategoryId, 'lobby'>,
    variant: row.variant,
    gradient: row.gradient,
    accent: row.accent ?? undefined,
    badge: row.badge ?? undefined,
    imageUrl: row.image_url,
  }
}

export default function Sports() {
  const [category, setCategory] = useState<CategoryId>('lobby')
  const [query, setQuery] = useState('')
  const { data: sportsRows } = useSportsGames()
  const games: GameCard[] = sportsRows !== undefined
    ? sportsRows.map(toGameCard)
    : GAMES

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return games.filter((game) => {
      const matchesCategory = category === 'lobby' || game.category === category
      const matchesQuery =
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.provider.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [category, query, games])

  const sections = useMemo(() => {
    if (category !== 'lobby') {
      return [{ id: category, games: filtered }] as const
    }
    return SECTION_ORDER.map((id) => ({
      id,
      games: filtered.filter((g) => g.category === id),
    })).filter((s) => s.games.length > 0)
  }, [category, filtered])

  return (
    <>
      <Helmet>
        <title>Sports Lobby — {SITE_NAME}</title>
        <meta
          name="description"
          content="Hopeland championship lobby — originals, live tables, blitz boards, puzzles, and tournament games."
        />
        <link rel="canonical" href={`${SITE_URL}/sports`} />
      </Helmet>

      <div className="min-h-[70vh] bg-[#030d43] pb-28 text-white">
        <div className="container-page pt-5 sm:pt-7">
          {/* Title row */}
          <div className="mb-5 flex items-start gap-3">
            <Link
              to="/"
              aria-label="Back to home"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-extrabold tracking-[0.08em] uppercase sm:text-3xl">
                Lobby
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/55">
                Championship thrills, live boards, and original checkers games — built for real
                players. Fast. Clear. No gimmicks.
              </p>
            </div>
          </div>

          {/* Header game strip — uploaded covers show here */}
          {games.length > 0 && <SportsHeaderStrip games={games} />}

          {/* Category chips */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold tracking-wide whitespace-nowrap transition-colors',
                  category === id
                    ? 'bg-[#2f6bff] text-white'
                    : 'bg-[#0b1648] text-white/75 hover:bg-[#12205c] hover:text-white',
                )}
              >
                <Icon size={14} strokeWidth={2.4} />
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <label className="relative mb-8 block">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/40"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for games"
              className="w-full rounded-xl border border-white/10 bg-[#0b1648] py-3 pr-4 pl-10 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#2f6bff]/60 focus:ring-2 focus:ring-[#2f6bff]/25"
            />
          </label>

          {/* Sections */}
          <div className="flex flex-col gap-9">
            {sections.map((section, i) => (
              <GameSection
                key={section.id}
                title={SECTION_TITLES[section.id]}
                games={section.games}
                index={i}
              />
            ))}

            {sections.length === 0 && (
              <p className="py-16 text-center text-sm text-white/45">
                No games match your search.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function SportsHeaderStrip({ games }: { games: GameCard[] }) {
  const featured = games.slice(0, 12)

  return (
    <div className="mb-6">
      <p className="mb-2 text-[10px] font-extrabold tracking-[0.18em] text-white/45 uppercase">
        Featured games
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar sm:gap-3">
        {featured.map((game) => (
          <Link
            key={game.id}
            to={`/sports/${game.id}`}
            aria-label={`Open ${game.title}`}
            className="group relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 transition-transform hover:-translate-y-0.5 hover:ring-[#2f6bff]/50"
          >
            <div className="relative aspect-[3/4] w-[72px] sm:w-[84px]">
              <SportsGameCover game={game} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2">
                <p className="truncate text-[8px] font-extrabold tracking-wide text-white uppercase sm:text-[9px]">
                  {game.title}
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Play size={16} fill="currentColor" className="text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function GameSection({
  title,
  games,
  index,
}: {
  title: string
  games: GameCard[]
  index: number
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.75, 360), behavior: 'smooth' })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: EASE }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold tracking-[0.14em] text-white uppercase sm:text-base">
          {title}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => scrollByCards(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => scrollByCards(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar sm:gap-3.5"
      >
        {games.map((game) => (
          <CasinoGameCard key={game.id} game={game} />
        ))}
      </div>
    </motion.section>
  )
}

function CasinoGameCard({ game }: { game: GameCard }) {
  const isOriginal = game.variant === 'original'

  return (
    <Link
      to={`/sports/${game.id}`}
      aria-label={`Play ${game.title}`}
      className={cn(
        'group relative shrink-0 overflow-hidden rounded-xl text-left outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#2f6bff]',
        isOriginal
          ? 'aspect-square w-[148px] sm:w-[168px]'
          : 'aspect-[3/4] w-[132px] sm:w-[148px]',
        'hover:-translate-y-0.5 active:scale-[0.98]',
      )}
    >
      <SportsGameCover game={game} />
      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/90 via-black/55 to-transparent" />

      {game.badge && (
        <span
          className={cn(
            'absolute top-2.5 left-2.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase',
            game.badge === 'LIVE' && 'bg-error text-white',
            game.badge === 'NEW' && 'bg-[#2f6bff] text-white',
            game.badge === 'HOT' && 'bg-amber-400 text-navy',
          )}
        >
          {game.badge}
        </span>
      )}

      <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f6bff] text-white shadow-[0_0_24px_rgba(47,107,255,0.65)] transition-transform group-hover:scale-110">
          <Play size={22} fill="currentColor" className="ml-0.5" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <p
          className={cn(
            'font-extrabold tracking-wide text-white uppercase drop-shadow-md',
            isOriginal ? 'text-sm leading-tight sm:text-base' : 'text-[11px] leading-snug sm:text-xs',
          )}
        >
          {game.title}
        </p>
        <p className="mt-1 text-[10px] font-semibold tracking-wider text-white/70 uppercase">
          {game.provider}
        </p>
      </div>

      <div className="absolute inset-0 ring-0 transition-[box-shadow] group-hover:ring-2 group-hover:ring-[#2f6bff]/50" />
    </Link>
  )
}

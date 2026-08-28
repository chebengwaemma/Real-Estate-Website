import { cn } from '@/lib/utils'
import { getSportsGameImageUrl } from '@/lib/sportsGameImage'
import type { GameCard } from '@/data/sportsGames'

type GameCoverGame = Pick<GameCard, 'id' | 'title' | 'gradient' | 'imageUrl'>

interface SportsGameCoverProps {
  game: GameCoverGame
  className?: string
  imgClassName?: string
}

export function SportsGameCover({ game, className, imgClassName }: SportsGameCoverProps) {
  const imageUrl = getSportsGameImageUrl({ id: game.id, imageUrl: game.imageUrl })

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={game.title}
        className={cn('absolute inset-0 h-full w-full object-cover object-center', imgClassName, className)}
        loading="lazy"
        draggable={false}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 bg-gradient-to-br', game.gradient, className)}
    />
  )
}

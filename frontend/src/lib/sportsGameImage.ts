export type SportsGameImageSource = {
  id: string
  imageUrl?: string | null
}

export function getSportsGameImageUrl(game: SportsGameImageSource): string | null {
  const url = game.imageUrl?.trim()
  if (url) return url
  return null
}

export function sportsGameImageOrGradient(game: SportsGameImageSource): { type: 'image'; url: string } | { type: 'gradient' } {
  const url = getSportsGameImageUrl(game)
  if (url) return { type: 'image', url }
  return { type: 'gradient' }
}

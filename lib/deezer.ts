export type DeezerResult = {
  albumCoverUrl: string | null
  deezerId: string | null
}

export async function getCoverFromDeezer(
  title: string,
  artist: string
): Promise<DeezerResult> {
  const empty: DeezerResult = { albumCoverUrl: null, deezerId: null }

  if (!title.trim() || !artist.trim()) return empty

  try {
    const query = encodeURIComponent(`${title} ${artist}`)
    const url = `https://api.deezer.com/search?q=${query}&limit=1`

    const response = await fetch(url)

    if (!response.ok) return empty

    const data = await response.json()

    const track = data.data?.[0]
    if (!track) return empty

    return {
      albumCoverUrl: track.album?.cover_medium ?? null,
      deezerId: String(track.id),
    }
  } catch (error) {
    console.error('Erro ao buscar capa no Deezer:', error)
    return empty
  }
}

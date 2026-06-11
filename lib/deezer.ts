type DeezerResult = {
  albumCoverUrl: string | null
  deezerId: string | null
}

type DeezerApiArtist = { name: string }
type DeezerApiAlbum = { title?: string; cover_medium?: string }
type DeezerApiTrack = {
  id: number
  title: string
  duration?: number
  artist: DeezerApiArtist
  album?: DeezerApiAlbum
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

export type DeezerTrack = {
  musicbrainzId: null
  deezerId: string
  title: string
  artistName: string
  albumTitle: string | null
  albumCoverUrl: string | null
  durationSeconds: number | null
}

export async function searchDeezer(
  q: string,
  limit = 10
): Promise<DeezerTrack[]> {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${limit}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Deezer error: ${res.status}`)

  const data = await res.json()
  if (!data.data || data.data.length === 0) return []

  return data.data.map((item: DeezerApiTrack) => ({
    musicbrainzId: null,
    deezerId: String(item.id),
    title: item.title,
    artistName: item.artist.name,
    albumTitle: item.album?.title ?? null,
    albumCoverUrl: item.album?.cover_medium ?? null,
    durationSeconds: item.duration ?? null,
  }))
}

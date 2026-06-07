export type MusicBrainzRecording = {
  id: string
  title: string
  duration: number
  'artist-credit': {
    name: string
    artist: {
      id: string
      name: string
    }
  }[]
  releases?: {
    id: string
    title: string
    date?: string
  }[]
}

export async function searchMusicBrainz(
  query: string
): Promise<MusicBrainzRecording[]> {
  const userAgent = process.env.MUSICBRAINZ_USER_AGENT

  if (!userAgent) {
    throw new Error('MUSICBRAINZ_USER_AGENT não definido. Defina em .env.local')
  }

  if (!query.trim()) return []
  try {
    const url = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json&limit=10`

    const response = await fetch(url, {
      headers: {
        // Obrigatório — identifica seu app para o MusicBrainz
        'User-Agent': userAgent,
      },
    })

    if (!response.ok) {
      console.error(`MusicBrainz error: ${response.status}`)
      return []
    }

    const data = await response.json()

    return data.recordings ?? []
  } catch (error) {
    console.error('Erro ao buscar no MusicBrainz:', error)
    return []
  }
}

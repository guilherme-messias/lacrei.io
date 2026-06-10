import { auth } from '@/auth'
import { getCoverFromDeezer, searchDeezer } from '@/lib/deezer'
import { searchMusicBrainz } from '@/lib/musicbrainz'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const searchSchema = z.object({
  q: z.string().min(2).max(100).trim(),
  limit: z.coerce.number().min(1).max(20).default(10),
})

type SearchTrack = {
  musicbrainzId: string | null
  deezerId: string | null
  title: string
  artistName: string
  albumTitle: string | null
  albumCoverUrl: string | null
  durationSeconds: number | null
}

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const rawQuery = request.nextUrl.searchParams.get('q')
  const rawLimit = request.nextUrl.searchParams.get('limit')

  const parsed = searchSchema.safeParse({ q: rawQuery, limit: rawLimit ?? 10 })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetro inválido', details: z.flattenError(parsed.error) },
      { status: 400 }
    )
  }

  const { q, limit } = parsed.data

  try {
    let tracks: SearchTrack[] = await searchDeezer(q, limit)
    let source = 'deezer'

    if (tracks.length === 0) {
      source = 'musicbrainz'
      const recordings = await searchMusicBrainz(q)

      tracks = await Promise.all(
        recordings.slice(0, limit).map(async rec => {
          const title = rec.title
          const artistName = rec['artist-credit'][0]?.name ?? ''
          const { albumCoverUrl, deezerId } = await getCoverFromDeezer(
            title,
            artistName
          )

          return {
            musicbrainzId: rec.id,
            deezerId,
            title,
            artistName,
            albumTitle: rec.releases?.[0]?.title ?? null,
            albumCoverUrl,
            durationSeconds: rec.duration
              ? Math.round(rec.duration / 1000)
              : null,
          }
        })
      )
    }

    return NextResponse.json({ tracks, source }, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar músicas:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar músicas', code: 'SEARCH_ERROR' },
      { status: 500 }
    )
  }
}

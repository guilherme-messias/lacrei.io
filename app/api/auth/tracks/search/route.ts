import { auth } from '@/auth'
import { getCoverFromDeezer } from '@/lib/deezer'
import { searchMusicBrainz } from '@/lib/musicbrainz'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const searchSchema = z.object({
  q: z.string().min(2).max(100).trim(),
})

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const rawQuery = request.nextUrl.searchParams.get('q')

  const parsed = searchSchema.safeParse({ q: rawQuery })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetro inválido', details: z.flattenError(parsed.error) },
      { status: 400 }
    )
  }

  const { q } = parsed.data

  const recordings = await searchMusicBrainz(q)

  const tracks = await Promise.all(
    recordings.slice(0, 5).map(async rec => {
      const title = rec.title
      const artist = rec['artist-credit'][0].name
      const { albumCoverUrl, deezerId } = await getCoverFromDeezer(
        title,
        artist
      )

      return { title, artist, albumCoverUrl, deezerId }
    })
  )

  return NextResponse.json({ tracks }, { status: 200 })
}

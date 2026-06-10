import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const trackSchema = z.object({
  musicbrainzId: z.string().optional(),
  deezerId: z.string().nullable().optional(),
  title: z.string().min(1),
  artistName: z.string().min(1),
  albumTitle: z.string().optional(),
  albumCoverUrl: z.url().optional().nullable(),
  durationSeconds: z.number().int().nullable().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()

  const parsed = trackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetro inválido', details: z.flattenError(parsed.error) },
      { status: 400 }
    )
  }

  const trackData = await prisma.track.upsert({
    where: {
      musicbrainzId: parsed.data.musicbrainzId || '',
    },
    update: {
      title: parsed.data.title,
      artistName: parsed.data.artistName,
      albumTitle: parsed.data.albumTitle,
      albumCoverUrl: parsed.data.albumCoverUrl,
      durationSeconds: parsed.data.durationSeconds,
    },
    create: {
      musicbrainzId: parsed.data.musicbrainzId,
      deezerId: parsed.data.deezerId,
      title: parsed.data.title,
      artistName: parsed.data.artistName,
      albumTitle: parsed.data.albumTitle,
      albumCoverUrl: parsed.data.albumCoverUrl,
      durationSeconds: parsed.data.durationSeconds,
    },
  })

  return NextResponse.json({ track: trackData }, { status: 200 })
}

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

  const { musicbrainzId, deezerId, ...fields } = parsed.data

  const trackData = await prisma.track.upsert({
    where: deezerId
      ? { deezerId }
      : { musicbrainzId: musicbrainzId || '' },
    update: {
      title: fields.title,
      artistName: fields.artistName,
      albumTitle: fields.albumTitle,
      albumCoverUrl: fields.albumCoverUrl,
      durationSeconds: fields.durationSeconds,
    },
    create: {
      musicbrainzId,
      deezerId,
      title: fields.title,
      artistName: fields.artistName,
      albumTitle: fields.albumTitle,
      albumCoverUrl: fields.albumCoverUrl,
      durationSeconds: fields.durationSeconds,
    },
  })

  return NextResponse.json({ track: trackData }, { status: 200 })
}

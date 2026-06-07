import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const trackSchema = z.object({
  musicbrainzId: z.string().optional(),
  deezerId: z.string().optional(),
  title: z.string().min(1),
  artistName: z.string().min(1),
  albumTitle: z.string().optional(),
  albumCoverUrl: z.url().optional().nullable(),
  durationSeconds: z.number().int().optional(),
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
}

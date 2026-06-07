import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addDays, isAfter, parseISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const querySchema = z.object({
  status: z.enum(['sealed', 'delivered', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const createCapsuleSchema = z.object({
  message: z.string().min(1).max(500).trim(),
  trackId: z.uuid(),
  openAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
})

export async function GET(request: NextRequest) { 
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const query = request.nextUrl.searchParams
    const parsed = querySchema.safeParse(Object.fromEntries(query.entries()))

    if (!parsed.success) {
        return NextResponse.json({ error: 'Parâmetro inválido', details: z.flattenError(parsed.error) }, { status: 400 })
    }
}



export async function POST(request: NextRequest) { 
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  
  const body = await request.json()

  const parsed = createCapsuleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Parâmetro inválido', details: z.flattenError(parsed.error) }, { status: 400 })
  }

  const openAtDate = parseISO(parsed.data.openAt)
  const minDate = addDays(new Date(), 6)
  if (!isAfter(openAtDate, minDate)) {
    return NextResponse.json({ error: 'A data deve ser pelo menos 7 dias no futuro', code: 'DATE_TOO_SOON' }, { status: 400 })
  }

  const track = await prisma.track.findUnique({
    where: {
      id: parsed.data.trackId,
    },
  })

  if (!track) {
    return NextResponse.json({ error: 'Faixa não encontrada', code: 'TRACK_NOT_FOUND' }, { status: 404 })
  }

  const capsule = await prisma.capsule.create({
    data: {
      userId: session.user.id,
      trackId: track.id,
      message: parsed.data.message,
      openAt: openAtDate,
      status: 'sealed' as const,
    },
  })

  // TODO: enviar email de confirmação

  return NextResponse.json({ capsule: capsule }, { status: 201 })
}
import { auth } from '@/auth'
import { sendConfirmationEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { addDays, differenceInDays, isAfter, parseISO } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const querySchema = z.object({
  status: z.enum(['sealed', 'delivered', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const createCapsuleSchema = z.object({
  message: z.string().min(1).max(500).trim(),
  trackId: z.cuid(),
  openAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
})

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const query = request.nextUrl.searchParams
  const parsed = querySchema.safeParse(Object.fromEntries(query.entries()))

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetro inválido', details: z.flattenError(parsed.error) },
      { status: 400 }
    )
  }

  const where = {
    userId: session.user.id,
    ...(parsed.data.status !== 'all' && { status: parsed.data.status }),
  }

  const [capsules, total] = await Promise.all([
    prisma.capsule.findMany({
      where,
      include: { track: true },
      skip: (parsed.data.page - 1) * parsed.data.limit,
      take: parsed.data.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.capsule.count({ where }),
  ])

  const capsulesWithDays = capsules.map(capsule => ({
    ...capsule,
    daysUntilOpen:
      capsule.status === 'sealed'
        ? differenceInDays(capsule.openAt, new Date())
        : null,
  }))

  return NextResponse.json({
    capsules: capsulesWithDays,
    pagination: {
      page: parsed.data.page, // página atual
      limit: parsed.data.limit, // itens por página
      total, // total de registros
      totalPages: Math.ceil(total / parsed.data.limit), // quantas páginas existem no total
    },
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()

  const parsed = createCapsuleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetro inválido', details: z.flattenError(parsed.error) },
      { status: 400 }
    )
  }

  const openAtDate = parseISO(parsed.data.openAt)
  const minDate = addDays(new Date(), 6)
  if (!isAfter(openAtDate, minDate)) {
    return NextResponse.json(
      {
        error: 'A data deve ser pelo menos 7 dias no futuro',
        code: 'DATE_TOO_SOON',
      },
      { status: 400 }
    )
  }

  const track = await prisma.track.findUnique({
    where: {
      id: parsed.data.trackId,
    },
  })

  if (!track) {
    return NextResponse.json(
      { error: 'Faixa não encontrada', code: 'TRACK_NOT_FOUND' },
      { status: 404 }
    )
  }

  const capsule = await prisma.capsule.create({
    data: {
      userId: session.user.id,
      trackId: track.id,
      message: parsed.data.message,
      openAt: openAtDate,
      status: 'sealed' as const,
    },
    include: { track: true, user: true },
  })

  await sendConfirmationEmail(capsule)

  return NextResponse.json({ capsule: capsule }, { status: 201 })
}

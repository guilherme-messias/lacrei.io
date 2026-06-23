import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { differenceInDays } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  const capsule = await prisma.capsule.findUnique({
    where: { id },
    include: { track: true },
  })

  if (!capsule) {
    return NextResponse.json(
      { error: 'Cápsula não encontrada' },
      { status: 404 }
    )
  }

  if (capsule.userId !== session.user.id) {
    return NextResponse.json(
      { error: 'Não autorizado para acessar esta cápsula' },
      { status: 403 }
    )
  }

  if (capsule.status === 'sealed') {
    return NextResponse.json(
      {
        capsule: {
          ...capsule,
          daysUntilOpen: differenceInDays(capsule.openAt, new Date()),
        },
      },
      { status: 200 }
    )
  }

  return NextResponse.json({ capsule }, { status: 200 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  const capsule = await prisma.capsule.findUnique({
    where: { id },
  })

  if (!capsule) {
    return NextResponse.json(
      { error: 'Cápsula não encontrada' },
      { status: 404 }
    )
  }

  if (capsule.userId !== session.user.id) {
    return NextResponse.json(
      { error: 'Não autorizado para deletar esta cápsula' },
      { status: 403 }
    )
  }

  if (capsule.status === 'delivered') {
    return NextResponse.json(
      { error: 'Cápsulas já entregues não podem ser excluídas' },
      { status: 409 }
    )
  }

  await prisma.capsule.delete({
    where: { id },
  })

  return NextResponse.json(
    { message: 'Cápsula deletada com sucesso' },
    { status: 200 }
  )
}

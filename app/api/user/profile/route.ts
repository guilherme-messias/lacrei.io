import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const userId = session.user.id

  const [user, total, sealed, delivered] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.capsule.count({ where: { userId } }),
    prisma.capsule.count({ where: { userId, status: 'sealed' } }),
    prisma.capsule.count({ where: { userId, status: 'delivered' } }),
  ])

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ user: { ...user, stats: { totalCapsules: total, sealedCapsules: sealed, deliveredCapsules: delivered } } }, { status: 200 })
}
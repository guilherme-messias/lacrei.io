import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const capsules = await prisma.capsule.findMany({
    where: { status: 'sealed', openAt: { lte: new Date() } },
    include: { track: true, user: true },
  })

  let delivered = 0
  let failed = 0

  for (const capsule of capsules) {
    try {
      // TODO: enviar email de entrega,depois seguir com testes da rota
      // await sendDeliveryEmail(capsule) /
      await prisma.capsule.update({
        where: { id: capsule.id },
        data: { status: 'delivered' },
      })
      delivered++
    } catch (error) {
      console.error(`Error delivering capsule ${capsule.id}`, error)
      failed++
    }

    return NextResponse.json({ delivered, failed })
  }
}

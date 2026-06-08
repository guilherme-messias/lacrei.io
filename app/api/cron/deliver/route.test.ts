import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const { mockEmailsSend, sendDeliveryEmailMock } = vi.hoisted(() => ({
  mockEmailsSend: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendDeliveryEmailMock: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockEmailsSend },
  })),
}))

vi.mock('@/lib/email', () => ({
  sendDeliveryEmail: sendDeliveryEmailMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    capsule: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { sendDeliveryEmail } from '@/lib/email'
import { NextRequest } from 'next/server'
import { GET } from './route'

const CRON_SECRET = 'test-cron-secret'

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: null,
  image: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

const mockTrack = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  musicbrainzId: 'mb-123',
  deezerId: null,
  title: 'Come Together',
  artistName: 'The Beatles',
  albumTitle: null,
  albumCoverUrl: null,
  durationSeconds: null,
  cachedAt: new Date('2024-01-01'),
}

function mockCapsule(id: string) {
  return {
    id,
    userId: mockUser.id,
    trackId: mockTrack.id,
    message: 'Mensagem de teste',
    openAt: new Date('2026-01-01'),
    openedAt: null,
    status: 'sealed',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    track: mockTrack,
    user: mockUser,
  }
}

function createRequest(authHeader?: string) {
  const headers: Record<string, string> = {}
  if (authHeader !== undefined) {
    headers.authorization = authHeader
  }
  return new NextRequest('http://localhost/api/cron/deliver', { headers })
}

describe('/api/cron/deliver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = CRON_SECRET
    sendDeliveryEmailMock.mockResolvedValue(undefined)
    vi.mocked(prisma.capsule.update).mockResolvedValue({} as never)
  })

  afterEach(() => {
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })

  it('deve retornar 401 sem header authorization', async () => {
    const res = await GET(createRequest())

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
    expect(prisma.capsule.findMany).not.toHaveBeenCalled()
    expect(sendDeliveryEmail).not.toHaveBeenCalled()
  })

  it('deve retornar 401 com token inválido', async () => {
    const res = await GET(createRequest('Bearer wrong-secret'))

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
    expect(prisma.capsule.findMany).not.toHaveBeenCalled()
    expect(sendDeliveryEmail).not.toHaveBeenCalled()
  })

  it('deve retornar delivered: 0 quando não há cápsulas elegíveis', async () => {
    vi.mocked(prisma.capsule.findMany).mockResolvedValue([])

    const res = await GET(createRequest(`Bearer ${CRON_SECRET}`))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ delivered: 0, failed: 0 })
    expect(prisma.capsule.findMany).toHaveBeenCalledWith({
      where: { status: 'sealed', openAt: { lte: expect.any(Date) } },
      include: { track: true, user: true },
    })
    expect(sendDeliveryEmail).not.toHaveBeenCalled()
  })

  it('deve chamar sendDeliveryEmail e marcar cápsula como delivered', async () => {
    const capsule = mockCapsule('capsule-1')
    vi.mocked(prisma.capsule.findMany).mockResolvedValue([capsule])

    const res = await GET(createRequest(`Bearer ${CRON_SECRET}`))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ delivered: 1, failed: 0 })
    expect(sendDeliveryEmail).toHaveBeenCalledWith(capsule)
    expect(prisma.capsule.update).toHaveBeenCalledWith({
      where: { id: 'capsule-1' },
      data: { status: 'delivered' },
    })
  })

  it('deve processar todas as cápsulas elegíveis', async () => {
    const capsule1 = mockCapsule('capsule-1')
    const capsule2 = mockCapsule('capsule-2')
    vi.mocked(prisma.capsule.findMany).mockResolvedValue([capsule1, capsule2])

    const res = await GET(createRequest(`Bearer ${CRON_SECRET}`))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ delivered: 2, failed: 0 })
    expect(sendDeliveryEmail).toHaveBeenCalledTimes(2)
    expect(prisma.capsule.update).toHaveBeenCalledTimes(2)
  })

  it('deve incrementar failed quando sendDeliveryEmail falha', async () => {
    const capsule = mockCapsule('capsule-1')
    vi.mocked(prisma.capsule.findMany).mockResolvedValue([capsule])
    sendDeliveryEmailMock.mockRejectedValue(new Error('Resend error'))

    const res = await GET(createRequest(`Bearer ${CRON_SECRET}`))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ delivered: 0, failed: 1 })
    expect(prisma.capsule.update).not.toHaveBeenCalled()
  })
})

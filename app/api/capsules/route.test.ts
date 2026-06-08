import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { Session } from 'next-auth'
import { mockAuth } from '@/lib/mock-auth'
import { addDays, differenceInDays, parseISO } from 'date-fns'

const { mockEmailsSend, sendConfirmationEmailMock } = vi.hoisted(() => ({
  mockEmailsSend: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendConfirmationEmailMock: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockEmailsSend },
  })),
}))

vi.mock('@/lib/email', () => ({
  sendConfirmationEmail: sendConfirmationEmailMock,
}))

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    track: {
      findUnique: vi.fn(),
    },
    capsule: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { sendConfirmationEmail } from '@/lib/email'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

const TRACK_ID = '550e8400-e29b-41d4-a716-446655440000'
const USER_ID = 'user-123'
const FIXED_NOW = new Date('2026-06-07T12:00:00.000Z')
const VALID_OPEN_AT = '2026-06-14'

const mockTrack = {
  id: TRACK_ID,
  musicbrainzId: 'mb-123',
  deezerId: null,
  title: 'Come Together',
  artistName: 'The Beatles',
  albumTitle: null,
  albumCoverUrl: null,
  durationSeconds: null,
  cachedAt: new Date('2024-01-01'),
}

const mockCapsule = {
  id: 'capsule-1',
  userId: USER_ID,
  trackId: TRACK_ID,
  message: 'Mensagem de teste',
  openAt: parseISO(VALID_OPEN_AT),
  openedAt: null,
  status: 'sealed',
  createdAt: FIXED_NOW,
  updatedAt: FIXED_NOW,
}

const mockCapsuleWithTrack = {
  ...mockCapsule,
  track: mockTrack,
}

function createGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/capsules')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new NextRequest(url)
}

function createPostRequest(body: object) {
  return new NextRequest('http://localhost/api/capsules', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    message: 'Mensagem de teste',
    trackId: TRACK_ID,
    openAt: VALID_OPEN_AT,
    ...overrides,
  }
}

describe('/api/capsules', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    vi.restoreAllMocks()
    sendConfirmationEmailMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })

  describe('GET', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockAuth().mockResolvedValue(null)

      const req = createGetRequest()
      const res = await GET(req)

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toEqual({ error: 'Não autorizado' })
      expect(prisma.capsule.findMany).not.toHaveBeenCalled()
      expect(prisma.capsule.count).not.toHaveBeenCalled()
    })

    it('deve retornar 401 se sessão não tiver user.id', async () => {
      mockAuth().mockResolvedValue({ user: {} } as Session)

      const req = createGetRequest()
      const res = await GET(req)

      expect(res.status).toBe(401)
      expect(prisma.capsule.findMany).not.toHaveBeenCalled()
    })

    it('deve retornar 400 se status for inválido', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const req = createGetRequest({ status: 'invalid' })
      const res = await GET(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Parâmetro inválido')
      expect(data.details.fieldErrors.status).toBeDefined()
    })

    it('deve retornar 400 se page for inválida', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const req = createGetRequest({ page: '0' })
      const res = await GET(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Parâmetro inválido')
      expect(data.details.fieldErrors.page).toBeDefined()
    })

    it('deve retornar 400 se limit exceder o máximo', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const req = createGetRequest({ limit: '51' })
      const res = await GET(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Parâmetro inválido')
      expect(data.details.fieldErrors.limit).toBeDefined()
    })

    it('deve retornar 200 com cápsulas e paginação padrão', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.capsule.findMany).mockResolvedValue([mockCapsuleWithTrack])
      vi.mocked(prisma.capsule.count).mockResolvedValue(1)

      const req = createGetRequest()
      const res = await GET(req)

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.capsules).toHaveLength(1)
      expect(data.capsules[0].daysUntilOpen).toBe(
        differenceInDays(mockCapsule.openAt, FIXED_NOW)
      )
      expect(data.capsules[0].track).toEqual({
        ...mockTrack,
        cachedAt: mockTrack.cachedAt.toISOString(),
      })
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      })

      expect(prisma.capsule.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        include: { track: true },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      })
      expect(prisma.capsule.count).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      })
    })

    it('deve filtrar por status sealed', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.capsule.findMany).mockResolvedValue([])
      vi.mocked(prisma.capsule.count).mockResolvedValue(0)

      const req = createGetRequest({ status: 'sealed' })
      const res = await GET(req)

      expect(res.status).toBe(200)
      expect(prisma.capsule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID, status: 'sealed' },
        })
      )
      expect(prisma.capsule.count).toHaveBeenCalledWith({
        where: { userId: USER_ID, status: 'sealed' },
      })
    })

    it('deve aplicar paginação customizada', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.capsule.findMany).mockResolvedValue([])
      vi.mocked(prisma.capsule.count).mockResolvedValue(45)

      const req = createGetRequest({ page: '2', limit: '10' })
      const res = await GET(req)

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 45,
        totalPages: 5,
      })
      expect(prisma.capsule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      )
    })

    it('deve retornar daysUntilOpen null para cápsulas entregues', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.capsule.findMany).mockResolvedValue([
        { ...mockCapsuleWithTrack, status: 'delivered' },
      ])
      vi.mocked(prisma.capsule.count).mockResolvedValue(1)

      const req = createGetRequest({ status: 'delivered' })
      const res = await GET(req)

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.capsules[0].daysUntilOpen).toBeNull()
    })
  })

  describe('POST', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockAuth().mockResolvedValue(null)

      const req = createPostRequest(validPayload())
      const res = await POST(req)

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toEqual({ error: 'Não autorizado' })
      expect(prisma.track.findUnique).not.toHaveBeenCalled()
      expect(prisma.capsule.create).not.toHaveBeenCalled()
      expect(sendConfirmationEmail).not.toHaveBeenCalled()
    })

    it('deve retornar 401 se sessão não tiver user.id', async () => {
      mockAuth().mockResolvedValue({ user: {} } as Session)

      const req = createPostRequest(validPayload())
      const res = await POST(req)

      expect(res.status).toBe(401)
      expect(prisma.capsule.create).not.toHaveBeenCalled()
      expect(sendConfirmationEmail).not.toHaveBeenCalled()
    })

    it('deve retornar 400 se message estiver ausente', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const req = createPostRequest(validPayload({ message: undefined }))
      const res = await POST(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Parâmetro inválido')
      expect(data.details.fieldErrors.message).toBeDefined()
      expect(prisma.capsule.create).not.toHaveBeenCalled()
      expect(sendConfirmationEmail).not.toHaveBeenCalled()
    })

    it('deve retornar 400 se message exceder 500 caracteres', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const req = createPostRequest(validPayload({ message: 'a'.repeat(501) }))
      const res = await POST(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Parâmetro inválido')
      expect(data.details.fieldErrors.message).toBeDefined()
    })

    it('deve retornar 400 se trackId não for UUID', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const req = createPostRequest(validPayload({ trackId: 'invalid-id' }))
      const res = await POST(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Parâmetro inválido')
      expect(data.details.fieldErrors.trackId).toBeDefined()
    })

    it('deve retornar 400 se openAt tiver formato inválido', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const req = createPostRequest(validPayload({ openAt: '07/06/2026' }))
      const res = await POST(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toBe('Parâmetro inválido')
      expect(data.details.fieldErrors.openAt).toBeDefined()
    })

    it('deve retornar 400 se openAt for menos de 7 dias no futuro', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)

      const tooSoon = addDays(FIXED_NOW, 6).toISOString().slice(0, 10)
      const req = createPostRequest(validPayload({ openAt: tooSoon }))
      const res = await POST(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data).toEqual({
        error: 'A data deve ser pelo menos 7 dias no futuro',
        code: 'DATE_TOO_SOON',
      })
      expect(prisma.track.findUnique).not.toHaveBeenCalled()
    })

    it('deve retornar 404 se faixa não existir', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.track.findUnique).mockResolvedValue(null)

      const req = createPostRequest(validPayload())
      const res = await POST(req)

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toEqual({ error: 'Faixa não encontrada', code: 'TRACK_NOT_FOUND' })
      expect(prisma.capsule.create).not.toHaveBeenCalled()
      expect(sendConfirmationEmail).not.toHaveBeenCalled()
    })

    it('deve retornar 201 e criar cápsula com payload válido', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.track.findUnique).mockResolvedValue(mockTrack)
      vi.mocked(prisma.capsule.create).mockResolvedValue(mockCapsule)

      const payload = validPayload()
      const req = createPostRequest(payload)
      const res = await POST(req)

      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.capsule).toEqual({
        ...mockCapsule,
        openAt: mockCapsule.openAt.toISOString(),
        createdAt: mockCapsule.createdAt.toISOString(),
        updatedAt: mockCapsule.updatedAt.toISOString(),
      })

      expect(prisma.track.findUnique).toHaveBeenCalledWith({
        where: { id: TRACK_ID },
      })

      expect(prisma.capsule.create).toHaveBeenCalledWith({
        data: {
          userId: USER_ID,
          trackId: TRACK_ID,
          message: payload.message,
          openAt: parseISO(VALID_OPEN_AT),
          status: 'sealed',
        },
        include: { track: true, user: true },
      })
      expect(sendConfirmationEmail).toHaveBeenCalledWith(mockCapsule)
    })
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { differenceInDays, parseISO } from 'date-fns'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    capsule: {
      findUnique: vi.fn(),
    },
  },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { GET } from './route'

const CAPSULE_ID = 'capsule-1'
const TRACK_ID = '550e8400-e29b-41d4-a716-446655440000'
const USER_ID = 'user-123'
const OTHER_USER_ID = 'user-456'
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
  id: CAPSULE_ID,
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

function createGetRequest(capsuleId: string) {
  return new NextRequest(`http://localhost/api/capsules/${capsuleId}`)
}

function routeContext(capsuleId: string) {
  return { params: { id: capsuleId } }
}

describe('/api/capsules/[id]', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('GET', () => {
    it('deve retornar 401 se não autenticado', async () => {
      ;(auth as any).mockResolvedValue(null)

      const req = createGetRequest(CAPSULE_ID)
      const res = await GET(req, routeContext(CAPSULE_ID))

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toEqual({ error: 'Não autorizado' })
      expect(prisma.capsule.findUnique).not.toHaveBeenCalled()
    })

    it('deve retornar 401 se sessão não tiver user.id', async () => {
      ;(auth as any).mockResolvedValue({ user: {} })

      const req = createGetRequest(CAPSULE_ID)
      const res = await GET(req, routeContext(CAPSULE_ID))

      expect(res.status).toBe(401)
      expect(prisma.capsule.findUnique).not.toHaveBeenCalled()
    })

    it('deve retornar 404 se cápsula não existir', async () => {
      ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })
      ;(prisma.capsule.findUnique as any).mockResolvedValue(null)

      const req = createGetRequest(CAPSULE_ID)
      const res = await GET(req, routeContext(CAPSULE_ID))

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toEqual({ error: 'Cápsula não encontrada' })
      expect(prisma.capsule.findUnique).toHaveBeenCalledWith({
        where: { id: CAPSULE_ID },
        include: { track: true },
      })
    })

    it('deve retornar 403 se cápsula pertencer a outro usuário', async () => {
      ;(auth as any).mockResolvedValue({ user: { id: OTHER_USER_ID } })
      ;(prisma.capsule.findUnique as any).mockResolvedValue(mockCapsuleWithTrack)

      const req = createGetRequest(CAPSULE_ID)
      const res = await GET(req, routeContext(CAPSULE_ID))

      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data).toEqual({ error: 'Não autorizado para acessar esta cápsula' })
    })

    it('deve retornar 200 com cápsula sealed sem message e com daysUntilOpen', async () => {
      ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })
      ;(prisma.capsule.findUnique as any).mockResolvedValue(mockCapsuleWithTrack)

      const req = createGetRequest(CAPSULE_ID)
      const res = await GET(req, routeContext(CAPSULE_ID))

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.capsule.message).toBeUndefined()
      expect(data.capsule.daysUntilOpen).toBe(
        differenceInDays(mockCapsule.openAt, FIXED_NOW)
      )
      expect(data.capsule).toMatchObject({
        id: CAPSULE_ID,
        userId: USER_ID,
        trackId: TRACK_ID,
        status: 'sealed',
        track: {
          ...mockTrack,
          cachedAt: mockTrack.cachedAt.toISOString(),
        },
      })
    })

    it('deve retornar 200 com cápsula delivered incluindo message', async () => {
      const deliveredCapsule = {
        ...mockCapsuleWithTrack,
        status: 'delivered',
        openedAt: FIXED_NOW,
      }
      ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })
      ;(prisma.capsule.findUnique as any).mockResolvedValue(deliveredCapsule)

      const req = createGetRequest(CAPSULE_ID)
      const res = await GET(req, routeContext(CAPSULE_ID))

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.capsule.message).toBe('Mensagem de teste')
      expect(data.capsule.daysUntilOpen).toBeUndefined()
      expect(data.capsule.status).toBe('delivered')
    })
  })
})

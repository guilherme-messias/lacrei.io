import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { addDays, parseISO } from 'date-fns'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    track: {
      findUnique: vi.fn(),
    },
    capsule: {
      create: vi.fn(),
    },
  },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { POST } from './route'

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
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve retornar 401 se não autenticado', async () => {
    ;(auth as any).mockResolvedValue(null)

    const req = createPostRequest(validPayload())
    const res = await POST(req)

    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toEqual({ error: 'Não autorizado' })
    expect(prisma.track.findUnique).not.toHaveBeenCalled()
    expect(prisma.capsule.create).not.toHaveBeenCalled()
  })

  it('deve retornar 401 se sessão não tiver user.id', async () => {
    ;(auth as any).mockResolvedValue({ user: {} })

    const req = createPostRequest(validPayload())
    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(prisma.capsule.create).not.toHaveBeenCalled()
  })

  it('deve retornar 400 se message estiver ausente', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })

    const req = createPostRequest(validPayload({ message: undefined }))
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.message).toBeDefined()
    expect(prisma.capsule.create).not.toHaveBeenCalled()
  })

  it('deve retornar 400 se message exceder 500 caracteres', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })

    const req = createPostRequest(validPayload({ message: 'a'.repeat(501) }))
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.message).toBeDefined()
  })

  it('deve retornar 400 se trackId não for UUID', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })

    const req = createPostRequest(validPayload({ trackId: 'invalid-id' }))
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.trackId).toBeDefined()
  })

  it('deve retornar 400 se openAt tiver formato inválido', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })

    const req = createPostRequest(validPayload({ openAt: '07/06/2026' }))
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.openAt).toBeDefined()
  })

  it('deve retornar 400 se openAt for menos de 7 dias no futuro', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })

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
    ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })
    ;(prisma.track.findUnique as any).mockResolvedValue(null)

    const req = createPostRequest(validPayload())
    const res = await POST(req)

    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data).toEqual({ error: 'Faixa não encontrada', code: 'TRACK_NOT_FOUND' })
    expect(prisma.capsule.create).not.toHaveBeenCalled()
  })

  it('deve retornar 201 e criar cápsula com payload válido', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: USER_ID } })
    ;(prisma.track.findUnique as any).mockResolvedValue(mockTrack)
    ;(prisma.capsule.create as any).mockResolvedValue(mockCapsule)

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
    })
  })
})

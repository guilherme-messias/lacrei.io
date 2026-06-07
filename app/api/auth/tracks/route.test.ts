import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    track: {
      upsert: vi.fn(),
    },
  },
}))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { POST } from './route'

const mockTrack = {
  id: 'track-1',
  musicbrainzId: 'mb-123',
  deezerId: 'dz-456',
  title: 'Come Together',
  artistName: 'The Beatles',
  albumTitle: 'Abbey Road',
  albumCoverUrl: 'https://example.com/cover.jpg',
  durationSeconds: 259,
  cachedAt: new Date('2024-01-01'),
}

function createPostRequest(body: object) {
  return new NextRequest('http://localhost/api/auth/tracks', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/auth/tracks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('deve retornar 401 se não autenticado', async () => {
    ;(auth as any).mockResolvedValue(null)

    const req = createPostRequest({ title: 'Come Together', artistName: 'The Beatles' })
    const res = await POST(req)

    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toEqual({ error: 'Não autorizado' })
    expect(prisma.track.upsert).not.toHaveBeenCalled()
  })

  it('deve retornar 400 se title estiver ausente', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: '123' } })

    const req = createPostRequest({ artistName: 'The Beatles' })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.title).toBeDefined()
    expect(prisma.track.upsert).not.toHaveBeenCalled()
  })

  it('deve retornar 400 se artistName estiver ausente', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: '123' } })

    const req = createPostRequest({ title: 'Come Together' })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.artistName).toBeDefined()
    expect(prisma.track.upsert).not.toHaveBeenCalled()
  })

  it('deve retornar 400 se albumCoverUrl for inválida', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: '123' } })

    const req = createPostRequest({
      title: 'Come Together',
      artistName: 'The Beatles',
      albumCoverUrl: 'not-a-url',
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.albumCoverUrl).toBeDefined()
    expect(prisma.track.upsert).not.toHaveBeenCalled()
  })

  it('deve retornar 200 e fazer upsert da faixa com payload completo', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: '123' } })
    ;(prisma.track.upsert as any).mockResolvedValue(mockTrack)

    const payload = {
      musicbrainzId: 'mb-123',
      deezerId: 'dz-456',
      title: 'Come Together',
      artistName: 'The Beatles',
      albumTitle: 'Abbey Road',
      albumCoverUrl: 'https://example.com/cover.jpg',
      durationSeconds: 259,
    }

    const req = createPostRequest(payload)
    const res = await POST(req)

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.track).toEqual({
      ...mockTrack,
      cachedAt: mockTrack.cachedAt.toISOString(),
    })

    expect(prisma.track.upsert).toHaveBeenCalledWith({
      where: { musicbrainzId: 'mb-123' },
      update: {
        title: payload.title,
        artistName: payload.artistName,
        albumTitle: payload.albumTitle,
        albumCoverUrl: payload.albumCoverUrl,
        durationSeconds: payload.durationSeconds,
      },
      create: payload,
    })
  })

  it('deve retornar 200 com payload mínimo (title e artistName)', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: '123' } })
    ;(prisma.track.upsert as any).mockResolvedValue({
      ...mockTrack,
      musicbrainzId: null,
      deezerId: null,
      albumTitle: null,
      albumCoverUrl: null,
      durationSeconds: null,
    })

    const payload = { title: 'Come Together', artistName: 'The Beatles' }
    const req = createPostRequest(payload)
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(prisma.track.upsert).toHaveBeenCalledWith({
      where: { musicbrainzId: '' },
      update: {
        title: payload.title,
        artistName: payload.artistName,
        albumTitle: undefined,
        albumCoverUrl: undefined,
        durationSeconds: undefined,
      },
      create: {
        musicbrainzId: undefined,
        deezerId: undefined,
        title: payload.title,
        artistName: payload.artistName,
        albumTitle: undefined,
        albumCoverUrl: undefined,
        durationSeconds: undefined,
      },
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Session } from 'next-auth'
import { mockAuth } from '@/lib/mock-auth'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/deezer', () => ({
  searchDeezer: vi.fn(),
  getCoverFromDeezer: vi.fn(),
}))

import { getCoverFromDeezer, searchDeezer } from '@/lib/deezer'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('/api/auth/tracks/search', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('deve retornar 401 se não autenticado', async () => {
    mockAuth().mockResolvedValue(null)
    const req = new NextRequest(
      'http://localhost/api/auth/tracks/search?q=beatles'
    )
    const res = await GET(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toEqual({ error: 'Não autorizado' })
  })

  it('deve retornar 400 para query inválida', async () => {
    mockAuth().mockResolvedValue({ user: { id: '123' } } as Session)
    const req = new NextRequest('http://localhost/api/auth/tracks/search?q=a')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.q).toBeDefined()
  })

  it('deve retornar 200 e lista de faixas para query válida', async () => {
    mockAuth().mockResolvedValue({ user: { id: '123' } } as Session)
    vi.mocked(searchDeezer).mockResolvedValue([
      {
        musicbrainzId: null,
        deezerId: '1',
        title: 'Come Together',
        artistName: 'The Beatles',
        albumTitle: null,
        albumCoverUrl: 'https://example.com/cover.jpg',
        durationSeconds: 259,
      },
    ])
    vi.mocked(getCoverFromDeezer).mockResolvedValue({
      albumCoverUrl: 'https://example.com/cover.jpg',
      deezerId: '42',
    })

    const req = new NextRequest(
      'http://localhost/api/auth/tracks/search?q=beatles'
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.tracks).toBeInstanceOf(Array)

    if (data.tracks.length > 0) {
      const track = data.tracks[0]
      expect(track).toEqual({
        musicbrainzId: null,
        deezerId: '1',
        title: 'Come Together',
        albumTitle: null,
        artistName: 'The Beatles',
        albumCoverUrl: 'https://example.com/cover.jpg',
        durationSeconds: 259,
      })
    }
  })
})

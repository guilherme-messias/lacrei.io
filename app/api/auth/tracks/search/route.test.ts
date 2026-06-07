import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/musicbrainz', () => ({ searchMusicBrainz: vi.fn() }))
vi.mock('@/lib/deezer', () => ({ getCoverFromDeezer: vi.fn() }))

import { auth } from '@/auth'
import { searchMusicBrainz } from '@/lib/musicbrainz'
import { getCoverFromDeezer } from '@/lib/deezer'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('/api/auth/tracks/search', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('deve retornar 401 se não autenticado', async () => {
    ;(auth as any).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/auth/tracks/search?q=beatles')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toEqual({ error: 'Não autorizado' })
  })

  it('deve retornar 400 para query inválida', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: '123' } })
    const req = new NextRequest('http://localhost/api/auth/tracks/search?q=a')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Parâmetro inválido')
    expect(data.details.fieldErrors.q).toBeDefined()
  })

  it('deve retornar 200 e lista de faixas para query válida', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: '123' } })
    ;(searchMusicBrainz as any).mockResolvedValue([
      {
        id: '1',
        title: 'Come Together',
        'artist-credit': [{ name: 'The Beatles' }],
        releases: [],
      },
    ])
    ;(getCoverFromDeezer as any).mockResolvedValue({
      albumCoverUrl: 'https://example.com/cover.jpg',
      deezerId: '42',
    })

    const req = new NextRequest('http://localhost/api/auth/tracks/search?q=beatles')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.tracks).toBeInstanceOf(Array)

    if (data.tracks.length > 0) {
      const track = data.tracks[0]
      expect(track).toHaveProperty('title')
      expect(track).toHaveProperty('artist')
      expect(track).toHaveProperty('albumCoverUrl')
      expect(track).toHaveProperty('deezerId')
    }
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchMusicBrainz } from './musicbrainz'

describe('searchMusicBrainz', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.MUSICBRAINZ_USER_AGENT = 'Test/1.0 (test@example.com)'
  })

  it('retorna gravações quando fetch responde ok', async () => {
    const sample = [
      {
        id: '1',
        title: 'Test Track',
        duration: 200,
        'artist-credit': [
          { name: 'Artist', artist: { id: 'a1', name: 'Artist' } },
        ],
        releases: [{ id: 'r1', title: 'Rel', date: '2020-01-01' }],
      },
    ]

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ recordings: sample }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await searchMusicBrainz('some query')
    expect(res).toEqual(sample)
  })

  it('retorna [] quando a resposta não é ok', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', fetchMock)
    const res = await searchMusicBrainz('query')
    expect(res).toEqual([])
  })

  it('retorna [] para query vazia', async () => {
    const res = await searchMusicBrainz('   ')
    expect(res).toEqual([])
  })

  it('lança erro se MUSICBRAINZ_USER_AGENT não estiver definido', async () => {
    delete process.env.MUSICBRAINZ_USER_AGENT
    await expect(searchMusicBrainz('q')).rejects.toThrow(
      'MUSICBRAINZ_USER_AGENT não definido'
    )
  })
})

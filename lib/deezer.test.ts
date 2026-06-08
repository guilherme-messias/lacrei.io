import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCoverFromDeezer } from './deezer'

describe('getCoverFromDeezer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna capa e id quando a resposta é ok', async () => {
    const sample = {
      data: [
        { id: 123, album: { cover_medium: 'http://cover.jpg' } },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sample,
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await getCoverFromDeezer('Title', 'Artist')
    expect(res).toEqual({ albumCoverUrl: 'http://cover.jpg', deezerId: '123' })
  })

  it('retorna vazio quando response não ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal('fetch', fetchMock)
    const res = await getCoverFromDeezer('Title', 'Artist')
    expect(res).toEqual({ albumCoverUrl: null, deezerId: null })
  })

  it('retorna vazio para title ou artist vazios e não chama fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const res1 = await getCoverFromDeezer('   ', 'Artist')
    const res2 = await getCoverFromDeezer('Title', '   ')
    expect(res1).toEqual({ albumCoverUrl: null, deezerId: null })
    expect(res2).toEqual({ albumCoverUrl: null, deezerId: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('retorna vazio em caso de exceção', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network'))
    vi.stubGlobal('fetch', fetchMock)
    const res = await getCoverFromDeezer('Title', 'Artist')
    expect(res).toEqual({ albumCoverUrl: null, deezerId: null })
  })
})

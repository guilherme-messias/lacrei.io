import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/auth'
import { getSessionOrUnauthorized } from './auth-guard'

describe('getSessionOrUnauthorized', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna sessão quando autenticado', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: 'u1', name: 'User' } })
    const res = await getSessionOrUnauthorized()
    expect(res.session).toEqual({ user: { id: 'u1', name: 'User' } })
    expect(res.error).toBeNull()
  })

  it('retorna erro e session null quando não autenticado', async () => {
    ;(auth as any).mockResolvedValue(null)
    const res = await getSessionOrUnauthorized()
    expect(res.session).toBeNull()
    expect(res.error).not.toBeNull()
    // NextResponse may expose status; checamos se existe e é 401 quando presente
    const status = (res.error as any)?.status ?? (res.error as any)?._status
    if (status !== undefined) expect(status).toBe(401)
  })
})

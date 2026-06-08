import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Session } from 'next-auth'
import { NextResponse } from 'next/server'
import { mockAuth } from '@/lib/mock-auth'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

import { getSessionOrUnauthorized } from './auth-guard'

describe('getSessionOrUnauthorized', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna sessão quando autenticado', async () => {
    mockAuth().mockResolvedValue({ user: { id: 'u1', name: 'User' } } as Session)
    const res = await getSessionOrUnauthorized()
    expect(res.session).toEqual({ user: { id: 'u1', name: 'User' } })
    expect(res.error).toBeNull()
  })

  it('retorna erro e session null quando não autenticado', async () => {
    mockAuth().mockResolvedValue(null)
    const res = await getSessionOrUnauthorized()
    expect(res.session).toBeNull()
    expect(res.error).not.toBeNull()
    const status = res.error instanceof NextResponse ? res.error.status : undefined
    if (status !== undefined) expect(status).toBe(401)
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Session } from 'next-auth'
import { mockAuth } from '@/lib/mock-auth'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    capsule: {
      count: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { GET } from './route'

const USER_ID = 'user-123'

const mockUser = {
  name: 'João Silva',
  email: 'joao@example.com',
  image: 'https://example.com/avatar.jpg',
}

describe('/api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockAuth().mockResolvedValue(null)

      const res = await GET()

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toEqual({ error: 'Não autorizado' })
      expect(prisma.user.findUnique).not.toHaveBeenCalled()
      expect(prisma.capsule.count).not.toHaveBeenCalled()
    })

    it('deve retornar 401 se sessão não tiver user.id', async () => {
      mockAuth().mockResolvedValue({ user: {} } as Session)

      const res = await GET()

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data).toEqual({ error: 'Não autorizado' })
      expect(prisma.user.findUnique).not.toHaveBeenCalled()
      expect(prisma.capsule.count).not.toHaveBeenCalled()
    })

    it('deve retornar 404 se usuário não existir', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.capsule.count).mockResolvedValue(0)

      const res = await GET()

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toEqual({ error: 'Usuário não encontrado' })
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER_ID },
        select: { name: true, email: true, image: true },
      })
    })

    it('deve retornar 200 com perfil e estatísticas de cápsulas', async () => {
      mockAuth().mockResolvedValue({ user: { id: USER_ID } } as Session)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(prisma.capsule.count)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(4)

      const res = await GET()

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.user).toEqual({
        ...mockUser,
        stats: {
          totalCapsules: 10,
          sealedCapsules: 6,
          deliveredCapsules: 4,
        },
      })

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER_ID },
        select: { name: true, email: true, image: true },
      })
      expect(prisma.capsule.count).toHaveBeenCalledTimes(3)
      expect(prisma.capsule.count).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      })
      expect(prisma.capsule.count).toHaveBeenCalledWith({
        where: { userId: USER_ID, status: 'sealed' },
      })
      expect(prisma.capsule.count).toHaveBeenCalledWith({
        where: { userId: USER_ID, status: 'delivered' },
      })
    })
  })
})

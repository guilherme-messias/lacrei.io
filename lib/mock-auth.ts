import type { Mock } from 'vitest'
import type { Session } from 'next-auth'
import { auth } from '@/auth'

export const mockAuth = () => auth as unknown as Mock<() => Promise<Session | null>>

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function getSessionOrUnauthorized() {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Não autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    }
  }
  return { session, error: null }
}

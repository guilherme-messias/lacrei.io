import { headers } from 'next/headers'

type CapsuleResponse = {
  capsules: Array<{
    id: string
    status: 'sealed' | 'delivered'
    message: string
    openAt: string
    openedAt: string | null
    track: {
      title: string
      artistName: string
      albumCoverUrl: string | null
    }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchCapsules(): Promise<CapsuleResponse | null> {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl =
    process.env.NEXTAUTH_URL ?? (host ? `${protocol}://${host}` : '')

  if (!baseUrl) return null

  const res = await fetch(`${baseUrl}/api/capsules`, {
    method: 'GET',
    headers: {
      cookie: headersList.get('cookie') ?? '',
    },
  })

  if (!res.ok) return null

  return res.json() as Promise<CapsuleResponse>
}

export default async function Page() {
  const data = await fetchCapsules()

  if (!data?.capsules) return null

  const sealedCapsules = data.capsules.filter(
    capsule => capsule.status === 'sealed'
  )
  const deliveredCapsules = data.capsules.filter(
    capsule => capsule.status === 'delivered'
  )

  return <div>Diário</div>
}

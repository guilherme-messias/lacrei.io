import { CapsuleCard } from '@/components/CapsuleCard'
import Link from 'next/link'
import { headers } from 'next/headers'

type CapsuleResponse = {
  capsules: Array<{
    id: string
    userId: string
    trackId: string
    message: string
    openAt: string
    openedAt: string | null
    status: 'sealed' | 'delivered'
    createdAt: string
    updatedAt: string
    daysUntilOpen: number | null
    track: {
      id: string
      musicbrainzId: string | null
      deezerId: string | null
      title: string
      artistName: string
      albumTitle: string | null
      albumCoverUrl: string | null
      durationSeconds: number | null
      cachedAt: string
    }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type CapsuleItem = CapsuleResponse['capsules'][number]

function toCapsuleCardProps(capsule: CapsuleItem) {
  return {
    ...capsule,
    openAt: new Date(capsule.openAt),
    openedAt: capsule.openedAt ? new Date(capsule.openedAt) : null,
    createdAt: new Date(capsule.createdAt),
    updatedAt: new Date(capsule.updatedAt),
    track: {
      ...capsule.track,
      cachedAt: new Date(capsule.track.cachedAt),
    },
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

  const sealed = data.capsules.filter(capsule => capsule.status === 'sealed')
  const delivered = data.capsules.filter(
    capsule => capsule.status === 'delivered'
  )

  if (sealed.length === 0 && delivered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-10 py-16 text-center">
        <p className="max-w-lg text-base font-normal leading-relaxed text-purple-50/70">
          Seu diário está em branco. Que música define esse momento?
        </p>
        <Link
          href="/nova"
          className="w-full rounded-xl bg-teal-400 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-800 sm:w-auto"
        >
          Criar minha primeira cápsula
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-16">
      {sealed.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-medium text-gray-50">Lacradas</h2>
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            data-testid="sealed-capsules"
          >
            {sealed.map(capsule => (
              <CapsuleCard
                key={capsule.id}
                capsule={toCapsuleCardProps(capsule)}
              />
            ))}
          </div>
        </section>
      )}

      {delivered.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-medium text-gray-50">Abertas</h2>
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            data-testid="delivered-capsules"
          >
            {delivered.map(capsule => (
              <CapsuleCard
                key={capsule.id}
                capsule={toCapsuleCardProps(capsule)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

import { DeliveredCapsuleDetail } from '@/components/DeliveredCapsuleDetail'
import { SealedCapsuleDetail } from '@/components/SealedCapsuleDetail'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

type CapsuleResponse = {
  capsule: {
    id: string
    message: string
    openAt: string
    openedAt: string | null
    status: 'sealed' | 'delivered'
    createdAt: string
    updatedAt: string
    track: {
      title: string
      artistName: string
      albumCoverUrl: string | null
      cachedAt: string
    }
  }
}

function toCapsuleDetailProps(capsule: CapsuleResponse['capsule']) {
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

async function fetchCapsule(id: string): Promise<CapsuleResponse | null> {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl =
    process.env.NEXTAUTH_URL ?? (host ? `${protocol}://${host}` : '')

  if (!baseUrl) return null

  const res = await fetch(`${baseUrl}/api/capsules/${id}`, {
    headers: {
      cookie: headersList.get('cookie') ?? '',
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  return res.json()
}

export default async function Page({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params

  if (!id) {
    redirect('/nova')
  }

  const data = await fetchCapsule(id)

  if (!data?.capsule) {
    redirect('/nova')
  }

  const capsule = toCapsuleDetailProps(data.capsule)

  if (capsule.status === 'sealed') {
    return <SealedCapsuleDetail capsule={capsule} />
  }

  return <DeliveredCapsuleDetail capsule={capsule} />
}

import AnimatedLockIcon from '@/components/AnimatedLockIcon'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type CapsuleResponse = {
  capsule: {
    message: string
    openAt: string
    track: {
      title: string
      artistName: string
      albumCoverUrl: string | null
    }
  }
}

function truncateMessage(message: string, maxLength = 100) {
  if (message.length <= maxLength) return message
  return `${message.slice(0, maxLength)}...`
}

async function fetchCapsule(id: string): Promise<CapsuleResponse | null> {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = process.env.NEXTAUTH_URL ?? (host ? `${protocol}://${host}` : '')

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
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) {
    redirect('/nova')
  }

  const data = await fetchCapsule(id)

  if (!data?.capsule) {
    redirect('/nova')
  }

  const { capsule } = data
  const { track } = capsule
  const truncatedMessage = truncateMessage(capsule.message)
  const formattedOpenAt = format(parseISO(capsule.openAt), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 py-4 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-light tracking-tight text-gray-50 sm:text-4xl">
          Sua cápsula está lacrada.
        </h1>
        <p className="text-base font-normal leading-relaxed text-purple-50/70">
          Guardamos tudo. Agora é só esperar.
        </p>
      </div>

      <article className="w-full rounded-2xl border border-purple-400/20 bg-purple-800/40 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-48 w-48 overflow-hidden rounded-xl">
            {track.albumCoverUrl ? (
              <Image
                src={track.albumCoverUrl}
                alt={track.title}
                width={192}
                height={192}
                className="h-full w-full scale-110 object-cover blur-md"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-purple-900/60">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-10 w-10 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-purple-900/60">
              <AnimatedLockIcon />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-gray-50">{track.title}</p>
            <p className="text-sm text-purple-50/70">{track.artistName}</p>
          </div>

          <blockquote className="font-display text-xl font-light leading-loose text-gray-50">
            &ldquo;{truncatedMessage}&rdquo;
          </blockquote>

          <p className="text-sm text-gray-400">Abre em {formattedOpenAt}</p>
        </div>
      </article>

      <p className="text-base font-normal leading-relaxed text-purple-50/70">
        Você receberá uma confirmação no seu e-mail em instantes.
      </p>

      <div className="flex w-full flex-col items-center gap-4">
        <Link
          href="/diario"
          className="w-full rounded-xl bg-teal-400 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-800 sm:w-auto"
        >
          Ver meu diário
        </Link>

        <Link
          href="/nova"
          className="text-base font-medium text-purple-400 transition-colors duration-200 hover:text-purple-50"
        >
          Criar outra cápsula
        </Link>
      </div>
    </div>
  )
}

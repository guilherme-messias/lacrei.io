import AnimatedLockIcon from '@/components/AnimatedLockIcon'
import { CountdownTimer } from '@/components/CountdownTimer'
import { DeleteCapsuleButton } from '@/components/DeleteCapsuleButton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'

export type CapsuleDetailProps = {
  id: string
  message: string
  openAt: Date
  openedAt: Date | null
  createdAt: Date
  updatedAt: Date
  track: {
    title: string
    artistName: string
    albumCoverUrl: string | null
    cachedAt: Date
  }
}

function MusicPlaceholderIcon() {
  return (
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
  )
}

export function SealedCapsuleDetail({
  capsule,
}: {
  capsule: CapsuleDetailProps
}) {
  const { track } = capsule
  const formattedOpenAt = format(capsule.openAt, "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-4 py-12 sm:px-6">
      <article className="w-full rounded-2xl border border-purple-400/20 bg-purple-800/40 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center">
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
                <MusicPlaceholderIcon />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-purple-900/65">
              <AnimatedLockIcon />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-gray-50">{track.title}</p>
            <p className="text-sm text-purple-50/70">{track.artistName}</p>
          </div>

          <CountdownTimer openAt={capsule.openAt} />

          <p className="text-base font-normal leading-relaxed text-purple-50/70">
            A sua mensagem está guardada até {formattedOpenAt}
          </p>
        </div>
      </article>

      <DeleteCapsuleButton capsuleId={capsule.id} />
    </div>
  )
}

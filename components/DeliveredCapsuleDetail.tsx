import type { CapsuleDetailProps } from '@/components/SealedCapsuleDetail'
import { differenceInDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
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

function getTrackExternalUrl(track: {
  title: string
  artistName: string
}): string {
  const query = encodeURIComponent(`${track.title} ${track.artistName}`)
  return `https://www.youtube.com/results?search_query=${query}`
}

function formatWrittenDate(date: Date): string {
  return format(date, 'd MMM yyyy', { locale: ptBR }).replace(/\./g, '')
}

export function DeliveredCapsuleDetail({
  capsule,
}: {
  capsule: CapsuleDetailProps
}) {
  const { track } = capsule
  const externalUrl = getTrackExternalUrl(track)
  const diasDepois = differenceInDays(capsule.openedAt!, capsule.createdAt)

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
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-purple-800/40">
                <MusicPlaceholderIcon />
              </div>
            )}

            <span className="absolute left-3 top-3 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
              Aberta
            </span>
          </div>

          <blockquote className="font-display text-2xl font-light leading-loose text-gray-50">
            &ldquo;{capsule.message}&rdquo;
          </blockquote>

          <p className="text-sm text-gray-400">
            Você escreveu isso em {formatWrittenDate(capsule.createdAt)}
          </p>

          <p className="text-sm text-purple-50/70">
            Você abriu {diasDepois}{' '}
            {diasDepois === 1 ? 'dia' : 'dias'} depois
          </p>

          <div className="flex w-full items-start justify-between gap-3">
            <div className="min-w-0 flex flex-col gap-1 text-left">
              <p className="text-base font-medium text-gray-50">{track.title}</p>
              <p className="text-sm text-gray-400">{track.artistName}</p>
            </div>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ouvir ${track.title} em outra plataforma`}
              className="shrink-0 p-1 text-gray-400 transition-colors duration-200 hover:text-purple-400"
            >
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}

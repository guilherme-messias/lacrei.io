import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Capsule, Track } from '@/app/generated/prisma/client'
import { CountdownTimer } from './CountdownTimer'

type CapsuleWithTrack = Capsule & { track: Track }

interface CapsuleCardProps {
  capsule: CapsuleWithTrack
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6 text-purple-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  )
}

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

function getTrackExternalUrl(track: Track): string {
  const query = encodeURIComponent(`${track.title} ${track.artistName}`)
  return `https://www.youtube.com/results?search_query=${query}`
}

function formatWrittenDate(date: Date): string {
  return format(date, 'd MMM yyyy', { locale: ptBR }).replace(/\./g, '')
}

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  const cover = capsule.track.albumCoverUrl
  const isSealed = capsule.status === 'sealed'
  const externalUrl = getTrackExternalUrl(capsule.track)

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-purple-800 bg-purple-900 transition-colors duration-200 hover:border-purple-400/50">
      <Link
        href={`/diario/${capsule.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={
          isSealed
            ? `Cápsula lacrada: ${capsule.track.title}`
            : `Cápsula aberta: ${capsule.track.title}`
        }
      />

      <div className="relative z-1 flex flex-col pointer-events-none">
        <div className="relative aspect-square w-full overflow-hidden">
          {cover ? (
            <Image
              src={cover}
              alt={isSealed ? '' : capsule.track.title}
              fill
              className={`object-cover ${isSealed ? 'scale-110 blur-md' : ''}`}
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-purple-800/40">
              <MusicPlaceholderIcon />
            </div>
          )}

          {isSealed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-purple-900/65">
              <LockIcon />
              <span className="text-xs tracking-wide text-purple-400">
                Lacrada
              </span>
            </div>
          ) : (
            <span className="absolute left-3 top-3 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
              Aberta
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 p-6">
          {isSealed ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium text-gray-50">
                  {capsule.track.title}
                </p>
                <p className="text-sm text-gray-400">
                  {capsule.track.artistName}
                </p>
              </div>
              <CountdownTimer openAt={capsule.openAt} />
            </>
          ) : (
            <>
              <blockquote className="font-display text-[1.05rem] font-light leading-[1.8] text-purple-50">
                &ldquo;{capsule.message}&rdquo;
              </blockquote>
              <p className="text-sm text-gray-400">
                Você escreveu isso em {formatWrittenDate(capsule.createdAt)}
              </p>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex flex-col gap-1">
                  <p className="text-base font-medium text-gray-50">
                    {capsule.track.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    {capsule.track.artistName}
                  </p>
                </div>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ouvir ${capsule.track.title} em outra plataforma`}
                  className="pointer-events-auto shrink-0 p-1 text-gray-400 transition-colors duration-200 hover:text-purple-400"
                >
                  <ExternalLinkIcon />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

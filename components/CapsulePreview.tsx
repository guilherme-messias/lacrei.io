import type { SearchTrack } from '@/lib/tracks'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CapsulePreviewProps {
  message: string
  track: SearchTrack | null
  openAt: string
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-8 w-8 text-white"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  )
}

export default function CapsulePreview({
  message,
  track,
  openAt,
}: CapsulePreviewProps) {
  const formattedDate = openAt
    ? format(parseISO(openAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null

  return (
    <aside
      aria-label="Prévia da cápsula"
      className="rounded-2xl border border-purple-400/20 bg-purple-800/40 p-6 shadow-sm sm:p-8"
    >
      <p className="mb-6 text-sm font-medium uppercase tracking-wide text-purple-50/60">
        Prévia
      </p>

      <div className="flex flex-col items-center gap-6">
        <div className="relative h-48 w-48 overflow-hidden rounded-xl">
          {track?.albumCoverUrl ? (
            <Image
              src={track.albumCoverUrl}
              alt={track.title}
              width={192}
              height={192}
              className="h-full w-full object-cover blur-md scale-110"
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
            <LockIcon />
          </div>
        </div>

        {track ? (
          <div className="text-center">
            <p className="text-base font-medium text-gray-50">{track.title}</p>
            <p className="text-sm text-purple-50/70">{track.artistName}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Escolha uma música</p>
        )}

        <blockquote
          className={`text-center font-display text-xl font-light leading-loose ${
            message ? 'text-gray-50' : 'text-gray-400'
          }`}
        >
          {message ? `“${message}”` : 'Sua frase aqui'}
        </blockquote>

        <p className="text-sm text-gray-400">
          {formattedDate ? `Abre em ${formattedDate}` : 'Escolha quando abrir'}
        </p>
      </div>
    </aside>
  )
}

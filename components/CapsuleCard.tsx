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

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  const cover = capsule.track.albumCoverUrl
  const isSealed = capsule.status === 'sealed'

  return (
    <Link href={`/diario/${capsule.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
        {cover ? (
          <Image
            src={cover}
            alt={capsule.track.title}
            width={100}
            height={100}
            style={isSealed ? { filter: 'blur(8px)', scale: '1.1' } : {}}
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        )}

        {isSealed && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            🔒
          </div>
        )}

        {!isSealed && (
          <p className="text-lg font-bold">&ldquo;{capsule.message}&rdquo;</p>
        )}
        <p className="text-lg font-bold">{capsule.track.title}</p>
        <p className="text-sm text-gray-500">{capsule.track.artistName}</p>

        {isSealed ? (
          <CountdownTimer openAt={capsule.openAt} />
        ) : (
          <p>
            Criado em{' '}
            {format(capsule.createdAt, "d 'de' MMM yyyy", { locale: ptBR })}
          </p>
        )}
      </div>
    </Link>
  )
}
